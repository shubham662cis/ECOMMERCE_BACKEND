const express = require("express");
const router = express.Router();
const {createProduct, getProduct, getAllProduct, updateProduct}= require("../controllers/productCtrl")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.post("/",authMiddleware,isAdmin,createProduct);
router.get("/:id", getProduct);
router.get("/", getAllProduct);
router.put("/:id",authMiddleware,isAdmin, updateProduct);




module.exports= router