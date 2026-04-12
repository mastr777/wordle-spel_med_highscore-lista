
const mongoose = require("mongoose");

async function connectToDatabase() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wordle");
  console.log("Connected to MongoDB");
}

module.exports = connectToDatabase;



