const User=require('../models/user');
const jwt=require('jsonwebtoken');
//generate token
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"30d"});
};
//to register a user
const register=async (req,res)=>{
    console.log('Register controller called');
    console.log('Request body:', req.body);
    const{name,email,password,phoneNumber}=req.body;
    try {
        //to check if the user acutally exist
        console.log('Checking if user exists...');

        const userExits=await User.findOne({
            $or:[{email},{phoneNumber}]
        });
        if (userExits){
            return res.status(400).json({
                message:"this user already exists"
            });
        }
        //to create a user
        console.log('Creating new user...');
        const user=await User.create({
            name,
            email,
            password,
            phoneNumber
        });
        //to respond with user data and token
        console.log('User created successfully');
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            // password:user.password,
            phoneNumber:user.phoneNumber,
            token:generateToken(user._id),
        })
    } catch (error) {
        console.error('Error in register controller:', error);
        res.status(500).json({
            message:error.message
        });
        
    };
};
//login user
const login=async(req,res)=>{
    const{email,password}=req.body;
    try {
        const user=await User.findOne({email});
        if(user&&(await user.matchPassword(password))){
            res.status(200).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phoneNumber,
                token:generateToken(user._id),
            });
        }else{
            res.status(401).json({message:'invalid email or invalid password'})
        }
    } catch (error) {
        res.status(500).json({message:error.message})
        
    }
};
module.exports={generateToken,register,login};

