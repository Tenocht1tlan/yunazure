// //const WXAPI = require('apifm-wxapi')
// const CONFIG = require('config.js')
const AUTH = require('utils/auth')
App({
  onLaunch: function() {
    // WXAPI.init(CONFIG.subDomain)
    const that = this;
    wx.cloud.init({
      env:'yunazure-sygca',
      traceUser:true
    })
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    })
    // WXAPI.queryConfigBatch('WITHDRAW_MIN,ALLOW_SELF_COLLECTION,order_hx_uids,subscribe_ids,share_profile').then(res => {
    //   if (res.code == 0) {
    //     res.data.forEach(config => {
    //       wx.setStorageSync(config.key, config.value);
    //     })
    //     if (this.configLoadOK) {
    //       this.configLoadOK()
    //     }
    //   }
    // })
    try {
      const res = wx.getSystemInfoSync()
      let info = wx.getMenuButtonBoundingClientRect()
      let CustomBar = info.bottom + info.top - res.statusBarHeight
      this.globalData.navHeight = CustomBar
      if(res.platform == 'ios'){
        this.globalData.isIos = true
      }else{
        this.globalData.isIos = false
      }
    } catch (e) {
      // Do something when catch error
    }
  },
    
  onShow (e) {
    this.globalData.launchOption = e
    // 保存邀请人
    // if (e && e.query && e.query.inviter_id) {
    //   wx.setStorageSync('referrer', e.query.inviter_id)
    //   if (e.shareTicket) {
    //     wx.getShareInfo({
    //       shareTicket: e.shareTicket,
    //       success: res => {
    //         console.log(res)
    //         console.log({
    //           referrer: e.query.inviter_id,
    //           encryptedData: res.encryptedData,
    //           iv: res.iv
    //         })
    //         wx.login({
    //           success(loginRes) {
    //             if (loginRes.code) {
    //               WXAPI.shareGroupGetScore(
    //                 loginRes.code,
    //                 e.query.inviter_id,
    //                 res.encryptedData,
    //                 res.iv
    //               ).then(_res => {
    //                 console.log(_res)
    //               }).catch(err => {
    //                 console.error(err)
    //               })
    //             } else {
    //               console.error('登录失败！' + loginRes.errMsg)
    //             }
    //           }
    //         })
    //       }
    //     })
    //   }
    // }
  },
  globalData: {                
    isConnected: true,
    openid:'', //当前用户的openID
    isloged:false,
    mail:'',
    navHeight:0,
    isIos:true
  }
})