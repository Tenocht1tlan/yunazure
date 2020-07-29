const app = getApp();
const CONFIG = require('../../config.js')
// import wxbarcode from 'wxbarcode'
const db = wx.cloud.database()

Page({
    data:{
      orderId:0,
      goodsList:[],
      orderDetail:[],
      linkMan:'',
      mobile:'',
      provinceId:'',
      districtId:'',
      address:'',
      status:0

    },
    onLoad:function(e){
      const accountInfo = wx.getAccountInfoSync()
      var orderId = e.id
      this.setData({
        orderId: orderId,
        appid: accountInfo.miniProgram.appId
      });
    },
    onShow : function () {
      var that = this
      db.collection("orderlist").where({
        "postData.orderid": that.data.orderId
      }).get().then(res=>{
        var goodsList = JSON.parse(res.data[0].postData.goodsJsonStr)
        that.setData({
          orderDetail: res.data[0].postData,
          goodsList: goodsList,
          linkMan:res.data[0].postData.linkMan,
          mobile:res.data[0].postData.mobile,
          provinceId:res.data[0].postData.provinceId,
          districtId:res.data[0].postData.districtId,
          address:res.data[0].postData.address,
          status:res.data[0].postData.status,

        })
        console.log(this.data.orderDetail)
        console.log(this.data.linkMan)
      })
        // 绘制核销码
        // if (res.data.orderInfo.hxNumber && res.data.orderInfo.status > 0) {
        //   wxbarcode.qrcode('qrcode', res.data.orderInfo.hxNumber, 650, 650)
        // }
    },
    wuliuDetailsTap:function(e){
      var orderId = e.currentTarget.dataset.id
      wx.navigateTo({
        url: "/pages/wuliu/index?id=" + orderId
      })
    },
    confirmBtnTap:function(e){
      let that = this
      let orderId = this.data.orderId
      wx.showModal({
          title: '确认您已收到商品？',
          content: '',
          success: function(res) {
            if (res.confirm) {
              WXAPI.orderDelivery(wx.getStorageSync('token'), orderId).then(function (res) {
                if (res.code == 0) {
                  that.onShow();                  
                }
              })
            }
          }
      })
    },
    submitReputation: function (e) {
      let that = this;
      let postJsonString = {};
      postJsonString.token = wx.getStorageSync('token');
      postJsonString.orderId = this.data.orderId;
      let reputations = [];
      let i = 0;
      while (e.detail.value["orderGoodsId" + i]) {
        let orderGoodsId = e.detail.value["orderGoodsId" + i];
        let goodReputation = e.detail.value["goodReputation" + i];
        let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

        let reputations_json = {};
        reputations_json.id = orderGoodsId;
        reputations_json.reputation = goodReputation;
        reputations_json.remark = goodReputationRemark;

        reputations.push(reputations_json);
        i++;
      }
      postJsonString.reputations = reputations;
      WXAPI.orderReputation({
        postJsonString: JSON.stringify(postJsonString)
      }).then(function (res) {
        if (res.code == 0) {
          that.onShow();
        }
      })
    },
    queryOrder:function(){
      wx.cloud.callFunction({
        name:'queryOrderInfo',
        data: {
          orderId: this.data.orderId,
          deliveryId: 'TEST',
          waybillId: ''
        }
      }).then(res=>{
        wx.showModal({
          content: 'orderId:' + res.result.orderId + ' -key ' + res.result.waybillData[0].key +' -value ' + res.result.waybillData[0].value,
          showCancel: true,
          title: 'result'
        })
        console.log(res)
      }).catch(err=>{
        console.log("getOrderInfo fail "+ err)
      })
    },
    queryOrderPath:function(){
      wx.cloud.callFunction({
        name:'getOrderPath',
        data: {
          orderId: this.data.orderId,
          deliveryId: 'TEST',
          waybillId: 'Yunazure-1592918244451_1592918252_waybill_id'
        }
      }).then(res=>{
        wx.showModal({
          content: 'orderId:' + res.result.orderId + ' -waybillId ' + res.result.waybillId +' -pathItemNum ' + res.result.pathItemNum + '- pathItemList' + res.result.pathItemList,
          showCancel: true,
          title: 'result'
        })
        console.log(res)
      }).catch(err=>{
        console.log("queryOrderPath fail "+ err)
      })
    },
    cancelOrder(){
      wx.cloud.callFunction({
        name:'cancelOrder',
        data: {
          orderId: this.data.orderId,
          deliveryId: 'TEST',
          waybillId: 'Yunazure-1592918244451_1592918252_waybill_id'
        }
      }).then(res=>{
        wx.showModal({
          content: 'succ',
          showCancel: true,
          title: 'result'
        })
        console.log(res)
      }).catch(err=>{
        console.log("cancelOrder fail "+ err)
      })
    }
})