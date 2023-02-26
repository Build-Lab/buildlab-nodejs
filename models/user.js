import mongoose, { Schema } from"mongoose";

const userSchema=new Schema(
  {
    userName:{
      type:String,
      require:true
    },
    email:{
      type:String,
      require:true
    },
    password:{
      type:String
    },
    token:{
      type:String
    },
    ProfilePhoto:{
      type:String
    },
    resetTokens:{
      type:String,
      default:""
    },
    role: {
      type: String,
      enum: ["developer", "tester", "admin"],
      default: "developer",
    },
    OTPReset: {
      type: String,
      default:null
    }
  }
);
const User=mongoose.model("user",userSchema);
export{User};

