// pages/register/index.js
let app = getApp();
//获取云数据库引用
const db = wx.cloud.database();
Page({

  data: {
    isEdit:false,
    Edit:'编辑',
    goods:[]
  },

  edit:function(e){
      var edit = !this.data.isEdit;
      var temp= '';
      if(edit){
          temp = '取消'
      }else{
          temp = '编辑'
      }
      this.setData({
        Edit:temp,
        isEdit:edit
      })
     },


})
// db.collection('goods').doc('_id_').get({
//   success: function(res) {
//     // res.data 包含该记录的数据
//     console.log(res.data)
//   }
// })