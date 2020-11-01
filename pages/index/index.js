//const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const db = wx.cloud.database();
const APP = getApp()
// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: "Yunazure"
  })
}

Page({
  data: {
    banners:['cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/1.jpg'
    , 'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/2.jpg'
    , 'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/3.jpg'
    , 'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/4.jpg'],
    toNew:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/story.jpg',
    toDiy:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/color.png',
    toSpecial:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/home.jpg',
    toComp:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/story.jpg',
    toAd:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/materil.jpg',
    toActivity:'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/Index/produce.jpg',
    isIos:APP.globalData.isIos,
    navHeight:APP.globalData.navHeight,
    inputVal: "",               // 搜索框内容
    goodsRecommend: [],         // 推荐商品
    kanjiaList: [],             //砍价商品列表
    pingtuanList: [],           //拼团商品列表
    loadingHidden: false,       // loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    curGoodInfo:{}, //current choose good info
    favStr: [],
    scrollTop: 0,
    hiddenNav:true,
    loadingMoreHidden: true,
    swiperHeight:1000,
    coupons: [],
    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0,
    array:[{
          'text':'女士',
          'id':0,
          'imageChose':[
            {
              'src':'/images/my/kefu.png',
              'id':'0',
              'starsetnum':false    
            }
          ]
    },
    {
      'text':'男士',
      'id':1,
      'imageChose':[
        {
          'src':'/images/my/kefu.png',
          'id':'0',
          'starsetnum':false    
        }
      ],
    },
    {
      'text':'女童',
      'id':2
    },
    {
      'text':'男童',
      'id':3
    },
    {
      'text':'女婴',
      'id':4
    },
    {
      'text':'男婴',
      'id':5
    },
    ],
    upImage:'',
    currentChoseItem :0,
    optionList:[],
    hideFlag: true,
    animationData: {},//
    Boutique:[{
        'src':'/images/woman.png'
      },{
        'src':'/images/man.png'
      },{
        'src':'/images/scarfWoman.png'
      },{
        'src':'/images/scarfMan.png'
    }],
    textHidden:[true,false,false,false],
    currTxthide:0,
    tempIdx:0,
    addFavInfo:{
      items:[]
    },
    addHistoryInfo:{
      items:[]
    },
    animationType:"animated bounceInRight",
    animationButton:"animated bounceIn",
    originLeft:'',
    animationText:'Yunazure',
    textArray:['Yunazure','帽子系列','家居毯系列','羊绒系列'],
    textColor:'#000',
    textColorArray:['#000','#fff','#000','#fff','#000','#000'],
    isAdmin:false
},
  initOpenId(){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      let tmp = res.result.openid == 'og4T_4yv81CqaRRjLaXqePYnzkm0'? true:false
      this.setData({
        isAdmin:tmp
      })
    })
  },
  toAddPro: function(e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: "/pages/goods-admin/index?type=" + type
    })
  },
  toDeletePro: function(e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: "/pages/goods-admin/index?type=" + type
    })
  },
  toModifyPro: function(e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: "/pages/goods-admin/index?type=" + type
    })
  },
  activeItem:function(e){
    this.setData({
      imageChose:this.data.array[e.target.dataset.index].imageChose,
      currentChoseItem:e.target.dataset.index

    })
  },
  Boutiques:function(e){
    // let temp = 'textHidden[' + e.currentTarget.dataset.index +']';
    var temp = []
    if(e.currentTarget.dataset.index == 0){
      temp = [true,false,false,false]
    }else if(e.currentTarget.dataset.index == 1){
      temp = [false,true,false,false]
    }else if(e.currentTarget.dataset.index == 2){
      temp = [false,false,true,false]
    }else{
      temp = [false,false,false,true]
    }
    this.setData({
      imageChose:this.data.array[e.currentTarget.dataset.index].imageChose,
      textHidden:temp,
    })
  },
  starset:function(e){
    let index = e.currentTarget.dataset.index;
    let temp = 'imageChose[' + index +'].starsetnum';
    this.setData({
      [temp]:!(this.data.imageChose[index].starsetnum)
    })
  },
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
              id:options.index,
              select:false
            }]
          }
        })
        this.addFavDone(options)
        console.log(options)
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
              that.data.favStr[options.index] = 1
              that.setData({
                favStr: that.data.favStr
              })
            }).catch(console.error)
          }else{
            if(existFav){
              that.delFavDone(goodsId)
              that.data.favStr[options.index] = 0
              that.setData({
                favStr: that.data.favStr
              })
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
                that.data.favStr[options.index] = 1
                that.setData({
                  favStr: that.data.favStr
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
  tabClick: function(e) {
    wx.setStorageSync("_categoryId", e.currentTarget.id)
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  addShopCarBySize:function(e){
    var that = this
    var canAdd = false
    var goodsId = this.data.curGoodInfo.good_id
    var size = e.currentTarget.dataset.value
    var name = this.data.curGoodInfo.name
    var price = this.data.curGoodInfo.minPrice.toFixed(2)
    var originalPrice = this.data.curGoodInfo.originalPrice.toFixed(2)
    var color = '白色'
    var number = 1
    var exist = false
    that.setData({
      shippingCarInfo:{
        items:[{
          good_id: goodsId,
          name: name,
          price: price,
          originalPrice: originalPrice,
          number: number,
          pic: that.data.curGoodInfo.pic,
          color: color,
          size: size,
          createTime: new Date().getTime()
        }]
      }
    })
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
            if(e.good_id == goodsId && e.size == size){
              exist = true
              number += e.number
              return
            }
          })
        }
        if (canAdd){
          db.collection('shopping-cart').add({
            data: {
              items: that.data.shippingCarInfo.items
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
                items: that.data.shippingCarInfo.items
              }
            }).then(res=>{
              wx.showToast({
                title: '加入购物袋',
                icon: 'success'
              })
            }).catch(console.error)
          }
        }
      })
    })
    this.hideModal()
  },
  //取消
  mCancel: function () {
    this.hideModal()
  },
  // choose current good size 
  showUp: function (e) {
    var that = this
    var goodid = e.currentTarget.dataset.id
    let sizeList = []
    db.collection('goods').where({
      good_id:goodid
    }).get().then(res=>{
      res.data[0].sku[0].childsCurGoods.forEach(e=>{
        sizeList.push({
          id: e.id,
          value: e.value
        })
      })
      this.setData({
        upImage: res.data[0].pic,
        optionList: sizeList,
        curGoodInfo: res.data[0]
      })
    })
    this.setData({
      hideFlag:false
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true,
        upImage:'',
        optionList:[]
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块
  },
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  doNotMove:function(){
    return
  },
  toDiy: function () {
    wx.navigateTo({
      url: "/pages/precustomize/index"
    })
  },
  toAd: function () {
    wx.navigateTo({
      url: "/pages/Ad/index"
    })
  },
  toSpecial: function () {
    wx.navigateTo({
      url: "/pages/Special/index"
    })
  },
  toActivity: function () {
    wx.navigateTo({
      url: "/pages/Activity/index"
    })
  },
  toNew: function () {
    wx.navigateTo({
      url: "/pages/New/index"
    })
  },
  toComp: function () {
    wx.navigateTo({
      url: "/pages/Comp/index"
    })
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id + "&name=" + e.currentTarget.dataset.name
    })
  },
  tapBanner: function(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  swiperChange:function(e){
    var index = e.detail.current
    var temp = this.data.textArray[index]
    var colorTemp = this.data.textColorArray[index]
    this.setData({
      originLeft:"opacity:0",
      animationType: "animated bounceOutRight",
      animationButton:"animated bounceInRight",
      animationText:temp,
      textColor:colorTemp
    })
  },
  animationFinish:function(e){
    this.setData({
      originLeft:"opacity:1",
      animationType: "animated bounceInRight",
      animationButton:"animated bounceIn",
    })
  },
  adClick: function(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  bindTypeTap: function(e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  onLoad: function(e) {
    wx.showShareMenu({
      withShareTicket: true
    })    
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: "Yunazure"
    })
    // this.initBanners()
    this.categories()
    this.initOpenId()
    // WXAPI.goods({
    //   recommendStatus: 1
    // }).then(res => {
    //   if (res.code === 0){
    //     that.setData({
    //       goodsRecommend: res.data
    //     })
    //   }      
    // })
    // that.getCoupons()
    // that.getNotice()
    // that.kanjiaGoods()
    // that.pingtuanGoods()
    // this.wxaMpLiveRooms()    
  },
  async initBanners(){
    const _data = {}
    // 读取头部轮播图
    db.collection('image').get().then(res=>{
      if(res.data){
        _data.banners = res.data
        this.setData(_data)
      }else{
        wx.showModal({
          title: '提示',
          content: 'error',
          showCancel: false
        })
      }
    })
  },
  onShow: function(e){
    if(APP.globalData.isIos){
      this.setData({
        navHeight:APP.globalData.navHeight*2,
        imageChose:this.data.array[0].imageChose,
        shopInfo: wx.getStorageSync('shopInfo')
      })
    }else{
      this.setData({
        navHeight:APP.globalData.navHeight*2+16,
        imageChose:this.data.array[0].imageChose,
        shopInfo: wx.getStorageSync('shopInfo')
      })
    }
    var tmp = []
    db.collection('goods').count().then(res=>{
      for(let i=0;i<res.total;i++){
        tmp.push(0)
      }
      db.collection('favorite').get().then(res=>{
        if(res.data[0].items.length > 0){
          res.data[0].items.forEach(res=>{
            if(res != null){
              tmp[res.id] = 1
            }
          })
        }
        this.setData({
          favStr: tmp
        })
      })
    })

    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge()
  },
  async categories(){
    // const res = await WXAPI.goodsCategory()
    let categories = [];
    // if (res.code == 0) {
    //   const _categories = res.data.filter(ele => {
    //     return ele.level == 1
    //   })
    //   categories = categories.concat(_categories)
    // }
    // this.setData({
    //   categories: categories,
    //   activeCategoryId: 0,
    //   curPage: 1
    // });
    this.getGoodsList(0)
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop, 
    })
    if(scrollTop>(this.data.swiperHeight-APP.globalData.navHeight*2)/2){
      this.setData({
      hiddenNav : false
    })
    }else{
      this.setData({
        hiddenNav : true
      })
    }
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    wx.showLoading({
      "mask": true
    })
    // var tmp = []
    // db.collection('goods').count().then(res=>{
    //   for(let i=0;i<res.total;i++){
    //     tmp.push(0)
    //   }
    //   db.collection('favorite').get().then(res=>{
    //     if(res.data[0].items.length > 0){
    //       res.data[0].items.forEach(res=>{
    //         if(res != null){
    //           tmp[res.id] = 1
    //         }
    //       })
    //     }
    //     this.setData({
    //       favStr: tmp
    //     })
    //   })
    // })
    wx.cloud.callFunction({
      name:'getIndexGoods'
    }).then(res=>{
      if(res.result.data){
        this.setData({
          goods:res.result.data
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '网络异常',
          showCancel: false
        })
      }
    }).catch(console.error)
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
    
    this.setData({
      loadingMoreHidden: true,
      goods: goods,
    })
  },
  getCoupons: function() {
    // var that = this;
    // WXAPI.coupons().then(function (res) {
    //   if (res.code == 0) {
    //     that.setData({
    //       coupons: res.data
    //     });
    //   }
    // })
  },
  onShareAppMessage: function() {    
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  getNotice: function() {
    // var that = this;
    // WXAPI.noticeList({pageSize: 5}).then(function (res) {
    //   if (res.code == 0) {
    //     that.setData({
    //       noticeList: res.data
    //     });
    //   }
    // })
  },
  onReachBottom: function() {
    // this.setData({
    //   curPage: this.data.curPage + 1
    // });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh: function() {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
    wx.stopPullDownRefresh()
  },
  // 获取砍价商品
  async kanjiaGoods(){
    // const res = await WXAPI.goods({
    //   kanjia: true
    // });
    // if (res.code == 0) {
    //   const kanjiaGoodsIds = []
    //   res.data.forEach(ele => {
    //     kanjiaGoodsIds.push(ele.id)
    //   })
    //   const goodsKanjiaSetRes = await WXAPI.kanjiaSet(kanjiaGoodsIds.join())
    //   if (goodsKanjiaSetRes.code == 0) {
    //     res.data.forEach(ele => {
    //       const _process = goodsKanjiaSetRes.data.find(_set => {
    //         return _set.goodsId == ele.id
    //       })
    //       if (_process) {
    //         ele.process = 100 * _process.numberBuy / _process.number
    //       }
    //     })
    //     this.setData({
    //       kanjiaList: res.data
    //     })
    //   }
    // }
  },
  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  pingtuanGoods(){ // 获取团购商品列表
    // const _this = this
    // WXAPI.goods({
    //   pingtuan: true
    // }).then(res => {
    //   if (res.code === 0) {
    //     _this.setData({
    //       pingtuanList: res.data
    //     })
    //   }
    // })
  },
  bindinput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail.valuee
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  goSearch(){
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  scrollToLeft() {
    this.setAction({
      scrollTop: 0
    })
  },
})