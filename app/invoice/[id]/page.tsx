"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { ProductType, AddressType, OrderProps } from "@/app/type";
import Loading from "@/components/loading";
import { useRouter } from "nextjs-toploader/app";
import toast from "react-hot-toast";
import { BASE_URL } from "@/components/useBackendUrl";

function Invoice({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [orderDetails, setOrderDetails] = React.useState<OrderProps | null>(
    null
  );
  useEffect(() => {
    // fetch transaction status
    const fetchOrderStatus = async () => {
      try {
        setIsLoading(false);
        if (!params.id) {
          throw new Error("Invalid order id");
        }

        const res = await fetch(
          `${BASE_URL}orders/invoice/${params.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
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
        toast.error(err.message);
        setError("An error occurred while fetching order details");
      }
      setIsLoading(false);
    };

    fetchOrderStatus();
  }, [params.id, session]);

  if (status === "loading") return <Loading />;

  const subtotal = (orderItems: {
    products: ProductType[];
    transactionDetails: {
      products: { productId: string; quantity: number }[];
      price: number;
    };
  }) => {
    return (
      //get the quantity of each product and multiply it by the price of the product
      orderItems.products.reduce((acc, product) => {
        const quantity = orderItems.transactionDetails.products.find(
          (p) => p.productId === product._id
        )?.quantity;
        return acc + product.price * (quantity || 1);
      }, 0)
    );
  };

  if (orderDetails === null)
    return (
      <p className="text-red-500 text-center flex flex-col items-center mt-6">
        Something went wrong
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
                        orderDetails.transactionDetails.createdAt
                      ).getTime() +
                        3 * 24 * 60 * 60 * 1000 >
                      Date.now()
                        ? "3 days"
                        : "7 days"}{" "}
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
                            <p className="text-sm text-gray-600 cursor-pointer"
                                onClick={() => router.push(`/product/${product._id}`)}
                            >
                              {product.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{product.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity:{" "}
                              <span className="text-gray-800">
                                {
                                  orderDetails.transactionDetails.products.find(
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
                      <span className="text-gray-600 capitalize">
                        actual price
                      </span>

                      <span>₹{subtotal(orderDetails)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 capitalize"
                      title="Shipping charges, taxes, etc"
                      >
                        other charges
                      </span>
                      <span
                        className="text-red-500"
                        title="Shipping charges, taxes, etc"
                      >
                        ₹
                        {Number(
                          orderDetails.transactionDetails.price -
                            subtotal(orderDetails)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className=" capitalize">total</span>

                      <span className="text-lg font-semibold">
                        ₹
                        {Number(orderDetails.transactionDetails.price).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Invoice;
