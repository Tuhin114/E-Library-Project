import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import ModerationAnalyticsSection from "@/components/analytics/sections/ModerationAnalyticsSection";

const ModerationAnalytics = () => {
  return (
    <PageContainer>
      <ModerationAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Moderation Analytics"
            description="How reports are trending, and how quickly the queue gets cleared."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default ModerationAnalytics;
