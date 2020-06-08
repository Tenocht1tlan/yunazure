// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    return await db.collection('shipping-address').where({
      _openid:wxContext.OPENID,
      'info.id':event.key
    }).update({
      // data 传入需要局部更新的数据
      data: {
        'info.$.address': event.address,
        'info.$.cityId': event.cityId,
        'info.$.code': event.code,
        'info.$.default': event.default,
        'info.$.districtId': event.districtId,
        'info.$.linkMan': event.linkMan,
        'info.$.mobile': event.mobile,
        'info.$.provinceId': event.provinceId
      }
    })
  } catch(e) {
    console.error(e)
  }
}