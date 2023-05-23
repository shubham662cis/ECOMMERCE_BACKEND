const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
require('dotenv').config();


const authMiddleware =  asyncHandler(async(req,res,next )=>{
    let token ;
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
        console.log(token)
        try {
            console.log("insidwe try")

            if(token){
                console.log("insidwe if")

                const decoded = jwt.verify(token,process.env.JWT_SECRET);
                console.log(decoded)
                const user = await  User.findById(decoded?.id);
                console.log(user)
                req.user = user;
                next();
            }
            
        } catch (error) {
            throw new Error("Not authorzed token has expired, please login again");          
        }
        }
        else{
            throw new Error("there is no token attached to header")
        }
    });

    const isAdmin = asyncHandler(async(req,res,next)=>{
        const req1 = req.user;
        const {role} = req.user;
        console.log(role)
    
        if(role!=="isAdmin"){
            throw new Error("you are not a admin");
        }
        else{
            req.user= req1;
            next();
        }
        console.log(req.user)
    })
    module.exports= {authMiddleware,isAdmin}