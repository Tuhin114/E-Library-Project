import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import AutomationAnalyticsSection from "@/components/analytics/sections/AutomationAnalyticsSection";

const Automation = () => {
  return (
    <PageContainer>
      <AutomationAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Automation & Ops Analytics"
            description="Auto-approval engine performance, waitlist flow, and notification delivery."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default Automation;
