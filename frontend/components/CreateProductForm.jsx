import { useState } from "react"
import { motion } from "framer-motion"
import {Loader, PlusCircle, Upload} from "lucide-react"
import { useProductStore } from "../stores/useProductStore.js";

const categories=["jeans","t-shirts","shoes", "glasses", "jackets", "watches", "bags"];

const CreateProductForm = () => {
  
  const [newProduct, setNewProduct]= useState({
    name:"",
    description:"",
    price:"",
    category:"",
    image:"",
  })

  const {createProduct, loading} = useProductStore()
  
  const handleSubmit= async(e)=>{
    e.preventDefault();
    try {
      await createProduct(newProduct);
      console.log(newProduct)
      setNewProduct({name:"", description:"", price:"", category:"", image:""})
    } catch (error) {
      console.log("error creating product", error.message)
    }
  }

  const handleImageChange=(e)=>{
    const file=e.target.files[0];
    if(file){
      const reader=new FileReader()

      reader.onload=()=>{
        setNewProduct({...newProduct,image: reader.result})
      }

      reader.readAsDataURL(file);  //base64
    }
  }

  return (
    <motion.div
    initial={{ opacity:0, y:20}}
    animate={{opacity:1, y:0}}
    transition={{duration: 0.8}}
    className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
    >
    <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Create New Product</h2>

    <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor="name" className="mt-2 block text-sm font-medium text-gray-300">
        Product Nme
      </label>

      <input
      type="text"
      id="name"
      name="name"
      required
      value={newProduct.name}
      onChange={(e)=>setNewProduct({...newProduct,name:e.target.value})}
      className="bg-gray-700 w-full mt-2 rounded-sm border border-gray-600 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
      </input>
    </div>

    <div>
      <label htmlFor="description" className="mt-2 block text-sm font-medium text-gray-300">
        Description
      </label>

      <textarea
      id="description"
      name="description"
      value={newProduct.description}
      required
      onChange={(e)=>setNewProduct({...newProduct,description:e.target.value})}
      className="bg-gray-700 w-full mt-2 rounded-sm border border-gray-600 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
      </textarea>
    </div>

    <div>
      <label htmlFor="price" className="mt-2 block text-sm font-medium text-gray-300">
        Price
      </label>

      <input
      type="number"
      id="price"
      name="price"
      required
      value={newProduct.price}
      onChange={(e)=>setNewProduct({...newProduct,price:e.target.value})}
      className="bg-gray-700 w-full mt-2 rounded-sm border border-gray-600 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
      </input>
    </div>

    <div>
      <label htmlFor="category" className="mt-2 block text-sm font-medium text-gray-300">
        Category
      </label>

      <select
      id="category"
      value={newProduct.category}
      onChange={(e)=>setNewProduct({...newProduct,category:e.target.value})}
      className="bg-gray-700 w-full mt-2 rounded-sm border border-gray-600 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      required
      >
        <option value="">Select a category</option>
        {categories.map((category)=>(
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>

    <div className="mt-2 flex items-center">
      <input type="file" id="image" className="sr-only" accept="image/*"
      onChange={handleImageChange}
      />
      <label htmlFor="image" 
      className="cursor-pointer bg-gray-700 hover:bg-gray-600 leading-4 mt-2 rounded-sm border border-gray-600 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <Upload className="size-5 inline-block mr-2"/>
        Upload Image
      </label>
      {newProduct.image && <span className="ml-2 text-sm text-gray-400">Image Uploaded</span>}
    </div>

    <button
    type="submit"
    className="flex justify-center bg-emerald-600 hover:bg-emerald-700 text-sm font-medium w-full mt-4 rounded-sm border border-transparent shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
    disabled={loading}
    >
      {loading ?(
        <>
        <Loader className="mr-2 size-5 animate-spin" aria-hidden="true" />
        Loading..
        </>
      ) : (
        <>
        <PlusCircle className="size-5 mr-2" />
        Create Product
        </>
      )}
    </button>
    </form>
    </motion.div>
  )
}

export default CreateProductForm