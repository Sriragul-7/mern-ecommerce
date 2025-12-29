import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import redis from "../lib/redis.js"


//Generate Refresh and Access tokens
const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};
// store refresh token
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, {
    ex: 60 * 60 * 24 * 7
  });
};


// Set Cookies
const cookieOptions = {
  httpOnly: true,
  secure: true,         // FORCE secure ALWAYS
  sameSite: "none",     // FORCE cross-site cookie
  path: "/",
};


//  httpOnly:true,       //------> prevent XSS attacks, cross site scripting attack
// sameSite:"strict",   //------> prevent CSRF attacks, cross-site request forgery attack

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};



export const signup=async(req,res)=>{
console.log("Signup body:", req.body);


  const { email, password, name }=req.body 
  try{
    const userExist= await User.findOne({email});

    if(userExist){
        return res.status(400).json({message:"User Already exisit"})
    }
    const user= await User.create({name,email,password})

    // Authenticate
    const {accessToken,refreshToken}= generateTokens(user._id);
    await storeRefreshToken(user._id,refreshToken)
    setCookies(res,accessToken,refreshToken);

    res.status(201).json({
      user:{
        _id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
    },message:"User created successfully"})
   }
   catch(error){
    console.log("Signup in login Controller");
     res.status(500).json({message:error.message})
   }
};


export const login=async(req,res)=>{
  console.log("Login body:", req.body);
   try{
    const {email,password}=req.body
    const user=await User.findOne({email})

    if(user && (await user.comparePassword(password))){
      const {refreshToken,accessToken}=generateTokens(user._id)

      await storeRefreshToken(user._id,refreshToken);
      setCookies(res,accessToken,refreshToken);

      res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
      });
    }
    else{
      res.status(401).json({message:"Invalid email or password"});
    }

   }
   catch(error){
    console.log("Error in login Controller");
    res.status(500).json({message:error.message})
   }
};

export const logout=async(req,res)=>{
       try{
      const refreshToken=req.cookies.refreshToken;
      if(refreshToken){
        const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token:${decoded.userId}`);
      }
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      res.json({message:"Logged out successfully"});
    }
    catch(error){
      console.log("Error in logout Controller");
      res.status(500).json({message:"Server error",error:error.message});
    }
}
 
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const redisKey = `refresh_token:${decoded.userId}`;

    const storedToken = await redis.get(redisKey);
    if (storedToken !== refreshToken) return res.status(401).json({ message: "Invalid refresh token" });

  
    await redis.expire(redisKey, 60 * 60 * 24 * 7);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch {
    return res.status(401).json({ message: "Refresh failed" });
  }
};


export const getProfile=async(req,res)=>{
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in get Profile contoller",error.message);
    res.json(500).json({message:error.messag});
  }
}