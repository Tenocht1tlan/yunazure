// pages/register/index.js
let app = getApp();
//获取云数据库引用
const db = wx.cloud.database();
const member = db.collection('member');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mail:'',
    pwd:'',
    pwd2:''
  },

  bindphInputmail: function (e) {
    this.setData({
      mail: e.detail.value
    })
  },
  bindphInputpwd: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  bindphInputpwd2: function (e) {
    this.setData({
      pwd2: e.detail.value
    })
  },
  userRegister: function (e) {
    const that = this
    let flag = false  //是否存在 true为存在
    
    // member.where({
    //   mail:mail
    // }).get().then(res=>{
    //   wx.showToast({
    //     title: '该邮箱已注册',
    //     icon: 'success',
    //     duration: 2500
    //     })
    // }).catch(err=>{
    //   that.saveUserInfo()
    // })
    
    //var reg = new RegExp('^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$');
    //var phoneVar = reg.test(phone); 

    //var reg = new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$');       
    // var emailVar = reg.test(email);  
    member.get({
      success:(res)=> {
        let member = res.data; 
        console.log(member);
        for (let i=0; i<member.length; i++){ 
          if (that.data.mail == member[i].mail)
          {
            flag = true;
            break;
          }
        }
        if(flag){
          wx.showToast({
            title: '邮箱已注册！',
            icon: 'success',
            duration: 2500
            })   
        }else{ 
          that.saveUserInfo()
        }
      }
    })
  },
  saveUserInfo() {
    member.add({  
      data:{
        mail: this.data.mail,
        pwd: this.data.pwd
      }
    }).then(res => {
      app.globalData.mail = this.data.mail
      app.globalData.isloged = true
      try {
        wx.setStorageSync('register', true)
        wx.setStorageSync('mail', this.data.mail)
      } catch (e) { }
      wx.showModal({
        title: '提示',
        content: '注册成功！',
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 2,
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })   
    }).catch(err=>{
      wx.showModal({
        title:'Tips',
        content:'注册失败',
      })
    })
   },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      wx.setStorageSync('register', false)
      wx.setStorageSync('mail', '')
    } catch (e) { }
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