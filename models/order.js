const db = require("../db/db")

const orderStatusDomains = [
    "COLLECTED",
    "TIMEOUT",
    
]

async function updateOrderStatus(id, orderStatus) {

    

    if( !orderStatusDomains.includes(orderStatus)){
        return ["order_status_not_exist", null]
    }
    try {
        let result = await db.query("update Orders set order_status = ? where order_id = ? and order_status = 'DONE'", [orderStatus, id])
        //let del = await db.query("delete from Is_At where order_id = ?", [id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
    
}

async function getOrderStatus(id) {
    let orderStatus = await db.query("select * from Orders where order_id = ?", [id])
    return orderStatus.length == 1 ? orderStatus[0] : null
}

async function getSlotNo(id) {
    let slotNo = await db.query("select slot_id from Orders where order_id = ?", [id])
    return slotNo.length == 1 ? slotNo[0] : null
}

async function getVendorMenu(vid) {
    let minBasePrice = 999999999
    let minMainPrice = 999999999
    let minCombinationPrice = minBasePrice + minMainPrice
    let vendor = await db.query("select restaurant_number, restaurant_name from Vendors where vendor_id = ?", [vid])  //need to add select vendor_image b4 deploy
    let menulist = await db.query("select * from Food where vendor_id = ? and food_type != 'alacarte'", [vid])
    let foodlist = await db.query("select * from Food where vendor_id = ? and food_type = 'alacarte'", [vid])
    menulist.forEach(menu => {
        if (menu.food_type === "COMBINATION_BASE") {
            if (menu.food_price < minBasePrice) minBasePrice = menu.food_price
        }
        if (menu.food_type === "COMBINATION_MAIN") {
            if (menu.food_price < minMainPrice) minMainPrice = menu.food_price
        }
    })
    if (minBasePrice+minMainPrice == 1999999998) {
        minCombinationPrice = null
    }
    let response = {"vendor" : vendor, "menulist": foodlist, "minCombinationPrice" : minCombinationPrice}
    return response
    
}

async function getFoodAndExtra(vid, fid) {
    let food = await db.query("select food_id, food_name, food_price from Food where food_id =?", [fid])
    let extraList = await db.query("select food_id, food_name, food_price, food_status from Food where food_type = 'EXTRA' and vendor_id = ?", [vid])
    let response = {"food" : food, "extralist" : extraList}
    return response
}

async function getBaseMainExtraList(vid) {
    let foodlist = await db.query("select food_id, food_name, food_price, food_status, food_type from Food where vendor_id = ? and food_type != 'ALACARTE'", [vid])
    let baselist = []
    let mainlist = []
    let extralist = []
    foodlist.forEach(menu => {
        if (menu.food_type == "COMBINATION_BASE") {
            baselist.push(menu)
        }
        if (menu.food_type == "COMBINATION_MAIN") {
            mainlist.push(menu)
        }
        if (menu.food_type == "EXTRA") {
            extralist.push(menu)
        }
    })
    let response = {"baseList" : baselist, "mainList" : mainlist, "extraList" : extralist}
    return response

}

async function postNewOrder(foods, order_price, created_at, vendor_id, customer_id, transaction_id) {
    let names = []
    let extraNames = []
    let fids = []
    foods.forEach(food =>  {
        fids.push(food.food_id)
        if (food.food_type != "EXTRA") {
            names.push(food.food_name)
        } else {
            extraNames.push(food.food_name)
        }
    })
    let order_name = names.reduce((a,b) => {
        if (a > b) return `${b}, ${a}`
        else return `${a}, ${b}`
        
    })
    
    let order_name_extra =  extraNames.reduce((a,b) => {
        if (a > b) return `${b}, ${a}`
        else return `${a}, ${b}`
        
    })
    // console.log(order_name)
    // console.log(order_name_extra)
    // console.log(names)
    // console.log(extraNames)
    // console.log(fids)

    let orderResult = await db.query("insert into Orders(order_name, order_name_extra, order_status, order_price, customer_id, created_at, vendor_id, transaction_id) values (?, ?, 'COOKING', ?, ?, ?, ?, ?)", [order_name, order_name_extra, order_price, customer_id, created_at, vendor_id, transaction_id])
    fids.forEach(fid => {
        let insertContain = db.query("insert into Contains(order_id, food_id) values (?, ?)", [orderResult.insertId, fid])
    })
    let response = {"order_id" : orderResult.insertId, "order_name" : order_name, "order_name_extra" : order_name_extra, "order_status" : 'COOKING'}
    return response

}    
    // orders.forEach(({orderID,foodName,foodType}) => {
    //   if(!tempMap[foodName]){
    //     tempMap[foodName] = foodType;
    //   }
    //   if(currentOrderID !== orderID){
    //   currentOrderID = orderID;
    //     output.push({orderID,foodName});
    //   }else{
    //     const target = output.length - 1;
    //     output[target].foodName = output[target].foodName + ', ' + foodName 
    //   }
    // })

    // const finalOutput = output.map((element) => { 
    //   const {foodName} = element;
    //   const splittedFood = foodName.split(',');
    //   const sorted = splittedFood.sort((current,next) => {
    //     const scurrent = current.trim();
    //     const snext = next.trim();
    //     const currentFoodType = tempMap[scurrent];
    //     const nextFoodType = tempMap[snext];
    //     return allFoodType.indexOf(currentFoodType) > allFoodType.indexOf(nextFoodType);
    //   });
    //   return {...element,foodName:sorted.join()};
    // })

    // return finalOutput;



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
    postNewOrder,
}