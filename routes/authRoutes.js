const express = require("express");
const{createUser, loginUserCtrl, getAllUsers, getaUser, deleteUser, updateaUser, blockUser, UnblockUser, handleRefreshToken, logout,updatePassword,forgotPasswordToken,resetPassword} = require("../controllers/userCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post('/register',createUser);
router.post('/updatePassword',authMiddleware,updatePassword);
router.post('/forgot-password-token',authMiddleware,forgotPasswordToken);
router.put('/reset-password/:token',resetPassword);
router.post('/login',loginUserCtrl);
router.get('/getUsers',getAllUsers);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logout)
router.get('/:id',authMiddleware,isAdmin,getaUser);
router.delete('/:id',deleteUser)
router.put('/edit-user',authMiddleware,updateaUser),
router.put('/:id',authMiddleware,blockUser),
router.put('/:id',authMiddleware,UnblockUser);



// router.post('/register',createUser, (req, res) => {
//     // Handle the POST request here
//     res.send('user ah')
//   });
module.exports = router;