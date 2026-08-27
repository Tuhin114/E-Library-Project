import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSettings } from "../../store/slices/settingsSlice";
import { APPROVAL_MODE_OPTIONS } from "../../constants/approvalMode";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";

const LibrarySettings = () => {
  const dispatch = useDispatch();
  const { settings, status, isSaving } = useSelector((state) => state.settings);

  const [approvalMode, setApprovalMode] = useState("manual");
  const [bufferDays, setBufferDays] = useState(1);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setApprovalMode(settings.approvalMode);
      setBufferDays(settings.autoApprovalBufferDays);
    }
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(
      updateSettings({
        approvalMode,
        autoApprovalBufferDays: Number(bufferDays),
      }),
    );
  };

  if (status === "loading" && !settings) {
    return (
      <PageContainer>
        <PageHeader title="Settings" description="Configure how physical copy requests are approved." />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Configure how physical copy requests are approved."
      />

      <Card className="max-w-xl p-6">
        <CardContent className="p-0">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="approval-mode">Approval mode</Label>
              <Select value={approvalMode} onValueChange={setApprovalMode}>
                <SelectTrigger id="approval-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_MODE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {approvalMode === "automatic" && (
              <div className="space-y-1.5">
                <Label htmlFor="buffer-days">Safety buffer (days)</Label>
                <Input
                  id="buffer-days"
                  type="number"
                  min={0}
                  max={14}
                  value={bufferDays}
                  onChange={(e) => setBufferDays(e.target.value)}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">
                  A new request is only auto-approved if every existing commitment on that
                  book clears this many days before the new collection date — protects
                  against a previous borrower returning late.
                </p>
              </div>
            )}

            <Button type="submit" isLoading={isSaving}>
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default LibrarySettings;
