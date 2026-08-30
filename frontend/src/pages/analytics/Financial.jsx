import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import FinancialAnalyticsSection from "@/components/analytics/sections/FinancialAnalyticsSection";

const Financial = () => {
  return (
    <PageContainer>
      <FinancialAnalyticsSection
        renderRangeControl={(rangeControl) => (
          <PageHeader
            title="Financial Analytics"
            description="Fee revenue, collection rate, and who owes what."
            actions={rangeControl}
          />
        )}
      />
    </PageContainer>
  );
};

export default Financial;
