// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    return await db.collection('shopping-cart').where({
      'items.good_id': event.key
    }).update({
      data: {
        'items.$': _.remove()
      }
    })
  } catch(e) {
    console.error(e)
  }
}