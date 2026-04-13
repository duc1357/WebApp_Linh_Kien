import React, { useState, useEffect, useContext } from 'react';
import { Star, Send, ShieldCheck, AlertCircle, MessageSquare, ImagePlus, XCircle, Activity } from 'lucide-react';
import { AuthContext } from "../../context/AuthContext.jsx";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = React.useRef(null);
  
  const { user, isAuthenticated, token } = useContext(AuthContext);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để đánh giá');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          rating,
          comment,
          image: imageUrl
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Không thể gửi đánh giá');
      }

      setComment('');
      setRating(5);
      setImageUrl('');
      fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/user/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Ảnh quá lớn hoặc lỗi server.');
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      alert("Lỗi tải ảnh: " + err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  if (loading) return <div className="text-center p-4">Đang tải đánh giá...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-10 shadow-sm">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--color-brand)]" />
        Đánh Giá Sản Phẩm ({reviews.length})
      </h2>

      {/* Form đánh giá */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
          <h3 className="font-bold text-slate-700 mb-4">Gửi đánh giá của bạn</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-semibold text-slate-600">Chất lượng:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
                >
                  <Star className={`w-7 h-7 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[120px] mb-4 text-slate-700 resize-y"
            placeholder="Chia sẻ trải nghiệm của bạn về chất lượng sản phẩm, dịch vụ..."
          ></textarea>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg || submitting}
              className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center gap-2 border border-slate-200 transition-all shadow-sm disabled:opacity-50"
            >
              {uploadingImg ? <Activity className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              Đính kèm ảnh
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

            <button
              type="submit"
              disabled={submitting || uploadingImg}
              className="flex-1 px-6 py-3 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {submitting ? 'Đang gửi...' : <><Send className="w-4 h-4 -ml-1" /> Gửi Đánh Giá</>}
            </button>
          </div>
          
          {imageUrl && (
            <div className="mt-4 relative inline-block">
              <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm" />
              <button 
                type="button" 
                onClick={() => setImageUrl('')}
                className="absolute -top-2 -right-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-md"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-slate-600 mb-3 font-medium">Vui lòng đăng nhập để gửi đánh giá của bạn.</p>
          <a href="/login" className="inline-flex items-center gap-2 text-[var(--color-brand)] font-bold hover:underline">
            Đăng nhập ngay
          </a>
        </div>
      )}

      {/* Danh sách Đánh giá */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500 font-medium">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-lg">
                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      {review.user_name}
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3 h-3" /> Đã mua
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {new Date(review.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap ml-14">{review.comment}</p>
              {review.image && (
                <div className="ml-14 mt-3">
                  <img src={review.image} alt="User Review" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(review.image, '_blank')} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
