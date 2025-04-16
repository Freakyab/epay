"use client";
import React, { useEffect, useState } from "react";
import { Package, Search, Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";
import { useRouter } from "nextjs-toploader/app";
import toast from "react-hot-toast";

type OrderType = {
  orderId: string;
  date: string;
  total: number;
  status: string;
  uid: string;
  items: {
    name: string;
    seller: string;
    _id: string;
    price: number;
    image: string;
  }[];
};

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderData, setOrderData] = useState<OrderType[]>([]);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  const filteredOrders = orderData.filter(
    (order) =>
      order.orderId.includes(searchTerm) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );


  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      if (!session?.user.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `http://localhost:8000/orders/${session.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrderData(data.orderDetails);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to fetch orders");
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if(status === "authenticated") {
    fetchOrders();
    }
  }, [session]);

  if (status === "loading") return <Loading />;


  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

            <div className="flex mb-4 space-x-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search all orders"
                  className="w-full p-2 pl-10 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
              </div>

              <div className="relative">
                <button className="flex items-center border rounded-md p-2 bg-white">
                  <Filter className="mr-2" size={20} />
                  Filters
                </button>
              </div>
            </div>

            
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border rounded-lg mb-4 overflow-hidden shadow-sm">
                <div className="flex justify-between p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Package className="text-green-600" size={24} />
                    <div>
                      <p className="font-semibold">Order Placed</p>
                      <p className="text-sm text-gray-600">{order.date}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Order #</span>{" "}
                      {order.orderId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.items.map((item) => (
                  <div key={item.name} className="p-4 flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover mr-4 border rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Sold by {item.seller || "Not Available"}
                      </p>
                      <p className="text-sm">Price: ₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => router.push(`/product/${item._id}`)}>
                        Buy Again
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 p-3 flex justify-end space-x-2">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => router.push(`/invoice/${order.uid}`)}>
                    Invoice
                  </button>
                  {/* <button className="text-sm text-blue-600 hover:underline">
                    Order Details
                  </button> */}
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center p-6 bg-white rounded-lg">
                <p className="text-gray-600">No orders found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderHistory;
