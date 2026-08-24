import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Eye, Star, MessageCircle } from "lucide-react";
import { fetchCatalogAnalytics } from "@/store/slices/analyticsSlice";
import { exportCatalogAnalytics } from "@/services/analyticsService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AnalyticsBookList from "@/components/analytics/AnalyticsBookList";
import DistributionChart from "@/components/analytics/DistributionChart";
import DeadStockList from "@/components/analytics/DeadStockList";
import ExportButton from "@/components/analytics/ExportButton";

const SectionCard = ({ icon: Icon, title, exportDataset, children }) => (
  <Card className="p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {exportDataset && (
        <ExportButton
          exportFn={exportCatalogAnalytics}
          dataset={exportDataset}
          label={title}
        />
      )}
    </div>
    {children}
  </Card>
);

const CatalogAnalyticsSection = ({
  onLoaded,
  onDeadStockCount,
  activeTab,
  onTabChange,
  hideTabs = false,
}) => {
  const dispatch = useDispatch();
  const { catalog, catalogStatus } = useSelector((state) => state.analytics);
  const [internalTab, setInternalTab] = useState("top-books");
  const isLoading = catalogStatus === "loading" || catalogStatus === "idle";

  const selectedTab = activeTab ?? internalTab;
  const handleTabChange = onTabChange ?? setInternalTab;

  useEffect(() => {
    dispatch(fetchCatalogAnalytics());
  }, [dispatch]);

  useEffect(() => {
    if (catalog) {
      onLoaded?.(catalog.totalPublished);
      onDeadStockCount?.(catalog.deadStock?.count ?? 0);
    }
  }, [catalog, onLoaded, onDeadStockCount]);

  const categoryRows = catalog?.categoryDistribution?.map((row) => ({
    label: row.category?.name || "Uncategorized",
    value: row.bookCount,
  }));

  const authorRows = catalog?.authorDistribution?.map((row) => ({
    label: row.author?.name || "Unknown",
    value: row.bookCount,
  }));

  const content = (
    <>
      {selectedTab === "top-books" && (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            icon={Heart}
            title="Most Favorited"
            exportDataset="mostFavorited"
          >
            <AnalyticsBookList
              books={catalog?.mostFavorited}
              isLoading={isLoading}
              metricSuffix="favorites"
              emptyText="No books have been favorited yet."
            />
          </SectionCard>

          <SectionCard
            icon={Eye}
            title="Most Viewed"
            exportDataset="mostViewed"
          >
            <AnalyticsBookList
              books={catalog?.mostViewed}
              isLoading={isLoading}
              metricSuffix="readers"
              emptyText="No books have recorded views yet."
            />
          </SectionCard>

          <SectionCard icon={Star} title="Top Rated" exportDataset="topRated">
            <AnalyticsBookList
              books={catalog?.topRated}
              isLoading={isLoading}
              metricSuffix="★"
              emptyText="No books have reviews yet."
            />
          </SectionCard>

          <SectionCard
            icon={MessageCircle}
            title="Most Discussed"
            exportDataset="mostDiscussed"
          >
            <AnalyticsBookList
              books={catalog?.mostDiscussed}
              isLoading={isLoading}
              metricSuffix="posts"
              emptyText="No per-book discussions started yet."
            />
          </SectionCard>
        </div>
      )}

      {selectedTab === "distribution" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                By Category
              </h2>
              <ExportButton
                exportFn={exportCatalogAnalytics}
                dataset="categoryDistribution"
                label="By Category"
              />
            </div>
            <DistributionChart
              rows={categoryRows}
              isLoading={isLoading}
              emptyText="No published books yet."
            />
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Top Authors by Book Count
              </h2>
              <ExportButton
                exportFn={exportCatalogAnalytics}
                dataset="authorDistribution"
                label="Top Authors"
              />
            </div>
            <DistributionChart
              rows={authorRows}
              isLoading={isLoading}
              emptyText="No published books yet."
            />
          </Card>
        </div>
      )}

      {selectedTab === "dead-stock" && (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Published books with zero favorites, views, reviews, or discussion
              posts. Oldest first.
            </p>
            <ExportButton
              exportFn={exportCatalogAnalytics}
              dataset="deadStock"
              label="Dead Stock"
            />
          </div>
          <DeadStockList
            books={catalog?.deadStock?.books}
            isLoading={isLoading}
            emptyText="Every published book has at least some recorded engagement."
          />
        </Card>
      )}
    </>
  );

  if (hideTabs) {
    return content;
  }

  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="top-books">Top Books</TabsTrigger>
        <TabsTrigger value="distribution">Catalog Mix</TabsTrigger>
        <TabsTrigger value="dead-stock">
          Dead Stock{catalog ? ` (${catalog.deadStock.count})` : ""}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="top-books">{content}</TabsContent>
      <TabsContent value="distribution">{content}</TabsContent>
      <TabsContent value="dead-stock">{content}</TabsContent>
    </Tabs>
  );
};

export default CatalogAnalyticsSection;
