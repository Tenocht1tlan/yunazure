const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()

const app = getApp()
Page({
  data: {
    addressList: []
  },

  selectTap: function(e) {
    var id = e.currentTarget.dataset.id
    var selectAddr = {}
    var elsAddr = []
    this.data.addressList.forEach(val=>{
      if(id == val.id){
        selectAddr = val
      }else{
        elsAddr.push(val)
      }
    })
    wx.cloud.callFunction({
      name:'changeAddress',
      data: {
        key: id,
        address: selectAddr.address,
        cityId: selectAddr.cityId,
        code: selectAddr.code,
        default: true,
        districtId: selectAddr.districtId,
        linkMan: selectAddr.linkMan,
        mobile: selectAddr.mobile,
        provinceId: selectAddr.provinceId
      }
    }).then(res=>{
      elsAddr.forEach(val=>{
        wx.cloud.callFunction({
          name:'changeAddress',
          data: {
            key: val.id,
            address: val.address,
            cityId: val.cityId,
            code: val.code,
            default: false,
            districtId: val.districtId,
            linkMan: val.linkMan,
            mobile: val.mobile,
            provinceId: val.provinceId
          }
        })
      })
      wx.navigateBack()
    }).catch(console.error)
  },

  addAddess: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  editAddess: function(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function() {
  },
  async onShow() {
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.initShippingAddress()
    }else{
      wx.showModal({
        title: '提示',
        content: '本次操作需要您的登录授权',
        cancelText: '暂不登录',
        confirmText: '前往登录',
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
  initShippingAddress: function() {
    const id = wx.getStorageSync('openid')
    db.collection('shipping-address').where({
      _openid: id,
    }).get().then(res=>{
      if(res.data){
        this.setData({
          addressList: res.data[0].info
        })
      }else {
        this.setData({
          addressList: []
        })
      }
    })
  }
})