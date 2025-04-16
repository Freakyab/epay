"use client";
import React, { useCallback } from "react";
import { ProductType } from "../type";
import Image from "next/image";
import {
  Check,
  Star,
  ShoppingCart,
  ArrowDownAZ,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import useCategories from "@/components/context/category";
import Loading from "@/components/loading";
import { useRouter } from "nextjs-toploader/app";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

function Products() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = React.useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<ProductType[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    0, 30000,
  ]);
  const { categories } = useCategories();
  const [filterCategory, setFilterCategory] = React.useState<string | null>(
    null
  );
  const [rating, setRating] = React.useState<number[]>([2]);
  const [sort, setSort] = React.useState("High to Low");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const sortOptions = ["High to Low", "Low to High", "Top Rated", "Newest"];
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<ProductType[]>([]);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const calculateDiscountedPrice = (
    price: number,
    discountPercentage: number
  ) => {
    if (discountPercentage <= 0)
      return price.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      });
    return (price - (price * discountPercentage) / 100).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`
          w-5 h-5 
          ${
            index < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
        `}
      />
    ));
  };

  const getBrands = useCallback(() => {
    return products.reduce((acc: string[], product) => {
      if (!acc.includes(product.brand) && product.brand) {
        acc.push(product.brand);
      }
      return acc;
    }, []);
  }, [products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/products/getProducts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseJson = await response.json();
      if (responseJson.success && responseJson.data.length > 0) {
        setProducts(responseJson.data);
        setFilteredProducts(responseJson.data);
      }
    } catch (error) {
      const errorMessage = error as Error;
      toast.error(
        errorMessage.message || "Something went wrong while fetching products"
      );
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
        setFilteredProducts(products);
        return;
      }
      setFilteredProducts(
        products.filter((product) => product.category === filterCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [filterCategory, products]);

  if (isLoading || status === "loading") {
    return <Loading />;
  }

  const handleFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (priceRange[0] > priceRange[1]) {
      toast.error("Invalid price range selected");
      return;
    }

    const filtered = products.filter((item) => {
      const isInPriceRange =
        item.price >= priceRange[0] && item.price <= priceRange[1];
      const isInRatingRange = item.rating.rate >= rating[0];
      return isInPriceRange && isInRatingRange;
    });

    const sortedProducts = filtered.sort((a, b) => {
      if (sort === "High to Low") {
        return b.price - a.price;
      } else if (sort === "Low to High") {
        return a.price - b.price;
      } else if (sort === "Top Rated") {
        return b.rating.rate - a.rating.rate;
      } else {
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      }
    });

    const brandFilteredProducts = sortedProducts.filter((item) => {
      if (selectedBrands.length === 0) return true;
      return selectedBrands.includes(item.brand);
    });

    const categoryFilteredProducts = brandFilteredProducts.filter((item) => {
      if (filterCategory === null) return true;
      return item.category === filterCategory;
    });

    setFilteredProducts(categoryFilteredProducts);
    setIsMobileFilterOpen(false);
  };

  const resetFilters = () => {
    setPriceRange([0, 30000]);
    setRating([2]);
    setFilteredProducts(products);
    setIsMobileFilterOpen(false);
  };

  const Filters = () => (
    <div className="w-full lg:pr-4 mb-6 lg:mb-0 overflow-hidden">
      <div className="border border-gray-400 rounded-lg shadow-md p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Filters</h3>
        <div className="space-y-5">
          {/* Price Range Filter */}
          <div className="pb-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Price Range</h4>
            <RangeSlider
              min={0}
              max={30000}
              step={100}
              value={priceRange}
              onInput={(value) => {
                setTimeout(() => {
                  setPriceRange([value[0], value[1]]);
                }, 100);
              }}
            />
            <div className="flex w-full justify-between text-sm text-gray-600 mt-2">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <h3 className="font-medium text-gray-700">Minimum Rating</h3>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={rating[0]}
              onChange={(e) => setRating([parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating[0]
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">and up</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownAZ className="w-4 h-4 text-indigo-600" />
              <h3 className="font-medium text-gray-700">Sort by</h3>
            </div>
            <RadioGroup
              value={sort}
              onValueChange={(value: string) => setSort(value)}
              defaultValue={sortOptions[0]}
              className="space-y-1">
              {sortOptions.map((option, index) => (
                <div
                  key={option}
                  className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                  <RadioGroupItem
                    value={option}
                    id={`sort-${option}`}
                    className="text-indigo-600"
                  />
                  <Label
                    htmlFor={`sort-${option}`}
                    className="cursor-pointer text-gray-700">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Brands</h4>
            <div className="grid grid-cols-2 gap-1">
              {getBrands().map((brand) => (
                <div key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    id={brand}
                    name={brand}
                    value={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      e.preventDefault();
                      if (e.target.checked) {
                        setSelectedBrands((prev) => [...prev, brand]);
                      } else {
                        setSelectedBrands((prev) =>
                          prev.filter((b) => b !== brand)
                        );
                      }
                    }}
                  />
                  <label htmlFor={brand} className="text-gray-700 text-sm">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-800 px-2"
                onClick={resetFilters}>
                Clear Filters
              </Button>

              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={handleFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // <div className="w-full lg:pr-4 mb-6 lg:mb-0">
  //   <div className="border border-gray-400 rounded-lg shadow-md p-4">
  //     <h3 className="text-xl font-bold mb-4">Filters</h3>
  //     <div className="space-y-5">
  //       {/* Price Range Filter */}
  //       <div className="pb-4 border-b border-gray-200">
  //         <h4 className="text-lg font-semibold mb-2">Price Range</h4>
  //         <RangeSlider
  //           min={0}
  //           max={30000}
  //           step={100}
  //           value={priceRange}
  //           onInput={(value) => {
  //             setTimeout(() => {
  //               setPriceRange([value[0], value[1]]);
  //             }, 100);
  //           }}
  //         />
  //         <div className="flex w-full justify-between text-sm text-gray-600 mt-2">
  //           <span>₹{priceRange[0]}</span>
  //           <span>₹{priceRange[1]}</span>
  //         </div>
  //       </div>

  //       {/* Rating Filter */}
  //       <div className="pb-4 border-b border-gray-200">
  //         <div className="flex items-center gap-2 mb-2">
  //           <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
  //           <h3 className="font-medium text-gray-700">Minimum Rating</h3>
  //         </div>
  //         <input
  //           type="range"
  //           min={1}
  //           max={5}
  //           step={1}
  //           value={rating[0]}
  //           onChange={(e) => setRating([parseInt(e.target.value)])}
  //           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
  //         />
  //         <div className="flex items-center mt-2">
  //           <div className="flex">
  //             {[...Array(5)].map((_, i) => (
  //               <Star
  //                 key={i}
  //                 className={`w-4 h-4 ${
  //                   i < rating[0]
  //                     ? "text-yellow-400 fill-yellow-400"
  //                     : "text-gray-300"
  //                 }`}
  //               />
  //             ))}
  //           </div>
  //           <span className="ml-2 text-sm text-gray-500">and up</span>
  //         </div>
  //       </div>

  //       {/* Sort Options */}
  //       <div className="pb-4 border-b border-gray-200">
  //         <div className="flex items-center gap-2 mb-2">
  //           <ArrowDownAZ className="w-4 h-4 text-indigo-600" />
  //           <h3 className="font-medium text-gray-700">Sort by</h3>
  //         </div>
  //         <RadioGroup defaultValue={sortOptions[0]} className="space-y-1">
  //           {sortOptions.map((option, index) => (
  //             <div
  //               key={option}
  //               className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
  //               <RadioGroupItem
  //                 onClick={() => setIndex(index)}
  //                 value={option}
  //                 id={`sort-${option}`}
  //                 className="text-indigo-600"
  //               />
  //               <Label
  //                 htmlFor={`sort-${option}`}
  //                 className="cursor-pointer text-gray-700">
  //                 {option}
  //               </Label>
  //             </div>
  //           ))}
  //         </RadioGroup>
  //       </div>

  //       {/* Brands Filter */}
  //       <div>
  //         <h4 className="text-lg font-semibold mb-2">Brands</h4>
  //         <div className="grid grid-cols-2 gap-1">
  //           {getBrands().map((brand) => (
  //             <div key={brand} className="flex items-center">
  //               <input
  //                 type="checkbox"
  //                 className="mr-2 text-indigo-600 focus:ring-indigo-500"
  //                 id={brand}
  //                 name={brand}
  //                 value={brand}
  //                 checked={selectedBrands.includes(brand)}
  //                 onChange={(e) => {
  //                   if (e.target.checked) {
  //                     setSelectedBrands((prev) => [...prev, brand]);
  //                   } else {
  //                     setSelectedBrands((prev) =>
  //                       prev.filter((b) => b !== brand)
  //                     );
  //                   }
  //                 }}
  //               />
  //               <label htmlFor={brand} className="text-gray-700 text-sm">
  //                 {brand}
  //               </label>
  //             </div>
  //           ))}
  //         </div>
  //         <div className="flex justify-between mt-4">
  //           <Button
  //             variant="ghost"
  //             className="text-indigo-600 hover:text-indigo-800 px-2"
  //             onClick={resetFilters}>
  //             Clear Filters
  //           </Button>

  //           <Button
  //             className="bg-indigo-600 text-white hover:bg-indigo-700"
  //             onClick={handleFilters}>
  //             Apply Filters
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // </div>
  // );

  const handleQuerySearch = (query: string) => {
    if (search.length > 0) {
      setIsSearchLoading(true);
      const filtered = products.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearchLoading(false);
    }
  };

  const handleSearch = () => {
    if (search.length === 0 || searchResults.length === 0) {
      setFilteredProducts(products);
      return;
    }
    setFilteredProducts(searchResults);
  };

  const handleRouting = (id: string) => {
    router.push(`/product/${id}`);
  };

  const addToCart = async (id: string) => {
    try {
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }
      const response = await fetch(`http://localhost:8000/cart/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      const responseJson = await response.json();
      if (responseJson.success) {
        router.push("/cart");
      } else {
        toast.error(
          responseJson.message || "Something went wrong while adding to cart"
        );
      }
    } catch (error) {
      const errorMessage = error as Error;
      toast.error(
        errorMessage.message || "Something went wrong while adding to cart"
      );
      console.error(error);
    }
  };

  return (
    <div className="container px-4 py-8 grid items-start">
      <div className="relative w-full max-w-lg mx-auto mb-6 ">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setIsSearchOpen(true);
            setSearch(e.target.value);
            handleQuerySearch(e.target.value);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={(e) => {
            setTimeout(() => {
              if (
                !e.relatedTarget ||
                !e.relatedTarget.closest(".search-results")
              ) {
                setIsSearchOpen(false);
              }
            }, 100);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
              setIsSearchOpen(false);
            }
          }}
          placeholder="Search..."
          className="w-full py-3 px-12 rounded-full bg-white text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 border border-yellow-500"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} onClick={handleSearch} />
        </div>

        <div
          className={`
            ${
              isSearchOpen && search.length > 0 && searchResults.length > 0
                ? "block"
                : "hidden"
            } search-results
            `}>
          <div className="absolute max-h-72 overflow-y-auto bg-white shadow-lg rounded-lg p-4 mb-6 z-20">
            <h3 className="text-lg font-bold mb-4">Search Results</h3>
            {isSearchLoading ? (
              <Loading />
            ) : (
              search.length > 0 &&
              searchResults.length > 0 && (
                <div className="flex flex-col space-y-4">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleRouting(item._id)}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="w-12 h-12 object-contain rounded-md mr-4"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {item.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 my-6">
        {categories.map((category) => (
          <div
            onClick={() => setFilterCategory(category)}
            key={category}
            className={`
            ${filterCategory === category && "bg-yellow-500 text-white"}
            text-gray-500 border-gray-500 capitalize border rounded-3xl py-1 px-4 cursor-pointer`}>
            {category}
          </div>
        ))}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-center">
          {isMobileFilterOpen ? (
            <>
              <X className="mr-2 h-4 w-4" /> Close Filters
            </>
          ) : (
            <>
              <Menu className="mr-2 h-4 w-4" /> Open Filters
            </>
          )}
        </Button>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <Filters />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row ">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-1/4 h-fit sticky top-24">
          <Filters />
        </div>

        {/* Products Grid */}
        <div className="w-full lg:w-3/4 lg:pl-4 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-500">No products found</p>
            </div>
          ) : (
            filteredProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => handleRouting(item._id)}
                className="bg-white cursor-pointer border rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl group flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/3 p-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={300}
                    height={300}
                    className="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {item.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <div className="w-full md:w-2/3 p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 line-clamp-2">
                      {item.title}
                    </h2>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {renderStars(item.rating.rate)}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({item.rating.count})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">
                        <span className="text-sm">₹</span>
                        {calculateDiscountedPrice(
                          item.price,
                          item.discountPercentage
                        )}
                      </span>
                      {item.discountPercentage > 0 && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹
                          {item.price.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item._id);
                      }}
                      variant="outline"
                      className="w-full md:w-auto group hover:bg-yellow-500 hover:text-white transition-colors">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>

                  {item.price > 500 && (
                    <div className="flex items-center bg-green-50 p-2 rounded-md">
                      <Check className="text-green-600 mr-2" size={20} />
                      <p className="text-green-700 text-sm">FREE Delivery</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
