// pages/register/index.js
let app = getApp();
const AUTH = require('../../utils/auth')
//获取云数据库引用
const db = wx.cloud.database();
Page({

  data: {
    currentChoseItem:0,
    isEdit:false,
    Edit:'编辑',
    favGoods:[],
    unFav:[],
    goodId:[],
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

  check:function(e){
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.id
    var select = !this.data.favGoods[index].select
    var delgood = []
    var temp ='favGoods['+index+'].select'
    // console.log(this.data.favGoods)
    console.log(select)
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
    console.log(this.data.goodId)
   
    // this.setData({
    //   isChecked:ischecked,
    //   currentChoseItem:index,

    // })

  },
  // 数据库favorite里面有goodid有的就删除掉
  delFav:function(){

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

