'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase';

interface LogoFeedbackFormProps {
    creatorName: string;
    onSubmit: (rating: number, comment: string, isAnonymous: boolean) => Promise<void>;
}

export function LogoFeedbackForm({ creatorName, onSubmit }: LogoFeedbackFormProps) {
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleSubmit = async (asAnonymous: boolean) => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await onSubmit(rating, comment, asAnonymous);
            // Reset form
            setRating(0);
            setComment('');
            setShowLoginPrompt(false);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClick = () => {
        if (!user && !showLoginPrompt) {
            setShowLoginPrompt(true);
        } else if (user) {
            handleSubmit(false);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2 text-center">
                {creatorName} wants to know what you thought of this logo!
            </h3>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 my-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Comment Input */}
            <Textarea
                placeholder="Share your thoughts about this logo... (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
                rows={4}
            />

            {/* Submit Buttons */}
            {!showLoginPrompt ? (
                <Button
                    onClick={handleSubmitClick}
                    disabled={rating === 0 || isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? 'Submitting...' : user ? 'Submit Feedback' : 'Submit'}
                </Button>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Would you like to sign in to publish your feedback with your name, or submit anonymously?
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Submit Anonymously
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/login'}
                            className="flex-1"
                        >
                            Sign In to Submit
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
