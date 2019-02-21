// let express = require('express')
// let app = express()


// let mysql = require('mysql')
// let con = mysql.createConnection({
//   //n  host
// })
// //shouldnt be able to listen if no db connected
// con.connect(function(){

// })
// const config = {
//     user: process.env.SQL_USER,
//     password: process.env.SQL_PASSWORD,
//     database: process.env.SQL_DATABASE
//   };
  
//   if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//     config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
//   }
  
//   // Connect to the database
//   const knex = Knex({
//     client: 'mysql',
//     connection: config
//   });

// app.get('/', function(req, res){
//     con.query('select * from user', function(err, result){
//         if(err){
//             //
//         }

//         res.json(result)
        
//     })
//     //sres.json({
//     //    test: 'this is test'
//     //})
// })

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }
// app.listen(port);


const express = require('express')
const app = express()
//const db = require("./db/db")

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const POST = 3000;
const passwordHelper = require('./helpers/password')



async function test() {
    let res =await db.query("select * from products")
    console.log(res)
}

app.get('/', (req, res) => {
    res.json({test: passwordHelper.generate()})
})


const productModel = require('./models/product')


//fe wants list of product
app.get('/product',async (req, res) => {
    res.json(await productModel.getAll())
})


// wants specific product 
app.get('/product/:id',async (req, res) => {
  let id = req.params.id
  let products = await productModel.get(id)
  if(products) {
    res.json(products)
  }
  else {
    res.status(404).send()
  }
})

// query in new product
app.post('/product',async (req, res) => {
  let {name, description, price} = req.body
  let [err, insertId] = await productModel.create(name, description, price)
  //db.query("insert into products set name = ?, description = ?, price = ?", [name, description, price])
  if (err) {
    res.status(500),json(err)
  } else {
    res.json({
      id: insertId
    })
  }
})


app.put("/product/:id", async (req, res) => {
  let id = req.params.id
  let {name, description, price} = req.body
  let [err] = await productModel.edit(id, name, description, price)
  if (err) {
    res.status(500),json(err)
  } else {
    res.json({
      id: id
    })
  }
})


app.delete("/product/:id", async (req, res) => {
  let id = req. params.id
  let [err] = await productModel.del(id)
  if (err) {
    res.status(500),json(err)
  } else {
    res.json(await productModel.getAll)
  }
})




app.listen(POST, () => {
    console.log("server started!")
})    