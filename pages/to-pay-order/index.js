const app = getApp()
//const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const wxpay = require('../../utils/pay.js')
const db = wx.cloud.database()
Page({
  data: {
    wxlogin: true,

    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
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
    const openid = wx.getStorageSync('openid')
    //立即购买下单
    if ("buyNow" == this.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      this.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        db.collection('shopping-cart').where({
          _openid:res.result.openid
        }).get().then(res=>{
          if(res.data[0].items.length > 0){
            shopList = res.data[0].items
            this.setData({
              goodsList: shopList,
              peisongType: this.data.peisongType
            })
            this.initShippingAddress()
          }
          // res.data[0].items.forEach(value=>{
          //   if(value != null){
          //   }
          // })
        })
      })
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
    this.setData(_data);
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
  //提交订单
  confirmOrder: function(res) {
    let that = this;
    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "pay",
        out_trade_no: res.orderid,
        body: 'yunazure-scarf-DIY',
        total_fee: 1
      },
      success(res) {
        console.log("云函数payment提交成功：", res.result)
        that.pay(res.result)
      },
      fail(res) {
        console.log("云函数payment提交失败：", res)
        wx.redirectTo({
          url: "/pages/order-list/index"
        });
      }
    })
  },
  //实现小程序支付
  pay(payData) {
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
            out_trade_no: "pay004"
          }
        })
      },
      fail(res) {
        console.log("支付失败：", res)
      },
      complete(res) {
        console.log("支付完成：", res)
        wx.redirectTo({
          url: "/pages/order-list/index"
        });
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
    // const subscribe_ids = wx.getStorageSync('subscribe_ids')
    // if (subscribe_ids) {
    //   wx.requestSubscribeMessage({
    //     tmplIds: subscribe_ids.split(','),
    //     success(res) {
    //     },
    //     fail(e) {
    //       console.error(e)
    //     },
    //     complete: (e) => {
    //       this.createOrder(true)
    //     },
    //   })
    // } else {
      this.createOrder(true)
    // }    
  },
  createOrder: function (e) {
    var that = this
    var openid = wx.getStorageSync('openid') // 用户 openid
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
      let yunPrice = 1
      that.setData({
        // totalScoreToPay: that.data.score,
        isNeedLogistics: that.data.isNeedLogistics,
        allGoodsPrice: that.data.allGoodsPrice,
        allGoodsAndYunPrice: that.data.allGoodsPrice + yunPrice,
        yunPrice: yunPrice
      })
      // that.getMyCoupons() //优惠券
      return
    }
    if(e){
      db.collection('orderlist').add({
        data:{
          postData: postData
        },
        success(res){
          if (e && "buyNow" != that.data.orderType) {
            // 清空购物车数据
            // WXAPI.shippingCarInfoRemoveAll(openid)
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
    // const res1 = await WXAPI.userAmount(wx.getStorageSync('openid'))
    // if (res1.code != 0) {
    //   wx.showToast({
    //     title: '无法获取用户资金信息',
    //     icon: 'none'
    //   })
    //   wx.redirectTo({
    //     url: "/pages/order-list/index"
    //   });
    //   return
    // }
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
    var goodsJsonStr = "[";
    // var isNeedLogistics = 0;
    var allGoodsPrice = 0;
    // let inviter_id = 0;
    // let inviter_id_storge = wx.getStorageSync('referrer');
    // if (inviter_id_storge) {
      // inviter_id = inviter_id_storge;
    // }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      // if (carShopBean.logistics || carShopBean.logisticsId) {
      //   isNeedLogistics = 1;
      // }
      allGoodsPrice += parseInt(carShopBean.price) * carShopBean.number;
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
      }
      goodsJsonStrTmp += '{"goodsId":' + carShopBean.good_id + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '}';
      goodsJsonStr += goodsJsonStrTmp;
    }
    goodsJsonStr += "]";
    this.setData({
      isNeedLogistics: 1,
      goodsJsonStr: goodsJsonStr,
      allGoodsPrice: allGoodsPrice
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