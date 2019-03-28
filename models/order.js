const db = require("../db/db")

const orderStatusDomains = [
    "COOKING",
    "DONE",
    "COLLECTED",
    "CANCELLED",
    "TIMEOUT",
]

async function updateOrderStatus(id, orderStatus) {

    if( !orderStatusDomains.includes(orderStatus)){
        return ["order_status_not_exist", null]
    }
    try {
        let result = await db.query("update orders set order_status = ? where order_id = ?", [orderStatus, id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function getOrderStatus(id) {
    let orderStatus = await db.query("select * from orders where order_id = ?", [id])
    return orderStatus.length == 1 ? orderStatus[0] : null
}

async function getSlotNo(id) {
    let slotNo = await db.query("select pickup_slot from orders where order_id = ?", [id])
    return slotNo.length == 1 ? slotNo[0] : null
}

async function getVendorMenu(vid) {
    let minBasePrice = 999999999
    let minMainPrice = 999999999
    let vendor = await db.query("select restaurant_number, restaurant_name from vendors where vendor_id = ?", [vid])  //need to add select vendor_image b4 deploy
    let menulist = await db.query("select * from food where vendor_id = ? and food_type != 'alacarte'", [vid])
    let foodlist = await db.query("select * from food where vendor_id = ? and food_type = 'alacarte'", [vid])
    menulist.forEach(menu => {
        if (menu.food_type === "COMBINATION_BASE") {
            if (menu.food_price < minBasePrice) minBasePrice = menu.food_price
        }
        if (menu.food_type === "COMBINATION_MAIN") {
            if (menu.food_price < minMainPrice) minMainPrice = menu.food_price
        }
    })
    let response = {"vendor" : vendor, "menulist": foodlist, "minCombinationPrice" : minBasePrice + minMainPrice}
    return response
    
}

async function getFoodAndExtra(vid, fid) {
    let food = await db.query("select food_id, food_name, food_price from food where food_id =?", [fid])
    let extraList = await db.query("select food_id, food_name, food_price, food_status from food where food_type = 'COMBINATION_EXTRA' and vendor_id = ?", [vid])
    let response = {"food" : food, "extralist" : extraList}
    return response
}

async function getBaseMainExtraList(vid) {
    let foodlist = await db.query("select food_id, food_name, food_price, food_status, food_type from food where vendor_id = ? and food_type != 'ALACARTE'", [vid])
    let baselist, mainlist, extralist = {}
    foodlist.forEach(menu => {
        if (menu.food_type == "COMBINATION_BASE") {
            baselist.push(menu)
        }
        if (menu.food_type == "COMBINATION_MAIN") {
            mainlist.push(menu)
        }
        if (menu.food_type == "COMBINATION_EXTRA") {
            extralist.push(menu)
        }
    })
    let response = {"baseList" : baselist, "mainList" : mainlist, "extraList" : extralist}
    return response

}

// async function getCustOrderList(cid) {
//     let custOrderList = await db.query("select order_id, food_id, food_name, food_image, price, restaurant_name, restaurant_number, order_status, created_at from orders inner join food on orders.vendor_id=food.vendor_id ")
//     return custOrderList
// }
module.exports = {
    updateOrderStatus,
    getOrderStatus,
    getSlotNo,
    getVendorMenu,
    getFoodAndExtra,
    getBaseMainExtraList,
}