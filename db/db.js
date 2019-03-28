var mysql = require("mysql");

//gcp db
// var con = mysql.createConnection({
//     host: "35.247.156.92",
//     user: "root",
//     password: "92951DFD",
//     database: "testdb",
// })

//gcp ACTUAL VCANTEEN DB
// var con = mysql.createConnection({
//     host: "35.240.232.120",
//     user: "root",
//     password: "root",
//     database: "vcanteen-db",
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