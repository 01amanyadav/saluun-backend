const db = require('../config/db');
const pool = require("../config/db");

const createUser = async (name,email,password) =>{

    const newUser = await pool.query(
        "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
        [name,email,password]
    );

    return newUser.rows[0];

};

const findUserByEmail = async (email)=>{

 const result = await db.query(

  "SELECT * FROM users WHERE email=$1",

  [email]

 );

 return result.rows[0];

};

module.exports = {
 createUser,
 findUserByEmail
};