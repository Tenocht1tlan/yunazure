// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const result = await cloud.openapi.logistics.getPath({
        openid: wxContext.OPENID,
        orderId: event.orderId,
        deliveryId: event.deliveryId,
        waybillId: event.waybillId
      })
    return result
  } catch (err) {
    return err
  }
}