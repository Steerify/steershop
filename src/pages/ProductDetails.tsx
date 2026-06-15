import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package, Minus, Plus, MessageSquare, BadgeCheck, ChevronLeft, ChevronRight, Share2, Shield, Truck, Clock, Expand, Download } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { ProductRating } from "@/components/ProductRating";
import { ProductReviewForm } from "@/components/ProductReviewForm";
import { ProductMediaLightbox } from "@/components/ProductMediaLightbox";
import { format } from "date-fns";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import reviewService from "@/services/review.service";
import { Shop, Product } from "@/types/api";

// Types from @/types/api used instead
interface ProductDetailCartItem {
  product: Product & { stock_quantity?: number; stock_unit?: string };
  quantity: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  created_at: string;
  reviewer?: {
    kyc_level: number;
  } | null;
}

interface StoredCartProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  stock_unit?: string | null;
  is_available: boolean;
  image_url: string | null;
  video_url: string | null;
  average_rating: number;
  total_reviews: number;
  type: 'product' | 'service';
  duration_minutes: number | null;
  booking_required: boolean;
  is_digital?: boolean;
}

interface StoredCartItem {
  product: StoredCartProduct;
  quantity: number;
}

const getCartKey = (shopId: string) => `cart_${shopId}`;

const parseStoredCart = (storedValue: string | null): unknown[] => {
  if (!storedValue) return [];

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isStoredCartItem = (item: unknown): item is StoredCartItem => {
  if (!item || typeof item !== "object") return false;
  const productId = (item as { product?: { id?: unknown } }).product?.id;
  return typeof productId === "string";
};

const getProductStockQuantity = (product: Product) => product.stock_quantity ?? product.inventory ?? 0;

const normalizeProductForCart = (product: Product): StoredCartProduct => ({
  id: product.id,
  name: product.name,
  description: product.description || null,
  price: product.price,
  compare_price: product.comparePrice ?? null,
  stock_quantity: getProductStockQuantity(product),
  stock_unit: product.stockUnit || null,
  is_available: product.is_available ?? true,
  image_url: product.image_url || product.images?.[0]?.url || null,
  video_url: product.video_url || null,
  average_rating: product.averageRating ?? 0,
  total_reviews: product.totalReviews ?? 0,
  type: product.type || 'product',
  duration_minutes: product.duration_minutes ?? null,
  booking_required: product.booking_required ?? false,
  is_digital: product.is_digital ?? false,
});

const clampCartQuantity = (quantity: unknown, stockQuantity: number) => {
  const parsedQuantity = Number(quantity);
  const safeQuantity = Number.isFinite(parsedQuantity) ? Math.floor(parsedQuantity) : 1;
  return Math.min(Math.max(safeQuantity, 1), stockQuantity);
};

const ProductDetails = () => {
  const { slug, productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProductData();
  }, [slug, productId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  const productSeo = product && shop ? (
    <Helmet>
      <title>{`${product.name} | ${shop.shop_name || shop.name || 'Shop'} | SteerSolo`}</title>
      <meta name="description" content={product.description || `${product.name} available at ${shop.shop_name || shop.name || 'Shop'} on SteerSolo.`} />
      <meta name="keywords" content={`${product.name}, ${shop.shop_name || shop.name}, buy ${product.name} online, nigeria beauty, steersolo`} />
      
      <meta property="og:title" content={`${product.name} - ${shop.shop_name || shop.name}`} />
      <meta property="og:description" content={product.description || `${product.name} available at ${shop.shop_name || shop.name} on SteerSolo.`} />
      <meta property="og:url" content={`https://steersolo.com/shop/${slug}/product/${product.id}`} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="SteerSolo" />
      <meta property="og:locale" content="en_NG" />
      
      {(product.image_url || product.images?.[0]?.url) && (
        <meta property="og:image" content={product.image_url || product.images?.[0]?.url} />
      )}
    
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${product.name} - ${shop.shop_name || shop.name}`} />
      <meta name="twitter:description" content={product.description || `${product.name} available at ${shop.shop_name || shop.name} on SteerSolo.`} />
      
      <link rel="canonical" href={`https://steersolo.com/shop/${slug}/product/${product.id}`} />
      
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || `${product.name} available at ${shop.shop_name || shop.name} on SteerSolo.`,
            "image": product.image_url || (product.images?.[0]?.url) || undefined,
            "url": `https://steersolo.com/shop/${slug}/product/${product.id}`,
            "sku": product.id,
            "brand": { "@type": "Brand", "name": shop.shop_name || shop.name },
            "offers": {
              "@type": "Offer",
              "url": `https://steersolo.com/shop/${slug}/product/${product.id}`,
              "price": product.price,
              "priceCurrency": "NGN",
              "availability": (product.inventory || product.is_available) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": { "@type": "Organization", "name": shop.shop_name || shop.name, "url": `https://steersolo.com/shop/${slug}` }
            },
            ...((product.averageRating || product.totalReviews) && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.averageRating,
                "reviewCount": product.totalReviews
              }
            }),
            ...(reviews.length > 0 && {
              "review": reviews.map(r => ({
                "@type": "Review",
                "reviewRating": { "@type": "Rating", "ratingValue": r.rating },
                "author": { "@type": "Person", "name": r.customer_name || "Verified Customer" },
                "reviewBody": r.comment || "",
                "datePublished": r.created_at
              }))
            })
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Marketplace", "item": "https://steersolo.com/shops" },
              { "@type": "ListItem", "position": 2, "name": shop.shop_name || shop.name, "item": `https://steersolo.com/shop/${slug}` },
              { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://steersolo.com/shop/${slug}/product/${product.id}` }
            ]
          }
        ])}
      </script>
    </Helmet>
  ) : null;

  const loadProductData = async () => {
    try {
      if (!slug || !productId) return;

      // Load shop data
      const shopResponse = await shopService.getShopBySlug(slug);
      if (!shopResponse.success || !shopResponse.data) {
        toast({
          title: "Shop Not Found",
          description: "This shop doesn't exist",
          variant: "destructive",
        });
        navigate("/shops");
        return;
      }
      setShop(shopResponse.data);

      // Load product data
      const productResponse = await productService.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        toast({
          title: "Product Unavailable",
          description: "This product is no longer available from this shop.",
          variant: "destructive",
        });
        navigate(`/shop/${slug}`);
        return;
      }

      if (productResponse.data.shopId !== shopResponse.data.id || !productResponse.data.is_available) {
        toast({
          title: "Product Unavailable",
          description: "This product is currently unavailable. Please browse other items from this shop.",
          variant: "destructive",
        });
        navigate(`/shop/${slug}`);
        return;
      }

      setProduct(productResponse.data);

      // Load related products
      const relatedResponse = await productService.getProducts({ 
        shopId: shopResponse.data.id,
        limit: 4 
      });
      if (relatedResponse.success) {
        setRelatedProducts(relatedResponse.data.filter(p => p.id !== productId));
      }

      // Load reviews with verification data
      try {
        const reviewResponse = await reviewService.getProductReviews(productId);
        if (reviewResponse.success) {
          setReviews(reviewResponse.data as unknown as Review[]);
        }
      } catch (e) {
        console.error("Failed to load reviews:", e);
      }

    } catch {
      toast({
        title: "Product Unavailable",
        description: "This product is no longer available. Please browse other items from this shop.",
        variant: "destructive",
      });
      if (slug) navigate(`/shop/${slug}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!shop?.id || !product) return;

    const cartKey = getCartKey(shop.id);
    const cartProduct = normalizeProductForCart(product);
    const existingCart = parseStoredCart(localStorage.getItem(cartKey)).filter(isStoredCartItem);
    const existingItem = existingCart.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.product = cartProduct;
      existingItem.quantity = clampCartQuantity(existingItem.quantity + quantity, cartProduct.stock_quantity);
    } else {
      existingCart.push({
        product: cartProduct,
        quantity: clampCartQuantity(quantity, cartProduct.stock_quantity),
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    
    toast({
      title: "Added to Cart! 🛒",
      description: `${quantity} x ${product.name} added`,
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate(`/shop/${slug}?cart=open`)}>
          View Cart
        </Button>
      ),
    });
  };



  const handleShareProduct = async () => {
    if (!product || !slug) return;

    const sharePath = `/shop/${slug}/product/${product.id}`;
    const shareUrl = `${window.location.origin}${sharePath}?utm_source=product_share`;
    const shareData = {
      title: `${product.name} | ${shop?.name || "Shop"}`,
      text: `Check out ${product.name}${shop?.name ? ` from ${shop.name}` : ""} on SteerSolo`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Product shared",
          description: "Thanks for sharing this product!",
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      });
    } catch (error) {
      console.error("Failed to share product:", error);
      toast({
        title: "Unable to share",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!product || !shop || !shop.whatsapp_number) {
      toast({
        title: "Inquiry Unavailable",
        description: "This seller hasn't provided a WhatsApp number yet.",
        variant: "destructive"
      });
      return;
    }

    const shopName = shop.shop_name || shop.name || 'Shop';
    const productUrl = `${window.location.origin}/shop/${slug}/product/${product.id}`;
    const message = `Hi ${shopName}, I'm interested in "${product.name}" I saw on SteerSolo. Is it available? \n\nLink: ${productUrl}`;
    
    // Clean phone number: remove +, space, dash
    const cleanPhone = shop.whatsapp_number.replace(/[+\s-]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
      />
    ));
  };

  const scrollRelatedProducts = (direction: "left" | "right") => {
    if (!relatedScrollRef.current) return;
    const amount = Math.min(360, Math.round(relatedScrollRef.current.clientWidth * 0.9));
    relatedScrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product || !shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 pt-32 text-center">
          <Package className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">This product doesn't exist or is not available</p>
          <Link to="/shops">
            <Button className="bg-gradient-to-r from-accent to-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shops
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {productSeo}
      <Navbar />
      <ProductMediaLightbox
        isOpen={isMediaViewerOpen}
        onClose={() => setIsMediaViewerOpen(false)}
        imageUrl={product.image_url || product.images?.[0]?.url || null}
        videoUrl={product.video_url || null}
        posterUrl={product.images?.[0]?.url || null}
        alt={product.name}
      />

      <div className="flex-1 container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-24 sm:pb-16">
        {/* Breadcrumb — desktop only */}
        <div className="mb-6 hidden sm:flex items-center gap-2 text-sm">
          <Link to="/shops" className="text-muted-foreground hover:text-foreground transition-colors">
            Shops
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/shop/${slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
            {shop.name}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        {/* Back button */}
        <Link to={`/shop/${slug}`} className="inline-block mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-muted -ml-2 sm:ml-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="truncate max-w-[200px] sm:max-w-none">Back to {shop.name}</span>
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Product Media */}
          <div className="relative">
            {product.video_url ? (
              <button
                type="button"
                className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-muted text-left shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setIsMediaViewerOpen(true)}
                aria-label={`Open media viewer for ${product.name}`}
              >
                <video
                  src={product.video_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={product.images?.[0]?.url || undefined}
                  onError={(e) => {
                    console.error("Video failed to load:", product.video_url);
                    const target = e.target as HTMLVideoElement;
                    // If video fails completely and we have an image, we could fallback,
                    // but for now let's just ensure it doesn't show a black box if poster is available.
                    target.style.display = 'none'; // hide broken video
                    if (target.parentElement) {
                      target.parentElement.classList.add('fallback-to-poster');
                    }
                  }}
                />
                <style>{`
                  .fallback-to-poster {
                    background-image: url('${product.images?.[0]?.url || ''}');
                    background-size: cover;
                    background-position: center;
                  }
                `}</style>
                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/85 p-2 text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="h-5 w-5" />
                </span>
              </button>
            ) : product.images && product.images.length > 0 ? (
              <button
                type="button"
                className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-muted text-left shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setIsMediaViewerOpen(true)}
                aria-label={`Open image viewer for ${product.name}`}
              >
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/85 p-2 text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="h-5 w-5" />
                </span>
              </button>
            ) : (
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                <AdirePattern variant="geometric" className="text-primary" opacity={0.2} />
                {product.is_digital ? (
                  <Download className="w-24 h-24 text-muted-foreground relative z-10" />
                ) : product.type === "service" ? (
                  <Briefcase className="w-24 h-24 text-muted-foreground relative z-10" />
                ) : (
                  <Package className="w-24 h-24 text-muted-foreground relative z-10" />
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5 sm:space-y-6">
            {/* Shop Info */}
            <Link to={`/shop/${slug}`} className="inline-flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{shop.name}</p>
                <p className="text-xs text-muted-foreground">View all products</p>
              </div>
            </Link>

            {/* Product Name & Rating */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">{product.name}</h1>
                {product.is_digital && (
                  <Badge className="w-fit bg-purple-600/90 text-white border-none py-1.5 px-3">
                    <Download className="w-3 h-3 mr-1.5" /> Digital Product
                  </Badge>
                )}
              </div>
              <ProductRating
                rating={product.averageRating || 0}
                totalReviews={product.totalReviews || 0}
              />
            </div>

            {/* Self-Deletion Warning / Scarcity Badge (FOMO Indicator) */}
            {product.delete_at && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">Limited Time Listing</p>
                  <p className="text-xs font-semibold mt-0.5 leading-normal">
                    This offering is scheduled to automatically delete on{" "}
                    <span className="font-bold underline">
                      {format(new Date(product.delete_at), "eeee, MMMM dd 'at' hh:mm a")}
                    </span>
                    . Secure it now before it's gone permanently!
                  </p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg sm:text-2xl text-muted-foreground line-through">₦{product.comparePrice.toLocaleString()}</span>
              )}
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text break-all">₦{product.price.toLocaleString()}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <Badge variant="destructive">
                  -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Badge>
              )}
              {product.is_digital ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Download className="w-3 h-3 mr-1" /> Instant Access
                </Badge>
              ) : (
                <Badge
                  variant={product.inventory > 0 ? "default" : "destructive"}
                  className={product.inventory > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}
                >
                  {product.inventory > 0 ? `${product.inventory} ${product.stockUnit || "units"} in stock` : "Out of stock"}
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inventory > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                      disabled={quantity >= product.inventory}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Max: {product.inventory} {product.stockUnit || "units"}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart + secondary actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                size="lg"
                className="w-full sm:flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="truncate">Add to Cart · ₦{(product.price * quantity).toLocaleString()}</span>
              </Button>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 sm:flex-initial border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handleWhatsAppInquiry}
                >
                  <MessageSquare className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Inquire</span>
                  <span className="sm:hidden ml-2">Inquire</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  onClick={handleShareProduct}
                  aria-label={`Share ${product.name}`}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <WishlistButton productId={product.id} size="sm" className="h-12 w-12 flex-shrink-0" />
              </div>
            </div>

            {/* Trust Banner */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 py-4 border-y border-border/50">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">Verified Seller</span>
              </div>
              {product.is_digital ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Download className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">Instant Download</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">Fast Delivery</span>
                </div>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <Star className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">Top Rated</span>
              </div>
            </div>

            {/* Review Form */}
            <div className="pt-4 flex justify-center sm:justify-start">
              <ProductReviewForm
                productId={product.id}
                productName={product.name}
                onReviewSubmitted={loadProductData}
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 text-center sm:text-left">
            <MessageSquare className="w-5 h-5 text-accent self-center sm:self-auto" />
            <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
            <Badge variant="outline" className="sm:ml-2 self-center sm:self-auto">
              {product.totalReviews || 0} reviews
            </Badge>
          </div>

          {reviews.length === 0 ? (
            <Card className="card-african">
              <CardContent className="py-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to review this product!</p>
                <div className="mx-auto max-w-xs">
                  <ProductReviewForm
                    productId={product.id}
                    productName={product.name}
                    onReviewSubmitted={loadProductData}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <Card key={review.id} className="card-african">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                          {(review.customer_name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <CardTitle className="text-sm font-medium">
                              {review.customer_name || "Anonymous"}
                            </CardTitle>
                            {review.reviewer?.kyc_level != null && review.reviewer.kyc_level >= 2 && (
                              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs px-1.5 py-0">
                                <BadgeCheck className="w-3 h-3 mr-0.5" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">More from {shop.name}</h2>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => scrollRelatedProducts("left")}
                  aria-label="Scroll related products left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => scrollRelatedProducts("right")}
                  aria-label="Scroll related products right"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div
              ref={relatedScrollRef}
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth"
            >
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  to={`/shop/${slug}/product/${relProduct.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="min-w-[70%] sm:min-w-[48%] lg:min-w-[30%] xl:min-w-[24%] snap-start"
                >
                  <Card className="card-african h-full overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
                    {relProduct.images && relProduct.images.length > 0 ? (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={relProduct.images[0].url}
                          alt={relProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        {relProduct.is_digital ? (
                          <Download className="w-12 h-12 text-muted-foreground" />
                        ) : relProduct.type === 'service' ? (
                          <Briefcase className="w-12 h-12 text-muted-foreground" />
                        ) : (
                          <Package className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-1">{relProduct.name}</h3>
                      <p className="text-lg font-bold gradient-text">₦{relProduct.price.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
