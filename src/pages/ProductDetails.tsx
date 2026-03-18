import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package, Minus, Plus, MessageSquare, BadgeCheck } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { ProductRating } from "@/components/ProductRating";
import { ProductReviewForm } from "@/components/ProductReviewForm";
import { format } from "date-fns";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import reviewService from "@/services/review.service";
import { Shop, Product } from "@/types/api";
import { handleApiError } from "@/lib/api-error-handler";

// Types from @/types/api used instead
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

  useEffect(() => {
    loadProductData();
  }, [slug, productId]);

  // SEO: Inject meta tags and Product JSON-LD
  useEffect(() => {
    if (!product || !shop) return;
    const shopUrl = `https://steersolo.com/shop/${slug}`;
    const productUrl = `${shopUrl}/product/${product.id}`;
    const imageUrl = product.image_url || (product.images?.[0]?.url) || '';
    const shopName = shop.shop_name || shop.name || 'Shop';
    const desc = product.description || `${product.name} available at ${shopName} on SteerSolo`;

    document.title = `${product.name} | ${shopName} | SteerSolo`;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', desc);
    setMeta('name', 'robots', 'index, follow');
    setMeta('property', 'og:title', `${product.name} - ${shopName}`);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', productUrl);
    setMeta('property', 'og:type', 'product');
    setMeta('property', 'og:site_name', 'SteerSolo');
    if (imageUrl) { setMeta('property', 'og:image', imageUrl); setMeta('name', 'twitter:image', imageUrl); }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', `${product.name} - ${shopName}`);
    setMeta('name', 'twitter:description', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = productUrl;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": desc,
      "image": imageUrl || undefined,
      "url": productUrl,
      "brand": { "@type": "Brand", "name": shopName },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "NGN",
        "availability": (product.inventory || product.is_available) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": { "@type": "Organization", "name": shopName, "url": shopUrl }
      },
      ...((product.averageRating || product.totalReviews) && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.averageRating,
          "reviewCount": product.totalReviews
        }
      })
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.id = "product-jsonld";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("product-jsonld");
      if (el) el.remove();
    };
  }, [product, shop, slug]);

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
          title: "Product Not Found",
          description: "This product doesn't exist",
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

    } catch (error: any) {
      // Error already handled by services or handleApiError
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Store cart in localStorage and redirect to shop
    const cartKey = `cart_${shop?.id}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    
    const existingItem = existingCart.find((item: any) => item.product.id === product?.id);
    
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product?.inventory || 1);
    } else {
      existingCart.push({ product, quantity });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    
    toast({
      title: "Added to Cart! 🛒",
      description: `${quantity} x ${product?.name} added`,
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate(`/shop/${slug}`)}>
          View Cart
        </Button>
      ),
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
      />
    ));
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
      <Navbar />

      <div className="flex-1 container mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/shops" className="hover:text-foreground transition-colors">Shops</Link>
          <span>/</span>
          <Link to={`/shop/${slug}`} className="hover:text-foreground transition-colors">{shop.name}</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Product Media — Large */}
          <div>
            {product.video_url ? (
              <div className="aspect-[4/5] rounded-none overflow-hidden bg-muted">
                <video src={product.video_url} className="w-full h-full object-cover" controls autoPlay muted loop playsInline />
              </div>
            ) : product.images && product.images.length > 0 ? (
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-muted flex items-center justify-center">
                <Package className="w-20 h-20 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Product Info — Clean typography */}
          <div className="space-y-6 lg:py-4">
            {/* Shop link */}
            <Link to={`/shop/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <Store className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              {shop.name}
            </Link>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">{product.name}</h1>

            {/* Rating */}
            {(product.totalReviews || 0) > 0 && (
              <ProductRating rating={product.averageRating || 0} totalReviews={product.totalReviews || 0} />
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-foreground">₦{product.price.toLocaleString()}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₦{product.comparePrice.toLocaleString()}</span>
                  <span className="text-sm font-medium text-destructive">
                    Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className="text-sm text-muted-foreground">
              {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Quantity */}
            {product.inventory > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-none">
                  <Button variant="ghost" size="icon" className="rounded-none h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="rounded-none h-10 w-10" onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))} disabled={quantity >= product.inventory}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart — Full width */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 font-medium"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart — ₦{(product.price * quantity).toLocaleString()}
              </Button>
              <WishlistButton productId={product.id} size="sm" className="h-12 w-12 rounded-none border border-border" />
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16 border-t border-border pt-12">
          <h2 className="text-xl font-bold mb-6">Customer Reviews ({product.totalReviews || 0})</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mb-4">No reviews yet. Be the first!</p>
              <ProductReviewForm productId={product.id} productName={product.name} onReviewSubmitted={loadProductData} />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.customer_name || "Anonymous"}</span>
                        {review.reviewer?.kyc_level != null && review.reviewer.kyc_level >= 2 && (
                          <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">{renderStars(review.rating)}</div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
              <ProductReviewForm productId={product.id} productName={product.name} onReviewSubmitted={loadProductData} />
            </>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="text-xl font-bold mb-8">More from {shop.name}</h2>
            <div className="shopify-grid">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} to={`/shop/${slug}/product/${relProduct.id}`}>
                  <div className="shopify-card group">
                    <div className="shopify-product-image">
                      {relProduct.images && relProduct.images.length > 0 ? (
                        <img src={relProduct.images[0].url} alt={relProduct.name} />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="pt-3 pb-1">
                      <h3 className="text-sm font-medium line-clamp-1">{relProduct.name}</h3>
                      <p className="text-sm font-semibold mt-1">₦{relProduct.price.toLocaleString()}</p>
                    </div>
                  </div>
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