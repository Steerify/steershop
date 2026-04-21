import { useState } from "react";
import { Share2, Copy, Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface ShareStorefrontProps {
  shopName: string;
  shopSlug: string;
  shopDescription?: string | null;
  logoUrl?: string | null;
  rating?: number;
  totalReviews?: number;
  productCount?: number;
}

export const ShareStorefront = ({
  shopName,
  shopSlug,
  shopDescription,
  logoUrl,
  rating = 0,
  totalReviews = 0,
  productCount = 0,
}: ShareStorefrontProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shopUrl = `${window.location.origin}/shop/${shopSlug}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Store link copied to clipboard" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopName} on SteerSolo`,
          text: shopDescription || `Check out ${shopName} — shop online now!`,
          url: shopUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto rounded-xl sm:rounded-full border-accent/30 text-accent hover:bg-accent/10 h-11 sm:h-10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-none">
        <div className="relative">
          {/* Gradient Header */}
          <div className="bg-gradient-to-br from-primary via-accent to-primary p-6 pb-16 text-center">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Share this Store</DialogTitle>
            </DialogHeader>
          </div>

          {/* Share Card */}
          <div className="mx-4 -mt-10 mb-4 relative">
            <div className="card-spotify p-6 text-center space-y-4 shadow-xl bg-card">
              {/* Shop Logo */}
              <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden bg-muted shadow-md ring-4 ring-card">
                {logoUrl ? (
                  <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {shopName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Shop Info */}
              <div>
                <h3 className="font-display text-xl font-bold">{shopName}</h3>
                {shopDescription && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{shopDescription}</p>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                    <span>({totalReviews})</span>
                  </div>
                )}
                {productCount > 0 && (
                  <span>{productCount} products</span>
                )}
              </div>

              {/* QR Code */}
              <div className="flex justify-center py-2">
                <div className="p-3 bg-white rounded-2xl shadow-inner">
                  <QRCodeSVG
                    value={shopUrl}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Scan to shop · steersolo.com</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
