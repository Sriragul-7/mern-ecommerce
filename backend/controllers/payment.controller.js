import Coupon from "../models/coupon.model.js";
import stripe from "../lib/stripe.js";
import Order from   "../models/order.model.js";
import User from "../models/user.model.js"
import dotenv from "dotenv"

dotenv.config();

export const createCheckoutSession=async(req,res)=>{
    try {
        const {products,couponCode}=req.body;

        if(!Array.isArray(products) || products.length===0){
            return res.status(400).json({error:"Invalid or empty products"})
        }

        let totalAmount=0;

        const lineItems=products.map(product=>{
            const amount=Math.round(product.price *100) // stripe wants in the format of cents
            totalAmount += amount * product.quantity;

            return {
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:product.name,
                        images:[product.image],
                    },
                    unit_amount:amount
                },
                quantity: product.quantity || 1,
                
            }
        });
        let coupon=null;
        if(couponCode){
            coupon=await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true});
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage/100);
            }
        }

        const session=await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineItems,
            mode:"payment",
            success_url:`${process.env.CLIENT_URI}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.CLIENT_URI}/purchase-cancel`,
            discounts: coupon ? [
                {
                    coupon:await createStripeCoupon(coupon.discountPercentage)
                }

            ] : [],
            metadata:{
                userId:req.user._id.toString(),
                couponCode:couponCode || "",
                products:JSON.stringify(
                    products.map((P)=>({
                        id:P._id,
                        quantity: P.quantity,
                        price: P.price

                    }))
                ),
            }
        });
        if(totalAmount>=20000){
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({id:session.id,url: session.url, totalAmount:totalAmount/100})
    } catch (error) {
        console.log("Error in create Checkout Session controller",error.message);
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

export const checkoutSuccess=async(req,res)=>{
    try {
    const {sessionId}=req.body;
    const session=await stripe.checkout.sessions.retrieve(sessionId);

    if(session.payment_status==="paid"){
        if(session.metadata.couponCode){
            await Coupon.findOneAndUpdate({
                code:session.metadata.couponCode,
                userId:session.metadata.userId
            },{isActive:false})
        }
        
        const products=JSON.parse(session.metadata.products);

        const newOrder=new Order({
            user:session.metadata.userId,
            products:products.map((product)=>({
                Product:product.id,
                quantity:product.quantity,
                price:product.price,
            })),
            totalAmount:session.amount_total/100,
            stripeSessionId:sessionId
        })

        await newOrder.save();

         await User.findByIdAndUpdate(session.metadata.userId, {
      cartItems: [],
    });

        res.status(200).json({
            success:true,
            message:"Payment sucessfull, order created, and coupon deactivated if used.",
            orderId: newOrder._id,
        })

    }
    } catch (error) {
        console.log("Error processing sucessfull checkout",error.message);
        res.status(500).json({message:"Server Error",error:error.message});
    }

}


async function createStripeCoupon(discountPercentage){
    const coupon=await stripe.coupons.create({
        percent_off:discountPercentage,
        duration:"once",
    })
    return coupon.id
}

 async function createNewCoupon(userId){
    await Coupon.findOneAndDelete({userId:userId});
    
    const newCoupon=new Coupon({
        code:"GIFT"+ Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage:10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId:userId
    })

    await newCoupon.save()

    return newCoupon
 }