var mysql = require("mysql");

//gcp db
// var con = mysql.createConnection({
//     host: "35.247.156.92",
//     user: "root",
//     password: "92951DFD",
//     database: "testdb",
// })

//local db
var con = mysql.createConnection({
    host: "localhost",
    user: "prai",
    password: "1234567890",
    database: "testdb",
})

con.connect()

function query(sql, params = []) {
    return new Promise( (resolve, reject) => {
        con.query(sql, params, function(err, result, fields) {
            if (err) {
                reject(err)
            }
            resolve(result)
        })
    })
    
}
module.exports = {
    query
}