// pages/canvas/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  addcircle(){
    var context = wx.createCanvasContext('myCanvas')
    context.setStrokeStyle("#ff0000")
    context.setLineWidth(2)
    context.arc(100, 100, 20, 0,0.75*Math.PI, true)
    context.stroke()
    context.draw()

  },
  addimage(){
    var context = wx.createCanvasContext('myCanvas')
    context.restore()
    context.drawImage('/images/scarfMan.png',0,0)
    context.translate(20, 20)
    context.drawImage('/images/scarfWoman.png',20,0)

    context.draw()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
      // var context = wx.createCanvasContext('myCanvas')

      // context.setStrokeStyle("#00ff00")
      // context.setLineWidth(5)
      // context.rect(0, 0, 200, 200)
      // context.stroke()
      // context.setStrokeStyle("#ff0000")
      // context.setLineWidth(2)
      // context.moveTo(160, 100)
      // context.arc(100, 100, 60, 0, 2 * Math.PI, true)
      // context.moveTo(140, 100)
      // context.arc(100, 100, 40, 0, Math.PI, false)
      // context.moveTo(85, 80)
      // context.arc(80, 80, 5, 0, 2 * Math.PI, true)
      // context.moveTo(125, 80)
      // context.arc(120, 80, 5, 0, 2 * Math.PI, true)
      // context.stroke()
      // context.draw()
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