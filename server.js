
const path = require("path");
const express = require("express");
const app = express();
const connect = require("./connect");

app.get("/", (req,res) => res.send("OK"))

app.listen(process.env.PORT || 3000, () => {
  console.log("Running");
  connect();
})