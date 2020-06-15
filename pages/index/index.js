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
    isIos:APP.globalData.isIos,
    navHeight:APP.globalData.navHeight,
    inputVal: "", // 搜索框内容
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    loadingHidden: false, // loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
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
              'src':'/images/my/ask.png',
              'id':'0',
              'starsetnum':false    
            },
            {
              'src':'/images/my/cancel.png',
              'id':'1',
              'starsetnum':false    
            },
            {
              'src':'/images/my/dsm.png',
              'id':'2',
              'starsetnum':false    
            },
          ]
    },
    {
      'text':'男士',
      'id':1,
      'imageChose':[
        {
          'src':'/images/my/check.png',
          'id':'0',
          'starsetnum':false    
        },
        {
          'src':'/images/my/zan.png',
          'id':'1',
          'starsetnum':false    
        },
        {
          'src':'/images/my/address.png',
          'id':'2',
          'starsetnum':false    
        },
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

  // 被点击的热卖商品的索引
    currentChoseItem :0,
    // 弹出界面
    optionList:['XS(160/62A)','S(165/66A)','M(170/70A)','L(175/78A)','XL(175/82A)'],
    // value:'所有',
 
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},//
    // 精品Boutique
    // 6.1
    Boutique:[{
      'src':'/images/woman.png',
    //   picture:[{
    //     'pic':'/images/share/check.png',
    //   },{
    //     'pic':'/images/share/check.png',
    //   },
    // ]
    },{
      'src':'/images/man.png',
 
    },{
      'src':'/images/scarfWoman.png',
   
    },{
      'src':'/images/scarfMan.png',

    },
  ],
  textHidden:[true,false,false,false],
  currTxthide:0,
  tempIdx:0,
  addFavInfo:{
    items:[]
  },
  addHistoryInfo:{
    items:[]
  }
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
  // 这好像没用的
  starset:function(e){
    let index = e.currentTarget.dataset.index;
    let temp = 'imageChose[' + index +'].starsetnum';
    this.setData({
      [temp]:!(this.data.imageChose[index].starsetnum)
    })
  },
  // 
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
              id:options.index,
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
    // wx.navigateTo({
    //   url: '/pages/goods/list?categoryId=' + e.currentTarget.id,
    // })
  },
  // 从下部弹上来界面.............................................................
  getOption:function(e){
    var that = this;
    that.setData({
      value:e.currentTarget.dataset.value,
      // hideFlag: true
    });
    that.hideModal();
  },
  //取消
  mCancel: function () {
    var that = this;
    that.hideModal();
  },
 
  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showUp: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var upImage = that.data.imageChose[index].src
    that.setData({
      upImage:upImage,
      hideFlag: false
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
        hideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块

  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
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
      url: "/pages/DIY/index"
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
  // ----------------------------------------------------------------.....
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
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
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: "Yunazure"
    })
    this.initBanners()
    this.categories()
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
  // async miaoshaGoods(){
  //   const res = await WXAPI.goods({
  //     miaosha: true
  //   })
  //   if (res.code == 0) {
  //     res.data.forEach(ele => {
  //       const _now = new Date().getTime()
  //       if (ele.dateStart) {
  //         ele.dateStartInt = new Date(ele.dateStart).getTime() - _now
  //       }
  //       if (ele.dateEnd) {
  //         ele.dateEndInt = new Date(ele.dateEnd).getTime() -_now
  //       }
  //     })
  //     this.setData({
  //       miaoshaGoods: res.data
  //     })
  //   }
  // },
  // async wxaMpLiveRooms(){
  //   const res = await WXAPI.wxaMpLiveRooms()
  //   if (res.code == 0 && res.data.length > 0) {
  //     this.setData({
  //       aliveRooms: res.data
  //     })
  //   }
  // },
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
    // this.goodsDynamic()
    // this.miaoshaGoods()
  },
  // async goodsDynamic(){
  //   const res = await WXAPI.goodsDynamic(0)
  //   if (res.code == 0) {
  //     this.setData({
  //       goodsDynamic: res.data
  //     })
  //   }
  // },
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
    this.getGoodsList(0);
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
    // const res = await WXAPI.goods({
    //   categoryId: categoryId,
    //   page: this.data.curPage,
    //   pageSize: this.data.pageSize
    // })
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
    
    // let goods = []
    // if (append) {
    //   goods = this.data.goods
    // }
    // for (var i = 0; i < this.data.goods.length; i++) {
    //   goods.push(this.data.goods[i]);
    // }
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
      inputVal: e.detail.value
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
  }

})