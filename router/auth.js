const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const authenticate = require("../middleware/authenticate");

//DB
require('../db/conn');

//Schema
const User = require('../model/userSchema');

//Registration Page
router.post('/register', async(req,res)=>{
 
    const { name, email, phone, work, password, cpassword } = req.body;
   
    if(!name || !email || !phone || !work || !password || !cpassword)
    {
        console.log("please fill the field properly");
        return res.status(422).json({error: "please fill the field properly"});
    }
    if(password != cpassword)
    {
        console.log("please confirm the same password");
        return res.status(422).json({error: "please confirm the same password"});
    }

    try{ 

        const userExist = await User.findOne({ email: email });
      
        if(userExist){
            console.log("Email already exists");
        return res.status(422).json({ error: "Email already exists"});
        }

        const user = new User({ name, email, phone, work, password, cpassword}); 

       const userRegister = await user.save();

        if(userRegister){
            console.log(user);
            console.log("user registered successfully");
            res.status(201).json({ message: "user registered successfully"});
        }
        else{
            console.log("failed to register");
            res.status(500).json({error: "failed to register"});
        }
    

    }
    catch(err){
        console.log(err);
    }
 
});

//Login Page
router.post('/signin', async (req,res)=>{
    try
    {
        let token;
        const { email, password}=req.body;
 
        if(!email || !password){
         console.log("Please fill the data");
         return res.status(400).json({errror:"Please fill the data"})
        }
 
        const userLogin = await User.findOne({email:email}); 
       
        if(userLogin)
        {
           const isMatch = await bcrypt.compare(password, userLogin.password);
           token = await userLogin.generateAuthToken();
           res.cookie("jwtoken",token,{
             expires:new Date(Date.now()+ 25892000),
             httpOnly:true
           });
           if(!isMatch)
           {
             console.log("Invalid Credentials");
             return res.status(400).json({error:"Invalid Credentials"});
           }
           else
           {
             console.log("User SignIn Successful");
           res.json({message:"User SignIn Successful"});
           }
        }
        else
        {
         console.log("Email you have entered has not registered or incorrect");
         return res.status(400).json({error:"Email you have entered has not registered or incorrect"});
        }
     }  
     catch(err)
     {
        console.log(err);
     }
 })
 
 //
//For Getting User Data in About and Contact Page
router.get("/getData",authenticate, (req,res) => 
{
    res.send(req.rootUser);
});

//Logout page
router.get("/logout1", (req,res) => 
{
    console.log("User Logged Out");
    res.clearCookie('jwtoken', {path: '/'});
    res.status(200).send("User Logout");
});

//Storing the Data Given in Contact Form in the DB
router.post('/contact', authenticate, async (req,res)=>{
    try{
        const {name,email,phone,message}= req.body;
        if(!name || !email || !phone || !message){
            console.log("Please Fill the Contact Form Completely");
            return res.json({error: "Please Fill the Contact Form"})
        }
        const userContact = await User.findOne({_id: req.userID});

        if(userContact){
            const userMessage = await userContact.addMessage(name,email,phone,message);
            await userContact.save();
            res.status(201).json({message:"Successfully sent message"});
            console.log("Message Recieved");
        }

    }catch(error){
        console.log(error);
    }

})

//Export to app.js
module.exports = router;