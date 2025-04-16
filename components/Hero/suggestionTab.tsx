"use client";
import { ProductType } from "@/app/type";
import useCategories from "@/components/context/category";
import Loading from "@/components/loading";
import React, { ReactNode } from "react";
import { FilterBar } from "./filterBar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import ProductCard from "@/components/productCard";
import { Button } from "../ui/button";

function SuggestionTab() {
  const router = useRouter();
  const [products, setProducts] = React.useState<ProductType[]>([]);
  const [filterProducts, setFilterProducts] = React.useState<ProductType[]>([]);
  const [filterCategory, setFilterCategory] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const { categories } = useCategories();

  const [priceRange, setPriceRange] = React.useState([0, 10000]);
  const [rating, setRating] = React.useState([2]);
  const [sort, setSort] = React.useState("High to Low");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/products?limit=30", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseJson = await response.json();
      if (responseJson.success && responseJson.data.length > 0) {
        setProducts(responseJson.data);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  React.useEffect(() => {
    if (filterCategory !== null) {
      if (filterCategory === "All") {
        setFilterProducts(products);
        return;
      }
      setFilterProducts(
        products.filter((product) => product.category === filterCategory)
      );
    } else {
      setFilterProducts(products);
    }
  }, [filterCategory, products]);

  React.useEffect(() => {
    setFilterProducts(
      products.filter(
        (product) =>
        //   product.price <= priceRange[1]
        //  &&
          product.rating.rate >= rating[0]
      )
    );
    if (sort === "High to Low") {
      setFilterProducts((prev) => prev.sort((a, b) => b.price - a.price));
    } else if (sort === "Low to High") {
      setFilterProducts((prev) => prev.sort((a, b) => a.price - b.price));
    } else if (sort === "Top Rated") {
      setFilterProducts((prev) =>
        prev.sort((a, b) => b.rating.rate - a.rating.rate)
      );
    } else if (sort === "Newest") {
      setFilterProducts((prev) =>
        prev.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        )
      );
    }
  }, [priceRange, rating, sort, products]);

  const designedIcon = ({
    icon,
    onClick,
  }: {
    icon: ReactNode;
    onClick: () => void;
  }) => {
    return (
      <div
        onClick={onClick}
        className="h-fit border border-gray-300 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
        {icon}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-50">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full h-full">
          <SidebarProvider>
            <FilterBar
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              rating={rating}
              setRating={setRating}
              setSort={setSort}
            />
            <div className="flex flex-col w-full p-4 max-w-7xl mx-auto">
              <div className="flex w-full justify-between border-b border-gray-300 pb-4 items-center bg-white rounded-lg p-4 shadow-sm">
                <SidebarTrigger />
                <p className="text-2xl font-bold text-black">ePay</p>
                <div className="flex space-x-4">
                  {designedIcon({
                    icon: <ShoppingCart size={20} className="text-gray-700" />,
                    onClick: () => {
                      router.push("/cart");
                    },
                  })}
                  {designedIcon({
                    onClick: () => {},
                    icon: <Heart size={20} className="text-red-500" />,
                  })}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                {categories.map((category) => (
                  <div
                    onClick={() => setFilterCategory(category)}
                    key={category}
                    className=" text-gray-500 border-gray-500 capitalize border rounded-3xl py-1 px-4 cursor-pointer">
                    {category}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Featured Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filterProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
              <Button className="mt-4" size={"lg"} variant="outline"
                onClick={() => router.push("/products")}
              >
                Load More
              </Button>
            </div>
          </SidebarProvider>
        </div>
      )}
    </div>
  );
}

export default SuggestionTab;
