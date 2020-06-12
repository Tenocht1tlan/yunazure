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
    goodId:[],
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
  },
  // 数据库favorite里面有goodid有的就删除掉
delFav(e){
  // for(var i = 0;i<this.data.goodId.length;i++){
    this.delFavgood(this.data.goodId)
  // }
  return
},

 async delFavgood(key){
   var that = this
   var openid=''
   var list = []
   var goods = [] 
   const thst = this
    if(key.length==0){
      console.log('null')
    }else{
      console.log('!=null')
      wx.cloud.callFunction({
      name:'login',
    }).then(res=>{
      openid = res.result.openid
      db.collection('favorite').where({
        _openid:openid
      }).get().then(res=>{
        res.data[0].items.forEach(value=>{
          if(value !=null && key.indexOf(value.good_id) == -1){
            list.push(value)
          }
        })
        db.collection('favorite').where({
          _openid:openid
        }).update({
          data:{
            items:list
          },
          fail(err){
            console.log(err)
          },
          success(){
     
          },
        })
        this.data.favGoods.forEach(value=>{
          if(value != null && key.indexOf(value.good_id) == -1){
            goods.push(value)
          }
          this.setData({
            favGoods:goods
          })
        })

      })
    })

      }
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

