const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
const db = wx.cloud.database();
const member = db.collection('member');
Page({
	data: {
    wxlogin: false,
    openid:'',
    isloged: false,
    name:'',
    phone:'',
    avatarUrl:'',
    isRegister: false
  },
	onLoad() {
    
	},	
  async onShow() {
    const _this = this
    var avatarUrl = wx.getStorageSync('avatarUrl')
    var mail = wx.getStorageSync('mail')
    var isRegister = wx.getStorageSync('register')
    this.setData({
      isRegister: isRegister,
    })
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        name: mail,
        wxlogin:true,
        isloged:true,
        avatarUrl:avatarUrl
      })
    }
    // AUTH.checkHasLogined().then(isLogined => {
    //   this.setData({
    //     wxlogin: isLogined
    //   })
    //   if (isLogined) {        
    //     _this.getUserApiInfo();
    //     _this.getUserAmount();
    //   }
    // })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
  },
  loginOut(){
    AUTH.loginOut()
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
  getPhoneNumber: function(e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: e.detail.errMsg,
        showCancel: false 
      })
      return;
    }
    WXAPI.bindMobileWxa(wx.getStorageSync('token'), e.detail.encryptedData, e.detail.iv).then(res => {
      if (res.code === 10002) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code == 0) {
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        })
        this.getUserApiInfo();
      } else {
        wx.showModal({
          title: '提示',
          content: res.msg,
          showCancel: false
        })
      }
    })
  },
  getUserApiInfo: function () {
    var that = this;
    WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        let _data = {}
        _data.apiUserInfoMap = res.data
        if (res.data.base.mobile) {
          _data.userMobile = res.data.base.mobile
        }
        if (that.data.order_hx_uids && that.data.order_hx_uids.indexOf(res.data.base.id) != -1) {
          _data.canHX = true // 具有扫码核销的权限
        }
        that.setData(_data);
      }
    })
  },
  getUserAmount: function () {
    var that = this;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        that.setData({

        });
      }
    })
  },
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  toMyfav: function () {
    wx.navigateTo({
      url: "/pages/star/star"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },
  goRegister: function (e) {
    wx.navigateTo({
      url: "/pages/register/index"
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
    if(!this.data.isRegister){
      wx.navigateTo({
        url: "/pages/register/index"
      })
    }
  },
  logOut() {
    var that = this;
    wx.showModal({
      title: '账号注销',
      content: '您确定解绑账号？',
      success (res) {
        if (res.confirm) {
          wx.showToast({
            title: '已解绑',
            icon: 'success',
          })
          wx.removeTabBarBadge({
            index: 3,
          })
          that.setData({
            name:'',
            avatarUrl:'',
            wxlogin: true,
            isloged: false
          })
          try {
            wx.setStorageSync('isloged', false)
            wx.setStorageSync('avatarUrl', '')
            wx.setStorageSync('mail', '')
            wx.setStorageSync('openid', '')
          } catch (e) {
            // Do something when catch error
          }
        }else if (res.cancel){
          wx.showToast({
            title: '已取消',
            icon: 'none',
          })
        }
      }
    })
  },
  goLogin() {
    this.setData({
      wxlogin: false
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }else{
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        this.setData({
          openid:res.result.openid
        })
        try {
          wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl)
          wx.setStorageSync('mail', e.detail.userInfo.nickName)
          wx.setStorageSync('isloged', true)
          wx.setStorageSync('openid', this.data.openid)
        } catch (e) { }
      })
      
      this.setData({
        name: e.detail.userInfo.nickName,
        wxlogin:true,
        avatarUrl:e.detail.userInfo.avatarUrl,
        isloged:true
      })
    }
    // AUTH.register(this);
  },
  scanOrderCode(){
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  clearStorage(){
    wx.clearStorageSync()
    wx.showToast({
      title: '已清除',
      icon: 'success'
    })
  },
})