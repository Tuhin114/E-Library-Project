import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CatalogAnalyticsSection from "@/components/analytics/sections/CatalogAnalyticsSection";
import EngagementAnalyticsSection from "@/components/analytics/sections/EngagementAnalyticsSection";
import ModerationAnalyticsSection from "@/components/analytics/sections/ModerationAnalyticsSection";
import CirculationAnalyticsSection from "@/components/analytics/sections/CirculationAnalyticsSection";
import FinancialAnalyticsSection from "@/components/analytics/sections/FinancialAnalyticsSection";
import AutomationAnalyticsSection from "@/components/analytics/sections/AutomationAnalyticsSection";

const PRIMARY_TABS = [
  { value: "catalog", label: "Catalog" },
  { value: "engagement", label: "Engagement" },
  { value: "moderation", label: "Moderation" },
  { value: "circulation", label: "Circulation" },
  { value: "financial", label: "Financial" },
  { value: "automation", label: "Automation" },
];

const CATALOG_VIEWS = [
  { value: "top-books", label: "Top Books" },
  { value: "distribution", label: "Catalog Mix" },
  { value: "dead-stock", label: "Dead Stock" },
];

const AnalyticsDashboard = () => {
  const [totalPublished, setTotalPublished] = useState(null);
  const [activeCategory, setActiveCategory] = useState("catalog");
  const [catalogView, setCatalogView] = useState("top-books");
  const [deadStockCount, setDeadStockCount] = useState(null);

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description={
          totalPublished != null
            ? `Catalog, engagement, and moderation activity across ${totalPublished} published books.`
            : "Catalog, engagement, and moderation activity in one place."
        }
      />

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            {PRIMARY_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategory === "catalog" && (
            <>
              <div
                className="hidden h-6 w-px bg-border sm:block"
                aria-hidden="true"
              />

              <div className="flex items-center gap-1 border-b border-border">
                {CATALOG_VIEWS.map((view) => {
                  const isActive = catalogView === view.value;

                  return (
                    <button
                      key={view.value}
                      type="button"
                      onClick={() => setCatalogView(view.value)}
                      className={[
                        "relative px-3 py-2 text-sm font-semibold font-display transition-colors",
                        "text-muted-foreground hover:text-foreground",
                        "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity",
                        isActive
                          ? "text-foreground after:opacity-100"
                          : "after:opacity-0",
                      ].join(" ")}
                    >
                      {view.label}
                      {view.value === "dead-stock" && deadStockCount != null ? (
                        <span className="ml-1 text-muted-foreground">
                          ({deadStockCount})
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <TabsContent value="catalog">
          <CatalogAnalyticsSection
            onLoaded={setTotalPublished}
            onDeadStockCount={setDeadStockCount}
            activeTab={catalogView}
            onTabChange={setCatalogView}
            hideTabs
          />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementAnalyticsSection
            renderRangeControl={(rangeControl) => (
              <div className="mb-4 flex justify-end">{rangeControl}</div>
            )}
          />
        </TabsContent>

        <TabsContent value="moderation">
          <ModerationAnalyticsSection
            renderRangeControl={(rangeControl) => (
              <div className="mb-4 flex justify-end">{rangeControl}</div>
            )}
          />
        </TabsContent>

        <TabsContent value="circulation">
          <CirculationAnalyticsSection
            renderRangeControl={(rangeControl) => (
              <div className="mb-4 flex justify-end">{rangeControl}</div>
            )}
          />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialAnalyticsSection
            renderRangeControl={(rangeControl) => (
              <div className="mb-4 flex justify-end">{rangeControl}</div>
            )}
          />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationAnalyticsSection
            renderRangeControl={(rangeControl) => (
              <div className="mb-4 flex justify-end">{rangeControl}</div>
            )}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default AnalyticsDashboard;
