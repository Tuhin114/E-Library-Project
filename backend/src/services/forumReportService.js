import ForumThread from "../models/ForumThread.js";
import ForumReply from "../models/ForumReply.js";
import ForumReport from "../models/ForumReport.js";
import { ApiError } from "../utils/ApiError.js";
import { REPORT_TARGET_TYPES, REPORT_STATUS } from "../constants/reportReasons.js";

const TARGET_MODELS = {
  [REPORT_TARGET_TYPES.THREAD]: ForumThread,
  [REPORT_TARGET_TYPES.REPLY]: ForumReply,
};

export const createReport = async (targetType, targetId, userId, { reason, details }) => {
  const TargetModel = TARGET_MODELS[targetType];
  const exists = await TargetModel.exists({ _id: targetId });
  if (!exists) throw new ApiError(404, "The content you're reporting no longer exists");

  try {
    return await ForumReport.create({
      targetType,
      targetId,
      reason,
      details,
      reportedBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "You have already reported this");
    }
    throw error;
  }
};

// Reports are polymorphic (targetType decides ForumThread vs
// ForumReply), so populate() can't resolve targetId directly — batch
// one query per target type instead of populating per-report.
export const listOpenReports = async () => {
  const reports = await ForumReport.find({ status: REPORT_STATUS.OPEN })
    .sort({ createdAt: -1 })
    .populate({ path: "reportedBy", select: "name" })
    .lean();

  const threadIds = reports
    .filter((report) => report.targetType === REPORT_TARGET_TYPES.THREAD)
    .map((report) => report.targetId);
  const replyIds = reports
    .filter((report) => report.targetType === REPORT_TARGET_TYPES.REPLY)
    .map((report) => report.targetId);

  const [threads, replies] = await Promise.all([
    ForumThread.find({ _id: { $in: threadIds } }, { title: 1 }).lean(),
    ForumReply.find({ _id: { $in: replyIds } }, { message: 1, thread: 1 }).lean(),
  ]);

  const threadPreviewById = new Map(threads.map((thread) => [thread._id.toString(), thread]));
  const replyPreviewById = new Map(replies.map((reply) => [reply._id.toString(), reply]));

  return reports.map((report) => {
    const key = report.targetId.toString();
    const preview =
      report.targetType === REPORT_TARGET_TYPES.THREAD
        ? threadPreviewById.get(key)
        : replyPreviewById.get(key);

    return {
      ...report,
      target: preview
        ? report.targetType === REPORT_TARGET_TYPES.THREAD
          ? { title: preview.title, threadId: preview._id }
          : { message: preview.message, threadId: preview.thread }
        : null, // target was deleted after the report was filed
    };
  });
};

export const resolveReport = async (reportId) => {
  const report = await ForumReport.findById(reportId);
  if (!report) throw new ApiError(404, "Report not found");

  report.status = REPORT_STATUS.RESOLVED;
  report.resolvedAt = new Date();
  await report.save();

  return report;
};
