const mongoose = require("mongoose");

const notificationSchema =
new mongoose.Schema(
{
  sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },

  receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },

  chat:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Chat",
  },

  message:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Message",
  },

  type:{
    type:String,
    enum:["MESSAGE"],
    default:"MESSAGE",
  },

  title:String,

  body:String,

  isRead:{
    type:Boolean,
    default:false,
  }

},
{
  timestamps:true
}
);

module.exports =
mongoose.model(
  "Notification",
  notificationSchema
);