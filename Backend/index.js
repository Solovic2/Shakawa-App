const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const cookieParser = require("cookie-parser");
var cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser(process.env.SECRET_KEY));

// Registration
app.use("/registration", require("./routes/registration"));

// Home Page
app.use("/", require("./routes/home"));

// Admin Panel
app.use("/admin", require("./routes/admin"));

try {
  // start the server
  app.listen(port || 9000, () => {
    console.log(`Server started on port ${port}`);
  });
} catch (error) {
  if (error.code === "EADDRINUSE") {
    console.log("Port In Use");
  }
}

// process.on("uncaughtException", (error)=>{
//   console.log('Uncaught Exception', error);
//   process.exit(1);
// });
