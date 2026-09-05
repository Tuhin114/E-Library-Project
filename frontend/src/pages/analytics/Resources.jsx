import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import ResourceAnalyticsSection from "@/components/analytics/sections/ResourceAnalyticsSection";

const Resources = () => {
  return (
    <PageContainer>
      <ResourceAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Resource Analytics"
            description="Uploads, contributors, and saved-list adoption for e-journals, research papers, and notes."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default Resources;
