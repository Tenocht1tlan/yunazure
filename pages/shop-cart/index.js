const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
import NumberAnimate from 'index_model.js'
Page({
  data: {
    wxlogin: false,
    saveHidden: true,
    allSelect: false,
    noSelect: true,
    totalPrice:0,
    isCheck:[false],
    loading:true,
    startX:'',
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    shippingCarInfo:{
      items:[]
    }
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
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
        db.collection('shopping-cart').where({
          _openid:res.result.openid
        }).get().then(res=>{
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
    this.initEleWidth();
    this.onShow();
  },
  async onShow() {
    const isLogined = await AUTH.checkHasLogined()
    if(isLogined){
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.shippingCarInfo()
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
  shippingCarInfo: function() {
    const token = wx.getStorageSync('isloged')
    if (!token) {
      return
    }
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('shopping-cart').where({
        _openid:res.result.openid
      }).get().then(res=>{
        var num = 0
        res.data[0].items.forEach(value=>{
          if(value != null){
            num += value.number
          }
        })
        wx.setTabBarBadge({
          index: 3,
          text: num.toString(),
        })
        this.setData({
          noSelect: res.data[0].items.length > 0 ? false : true,
          'shippingCarInfo.items': res.data[0].items
        })
      })
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
  checkGoods:function(e){
    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const num = this.data.shippingCarInfo.items[index].number
    const isChecked = !this.data.isCheck[index]
    var up = "isCheck["+index+"]"
    var tempPrice = parseInt(this.data.totalPrice)
    if(isChecked){
      tempPrice += price*num
    }else{
      tempPrice -= price*num
    }
    this.setData({
      [up]:isChecked
    })
    let newNumer = new NumberAnimate({
        from: tempPrice,
        speed: 1000,
        refreshTime: 100,
        decimals: 2,
        onUpdate:()=>{
          this.setData({
            totalPrice: newNumer.tempValue
          })
        }
    })
  },
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    this.delItemDone(key)

    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const num = this.data.shippingCarInfo.items[index].number
    var tempPrice = parseInt(this.data.totalPrice)
    const isChecked = this.data.isCheck[index]
    if(isChecked){
      tempPrice -= price*num
      var tempChecks = this.data.isCheck
      tempChecks.slice(index,1)
      this.setData({
        isCheck: tempChecks
      })
      let newNumer = new NumberAnimate({
        from: tempPrice,
        speed: 1000,
        refreshTime: 100,
        decimals: 2,
        onUpdate:()=>{
          this.setData({
            totalPrice: newNumer.tempValue
          })
        }
      })
    }
  },
  async delItemDone(key){
    wx.showLoading({
      title: '加载中...',
    })
    var openid = ''
    var list = []
    const that = this
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      openid = res.result.openid
      db.collection('shopping-cart').where({
        _openid:res.result.openid
      }).get().then(res=>{
        res.data[0].items.forEach(value=>{
          if(value != null && value.good_id != key){
            list.push(value)
          }
        })
        db.collection('shopping-cart').where({
          _openid:openid
        }).update({
          data:{
            items: list
          },
          success(){
            //
          },
          complete(){
            TOOLS.showTabBarBadge()
            that.setData({
              noSelect: list.length > 0 ? false : true,
              'shippingCarInfo.items':list
            })
            wx.hideLoading()
          }
        })
      })
    })
  },
  async jiaBtnTap(e) {
    wx.showLoading({
      title: '加载中...',
    })
    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const isChecked = this.data.isCheck[index]
    var tempPrice = parseInt(this.data.totalPrice)
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number + 1
    if(isChecked){
      tempPrice += price
      let newNumer = new NumberAnimate({
        from: tempPrice,
        speed: 1500,
        refreshTime: 100,
        decimals: 2,
        onUpdate:()=>{
          this.setData({
            totalPrice: newNumer.tempValue
          })
        }
      });
    }
    const that = this
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.good_id,
        number: number,
      },
      complete(){
        that.shippingCarInfo()
        wx.hideLoading()
      }
    })
  },
  async jianBtnTap(e) {
    wx.showLoading({
      title: '加载中...',
    })
    const index = e.currentTarget.dataset.index
    const price = parseInt(this.data.shippingCarInfo.items[index].price)
    const isChecked = this.data.isCheck[index]
    var tempPrice = parseInt(this.data.totalPrice)
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number - 1
    if (number <= 0) {
      // 弹出删除确认
      wx.hideLoading()
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(item.good_id)
          }
        }
      })
      return
    }else{
      if(isChecked){
        tempPrice -= price
        let newNumer = new NumberAnimate({
          from: tempPrice,
          speed: 1500,
          refreshTime: 100,
          decimals: 2,
          onUpdate:()=>{
            this.setData({
              totalPrice: newNumer.tempValue
            })
          }
        })
      }
    }
    const that = this
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.good_id,
        number: number,
      },
      complete(){
        that.shippingCarInfo()
        wx.hideLoading()
      }
    })
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
          wx.setStorageSync('openid', this.data.openid)
        } catch (e) { }
        this.shippingCarInfo()
      })
    }
  },
  changeCarNumber(e){
    const key = e.currentTarget.dataset.key
    const number = parseInt(e.detail.value)
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: key,
        number: number,
      }
    }).then(res=>{
      this.shippingCarInfo()
    }).catch(console.error)
  },
})
