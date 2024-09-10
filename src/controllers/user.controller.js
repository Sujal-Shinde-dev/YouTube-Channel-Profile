import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { fileUpload } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser=asyncHandler(async(req ,res)=>{
  const {fullname,email,username,password}=req.body
  if(
    [fullname,email,username,password].some((field)=>field?.trim()==="")
  )
  {
    throw new ApiError(400,"All fields are required")
}
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser)
    {
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar is required")
    }
    const avatar=await fileUpload(avatarLocalPath)
    const coverImage=await fileUpload(coverImageLocalPath)
    if(!avatar)
    {
        new ApiError(400,"Avatar is Required")
    }
    const user=await User.create({
        fullname,
        password,
        username:username.toLowerCase(),
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(
     200,createdUser,"User Registered")
)

})
export {registerUser}