"use client";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import Head from "next/head";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";
import toast from "react-hot-toast";
import useCategories from "@/components/context/category";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/components/useBackendUrl";

export default function AddProduct() {
  const { data: session, status } = useSession();
  const [customCategory, setCustomCategory] = useState({
    name: "",
    status: false,
  });
  const [weightRadio, setWeightRadio] = useState("no");
  const { categories } = useCategories();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    title: string;
    price: number | string;
    description: string;
    category: string;
    image: string;
    discountPercentage: number;
    tags: string[];
    brand: string;
    weight: number;
    slug: string;
  }>({
    title: "Shoes",
    price: "3500",
    slug: "shoes",
    description:
      "Nike shoes combine innovative design, advanced technology, and premium comfort. Known for their stylish look and durability, they offer a wide range of options for sports, training, and casual wear. With features like responsive cushioning and lightweight materials, Nike shoes provide superior performance, making them a top choice for athletes.",
    category: categories[0],
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    discountPercentage: 20,
    tags: [
      "shoes",
      "nike",
      "footwear",
      "sports",
      "fashion",
      "running",
      "comfort",
    ],
    brand: "NIKE",
    weight: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tags") {
      setFormData({
        ...formData,
        [name]: value.split(",").map((tag) => tag.trim()),
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          name === "price" || name === "discountPercentage" || name === "weight"
            ? Number(value)
            : value,
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCategoryChange = (category: string) => {
    if (category === "Other") {
      setCustomCategory({
        name: "",
        status: true,
      });
    } else {
      setCustomCategory({
        name: "",
        status: false,
      });
    }
    const slug = generateSlug(category);
    setFormData({
      ...formData,
      category,
      slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const {
      title,
      slug,
      price,
      discountPercentage,
      category,
      image,
      description,
    } = formData;

    if (
      !title ||
      !slug ||
      !price ||
      !discountPercentage ||
      !category ||
      !image ||
      !description
    ) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (!session || !session.user) {
        throw new Error("User not authenticated");
      }
      const response = await fetch(
        `${BASE_URL}products/add/${session?.user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productDetails: {
              ...formData,
              category:
                formData.category === "Other"
                  ? customCategory.name.trim()
                  : formData.category,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add product: ${response.statusText}`);
      }
      const resData = await response.json();

      if (resData.success) {
        toast.success("Product added successfully!");
        router.push(`/product/${resData.data._id}`);
        // setFormData({
        //   title: "",
        //   price: "",
        //   slug: "",
        //   description: "",
        //   category: "",
        //   image: "",
        //   discountPercentage: 0,
        //   tags: [],
        //   brand: "",
        //   weight: 0,
        // });
      } else {
        toast.error(resData.message || "Failed to add product.");
        // setError(resData.message || "Failed to add product.");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "An error occurred. Please try again.");
      console.error(err);
      //   setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Head>
        <title>Add New Product</title>
        <meta name="description" content="Add a new product to your store" />
      </Head>

      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from title, but you can edit it
            </p>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1">
              Price * (₹)
              {formData.discountPercentage > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  (New Price wil be: ₹
                  {(
                    Number(formData.price) -
                    (Number(formData.price) * formData.discountPercentage) / 100
                  ).toFixed(2)}
                  )
                </span>
              )}
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="discountPercentage"
              className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage * (%)
            </label>
            <input
              type="number"
              id="discountPercentage"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <Select
              value={formData.category}
              defaultValue={formData.category}
              onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="capitalize">
                <SelectGroup>
                  {categories &&
                    [
                      ...categories.filter((category) => category !== "All"),
                      "Other",
                    ].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {customCategory.status && (
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1">
                Name the category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={customCategory.name}
                onChange={(e) =>
                  setCustomCategory({
                    ...customCategory,
                    name: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1">
              Image URL *
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={
                Array.isArray(formData.tags)
                  ? formData.tags.join(", ")
                  : formData.tags
              }
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <p>Do your product has weight</p>
          <RadioGroup
            defaultValue={weightRadio}
            onValueChange={(value) => {
              setWeightRadio(value);
              if (value === "no") {
                setFormData({ ...formData, weight: 0 });
              }
            }}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="option-one" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="option-two" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>

          {weightRadio === "yes" && (
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-1">
                Weight (g)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
