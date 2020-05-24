// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("content = " + event)
  if(event.Content == '1'){
    await cloud.openapi.customerServiceMessage.send({
      touser: wxContext.OPENID,
      msgtype: 'text',
      text: {
        content: '您好，我是专属小客服1',
      },
    })
  }else if (event.Content == '2') {
    await cloud.openapi.customerServiceMessage.send({
      touser: wxContext.OPENID,
      msgtype: 'text',
      text: {
        content: '您好，我是专属小客服2',
      },
    })
  }else if (event.Content == '3') {
    await cloud.openapi.customerServiceMessage.send({
      touser: wxContext.OPENID,
      msgtype: 'text',
      text: {
        content: '您好，我是专属小客服3',
      },
    })
  }else{
    await cloud.openapi.customerServiceMessage.send({
      touser: wxContext.OPENID,
      msgtype: 'text',
      text: {
        content: '您需要咨询的问题类型是？(回复序号即可)客服热线：xxx \n1: 售前咨询\n2: 交期咨询 \n3: 售后服务',
      },
    })
  }
  
  return 'success'
}