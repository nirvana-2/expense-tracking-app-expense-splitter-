const mongoose=require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please add a name']
    },
    email:{
        type:String,
        required:[true,'please add a email'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'please add a password']
    },
    phoneNumber:{
        type:String,
        required:[true,'please add a phone-number'],
        unique:true,
        trim:true
    },
},
{ timestamps:true }
);

// Encryption before user is saved into database
// REMOVE the 'next' parameter completely
userSchema.pre('save', async function () {
    // Only hash password if it is new or modified
    if(!this.isModified("password")){
        return; // Just return, no next()
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No next() call needed with async
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);