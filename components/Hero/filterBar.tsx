import { Star, ArrowDownAZ } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";
import { Slider } from "../ui/slider";

export function FilterBar({
  setPriceRange,
  setRating,
  setSort,
  priceRange,
  rating,
}: {
  setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
  setRating: React.Dispatch<React.SetStateAction<number[]>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  priceRange: number[];
  rating: number[];
}) {
  const [index, setIndex] = React.useState(0);
  const sortOptions = ["High to Low", "Low to High", "Top Rated", "Newest"];

  React.useEffect(() => {
    setSort(sortOptions[index]);
  }, [index]);

  const handleReset = () => {
    setPriceRange([450, 1000]);
    setRating([2]);
    setIndex(0);
    setSort(sortOptions[0]);
  };

  return (
    <Sidebar className="absolute top-[120%] border-r border-gray-200 shadow-lg bg-white h-full">
      <SidebarContent className="p-4 w-64">
        <div className="flex items-center justify-between my-6">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            onClick={handleReset}>
            Reset All
          </button>
        </div>

        <SidebarGroup>
          <div className="space-y-6">
            {/* Price Filter */}
            {/* <div className="pb-5 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-gray-700">Price Range</h3>
              </div>
              <Slider
                max={10000}
                step={1}
                value={priceRange}
                onValueChange={(value) => {setPriceRange([priceRange[0], value[0]])}}
                className="mb-2"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="px-3 py-1 bg-gray-100 rounded text-sm">₹{priceRange[1]}</div>
                <div className="text-sm text-gray-500">to</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                  ₹10000
                </div>
              </div>
            </div> */}

            {/* Ratings Filter */}
            <div className="pb-5 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <h3 className="font-medium text-gray-700">Minimum Rating</h3>
              </div>
              <Slider
                defaultValue={[2]}
                max={5}
                step={1}
                onValueChange={(value) => setRating(value)}
                className="mb-2"
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
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownAZ className="w-4 h-4 text-indigo-600" />
                <h3 className="font-medium text-gray-700">Sort by</h3>
              </div>
              <RadioGroup defaultValue={sortOptions[0]} className="space-y-2">
                {sortOptions.map((option, index) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <RadioGroupItem
                      onClick={() => {
                        setIndex(index);
                      }}
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
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
