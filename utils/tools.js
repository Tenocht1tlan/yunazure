const WXAPI = require('apifm-wxapi')
const db = wx.cloud.database()
// 显示购物车tabBar的Badge
function showTabBarBadge(){
  const token = wx.getStorageSync('isloged')
    if (!token) {
      return
    }
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      db.collection('shopping-cart').where({
        _openid:res.result.openid
      }).get().then(res=>{
        if(res.data[0] == undefined){
          wx.removeTabBarBadge({
            index: 3
          })
        }else{
          var num = 0
          res.data[0].items.forEach(value=>{
            if(value != null){
              num += value.number
            }
          })
          if(num == 0){
            wx.removeTabBarBadge({
              index: 3
            })
          }else{
            wx.setTabBarBadge({
              index: 3,
              text: num.toString()
            })
          }
        }
      })
    })
}

module.exports = {
  showTabBarBadge: showTabBarBadge
}