import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,           // Available coupon
  appliedCoupon: null,    // Only applied when user clicks Apply
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  // Fetch user's coupon (just display it)
  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      set({ coupon: res.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },

  // Apply coupon when user clicks Apply
  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });
      set({
        appliedCoupon: res.data,
        isCouponApplied: true,
      });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },

  // Remove applied coupon
  removeCoupon: () => {
    set({ appliedCoupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  // Cart APIs
  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  clearCart: () => {
    set({ cart: [], appliedCoupon: null, isCouponApplied: false, total: 0, subtotal: 0 });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prev) => {
        const existing = prev.cart.find((i) => i._id === product._id);
        const newCart = existing
          ? prev.cart.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prev.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  removeFromCart: async (productId) => {
    await axios.delete(`/cart/${productId}`);
    set((prev) => ({
      cart: prev.cart.filter((i) => i._id !== productId),
    }));
    get().calculateTotals();
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    await axios.put(`/cart/${productId}`, { quantity });
    set((prev) => ({
      cart: prev.cart.map((i) =>
        i._id === productId ? { ...i, quantity } : i
      ),
    }));
    get().calculateTotals();
  },

  // Only appliedCoupon affects totals
  calculateTotals: () => {
    const { cart, appliedCoupon } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = subtotal;

    if (appliedCoupon) {
      total -= subtotal * (appliedCoupon.discountPercentage / 100);
    }

    set({ subtotal, total });
  },
}));
