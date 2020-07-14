// pages/opinion/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    max:400,
    min:2,
    minWord:'',
    problem:'',
    phoMail:''
  },

  getValueLength:function(e){
    let value = e.detail.value
    let len = parseInt(value.length)

    if(len <= this.data.min){
      this.setData({
        minWord:"最少填写两个字哦"
      })
    }else{
      this.setData({
        minWord:""
      })
    }
    if(len>400) return;
    this.setData({
      currentWordNumber:len,
      problem:value
    })
  },
  commit:function(){
    if(this.data.problem==''){
      console.log('yxhyxh')
      wx.showToast({
        title: '请输入内容',
        duration:2000,
        icon:'none'
      })
    }else{
      if(this.data.phoMail==''){
        wx.showToast({
          title: '请输入手机号或邮箱号',
          duration:2000,
          icon:'none'
        })
      }else if(!((/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(this.data.phoMail))||(/^1[34578]\d{9}$/.test(this.data.phoMail)))){
        wx.showToast({
          title: '请输入正确的手机号或邮箱号',
          duration:2000,
          icon:'none'
        })
      }else{
        wx.showToast({
          title: '提交成功',
          duration:2000,
          icon:'none'
        })
      }
    }
    console.log(this.data.problem)
    console.log(this.data.phoMail)
  },
  getPhoMail:function(e){
    let value =  e.detail.value
    this.setData({
      phoMail:value
    })
  },
  // getPhoMail:function(e){
  //   let value =  e.detail.value
  //   this.setData({
  //     phoMail:value
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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