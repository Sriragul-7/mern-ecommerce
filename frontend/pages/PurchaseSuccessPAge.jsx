import { ArrowRight, CheckCircle, HandHeart } from "lucide-react"
import { Link } from "react-router-dom"
import { useCartStore } from "../stores/useCartStore"
import { useEffect, useState } from "react";
import axios from "../lib/axios.js"
import Confetti from "react-confetti"

const PurchaseSuccessPAge = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    const handleCheckoutSuccess = async (sessionId) => {
      try {
        await axios.post(
          "/payments/checkout-success",
          { sessionId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        clearCart();
      } catch (error) {
        console.log("Checkout success error:", error);
      }
    };

    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );

    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    }
  }, [clearCart]);
  return (
    <div className="h-screen flex items-center justify-center px-4">
        <Confetti
        width={window.innerWidth}
        height={innerHeight}
        gravity={0.1}
        style={{zIndex: 99}}
        numberOfPieces={700}
        recycle={false}
        />
        <div className="max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden relative">
            <div className="p-6 sm:p-8">
                <div className="flex justify-center">
                    <CheckCircle className="text-emerald-400 size-16 mb-4"/>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-emarald-400 mb-2">
                    Purchase Successfull!!
                </h1>
                <p className="text-gray-300 text-center mb-2">
                    Thank you for you order We're processing it now
                </p>
                <p className="text-emerald-400 text-center text-sm mb-6">
                    Check your email for order details and updates
                </p>
                <div className="bg-gray-700 rounded-lg px-4 py-2 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Order number</span>
                        <span className="text-sm font-semibold text-emerald-400">#12345</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Expected Delivery</span>
                        <span className="text-sm font-semibold text-emerald-400">2-3 business days</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                        < HandHeart size={18} className="mr-2"/>
                        Thanks for trusting us!
                    </button>
                     <Link to={"/"} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                        Continue Shoping
                        <ArrowRight className="ml-2" size={18}/>
                    </Link>

                </div>
            </div>

        </div>
    </div>
  )
}

export default PurchaseSuccessPAge