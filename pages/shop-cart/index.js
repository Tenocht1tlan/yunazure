const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
import NumberAnimate from 'index_model.js'
Page({
  data: {
    isFirst: 0,
    openId:'',
    wxlogin: false,
    saveHidden: true,
    allSelect: false,
    noSelect: true,
    totalPrice:0,
    checkedVal:[],
    loading:true,
    startX:'',
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    shippingCarInfo:{
      items:[]
    }
  },
  onHide: function() {
    wx.setStorage({
      key: "checked",
      data: this.data.checkedVal
    })
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false
      // Do something when catch error
    }
  },
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    })
  },
  async onPullDownRefresh(){
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      wx.showLoading({
        title: '加载中...',
      })
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        db.collection('shopping-cart').get().then(res=>{
          this.setData({
            noSelect: res.data[0].items.length > 0 ? false : true,
            'shippingCarInfo.items': res.data[0].items
          })
          wx.stopPullDownRefresh({
            complete: (res) => {
              wx.hideLoading()
            },
          })
        })
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
      wx.stopPullDownRefresh()
    }
  },
  onLoad: function() {
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      this.setData({
        wxlogin: true,
        openId: res.result.openid
      })
      try {
        wx.setStorageSync('openid', res.result.openid)
      } catch (e) { }
    })
    this.initEleWidth()
  },
  async onShow() {
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.shippingCarInfo(false)
      }
    }else{
      wx.removeTabBarBadge({
        index: 3,
      })
      this.setData({
        noSelect: true,
        'shippingCarInfo.items': 0
      })
    }
  },
  shippingCarInfo: function(needUpdate) {
    var isloged = wx.getStorageSync('isloged')
    if(!isloged){
      return
    }
    var stoCheck = []
    stoCheck = wx.getStorageSync('checked')
    db.collection('shopping-cart').get().then(res=>{
      if(res.data[0] == undefined){
        needUpdate = false
        return
      }
      if(stoCheck.length < res.data[0].items.length){
        needUpdate = true
      }
      if(this.data.isFirst == 0){
        needUpdate = false
      }
      if(res.data.length > 0){
        var tmp = []
        var tmpPrice = 0
        var num = 0
        if(needUpdate){
          let dx = res.data[0].items.length - stoCheck.length
          for(let i=0;i<dx;i++){
            stoCheck.push('isChecked')
          }
          tmp = stoCheck
          for(let i=0;i<res.data[0].items.length;i++){
            if(tmp[i] == 'isChecked'){
              tmpPrice += res.data[0].items[i].price*res.data[0].items[i].number
            }
          }
        }
        res.data[0].items.forEach(value=>{
          if(this.data.isFirst == 0){
            tmpPrice += value.price*value.number
            tmp.push('isChecked')
          }
          if(value != null){
            num += value.number
          }
        })
        wx.setTabBarBadge({
          index: 3,
          text: num.toString(),
        })
        if(this.data.isFirst == 0 || needUpdate) {
          this.setData({
            checkedVal: tmp,
            isFirst: 1,
            totalPrice: tmpPrice,
            noSelect: res.data[0].items.length > 0 ? false : true,
            'shippingCarInfo.items': res.data[0].items
          })
        }else{
          this.setData({
            noSelect: res.data[0].items.length > 0 ? false : true,
            'shippingCarInfo.items': res.data[0].items
          })
        }
      }else{
        this.setData({
          noSelect: true,
          'shippingCarInfo.items': null
        })
      }
    })
  },
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  touchS: function(e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function(e) {
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.shippingCarInfo.items[index].left = left
      this.setData({
        shippingCarInfo: this.data.shippingCarInfo
      })
    }
  },
  touchE: function(e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var that = this
      var endX = e.changedTouches[0].clientX;
      var disX = that.data.startX - endX;
      var delBtnWidth = that.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      that.data.shippingCarInfo.items[index].left = left
      that.setData({
        shippingCarInfo: that.data.shippingCarInfo
      })
    }
  },
  cbChange(e) {
    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const num = this.data.shippingCarInfo.items[index].number
    var tempPrice = parseInt(this.data.totalPrice)
    console.log('index =', index)
    if(this.data.checkedVal[index] == 'isChecked'){
      this.data.checkedVal[index] = '0'
      tempPrice -= price*num
      console.log('checkedVal =', this.data.checkedVal)
    }else{
      this.data.checkedVal[index] = 'isChecked'
      tempPrice += price*num
      console.log('checkedVal =', this.data.checkedVal)
    }
    // let newNumer = new NumberAnimate({
    //   from: tempPrice,
    //   speed: 1000,
    //   refreshTime: 100,
    //   decimals: 2,
    //   onUpdate:()=>{
        this.setData({
          totalPrice: tempPrice//newNumer.tempValue
        })
    //   }
    // })
  },
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    const index = e.currentTarget.dataset.index
    const size = e.currentTarget.dataset.size
    this.delItemDone(key, index, size)
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const num = this.data.shippingCarInfo.items[index].number
    var tempPrice = parseInt(this.data.totalPrice)
    if(this.data.checkedVal[index] == 'isChecked'){
      tempPrice -= price*num
      // let newNumer = new NumberAnimate({
      //   from: tempPrice,
      //   speed: 1000,
      //   refreshTime: 100,
      //   decimals: 2,
      //   onUpdate:()=>{
          this.setData({
            totalPrice: tempPrice//newNumer.tempValue
          })
      //   }
      // })
    }
  },
  async delItemDone(key, index, size){
    wx.showLoading({
      title: '加载中...',
    })
    var list = []
    const that = this
    db.collection('shopping-cart').get().then(res=>{
      res.data[0].items.forEach(value=>{
        if(value != null && value.good_id != key || (value.good_id == key && value.size != size) ){
          list.push(value)
        }
      })
      db.collection('shopping-cart').where({
        _openid: that.data.openId
      }).update({
        data:{
          items: list
        },
        fail(err){
          console.log(err)
        },
        success(){
          TOOLS.showTabBarBadge()
          let tmp = that.data.checkedVal.splice(index,1)
          that.setData({
            checkedVal: that.data.checkedVal,
            noSelect: list.length > 0 ? false : true,
            'shippingCarInfo.items': list
          })
          wx.hideLoading()
        },
        complete(){

        }
      })
    })
  },
  async jiaBtnTap(e) {
    const that = this
    wx.showLoading({
      title: '加载中...',
    })
    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    var tempPrice = parseInt(this.data.totalPrice)
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number + 1
    console.log('jia checkedVal =', this.data.checkedVal)
    if(this.data.checkedVal[index] == 'isChecked'){
      tempPrice += price
      // let newNumer = new NumberAnimate({
      //   from: tempPrice,
      //   speed: 1500,
      //   refreshTime: 100,
      //   decimals: 2,
      //   onUpdate:()=>{
          this.setData({
            totalPrice: tempPrice//newNumer.tempValue
          })
      //   }
      // })
    }
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.good_id,
        number: number,
      },
      complete(){
        that.shippingCarInfo(false)
        wx.hideLoading()
      }
    })
  },
  async jianBtnTap(e) {
    const that = this
    wx.showLoading({
      title: '加载中...',
    })
    const index = e.currentTarget.dataset.index
    const size = e.currentTarget.dataset.size
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    var tempPrice = parseInt(this.data.totalPrice)
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number - 1
    console.log('jian checkedVal =', this.data.checkedVal)
    if (number <= 0) {
      wx.hideLoading()
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            if(this.data.checkedVal[index] == 'isChecked'){
              tempPrice -= price
              this.setData({
                totalPrice: tempPrice
              })
            }
            this.delItemDone(item.good_id, index, size)
          }
        }
      })
      return
    }else{
      if(this.data.checkedVal[index] == 'isChecked'){
        tempPrice -= price
        // let newNumer = new NumberAnimate({
        //   from: tempPrice,
        //   speed: 1500,
        //   refreshTime: 100,
        //   decimals: 2,
        //   onUpdate:()=>{
            this.setData({
              totalPrice: tempPrice//newNumer.tempValue
            })
        //   }
        // })
      }
    }
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.good_id,
        number: number,
      },
      complete(){
        that.shippingCarInfo(false)
        wx.hideLoading()
      }
    })
  },
  toPayOrder(){
    var tmp = false
    var index = []
    var goodsInfo = {
      items:[]
    }
    for(let i=0;i<this.data.checkedVal.length;i++){
      if(this.data.checkedVal[i] == 'isChecked'){
        index.push(i)
        tmp = true
      }
    }
   
    if(tmp){
      index.forEach(e=>{
        goodsInfo.items.push(this.data.shippingCarInfo.items[e])
      })
      wx.setStorage({
        key: "shopCartInfo",
        data: goodsInfo
      })
      wx.navigateTo({
        url: "/pages/to-pay-order/index"
      })
    }else{
      wx.showToast({
        title: '请选择商品~',
        icon: 'none',
        duration: 2000
      })
    }
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }else{
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        this.setData({
          wxlogin:true
        })
        try {
          wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl)
          wx.setStorageSync('mail', e.detail.userInfo.nickName)
          wx.setStorageSync('isloged', true)
          wx.setStorageSync('openid', res.result.openid)
          this.shippingCarInfo(true)
        } catch (e) { }
      })
    }
  }
})
