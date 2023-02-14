const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postRoute = require("../backend/routes/posts");
const userRoute = require("../backend/routes/user");
const path = require("path");

const app = express();
mongoose
  .connect(
    "mongodb+srv://prijithpeter:admin123@cluster0.e5wbdut.mongodb.net/node-angular"
  )
  .then(() => console.log("mongo connected"))
  .catch(() => console.log("mongo failed"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );
  next();
});

app.use("/api/posts", postRoute);
app.use("/api/user/", userRoute);

module.exports = app;
