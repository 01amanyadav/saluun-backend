const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");

const {
 createUser,
 findUserByEmail
} = require("../models/userModel");


exports.registerUser = asyncHandler(async (req,res)=>{

 const { name,email,password } = req.body;

 if(!name || !email || !password){

    const error = new Error("All fields required");
    error.status = 400;
    throw error;

 }

 const hashedPassword = await bcrypt.hash(password,10);

 const user = await createUser(
    name,
    email,
    hashedPassword
 );

 res.json({
    id:user.id,
    name:user.name,
    email:user.email
 });

});



exports.loginUser = asyncHandler(async (req,res)=>{

 const { email,password } = req.body;

 const user = await findUserByEmail(email);

 if(!user){

    const error = new Error("User not found");
    error.status = 400;
    throw error;

 }

 const validPassword = await bcrypt.compare(
    password,
    user.password
 );

 if(!validPassword){

    const error = new Error("Wrong password");
    error.status = 400;
    throw error;

 }

 const token = jwt.sign(
    {id:user.id},
    process.env.JWT_SECRET
 );

 res.json({token});

});