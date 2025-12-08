import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package, Minus, Plus, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { ProductRating } from "@/components/ProductRating";
import { ProductReviewForm } from "@/components/ProductReviewForm";
import { format } from "date-fns";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  logo_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
  average_rating: number;
  total_reviews: number;
  shop_id: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  created_at: string;
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

  const loadProductData = async () => {
    try {
      // Load shop data
      const { data: shopData, error: shopError } = await supabase
        .from("shops_public")
        .select("id, shop_name, shop_slug, logo_url")
        .eq("shop_slug", slug)
        .single();

      if (shopError) throw shopError;
      if (!shopData) {
        toast({
          title: "Shop Not Found",
          description: "This shop doesn't exist",
          variant: "destructive",
        });
        navigate("/shops");
        return;
      }

      setShop(shopData);

      // Load product data
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("shop_id", shopData.id)
        .single();

      if (productError || !productData) {
        toast({
          title: "Product Not Found",
          description: "This product doesn't exist",
          variant: "destructive",
        });
        navigate(`/shop/${slug}`);
        return;
      }

      setProduct(productData);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select("id, rating, comment, customer_name, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);

      // Load related products
      const { data: relatedData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("is_available", true)
        .neq("id", productId)
        .limit(4);

      setRelatedProducts(relatedData || []);
    } catch (error: any) {
      console.error("Error loading product:", error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
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
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product?.stock_quantity || 1);
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
            {shop.shop_name}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        {/* Back button */}
        <Link to={`/shop/${slug}`} className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {shop.shop_name}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative">
            {product.image_url ? (
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-xl">
                <img
                  src={product.image_url}
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
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{shop.shop_name}</p>
                <p className="text-xs text-muted-foreground">View all products</p>
              </div>
            </Link>

            {/* Product Name & Rating */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <ProductRating 
                rating={product.average_rating || 0} 
                totalReviews={product.total_reviews || 0}
              />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold gradient-text">₦{product.price.toLocaleString()}</span>
              <Badge 
                variant={product.stock_quantity > 0 ? "default" : "destructive"}
                className={product.stock_quantity > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}
              >
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
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
            {product.stock_quantity > 0 && (
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
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Max: {product.stock_quantity}
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
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₦{(product.price * quantity).toLocaleString()}
              </Button>
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
              {product.total_reviews || 0} reviews
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
                          <CardTitle className="text-sm font-medium">
                            {review.customer_name || "Anonymous"}
                          </CardTitle>
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
            <h2 className="font-display text-2xl font-bold mb-6">More from {shop.shop_name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} to={`/shop/${slug}/product/${relProduct.id}`}>
                  <Card className="card-african overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
                    {relProduct.image_url ? (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={relProduct.image_url}
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