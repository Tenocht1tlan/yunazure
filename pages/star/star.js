// pages/register/index.js
let app = getApp();
//获取云数据库引用
const db = wx.cloud.database();
Page({

  data: {
    isEdit:false,
    Edit:'编辑',
    goods:[],
    isChecked:false,
    checkHidden:true,
    animationData: {},
    hideFlag: true,
  },
// 还有个问题没解决，第一次showup没有动画效果
  edit:function(e){
      var edit = !this.data.isEdit;   
      var hidden = !this.data.checkHidden;
      console.log(hidden)
      var temp= '';
      if(edit){
          temp = '取消';
          this.showUp();          
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


  // ----------------------------------------------------------------------------
 
  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showUp: function (e) {
    var that = this;
    that.setData({
      hideFlag: false
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'linear',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 50)
  },
 
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'linear',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true
      });
      clearTimeout(time1);
      time1 = null;
    }, 200)//先执行下滑动画，再隐藏模块
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
    this.animation.translateY(80).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  doNotMove:function(){
    return
  },

})
