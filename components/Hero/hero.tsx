"use client";
import React from "react";
import { MoveUpRight, Search } from "lucide-react";
import Image from "next/image";
import { ProductType } from "@/app/type";
import { useRouter } from "nextjs-toploader/app";
import Loading from "../loading";
import { BASE_URL } from "../useBackendUrl";

function Hero() {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
  const router = useRouter();
  const [search, setSearch] = React.useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = React.useState<boolean>(false);
  const [searchResults, setSearchResults] = React.useState<ProductType[]>([]);
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsSearchLoading(true);
      setIsSearchOpen(true);
      e.preventDefault();
      const value = e.target.value;
      setSearch(value);

      const response = await fetch(
        `${BASE_URL}products/search/${value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Search results:", data);
      if (data.success) {
        setSearchResults(data.products);
      } else {
        console.error("Error fetching search results:", data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
    setIsSearchLoading(false);
  };

  return (
    <div className="relative w-full h-screen ">
      <Image
        alt="poster"
        fill
        sizes="100vw"
        className="object-cover"
        src="https://plus.unsplash.com/premium_photo-1708274147720-abd218b3a3bd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90"></div>
      <div className="absolute top-[25%] right-8 w-fit text-5xl md:text-7xl font-bold text-white tracking-wider uppercase">
        <p>STYLE</p>
        <p className="text-4xl md:text-8xl">MEETS</p>
        <p>CONFIDENCE.</p>
      </div>
      <div className="absolute bottom-[28%] left-8 w-fit text-5xl md:text-7xl font-bold text-white tracking-wider uppercase">
        <p>elegance</p>
        <p className="text-4xl md:text-8xl">MEETS</p>
        <p>EXPRESSION.</p>
      </div>
      {/* Search Bar */}
      <div className="absolute top-[35%] left-0 right-0 flex flex-col md:flex-row justify-center items-center px-4 gap-4">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
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
            onChange={handleSearch}
            value={search}
            placeholder="Search..."
            className="w-full py-3 px-12 rounded-full bg-white text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>

          <div
            className={`
            ${
              isSearchOpen && search.length > 0 && searchResults.length > 0
                ? "block"
                : "hidden"
            } 
            search-results
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
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/product/${item._id}`);
                        }}>
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
      </div>
      <div className="absolute bottom-1/4 left-0 right-0 flex justify-center px-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="flex">
            <div className="relative w-fit">
              <p className="w-full py-3 px-5 rounded-full bg-white text-gray-800 shadow-lg">
                Start Shopping
              </p>
            </div>
            <div className="bg-white rounded-full p-3 flex justify-center items-center">
              <MoveUpRight />
            </div>
          </div>
          <span className="text-lg font-semibold text-white">
            Top Collection
          </span>
        </div>
      </div>
    </div>
  );
}

export default Hero;
