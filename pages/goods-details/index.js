const app = getApp()
const CONFIG = require('../../config.js')
const AUTH = require('../../utils/auth')
const SelectSizePrefix = "选择："
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    faved:false,
    wxlogin: false,
    goodsDetail: {},
    pics:[],
    hasMoreSelect: false,
    selectSize: SelectSizePrefix,
    selectSizePrice: 0,
    selectSizeOPrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    shippingCarInfo:{
      items:[]
    },
    goodsId:'',
    goods: [],
    addFavInfo:{
      items:[]
    },

  },
   onLoad(e) {
    this.data.kjJoinUid = e.kjJoinUid
    this.setData({
      goodsId : e.id,
      goodsDetailSkuShowType: CONFIG.goodsDetailSkuShowType,
      curuid: wx.getStorageSync('uid')
    })
    // this.reputation(e.id)
    this.shippingCartInfo() 
    wx.setNavigationBarTitle({
      title: e.name
    })
  },  
  shippingCartInfo(){
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
        if(res.data[0] == undefined){
          this.setData({
            shopNum: 0
          })
        }else{
          var num = 0
          res.data[0].items.forEach(value=>{
            if(value != null){
              num += value.number
            }
          })
          this.setData({
            shopNum: num
          })
        }
      })
    })
  },
   onShow (){
    var that  = this
    const isloged = wx.getStorageSync('isloged')
    if (!isloged) {
      return
    }else{
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        db.collection('favorite').where({
          _openid : res.result.openid
        }).get().then(res=>{
          res.data[0].items.forEach(value=>{
              if(value.good_id == that.data.goodsId){
                this.setData({
                  faved:true
                })
                return
              }
          })
        })
      })
      this.setData({
        wxlogin: isloged
      })
    }
    this.getGoodsDetailAndKanjieInfo(this.data.goodsId)
  },
  addHistory(){
    var that = this
    db.collection('history').get().then(res=>{
      res.data.forEach(val=>{
        if(val.good_id == that.data.goodsId){
          db.collection('history').where({
            good_id:that.data.goodsId
          }).remove()
          return
        }
      })
      db.collection('history').add({
        data: {
          good_id:that.data.goodsId,
          name:that.data.goodsDetail.name,
          pic:that.data.goodsDetail.pic,
          price:that.data.goodsDetail.minPrice,
        }
      })
    })
  },
  async getGoodsDetailAndKanjieInfo(goodsId) {
    const that = this
    var goodsDetailRes = {}
    wx.showLoading({
      title: '加载中...',
    }),
    db.collection('goods').where({
      good_id:goodsId
    }).get({
      success: function(res) {
        goodsDetailRes = res.data[0]
      },
      fail: console.error,
      complete:function(){
        wx.hideLoading()
        if (goodsDetailRes) {
          var selectSizeTemp = SelectSizePrefix
          if (goodsDetailRes.sku) {
            for (var i = 0; i < goodsDetailRes.sku.length; i++) {
              selectSizeTemp = selectSizeTemp + " " + goodsDetailRes.sku[i].size
            }
            that.setData({
              hasMoreSelect: true,
              selectSize: selectSizeTemp,
              selectSizePrice: goodsDetailRes.minPrice,
              selectSizeOPrice: goodsDetailRes.originalPrice,
            });
          }
          // if (goodsDetailRes.shopId) {
          //   this.shopSubdetail(goodsDetailRes.shopId)
          // }
          that.data.goodsDetail = goodsDetailRes
          let tmpPics = []
          tmpPics.push(goodsDetailRes.pic)
          goodsDetailRes.subPics.forEach(e=>{
            tmpPics.push(e.pic)
          })
          that.setData({
            pics: tmpPics
          })
          let _data = {
            goodsDetail: goodsDetailRes,
            selectSizePrice: goodsDetailRes.minPrice,
            selectSizeOPrice: goodsDetailRes.originalPrice,
            buyNumMax: goodsDetailRes.stockNum,
            buyNumber: (goodsDetailRes.stockNum > 0) ? 1 : 0
          }
          // if (goodsKanjiaSetRes.code == 0) {
          //   _data.curGoodsKanjia = goodsKanjiaSetRes.data[0]
          //   that.data.kjId = _data.curGoodsKanjia.id
          //   // 获取当前砍价进度
          //   if (!that.data.kjJoinUid) {
          //     that.data.kjJoinUid = wx.getStorageSync('uid')
          //   }
          //   const curKanjiaprogress = await WXAPI.kanjiaDetail(_data.curGoodsKanjia.id, that.data.kjJoinUid)
          //   const myHelpDetail = await WXAPI.kanjiaHelpDetail(wx.getStorageSync('token'), _data.curGoodsKanjia.id, that.data.kjJoinUid)
          //   if (curKanjiaprogress.code == 0) {
          //     _data.curKanjiaprogress = curKanjiaprogress.data
          //   }
          //   if (myHelpDetail.code == 0) {
          //     _data.myHelpDetail = myHelpDetail.data
          //   }
          // }
          // if (goodsDetailRes.data.basicInfo.pingtuan) {
          //   const pingtuanSetRes = await WXAPI.pingtuanSet(goodsId)
          //   if (pingtuanSetRes.code == 0) {
          //     _data.pingtuanSet = pingtuanSetRes.data
          //     // 如果是拼团商品， 默认显示拼团价格
          //     _data.selectSizePrice = goodsDetailRes.data.basicInfo.pingtuanPrice
          //   }        
          // }
          that.setData(_data)
        }
        that.addHistory()
      }
    })
  },
  async shopSubdetail(shopId){
    // const res = await WXAPI.shopSubdetail(shopId)
    // if (res.code == 0) {
    //   this.setData({
    //     shopSubdetail: res.data
    //   })
    // }
  },
  goShopCar: function() {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function() {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function() {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  toPingtuan: function(e) {
    let pingtuanopenid = 0
    if (e.currentTarget.dataset.pingtuanopenid) {
      pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
    }
    this.setData({
      shopType: "toPingtuan",
      selectSizePrice: this.data.goodsDetail.pingtuanPrice,
      selectSizeOPrice: this.data.goodsDetail.originalPrice,
      pingtuanopenid: pingtuanopenid,
      
      hideShopPopup: false,
      skuGoodsPic: this.data.goodsDetail.pic
    });
    
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.goodsDetail.minPrice,
      selectSizeOPrice: this.data.goodsDetail.originalPrice,
      skuGoodsPic: this.data.goodsDetail.pic
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function() {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function() {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  async labelItemTap(e) {
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
    // 计算当前价格
    if (canSubmit) {
      // const res = await WXAPI.goodsPrice(this.data.goodsDetail.id, propertyChildIds)
      // if (res.code == 0) {
      //   let _price = res.data.price
        this.setData({
          // selectSizePrice: _price,
          // selectSizeOPrice: res.data.originalPrice,
          propertyChildIds: propertyChildIds,
          propertyChildNames: propertyChildNames,
          properties: properties,
          // buyNumMax: res.data.stockNum,
          // buyNumber: (res.data.stockNum > 0) ? 1 : 0
        })
      // }
    }
    let skuGoodsPic = this.data.skuGoodsPic
    if (this.data.goodsDetail.subPics && this.data.goodsDetail.subPics.length > 0) {
      const _subPic = this.data.goodsDetail.subPics.find(ele => {
        return ele.optionValueId == child.id
      })
      if (_subPic) {
        skuGoodsPic = _subPic.pic
      }
    }
    this.setData({
      goodsDetail: this.data.goodsDetail,
      canSubmit: canSubmit,
      skuGoodsPic
    })
  },
  /**
   * 加入购物车
   */
   addShopCar() {
    if (this.data.goodsDetail.sku && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showToast({
          title: '请选择规格',
          icon: 'none'
        })
      }
      this.bindGuiGeTap()
      return
    }
    if (this.data.buyNumber < 1) {
      wx.showToast({
        title: '请选择购买数量',
        icon: 'none'
      })
      return
    }
    const sku = []
    if (this.data.goodsDetail.sku) {
      this.data.goodsDetail.sku.forEach(p => {
        sku.push({
          optionId: p.id,
          optionValueId: p.optionValueId
        })
      })
    }
    var canAdd = false
    wx.showLoading({
      title: '加载中...'
    })
    var goodsId = this.data.goodsDetail.good_id
    var number = this.data.buyNumber
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
    var name = this.data.goodsDetail.name
    var price = this.data.selectSizePrice.toFixed(2)
    var originalPrice = this.data.selectSizeOPrice.toFixed(2)
    var size = this.data.properties[0]
    var color = this.data.properties[1]
    var that = this
    that.setData({
      shippingCarInfo:{
        items:[{
          good_id: goodsId,
          name: name,
          price: price,
          originalPrice: originalPrice,
          number: number,
          pic: that.data.goodsDetail.pic,
          color: color,
          size: size,
        }]
      }
    })
    setTimeout(function () {
      wx.hideLoading({
        complete: (res) => {
          if (canAdd){
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
        },
      })
    }, 500)
    this.closePopupTap()
    this.shippingCartInfo()
  },
  /**
   * 立即购买
   */
  buyNow: function(e) {
    let that = this
    let shoptype = e.currentTarget.dataset.shoptype
    if (this.data.goodsDetail.sku && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请先选择规格尺寸~',
          showCancel: false
        })
      }
      this.bindGuiGeTap()
      return
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype)
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap()
    if (shoptype == 'toPingtuan') {
      if (this.data.pingtuanopenid) {
        wx.navigateTo({
          url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
        })
      } else {
        WXAPI.pingtuanOpen(wx.getStorageSync('token'), that.data.goodsDetail.basicInfo.id).then(function(res) {
          if (res.code == 2000) {
            that.setData({
              wxlogin: false
            })
            return
          }
          if (res.code != 0) {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })
            return
          }
          wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.id
          })
        })
      }
    } else {
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function(shoptype) {
    var shopCarMap = {}
    shopCarMap.good_id = this.data.goodsDetail.good_id
    shopCarMap.pic = this.data.goodsDetail.pic
    shopCarMap.name = this.data.goodsDetail.name
    shopCarMap.price = this.data.selectSizePrice.toFixed(2)
    shopCarMap.active = true
    shopCarMap.number = this.data.buyNumber
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId
    shopCarMap.logistics = this.data.goodsDetail.logistics
    shopCarMap.color = this.data.properties[1]
    shopCarMap.size = this.data.properties[0]
    
    var buyNowInfo = {}
    buyNowInfo.shopNum = 0
    buyNowInfo.items = []
    // var hasSameGoodsIndex = -1;
    // for (var i = 0; i < toBuyInfo.shopList.length; i++) {
    //   var tmpShopCarMap = toBuyInfo.shopList[i];
    //   if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
    //     hasSameGoodsIndex = i;
    //     shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
    //     break;
    //   }
    // }
    // toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
    // if (hasSameGoodsIndex > -1) {
    //   toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    // } else {
    //   toBuyInfo.shopList.push(shopCarMap);
    // }
    buyNowInfo.items.push(shopCarMap)
    return buyNowInfo
  },
  onShareAppMessage() {
    let _data = {
      title: this.data.goodsDetail.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.good_id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function(res) {
      },
      fail: function(res) {
      }
    }
    // if (this.data.kjJoinUid) {
    //   _data.title = this.data.curKanjiaprogress.joiner.nick + '邀请您帮TA砍价'
    //   _data.path += '&kjJoinUid=' + this.data.kjJoinUid
    // }
    return _data
  },
  reputation: function(goodsId) {
    var that = this;
    WXAPI.goodsReputation({
      goodsId: goodsId
    }).then(function(res) {
      if (res.code == 0) {
        that.setData({
          reputation: res.data
        });
      }
    })
  },
  pingtuanList: function(goodsId) {
    var that = this;
    WXAPI.pingtuanList({
      goodsId: goodsId,
      status: 0
    }).then(function(res) {
      if (res.code == 0) {
        that.setData({
          pingtuanList: res.data.result
        });
      }
    })
  },
  getVideoSrc: function(videoId) {
    var that = this;
    WXAPI.videoDetail(videoId).then(function(res) {
      if (res.code == 0) {
        that.setData({
          videoMp4Src: res.data.fdMp4
        });
      }
    })
  },
  joinKanjia(){
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.doneJoinKanjia();
      } else {
        this.setData({
          wxlogin: false
        })
      }
    })
  },
  doneJoinKanjia: function() { // 报名参加砍价活动
    const _this = this;
    if (!_this.data.curGoodsKanjia) {
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    WXAPI.kanjiaJoin(wx.getStorageSync('token'), _this.data.curGoodsKanjia.id).then(function(res) {
      wx.hideLoading()
      if (res.code == 0) {
        _this.setData({
          kjJoinUid: wx.getStorageSync('uid'),
          myHelpDetail: null
        })
        _this.getGoodsDetailAndKanjieInfo(_this.data.goodsDetail.basicInfo.id)
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })
  },
  joinPingtuan: function(e) {
    let pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + pingtuanopenid
    })
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  helpKanjia() {
    const _this = this;
    AUTH.checkHasLogined().then(isLogined => {
      _this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        _this.helpKanjiaDone()
      }
    })
  },
  helpKanjiaDone(){
    const _this = this;
    WXAPI.kanjiaHelp(wx.getStorageSync('token'), _this.data.kjId, _this.data.kjJoinUid, '').then(function (res) {
      if (res.code != 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return;
      }
      _this.setData({
        myHelpDetail: res.data
      });
      wx.showModal({
        title: '成功',
        content: '成功帮TA砍掉 ' + res.data.cutPrice + ' 元',
        showCancel: false
      })
      _this.getGoodsDetailAndKanjieInfo(_this.data.goodsDetail.basicInfo.id)
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
      try {
        wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl)
        wx.setStorageSync('mail', e.detail.userInfo.nickName)
        wx.setStorageSync('isloged', true)
      } catch (e) { }
      this.setData({
        wxlogin:true,
      })
    }
    // AUTH.register(this);
  },
  closePop(){
    this.setData({
      posterShow: false
    })
  },
  previewImage(e){
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  onPosterSuccess(e) {
    console.log('success:', e)
    this.setData({
      posterImg: e.detail,
      showposterImg: true
    })
  },
  onPosterFail(e) {
    console.error('fail:', e)
  },
  savePosterPic() {
    const _this = this
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImg,
      success: (res) => {
        wx.showModal({
          content: '已保存到手机相册',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#333'
        })
      },
      complete: () => {
        _this.setData({
          showposterImg: false
        })
      },
      fail: (res) => {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  async  addFav(e){
    var goodsId = this.data.goodsDetail.good_id
    this.addFavCheck(goodsId)
    this.setData({
      faved:!this.data.faved
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
        good_id:options
      }).get().then(res=>{
        this.setData({
          addFavInfo:{
            items:[{
              good_id:options,
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
      let goodsId = options
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
              // wx.showToast({
              //   title: '加入心愿单',
              //   icon: 'success'
              // })
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
