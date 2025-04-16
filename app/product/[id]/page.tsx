"use client";

import { ProductType } from "@/app/type";
import Loading from "@/components/loading";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Star,
  ShoppingCart,
  Heart,
  TruckIcon,
  Share2,
  Check,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSession } from "next-auth/react";
import ReviewSubmit from "@/components/reviewSubmit";
import { useRouter } from "nextjs-toploader/app";
import toast from "react-hot-toast";

function ProductDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState<
    {
      date: string;
      _id: string;
      review: string;
      reviewerName: string;
      createdAt: string;
      reviewerEmail: string;
      isVerified: boolean;
      rating: number;
    }[]
  >([]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8000/products/${params.id}?sentry_data=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const responseJson = await response.json();

      if (responseJson.success) {
        setProduct(responseJson.data);
        if (responseJson.data.reviews.length > 0) {
          setReviews(responseJson.data.reviews);
        }
      }else{
        toast.error(responseJson.message);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Something went wrong");
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    if (product && product.reviews.length == 0) {
      createReview();
    }
  }, [product]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const calculateDiscountedPrice = (
    price: number,
    discountPercentage: number
  ) => {
    if (discountPercentage <= 0) return price;
    return (price - (price * discountPercentage) / 100).toLocaleString(
      undefined,
      {  maximumFractionDigits: 2 }
    );
  };

  const createReview = async () => {
    try {
      setIsLoading(true);
      const genAI = new GoogleGenerativeAI(
        "AIzaSyAXbPfySMNVUPVz4OOp6OAgGvleY7TeNV4"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `You are a product review generator. Generate a review for the product with the following details: 
      title : ${product?.title}
      description : ${product?.description}
      global rating : ${product?.rating.rate}
      category : ${product?.category}
      brand : ${product?.brand}

      use this product detail and create the review with the following format:
      [
        {
          _id : "unique_id",
          reviewerName : "random name",
          createdAt : "random date in the past (Iso format)",
          review : "review text",
          rating : 4.5,
        },
        9 more reviews with different rating and review text.
      ]

      additional instructions:
      - try to add reply to the review.
      -add Positive,Neutral,Negative sentiment in the review. 
      - try detailed review.
      `;

      // Generate content using the model
      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the generated JSON and update form data
      let json = JSON.parse(text.replace(/```json|```/g, ""));
      if (json.length > 0) {
        const res = await fetch(
          `http://localhost:8000/reviews/generated/${params.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reviews: json,
            }),
          }
        );

        const resJson = await res.json();
        if (resJson.success) {
          setReviews(json);
        } else {
          console.log(resJson.message);
        }
      }
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  if (status === "loading") {
    return <Loading />;
  }

  const addToCart = async () => {
    try {
      if(product === null) return;
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:8000/cart/${product._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
            quantity: 1,
          }),
        }
      );

      const responseJson = await response.json();
      if (responseJson.success) {
        router.push("/cart");
      } else {
        toast.error(responseJson.message);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Something went wrong");
      console.error(error);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] h-full bg-gray-50 pt-8">
      {isLoading ? (
        <Loading />
      ) : product === null ? (
        <div className="h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Product not found</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Product Overview Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 bg-white p-8 flex items-center justify-center">
                <div className="relative group">
                  <Image
                    className="object-contain rounded-xl max-h-96 w-auto transition-transform duration-300 group-hover:scale-105"
                    src={product.image}
                    alt={product.title}
                    width={500}
                    height={500}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="ml-2 text-sm font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>

                <div className="flex items-center mt-1 mb-4">
                  <div className="flex mr-2">
                    {renderStars(product.rating.rate)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating.rate} ({product.rating.count} reviews)
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    {product.discountPercentage > 0 ? (
                      <>
                        <span className="text-3xl font-bold text-gray-900">
                          ₹
                          {calculateDiscountedPrice(
                            product.price,
                            product.discountPercentage
                          )}
                        </span>
                        <span className="ml-2 text-lg text-gray-400 line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-md">
                          {product.discountPercentage}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">
                  {product.description}
                </p>

                <div className="flex items-center mb-6">
                  <TruckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Free shipping on orders over 500/-
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center mb-6">
                  <span className="text-gray-700 mr-3">Quantity:</span>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      -
                    </button>
                    <span className="px-4 py-1 flex items-center justify-center font-medium">
                      {quantity}
                    </span>
                    <button
                      className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity(quantity + 1)}>
                      +
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-500">
                    {product.weight && `Weight: ${product.weight}g per item`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-auto">
                  <button className="flex-1 bg-black text-white px-6 py-3 rounded-md font-medium flex items-center justify-center hover:bg-gray-800 transition-colors"
                    onClick={addToCart}
                    disabled={!session?.user?.id}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm  mb-8">
            {/* Additional Information Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "description"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("description")}>
                  Description
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "specifications"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("specifications")}>
                  Specifications
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "reviews"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("reviews")}>
                  Reviews ({reviews.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Product Details
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-500">Brand</span>
                        <span className="font-medium">
                          {product.brand || "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium capitalize">
                          {product.category}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Weight</span>
                        <span className="font-medium">
                          {product.weight ? `${product.weight}g` : "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Product ID</span>
                        <span className="font-medium">{product._id}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Additional Info
                    </h3>
                    <ul className="space-y-2">
                      {product.tags && product.tags.length > 0 ? (
                        <li className="flex justify-between">
                          <span className="text-gray-500">Tags</span>
                          <span className="font-medium">
                            {product.tags.join(", ")}
                          </span>
                        </li>
                      ) : null}
                      <li className="flex justify-between">
                        <span className="text-gray-500">Added on</span>
                        <span className="font-medium">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Last updated</span>
                        <span className="font-medium">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {session?.user.id && <ReviewSubmit id={params.id} />}
                  {reviews.length > 0 && (
                    <div className="space-y-6">
                      {reviews.map((review, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="flex items-center mr-3">
                                <span className="font-medium text-gray-800">{review.reviewerName}</span>
                                {review.isVerified && (
                                  <span className="ml-1.5 flex items-center" title="Verified Purchase">
                                    <Check 
                                      className="h-3.5 w-3.5 text-white bg-blue-500 rounded-full p-0.5" 
                                    />
                                  </span>
                                )}
                              </div>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                review.createdAt || review.date
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-600">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
