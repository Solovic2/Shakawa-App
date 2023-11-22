const express = require("express");
require("dotenv").config();
const port = process.env.PORT;
const app = express();
const cookieParser = require("cookie-parser");
var cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser(process.env.SECRET_KEY));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Registration
app.use("/registration", require("./routes/registration"));

// Home Page
app.use("/", require("./routes/home"));

// Admin Panel
app.use("/admin", require("./routes/admin"));

try {
  // start the server
  app.listen(port, () => {
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
