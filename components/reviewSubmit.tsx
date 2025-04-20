import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { BASE_URL } from "./useBackendUrl";

function ReviewSubmit({ id }: { id: string }) {
  const { data: session } = useSession();
  const [rate, setRate] = React.useState(0);
  const [review, setReview] = React.useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (!session?.user?.email) return;
      const response = await fetch(`${BASE_URL}reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: session.user.name,
          reviewEmail: session.user.email,
          review,
          rating: rate,
          productId: id,
        }),
      });
      const responseData = await response.json();
      console.log(responseData);
      if (responseData.success) {
        console.log("Review submitted successfully:", responseData);
      } else {
        console.error("Error submitting review:", responseData.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }

    setRate(0);
    setReview("");
    router.refresh();
  };
  return (
    <div className="text-center">
      <p className="font-medium">
        Share your thoughts about this product! Your review will help others
        make better choices.
      </p>
      <div className="flex justify-center mt-4 border-b border-gray-200 mb-4 pb-4">
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 ">
              Write a Review
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-4">
                Share Your Review
              </DialogTitle>
              <DialogDescription>
                <textarea
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Write your review here..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}></textarea>
                <div className="flex items-center mt-6">
                  <span className="text-gray-600 font-medium mr-4">
                    Rate this product:
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        onClick={() => setRate(index + 1)}
                        className={`${
                          index < rate
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        } cursor-pointer transition-colors duration-200 w-7 h-7`}
                      />
                    ))}
                  </div>
                </div>
              </DialogDescription>
              <DialogFooter className="mt-6 flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 "
                  onClick={handleSubmit}>
                  Submit Review
                </button>
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 "
                  onClick={() => {
                    setRate(0);
                    setReview("");
                  }}>
                  Cancel
                </button>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ReviewSubmit;
