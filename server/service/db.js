// const mongoose = require("mongoose");

// async function connection() {
//   // await mongoose.connect(process.env.DATABASE_URL, {
//   await mongoose.connect(
//     "mongodb+srv://Elaine:3PpsBUKrTtK5eHr@cluster0.vninh.mongodb.net/ski-ticket?retryWrites=true&w=majority",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//       useCreateIndex: true,
//     }
//   );
//   const db = mongoose.connection;
//   db.on("error", console.error.bind(console, "connection error:"));
//   db.once("open", function () {
//     console.log('we are connected');
//   });
// }
// connection();
