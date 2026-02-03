import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore.js";
import { useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import AdminPage from "../pages/AdminPage.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import { useCartStore } from "../stores/useCartStore.js";
import PurchaseSuccessPAge from "../pages/PurchaseSuccessPAge.jsx";
import PurchaseCancelPage from "../pages/PurchaseCancelPage.jsx";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

    useEffect(() => {
    if (!user) return;

    getCartItems();
  }, [getCartItems, user]);

if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      {/*  <div
  className="absolute inset-0"
  style={{
    background: "radial-gradient(circle at top, rgba(34,197,94,0.25), transparent 60%)"
  }}
></div>
*/}

      {/* <div
  className="absolute inset-0 animate-pulse"
  style={{
    background: "linear-gradient(to right, rgba(22,163,74,0.3), rgba(16,185,129,0.2), rgba(20,83,45,0.3))"
  }}
></div>  */}

      <div className="relative z-50 p-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />}/>
          <Route  path="/login"  element={!user ? <LoginPage /> : <Navigate to="/" />}/>
          <Route path="/secret-dashboard"element={ user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" /> } />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />}/>
          <Route path="/purchase-success" element={user ? <PurchaseSuccessPAge /> : <Navigate to="/login" />}/>
          <Route path="/purchase-cancel" element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}/>
          
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

             
       
         
        