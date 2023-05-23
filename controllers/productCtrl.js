const asyncHandler = require("express-async-handler")
const Product = require("../models/ productModel");
const { validateMongoDbId } = require("../utils/validateMongodbid1");
const { default: slugify } = require("slugify");
const mongoose = require('mongoose');

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const p = req.body;
        const newProduct = await Product.create(p);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});
const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id); s
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async (req, res) => {

    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }

        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateProduct)
    } catch (error) {
        throw new Error(error)
    }
})

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // filtering
        const queryObj = { ...req.query };

        const excludeFeilds = ["page", "sort", "limit", "fields"];
        excludeFeilds.forEach((el) =>
            delete queryObj[el]);
        let queryString = JSON.stringify(queryObj);
        // regular based string replacement operation 
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryString));
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // limiting the fields

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // pagination 
        const page = req.query.page;
        console.log(page)
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
           const countDocuments= await Product.countDocuments();
           console.log(countDocuments + "helo+=")
           if (skip >= countDocuments) throw new Error("This Page does not exists");
        }
        const products = await query.exec(); // Execute the query and await the results
        res.json(products);
    }
    catch (error) {
        throw new Error(error);
    }
})
module.exports = { createProduct, getAllProduct, getProduct, updateProduct }
