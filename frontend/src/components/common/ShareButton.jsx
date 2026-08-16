import { Share2 } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

/**
 * navigator.share() opens the OS-native share sheet directly with the
 * given title/text/url — no OG tags involved, that's a separate
 * concern (see useDocumentMeta) for how the page itself presents when
 * a link is opened, not for this button's own behavior.
 */
const ShareButton = ({ title, text, url = window.location.href, variant = "outline" }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // AbortError fires when the user just closes the share sheet —
        // not a real failure, nothing to report.
        if (error.name !== "AbortError") toast.error("Could not share this link.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <Button type="button" variant={variant} onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
};

export default ShareButton;
