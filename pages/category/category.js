//const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
const db = wx.cloud.database()
const goodsDetails = db.collection('goods')
const goodsCategory = db.collection('goodsCategory')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    categorySelected: {
      name: '',
      id: ''
    },
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0,
    skuCurGoods: undefined,
    shippingCarInfo:{
      items:[]
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    this.categories()
  },
  async onShow() {
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
    }

    this.data.categorySelected.id = 'hat'
    this.categories()
  },
  async categories() {
    let categories = []
    let categoryName = ''
    let categoryId = ''
    goodsCategory.get().then(res=>{
      if(res.data[0].category){
        if (this.data.categorySelected.id) {
          const _curCategory = res.data[0].category.find(ele => {
            return ele.id == this.data.categorySelected.id
          })
          categoryName = _curCategory.name;
          categoryId = _curCategory.id;
        }
        for (let i = 0; i < res.data[0].category.length; i++) {
          let item = res.data[0].category[i]
          categories.push(item)
          if (i == 0 && !this.data.categorySelected.id) {
            categoryName = item.name
            categoryId = item.id
          }
        }
        this.setData({
          categories: categories,
          categorySelected: {
            name: categoryName,
            id: categoryId
          }
        })
      }else{
        this.setData({
          categories: [],
          categorySelected: {
            name: '',
            id: ''
          }
        })
      }
    }).catch(console.error)
    this.getGoodsList()
  },
  async getGoodsList() {
    goodsDetails.get().then(res=>{
      var list = []
      res.data.forEach(val=>{
        if(val.type == this.data.categorySelected.id){
          list.push(val)
        }
      })
      if(list.length > 0){
        this.setData({
          currentGoods: list
        })
      }else{
        this.setData({
          currentGoods: null
        })
      }
    }).catch(console.error)
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onCategoryClick: function(e) {
    var that = this
    var id = e.target.dataset.id
    if (id === that.data.categorySelected.id) {
      that.setData({
        scrolltop: 0,
      })
    } else {
      var categoryName = ''
      for (var i = 0; i < that.data.categories.length; i++) {
        let item = that.data.categories[i];
        if (item.id == id) {
          categoryName = item.name
          break
        }
      }
      that.setData({
        categorySelected: {
          name: categoryName,
          id: id
        },
        scrolltop: 0
      });
      that.getGoodsList();
    }
  },
  bindinput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail.value
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  onShareAppMessage() {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async addShopCar(e) {
    this.addShopCarCheck({
      goodsId: e.currentTarget.dataset.id,
      sku: []
    })
  },
  async addShopCarCheck(options){
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      // 处理加入购物车的业务逻辑
      db.collection('goods').where({
        good_id: options.goodsId
      }).get().then(res=>{
          this.setData({
            shippingCarInfo:{
              items:[{
                good_id:options.goodsId,
                name: res.data[0].name,
                price: res.data[0].minPrice,
                originalPrice:res.data[0].originalPrice,
                number: 1,
                active: false,
                pic: res.data[0].pic,
                color:res.data[0].color,
                size:'L',
              }]
            }
          })
          this.addShopCarDone(options)
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '您还未登录账号...',
        confirmText: '去登录',
        success (res) {
          if (res.confirm) {
            wx.switchTab({
              url: "/pages/my/index"
            });
          }else if (res.cancel){

          }
        }
      })
    }
  },
   addShopCarDone:function(options){
    wx.showLoading({
      title: '加载中...',
    })
    const that = this
    let goodsId = options.goodsId
    var number = 1
    var canAdd = false
    var exist = false
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('shopping-cart').where({
        _openid:res.result.openid
      }).get().then(res=>{
        if(res.data[0] == undefined){
          canAdd = true
        }else{
          var list = []
          res.data[0].items.forEach(value=>{
            if(value != null){
              list.push(value)
            }
          })
          list.forEach(e=>{
            if(e.good_id == goodsId){
              exist = true
              number += e.number
              return
            }
          })
        }
      })
    })
    setTimeout(function () {
      wx.hideLoading({
        complete: (res) => {
          if(canAdd){
            db.collection('shopping-cart').add({
              data: {
                items:that.data.shippingCarInfo.items
              }
            }).then(res=>{
              wx.showToast({
                title: '加入购物袋',
                icon: 'success'
              })
            }).catch(console.error)
          }else{
            if(exist){
              wx.cloud.callFunction({
                name:'changeSCartNum',
                data: {
                  key: goodsId,
                  number: number,
                }
              }).then(res=>{
                wx.showToast({
                  title: '加入购物袋',
                  icon: 'success'
                })
              }).catch(console.error)
            }else{
              wx.cloud.callFunction({
                name:'addShippingCart',
                data: {
                  items:that.data.shippingCarInfo.items
                }
              }).then(res=>{
                wx.showToast({
                  title: '加入购物袋',
                  icon: 'success'
                })
              }).catch(console.error)
            }
          }
        }
      })
    }, 1000)
    //判断是否需要选吃尺码
    if (false) {
      // 需要选择规格尺寸
      goodsDetails.where({
        id:options.goodsId
      }).get().then(res=>{
        const skuCurGoods = res.data
        skuCurGoods.basicInfo.storesBuy = 1
        this.setData({
          skuCurGoods
        })
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })
        this.setData({
          skuCurGoods: null
        })
      }).catch(console.error)
      wx.hideTabBar()
    }
    wx.showTabBar()
    TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
  },
  storesJia(){
    const skuCurGoods = this.data.skuCurGoods
    if (skuCurGoods.basicInfo.storesBuy < skuCurGoods.basicInfo.stores) {
      skuCurGoods.basicInfo.storesBuy++
      this.setData({
        skuCurGoods
      })
    }
  },
  storesJian(){
    const skuCurGoods = this.data.skuCurGoods
    if (skuCurGoods.basicInfo.storesBuy > 1) {
      skuCurGoods.basicInfo.storesBuy--
      this.setData({
        skuCurGoods
      })
    }
  },
  closeSku(){
    this.setData({
      skuCurGoods: null
    })
    wx.showTabBar()
  },
  skuSelect(e){
    const pid = e.currentTarget.dataset.pid
    const id = e.currentTarget.dataset.id
    // 处理选中
    const skuCurGoods = this.data.skuCurGoods
    const property = skuCurGoods.properties.find(ele => {return ele.id == pid})
    property.childsCurGoods.forEach(ele => {
      if (ele.id == id) {
        ele.active = true
      } else {
        ele.active = false
      }
    })
    this.setData({
      skuCurGoods
    })
  },
  addCarSku(){
    const skuCurGoods = this.data.skuCurGoods
    const propertySize = skuCurGoods.properties.length // 有几组SKU
    const sku = []
    skuCurGoods.properties.forEach(p => {
      const o = p.childsCurGoods.find(ele => {return ele.active})
      if (!o) {        
        return
      }
      sku.push({
        optionId: o.propertyId,
        optionValueId: o.id
      })
    })
    if (sku.length != propertySize) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    const options = {
      goodsId: skuCurGoods.basicInfo.id,
      buyNumber: skuCurGoods.basicInfo.storesBuy,
      sku
    }
    this.addShopCarDone(options)
  },
})