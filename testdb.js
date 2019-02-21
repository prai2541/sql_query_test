var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "prai",
    password: "1234567890",
    database: "testdb",
})

con.connect(function(err){
    
    if (err) throw err
    
    con.query("SELECT * FROM products", function(err, result, fields) {
        if (err) throw err
        console.log(result)
    })

})