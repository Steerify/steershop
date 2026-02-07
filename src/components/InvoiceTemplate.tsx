import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { useRef } from "react";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    created_at: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    delivery_address?: string;
    total_amount: number;
    delivery_fee?: number;
    payment_status?: string;
    status: string;
    order_items?: Array<{
      id: string;
      quantity: number;
      price: number;
      products?: { name: string; image_url?: string };
    }>;
  };
  shop: {
    shop_name?: string;
    name?: string;
    logo_url?: string;
    whatsapp_number?: string;
  };
}

export const InvoiceTemplate = ({ isOpen, onClose, order, shop }: InvoiceProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items: InvoiceItem[] = (order.order_items || []).map((item) => ({
      name: item.products?.name || "Unknown",
      quantity: item.quantity,
      price: parseFloat(String(item.price || 0)),
    }));

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const deliveryFee = parseFloat(String(order.delivery_fee || 0));
    const shopName = shop.shop_name || shop.name || "Store";
    const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .shop-name { font-size: 24px; font-weight: 700; color: #2563eb; }
          .invoice-title { font-size: 28px; font-weight: 700; color: #374151; text-align: right; }
          .invoice-number { font-size: 14px; color: #6b7280; text-align: right; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block h4 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.5px; }
          .info-block p { font-size: 14px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f3f4f6; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef9c3; color: #854d0e; }
          .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="shop-name">${shopName}</div>
            ${shop.whatsapp_number ? `<p style="font-size:13px;color:#6b7280;margin-top:4px;">📞 ${shop.whatsapp_number}</p>` : ""}
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoiceNumber}</div>
            <div class="invoice-number">${format(new Date(order.created_at), "MMM dd, yyyy")}</div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h4>Bill To</h4>
            <p><strong>${order.customer_name || "Customer"}</strong></p>
            ${order.customer_email ? `<p>${order.customer_email}</p>` : ""}
            ${order.customer_phone ? `<p>${order.customer_phone}</p>` : ""}
            ${order.delivery_address ? `<p>${order.delivery_address}</p>` : ""}
          </div>
          <div class="info-block" style="text-align:right;">
            <h4>Payment Status</h4>
            <span class="status ${order.payment_status === "paid" ? "status-paid" : "status-pending"}">
              ${order.payment_status === "paid" ? "PAID" : "PENDING"}
            </span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₦${item.price.toLocaleString()}</td>
                <td class="text-right">₦${(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₦${subtotal.toLocaleString()}</span>
          </div>
          ${deliveryFee > 0 ? `
          <div class="total-row">
            <span>Delivery Fee</span>
            <span>₦${deliveryFee.toLocaleString()}</span>
          </div>
          ` : ""}
          <div class="total-row grand">
            <span>Total</span>
            <span>₦${parseFloat(String(order.total_amount)).toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase! • Powered by SteerSolo</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p><strong>Invoice:</strong> INV-{order.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Customer:</strong> {order.customer_name || "N/A"}</p>
            <p><strong>Amount:</strong> ₦{parseFloat(String(order.total_amount)).toLocaleString()}</p>
            <p><strong>Date:</strong> {format(new Date(order.created_at), "MMM dd, yyyy")}</p>
            <p><strong>Status:</strong> {order.payment_status === "paid" ? "✅ Paid" : "⏳ Pending"}</p>
          </div>
          <Button onClick={handlePrint} className="w-full bg-gradient-to-r from-primary to-accent">
            <Printer className="w-4 h-4 mr-2" />
            Print / Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
