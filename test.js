// const mongoose = require("mongoose");
// require("dotenv").config();

// (async () => {
//   try {
//     console.log(process.env.MONGO_URI);
//     console.log("Connecting...");

//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000,
//     });

//     console.log("Connected!");
//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// })();