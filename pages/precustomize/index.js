const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database();
const APP = getApp()
// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: "NEW"
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    goods: [],
    loadingMoreHidden: true,
    hideShopPopup: true,
  },
  // toDetailsTap: function(e) {
  //   wx.navigateTo({
  //     url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
  //   })
  // },
  
  // proup
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
 

  upview:function(e){
    this.setData({
      hideShopPopup:false
    })
    console.log(this.data.hideShopPopup)
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    wx.showShareMenu({
      withShareTicket: true
    })    
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title:"定制"
    })
    this.categories()
 
  },

  async categories(){
    let categories = [];

    this.getGoodsList(0);
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    wx.showLoading({
      "mask": true
    })
    db.collection('goods').get().then(res=>{
      if(res.data){
        this.setData({
          goods:res.data
        })
      }else{
        wx.showModal({
          title: '提示',
          content: 'fail',
          showCancel: false
        })
      }
    }).catch(err=>{ 
    })
    wx.hideLoading()
    if(true){
      let newData = {
        loadingMoreHidden: false
      }
      if (!append) {
        newData.goods = []
      }
      this.setData(newData)
      return
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function(e){
  
  //   // 获取购物车数据，显示TabBarBadge
  //   TOOLS.showTabBarBadge()

  // },

 

})