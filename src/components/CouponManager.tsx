import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { couponService, CouponData } from "@/services/coupon.service";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2 } from "lucide-react";

interface CouponManagerProps {
  shopId: string;
}

export const CouponManager = ({ shopId }: CouponManagerProps) => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    valid_until: "",
  });

  useEffect(() => {
    loadCoupons();
  }, [shopId]);

  const loadCoupons = async () => {
    try {
      const data = await couponService.getCoupons(shopId);
      setCoupons(data);
    } catch (error) {
      console.error("Failed to load coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount_value) {
      toast({ title: "Missing fields", description: "Code and discount value are required", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const data: CouponData = {
        shop_id: shopId,
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        ...(form.min_order_amount && { min_order_amount: Number(form.min_order_amount) }),
        ...(form.max_uses && { max_uses: Number(form.max_uses) }),
        ...(form.valid_until && { valid_until: new Date(form.valid_until).toISOString() }),
      };

      await couponService.createCoupon(data);
      toast({ title: "Coupon Created! 🎉", description: `Code: ${form.code.toUpperCase()}` });
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_uses: "", valid_until: "" });
      setIsDialogOpen(false);
      loadCoupons();
    } catch (error: any) {
      toast({ title: "Failed", description: error.message || "Could not create coupon", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await couponService.toggleCoupon(id, !isActive);
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !isActive } : c));
    } catch (error) {
      toast({ title: "Error", description: "Failed to toggle coupon", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await couponService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast({ title: "Deleted", description: "Coupon removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Discount Coupons
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE10"
                  maxLength={20}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm(prev => ({ ...prev, discount_type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm(prev => ({ ...prev, discount_value: e.target.value }))}
                    placeholder={form.discount_type === "percentage" ? "10" : "500"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Order (₦)</Label>
                  <Input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm(prev => ({ ...prev, min_order_amount: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expires On</Label>
                <Input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
              <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No coupons yet. Create one to offer discounts!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={coupon.is_active ? "default" : "secondary"} className={coupon.is_active ? "bg-primary/10 text-primary" : ""}>
                    {coupon.code}
                  </Badge>
                  <span className="text-sm">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `₦${Number(coupon.discount_value).toLocaleString()} off`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Used: {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(coupon.id, coupon.is_active)}>
                    {coupon.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
