import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  ChevronRight,
  MessageSquarePlus,
  AlertCircle
} from 'lucide-react';

interface ProductDetailsPageProps {
  productId: number;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigateToShop: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  onSelectProduct,
  onQuickView,
  onNavigateToShop
}) => {
  const { user } = useAuth();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('#111827');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review Form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setActiveImage(data.product.image);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-neutral-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Product not found</h2>
        <button
          onClick={onNavigateToShop}
          className="mt-4 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const galleryImages: string[] = product.gallery ? JSON.parse(product.gallery) : [product.image];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Noir Black', hex: '#111827' },
    { name: 'Crimson Rose', hex: '#e11d48' },
    { name: 'Royal Sapphire', hex: '#2563eb' },
    { name: 'Emerald Forest', hex: '#10b981' }
  ];

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment,
          user_name: user?.name || 'Verified Customer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess('Your review has been submitted successfully!');
        setReviews([
          {
            id: Date.now(),
            product_id: product.id,
            user_name: user?.name || 'Verified Customer',
            rating: reviewRating,
            comment: reviewComment,
            created_at: new Date().toISOString()
          },
          ...reviews
        ]);
        setReviewComment('');
        setTimeout(() => setReviewSuccess(null), 4000);
      }
    } catch {
      //
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <button onClick={onNavigateToShop} className="hover:text-neutral-800">Shop</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-500 capitalize">{product.category_name || 'Collection'}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery Images (5 Columns on Large) */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 shrink-0">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeImage === img ? 'border-rose-600 ring-2 ring-rose-200' : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Stage Image */}
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-md relative group">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/img/product-img/product-1.jpg';
              }}
            />

            {product.is_featured === 1 && (
              <span className="absolute top-4 left-4 bg-neutral-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                Featured Edition
              </span>
            )}
          </div>
        </div>

        {/* Right Details Info (6 Columns on Large) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
              <span>{product.brand_name || 'Essence Premium'}</span>
              <span className="font-mono text-neutral-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-serif text-neutral-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-neutral-400">&bull; {product.review_count} Verified Customer Reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-baseline gap-4">
            <span className="text-3xl font-black text-neutral-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-base text-neutral-400 line-through">
                ₹{product.old_price.toLocaleString('en-IN')}
              </span>
            )}
            {product.old_price && product.old_price > product.price && (
              <span className="text-xs font-bold text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-full">
                Save ₹{(product.old_price - product.price).toLocaleString('en-IN')} ({Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF)
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-800">
              <span>Select Size</span>
              <span className="text-neutral-400 font-normal hover:text-neutral-700 cursor-pointer">Size Guide</span>
            </div>
            <div className="flex gap-2.5">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-12 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    selectedSize === sz
                      ? 'bg-neutral-900 text-white shadow-md ring-2 ring-neutral-900'
                      : 'border border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-neutral-800">Color Palette</span>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                    selectedColor === c.hex ? 'ring-2 ring-rose-500 ring-offset-2 scale-110 shadow-sm' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Inventory Status */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-neutral-500 hover:text-neutral-900 font-bold"
              >
                -
              </button>
              <span className="px-3.5 text-xs font-bold text-neutral-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-neutral-500 hover:text-neutral-900 font-bold"
              >
                +
              </button>
            </div>

            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              In Stock &bull; {product.stock_quantity} pieces ready to ship
            </span>
          </div>

          {/* Main Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => addToCart(product, quantity, selectedSize, selectedColor)}
              className="flex-1 py-4 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Shopping Bag</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-4 rounded-xl border transition-all ${
                isSaved
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-neutral-200 text-neutral-600 hover:text-rose-600 hover:bg-neutral-50'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Delivery & Assurance Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-[11px] text-neutral-600 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-400" />
              <span>Complimentary Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Razorpay Transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-neutral-400" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-neutral-400" />
              <span>100% Cotton &amp; Eco-certified Materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content Tabs (Description, Specifications, Customer Reviews) */}
      <section className="border-t border-neutral-200 pt-10">
        <div className="flex border-b border-neutral-200 space-x-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'desc'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Description &amp; Details
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Materials &amp; Care
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'reviews'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed space-y-4">
              <p>{product.description}</p>
              <p>
                Each piece in the Essence collection undergoes bespoke dye-bath finishing to guarantee color depth that resists sun fading and wash cycles. Designed with precision proportions to move effortlessly with the wearer from day meetings to dusk soirees.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-xs">
              <div className="flex justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-500 font-medium">Composition</span>
                <span className="font-semibold text-neutral-900">{product.material || 'Organic Blend'}</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-500 font-medium">Country of Origin</span>
                <span className="font-semibold text-neutral-900">Portugal &amp; India Atelier</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-500 font-medium">Care Guidelines</span>
                <span className="font-semibold text-neutral-900">Machine wash delicate cold, line dry</span>
              </div>
              <div className="flex justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-500 font-medium">Fit &amp; Sizing</span>
                <span className="font-semibold text-neutral-900">True to European standard sizing</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Write Review Form */}
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 max-w-xl">
                <h3 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-rose-600" />
                  <span>Write a Customer Review</span>
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Share your experience with fit, comfort, and fabric quality.
                </p>

                {reviewSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                    {reviewSuccess}
                  </div>
                )}

                <form onSubmit={handleAddReview} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Star Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="The fabric feels wonderful, fits perfectly..."
                      className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 max-w-2xl">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white rounded-xl border border-neutral-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800">{rev.user_name}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-neutral-400 block">{rev.created_at}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <section className="pt-6">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">You May Also Adore</span>
            <h2 className="text-2xl font-bold font-serif text-neutral-900 mt-1">Complete The Look</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onSelectProduct={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
