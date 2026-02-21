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
    const shopUrl = `https://steersolo.lovable.app/shop/${slug}`;
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

      <div className="flex-1 container mx-auto px-4 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
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
        <Link to={`/shop/${slug}`} className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {shop.name}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Media */}
          <div className="relative">
            {product.video_url ? (
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-xl">
                <video
                  src={product.video_url}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            ) : product.images && product.images.length > 0 ? (
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-xl">
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                <AdirePattern variant="geometric" className="text-primary" opacity={0.2} />
                <Package className="w-24 h-24 text-muted-foreground relative z-10" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
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
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <ProductRating 
                rating={product.averageRating || 0} 
                totalReviews={product.totalReviews || 0}
              />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold gradient-text">₦{product.price.toLocaleString()}</span>
              <Badge 
                variant={product.inventory > 0 ? "default" : "destructive"}
                className={product.inventory > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}
              >
                {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
              </Badge>
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
                    Max: {product.inventory}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₦{(product.price * quantity).toLocaleString()}
              </Button>
              <WishlistButton productId={product.id} size="sm" className="h-12 w-12" />
            </div>

            {/* Review Form */}
            <div className="pt-4">
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
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
            <Badge variant="outline" className="ml-2">
              {product.totalReviews || 0} reviews
            </Badge>
          </div>

          {reviews.length === 0 ? (
            <Card className="card-african">
              <CardContent className="py-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to review this product!</p>
                <ProductReviewForm
                  productId={product.id}
                  productName={product.name}
                  onReviewSubmitted={loadProductData}
                />
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
            <h2 className="font-display text-2xl font-bold mb-6">More from {shop.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} to={`/shop/${slug}/product/${relProduct.id}`}>
                  <Card className="card-african overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
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
                        <Package className="w-12 h-12 text-muted-foreground" />
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