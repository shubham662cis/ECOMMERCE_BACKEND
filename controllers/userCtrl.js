
const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler")
const { validateMongoDbId } = require("../utils/validateMongodbid1")
const { generateRefreshToken } = require("../config/refreshtoken")
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const { use } = require("bcrypt/promises");
const crypto = require('crypto');
require('dotenv').config();





const createUser = asyncHandler(async (req, res) => {


  const email = req.body.email;

  const findUser = await User.find({ email: email });
  if (findUser.length === 0) {

    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User already exits");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?.id);
    const updateUser = await User.findByIdAndUpdate(findUser?.id, {
      refreshToken: refreshToken,
    },
      { new: true });
    res.cookie("refreshToken", refreshToken, {

      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      Lastname: findUser?.Lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      role: findUser?.role

    });
  }
  else {
    throw new Error("password didn't match");
  }
})

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error)

  }
});

// const getaUser = asyncHandler(async(req,res)=>{

//   const {email} = req.body;
//   const getUser = await User.find({email:email});
//   // const [user1] = getUser; 
//   // const userEmail = user1.email;
//   if(getUser.length > 0)
//   {
//     res.json(getUser)
//   }
//   else{
//     throw new Error()
//   }
// });
const getaUser = asyncHandler(async (req, res) => {

  const { id } = req.params;
  validateMongoDbId(id)

  try {
    const getUser = await User.findById(id);
    if (getUser == null) throw new Error("id not availble")
    else res.json(getUser)

  } catch (error) {
    throw new Error(error);

  }
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id)
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser)

  } catch (error) {
    throw new Error(error)
  }

});

const updateaUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id)
  try {
    const updateUser = await User.findByIdAndUpdate(_id, {
      firstname: req?.body?.firstname,
      Lastname: req?.body?.Lastname,
      email: req?.body?.email,
      mobile: req?.body?.mobile,
      role: req?.body?.role
    }, {
      new: true,
    });
    res.json(updateUser)

  } catch (error) {
    throw new Error(error)

  }

});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("bhai bhai" + id)
  try {
    const blockUser = await User.findByIdAndUpdate(id, {
      isBlocked: true
    }, {
      new: true,
    });
    console.log(blockUser + "print it")
    res.json(blockUser)
  } catch (error) {
    throw new Error(error)
  }
});
const UnblockUser = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id)
  try {
    const UnblockUser = await User.findByIdAndUpdate(_id, {
      isBlocked: false
    }, {
      new: false,
    });
    res.json({
      message: "User has been unBlocked"
    })
  } catch (error) {
    throw new Error(error)
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken)
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token present in db or not not matched");
  jwt.verify(
    refreshToken, process.env.JWT_SECRET,
    (err,
      decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token")
      }
      const accessToken = generateToken(user?.id)
      res.json(accessToken)

    }
  );
});


const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken })
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true
    });
    return res.sendStatus(204);
  }
  const pUser = await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  console.log(pUser)
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true
  });
  res.sendStatus(204)
}
);


const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
})
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: "shubham899@mailinator.com",
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    console.log(resetURL)
    // sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now()},
  });

  if (!user) throw new Error("Token has expires,please try again");
  user.password = password;
  user.passwordResetToken = undefined;
  await user.save();
  res.json(user)

})


module.exports = {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getaUser,
  deleteUser,
  updateaUser,
  blockUser,
  UnblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword
}