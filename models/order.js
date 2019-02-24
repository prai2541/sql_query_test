const db = require("../db/db")

async function updateOrderStatus(id, orderStatus) {
    try {
        let result = await db.query("update orders set orderStatus = ? where orderId = ?", [orderStatus, id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function getOrderStatus(id) {
    let orderStatus = await db.query("select * from orders where orderId = ?", [id])
    return orderStatus.length == 1 ? orderStatus[0] : null
}

module.exports = {
    updateOrderStatus,
    getOrderStatus,
}