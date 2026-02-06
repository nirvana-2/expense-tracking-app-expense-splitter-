const {check,validationResult}=require('express-validator')
//rules for registratiion
const registerValidator=[
    //for name
    check('name','Name is required').not().isEmpty().trim().isLength({min:4}).withMessage('Name must be atleast 4 characters long'),
    //for email
    check('email','valid email is required').isEmail().normalizeEmail(),
    //for password
    check('password','enter a password with +6 character must include 1 uppercase and 1 number')
    .isLength({min:6}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/).withMessage('password must contain 1 uppercase and 1 number'),
    //for phone-number
    check('phoneNumber','enter a valid phone number').matches(/^[0-9]{10}$/).withMessage('phone number must be 10 digits'),
];
//rules for login
const loginValidator=[
    //for email
    check('email','please include a valid email').isEmail().normalizeEmail(),
    check('password','password is required').exists(),
];
const validate=(req,res,next)=>{
    console.log('Validate middleware called');
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    };
    console.log('Validation passed, calling next()');
    next();
};


module.exports={registerValidator,loginValidator,validate};