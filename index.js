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
const orderModel = require("./models/order")
const clearSlot = require("./db/db")


//fe wants list of product
app.get('/product',async (req, res) => {
    res.json(await productModel.getAll())
})



// wants specific product, given id 
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
    res.status(500).json(err)
  } else {
    res.json({
      id: insertId
    })
  }
})

//edit a product given id
app.put("/product/:id", async (req, res) => {
  let id = req.params.id
  let {name, description, price} = req.body
  let [err, result] = await productModel.edit(id, name, description, price)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  }
})

//delete a product given id
app.delete("/product/:id", async (req, res) => {
  let id = req. params.id
  let [err, result] = await productModel.del(id)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  }
})

app.put("/v1/orders/:orderId/status", async (req, res) => {
  let id = req.params.orderId
  let {orderStatus} = req.body
  let [err, result] = await orderModel.updateOrderStatus(id, orderStatus)
  if (err == "order_status_not_exist") {
    res.status(400).json({
      message: err
    })
  } else if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.json(await orderModel.getOrderStatus(id))
  }
})

app.get("/v1/orders/:orderId", async (req, res) => {
  let id = req.params.orderId
  let orderStatus = await orderModel.getOrderStatus(id)
  if (orderStatus) {
    res.json(orderStatus)
  } else {
    res.status(404).send()
  }
})

app.get("/v1/orders/:id/slot", async (req, res) => {                 
  let id = req.params.id
  let slotNo = await orderModel.getSlotNo(id)
  if (slotNo) {
    res.json(slotNo)
  } else {
    res.status(404).send()
  }
})

app.get("/v1/orders/:vid/menu", async (req, res) => {                     
  let vid = req.params.vid
  let result = await orderModel.getVendorMenu(vid)
  res.json(result)
})

app.get("/v1/:vid/menu/:fid", async (req, res) => {
  let vid = req.params.vid
  let fid = req.params.fid
  let foodAndExtra = await orderModel.getFoodAndExtra(vid, fid)
  res.json(foodAndExtra)
})

app.get("/v1/orders/:vid/combination", async (req, res) => {
  let vid = req.params.vid
  let result = await orderModel.getBaseMainExtraList(vid)
  res.json(result)
})

app.get("/v1/orders/:oid/status-change", async (req, res) => {
  let oid = req.params.oid
  let status = req.body.order_status
  let [err, result] = await orderModel.updateOrderStatus(oid, status)
  if (err == "order_status_not_exist") {
    res.status(400).json({
      message: err
    })
  } else if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.json(await orderModel.getOrderStatus(id))
  }
})

app.post("/v1/orders/new", async (req, res) => {
  let {foods, order_price, customer_id, vendor_id, created_at, transaction_id} = req.body
  //let foods = req.body.foods
  let response = await orderModel.postNewOrder(foods, order_price, created_at, vendor_id, customer_id, transaction_id)
  res.json(response)

})



// app.post("/v1/orders/new", async (req, res) => {
//   let {food_id, }
// })
// app.get("/v1/orders/customers/:custid", async (req, res) => {
//   let id = req.params.custid

// })

// function removeExpire (){
//   let now = new Date()
//   let time = `${now.getYear() + 1900}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
//   clearSlot.query("update slot set order_id = null, expire_at = null where expire_at < ?", [time])
  
// }

// setInterval(removeExpire, 3*60*1000)

app.listen(POST, () => { 
    console.log("server started on port "+ POST)
})    