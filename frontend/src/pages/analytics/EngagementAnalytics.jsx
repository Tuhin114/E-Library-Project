import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EngagementAnalyticsSection from "@/components/analytics/sections/EngagementAnalyticsSection";

const EngagementAnalytics = () => {
  return (
    <PageContainer>
      <EngagementAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Engagement Analytics"
            description="Signups, activity, and community contribution over time."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default EngagementAnalytics;
