// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const result = await cloud.openapi.logistics.addOrder({
        openid: wxContext.OPENID,
        sender: {
          name: '张三',
          tel: '020-88888888',
          mobile: '18666666666',
          company: '公司名',
          country: '中国',
          province: '广东省',
          city: '广州市',
          area: '海珠区',
          address: 'XX路XX号XX大厦XX栋XX',
          postCode: '123456'
        },
        receiver: {
          name: '王小蒙',
          tel: '020-77777777',
          mobile: '18610000000',
          company: '公司名',
          country: '中国',
          province: '广东省',
          city: '广州市',
          area: '天河区',
          address: 'XX路XX号XX大厦XX栋XX',
          postCode: '654321'
        },
        shop: {
          wxaPath: '/index/index?from=waybill&id=01234567890123456789',
          imgUrl: 'https://mmbiz.qpic.cn/mmbiz_png/OiaFLUqewuIDNQnTiaCInIG8ibdosYHhQHPbXJUrqYSNIcBL60vo4LIjlcoNG1QPkeH5GWWEB41Ny895CokeAah8A/640',
          goodsName: '微信气泡狗抱枕&微信气泡狗钥匙扣',
          goodsCount: 2
        },
        cargo: {
          count: 2,
          weight: 5.5,
          spaceX: 30.5,
          spaceY: 20,
          spaceZ: 20,
          detailList: [
            {
              name: '微信气泡狗抱枕',
              count: 1
            },
            {
              name: '微信气泡狗钥匙扣',
              count: 1
            }
          ]
        },
        insured: {
          useInsured: 1,
          insuredValue: 10000
        },
        service: {
          serviceType: 0,
          serviceName: '标准快递'
        },
        addSource: 0,
        orderId: '01234567890123456789',
        deliveryId: 'SF',
        bizId: 'xyz',
        customRemark: '易碎物品'
    })
    return result
  } catch (err) {
    return err
  }
}