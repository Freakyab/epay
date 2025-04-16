"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Minus,
  Trash,
  Loader,
  Check,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { CartProps } from "../type";
import Image from "next/image";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";

import toast from "react-hot-toast";

const calculateTotal = (cartItems: CartProps[] | null) => {
  return (
    cartItems?.reduce(
      (total, item) =>
        item.selected ? total + item.product.price * item.quantity : total,
      0
    ) || 0
  );
};

function Cart() {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartProps[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCartItems = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not logged");
      }
      const res = await fetch(`http://localhost:8000/cart/${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch cart items");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to fetch cart items");
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCartItems();
    }
  }, [status]);

  const updateQuantity = async (item: CartProps, newQuantity: number) => {
    setLoading(true);
    try {
      if (!session?.user?.id) {
        throw new Error("User not logged");
      }

      if (newQuantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      const res = await fetch(
        `http://localhost:8000/cart/updateQuantity/${item.product._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: newQuantity,
            userId: session.user.id,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Quantity updated successfully");
        setCartItems(
          (prev) =>
            prev
              ?.map((cartItem) =>
                cartItem.product._id === item.product._id
                  ? { ...cartItem, quantity: newQuantity }
                  : cartItem
              )
              .filter((cartItem) => cartItem.quantity > 0) || null
        );
      } else {
        throw new Error(data.message || "Failed to update quantity");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const updatedSelected = async (item: CartProps) => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not logged");
      }
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/cart/updateSelected/${item.product._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selected: !item.selected,
            userId: session.user.id,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setCartItems(
          (prev) =>
            prev?.map((cartItem) =>
              cartItem.product._id === item.product._id
                ? { ...cartItem, selected: !item.selected }
                : cartItem
            ) || null
        );
      } else {
        throw new Error(data.message || "Failed to update selected");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update selected");
      console.error("Error updating selected:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (item: CartProps) => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not logged");
      }
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/cart/deleteItem/${item.product._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Item deleted successfully");
        setCartItems(
          (prev) =>
            prev?.filter(
              (cartItem) => cartItem.product._id !== item.product._id
            ) || null
        );
      }else{
        throw new Error(data.message || "Failed to delete item");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete item");
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const shipping =
    calculateTotal(cartItems) > 500 ? 0 : calculateTotal(cartItems) * 0.1;
  if (status === "loading") return <Loading />;
  if (!cartItems || cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <ShoppingCart
            className="mx-auto mb-6 text-gray-400"
            size={120}
            strokeWidth={1}
          />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet. Let's go
            shopping and find some amazing products!
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            Start Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] h-full flex gap-4 p-4 bg-gray-50">
      <div className="w-2/3 h-fit bg-white p-6 border">
        <p className="text-3xl">Shopping Cart</p>
        <div className="border my-4" />
        <div
          className={`flex flex-col gap-4 ${
            loading ? "opacity-50" : ""
          } relative`}>
          {loading && (
            <Loader className="absolute top-1/2 left-1/2 animate-spin" />
          )}

          {cartItems.map((item) => (
            <div
              key={item.product._id}
              className={`grid grid-cols-4 gap-4
            ${!item.selected && "opacity-50"}
            `}>
              <Image
                src={item.product.image}
                alt={item.product.title}
                width={400}
                height={400}
                className="w-full h-64 object-contain"
              />
              <div className="p-2 text-lg col-span-2">
                <div
                  className="group"
                  onClick={() => router.push(`/product/${item.product._id}`)}>
                  <p className="font-semibold line-clamp-1 group-hover:underline cursor-pointer">
                    {item.product.title}
                  </p>
                  <p className="text-base line-clamp-2 group-hover:underline cursor-pointer">
                    {item.product.description}
                  </p>
                </div>
                <p className="text-green-700 text-xs">In stock</p>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-yellow-500 flex rounded-2xl w-fit px-4 my-4">
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}>
                      {item.quantity > 1 ? (
                        <Minus size={16} />
                      ) : (
                        <Trash size={16} />
                      )}
                    </button>
                    <p className="mx-4 text-lg font-semibold">
                      {item.quantity}
                    </p>
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteItem(item)}
                    className="text-blue-900 text-sm">
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-start gap-4">
                <p>
                  ₹
                  {item.product.price.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <input
                  type="checkbox"
                  checked={item.selected}
                  className="h-6 w-6"
                  onChange={() => updatedSelected(item)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="border my-4" />
        <div className="flex justify-between">
          <span className="text-xl font-semibold">Total</span>
          <p className="text-lg font-bold">
            <span className="font-normal">
              (items{" "}
              {cartItems.reduce(
                (total, item) =>
                  item.selected ? total + item.quantity : total,
                0
              )}
              )
            </span>
            <span>
              : ₹
              {calculateTotal(cartItems).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
      </div>
      {cartItems.length > 0 && (
        <div className="w-1/3 border bg-white p-4 h-fit">
          <p className="text-3xl">Order Summary</p>
          <div className="border my-4" />
          {shipping == 0 && (
            <div className="flex gap-2 my-4 items-center">
              <div className="bg-green-800 border border-green-200 rounded-full w-fit p-1">
                <Check className="text-white" size={12} />
              </div>
              <p className="text-green-600">
                Your order is eligible for FREE Delivery.
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <p className="text-lg">Subtotal</p>
            <p className="text-lg">
              ₹
              {calculateTotal(cartItems).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-lg">Shipping</p>
            <p className="text-lg">
              ₹
              {shipping.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="border my-4" />
          <div className="flex justify-between">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-bold">
              <span className="text-sm font-normal">(excluding Tax) </span>₹
              {(calculateTotal(cartItems) + shipping).toLocaleString(
                undefined,
                {  maximumFractionDigits: 2 }
              )}
            </p>
          </div>
          <button
            className="w-full bg-yellow-500 text-white py-2 rounded-lg my-4"
            onClick={() => router.push("/checkout")}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
