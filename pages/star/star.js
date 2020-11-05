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
  editFav:function(e) {
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
  delFav(e){
      this.delFavgood(this.data.goodId)
  },
  async delFavgood(key){
    var openid = ''
    var list = []
    var goods = [] 
    if(key.length==0){

    }else{
      openid = wx.getStorageSync('openid')
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
            favGoods:goods,
          })
        })
      })
    }
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
          if(res.data[0]){
            this.setData({
              favGoods:res.data[0].items
            })
          }
        })
      })
    }else{
      wx.switchTab({
        url: '/pages/my/index',
      })
    }
  }
})