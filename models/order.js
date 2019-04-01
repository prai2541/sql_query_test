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
    let slotNo = await db.query("select slot_id as slotID from Is_At where order_id = ?", [id])
    return slotNo.length == 1 ? slotNo[0] : null
}

async function getVendorMenu(vid) {
    let minBasePrice = 999999999
    let minMainPrice = 999999999
    let minCombinationPrice = 0
    let availist = []
    let soldoutlist = []
    let hasCombination = true
    let vendor = await db.query("select restaurant_number as restaurantNumber, restaurant_name as restaurantName from Vendors where vendor_id = ?", [vid])  //need to add select vendor_image b4 deploy
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
    foodlist.forEach(food => {
        const {food_id,food_name,food_price} = food
        if (food.food_status == "AVAILABLE") {
            availist.push({foodId:food_id,foodName:food_name,foodPrice:food_price})
        }
        if (food.food_status == "SOLD_OUT") {
            soldoutlist.push({foodId:food_id,foodName:food_name,foodPrice:food_price})
        }
    })    
    minCombinationPrice = minBasePrice+minMainPrice
    if (minBasePrice == 999999999 || minMainPrice == 999999999) {
        minCombinationPrice = null
        hasCombination = false
    }
    let response = {"vendor" : vendor[0], "availableList": availist, "soldOutList" : soldoutlist, "hasCombination" : hasCombination, "minCombinationPrice" : minCombinationPrice}
    return response
    
}

async function getFoodAndExtra(vid, fid) {
    let food = await db.query("select food_id as foodId, food_name as foodName, food_price as foodPrice from Food where food_id =?", [fid])
    let extraList = await db.query("select food_id as foodId, food_name as foodName, food_price as foodPrice, food_status as foodStatus from Food where food_type = 'EXTRA' and vendor_id = ?", [vid])
    let response = {"food" : food[0], "extralist" : extraList}
    return response
}

async function getBaseMainExtraList(vid) {
    let foodlist = await db.query("select food_id, food_name, food_price, food_status, food_type from Food where vendor_id = ? and food_type != 'ALACARTE'", [vid])
    let baselist = []
    let mainlist = []
    let extralist = []
    foodlist.forEach(menu => {
        const {food_id,food_name,food_price,food_status,food_type} = menu
        if (menu.food_type == "COMBINATION_BASE") {
            baselist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
        }
        if (menu.food_type == "COMBINATION_MAIN") {
            mainlist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
        }
        if (menu.food_type == "EXTRA") {
            extralist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
        }
    })
    let response = {"baseList" : baselist, "mainList" : mainlist, "extraList" : extralist}
    return response

}

async function postNewOrder(orders, customerId, vendorId, createdAt, customerMoneyAccountId, totalPrice) {
    let response = []
    let vendorAcc = await db.query("select vm.balance, vm.money_account_id as moneyAccId from VendorMoneyAccounts vm join Vendor_Links vl on vm.money_account_id = vl.money_account_id where vl.vendor_id = ?",[vendorId])
    let custAcc = await db.query("select balance, money_account_id as moneyAccId from CustomerMoneyAccounts where money_account_id = ?", [customerMoneyAccountId])
    console.log(custAcc[0].balance, vendorAcc[0].balance)
    custAcc[0].balance -= totalPrice
    vendorAcc[0].balance += totalPrice
    console.log(custAcc[0].balance, vendorAcc[0].balance)
    console.log(vendorAcc)
    console.log(custAcc)

    let changeCustBalance = await db.query("update CustomerMoneyAccounts set balance = ? where money_account_id = ?", [custAcc[0].balance, customerMoneyAccountId])
    let changeVendorBalance = await db.query("update VendorMoneyAccounts set balance = ? where money_account_id = ?", [vendorAcc[0].balance, vendorAcc[0].moneyAccId])
    let transacResult = await db.query("insert into Transactions(created_at, customer_money_account_id, vendor_money_account_id) values (?, ?, ?)", [createdAt, customerMoneyAccountId, vendorAcc[0].moneyAccId])
    
    orders.forEach(async order => {
        let names = []
        let extraNames = []
        let fids = []
        let orderprice = 0
        let orderName = ""
        let orderNameExtra = ""
        
        
        order.forEach(food => {
            fids.push(food.foodId)
            orderprice += food.foodPrice
            if (food.foodType != "EXTRA") {
            names.push(food.foodName)
            } else {
            extraNames.push(food.foodName)
        }
        })
        if (names[0]!= null) {
        orderName = names.reduce((a,b) => {
            if (a > b) return `${b}, ${a}`
            else return `${a}, ${b}`
            
        })
        }
        if (extraNames[0] != null) {
        orderNameExtra =  extraNames.reduce((a,b) => {
            if (a > b) return `${b}, ${a}`
            else return `${a}, ${b}`
            
        })
        
        }
        if (orderName == "") orderName = null
        if (orderNameExtra == "") orderNameExtra = null
        
        
        
        let orderResult = await db.query("insert into Orders(order_name, order_name_extra, order_status, order_price, customer_id, created_at, vendor_id, transaction_id) values (?, ?, 'COOKING', ?, ?, ?, ?, ?)", [orderName, orderNameExtra, orderprice, customerId, createdAt, vendorId, transacResult.insertId])
        fids.forEach(fid => {
            let insertContain = db.query("insert into Contains(order_id, food_id) values (?, ?)", [orderResult.insertId, fid])
        })

        response.push({"orderId" : orderResult.insertId, "orderName" : orderName, "orderNameExtra" : orderNameExtra, "orderStatus" : "COOKING"})
        
    })
    console.log(response)
    return response
}    
    // foods.forEach(food =>  {
    //     fids.push(food.food_id)
    //     if (food.food_type != "EXTRA") {
    //         names.push(food.food_name)
    //     } else {
    //         extraNames.push(food.food_name)
    //     }
    // })
    // let order_name = names.reduce((a,b) => {
    //     if (a > b) return `${b}, ${a}`
    //     else return `${a}, ${b}`
        
    // })
    
    // let order_name_extra =  extraNames.reduce((a,b) => {
    //     if (a > b) return `${b}, ${a}`
    //     else return `${a}, ${b}`
        
    // })
    // console.log(order_name)
    // console.log(order_name_extra)
    // console.log(names)
    // console.log(extraNames)
    // console.log(fids)

    // let orderResult = await db.query("insert into Orders(order_name, order_name_extra, order_status, order_price, customer_id, created_at, vendor_id, transaction_id) values (?, ?, 'COOKING', ?, ?, ?, ?, ?)", [order_name, order_name_extra, order_price, customer_id, created_at, vendor_id, transaction_id])
    // fids.forEach(fid => {
    //     let insertContain = db.query("insert into Contains(order_id, food_id) values (?, ?)", [orderResult.insertId, fid])
    // })
    //let response = {"order_id" : orderResult.insertId, "order_name" : order_name, "order_name_extra" : order_name_extra, "order_status" : 'COOKING'}
    


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