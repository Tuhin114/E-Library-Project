import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Eye, Star, MessageCircle } from "lucide-react";
import { fetchCatalogAnalytics } from "@/store/slices/analyticsSlice";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AnalyticsBookList from "@/components/analytics/AnalyticsBookList";
import DistributionBarList from "@/components/analytics/DistributionBarList";
import DeadStockList from "@/components/analytics/DeadStockList";

const SectionCard = ({ icon: Icon, title, children }) => (
  <Card className="p-4">
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
    {children}
  </Card>
);

const CatalogAnalytics = () => {
  const dispatch = useDispatch();
  const { catalog, catalogStatus } = useSelector((state) => state.analytics);
  const isLoading = catalogStatus === "loading" || catalogStatus === "idle";

  useEffect(() => {
    dispatch(fetchCatalogAnalytics());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="Catalog Analytics"
        description={
          catalog
            ? `What's getting read, loved, and rated across ${catalog.totalPublished} published books.`
            : "What's getting read, loved, and rated across your published catalog."
        }
      />

      <Tabs defaultValue="top-books">
        <TabsList>
          <TabsTrigger value="top-books">Top Books</TabsTrigger>
          <TabsTrigger value="distribution">Catalog Mix</TabsTrigger>
          <TabsTrigger value="dead-stock">
            Dead Stock{catalog ? ` (${catalog.deadStock.count})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top-books">
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard icon={Heart} title="Most Favorited">
              <AnalyticsBookList
                books={catalog?.mostFavorited}
                isLoading={isLoading}
                metricSuffix="favorites"
                emptyText="No books have been favorited yet."
              />
            </SectionCard>

            <SectionCard icon={Eye} title="Most Viewed">
              <AnalyticsBookList
                books={catalog?.mostViewed}
                isLoading={isLoading}
                metricSuffix="readers"
                emptyText="No books have recorded views yet."
              />
            </SectionCard>

            <SectionCard icon={Star} title="Top Rated">
              <AnalyticsBookList
                books={catalog?.topRated}
                isLoading={isLoading}
                metricSuffix="★"
                emptyText="No books have reviews yet."
              />
            </SectionCard>

            <SectionCard icon={MessageCircle} title="Most Discussed">
              <AnalyticsBookList
                books={catalog?.mostDiscussed}
                isLoading={isLoading}
                metricSuffix="posts"
                emptyText="No per-book discussions started yet."
              />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h2 className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">
                By Category
              </h2>
              <DistributionBarList
                rows={catalog?.categoryDistribution}
                isLoading={isLoading}
                labelKey="category"
                labelFallback="Uncategorized"
                emptyText="No published books yet."
              />
            </Card>

            <Card className="p-4">
              <h2 className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">
                Top Authors by Book Count
              </h2>
              <DistributionBarList
                rows={catalog?.authorDistribution}
                isLoading={isLoading}
                labelKey="author"
                labelFallback="Unknown"
                emptyText="No published books yet."
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dead-stock">
          <Card className="p-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Published books with zero favorites, views, reviews, or discussion posts.
              Oldest first.
            </p>
            <DeadStockList
              books={catalog?.deadStock?.books}
              isLoading={isLoading}
              emptyText="Every published book has at least some recorded engagement."
            />
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default CatalogAnalytics;
