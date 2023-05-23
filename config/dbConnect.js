//object destructuring syntax
//Object destructuring is a feature in JavaScript that allows you to extract properties from an object and assign them to individual variables. It is a shorthand way of extracting values from objects and arrays, and can make your code more concise and readable.


const { default :mongoose } = require('mongoose');

const dbConnect =()=>{
try {
  const conn = mongoose.connect(process.env.MongoDB_URL);
  console.log("Database Connected Successfully");
} catch (error) {
  console.log("Databse Error");
  
}

};
module.exports=dbConnect;