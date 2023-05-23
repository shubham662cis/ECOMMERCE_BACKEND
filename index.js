const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
require('dotenv').config();
const authUser = require("./routes/authRoutes");
const productRoute = require("./routes/productRoutes");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const port =  4000;
const cookieParser = require('cookie-parser')
const morgan = require("morgan")

dbConnect();
app.use(morgan('dev'));
// app.use('/',(req,res)=>{
//     res.send("Hello from server side")
// })
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())
app.use("/api/user",authUser)
app.use("/api/product",productRoute)

app.use(notFound)
app.use(errorHandler)

app.listen(port, ()=>{
    console.log(`server is running at Port ${port}`)
})