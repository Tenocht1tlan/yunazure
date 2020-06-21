// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const result = await cloud.openapi.logistics.addOrder({
        openid: wxContext.OPENID,
        sender: event.sender,
        receiver: event.receiver,
        shop: event.shop,
        cargo: event.cargo,
        insured: event.insured,
        service: event.service,
        addSource: event.addSource,
        orderId: event.orderId,
        deliveryId: event.deliveryId,
        bizId: event.bizId,
        customRemark: event.customRemark
    })
    return result
  } catch (err) {
    return err
  }
}