// pages/aboutgoods/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      xieyi:['cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy1.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy2.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy3.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy4.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy5.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy6.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy7.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy8.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy9.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy10.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy11.jpg',
      'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/others/xy12.jpg'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    //composition ->成分和保养 size->尺码表 delivery->配送与退货
    this.setData({
      type: type
    })
    if(type == 'composition'){
      wx.setNavigationBarTitle({
        title: '成分和保养',
      })
    }else if (type == 'size'){
      wx.setNavigationBarTitle({
        title: '尺码表',
      })
    }else if(type == 'delivery'){
      wx.setNavigationBarTitle({
        title: '配送与退货',
      })
    }else if(type == 'reservation'){
      wx.setNavigationBarTitle({
        title: '条款与协议',
      })
    }
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})