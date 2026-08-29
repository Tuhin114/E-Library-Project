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
  const [maxRenewals, setMaxRenewals] = useState(2);
  const [renewalExtensionDays, setRenewalExtensionDays] = useState(7);
  const [waitlistClaimWindowHours, setWaitlistClaimWindowHours] = useState(48);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setApprovalMode(settings.approvalMode);
      setBufferDays(settings.autoApprovalBufferDays);
      setMaxRenewals(settings.maxRenewals);
      setRenewalExtensionDays(settings.renewalExtensionDays);
      setWaitlistClaimWindowHours(settings.waitlistClaimWindowHours);
    }
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(
      updateSettings({
        approvalMode,
        autoApprovalBufferDays: Number(bufferDays),
        maxRenewals: Number(maxRenewals),
        renewalExtensionDays: Number(renewalExtensionDays),
        waitlistClaimWindowHours: Number(waitlistClaimWindowHours),
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
        description="Configure how physical copy requests are approved, and how renewals and waitlist holds behave."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="max-w-xl p-6">
          <CardContent className="space-y-6 p-0">
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
          </CardContent>
        </Card>

        <Card className="max-w-xl p-6">
          <CardContent className="space-y-6 p-0">
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">
                Circulation (Phase 7 — M2)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Controls loan renewals and how long a waitlist hold stays reserved before
                it's released to the next person in line.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-renewals">Max renewals per loan</Label>
              <Input
                id="max-renewals"
                type="number"
                min={0}
                max={5}
                value={maxRenewals}
                onChange={(e) => setMaxRenewals(e.target.value)}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                How many times PATCH /loans/:id/renew can extend the same loan before it
                starts being rejected. 0 disables renewals entirely.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="renewal-extension-days">Renewal extension (days)</Label>
              <Input
                id="renewal-extension-days"
                type="number"
                min={1}
                max={30}
                value={renewalExtensionDays}
                onChange={(e) => setRenewalExtensionDays(e.target.value)}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Days added to a loan's due date per renewal.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="waitlist-claim-window">Waitlist claim window (hours)</Label>
              <Input
                id="waitlist-claim-window"
                type="number"
                min={1}
                max={168}
                value={waitlistClaimWindowHours}
                onChange={(e) => setWaitlistClaimWindowHours(e.target.value)}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                How long a reserved copy is held for a notified waitlist entry before the
                hold expires and cascades to the next person in the queue.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" isLoading={isSaving}>
          Save Settings
        </Button>
      </form>
    </PageContainer>
  );
};

export default LibrarySettings;
