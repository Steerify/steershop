import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { Progress } from "@/components/ui/progress";
import shopService from "@/services/shop.service";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Shield,
  Store,
  FileText,
  Image,
  Send,
  Loader2,
  Info,
} from "lucide-react";

const STEPS = [
  { label: "Consent", icon: Shield },
  { label: "Business Info", icon: Store },
  { label: "Profile Content", icon: FileText },
  { label: "Visual Assets", icon: Image },
  { label: "Verify & Submit", icon: Send },
];

const CATEGORIES = [
  "Restaurant", "Bakery", "Fashion Designer", "Hair Salon", "Barber Shop",
  "Beauty Salon", "Spa", "Fitness Center", "Grocery Store", "Electronics Store",
  "Auto Repair Shop", "Cleaning Service", "Photography Studio", "Event Planner",
  "Real Estate Agency", "Law Firm", "Accounting Firm", "IT Services",
  "Marketing Agency", "Consulting Firm", "Medical Clinic", "Pharmacy",
  "Veterinarian", "Catering Service", "Logistics Company", "Other",
];

const ATTRIBUTES = [
  "Women-led", "Black-owned", "Veteran-led", "Family-owned",
  "Wheelchair accessible", "Free Wi-Fi", "Accepts cards", "Delivery available",
  "Online appointments", "LGBTQ+ friendly", "Pet-friendly",
];

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

type FormData = {
  consent_given: boolean;
  business_name: string;
  physical_address: string;
  is_service_area_business: boolean;
  service_areas: string;
  primary_category: string;
  phone_number: string;
  website_url: string;
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
  business_description: string;
  services_list: string;
  attributes: string[];
  opening_date: string;
  logo_url: string;
  cover_photo_url: string;
  interior_photos: string[];
  exterior_photos: string[];
  team_photos: string[];
  verification_notes: string;
};

const defaultHours = DAYS.reduce((acc, day) => {
  acc[day] = { open: "09:00", close: "17:00", closed: day === "sun" };
  return acc;
}, {} as FormData["business_hours"]);

const defaultForm: FormData = {
  consent_given: false,
  business_name: "",
  physical_address: "",
  is_service_area_business: false,
  service_areas: "",
  primary_category: "",
  phone_number: "",
  website_url: "",
  business_hours: defaultHours,
  business_description: "",
  services_list: "",
  attributes: [],
  opening_date: "",
  logo_url: "",
  cover_photo_url: "",
  interior_photos: [],
  exterior_photos: [],
  team_photos: [],
  verification_notes: "",
};

