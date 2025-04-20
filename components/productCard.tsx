"use client";
import { ProductType } from "@/app/type";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Star, ShoppingCart } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useSession } from "next-auth/react";
import { BASE_URL } from "./useBackendUrl";

function ProductCard({ product }: { product: ProductType }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < Math.floor(rating); i++) {
      stars.push(
        <Star
          key={`filled-${i}`}
          className="text-yellow-400 fill-yellow-400 w-4 h-4"
        />
      );
    }

    if (stars.length < 5) {
      for (let i = 0; i < 5 - Math.floor(rating); i++) {
        stars.push(
          <Star key={`unfilled-${i}`} className="text-gray-300 w-4 h-4" />
        );
      }
    }

    return stars;
  };

  const addToCart = async () => {
    try {
      if (!user?.id) {
        router.push("/login");
        return;
      }
      const response = await fetch(
        `${BASE_URL}cart/${product._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            quantity: 1,
          }),
        }
      );

      const responseJson = await response.json();
      if (responseJson.success) {
        router.push("/cart");
      } else {
        console.error(responseJson);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const calculateDiscountedPrice = (
    price: number,
    discountPercentage: number
  ) => {
    if (discountPercentage <= 0)
      return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return (price - (price * discountPercentage) / 100).toLocaleString(
      undefined,
      { maximumFractionDigits: 2 }
    );
  };

  return (
    <Card className="max-w-sm w-full group">
      <CardContent className="relative mt-4">
        {/* Image Container */}
        <div className="overflow-hidden h-72 relative rounded-lg">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            priority
            className="object-contain h-64 group-hover:h-72 w-full transition-all duration-300 ease-in-out group-hover:scale-110 my-4 rounded-lg"
          />

          {/* Quick Add Button - Appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={addToCart}
              className="bg-white text-indigo-600 p-3 rounded-full shadow-md hover:bg-indigo-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          onClick={() => router.push(`/product/${product._id}`)}
          className="cursor-pointer Fbg-white shadow-lg rounded-xl w-full p-3 transition-all duration-300 
          hover:shadow-xl group-hover:translate-y-2 ease-out border border-gray-100">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-800 mb-2">
            {product.title}
          </h3>
          <div className="flex justify-between items-center">
            <p
              className="text-base font-bold text-indigo-600 transition-colors duration-200 
            group-hover:text-indigo-800">
              ₹
              {calculateDiscountedPrice(
                product.price,
                product.discountPercentage
              )}
            </p>
            <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full">
              {renderStars(product.rating.rate)}
              <span className="text-xs font-medium text-gray-600 ml-0.5">
                ({product.rating.count})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
