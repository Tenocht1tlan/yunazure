const app = getApp()
Page({
  data: {
    orderDetail:{},
    logisticsTraces:[
      {
        "actionTime": 1604496326,
        "actionType": 100001,
        "actionMsg": "快递员已成功取件"
      },
      {
        "actionTime": 1604507400,
        "actionType": 200001,
        "actionMsg": "快件已到达xxx集散中心，准备发往xxx"
      },
      {
        "actionTime": 1604525400,
        "actionType": 300001,
        "actionMsg": "快递员已出发，联系电话xxxxxx"
      }
    ]
  },
  onLoad: function (e) {
    this.setData({
      orderDetail:e.data
    })
  },
  onShow: function () {
    this.queryOrderPath()
  },
  // {
  //   "openid": "OPENID",
  //   "deliveryId": "SF",
  //   "waybillId": "12345678901234567890",
  //   "pathItemNum": 3,
  //   "pathItemList": [
  //     {
  //       "actionTime": 1533052800,
  //       "actionType": 100001,
  //       "actionMsg": "快递员已成功取件"
  //     },
  //     {
  //       "actionTime": 1533062800,
  //       "actionType": 200001,
  //       "actionMsg": "快件已到达xxx集散中心，准备发往xxx"
  //     },
  //     {
  //       "actionTime": 1533072800,
  //       "actionType": 300001,
  //       "actionMsg": "快递员已出发，联系电话xxxxxx"
  //     }
  //   ],
  //   "errMsg": "openapi.logistics.getPath:ok"
  // }
  queryOrderPath:function(){
    wx.cloud.callFunction({
      name:'getOrderPath',
      data: {
        orderId: this.data.orderDetail.orderid,
        deliveryId: 'SF',
        waybillId: this.data.orderDetail.waybillId
      }
    }).then(res=>{
      console.log('num= ' + res.result.pathItemNum + ' - list= ' + res.result.pathItemList + ' - errMsg= ' + res.result.errMsg)
      if(!res.result.pathItemNum || res.result.pathItemNum == 0){
        this.setData({
          logisticsTraces: [{
            "actionTime": '',
            "actionMsg": "揽件中"
          }]
        })
      }else{
        for(let i = 0;i<this.data.logisticsTraces.length;i++){
          let tmp = this.data.logisticsTraces[i].actionTime * 1000
          let actionTime = this.formatTimeTwo(tmp,'Y-M-D h:m:s')
          // res.result.pathItemList[i].actionTime = actionTime
          var item = "logisticsTraces["+i+"].actionTime";
          this.setData({
            [item]: actionTime
          })
        }
        // this.setData({
        //   logisticsTraces: res.result.pathItemList
        // })
      }
    }).catch(err=>{
      wx.showModal({
        title: '提示',
        content: '网络异常',
        showCancel: false
      })
    })
  },
   formatTimeTwo(number, format) {
    var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
    var returnArr = [];
    var date = new Date(number);
    returnArr.push(date.getFullYear());
    returnArr.push(this.formatNumber(date.getMonth() + 1));
    returnArr.push(this.formatNumber(date.getDate()));
    returnArr.push(this.formatNumber(date.getHours()));
    returnArr.push(this.formatNumber(date.getMinutes()));
    returnArr.push(this.formatNumber(date.getSeconds()));
    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
})