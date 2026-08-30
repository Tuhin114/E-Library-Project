import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, PercentCircle, CalendarClock, Receipt } from "lucide-react";
import { fetchFinancialAnalytics } from "@/store/slices/analyticsSlice";
import { exportFinancialAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import LabeledBarList from "@/components/analytics/LabeledBarList";
import AnalyticsBookList from "@/components/analytics/AnalyticsBookList";
import TopFeePayersList from "@/components/analytics/TopFeePayersList";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const formatCurrency = (value) => (value == null ? "—" : `$${value.toFixed(2)}`);
const formatCurrencyValue = (row) => `$${row.count.toFixed(2)}`;

// Same renderRangeControl slot pattern every other analytics section
// already uses — the standalone page puts it in its own PageHeader, the
// unified dashboard puts it above the tabs.
const FinancialAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { financial, financialStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = financialStatus === "loading" || financialStatus === "idle";

  useEffect(() => {
    dispatch(fetchFinancialAnalytics({ range }));
  }, [dispatch, range]);

  const rangeControl = (
    <Select value={range} onValueChange={setRange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Range" />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      {renderRangeControl?.(rangeControl)}

      {/* Collection rate is deliberately real-time (not range-scoped) —
          see financialAnalyticsService.getFeeStatusBreakdown. */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {formatCurrency(
                  financial?.feeAmountByStatus?.find((r) => r.label === "outstanding")?.count,
                )}
              </p>
              <p className="text-xs text-muted-foreground">Outstanding now</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <PercentCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {financial?.collectionRate != null ? `${financial.collectionRate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Collection rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {financial?.avgDaysLate ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg days late</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {formatCurrency(financial?.avgFeeAmount)}
              </p>
              <p className="text-xs text-muted-foreground">Avg fee amount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportFinancialAnalytics}
              dataset="revenueOverTime"
              params={{ range }}
              label="Revenue Over Time"
            />
          </div>
          <TimeSeriesChart
            title="Revenue Collected"
            series={financial?.revenueOverTime}
            isLoading={isLoading}
            emptyText="No fees paid in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Fees by Status
            </h2>
            <ExportButton
              exportFn={exportFinancialAnalytics}
              dataset="feeAmountByStatus"
              params={{ range }}
              label="Fees by Status"
            />
          </div>
          <LabeledBarList
            rows={financial?.feeAmountByStatus}
            isLoading={isLoading}
            emptyText="No fees have been charged yet."
            formatValue={formatCurrencyValue}
          />
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Payment Method Split
            </h2>
            <ExportButton
              exportFn={exportFinancialAnalytics}
              dataset="paymentMethodSplit"
              params={{ range }}
              label="Payment Method Split"
            />
          </div>
          <LabeledBarList
            rows={financial?.paymentMethodSplit}
            isLoading={isLoading}
            emptyText="No fees paid in this period."
            formatLabel={(row) => row.label.replace("_", " ")}
            formatValue={formatCurrencyValue}
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Highest Fee-Generating Books
            </h2>
            <ExportButton
              exportFn={exportFinancialAnalytics}
              dataset="topFeeGeneratingBooks"
              params={{ range }}
              label="Top Fee-Generating Books"
            />
          </div>
          <AnalyticsBookList
            books={financial?.topFeeGeneratingBooks}
            isLoading={isLoading}
            emptyText="No fees charged against a book in this period."
            metricPrefix="$"
            metricSuffix="in fees"
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
            Top Fee-Generating Students
          </h2>
          <ExportButton
            exportFn={exportFinancialAnalytics}
            dataset="topFeePayers"
            params={{ range }}
            label="Top Fee-Generating Students"
          />
        </div>
        <TopFeePayersList
          payers={financial?.topFeePayers}
          isLoading={isLoading}
          emptyText="No fees charged to a student in this period."
        />
      </Card>
    </>
  );
};

export default FinancialAnalyticsSection;
