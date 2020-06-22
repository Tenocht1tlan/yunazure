// pages/DIY/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:['marvel','disney','tom','jerry','NBA','DC','yunazure','yxh','zy'],
    inner:[],
    isChosed:true,
    originUrl:"/images/staryes.png",
    ratio: 102 / 152,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var temp = []
    for(var i = 0;i<12;i++){
      temp[i] = i
    }
    this.setData({
      inner:temp
    })
    console.log(this.data.inner)
    
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
  choseMode:function(){
    var chose = !this.data.isChosed
    this.setData({
      isChosed:chose
    })
  },
  //缩放旋转模板的选择图片
  chooseImg:function(){
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          originUrl: res.tempFilePaths[0],
        })
      }
    })
  },
//
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