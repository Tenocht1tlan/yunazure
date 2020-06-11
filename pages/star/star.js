// pages/register/index.js
let app = getApp();
const AUTH = require('../../utils/auth')
//获取云数据库引用
const db = wx.cloud.database();
Page({

  data: {
    isEdit:false,
    Edit:'编辑',
    favGoods:[],
    isChecked:false,//控制打勾的隐藏与否
    checkHidden:true,
    animationData: {},
    showPop: false,
  },
// 还有个问题没解决，第一次showup没有动画效果
  edit:function(e){
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

  check:function(){
    var ischecked = !this.data.isChecked
    this.setData({
      isChecked:ischecked
    })
  },


//  --------------------底部弹出框--------------------
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

// 隐藏遮罩层
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

async onShow() {
  this.getFavGoodsList()
},
async getFavGoodsList(){
  const isLogined = await AUTH.checkHasLogined()
  if(isLogined){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('favorite').where({
          _openid:res.result.openid
      }).get().then(res=>{
        this.setData({
          favGoods:res.data[0].items
        })
      })
    })
  }else{
    wx.switchTab({
      url: '/pages/my/index',
    })
  }

}
})

