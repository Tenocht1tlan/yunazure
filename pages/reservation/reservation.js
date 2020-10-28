const db = wx.cloud.database()
const app = getApp()
Page({
  data: {
    name:'',
    phone:'',
    region: ['浙江省', '杭州市', '西湖区'],
    customItem: '全部',
    address:'',
    number:0,
    orderNumber:'202005-1',
    hiddenName:true,
    zhejiang:'浙江省杭州市桐庐县',
    jiangshu:'江苏省南京市',
    fujian:'福建省福州市',
    content:'',
    image:'',
    isAdmin:false,
    infolist:[],
    count:0
  },

  initOpenId(){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      let tmp = res.result.openid == 'og4T_43cgLw2wBv3c06cfeR-EVLQ'? true:false
      this.setData({
        isAdmin:tmp
      })
    })
    db.collection('reservation').get().then(res=>{
      let list = []
      res.data.forEach(v=>{
        list.push(v)
      })
      this.setData({
        infolist:list,
        count:list.length
      })
    })
  },
  storeShowClick:function(e){
    var index = e.currentTarget.dataset.index
    if (index == 1) {
      this.setData({
        hiddenName:false,
        content:this.data.zhejiang
      })
    }else if(index == 2){
      this.setData({
        hiddenName:false,
        content:this.data.jiangshu
      })
    }else if(index == 3){
      this.setData({
        hiddenName:false,
        content:this.data.fujian
      })
    }
  },
  storeHiddenClick:function(e){
    this.setData({
      hiddenName:true
    })
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  bindnaInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindphInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindadInput: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  handleContact (e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
},
  onClick:function(){
    var _this = this
    if(_this.data.name == ''|| _this.data.phone == '' || _this.data.address == ''){
      wx.showModal({
        title:"提示",
        content:'请填写完整信息！',
        confirmText:'我知道了',
        showCancel:false
      })
    }else{
      wx.showModal({
        title:"预约",
        content:'您确定要预约吗',
        success(res){
          var date = new Date()
          if(res.confirm){
            wx.showLoading({
              title: '加载中',
            }),
            db.collection('reservation').where({
              tag: 'reservation' 
            }).count().then(res => {
              _this.setData({
                number:res.total + 1,
                orderNumber: date.getFullYear().toString() + date.getMonth().toString() + '-' + (res.total + 1).toString() 
              })
            })
            setTimeout(function () {
              wx.hideLoading({
                complete: (res) => {
                  db.collection('reservation').add({
                    data:{
                      orderNumber: _this.data.orderNumber,
                      name:_this.data.name,
                      phone:_this.data.phone,
                      region:_this.data.region[0] + _this.data.region[1] + _this.data.region[2],
                      address:_this.data.address,
                      tag:'reservation'
                    }
                  }).then(res=>{
                    wx.showToast({
                      title: '预约成功！',
                      icon: 'success',
                    })
                    _this.setData({
                      name:'',
                      phone:'',
                      address:''
                    })
                  }).catch(err=>{
                    wx.showModal({
                      title:'Tips',
                      content:'预约失败,稍后再试',
                    })
                  })
                },
              })
            }, 1000)
          }
        }
      })
    }
  },
  uploadFile(){
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        const tempFilePaths = res.tempFilePaths
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() +'.png',
          filePath: tempFilePaths[0], 
        }).then(res => {
          db.collection('image').add({
            data:{
              fileID:res.fileID
            }
          })
        })
      }
    })
  },
  showImage(){
    db.collection('image').get().then(res2=>{
      this.setData({
        image:res2.data[res2.data.length - 1].fileID
      })
    })
  },
  reservationInfo:function(e){
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }else{
      wx.showToast({
        title: '',
        icon: 'success',
      })
      this.setData({
        name: e.detail.userInfo.nickName,
        address:e.detail.userInfo.city
      })
    }
  },
  getPhoneNumber:function(e){
    wx.cloud.callFunction({
      name:"getPhone",
      data:{
        cloudID:e.detail.cloudID
      }
    }).then(res=>{
      wx.showToast({
        title: '',
        icon: 'success',
      })
      this.setData({
        phone: res.result.list[0].data.phoneNumber
      })
    }).catch(console.error)
  },
  probook:function(){
    wx.makePhoneCall({
      phoneNumber: '17805805661'
    })
  },
  aboutGoods(){
    wx.navigateTo({
      url: '/pages/aboutgoods/index?type=reservation'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.showImage()
    this.initOpenId()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})