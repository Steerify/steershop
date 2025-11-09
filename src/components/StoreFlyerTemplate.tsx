import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, FileText } from "lucide-react";

interface StoreFlyerTemplateProps {
  shop: {
    shop_name: string;
    shop_slug: string;
    description?: string;
    logo_url?: string;
    whatsapp_number: string;
  };
}

export const StoreFlyerTemplate = ({ shop }: StoreFlyerTemplateProps) => {
  const storeUrl = `${window.location.origin}/shop/${shop.shop_slug}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Create Printable Flyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Store Marketing Flyer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-end gap-2 print:hidden">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Flyer
            </Button>
          </div>

          {/* Flyer Template */}
          <div 
            id="flyer-template" 
            className="bg-white p-12 rounded-lg border-2 border-border print:border-0"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {/* Header Section */}
            <div className="text-center mb-8 pb-8 border-b-2 border-primary/20">
              {shop.logo_url && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={shop.logo_url} 
                    alt={shop.shop_name}
                    className="h-32 w-auto object-contain"
                  />
                </div>
              )}
              <h1 className="text-5xl font-bold mb-4 text-foreground">
                {shop.shop_name}
              </h1>
              {shop.description && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {shop.description}
                </p>
              )}
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-12 items-center my-12">
              {/* Left Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-primary/20">
                  <QRCodeSVG
                    value={storeUrl}
                    size={280}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold text-primary mb-2">
                    Scan to Visit Our Store
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Shop online anytime, anywhere
                  </p>
                </div>
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-6">
                <div className="bg-muted/50 p-8 rounded-xl border-2 border-primary/10">
                  <h2 className="text-3xl font-bold mb-6 text-foreground">
                    Get in Touch
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        WhatsApp
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {shop.whatsapp_number}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Online Store
                      </p>
                      <p className="text-lg font-mono text-foreground break-all">
                        {storeUrl}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20">
                  <p className="text-lg text-center font-semibold text-foreground">
                    Browse our products, place orders, and get updates on new arrivals!
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action Banner */}
            <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 rounded-2xl border-2 border-primary/20 text-center">
              <h3 className="text-3xl font-bold mb-3 text-foreground">
                Shop Now & Get Special Offers!
              </h3>
              <p className="text-xl text-muted-foreground">
                Scan the QR code or visit our website to explore our full catalog
              </p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-primary/20 text-center">
              <p className="text-lg text-muted-foreground">
                Thank you for choosing <span className="font-bold text-foreground">{shop.shop_name}</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
