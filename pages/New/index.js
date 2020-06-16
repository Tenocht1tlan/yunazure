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
    addFavInfo:{
      items:[]
    }
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
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
      title: "NEW"
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

  async  addFav(e){
    this.addFavCheck({
      goodsId : e.currentTarget.dataset.id,
      index :e.currentTarget.dataset.index
     })
  },
  async addFavCheck(options){
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      //加入心愿单逻辑
      db.collection('goods').where({
        good_id:options.goodsId
      }).get().then(res=>{
        this.setData({
          addFavInfo:{
            items:[{
              good_id:options.goodsId,
              name: res.data[0].name,
              pic: res.data[0].pic,
              color:'黑色',
              index:options.index,
              select:false
            }]
          }
        })
        this.addFavDone(options)
      })
    }else{
      wx.switchTab({
        url: '/pages/my/index',
      })
    }

  },
  addFavDone:function(options){
      const that = this 
      let goodsId = options.goodsId
      var canFav = false
      var existFav = false
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        db.collection('favorite').where({
          _openid:res.result.openid
        }).get().then(res=>{
          if(res.data[0] == undefined){
            canFav = true
          }else{
            var list =[]
            res.data[0].items.forEach(value=>{
              if(value !=null){
                list.push(value)
              }
            })
            list.forEach(e=>{
              if(e.good_id == goodsId){
                existFav = true
                return
              }
            })
          }
          if(canFav){
            db.collection('favorite').add({
              data: {
                items:that.data.addFavInfo.items
              }
            }).then(res=>{
              wx.showToast({
                title: '加入心愿单',
                icon: 'success'
              })
            }).catch(console.error)
          }else{
            if(existFav){
              that.delFavDone(goodsId)
            }else{
              wx.cloud.callFunction({
              name:'addFav',
              data:{
                items:that.data.addFavInfo.items
              }
            }).then(res=>{
              wx.showToast({
                title: '加入心愿单',
                icon: 'success'
              })
            }).catch(console.error)
            }
          }
        })
      })

  },
  async delFavDone(key){

    var openid = ''
    var list = []
    const that = this
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      openid = res.result.openid
      db.collection('favorite').where({
        _openid:openid
      }).get().then(res=>{
        res.data[0].items.forEach(value=>{
          if(value != null && value.good_id != key){
            list.push(value)
          }
        })
        console.log(list)
        db.collection('favorite').where({
          _openid:openid
        }).update({
          data:{
            items: list
          },
          fail(err){
            console.log(err)
          },
          success(){
            //
          },
          complete(){
            TOOLS.showTabBarBadge()
            that.setData({
              noSelect: list.length > 0 ? false : true,
              'addFavInfo.items':list
            })
            wx.hideLoading()
          }
        })
      })
    })
  },


})