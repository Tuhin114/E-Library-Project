import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import CatalogAnalyticsSection from "@/components/analytics/sections/CatalogAnalyticsSection";

const CatalogAnalytics = () => {
  const [totalPublished, setTotalPublished] = useState(null);

  return (
    <PageContainer>
      <PageHeader
        title="Catalog Analytics"
        description={
          totalPublished != null
            ? `What's getting read, loved, and rated across ${totalPublished} published books.`
            : "What's getting read, loved, and rated across your published catalog."
        }
      />

      <CatalogAnalyticsSection onLoaded={setTotalPublished} />
    </PageContainer>
  );
};

export default CatalogAnalytics;
