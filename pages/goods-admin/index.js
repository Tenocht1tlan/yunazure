// pages/goods-admin/index.js
const db =  wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:'',
    doc:'',
    goodid:'',
    maxID:0,
    name:'',
    price:0,
    size1:'',
    size2:'',
    size3:'',
    color1:'',
    color2:'',
    color3:'',
    sku:[], 
    files:[],             //上传的所有图片
    subPics:[],           //[{"optionValueId":"1","pic":"cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/goods/woolblendcap/beige.jpg"}],
    composition:"",       //主要成分:羊毛混纺
    stockNum:0,           //库存
    description:"",
    types: [
      '帽子',
      '围巾/围脖',
      '手套',
      '多件套',
      '包包',
      '家居用品',
      '宠物用品',
      '羊毛/羊绒衫',
      '文创用品', 
      '品牌包装', 
      '设计师发布'
    ],
    typesID: [
      {name:'帽子', id:'hat'},
      {name:'围巾/围脖', id:'scarf'},
      {name:'手套', id:'gloves'},
      {name:'多件套', id:'multi-piece'},
      {name:'包包', id:'bag'},
      {name:'家居用品', id:'houseware'},
      {name:'宠物用品', id:'petsupplies'},
      {name:'羊毛/羊绒衫', id:'wool'},
      {name:'文创用品', id:'cultural'},
      {name:'品牌包装', id:'brand'},
      {name:'设计师发布', id:'design'}
    ],
    typesIndex: 0,
    deleteName:[],
    canModify:false,
    goodInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    this.setData({
      type: type
    })
    if(type == 'add'){
      wx.setNavigationBarTitle({
        title: '新品发布',
      })
      this.getGoods()
    }else if (type == 'delete'){
      wx.setNavigationBarTitle({
        title: '商品下架',
      })
    }else if(type == 'modify'){
      wx.setNavigationBarTitle({
        title: '商品信息修改',
      })
    }
  },
  getGoods(){
    wx.cloud.callFunction({
      name:'getIndexGoods'
    }).then(res=>{
      if(res.result.data){
        var tmp = this.data.maxID
        var tmpGoodid = ''
        res.result.data.forEach(v=>{
          if(v.id > tmp){
            tmp = v.id
            tmpGoodid = v.good_id
          }
        })
        
        let len = tmpGoodid.length
        let substr = parseInt(tmpGoodid.substring(9,len))
        var timestamp = Date.parse(new Date())
        var date = new Date(timestamp)

        var Y = date.getFullYear()
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        let newGoodid = Y.toString() + M.toString() + D.toString() + '-' + (substr+1).toString()
        tmp += 1
        this.setData({
          maxID:tmp,
          goodid:newGoodid,
          canModify:true
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '网络异常',
          showCancel: false
        })
      }
    }).catch(console.error)
  },
  goodIdInput: function (e) {
    this.setData({
      goodid: e.detail.value
    })
  },
  nameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  priceInput: function (e) {
    this.setData({
      price: e.detail.value
    })
  },
  size1Input: function (e) {
    this.setData({
      size1: e.detail.value
    })
  },
  size2Input: function (e) {
    this.setData({
      size2: e.detail.value
    })
  },
  size3Input: function (e) {
    this.setData({
      size3: e.detail.value
    })
  },
  color1Input: function (e) {
    this.setData({
      color1: e.detail.value
    })
  },
  color2Input: function (e) {
    this.setData({
      color2: e.detail.value
    })
  },
  color3Input: function (e) {
    this.setData({
      color3: e.detail.value
    })
  },
  compositionInput: function (e) {
    this.setData({
      composition: e.detail.value
    })
  },
  stockNumInput: function (e) {
    this.setData({
      stockNum: e.detail.value
    })
  },
  descriptionInput: function (e) {
    this.setData({
      description: e.detail.value
    })
  },
  reasonChange: function (e) {
    this.setData({
      typesIndex: e.detail.value
    })
  },
  addNewGood: function (e) {
    if(this.data.goodid == ''){
      wx.showModal({
        title: '提示',
        content: '商品ID不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.name == ''){
      wx.showModal({
        title: '提示',
        content: '商品名不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.price == 0){
      wx.showModal({
        title: '提示',
        content: '商品价格不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.size1 == ''){
      wx.showModal({
        title: '提示',
        content: '至少输入一个尺码',
        showCancel: false
      })
      return
    }
    if(this.data.color1 == ''){
      wx.showModal({
        title: '提示',
        content: '至少输入一个颜色',
        showCancel: false
      })
      return
    }
    if(this.data.composition == ''){
      wx.showModal({
        title: '提示',
        content: '主要成分不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.stockNum == 0){
      wx.showModal({
        title: '提示',
        content: '库存不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.description == ''){
      wx.showModal({
        title: '提示',
        content: '商品描述不能为空',
        showCancel: false
      })
      return
    }
    if(!this.data.files || this.data.files.length == 0){
      wx.showModal({
        title: '提示',
        content: '至少选择一张图片',
        showCancel: false
      })
      return
    }
    let subPics = []
    for(let i=1;i<this.data.files.length + 1;i++){
      let item = {
        optionValueId:i.toString(),
        pic:this.data.files[i-1]
      }
      subPics.push(item)
    }
    let sku = [
      {
        id:'size',
        name:'尺码',
        childsCurGoods:[]
      },
      {
        id:'color',
        name:'颜色',
        childsCurGoods:[]
      },
    ]
    // 尺码 sku
    let childsSize = []
    if(this.data.size2 == ''){
      childsSize = [{id:'1', value:this.data.size1, active:false}]
    }else if(this.data.size2 && this.data.size3 == ''){
      childsSize = [{id:'1', value:this.data.size1, active:false}, {id:'2', value:this.data.size2, active:false}]
    }else if(this.data.size3){
      childsSize = [{id:'1', value:this.data.size1, active:false}, {id:'2', value:this.data.size2, active:false}, {id:'3', value:this.data.size3, active:false}]
    }
    // 颜色 sku
    let childsColor = []
    if(this.data.color2 == ''){
      childsColor = [{id:'1', value:this.data.color1, active:false}]
    }else if(this.data.color2 && this.data.color3 == ''){
      childsColor = [{id:'1', value:this.data.color1, active:false}, {id:'2', value:this.data.color2, active:false}]
    }else if(this.data.color3){
      childsColor = [{id:'1', value:this.data.color1, active:false}, {id:'2', value:this.data.color2, active:false}, {id:'3', value:this.data.color3, active:false}]
    }
    sku[0].childsCurGoods = childsSize
    sku[1].childsCurGoods = childsColor
    db.collection('goods').add({
      data: {
        addedtime: new Date().getTime(),
        good_id:this.data.goodid,
        name:this.data.name,
        id:this.data.maxID,
        minPrice:this.data.price,
        originalPrice:this.data.price,
        pic:this.data.files[0],
        sku:sku,
        subPics: subPics,
        stockNum:this.data.stockNum,
        description: this.data.description,
        composition:this.data.composition,
        type:this.data.typesID[this.data.typesIndex].id
      }
    })
    .then(res => {
      wx.showModal({
        title: '提示',
        content: '发布成功！',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
    .catch(console.error)
  },
  deleteByNameInput:function(e){
    this.setData({
      name: e.detail.value
    })
    this.bindconfirm()
  },
  conformDeleteName:function(e){
    this.setData({
      name: e.currentTarget.dataset.val
    })
    var tmp = []
    db.collection('goods').where({
      name: e.currentTarget.dataset.val
    }).get().then(res=>{
      res.data[0].subPics.forEach(v=>{
        tmp.push(v.pic)
      })
      this.setData({
        files: tmp
      })
    })
  },
  bindconfirm() {
    if(this.data.name){
      var index = 0
      db.collection('goods').where({
        name: db.RegExp({
          regexp: this.data.name,
          options: 'i'
        })
      }).get().then(res=>{
        if(res.data.length > 0){
          let tmp = []
          res.data.forEach(v=>{
            if(index == 5){
              return
            }
            index += 1
            tmp.push(v.name)
          })
          this.setData({
            deleteName: tmp
          })
        }else{
          this.setData({
            deleteName: []
          })
          wx.showToast({
            title: '小Yun实在找不到该商品~',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  deleteGood(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要下架该商品吗？',
      success (res) {
        if (res.confirm) {
          db.collection('goods').where({
            name: that.data.name
          }).remove()
          that.setData({
            name: '',
            deleteName:[]
          })
          wx.cloud.deleteFile({
            fileList: that.data.files
          }).then(res => {
          }).catch(error => {
          })
          db.collection('history').where({
            name: that.data.name
          }).remove()
          wx.showToast({
            title: '已下架',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  searchIDForModify: function (e){
    this.setData({
      goodid: e.detail.value
    })
    if(this.data.type == 'modify'){
      wx.showLoading({
        title: '加载中',
      })
      db.collection('goods').where({
        good_id: this.data.goodid
      }).get().then(res=>{
        if(res.data){
          var tmp = []
          res.data[0].subPics.forEach(v=>{
            tmp.push(v.pic)
          })
          this.setData({
            name:res.data[0].name,
            price:res.data[0].minPrice,
            files:tmp,
            size1:res.data[0].sku[0].childsCurGoods[0].value,
            size2:res.data[0].sku[0].childsCurGoods[1].value,
            size3:res.data[0].sku[0].childsCurGoods[2].value,
            color1:res.data[0].sku[1].childsCurGoods[0].value,
            color2:res.data[0].sku[1].childsCurGoods[1].value,
            color3:res.data[0].sku[1].childsCurGoods[2].value,
            stockNum:res.data[0].stockNum,
            description:res.data[0].description,
            composition:res.data[0].composition,
            canModify:true,
            doc:res.data[0]._id
          })
          wx.hideLoading()
        }else{
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '商品ID不正确，未找到该商品信息',
            showCancel: false
          })
        }
      }).catch(err=>{
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '商品ID不正确，未找到该商品信息',
          showCancel: false
        })
      })
    }
  },
  modifyGood: function (e) {
    if(this.data.name == ''){
      wx.showModal({
        title: '提示',
        content: '商品名不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.price == 0){
      wx.showModal({
        title: '提示',
        content: '商品价格不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.size1 == ''){
      wx.showModal({
        title: '提示',
        content: '至少输入一个尺码',
        showCancel: false
      })
      return
    }
    if(this.data.color1 == ''){
      wx.showModal({
        title: '提示',
        content: '至少输入一个颜色',
        showCancel: false
      })
      return
    }
    if(this.data.composition == ''){
      wx.showModal({
        title: '提示',
        content: '主要成分不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.stockNum == 0){
      wx.showModal({
        title: '提示',
        content: '库存不能为空',
        showCancel: false
      })
      return
    }
    if(this.data.description == ''){
      wx.showModal({
        title: '提示',
        content: '商品描述不能为空',
        showCancel: false
      })
      return
    }
    if(!this.data.files || this.data.files.length == 0){
      wx.showModal({
        title: '提示',
        content: '至少选择一张图片',
        showCancel: false
      })
      return
    }
    let subPics = []
    for(let i=1;i<this.data.files.length + 1;i++){
      let item = {
        optionValueId:i.toString(),
        pic:this.data.files[i-1]
      }
      subPics.push(item)
    }
    let sku = [
      {
        id:'size',
        name:'尺码',
        childsCurGoods:[]
      },
      {
        id:'color',
        name:'颜色',
        childsCurGoods:[]
      },
    ]
    // 尺码 sku
    let childsSize = []
    if(this.data.size2 == ''){
      childsSize = [{id:'1', value:this.data.size1, active:false}]
    }else if(this.data.size2 && this.data.size3 == ''){
      childsSize = [{id:'1', value:this.data.size1, active:false}, {id:'2', value:this.data.size2, active:false}]
    }else if(this.data.size3){
      childsSize = [{id:'1', value:this.data.size1, active:false}, {id:'2', value:this.data.size2, active:false}, {id:'3', value:this.data.size3, active:false}]
    }
    // 颜色 sku
    let childsColor = []
    if(this.data.color2 == ''){
      childsColor = [{id:'1', value:this.data.color1, active:false}]
    }else if(this.data.color2 && this.data.color3 == ''){
      childsColor = [{id:'1', value:this.data.color1, active:false}, {id:'2', value:this.data.color2, active:false}]
    }else if(this.data.color3){
      childsColor = [{id:'1', value:this.data.color1, active:false}, {id:'2', value:this.data.color2, active:false}, {id:'3', value:this.data.color3, active:false}]
    }
    sku[0].childsCurGoods = childsSize
    sku[1].childsCurGoods = childsColor
    db.collection('goods').doc(this.data.doc).update({
      data:{
        addedtime: new Date().getTime(),
        good_id:this.data.goodid,
        name:this.data.name,
        id:this.data.maxID,
        minPrice:this.data.price,
        originalPrice:this.data.price,
        pic:this.data.files[0],
        sku:sku,
        subPics: subPics,
        stockNum:this.data.stockNum,
        description: this.data.description,
        composition:this.data.composition,
        type:this.data.typesID[this.data.typesIndex].id
      }
    }).then(res=>{
      wx.showModal({
        title: '提示',
        content: '修改成功！',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
    .catch(console.error)
  },
  chooseImage: function (e) {
    const that = this
    var tmp = []
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        res.tempFilePaths.forEach(e=>{
          let str = 'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/'
          const cloudPath = 'goods/admin/' + new Date().getTime() +'.png'
          let file = str + cloudPath
          tmp.push(file)
          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: e,
          }).then(res => {
            if(that.data.files.length > 0){
              that.setData({
                files: that.data.files.concat(file)
              })
            }else{
              that.setData({
                files: tmp
              })
            }
          })
        })
      }
    })
  },
  previewImage: function (e) {
    const that = this;
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: that.data.files // 需要预览的图片http链接列表
    })
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

  }
})