"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, CreditCard, Lock, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CartProps, AddressType } from "../type";
import { useRouter } from "nextjs-toploader/app";
import toast from "react-hot-toast";
import { BASE_URL } from "@/components/useBackendUrl";

function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [savedAddress, setSavedAddress] = useState<AddressType[] | null>(null);
  const step = 1;
  const [cartItems, setCartItems] = useState<CartProps[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchCartItems = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      const res = await fetch(`${BASE_URL}cart/${session.user.id}`);
      const resData = await res.json();

      if (resData.success) {
        const carts = resData.data;
        setCartItems(carts.filter((cart: CartProps) => cart.selected));
        const addresses = resData.address;
        setSavedAddress(addresses);
      } else {
        throw new Error(resData.message || "Failed to fetch cart items");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to fetch cart items");
      console.error("Error fetching cart items:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") fetchCartItems();
  }, [status, fetchCartItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }

      for (const key in formData) {
        if (!formData[key as keyof typeof formData]) {
          toast.error("Please fill in all fields");
          return;
        }
      }

      // Calculate total dynamically inside handleSubmit
      const calculatedSubtotal = subtotal(cartItems);
      const calculatedShipping =
        calculatedSubtotal > 500 ? 0 : calculatedSubtotal * 0.1;
      const calculatedTax = calculatedSubtotal * 0.08;
      const totalPrice =
        calculatedSubtotal + calculatedShipping + calculatedTax;

      const products = cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));

      const res = await fetch(`${BASE_URL}payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          products: products,
          price: totalPrice, // Now using the correct total price
          address: formData,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        toast.loading("Redirecting to payment gateway...", {
          duration: 2000,
        });
        router.push(resJson.redirectUrl);
      } else {
        toast.error(resJson.message || "Error placing order");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Error placing order");
      console.error(err);
    }
  };

  const subtotal = (cartItems: CartProps[] | null) => {
    return (
      cartItems?.reduce(
        (total, item) =>
          item.selected ? total + item.product.price * item.quantity : total,
        0
      ) || 0
    );
  };

  const shipping = subtotal(cartItems) > 500 ? 0 : subtotal(cartItems) * 0.1;
  const tax = subtotal(cartItems) * 0.08;
  const total = subtotal(cartItems) + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/products"
            className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="w-4 h-4 mr-1" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="flex mb-8">
          <div
            className={`flex-1 text-center pb-2 ${
              step >= 1
                ? "border-b-2 border-black font-medium"
                : "border-b border-gray-200"
            }`}>
            1. Shipping
          </div>
          <div
            className={`flex-1 text-center pb-2 ${
              step >= 2
                ? "border-b-2 border-black font-medium"
                : "border-b border-gray-200"
            }`}>
            2. Payment
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="md:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div className="flex overflow-x-auto mb-4">
                      {savedAddress &&
                        savedAddress.map((sample) => (
                          <div
                            key={sample._id}
                            title="Click to select address"
                            onClick={() =>
                              setFormData({
                                email: sample.email,
                                firstName: sample.firstName,
                                lastName: sample.lastName,
                                address: sample.address,
                                city: sample.city,
                                state: sample.state,
                                zipCode: sample.zipCode,
                                country: sample.country,
                              })
                            }
                            className="mb-4 bg-white rounded-lg h-full border shadow-xl cursor-pointer p-4">
                            <p className=" font-semibold mb-2 underline">
                              {sample.firstName} {sample.lastName}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              {sample.address}
                            </p>
                            <span className="text-xs">
                              {sample.city} - {sample.zipCode}
                            </span>
                          </div>
                        ))}
                    </div>
                    <h2 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h2>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <h2 className="text-lg font-semibold mt-6 mb-4">
                      Shipping Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="zipCode"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required>
                        <option value="United States">India</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Free shipping on orders over ₹500
                      </span>
                    </div>
                  </>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    {step === 1 ? "Continue to Payment" : "Place Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="max-h-80 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex py-4 border-b border-gray-100 last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {item.product.title}
                      </h3>
                      {/*  */}
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-medium">
                          ₹
                          {(item.product.price * item.quantity).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    ₹
                    {subtotal(cartItems).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    ₹
                    {shipping.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span>
                    ₹
                    {tax.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    ₹
                    {total.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    />
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                By placing your order, you agree to our{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
