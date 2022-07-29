const express = require("express");
const mySql = require("mysql");
const bcrypt = require("bcrypt")
require("dotenv").config();

//middleware to read req.body.<params>

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE

var mySqlConnection  = mySql.createPool({
    connectionLimit: 100,
    host:DB_HOST,
    user:DB_USER,
    password:DB_PASSWORD,
    database:DB_DATABASE
});

mySqlConnection.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
const app = express();
app.use(express.json());
app.listen(3000,() => console.log("Server listening at port 3000"));

//CREATE USER
app.post("/createUser", async (req,res) => {
    const empCode = req.body.empCode;
    const emailId = req.body.emailId;
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const roleName = "admin";
    const roleId = 1;
    mySqlConnection.getConnection( async (err, connection) => {
     if (err) throw (err)
     const sqlSearch = "SELECT * FROM users WHERE empCode = ?"
     const search_query = mySql.format(sqlSearch,[empCode])
     const sqlInsert = "INSERT INTO users (userId,empCode,emailId,password,roleName,roleId) VALUES (0,?,?,?,?,?)"
     const insert_query = mySql.format(sqlInsert,[empCode, emailId, hashedPassword, roleName, roleId])
     // ? will be replaced by values
     // ?? will be replaced by string
     await connection.query (search_query, async (err, result) => {
      if (err) throw (err)
      console.log("------> Search Results")
      console.log(result.length)
      if (result.length != 0) {
       connection.release()
       console.log("------> User already exists")
       res.sendStatus(409) 
      } 
      else {
       await connection.query (insert_query, (err, result)=> {
       connection.release()
       if (err) throw (err)
       console.log ("--------> Created new User")
       console.log(result.insertId)
       res.sendStatus(201)
      })
     }
    }) //end of connection.query()
    }) //end of db.getConnection()
    }) //end of app.post()

    //LOGIN (AUTHENTICATE USER)
app.post("/login", (req, res)=> {
    const empCode = req.body.empCode
    const emailId = req.body.emailId
    const password = req.body.password
    mySqlConnection.getConnection ( async (err, connection)=> {
     if (err) throw (err)
     const sqlSearch = "Select * from users where empCode = ?"
     const search_query = mySql.format(sqlSearch,[empCode])
     await connection.query (search_query, async (err, result) => {
      connection.release()
      
      if (err) throw (err)
      if (result.length == 0) {
       console.log("--------> User does not exist")
       res.sendStatus(404)
      } 
      else {
         const hashedPassword = result[0].password
         //get the hashedPassword from result
        if (await bcrypt.compare(password, hashedPassword)) {
        console.log("---------> Login Successful")
        res.send(`${empCode} is logged in!`)
        } 
        else {
        console.log("---------> Password Incorrect")
        res.send("Password incorrect!")
        } //end of bcrypt.compare()
      }//end of User exists i.e. results.length==0
     }) //end of connection.query()
    }) //end of db.connection()
    }) //end of app.post()

app.get("/", (req, res) => {
    res.send("Hello World");
});