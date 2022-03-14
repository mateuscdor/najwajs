
const path = require("path");
const express = require("express");
const app = express();
const connect = require("./connect");

app.get("/", (req,res) => res.send("OK"))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
  connect();
})