import Loan from "../models/Loan.js";
import Notification from "../models/Notification.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPES,
} from "../constants/notificationTypes.js";
import * as notificationService from "../services/notificationService.js";

// How many days before dueDate a reminder fires. A loan due "in 2
// days" is the plan's own example — kept as a plain constant here
// rather than a LibrarySettings field, same call M2/M3's own
// constants make for values not yet worth librarian-configurability.
const DUE_SOON_WINDOW_DAYS = 2;

/**
 * Runs once a day. Finds every active loan due within the reminder
 * window and notifies its student — but only once per loan, checked
 * via a lookup against existing Notifications rather than a boolean
 * flag on Loan itself (keeps this job the only place that needs to
 * know about "have we already reminded for this"; Loan doesn't grow a
 * field whose only consumer is this job).
 */
export const runLoanDueReminderSweep = async () => {
  const now = new Date();
  const windowEnd = new Date(
    now.getTime() + DUE_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const dueSoonLoans = await Loan.find({
    status: LOAN_STATUS.ACTIVE,
    dueDate: { $gte: now, $lte: windowEnd },
  })
    .populate({ path: "student", select: "name email notificationPreferences" })
    .populate({ path: "book", select: "title" })
    .lean();

  if (dueSoonLoans.length === 0) return { notified: 0 };

  const alreadyNotifiedLoanIds = await Notification.find({
    type: NOTIFICATION_TYPES.LOAN_DUE_SOON,
    "relatedEntity.id": { $in: dueSoonLoans.map((loan) => loan._id) },
  }).distinct("relatedEntity.id");
  const alreadyNotified = new Set(alreadyNotifiedLoanIds.map(String));

  const pending = dueSoonLoans.filter(
    (loan) => !alreadyNotified.has(loan._id.toString()),
  );

  await Promise.all(
    pending.map((loan) =>
      notificationService.notify({
        user: loan.student,
        category: NOTIFICATION_CATEGORIES.CIRCULATION,
        type: NOTIFICATION_TYPES.LOAN_DUE_SOON,
        title: "A loan is due soon",
        message: `"${loan.book.title}" is due back on ${new Date(loan.dueDate).toLocaleDateString()}.`,
        link: "/me/loans",
        relatedEntity: { kind: "Loan", id: loan._id },
      }),
    ),
  );

  return { notified: pending.length };
};