export default function GoogleBusinessProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [shop, setShop] = useState<any>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("draft");

  useEffect(() => {
    if (user) loadExisting();
  }, [user]);

  const loadExisting = async () => {
    try {
      const shopRes = await shopService.getShopByOwner(user!.id);
      const shopData = Array.isArray(shopRes.data) ? shopRes.data[0] : shopRes.data;
      if (!shopData) {
        toast({ title: "No shop found", description: "Create a shop first.", variant: "destructive" });
        navigate("/my-store");
        return;
      }
      setShop(shopData);

      const { data } = await supabase
        .from("google_business_profiles")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingId(data.id);
        setStatus(data.status);
        const hours = (data.business_hours as any) || defaultHours;
        setForm({
          consent_given: data.consent_given ?? false,
          business_name: data.business_name || "",
          physical_address: data.physical_address || "",
          is_service_area_business: data.is_service_area_business ?? false,
          service_areas: data.service_areas || "",
          primary_category: data.primary_category || "",
          phone_number: data.phone_number || "",
          website_url: data.website_url || "",
          business_hours: hours,
          business_description: data.business_description || "",
          services_list: data.services_list || "",
          attributes: (data.attributes as string[]) || [],
          opening_date: data.opening_date || "",
          logo_url: data.logo_url || "",
          cover_photo_url: data.cover_photo_url || "",
          interior_photos: (data.interior_photos as string[]) || [],
          exterior_photos: (data.exterior_photos as string[]) || [],
          team_photos: (data.team_photos as string[]) || [],
          verification_notes: data.verification_notes || "",
        });
        if (data.consent_given) setStep(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!shop || !user) return;
    setIsSaving(true);
    try {
      const payload = {
        shop_id: shop.id,
        user_id: user.id,
        consent_given: form.consent_given,
        consent_given_at: form.consent_given ? new Date().toISOString() : null,
        status: "draft",
        business_name: form.business_name || null,
        physical_address: form.physical_address || null,
        is_service_area_business: form.is_service_area_business,
        service_areas: form.service_areas || null,
        primary_category: form.primary_category || null,
        phone_number: form.phone_number || null,
        website_url: form.website_url || null,
        business_hours: form.business_hours,
        business_description: form.business_description || null,
        services_list: form.services_list || null,
        attributes: form.attributes,
        opening_date: form.opening_date || null,
        logo_url: form.logo_url || null,
        cover_photo_url: form.cover_photo_url || null,
        interior_photos: form.interior_photos,
        exterior_photos: form.exterior_photos,
        team_photos: form.team_photos,
        verification_notes: form.verification_notes || null,
      };

      if (existingId) {
        await supabase.from("google_business_profiles").update(payload).eq("id", existingId);
      } else {
        const { data } = await supabase.from("google_business_profiles").insert(payload).select("id").single();
        if (data) setExistingId(data.id);
      }
      toast({ title: "Draft saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!existingId && !shop) return;
    setIsSaving(true);
    try {
      // Save first
      const payload = {
        shop_id: shop.id,
        user_id: user!.id,
        consent_given: form.consent_given,
        consent_given_at: new Date().toISOString(),
        status: "submitted",
        business_name: form.business_name,
        physical_address: form.physical_address,
        is_service_area_business: form.is_service_area_business,
        service_areas: form.service_areas || null,
        primary_category: form.primary_category,
        phone_number: form.phone_number,
        website_url: form.website_url || null,
        business_hours: form.business_hours,
        business_description: form.business_description || null,
        services_list: form.services_list || null,
        attributes: form.attributes,
        opening_date: form.opening_date || null,
        logo_url: form.logo_url || null,
        cover_photo_url: form.cover_photo_url || null,
        interior_photos: form.interior_photos,
        exterior_photos: form.exterior_photos,
        team_photos: form.team_photos,
        verification_notes: form.verification_notes || null,
      };

      if (existingId) {
        await supabase.from("google_business_profiles").update(payload).eq("id", existingId);
      } else {
        await supabase.from("google_business_profiles").insert(payload);
      }

      setStatus("submitted");
      toast({ title: "Submitted!", description: "Our team will review your profile request." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addPhoto = (key: "interior_photos" | "exterior_photos" | "team_photos", url: string) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], url] }));
  };

  const removePhoto = (key: "interior_photos" | "exterior_photos" | "team_photos", idx: number) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  };

  const toggleAttribute = (attr: string) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.includes(attr)
        ? prev.attributes.filter((a) => a !== attr)
        : [...prev.attributes, attr],
    }));
  };

  const canProceedFromStep = (s: number) => {
    if (s === 0) return form.consent_given;
    if (s === 1) return form.business_name.trim() !== "" && form.phone_number.trim() !== "";
    return true;
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (status === "submitted" || status === "in_progress" || status === "completed") {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate("/marketing-services")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card className="text-center">
            <CardContent className="py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {status === "completed" ? "Profile Created!" : "Submission Received"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {status === "completed"
                  ? "Your Google Business Profile has been set up successfully."
                  : "Our team is reviewing your information. We'll reach out if we need anything else."}
              </p>
              <Badge variant="outline" className="text-sm">
                Status: {status.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/marketing-services")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Google Business Profile Setup
          </h1>
          <p className="text-muted-foreground">
            Provide your business details so we can create your Google presence
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Progress value={progressPercent} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`flex flex-col items-center gap-1 text-xs ${
                    i <= step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 0: Consent */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Authorization & Consent
              </CardTitle>
              <CardDescription>
                Please read and agree before we collect your business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <h4 className="font-semibold">What we'll collect and why:</h4>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li><strong>Business details</strong> — name, address, phone, hours — to set up your Google listing accurately.</li>
                  <li><strong>Profile content</strong> — description, services, attributes — to optimize your search visibility.</li>
                  <li><strong>Visual assets</strong> — logo, photos — profiles with quality photos get significantly more engagement.</li>
                  <li><strong>Verification info</strong> — Google requires proof of ownership/management.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Per Google's guidelines, we need your express consent before creating or managing a profile on your behalf.
                  You remain the owner — SteerSolo acts as your authorized manager.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg bg-background">
                <Checkbox
                  id="consent"
                  checked={form.consent_given}
                  onCheckedChange={(checked) => updateField("consent_given", checked === true)}
                />
                <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I authorize SteerSolo to create and manage a Google Business Profile on behalf of my business.
                  I confirm that I am the owner or authorized representative of this business.
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Core Business Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Core Business Information
              </CardTitle>
              <CardDescription>
                NAP accuracy (Name, Address, Phone) is a primary Google ranking factor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="bname">Official Business Name *</Label>
                <Input
                  id="bname"
                  placeholder="Must match your real-world branding exactly"
                  value={form.business_name}
                  onChange={(e) => updateField("business_name", e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Is this a Service Area Business?</Label>
                <Switch
                  checked={form.is_service_area_business}
                  onCheckedChange={(v) => updateField("is_service_area_business", v)}
                />
              </div>

              {form.is_service_area_business ? (
                <div>
                  <Label htmlFor="areas">Service Areas (cities / zip codes)</Label>
                  <Input
                    id="areas"
                    placeholder="e.g. Lagos, Abuja, Port Harcourt"
                    value={form.service_areas}
                    onChange={(e) => updateField("service_areas", e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="address">Full Physical Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address, city, state, postal code"
                    value={form.physical_address}
                    onChange={(e) => updateField("physical_address", e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="category">Primary Business Category *</Label>
                <Select value={form.primary_category} onValueChange={(v) => updateField("primary_category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the most specific category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Business Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Local number preferred"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="web">Website URL</Label>
                <Input
                  id="web"
                  type="url"
                  placeholder="https://yourbusiness.com"
                  value={form.website_url}
                  onChange={(e) => updateField("website_url", e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-3 block">Business Hours</Label>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const h = form.business_hours[day];
                    return (
                      <div key={day} className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-medium">{DAY_LABELS[day]}</span>
                        <Switch
                          checked={!h?.closed}
                          onCheckedChange={(open) => {
                            const updated = { ...form.business_hours };
                            updated[day] = { ...updated[day], closed: !open };
                            updateField("business_hours", updated);
                          }}
                        />
                        {!h?.closed && (
                          <>
                            <Input
                              type="time"
                              value={h?.open || "09:00"}
                              onChange={(e) => {
                                const updated = { ...form.business_hours };
                                updated[day] = { ...updated[day], open: e.target.value };
                                updateField("business_hours", updated);
                              }}
                              className="w-28"
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={h?.close || "17:00"}
                              onChange={(e) => {
                                const updated = { ...form.business_hours };
                                updated[day] = { ...updated[day], close: e.target.value };
                                updateField("business_hours", updated);
                              }}
                              className="w-28"
                            />
                          </>
                        )}
                        {h?.closed && <span className="text-muted-foreground">Closed</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Profile Content */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Profile Content & Optimization
              </CardTitle>
              <CardDescription>
                These details help your profile appear in more search queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="desc">Business Description</Label>
                  <span className={`text-xs ${form.business_description.length > 750 ? "text-destructive" : "text-muted-foreground"}`}>
                    {form.business_description.length}/750
                  </span>
                </div>
                <Textarea
                  id="desc"
                  placeholder="Brief summary of what you do and who you serve..."
                  value={form.business_description}
                  onChange={(e) => updateField("business_description", e.target.value.slice(0, 750))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="services">Services / Products List</Label>
                <Textarea
                  id="services"
                  placeholder="List your services or products, one per line. Include pricing if possible."
                  value={form.services_list}
                  onChange={(e) => updateField("services_list", e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label className="mb-2 block">Business Attributes</Label>
                <div className="flex flex-wrap gap-2">
                  {ATTRIBUTES.map((attr) => (
                    <Badge
                      key={attr}
                      variant={form.attributes.includes(attr) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleAttribute(attr)}
                    >
                      {attr}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="opendate">Opening Date (Month/Year)</Label>
                <Input
                  id="opendate"
                  type="month"
                  value={form.opening_date}
                  onChange={(e) => updateField("opening_date", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Visual Assets */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Visual Assets
              </CardTitle>
              <CardDescription>
                Profiles with quality photos receive significantly higher engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-1 block">Logo (720×720px recommended)</Label>
                <ImageUpload
                  value={form.logo_url}
                  onChange={(url) => updateField("logo_url", url)}
                  folder="shop-images"
                />
              </div>

              <div>
                <Label className="mb-1 block">Cover Photo (1024×575px recommended)</Label>
                <ImageUpload
                  value={form.cover_photo_url}
                  onChange={(url) => updateField("cover_photo_url", url)}
                  folder="shop-images"
                />
              </div>

              {/* Multi-photo sections */}
              {(["interior_photos", "exterior_photos", "team_photos"] as const).map((key) => {
                const labels = {
                  interior_photos: "Interior Photos",
                  exterior_photos: "Exterior / Signage Photos",
                  team_photos: "Team / Work-in-Progress Photos",
                };
                return (
                  <div key={key}>
                    <Label className="mb-1 block">{labels[key]}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {form[key].map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(key, idx)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {form[key].length < 5 && (
                      <ImageUpload
                        value=""
                        onChange={(url) => addPhoto(key, url)}
                        folder="shop-images"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Real photos only — no stock images. Up to 5 photos.
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Verification & Submit */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Verification & Submit
              </CardTitle>
              <CardDescription>
                Google often requires video verification in 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">What Google may ask you to verify:</p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                      <li><strong>Proof of Management:</strong> Business license, utility bill, or keys to the location</li>
                      <li><strong>Proof of Location:</strong> Storefront signage and nearby street signs</li>
                      <li><strong>Proof of Operations:</strong> Video showing tools, equipment, or branded vehicle</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="vnotes">Verification Notes</Label>
                <Textarea
                  id="vnotes"
                  placeholder="Tell us what proof of business you can provide (e.g., 'I have a registered CAC certificate and permanent signage at my shop location')..."
                  value={form.verification_notes}
                  onChange={(e) => updateField("verification_notes", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Summary */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Quick Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Business:</span>{" "}
                    <span className="font-medium">{form.business_name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium">{form.primary_category || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">{form.phone_number || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Photos:</span>{" "}
                    <span className="font-medium">
                      {form.interior_photos.length + form.exterior_photos.length + form.team_photos.length + (form.logo_url ? 1 : 0) + (form.cover_photo_url ? 1 : 0)} uploaded
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step > 0 && (
              <Button variant="ghost" onClick={saveDraft} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Draft
              </Button>
            )}
          </div>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => { if (step === 0 && !existingId) saveDraft(); setStep(step + 1); }}
              disabled={!canProceedFromStep(step)}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !form.consent_given || !form.business_name}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit for Review
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
