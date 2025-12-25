import Coupon from "../models/coupon.model.js";

export const getCoupon=async(req,res)=>{
    try {
        const coupon=await Coupon.findOne({userId:req.user._id,isActive:true})
        res.json(coupon || null)
    } catch (error) {
        console.log("Error in Get Coupon controller",error.message);
        res.status(500).json({message:"Server Error",error:error.message})
    }
}

export const validateCoupon=async(req,res)=>{
    try {
        const {code}=req.body;
        const coupon=await Coupon.findOne({userId:req.user._id,code:code,isActive:true})
        if(!coupon){
            return res.status(404).json({messsage:"Coupon Not Found"})
        }
        if(coupon.expirationDate<new Date()){
            coupon.isActive=false;
            await coupon.save();
            return res.status(404).json({message:"Coupon Expired"})
        }
        res.json(coupon)
    } catch (error) {
        console.log("Error in validate Coupon controller",error.message);
        res.status(500).json({message:"Server Error",error:error.message})
    }
}