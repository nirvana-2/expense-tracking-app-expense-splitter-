const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'group name is very crucial'],
        trim: true
    },
    description: {
        type: String
    },
    //this link to user model
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    //this tracks the one who created the group
    admin: {  // CHANGED: singular
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

},
    { timestamps: true });
module.exports = mongoose.model("Group", groupSchema);  // Also capitalize "Group"