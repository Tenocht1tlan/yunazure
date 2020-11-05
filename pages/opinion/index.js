const TOOLS = require('../../utils/tools.js')
const db = wx.cloud.database()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    problem:'',
    phoneNumber:'',
    isAdmin:false
  },
  getValueLength:function(e){
    let value = e.detail.value
    this.setData({
      problem:value
    })
  },
  commit:function(){
    if(this.data.problem == ''){
      wx.showToast({
        title:'请输入内容',
        duration:2000,
        icon:'none'
      })
      return
    }
    if(this.data.phoneNumber == ''){
      wx.showToast({
        title:'请输入手机号',
        duration:2000,
        icon:'none'
      })
      return
    } 
    if(!((/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(this.data.phoneNumber))||(/^1[34578]\d{9}$/.test(this.data.phoneNumber)))){
      wx.showToast({
        title:'请输入正确的手机号',
        duration:2000,
        icon:'none'
      })
      return
    }
    var date = new Date()
    var dateTime = date.getFullYear().toString() +'-'+ (date.getMonth() + 1).toString() +'-'+ date.getDate().toString() +' '+date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds()
    db.collection('OpinionList').add({
      data: {
        description: this.data.problem,
        date: dateTime,
        tag: 'opinion',
        phone: this.data.phoneNumber
      }
    }).then(res=>{
      wx.showModal({
        title: '提交成功',
        content: 'Yunazure已经收到您的意见或反馈！',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
  },
  getPhoMail:function(e){
    let value = e.detail.value
    this.setData({
      phoneNumber:value
    })
  },
  initOpenId(){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{// yun: og4T_43cgLw2wBv3c06cfeR-EVLQ  zy: og4T_4yv81CqaRRjLaXqePYnzkm0
      let tmp = res.result.openid == 'og4T_43cgLw2wBv3c06cfeR-EVLQ' || res.result.openid == 'og4T_4yv81CqaRRjLaXqePYnzkm0'? true:false
      // if(tmp){
      //   TOOLS.resTabBarBadge()
      // }
      this.setData({
        isAdmin:tmp
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initOpenId()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})