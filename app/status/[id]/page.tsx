"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import {  OrderProps } from "@/app/type";
import Loading from "@/components/loading";
import { useRouter } from "nextjs-toploader/app";
import toast from "react-hot-toast";

function Status({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [orderDetails, setOrderDetails] = React.useState<OrderProps | null>(
    null
  );
  const [redirectTimeout, setRedirectTimeout] = React.useState(59);

  useEffect(() => {
    // fetch transaction status
    const fetchOrderStatus = async () => {
      try {
        setIsLoading(false);
        if (!params.id) {
          throw new Error("Invalid order id");
        }

        const res = await fetch(
          `http://localhost:8000/payment/callback/${params.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session?.user.id,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          setOrderDetails({
            products: data.products,
            transactionDetails: data.transactionDetails,
            addressDetails: data.addressDetails,
          });
        } else {
          toast.error(data.message);
          setError(data.message);
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An error occurred");
        console.error(error);
        setError("An error occurred while fetching order details");
      }
      setIsLoading(false);
    };

    const timeoutId = setTimeout(fetchOrderStatus, 3000);

    return () => clearTimeout(timeoutId);
  }, [params.id, session]);

  useEffect(() => {
    if (redirectTimeout === 0) {
      router.push("/orders");
    }
    const interval = setInterval(() => {
      setRedirectTimeout((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [redirectTimeout]);

  if (status === "loading") return <Loading />;
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <p className="text-center text-gray-600 text-sm">
        Redirecting to Your Order's page in 0:{redirectTimeout} seconds
      </p>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {error ? (
            <div className="text-red-500 text-center flex flex-col items-center mt-6">
              <p className="mb-4">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Home
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-blue-50 p-4 border-b">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h1 className="text-xl font-bold text-gray-800">
                    Order Confirmation
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Thank you for shopping with us. We confirm that your item has
                  shipped. Your order details are available on this page.
                </p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>Order #:</strong>{" "}
                    {orderDetails?.transactionDetails._id}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-base font-medium text-gray-700">
                    Delivery Information
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>Estimated Delivery:</p>
                    <p>
                      {new Date(
                        Date.now() + 3 * 24 * 60 * 60 * 1000
                      ).toDateString()}{" "}
                    </p>
                    <p>Shipping Speed: Standard</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-medium text-gray-700 mt-4">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>
                        {orderDetails?.addressDetails.firstName}{" "}
                        {orderDetails?.addressDetails.lastName}
                      </p>
                      <p>{orderDetails?.addressDetails.address}</p>
                      <p>
                        {orderDetails?.addressDetails.city},{" "}
                        {orderDetails?.addressDetails.state}
                      </p>
                      <p>{orderDetails?.addressDetails.zipCode}</p>
                      <p>{orderDetails?.addressDetails.country}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-base font-medium text-gray-700">
                    Order Items
                  </h3>
                  <div className="mt-4">
                    {orderDetails?.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="ml-4">
                            <p className="text-sm text-gray-600">
                              {product.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{product.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity:{" "}
                              <span className="text-gray-800">
                                {
                                  orderDetails?.transactionDetails.products.find(
                                    (p) => p.productId === product._id
                                  )?.quantity
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-base font-medium text-gray-700 mb-2">
                    Payment Summary
                  </h3>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>total</span>
                      <span>₹{orderDetails?.transactionDetails.price}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => router.push("/orders")}
                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded">
                    Order Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Status;
