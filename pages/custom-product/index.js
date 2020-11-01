const db =  wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    key:'',
    goodName:'我的定制作品',
    focus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.goodName){
      this.setData({
        goodName: options.goodName
      })
    }
    var list = ''
    const that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'getCustomImg'
    }).then(res=>{
      res.result.data.forEach(v=>{
        list = v.fileID
        if(list.indexOf(options.url) >= 0){
          that.setData({
            url: list,
            key: options.url
          })
          return
        }
        wx.hideLoading()
      })
    }).catch(console.error)
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
  modifyName(){
    this.setData({
      focus: true
    })
  },
  bindnaInput: function (e) {
    this.setData({
      goodName: e.detail.value
    })
  },
  toBuy(){
    let that = this
    // if (this.data.goodsDetail.sku && !this.data.canSubmit) {
    //   if (!this.data.canSubmit) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '请先选择规格尺寸~',
    //       showCancel: false
    //     })
    //   }
    //   this.bindGuiGeTap()
    //   return
    // }
    // if (this.data.buyNumber < 1) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '购买数量不能为0！',
    //     showCancel: false
    //   })
    //   return
    // }
    var buyNowInfo = this.buliduBuyNowInfo()
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    // this.closePopupTap()
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  buliduBuyNowInfo: function() {
    var shopCarMap = {}
    // shopCarMap.good_id = this.data.goodsDetail.good_id
    shopCarMap.pic = this.data.url
    shopCarMap.name = this.data.goodName
    // shopCarMap.price = this.data.selectSizePrice.toFixed(2)
    // shopCarMap.active = true
    // shopCarMap.number = this.data.buyNumber
    // shopCarMap.logisticsType = this.data.goodsDetail.logisticsId
    // shopCarMap.logistics = this.data.goodsDetail.logistics
    // shopCarMap.color = this.data.properties[1]
    // shopCarMap.size = this.data.properties[0]
    
    var buyNowInfo = {}
    buyNowInfo.shopNum = 0
    buyNowInfo.items = []
    buyNowInfo.items.push(shopCarMap)
    return buyNowInfo
  },
  onClickBack(){
    wx.switchTab({
      url: "/pages/index/index"
    })
    // wx.navigateBack({
    //   delta: 3,
    // })
  },
  onShareAppMessage() {
    let _data = {
      title: this.data.goodName,
      path: '/pages/custom-product/index?url=' + this.data.key + '&goodName=' + this.data.goodName,
      success: function(res){
        if(res.errMsg == 'shareAppMessage:ok'){

        }
      },
      fail: function(){
        if(res.errMsg == 'shareAppMessage:fail cancel'){
        }else if(res.errMsg == 'shareAppMessage:fail'){
        }
      }
    }
    return _data
  },
})