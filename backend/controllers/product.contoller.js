import redis from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllProducts=async(req,res)=>{
    try{
        const products=await Product.find({});
        res.status(200).json({products});
    }
    catch(error){
        console.log("Error in fetching all products",error.message);
        res.status(500).json({message:"server error",error:error.message})
    }
}

export const getFeaturedProducts=async(req,res)=>{
    try{
        let featuredProducts = await redis.get("featured_products");

        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }

        featuredProducts=await Product.find({isFeatured:true}).lean();   // .lean() return plain javascript object instead of mongo object improve performance

        if(featuredProducts.length===0){
            return res.status(404).json({message:"No featured Products"})
        }
        // Storing featured products from mongoDB to redis if there is no featured products in the redis for faster fetch
        await redis.set("featured_products",JSON.stringify(featuredProducts))

        res.json(featuredProducts);

    }
    catch(error){
        await redis.del("featured_products");
        console.log("Error in getFeaturedProduct controller",error);
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

export const createProduct=async(req,res)=>{
    try{
        const {name,description,price,image,isFeatured,category}=req.body;

        let cloudinaryResponse=null;
        if(image){
            cloudinaryResponse=await cloudinary.uploader.upload(image,{folder:"products"})
        }

        const product= await Product.create({
            name,
            description,
            price,
            isFeatured,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category,
        })
        res.status(200).json(product)
    }
    catch(error){
        console.log("Error in Create Product controller",error.message)
        res.status(500).json({message:"Server Error",error:error.message})
    }
}

export const deleteProduct=async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id)

        if(!product){
            res.status(404).json({message:"Product not found"});
        }

        if(product.image){
            const publicId=product.image.split("/").pop().split(".")[0];  // to get the id

            try {
            await cloudinary.uploader.destroy(`poducts/${publicId}`);
            console.log("deleted image from cloudinary");
            } catch (error) {
                console.log("Error in deleting image from cloudinary",error)
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({message:"Product deleted successfully"})
    }
    catch(error){
        console.log("Error in deleteProduct Contoller",error.message);
        res.status(500).json({message:"Server Error",error:error.message});
    }

}
export const getRecommendedProducts = async (req, res) => { 
    try {
        const products=await Product.aggregate([
            {
                $sample:{size:4}
,
            },{
               $project:{
                _id:1,
                name:1,
                description:1,
                image:1,
                price:1
               } 
            }
        ]);

        res.json(products)
    }
     catch (error) {
        console.log("Error in get Recomended Products controller",error)
        res.status(500).json({message:"Server error",error:error.message})
    }
}

export const getProductsByCategory=async(req,res)=>{
    const {category} =req.params;
    try {
        const products=await Product.find({category});
        res.json({products})
    } catch (error) {
         console.log("Error in get Products by category controller",error)
        res.status(500).json({message:"Server error",error:error.message})
    }
}

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;

    const updatedProduct = await product.save();

    await updateFeaturedProductsCache();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error in Toggle Featured Product controller:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


async function updateFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({isFeatured:true}).lean();
        await redis.set("featured_products",JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in update cache function",error)
    }
}