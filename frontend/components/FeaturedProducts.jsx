import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const FeaturedProducts = ({ featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(featuredProducts.length - itemsPerPage, 0);

  const nextSlide = () => setCurrentIndex((i) => Math.min(i + 1, maxIndex));
  const prevSlide = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="py-16 relative">
      <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-10">
        Featured
      </h2>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-28  from-black/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-28  from-black/70 to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden px-6">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
          >
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 shrink-0 px-4"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden h-full">
                  <div className="overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-emerald-300 font-bold mb-4">
                      ${product.price.toFixed(2)}
                    </p>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute top-1/2 -left-4 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 p-3 rounded-full transition"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className="absolute top-1/2 -right-4 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 p-3 rounded-full transition"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default FeaturedProducts;
