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
    selectGoodId:'',
    loadingMoreHidden: true,
    hideShopPopup: true,
    goodsColor:['卡其色','灰色','米白色'],
    canSubmit: false,
    goodsDetail:{}
  },
  async labelItemTap(e){
    const propertyindex = e.currentTarget.dataset.propertyindex
    const propertychildindex = e.currentTarget.dataset.propertychildindex

    const sku = this.data.goodsDetail.sku[propertyindex]
    const child = sku.childsCurGoods[propertychildindex]
    // 取消该分类下的子栏目所有的选中状态
    sku.childsCurGoods.forEach(child => {
      child.active = false
    })
    // 设置当前选中状态
    sku.optionValueId = child.id
    child.active = true
    // 获取所有的选中规格尺寸数据
    const needSelectNum = this.data.goodsDetail.sku.length
    let curSelectNum = 0;
    let propertyChildIds = "";
    let propertyChildNames = "";
    let properties = []
    this.data.goodsDetail.sku.forEach(p => {
      p.childsCurGoods.forEach(c => {
        if (c.active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + p.id + ":" + c.id + ",";
          propertyChildNames = propertyChildNames + p.name + ":" + c.value + "  ";
          properties.push(c.value)
        }
      })
    })
    console.log('properties = '+ properties)
    let canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    this.setData({
      goodsDetail:this.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
  upview:function(e){
    const that = this
    db.collection('goods').where({
      good_id: e.currentTarget.dataset.id
    }).get({
      success: function(res) {
        that.setData({
          goodsDetail: res.data[0]
        })
      },
      fail: console.error
    })
    this.setData({
      hideShopPopup: false,
      selectGoodId: e.currentTarget.dataset.id
    })
  },
  toCostpmize: function () {
    if(this.data.canSubmit){
      wx.navigateTo({
        url: "/pages/customize/index"
      })
    }else{
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
    
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
  onShow: function(e){

  },
})