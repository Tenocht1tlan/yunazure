
Page({

  data: {
    isEdit:false,
    Edit:'编辑'
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
     }
})