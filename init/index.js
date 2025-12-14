const mongoose = require("mongoose")
const initData = require("./data.js")
const listing = require("../models/listing.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/nestara";

main().then(() =>{
    console.log("connect to mongoDB");
})
.catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj,owner : "69314ee3f79547e4e24b5aa1",}))
    await listing.insertMany(initData.data)
    console.log("Database initialized with sample data");
}

initDB();