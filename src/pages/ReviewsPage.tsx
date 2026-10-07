import React, { useEffect, useState } from 'react';
import { Review } from '../types/bakery';
import { bakeryStore } from '../lib/bakeryStore';
import { Star, MessageSquarePlus, CheckCircle2, Quote, X } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // New review form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await bakeryStore.getReviews(true);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    const unsub = bakeryStore.subscribe(() => {
      loadReviews();
    });
    return unsub;
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;

    try {
      setSubmitting(true);
      await bakeryStore.saveReview({
        customer_name: name.trim(),
        location: location.trim() || 'Nigeria',
        rating,
        review_text: reviewText.trim(),
        approved: false, // Must be approved by admin
      });
      setSubmittedMessage(true);
      setName('');
      setLocation('');
      setRating(5);
      setReviewText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
          Customer Stories
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1A12] leading-tight">
          What Nigerians Say About Esteria Bakery
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          From Sunday family breakfasts to 500-guest wedding receptions, see how our pastries and cakes light up celebrations across Nigeria.
        </p>
      </div>

      {/* Rating Metric Card & Leave Review Button */}
      <div className="bg-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-950/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="text-center">
            <span className="font-serif text-5xl font-bold text-[#2D1A12] block">
              {averageRating}
            </span>
            <div className="flex items-center gap-1 text-amber-500 mt-1 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-stone-500 mt-0.5 block">
              Based on {reviews.length} verified reviews
            </span>
          </div>

          <div className="h-12 w-px bg-amber-950/10 hidden sm:block" />

          <div className="space-y-1 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Made Fresh to Order in Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Punctual Lagos &amp; Abuja Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Crispy Small Chops Guaranteed Hot</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSubmittedMessage(false);
            setModalOpen(true);
          }}
          className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-stone-500 font-serif">
          Our happy customers have more stories coming soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-amber-950/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-900/20 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-amber-200" />
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  "{rev.review_text}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-[#2D1A12]">
                  {rev.customer_name}
                </span>
                {rev.location && (
                  <span className="text-stone-500">{rev.location}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-950/10">
            <button
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D1A12]">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Your review has been submitted to Esteria Bakery. To keep reviews genuine, our admin team verifies each entry before it is published.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-4 py-2 px-6 bg-amber-500 text-[#2D1A12] font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2D1A12]">
                    Share Your Experience
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Tell us how your pastries or celebration cakes tasted!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                    Star Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-stone-500 ml-2 font-bold">{rating} Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ngozi Adebayo"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                    Your Location / City (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Ikeja, Lagos or Wuse 2, Abuja"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe the flavor, texture, delivery packaging, and experience..."
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
