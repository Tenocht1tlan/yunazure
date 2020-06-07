const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()

const app = getApp()
Page({
  data: {
    addressList: []
  },

  selectTap: function(e) {
    var id = e.currentTarget.dataset.id;
    WXAPI.updateAddress({
      token: wx.getStorageSync('token'),
      id: id,
      isDefault: 'true'
    }).then(function(res) {
      wx.navigateBack({})
    })
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
      this.initShippingAddress();
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
        var list = []
        list.push(res.data[0].info)
        this.setData({
          addressList: list
        })
      }else {
        this.setData({
          addressList: []
        })
      }
    })
  }
})