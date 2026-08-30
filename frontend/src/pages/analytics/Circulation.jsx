import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import CirculationAnalyticsSection from "@/components/analytics/sections/CirculationAnalyticsSection";

const Circulation = () => {
  return (
    <PageContainer>
      <CirculationAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Circulation Analytics"
            description="Request funnel, loan health, and inventory utilization at a glance."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default Circulation;
