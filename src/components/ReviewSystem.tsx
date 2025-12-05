import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Send } from "lucide-react";

interface Review {
  id: string;
  productId: string;
  buyerAddress: string;
  rating: number;
  comment: string;
  timestamp: number;
}

interface ReviewSystemProps {
  productId: string;
  productName: string;
}

const ReviewSystem = ({ productId, productName }: ReviewSystemProps) => {
  const { publicKey } = useWallet();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load reviews from localStorage
    const stored = localStorage.getItem(`reviews_${productId}`);
    if (stored) {
      setReviews(JSON.parse(stored));
    }
  }, [productId]);

  const handleSubmitReview = () => {
    if (!publicKey || !comment.trim()) {
      alert("Connect wallet and add a comment");
      return;
    }

    const newReview: Review = {
      id: `${productId}_${Date.now()}`,
      productId,
      buyerAddress: publicKey.toString(),
      rating,
      comment,
      timestamp: Date.now(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updated));
    
    setComment("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold gradient-text">{avgRating}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(parseFloat(avgRating as string))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Card>

      {/* Write Review */}
      {publicKey && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Leave a Review</h3>
          
          {/* Star Rating Selector */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHoveredRating(i)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(i)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    i <= (hoveredRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment Input */}
          <textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            rows={3}
          />

          <Button
            onClick={handleSubmitReview}
            className="w-full"
            disabled={!comment.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Post Review
          </Button>

          {submitted && (
            <p className="text-sm text-green-500 mt-2">✓ Review posted successfully!</p>
          )}
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No reviews yet. Be the first to review!
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i <= review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{review.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
              <p className="text-xs text-muted-foreground">
                by {review.buyerAddress.slice(0, 8)}...
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
