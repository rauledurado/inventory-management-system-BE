const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// load env variables
dotenv.config({ path: "./config/config.env" });

// load models
const Bootcamp = require("./models/Bootcamps");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
});

// Read Json files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// import to db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log("Data imported...");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// import to db
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log("Data destroyed...");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
