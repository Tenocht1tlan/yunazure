const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    wxlogin: true,
    saveHidden: true,
    allSelect: true,
    noSelect: false,
    startX:'',
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    shippingCarInfo:{
      items:[{
        key:1,
        name:'1',
        price:229.00,
        number:100,
        active:false,
        pic:'/images/my/cancel.png',
        property:[{
          color:'黑色',
          itemid:'5004/45'}
        ],
        left:''
      }]
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
    }
  },
  async shippingCarInfo(){
    const token = wx.getStorageSync('isloged')
    if (!token) {
      return
    }
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('shopping-cart').where({
        _openid:res.result.openid
      }).get().then(res2=>{
        console.log('res2 ='+res2.data[0])
        this.setData({
          shippingCarInfo: res2.data[0]
        })
      }).catch(err=>{
        this.setData({
          shippingCarInfo: null
        })
      })
    }).catch(console.error)
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
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    this.delItemDone(key)
  },
  async delItemDone(key){
    const token = wx.getStorageSync('token')
    const res = await WXAPI.shippingCarInfoRemoveItem(token, key)
    if (res.code != 0 && res.code != 700) {
      wx.showToast({
        title: res.msg,
        icon:'none'
      })
    } else {
      this.shippingCarInfo()
      TOOLS.showTabBarBadge()
    }
  },
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number + 1
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.key,
        number: number,
      }
    }).then(res=>{
      console.log(res.result) 
    }).catch(console.error)
    this.shippingCarInfo()
  },
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number-1
    if (number <= 0) {
      // 弹出删除确认
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(item.key)
          }
        }
      })
      return
    }
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: item.key,
        number: number,
      }
    }).then(res=>{
      console.log(res.result) 
    }).catch(console.error)
    this.shippingCarInfo()
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
      try {
        wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl)
        wx.setStorageSync('mail', e.detail.userInfo.nickName)
        wx.setStorageSync('isloged', true)
      } catch (e) { }
      this.setData({
        wxlogin:true,
      })
    }
  },
  changeCarNumber(e){
    const key = e.currentTarget.dataset.key
    const number = e.detail.value
    console.log('key = ' + key)
    wx.cloud.callFunction({
      name:'changeSCartNum',
      data: {
        key: key,
        number: number,
      }
    }).then(res=>{
      this.shippingCarInfo()
      console.log(res.result) 
    }).catch(console.error)
  }
})
