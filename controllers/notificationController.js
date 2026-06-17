const Notification =
require("../models/Notification");

exports.getNotifications =
async(req,res)=>{

  try{

    const notifications =
    await Notification.find({

      receiver:req.user._id

    })
    .populate(
      "sender",
      "name profilePic"
    )
    .sort({
      createdAt:-1
    });

    res.status(200).json({

      success:true,

      notifications

    });

  }catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};



exports.markAsRead =
async(req,res)=>{

  try{

    const notification =
    await Notification.findByIdAndUpdate(

      req.params.id,

      {
        isRead:true
      },

      {
        new:true
      }

    );

    res.status(200).json({

      success:true,

      notification

    });

  }catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};