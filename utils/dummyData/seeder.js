// الفايل ده عبارة عن سكريبت لاضافة ال
// dummy data
// بدل ما نضيفها من بوستمان او اي كلاينت سايد ابب

const fs = require("fs");
require("colors");
// give a color to strings in console.log
//  npm i colors
const dotenv = require("dotenv");
const Product = require("../../models/productModel");
const dbConnection = require("../../config/database");

dotenv.config({path: "../../config.env"});

// connect to DB
dbConnection();

// Read data
const products = JSON.parse(fs.readFileSync("./products.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);

    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// ازاي نشغل الاسكريبت
// cd utils/dummyData
// node seeder.js ؟
// ياما -i : insert
// ياما -d: delete

if (process.argv[2] === "-i") {
  // argv : ده اللي هيتكتب في التيرمنال
  // [2] يعني الحاجة رقم 2 في الكوماند اللي فوق ده
  // 0=> node , 1=>seeder.js , 2=> -i or -d
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
