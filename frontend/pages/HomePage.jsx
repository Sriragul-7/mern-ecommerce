import { useEffect } from "react";
import CAtegoryItem from "../components/CAtegoryItem"; 
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ href: "/watches", name: "Watches", imageUrl: "/watches.jpg" },
	{ href: "/glasses", name: "Glases", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
const { loading, products, fetchFeaturedProducts } = useProductStore();
 
  useEffect(()=>{
    fetchFeaturedProducts()
  },[fetchFeaturedProducts])

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-4xl font-bold text-emerald-400 mb-4">Explore Our Categories</h1>
        <p className="text-center text-xl text-gray-300 mb-12">Discover the latest trends in eco-freiendly fashion</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category=>(
            <CAtegoryItem 
            category={category}
            key={category.name}
            />
          ))}
        </div>
        {!loading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
      </div>
    </div>
  )
}

export default HomePage