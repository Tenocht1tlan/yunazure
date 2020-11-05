const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList:[],
    list:[],
    isEdit:false,
    Edit:'编辑',
    goodId:[],
    checkHidden:true,
    animationData: {},
    showPop: false
  },
  editHis:function(e) {
    var edit = !this.data.isEdit;   
    var hidden = !this.data.checkHidden;
    var temp= '';
    if(edit){
        temp = '取消';      
        this.showModal()
    }else{
        temp = '编辑';
        this.hideModal();
    }
    this.setData({
      Edit:temp,
      isEdit:edit,
      checkHidden:hidden
    })
  },
  showModal() {
    var animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease'
    })
    animation.translateY(500).step()
    this.setData({
        animationData: animation.export(),
        showPop: true
    })
    animation.translateY(0).step()
    this.setData({
        animationData: animation.export(),
    })
  },
  hideModal() {
    var animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease-in-out'
    })
    animation.translateY(500).step()
    this.setData({
        animationData: animation.export(),
    })
    animation.translateY(0).step()
    this.setData({
      animationData: animation.export(),
      showPop: false
    })
  },
  getHistoryList(){
    var that = this
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('history').get().then(res=>{
        if(res.data){
          this.setData({
            list:res.data
          })
        }
        this.setData({
          historyList:that.data.list.reverse()
        })
      }).catch(err=>{
        console.log(err)
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow:function() {
      this.getHistoryList()
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
  toDetailsTap: function(e) {
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.id
    var select = !this.data.favGoods[index].select
    var temp ='historyList['+index+'].select'
    var hidden = this.data.isEdit
    if(hidden){
      this.setData({
        [temp]:select
      })
      if(select){
        this.data.goodId.push(id)
        this.setData({
          goodId:this.data.goodId
        })
      }else{
        for(let i=0;i<this.data.goodId.length;i++){
          if(this.data.goodId[i] == id){
            this.data.goodId.splice(i,i+1)
          }
        }
      }
    }else{
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id + "&name=" + e.currentTarget.dataset.name
      })
    }
  },
})