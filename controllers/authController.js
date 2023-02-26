import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import otpGenerator from"otp-generator";
import sendEmail from "../middlewares/nodemailer.js";

// ki user yaamel register nhotolo fi ProfilePhoto taswira par defaut esmha default.png w baad ki yaamel login ibadel wahdo
export async function register(req, res) {
  const { userName, email, password } = req.body;

if (!(userName && password && email)) {
  res.status(400).send("All fields are required");
}

const oldUser = await User.findOne({ email: email });
if (oldUser) {
  return res.status(409).send("User already exists");
}

let NewUser = new User({
  userName:userName,
  email: email,
  password: await bcrypt.hash(password, 10),
  ProfilePhoto: `${req.protocol}://${req.get("host")}${process.env.IMGURL}/fifa.jpg`,
});

User.create(NewUser)
  .then((docs) => {
    res.status(201).json(docs);
  })
  .catch((err) => {
    res.status(500).json({ error: err });
  });

}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(400).send("All fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("Unexistant user");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }

  const newToken = await jwt.sign({ user }, process.env.TOKENKEY, {
    expiresIn: "4d",
  });

  user.token = newToken;

  try {
    await user.updateOne({ _id: user._id, token: newToken });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}

export async function sendOTPResetEmail(req, res) {
  let user = await User.findOne({ email: req.body.Email });
  if (user) {
    //create OTP
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    //update OTP in the database
    User.findOneAndUpdate({ _id: user._id }, { OTPReset: OTP })
      .then(async (docs) => {
        //send otp to email
        sendEmail(user.email, "Password Reset", OTP);
        user.OTPReset = OTP;
        res.status(200).json("OTP generated");
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}

//Change password
export async function resetPassword(req, res) {
  
  const user = await User.findOne({ email: req.body.Email });

  if (user) {
    if (req.body.OTP === user.OTPReset) {
      const EncryptedPassword = await bcrypt.hash(req.body.Password, 10);
      console.log("EncryptedPassword")

      await User.findOneAndUpdate(
        { _id: user._id },
        {
          password: EncryptedPassword,
          OTPReset: null

        }
      )
        .then((docs) => {
          user.password =  EncryptedPassword;
          res.status(200).json(docs);
        })
        .catch((err) => {
          res.status(500).json("Error while reseting password");
        });
    }
  }
}

export async function logout(req, res) {
  await User.findOneAndUpdate(
    { _id: req.params.id },
    { 
      token: null,
    }
  )
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
} 