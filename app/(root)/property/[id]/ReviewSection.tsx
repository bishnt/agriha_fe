"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, User } from "lucide-react";
import { Review } from "@/lib/types";
import { createReview } from "@/lib/server-actions";

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  propertyId: string;
}

export default function ReviewSection({ reviews, averageRating, propertyId }: ReviewSectionProps) {
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createReview({
        propertyId,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });

      if (result.success) {
        setNewReview({ rating: 0, comment: "" });
        setShowReviewForm(false);
        // TODO: Show success toast and refresh reviews
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive ? () => handleStarClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews & Ratings</CardTitle>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
          >
            Write Review
          </Button>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {showReviewForm && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-3">Write a Review</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(newReview.rating, true, "w-6 h-6")}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this property..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || newReview.rating === 0 || !newReview.comment.trim()}
                  className="bg-[#002B6D] hover:bg-[#002B6D]/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  onClick={() => setShowReviewForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating, false, "w-4 h-4")}
                      <span className="text-sm text-gray-600">
                        Account #{review.accountId}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet. Be the first to review this property!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
