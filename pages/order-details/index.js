const app = getApp();
const CONFIG = require('../../config.js')
// import wxbarcode from 'wxbarcode'
const db = wx.cloud.database()

Page({
    data:{
      orderId: '',
      goodsList:[],
      orderDetail:[],
      linkMan:'',
      mobile:'',
      provinceId:'',
      districtId:'',
      address:'',
      status:0,
      waybillId:"",
      time:""
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
      let len = this.data.orderId.toString().length
      let tim = parseInt(this.data.orderId.toString().substring(9,len))
      let time = this.formatTimeTwo(tim,'Y-M-D h:m:s')
      this.setData({
        time:time
      });
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
          waybillId:res.data[0].postData.waybillId
        })
      })
    },
    /** 
     * 时间戳转化为年 月 日 时 分 秒 
     * number: 传入时间戳 
     * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
    */
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
    },
    wuliuDetailsTap:function(e){
      wx.navigateTo({
        url: "/pages/wuliu/index?data=" + this.data.orderDetail
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
          deliveryId: 'SF',
          waybillId: ''
        }
      }).then(res=>{
        wx.showModal({
          content: 'waybillId:' + res.result.waybillId,
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
          deliveryId: 'SF',
          waybillId: this.data.waybillId
        }
      }).then(res=>{
        wx.showModal({
          content: '物流信息：' + res.result.pathItemList,
          showCancel: true,
          title: '提示'
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
          deliveryId: 'SF',
          waybillId: this.data.waybillId
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