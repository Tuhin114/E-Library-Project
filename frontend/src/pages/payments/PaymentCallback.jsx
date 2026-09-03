import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const STATUS_CONTENT = {
  paid: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    title: "Payment received",
    description:
      "We're confirming this with Razorpay now — your fee will show as paid within a few seconds, and the receipt will be ready to download from My Fees.",
  },
  cancelled: {
    icon: XCircle,
    iconClass: "text-destructive",
    title: "Payment cancelled",
    description: "No charge was made. Your fee is still outstanding — you can try again from My Fees.",
  },
  expired: {
    icon: XCircle,
    iconClass: "text-destructive",
    title: "Payment link expired",
    description: "That checkout session timed out. Your fee is still outstanding — start a new payment from My Fees.",
  },
};

const DEFAULT_STATUS = {
  icon: Clock,
  iconClass: "text-muted-foreground",
  title: "Payment status pending",
  description: "We're still confirming this payment. Check My Fees in a moment.",
};

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkStatus = searchParams.get("razorpay_payment_link_status");
  const { icon: Icon, iconClass, title, description } = STATUS_CONTENT[linkStatus] || DEFAULT_STATUS;

  return (
    <PageContainer>
      <div className="mx-auto max-w-md">
        <Card className="p-6 text-center">
          <CardContent className="space-y-4 p-0">
            <Icon className={`mx-auto h-12 w-12 ${iconClass}`} />
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            <Button type="button" className="w-full" onClick={() => navigate("/fees")}>
              Go to My Fees
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default PaymentCallback;
