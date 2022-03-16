const express = require("express");
const app = express();
const connect = require("./connect");

app.get("/", (req,res) => res.sendFile(__dirname + "/qrcode.png"))

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
  connect();
})

module.exports = app