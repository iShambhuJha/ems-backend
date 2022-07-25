const express = require("express");
const mySql = require("mysql");

var mySqlConnection  = mySql.createConnection({
    host:'localhost',
    user:'root',
    password:'1234',
    database: 'empdb'
});

mySqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
const app = express();
app.listen(3000,() => console.log("Server listening at port 3000"));

app.get("/", (req, res) => {
    res.send("Hello World");
});