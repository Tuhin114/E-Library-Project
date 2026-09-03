import { useState } from "react";
import { Search, Download, Loader2, Hash } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import RequestStatusBadge from "../../components/requests/RequestStatusBadge";
import { lookupRequestByReferenceCode, getRequestReceipt } from "../../services/requestService";
import { downloadBlob } from "../../lib/downloadBlob";
import { toast } from "../../hooks/useToast";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const RequestLookup = () => {
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;

    setIsSearching(true);
    setError(null);
    setRequest(null);
    try {
      const result = await lookupRequestByReferenceCode(code.trim().toUpperCase());
      setRequest(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await getRequestReceipt(request._id);
      downloadBlob(blob, filename);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reference Code Lookup"
        description="Verify a request at the desk by typing its reference code instead of scanning the QR."
      />

      <form onSubmit={handleSearch} className="flex max-w-md items-center gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="PR-XXXXXXXX"
          className="font-mono uppercase"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {request && (
        <Card className="mt-6 max-w-2xl p-4">
          <CardContent className="space-y-3 p-0">
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={request.status} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {request.referenceCode}
              </span>
            </div>

            <div>
              <p className="font-display text-base font-semibold text-foreground">
                {request.book?.title}
              </p>
              <p className="text-sm text-muted-foreground">{request.book?.isbn}</p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                {request.student?.name} &middot; {request.student?.email}
              </p>
              <p>
                Collection window: {formatDate(request.requestedCollectionDate)} –{" "}
                {formatDate(request.requestedReturnDate)}
              </p>
            </div>

            {["approved", "collected"].includes(request.status) && (
              <Button type="button" size="sm" onClick={handleDownloadReceipt} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download Receipt
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
};

export default RequestLookup;
