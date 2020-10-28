const app = getApp()
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()
Page({
  data: {
    statusType: [
      {
        status: 9999,
        label: '全部'
      },
      {
        status: 0,
        label: '待付款'
      },
      {
        status: 1,
        label: '待发货'
      },
      {
        status: 2,
        label: '待收货'
      },
      {
        status: 3,
        label: '待评价'
      },
    ],
    status: 9999,
    hasRefund: false,
    badges: [0, 0, 0, 0, 0]
  },
  statusTap: function(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      status
    });
    this.onShow()
  },
  cancelOrderTap: function(e) {
    const that = this
    const orderid = e.currentTarget.dataset.id
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          db.collection('orderlist').where({
            'postData.orderid': orderid
          }).remove().then(res=>{
            console.log(res)
            that.onShow()
          }).catch(err=>{
            console.log(err)
          })
        }
      }
    })
  },
  refundApply (e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  toPayTap: function(e) {
    // 防止连续点击--开始
    if (this.data.payButtonClicked) {
      wx.showToast({
        title: '休息一下~',
        icon: 'none'
      })
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 2000)
    const that = this
    const orderId = e.currentTarget.dataset.id
    let money = e.currentTarget.dataset.money
    let _msg = '订单金额: ' + money +' 元'
    wx.showModal({
      title: '请确认支付',
      content: _msg,
      confirmText: "确认支付",
      cancelText: "取消支付",
      success: function (res) {
        if (res.confirm) {
          that.confirmOrder(orderId, money)
        } else {
          console.log('用户点击取消支付')
        }
      }
    })
  },
  //提交订单
  confirmOrder: function(orderId, money) {
    let that = this
    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "pay",
        out_trade_no: orderId,
        body: 'yunazure-scarf-DIY',
        total_fee: parseInt(money) * 100
      },
      success(res) {
        console.log("云函数payment提交成功：", res.result)
        that.pay(res.result, orderId)
      },
      fail(res) {
        console.log("云函数payment提交失败：", res)
        // this.onShow()
      },
      complete(){
      }
    })
  },
  pay(payData, orderid) {
    const that = this
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id
      signType: 'MD5',
      paySign: payData.paySign, //签名
      success(res) {
        console.log("支付成功：", res)
        wx.cloud.callFunction({  //巧妙利用小程序支付成功后的回调，再次调用云函数，通知其支付成功，以便进行订单状态变更
          name: "payment",
          data: {
            command: "payOK",
            out_trade_no: 'Yunazure-' + new Date().getTime()
          },
          success(){
            db.collection('orderlist').where({
              'postData.orderid': orderid
            }).update({
              data: {
                'postData.status': 1
              }
            })
            that.setData({
              status: 1
            })
          }
        })
        that.order(orderid)
      },
      fail(res) {
        wx.showToast({
          title: '支付取消！',
          icon: 'none'
        })
        // this.onShow()
      },
      complete(res) {
        console.log("支付完成：", res)
      }
    })
  },
  order:function(e){
    let receiverInfo
    this.data.orderList.forEach(val=>{
      if(val.postData.orderid == e){
        receiverInfo = val.postData
        return
      }
    })
    let orderInfoDetail = JSON.parse(receiverInfo.postData.goodsJsonStr)
    console.log("orderInfoDetail = "+ orderInfoDetail)
    let list = []
    orderInfoDetail.forEach(e=>{
      list.push({
          name: e.name,
          count: e.count
      })
    })
    console.log("detail = "+ list)
    var orderInfo = {
      sender: {
        name: '周晓赟',
        tel: '',
        mobile: '13575726661',
        company: '杭州知语服饰有限公司',
        country: '中国',
        province: '浙江省',
        city: '杭州市',
        area: '桐庐县',
        address: '方埠工业园区Yunazure仓库',
        postCode: ''
      },receiver: {
        name: receiverInfo.postData.linkMan,
        tel: '',
        mobile: receiverInfo.postData.mobile,
        company: '',
        country: '中国',
        province: receiverInfo.postData.provinceId,
        city: receiverInfo.postData.cityId,
        area: receiverInfo.postData.districtId,
        address: receiverInfo.postData.address,
        postCode: receiverInfo.postData.code
      },shop: {
        wxaPath: '/order-details/index?from=waybill&id=' + e,
        imgUrl: orderInfoDetail[0].pic,
        goodsName: orderInfoDetail[0].name,
        goodsCount: receiverInfo.postData.goodsNum
      },cargo: {
        count: receiverInfo.postData.goodsNum,
        weight: 0.5,
        spaceX: 40,
        spaceY: 40,
        spaceZ: 3,
        detailList: list
      },insured: {
        useInsured: 0,
        insuredValue: 0
      },service: {
        serviceType: 0,// SF:0（标准快递）
        serviceName: '标准快递'//'标准快递'
      },
      addSource: 0,
      orderId: e,
      deliveryId: 'SF', //'SF',DB
      bizId: 'SF_CASH',//'SF_CASH',DB_CASH
      customRemark: receiverInfo.postData.remark
    }
    wx.cloud.callFunction({
      name:'addOrder',
      data: {
        sender: orderInfo.sender,
        receiver: orderInfo.receiver,
        shop: orderInfo.shop,
        cargo: orderInfo.cargo,
        insured: orderInfo.insured,
        service: orderInfo.service,
        addSource: orderInfo.addSource,
        orderId: orderInfo.orderId,
        deliveryId: orderInfo.deliveryId,
        bizId: orderInfo.bizId,
        customRemark: orderInfo.customRemark
      }
    }).then(res=>{
      console.log("waybillId = " + res.result.waybillId + "waybillData = " + res.result.waybillData + "errMsg = " + res.result.errMsg)
      wx.showModal({
        title: '提示',
        content: res.result.waybillId,
        showCancel: false,
        success(){
          db.collection('orderlist').where({
            'postData.orderid': e
          }).update({
            data: {
              'postData.waybillId': res.result.waybillId
            }
          })
        }
      })
    }).catch(err=>{
      wx.showModal({
        title: "提示",
        content: err,
        showCancel: false
      })
    })
  },
  onLoad: function(options) {
    if (options && options.type) {
      if (options.type == 99) {
        this.setData({
          hasRefund: true
        })
      } else {
        this.setData({
          status: options.type
        })
      }      
    }
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow() {
    const isLogined = wx.getStorageSync('isloged')
    if (isLogined) {
      this.doneShow()
    } else {
      wx.showModal({
        title: '提示',
        content: '本次操作需要您的登录授权',
        confirmText: '去登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: "/pages/my/index"
            })
          } else {
            wx.navigateBack()
          }
        }
      })
    }
  },
  doneShow() {
    // 获取订单列表
    var that = this
    var openid = wx.getStorageSync('openid')
    // this.getOrderStatistics(openid)
    if(that.data.status == 9999){
      db.collection("orderlist").where({
        _openid: openid
      }).get().then(res=>{
        if(res.data.length > 0){
          var list = []
          for(let i=0;i<res.data.length;i++){
            let tmp = res.data[i].postData
            tmp.goodsJsonStr = JSON.parse(res.data[i].postData.goodsJsonStr)
            list.push(tmp)
          }
          that.setData({
            orderList: list
          })
        }else{
          that.setData({
            orderList: []
          })
        }
      })
    }else{
      db.collection("orderlist").where({
        _openid: openid
      }).get().then(res=>{
        if(res.data.length > 0){
          var list = []
          for(let i=0;i<res.data.length;i++){
            if(res.data[i].postData.status == that.data.status){
              let tmp = res.data[i].postData
              tmp.goodsJsonStr = JSON.parse(res.data[i].postData.goodsJsonStr)
              list.push(tmp)
            }
          }
          that.setData({
            orderList: list
          })
        }else{
          that.setData({
            orderList: null
          })
        }
      })
    }
  },
  getOrderStatistics(key) {
    db.collection("orderlist").where({
      _openid: key
    }).get().then(res=>{
        const badges = this.data.badges
        badges[1] = res.data.count_id_no_pay
        badges[2] = res.data.count_id_no_transfer
        badges[3] = res.data.count_id_no_confirm
        badges[4] = res.data.count_id_no_reputation
        this.setData({
          badges
        })
    })
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数

  }
})