const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')

const APP = getApp()
// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: "和风暖阳"
  })
}

Page({
  data: {
    inputVal: "", // 搜索框内容
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    loadingHidden: false, // loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    
    scrollTop: 0,
    loadingMoreHidden: true,

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
},
  activeItem:function(e){
    this.setData({
      imageChose:this.data.array[e.target.dataset.index].imageChose,
      currentChoseItem:e.target.dataset.index
    })
  },
starset:function(e){
  let index = e.currentTarget.dataset.index;
  let temp = 'imageChose[' + index +'].starsetnum';
  // 获取当前点击的下标
  this.setData({
    [temp]:!(this.data.imageChose[index].starsetnum)
  })
},
// starset:function(e) {
//   // 获取当前点击下标
//   var index = e.currentTarget.dataset.index;
//   // data中获取列表
//   var message = this.data.goodList;
//   for (let i in message) { //遍历列表数据
//     if (i == index) { //根据下标找到目标
//       if (message[i].collected == 0) { //如果是没点赞+1
//         message[i].collected = parseInt(message[i].collected) + 1
//       } else {
//         message[i].collected = parseInt(message[i].collected) - 1
//       }
//     }
//   }
// },

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
  // 点击选项
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
    console.log(index)
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
    console.log('yxh')
    return
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
      title: "和风暖阳"
    })
    this.initBanners()
    this.categories()
    WXAPI.goods({
      recommendStatus: 1
    }).then(res => {
      if (res.code === 0){
        that.setData({
          goodsRecommend: res.data
        })
      }      
    })
    that.getCoupons()
    that.getNotice()
    that.kanjiaGoods()
    that.pingtuanGoods()
    this.wxaMpLiveRooms()    
  },
  async miaoshaGoods(){
    const res = await WXAPI.goods({
      miaosha: true
    })
    if (res.code == 0) {
      res.data.forEach(ele => {
        const _now = new Date().getTime()
        if (ele.dateStart) {
          ele.dateStartInt = new Date(ele.dateStart).getTime() - _now
        }
        if (ele.dateEnd) {
          ele.dateEndInt = new Date(ele.dateEnd).getTime() -_now
        }
      })
      this.setData({
        miaoshaGoods: res.data
      })
    }
  },
  async wxaMpLiveRooms(){
    const res = await WXAPI.wxaMpLiveRooms()
    if (res.code == 0 && res.data.length > 0) {
      this.setData({
        aliveRooms: res.data
      })
    }
  },
  async initBanners(){
    const _data = {}
    // 读取头部轮播图
    const res1 = await WXAPI.banners({
      type: 'index'
    })
    if (res1.code == 700) {
      wx.showModal({
        title: '提示',
        content: '请在后台添加 banner 轮播图片，自定义类型填写 index',
        showCancel: false
      })
    } else {
      _data.banners = res1.data
    }
    this.setData(_data)
  },
  onShow: function(e){
    this.setData({
      imageChose:this.data.array[0].imageChose,
    })
    this.setData({
      shopInfo: wx.getStorageSync('shopInfo')
    })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge()
    this.goodsDynamic()
    this.miaoshaGoods()
  },
  async goodsDynamic(){
    const res = await WXAPI.goodsDynamic(0)
    if (res.code == 0) {
      this.setData({
        goodsDynamic: res.data
      })
    }
  },
  async categories(){
    const res = await WXAPI.goodsCategory()
    let categories = [];
    if (res.code == 0) {
      const _categories = res.data.filter(ele => {
        return ele.level == 1
      })
      categories = categories.concat(_categories)
    }
    this.setData({
      categories: categories,
      activeCategoryId: 0,
      curPage: 1
    });
    this.getGoodsList(0);
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    wx.showLoading({
      "mask": true
    })
    const res = await WXAPI.goods({
      categoryId: categoryId,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    })
    wx.hideLoading()
    if (res.code == 404 || res.code == 700) {
      let newData = {
        loadingMoreHidden: false
      }
      if (!append) {
        newData.goods = []
      }
      this.setData(newData);
      return
    }
    let goods = [];
    if (append) {
      goods = this.data.goods
    }
    for (var i = 0; i < res.data.length; i++) {
      goods.push(res.data[i]);
    }
    this.setData({
      loadingMoreHidden: true,
      goods: goods,
    });
  },
  getCoupons: function() {
    var that = this;
    WXAPI.coupons().then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data
        });
      }
    })
  },
  onShareAppMessage: function() {    
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  getNotice: function() {
    var that = this;
    WXAPI.noticeList({pageSize: 5}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data
        });
      }
    })
  },
  onReachBottom: function() {
    this.setData({
      curPage: this.data.curPage + 1
    });
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
    const res = await WXAPI.goods({
      kanjia: true
    });
    if (res.code == 0) {
      const kanjiaGoodsIds = []
      res.data.forEach(ele => {
        kanjiaGoodsIds.push(ele.id)
      })
      const goodsKanjiaSetRes = await WXAPI.kanjiaSet(kanjiaGoodsIds.join())
      if (goodsKanjiaSetRes.code == 0) {
        res.data.forEach(ele => {
          const _process = goodsKanjiaSetRes.data.find(_set => {
            console.log(_set)
            return _set.goodsId == ele.id
          })
          console.log(ele)
          console.log(_process)
          if (_process) {
            ele.process = 100 * _process.numberBuy / _process.number
          }
        })
        this.setData({
          kanjiaList: res.data
        })
      }
    }
  },
  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  pingtuanGoods(){ // 获取团购商品列表
    const _this = this
    WXAPI.goods({
      pingtuan: true
    }).then(res => {
      if (res.code === 0) {
        _this.setData({
          pingtuanList: res.data
        })
      }
    })
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