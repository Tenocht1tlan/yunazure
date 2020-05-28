// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    return await db.collection('shopping-cart').where({
      _openid:wxContext.OPENID,
      'items.key':event.key
    }).update({
      // data 传入需要局部更新的数据
      data: {
        'items.$.number': event.number
      }
    })
  } catch(e) {
    console.error(e)
  }
}