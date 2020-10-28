const app = getApp()
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()
Page({
  data: {
    wxlogin: true,

    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    goodsNum: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId: undefined, //拼团的话记录团号
    hasAddressData: false,

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    curCouponShowText: '请选择使用优惠券', // 当前选择使用的优惠券
    peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
    remark: ''
  },
  async onShow(){
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      this.doneShow()
    }
  },
  async doneShow() {
    let shopList = []
    var goodsInfo = {}
    if ("buyNow" == this.data.orderType) {
      //立即购买下单
      var goodsInfo = wx.getStorageSync('buyNowInfo')
    } else {
      //购物车下单
      var goodsInfo = wx.getStorageSync('shopCartInfo')
    }
    if (goodsInfo && goodsInfo.items) {
      shopList = goodsInfo.items
      this.setData({
        goodsList: shopList,
        peisongType: this.data.peisongType
      })
      this.initShippingAddress()
    }
    
  },
  onLoad(e) {
    let _data = {
      isNeedLogistics: 1
    }
    if (e.orderType) {
      _data.orderType = e.orderType
    }
    if (e.pingtuanOpenId) {
      _data.pingtuanOpenId = e.pingtuanOpenId
    }
    this.setData(_data)
  },
  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },
  remarkChange(e){
    this.data.remark = e.detail.value
  },
  order:function(e){
    let orderInfoDetail = JSON.parse(this.data.goodsJsonStr)
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
        name: e.linkMan,
        tel: '',
        mobile: e.mobile,
        company: '',
        country: '中国',
        province: e.provinceId,
        city: e.cityId,
        area: e.districtId,
        address: e.address,
        postCode: e.code
      },shop: {
        wxaPath: '/order-details/index?from=waybill&id=' + e.orderId,
        imgUrl: orderInfoDetail[0].pic,
        goodsName: orderInfoDetail[0].name,
        goodsCount: this.data.goodsNum
      },cargo: {
        count: this.data.goodsNum,
        weight: 0.3,
        spaceX: 30,
        spaceY: 30,
        spaceZ: 10,
        detailList: list
      },insured: {
        useInsured: 0,
        insuredValue: 0
      },service: {
        serviceType: 0,// SF:0（标准快递）
        serviceName: '标准快递'//'标准快递'
      },
      addSource: 0,
      orderId: e.orderid,
      deliveryId: 'SF', //'SF',DB
      bizId: 'SF_CASH',//'SF_CASH',DB_CASH
      customRemark: this.data.remark
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
        title: "下单成功！",
        content: res.result.waybillId,
        showCancel: false,
        success(){
          db.collection('orderlist').where({
            'postData.orderid': e.orderid
          }).update({
            data: {
              'postData.waybillId': res.result.waybillId
            }
          })
        }
      })
    }).catch(err=>{
      wx.showModal({
        title: "下单失败！",
        content: err,
        showCancel: false
      })
    })
  },
  // queryOrder:function(){
  //   wx.cloud.callFunction({
  //     name:'queryOrderInfo',
  //     data: {
  //       orderId: orderInfo.orderId,
  //       deliveryId: orderInfo.deliveryId,
  //       waybillId: event.waybillId
  //     }
  //   }).then(res=>{
  //     wx.showToast({
  //       title: '成功通知物流',
  //       icon: 'success'
  //     })
  //     console.log("下单成功：" + res);
  //   }).catch(err=>{
  //     console.log("下单失败："+ err)
  //   })
  // },
  //提交订单
  confirmOrder: function(orderInfo) { 
    let that = this
    let orderid = orderInfo.orderid
    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "pay",
        out_trade_no: orderid,
        body: 'yunazure-scarf-DIY',
        total_fee: orderInfo.totalAmount * 100
      },
      success(res) {
        console.log("云函数payment提交成功：", res.result)
        that.pay(res.result, orderInfo)
      },
      fail(res) {
        console.log("云函数payment提交失败：", res)
        wx.redirectTo({
          url: "/pages/order-list/index?type=0"
        })
      },
      complete(){

      }
    })
  },
  //实现小程序支付
  pay(payData, orderInfo) {
    const that = this
    wx.requestPayment({ //已经得到了5个参数
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
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
              'postData.orderid': orderInfo.orderid
            }).update({
              data: {
                'postData.status': 1
              }
            })
            wx.redirectTo({
              url: "/pages/order-list/index?type=1"
            })
          }
        })
        that.order(orderInfo)
      },
      fail(res) {
        db.collection('orderlist').where({
          'postData.orderid': orderInfo.orderid
        }).update({
          data: {
            'postData.orderid': 'Yunazure-' + new Date().getTime()
          }
        })
        console.log("支付失败：", res)
        wx.redirectTo({
          url: "/pages/order-list/index?type=0"
        })
      },
      complete(res) {
        console.log("支付完成：", res)
      }
    })
  },
  //退款
  // refund: function() {
  //   let that = this;
  //   wx.cloud.callFunction({
  //     name: "payment",
  //     data: {
  //       command: "refund",
  //       out_trade_no: "test0005",
  //       body: 'a7r2相机租赁',
  //       total_fee: 1,
  //       refund_fee: 1,
  //       refund_desc: '押金退款'
  //     },
  //     success(res) {
  //       console.log("云函数payment提交成功：", res)
  //     },
  //     fail(res) {
  //       console.log("云函数payment提交失败：", res)
  //     }
  //   })
  // },
  goCreateOrder(){
      this.createOrder(true)
  },
  createOrder: function (e) {
    var that = this
    var openid = wx.getStorageSync('openid')
    var remark = this.data.remark // 备注信息
    
    let postData = {
      orderid: 'Yunazure-' + new Date().getTime(),
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark,
      peisongType: that.data.peisongType
    };
    if (that.data.kjId) {
      postData.kjid = that.data.kjId
    }
    // if (that.data.pingtuanOpenId) {
    //   postData.pingtuanOpenId = that.data.pingtuanOpenId
    // }
    
    if (that.data.isNeedLogistics > 0 && postData.peisongType == 'kd') {
      if (!that.data.hasAddressData) {
        wx.hideLoading()
        wx.showToast({
          title: '请设置收货地址',
          icon: 'none'
        })
        return
      }
      if (postData.peisongType == 'kd') {
        postData.provinceId = that.data.curAddressData.provinceId;
        postData.cityId = that.data.curAddressData.cityId;
        if (that.data.curAddressData.districtId) {
          postData.districtId = that.data.curAddressData.districtId;
        }
        postData.address = that.data.curAddressData.address;
        postData.linkMan = that.data.curAddressData.linkMan;
        postData.mobile = that.data.curAddressData.mobile;
        postData.code = that.data.curAddressData.code;
      }      
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    }
    if (!e) {
      let yunPrice = 0.01
      that.setData({
        isNeedLogistics: that.data.isNeedLogistics,
        allGoodsAndYunPrice: that.data.allGoodsPrice + yunPrice,
        allGoodsPrice: that.data.allGoodsPrice.toFixed(2),
        yunPrice: yunPrice.toFixed(2)
      })
      // that.getMyCoupons() //优惠券
      return
    }
    if(e){
      postData.status = 0
      postData.amountLogistics = that.data.yunPrice
      postData.totalAmount = that.data.allGoodsAndYunPrice
      postData.amount = that.data.allGoodsPrice
      postData.goodsNum = that.data.goodsNum
      postData.waybillId = ""
      db.collection('orderlist').add({
        data:{
          postData: postData
        },
        success(res){
          if (e && "buyNow" != that.data.orderType) {
            // 清空购物车数据
          }
          that.processAfterCreateOrder(postData)
        },
        fail(err){
          wx.showModal({
            title: '错误',
            content: err.errMsg,
            showCancel: false
          })
          return
        },
        complete: console.log
      })
    }
  },
  async processAfterCreateOrder(res) {
    this.confirmOrder(res)
  },
  async initShippingAddress() {
    const id = wx.getStorageSync('openid')
    db.collection('shipping-address').where({
      _openid: id,
    }).get().then(res=>{
      if(res.data[0] == undefined){
        this.setData({
          hasAddressData: false,
          curAddressData: null
        })
      } else if(res.data[0]){
        if(res.data[0].info.length == 0){
          this.setData({
            hasAddressData: false,
            curAddressData: null
          })
        }else{
          res.data[0].info.forEach(e=>{
            if(e.default){
              this.setData({
                hasAddressData: true,
                curAddressData: e
              })
              return
            }
          })
        }
      } else {
        this.setData({
          hasAddressData: false,
          curAddressData: null
        })
      }
      this.processYunfei()
    })
  },
  processYunfei() {    
    var goodsList = this.data.goodsList
    if (goodsList.length == 0) {
      return
    }
    var goodsJsonStr = "["
    // var isNeedLogistics = 0
    var allGoodsPrice = 0
    var goodsNum = 0
    // let inviter_id = 0;
    // let inviter_id_storge = wx.getStorageSync('referrer');
    // if (inviter_id_storge) {
      // inviter_id = inviter_id_storge;
    // }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i]
      // if (carShopBean.logistics || carShopBean.logisticsId) {
      //   isNeedLogistics = 1;
      // }
      allGoodsPrice += parseInt(carShopBean.price) * carShopBean.number;
      goodsNum += carShopBean.number
      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ","; 
      }
      if (carShopBean.sku && carShopBean.sku.length > 0) {
        let propertyChildIds = ''
        carShopBean.sku.forEach(option => {
          propertyChildIds = propertyChildIds + ',' + option.optionId + ':' + option.optionValueId
        })
        carShopBean.propertyChildIds = propertyChildIds
      }//
      goodsJsonStrTmp += '{"goodsId":"' + carShopBean.good_id + '","price":"' + carShopBean.price + '","pic":"' + carShopBean.pic + '","name":"' + carShopBean.name + '","number":"' + carShopBean.number + '","size":"' + carShopBean.size + '"}'
      goodsJsonStr += goodsJsonStrTmp;
    }
    goodsJsonStr += "]";
    this.setData({
      isNeedLogistics: 1,
      goodsJsonStr: goodsJsonStr,
      allGoodsPrice: allGoodsPrice,
      goodsNum: goodsNum
    });
    this.createOrder(false)
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  async getMyCoupons() {
    const res = await WXAPI.myCoupons({
      openid: wx.getStorageSync('openid'),
      status: 0
    })
    if (res.code == 0) {
      var coupons = res.data.filter(entity => {
        return entity.moneyHreshold <= this.data.allGoodsAndYunPrice;
      })
      if (coupons.length > 0) {
        coupons.forEach(ele => {
          ele.nameExt = ele.name + ' [满' + ele.moneyHreshold + '元可减' + ele.money + '元]'
        })
        this.setData({
          hasNoCoupons: false,
          coupons: coupons
        });
      }
    }
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value;
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex],
      curCouponShowText: this.data.coupons[selIndex].nameExt
    });
  },
  radioChange (e) {
    this.setData({
      peisongType: e.detail.value
    })
    this.processYunfei()
  },
  cancelLogin() {
    wx.navigateBack()
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }else{
      try {
        wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl)
        wx.setStorageSync('mail', e.detail.userInfo.nickName)
        wx.setStorageSync('isloged', true)
      } catch (e) { }
      this.setData({
        wxlogin:true,
      })
    }
  },
})