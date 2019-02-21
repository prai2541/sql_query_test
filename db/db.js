var mysql = require("mysql");

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