const db = require('../db/db')

async function getAll() {
    return await db.query('select * from products')
}
async function get(id) {
    let products = await db.query("select * from products where id = ?", [id])
    return products.length == 1 ? products[0] : null
}
async function create(name, description, price) {
    try {
        let result = await db.query("insert into products(name, description, price) values(?, ?, ?)", [name, description, price])
        return [null, result.insertId]
    } 
    catch(err) {
        return [err, null]
    }
}
async function edit(id, name, description, price) {
    try {
        let result = await db.query("update products set name = ?, description = ?, price = ? where id =?", [name, description, price, id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}
async function del(id) {
    try {
        let result = await db.query("delete from products where id = ?", [id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

module.exports = {
    getAll, 
    get, 
    create,
    edit,
    del,
}