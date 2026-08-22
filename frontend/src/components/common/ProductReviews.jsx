import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { 
  Star, Send, ShieldCheck, AlertCircle, MessageSquare, 
  ImagePlus, XCircle, Activity, Sparkles, Filter, CheckCircle, 
  ThumbsUp, Camera, X, ChevronRight, User
} from 'lucide-react';
import { AuthContext } from "../../context/AuthContext.jsx";
import api, { getImageUrl } from "../../api/axios";
import { Link, useLocation } from 'react-router-dom';

const RATING_LABELS = {
  1: '⭐ Rất không hài lòng',
  2: '⭐⭐ Chưa hài lòng',
  3: '⭐⭐⭐ Tạm ổn / Bình thường',
  4: '⭐⭐⭐⭐ Hài lòng, chất lượng tốt',
  5: '⭐⭐⭐⭐⭐ Tuyệt vời! Cực kỳ hài lòng'
};

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter state: 'all' | 5 | 4 | 3 | 2 | 1 | 'has_image'
  const [filterStar, setFilterStar] = useState('all');

  // Image Upload state
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

  // Lightbox Modal state for viewing images full size
  const [previewModalImg, setPreviewModalImg] = useState(null);
  
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg('');

    try {
      await api.post(`/products/${productId}/reviews`, {
        product_id: parseInt(productId),
        rating,
        comment: comment.trim(),
        image: imageUrl || null
      });

      setComment('');
      setRating(5);
      setImageUrl('');
      setSuccessMsg('Cảm ơn bạn! Đánh giá đã được đăng thành công.');
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Đã gửi đánh giá sản phẩm thành công!' }));
      await fetchReviews();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)");
      return;
    }

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/user/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.url);
    } catch (err) {
      alert("Lỗi tải ảnh lên: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingImg(false);
    }
  };

  // Calculations for review stats
  const totalReviews = reviews.length;
  const avgRating = useMemo(() => {
    if (totalReviews === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / totalReviews).toFixed(1);
  }, [reviews, totalReviews]);

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, with_image: 0 };
    reviews.forEach(r => {
      const score = Math.max(1, Math.min(5, r.rating || 5));
      counts[score] = (counts[score] || 0) + 1;
      if (r.image) counts.with_image += 1;
    });
    return counts;
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (filterStar === 'all') return reviews;
    if (filterStar === 'has_image') return reviews.filter(r => Boolean(r.image));
    return reviews.filter(r => r.rating === filterStar);
  }, [reviews, filterStar]);

  return (
    <div className="mt-16 space-y-8 animate-in fade-in duration-500">
      {/* Lightbox Modal for Zooming Review Images */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-950 border border-glass rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-glass transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={getImageUrl(previewModalImg)} 
              alt="Review Fullsize" 
              className="max-h-[80vh] w-auto object-contain rounded-xl mx-auto shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* Main Review Container */}
      <div className="bg-slate-900/40 border border-glass rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-900/20 to-slate-950/60">
        {/* Background glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-glass pb-6 mb-8 relative z-10">
          <div>
            <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
              Khách hàng phản hồi
            </span>
            <h2 className="text-xl md:text-2xl font-heading font-black text-slate-100 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-orange-500 text-glow-orange" />
              ĐÁNH GIÁ TỪ NGƯỜI DÙNG
            </h2>
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-2 bg-slate-950/60 border border-glass px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            <span>Tổng cộng:</span>
            <strong className="text-white font-heading font-black text-sm text-glow-orange">{totalReviews}</strong> đánh giá
          </div>
        </div>

        {/* TOP STATS & RATING BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950/60 border border-glass rounded-2xl p-6 mb-8 shadow-inner relative z-10">
          {/* Big Score */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-glass">
            <div className="text-4xl md:text-5xl font-heading font-black text-white text-glow-orange tracking-tight">
              {avgRating} <span className="text-2xl text-slate-500 font-sans font-bold">/ 5</span>
            </div>
            <div className="flex items-center gap-1 my-2.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Dựa trên <strong className="text-slate-200">{totalReviews}</strong> lượt đánh giá thực tế
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="lg:col-span-8 space-y-2 px-2 sm:px-4">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = starCounts[s] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isSelected = filterStar === s;

              return (
                <div 
                  key={s} 
                  onClick={() => setFilterStar(isSelected ? 'all' : s)}
                  className={`flex items-center gap-3 text-xs font-semibold py-1 px-2 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="w-10 text-slate-300 flex items-center gap-1 font-bold">
                    {s} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-glass">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-[11px] text-slate-400 font-mono">
                    {count} ({Math.round(percent)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTER CHIPS */}
        <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-glass relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5 text-orange-500" /> Lọc theo:
          </div>

          <button
            onClick={() => setFilterStar('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filterStar === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/40 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 border-glass hover:text-white hover:bg-slate-800'
            }`}
          >
            Tất cả ({totalReviews})
          </button>

          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStar(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                filterStar === s
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/40 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border-glass hover:text-white hover:bg-slate-800'
              }`}
            >
              {s} <Star className="w-3 h-3 fill-current text-amber-400" /> ({starCounts[s] || 0})
            </button>
          ))}

          {starCounts.with_image > 0 && (
            <button
              onClick={() => setFilterStar('has_image')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                filterStar === 'has_image'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400/40 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border-glass hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Có hình ảnh ({starCounts.with_image})
            </button>
          )}
        </div>

        {/* FORM GỬI ĐÁNH GIÁ */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mb-10 p-6 bg-slate-950/80 border border-glass rounded-2xl shadow-xl relative z-10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-glass">
              <h3 className="font-heading font-black text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Gửi Đánh Giá Của Bạn
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Đăng bởi: <strong className="text-orange-400 font-bold">{user?.full_name || 'Quý khách'}</strong>
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5 font-semibold">
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Interactive Rating Stars Picker */}
            <div className="mb-5 bg-slate-900/60 p-4 rounded-xl border border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">Đánh giá chung:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star 
                          className={`w-7 h-7 transition-colors ${
                            active 
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                              : 'text-slate-600 hover:text-amber-200'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className="text-xs font-bold text-orange-400 italic">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>

            {/* Comment Box */}
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                className="w-full p-4 bg-slate-900 border border-glass rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-200 text-xs font-medium placeholder:text-slate-500 outline-none transition-all resize-y min-h-[100px]"
                placeholder="Chia sẻ cảm nhận chi tiết về hiệu năng, thiết kế, độ ổn định hoặc trải nghiệm đóng gói vận chuyển..."
              />
            </div>

            {/* Actions: Image upload & Submit */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg || submitting}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl flex items-center gap-2 border border-glass transition-all text-xs disabled:opacity-50 cursor-pointer"
                >
                  {uploadingImg ? <Activity className="w-4 h-4 animate-spin text-orange-500" /> : <ImagePlus className="w-4 h-4 text-orange-500" />}
                  {imageUrl ? 'Đổi ảnh đính kèm' : 'Thêm ảnh thực tế'}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />

                {imageUrl && (
                  <div className="relative inline-block">
                    <img 
                      src={getImageUrl(imageUrl)} 
                      alt="Preview" 
                      onClick={() => setPreviewModalImg(imageUrl)}
                      className="w-10 h-10 object-contain bg-slate-900 rounded-lg border border-glass cursor-pointer hover:scale-105 transition-transform" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-md transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingImg || !comment.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-glass border border-transparent cursor-pointer text-xs uppercase tracking-wider"
              >
                {submitting ? (
                  <><Activity className="w-4 h-4 animate-spin" /> Đang gửi đánh giá...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Gửi Đánh Giá Ngay</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-10 p-6 bg-slate-950/80 border border-glass rounded-2xl text-center space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto text-orange-500">
              <User className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-black text-slate-200 text-sm">Bạn đã mua sản phẩm này?</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              Vui lòng đăng nhập tài khoản mua hàng để để lại nhận xét và chia sẻ đánh giá trải nghiệm thực tế với cộng đồng.
            </p>
            <Link 
              to="/login" 
              state={{ from: location }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              Đăng Nhập Để Đánh Giá <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* DANH SÁCH ĐÁNH GIÁ (REVIEWS LIST) */}
        <div className="space-y-4 relative z-10">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-28 bg-slate-950/40 border border-glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-glass text-slate-500">
              <MessageSquare className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p className="font-semibold text-sm text-slate-400">
                {filterStar === 'all' 
                  ? "Chưa có đánh giá nào cho sản phẩm này." 
                  : `Không có đánh giá nào phù hợp với bộ lọc hiện tại.`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {filterStar === 'all' 
                  ? "Hãy là người đầu tiên trải nghiệm và để lại nhận xét hữu ích nhé!" 
                  : "Thử chọn xem tất cả các mức sao khác."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className="p-5 bg-slate-950/60 border border-glass rounded-2xl shadow-md hover:border-orange-500/20 transition-all group"
              >
                {/* Header review */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-heading font-black text-sm shadow-inner shrink-0">
                      {review.user_name?.[0]?.toUpperCase() || 'K'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-100 text-xs group-hover:text-orange-400 transition-colors">
                          {review.user_name}
                        </span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                          <ShieldCheck className="w-3 h-3" /> Đã mua hàng
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {review.created_at || 'Gần đây'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5 text-amber-400 shrink-0 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-glass">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap pl-13">
                  {review.comment}
                </p>

                {/* Attached Image */}
                {review.image && (
                  <div className="pl-13 mt-3.5">
                    <div 
                      onClick={() => setPreviewModalImg(review.image)}
                      className="inline-block relative group/img cursor-pointer"
                    >
                      <img 
                        src={getImageUrl(review.image)} 
                        alt="Đánh giá từ khách hàng" 
                        className="w-24 h-24 object-contain bg-slate-900 rounded-xl border border-glass shadow-md group-hover/img:scale-105 group-hover/img:border-orange-500/40 transition-all p-1" 
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                        <span className="text-[9px] bg-white text-slate-900 font-bold px-1.5 py-0.5 rounded">Xem ảnh</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

