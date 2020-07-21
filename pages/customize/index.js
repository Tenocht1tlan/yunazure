Page({
    data:{
        materialCategory: 0,       // 素材分类1
        materialCategoryIcon:0,    //素材颜色分类
        fontCategory: 0,           // 素材分类2
        isText: true,
        isTextColor: false,
        currentPosition: 'left',   // 当前帽子的位置
        currentColor: 'w',         // 当前帽子的颜色
        currentGender: 'm',        // 当前性别
        currentMaterial: {},       // 当前素材
        isShowHistory: false,      // 是否显示历史记录
        historyList: new Set(),    // 历史列表
        showRecommend: false,      // 是否显示推荐列表
        winWidth: 0,               // 窗口可用区域宽度
        winHeight: 0,              // 窗口可用区域高度
        canvasWidth: 0,            // 画布宽度
        canvasHeight: 0,           // 画布高度
        X: 150,                    // 当前点击的x坐标
        Y: 150,                    // 当前点击的y坐标
        tempX: 150,                // 临时的X坐标
        tempY: 150,                // 临时的Y坐标
        newX: 150,                 // 拖动后的X坐标
        newY: 150,                 // 拖动后的Y坐标
        diffX: 0,                  // 拖动的时候,鼠标点击位置x坐标,跟图片中心的位置x坐标的差
        diffY: 0,                  // 拖动的时候,鼠标点击位置y坐标,跟图片中心的位置y坐标的差
        imgUrl: '',                // 要绘入的图片地址
        imgWidth: 100,             // 图片宽度
        imgHeight: 100,            // 图片高度
        tempImgWidth: 81,          // 最终绘入的图片高度
        tempImgHeight: 81,         // 最终绘入的图片高度
        rotateAngle: 0,            // 旋转角度
        rotateTemp: 0,             // 缓存 旋转角度
        iconSize: 81,              // 操作图标的大小
        operate: 'draw',           // 操作类型
        ctx: wx.createCanvasContext('mainCanvas'),
        complete: false,
        picIsChosed:true,
        textIsChosed:false,
        currentChoseItem :0,
        array:['图形','星座','水果','动物','生肖','城市','标志性建筑'],
        text:['文本','字体','大小','颜色'],
        icons:[
          ['/images/custom/custom6.png','/images/my/kefu.png','/images/my/check.png','/images/my/address.png','/images/my/hotline.png','/images/my/checkNo.png'],
          ['/images/my/checkNo.png','/images/my/check.png'],
          ['/images/my/address.png'],
          ['/images/my/checkYes.png'],
          ['/images/my/hotline.png'],
          ['/images/my/in.png'],
          ['/images/my/kefu.png']
        ],
        textarea: "",
        textareaLen: 0,
        font:[
          [],
          ['SimSun','Microsoft Yahei','KaiTi'], 
          ['/images/custom/sml.png','/images/custom/mid.png','/images/custom/lar.png'],
          ['background:red;', 'background:yellow;', 'background:white;', 'background:black;']
        ],
        fontSize: [16,17, 18, 20, 22, 24, 28, 32],
        fontColor: ['red', 'yellow', 'white', 'black'],
        addText: false
    },
      onStart (e) {
        this.data.operate = 'none'
        // 图标半径
        let r = this.data.iconSize / 4
        let x = this.data.X - this.data.tempImgWidth / 2
        let y = this.data.Y - this.data.tempImgHeight / 2
        // 存储新点击的位置,方便计算
        this.data.tempX = e.touches[0].x
        this.data.tempY = e.touches[0].y
        console.log('curr X :' + this.data.tempX + ' , curr Y:' + this.data.tempY)
        // 是否点中 缩放 按钮
        let isScale = this.isInRange(
          x + this.data.tempImgWidth - r,
          y + this.data.tempImgHeight - r,
          x + this.data.tempImgWidth + r,
          y + this.data.tempImgHeight + r,
          this.data.tempX,
          this.data.tempY
        )
        // 是否点中 旋转 按钮
        let isRotate = this.isInRange(
          x + this.data.tempImgWidth - r,
          y - r,
          x + this.data.tempImgWidth + r,
          y + r,
          this.data.tempX,
          this.data.tempY
        )
        // 是否点中 删除 按钮
        let isDelete = this.isInRange(
          x - r,
          y - r,
          x + r,
          y + r,
          this.data.tempX,
          this.data.tempY
        )
        // 是否是 拖动 (点中除以上按钮以外的其他区域,但是又在图片区域内)
        let isDraw = this.isInRange(
          x,
          y,
          x + this.data.tempImgWidth,
          y + this.data.tempImgHeight,
          this.data.tempX,
          this.data.tempY
        )
        if (isScale) {
          this.data.operate = 'scale'
          this.data.imgHeight = this.data.tempImgHeight
          this.data.imgWidth = this.data.tempImgWidth
          return
        }
        if (isRotate) {
          this.data.operate = 'rotate'
          return
        }
        if (isDelete) {
          this.data.operate = 'delete'
          this.draw()
          return
        }
        if (isDraw) {
          // 保存点击的位置(diffX,diffY),避免每次都以中心拖动
          this.data.diffX = e.touches[0].x - this.data.X
          this.data.diffY = e.touches[0].y - this.data.Y
          this.data.X = e.touches[0].x - this.data.diffX
          this.data.Y = e.touches[0].y - this.data.diffY
          this.data.operate = 'draw'
          this.draw()
          return
        }
      },
      onMove (e) {
        if (this.data.operate === 'scale' || this.data.operate === 'rotate') {
          this.data.newX = e.touches[0].x
          this.data.newY = e.touches[0].y
        }
        if (this.data.operate === 'draw') {
          // 扣除掉 点击位置到中心的距离(diffX,diffY)
          this.data.X = e.touches[0].x - this.data.diffX
          this.data.Y = e.touches[0].y - this.data.diffY
        }
        this.draw()
      },
      onEnd (e) {
        if (this.data.operate === 'rotate') {
          this.data.rotateAngle += this.data.rotateTemp
          this.data.rotateAngle %= 360
          this.data.rotateTemp = 0
        }
        this.data.operate = 'none'
      },
      draw () {
        // 判断是否超出边界
        if (this.data.X > this.data.canvasWidth - this.data.tempImgWidth / 2) {
          this.data.X = this.data.canvasWidth - this.data.tempImgWidth / 2
        }
        if (this.data.Y > this.data.canvasHeight - this.data.tempImgHeight / 2) {
          this.data.Y = this.data.canvasHeight - this.data.tempImgHeight / 2
        }
        if (this.data.X < this.data.tempImgWidth / 2) {
          this.data.X = this.data.tempImgWidth / 2
        }
        if (this.data.Y < this.data.tempImgHeight / 2) {
          this.data.Y = this.data.tempImgHeight / 2
        }
        let r = this.data.iconSize / 8   // 图标半径
        let d = this.data.iconSize / 4   // 图标直径

        if (this.data.operate === 'delete') {
          // this.X = 150
          // this.Y = 150
          // this.rotateAngle = 0
          // this.imgHeight = 100
          // this.imgWidth = 100
          // this.tempImgHeight = 100
          // this.tempImgWidth = 100
          // this.imgUrl = ''
          // ctx.moveTo(0, 0)
          // ctx.clearRect(0, 0, 300, 300)
          // ctx.draw()
          // return
          this.clearCanvas()
          return
        }
        const ctx = wx.createCanvasContext('mainCanvas')
        if (this.data.operate === 'scale') {
          let scaleX = (this.data.X - this.data.newX) / (this.data.X - this.data.tempX)
          let scaleY = (this.data.Y - this.data.newY) / (this.data.Y - this.data.tempY)
          let scale = scaleX < scaleY ? scaleX : scaleY
          
          this.data.tempImgWidth = this.data.imgWidth * scale
          this.data.tempImgHeight = this.data.imgHeight * scale
          if (this.data.tempImgWidth > 150){
            this.data.tempImgWidth = 150
          }else if(this.data.tempImgWidth < 50){
            this.data.tempImgWidth = 50
          }
          if (this.data.tempImgHeight > 150){
            this.data.tempImgHeight = 150
          }else if(this.data.tempImgHeight < 50){
            this.data.tempImgHeight = 50
          }
        }
        if (this.data.operate === 'rotate') {
          this.data.rotateTemp = this.getAngle(this.data.tempX, this.data.tempY, this.data.newX, this.data.newY)
        }
        // 中心位移
        ctx.translate(this.data.X, this.data.Y)
        // 设置新的原点
        let x = -this.data.tempImgWidth / 2
        let y = -this.data.tempImgHeight / 2
        // 新旧2种角度,分开旋转
        ctx.rotate(this.data.rotateTemp * Math.PI / 180)
        ctx.rotate(this.data.rotateAngle * Math.PI / 180)
        if (!this.data.imgUrl && !this.data.addText) {
          return
        }
        const that = this
        if(this.data.imgUrl) {
          ctx.drawImage(that.data.imgUrl, x, y, that.data.tempImgWidth, that.data.tempImgHeight)
        }else if(this.data.addText) {
          ctx.setFillStyle(this.data.fontColor[0])
          ctx.setFontSize(this.data.fontSize[6])
          ctx.fillText(this.data.textarea, x, 0)
        }
        // 旋转回来,保证除了图片以外的其他元素不被旋转
        ctx.rotate((360 - that.data.rotateTemp) * Math.PI / 180)
        ctx.rotate((360 - that.data.rotateAngle) * Math.PI / 180)
        // 画边框
        ctx.setStrokeStyle('#fd749c')
        ctx.setLineDash([5, 5], 10);
        // let len = Math.sqrt(Math.pow(that.data.tempImgWidth / 2, 2) + Math.pow(that.data.tempImgHeight / 2, 2)) * 2
        ctx.strokeRect(x, y, that.data.tempImgWidth, that.data.tempImgHeight)
        // 画 删除 按钮
        ctx.drawImage('/images/delete.png', x - r, y - r, d, d)
        // 画 旋转 按钮
        ctx.drawImage('/images/rotate.png', x + that.data.tempImgWidth - r, y - r, d, d)
        // 画 缩放 按钮
        ctx.drawImage('/images/scale.png', x + that.data.tempImgWidth - r, y + that.data.tempImgHeight - r, d, d)
        ctx.draw()
      },
      // 图片->本地
      async drawToTemp () {
        if (!this.data.imgUrl) {
          wx.showToast({
            title: '请先选择图案',
            icon: 'none',
            duration: 2000
          })
          return
        }
        this.data.ctx.draw(true, ()=> {
          wx.canvasToTempFilePath({
            canvasId: 'completeCanvas',
            success: function (res) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success () {
                  wx.showToast({
                    title: '保存成功!',
                    icon: 'none',
                    duration: 2000
                  })
                }
              })
            }
          })
        })
      },
      complete(){
        if (!this.data.imgUrl && !this.data.addText) {
          wx.showToast({
            title: '请先选择图案或输入文字',
            icon: 'none',
            duration: 2000
          })
          return
        }
        wx.showLoading({
          title: '加载中',
        })
        this.initCanvas()
        this.setData({
          complete: true
        })
        const that = this
        
        setTimeout(function () {
          wx.hideLoading({
            success: (res) => {
              console.log("url = "+that.data.imgUrl)
              that.finalComplete()
            }
          })
        }, 500)
      },
      finalComplete:function(){
        let ctx = wx.createCanvasContext('completeCanvas')

        ctx.draw(true, ()=> {
          wx.canvasToTempFilePath({
            canvasId: 'completeCanvas',
            success: function (res) {
              wx.navigateTo({
                url: "/pages/custom-product/index?url=" + res.tempFilePath
              })
            }
          })
        })
      },
      // 判断是否在 某个矩形范围内
      isInRange (x1, y1, x2, y2, px, py) {
        return (x1 < px && px < x2) && (y1 < py && py < y2)
      },
      // 获取旋转角度
      getAngle (px, py, mx, my) {//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
        let x = Math.abs(px - mx);
        let y = Math.abs(py - my);
        let z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let cos = y / z;
        let radina = Math.acos(cos);//用反三角函数求弧度
        let angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度
        if (mx > px && my > py) {//鼠标在第四象限
          angle = 180 - angle;
        }
        if (mx === px && my > py) {//鼠标在y轴负方向上
          angle = 180;
        }
        if (mx > px && my === py) {//鼠标在x轴正方向上
          angle = 90;
        }
        if (mx < px && my > py) {//鼠标在第三象限
          angle = 180 + angle;
        }
        if (mx < px && my === py) {//鼠标在x轴负方向
          angle = 270;
        }
        if (mx < px && my < py) {//鼠标在第二象限
          angle = 360 - angle;
        }
        return angle;
      },
      // 选择图片
      async selectImg (url) {
        let that = this
        await new Promise(resolve => {
          that.data.imgUrl = url
          that.data.operate = 'draw'
          resolve()
        })
        this.draw()
      },
      // 选择本地图片
      chooseLocalImages () {
        this.data.isShowHistory = false
        let that = this
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            wx.saveFile({  // 把图片保存到本地,方便后期访问
              tempFilePath: res.tempFilePaths[0],
              success: function (saveRes) {
                // 写入图片的本地路径到 storage
                that.saveFilePathToList(saveRes.savedFilePath)
                // 获取图片信息,并把宽高设置给 canvas
                that.getFileInfo(saveRes.savedFilePath)
              }
            })
          }
        })
      },
      // 查看上传历史
      viewHistory () {
        this.data.isShowHistory = !this.data.isShowHistory
        if (this.data.isShowHistory) {
          var that = this
          wx.getStorage({
            key: 'history',
            success (res) {
              that.data.historyList = res.data
            }
          })
        }
      },
      choseModePic:function(){
        this.setData({
          picIsChosed: true,
          textIsChosed: false,
          textarea: '',
          addText: false
        })
      },
      choseModeText:function(){
        this.setData({
          picIsChosed: false,
          textIsChosed: true,
          imgUrl: ''
        })
      },
      // 删除单条历史记录
      deleteHistory (item) {
        let set = new Set(this.data.historyList)
        set.delete(item)
        this.data.historyList = Array.from(set)
        wx.setStorage({
          key: "history",
          data: this.data.historyList
        })
      },
      // 清除所有历史记录
      clearHistory () {
        this.data.historyList = []
        wx.setStorage({
          key: "history",
          data: this.data.historyList
        })
      },
      finishBtn:function(){
        this.setData({
          addText:true
        })
        this.getTextPicInfo()
        // const ctx = wx.createCanvasContext('mainCanvas')
        // ctx.setFontSize(20)
        // ctx.setFillStyle('yellow')
        // ctx.fillText(this.data.textarea, this.data.canvasWidth / 2, this.data.canvasHeight / 2)
        // ctx.draw()
      },
      textInput:function(e){
        this.setData({
          textarea: e.detail.value,
          textareaLen: e.detail.value.length
        })
      },
      getTextPicInfo(){
        this.data.imgWidth = this.data.textareaLen * 26
        this.data.imgHeight = this.data.canvasHeight * 0.2
        this.data.tempImgWidth = this.data.imgWidth
        this.data.tempImgHeight = this.data.imgHeight
        this.data.operate = 'draw'
        this.draw()
      },
      // 选择素材
      selectMateria: function(e){
        var index = e.target.dataset.index
        this.setData({
          key: "ma"+index,
          materialCategoryIcon:index
        })
        let src =  e.currentTarget.dataset.src
        this.getFileInfo(src)
      },
      // 获取图片信息,并把宽高设置给 canvas
      async getFileInfo (src) {
        if ((src.match('http://') || src.match('https://'))) {
          let dlRes = await new Promise(((resolve, reject) => {
            wx.downloadFile({
              url: src,
              success: res => resolve(res.tempFilePath),
              fail: err => resolve()
            })
          }))
          if (dlRes) src = dlRes
        }
        let that = this
        let whRate = this.data.canvasWidth / this.data.canvasHeight  // 图片纵横比
        this.data.imgWidth = this.data.canvasWidth * 0.8
        this.data.imgHeight = this.data.canvasHeight * 0.8
        wx.getImageInfo({
          src: src,
          success: function (res) {
            // 判断是否超大.计算缩放比例
            if (res.width > res.height * whRate) {
              if (res.width > that.data.imgWidth) {
                that.data.imgHeight = res.height * that.data.imgWidth / res.width
              } else {
                that.data.imgWidth = res.width
                that.data.imgHeight = res.height
              }
            } else {
              if (res.height > that.data.imgHeight) {
                that.data.imgWidth = res.width * that.data.imgHeight / res.height
              } else {
                that.data.imgWidth = res.width
                that.data.imgHeight = res.height
              }
            }
            that.data.tempImgWidth = that.data.imgWidth
            that.data.tempImgHeight = that.data.imgHeight
            that.selectImg(src)
          },
          fail (err) {
            console.log('获取图片信息出错', err)
          }
        })
      },
      // 写入图片的本地路径到 storage
      saveFilePathToList (path) {
        wx.getStorage({
          key: 'history',
          success (res) {
            res.data.push(path)
            wx.setStorage({
              key: "history",
              data: res.data,
            })
          },
          fail () {
            wx.setStorage({
              key: "history",
              data: [path],
            })
          }
        })
      },
      // 获取设备信息
      getDeviceInfo () {
        try {
          let res = wx.getSystemInfoSync()
          // 计算初始信息
          // this.canvasWidth = this.winWidth = res.windowWidth
          // this.winHeight = res.windowHeight
          // this.canvasHeight = res.windowHeight - 60
          //
          // this.X = this.tempX = this.newX = this.winWidth / 2
          // this.Y = this.tempY = this.newY = (this.winHeight - 60) / 2
          //
          // this.imgWidth = this.tempImgWidth = this.X / 1.5
          // this.imgHeight = this.tempImgHeight = this.Y / 1.5
          this.data.winWidth = res.windowWidth
          this.data.winHeight = res.windowHeight
        } catch (e) {
        }
      },
      loadSocksInfo () {
        this.data.canvasWidth = this.data.winWidth
        this.data.canvasHeight = this.data.winHeight * 0.5
        this.data.X = this.data.tempX = this.data.newX = this.data.canvasWidth / 2
        this.data.Y = this.data.tempY = this.data.newY = this.data.canvasHeight / 2
        this.data.imgWidth = this.data.tempImgWidth = this.data.canvasWidth * 0.5
        this.data.imgHeight = this.data.tempImgHeight = this.data.canvasHeight * 0.5
        this.data.rotateAngle = 0
        this.data.imgUrl = ''
      },
      async initCanvas(){
        let ctx = wx.createCanvasContext('completeCanvas')
        ctx.translate(0, 0)
        let picPath = 'cloud://yunazure-sygca.7975-yunazure-sygca-1302289079/goods/woolblendcap/caramel.jpg'
        let that = this
        let w = this.data.winWidth
        let h = 0.5 * this.data.winHeight
        let x = 0
        let y = 0
        let whRate = w / h

        await new Promise((resolve) => {
          wx.getImageInfo({
            src: picPath,
            success: function (res) {
              // if (res.width > res.height * whRate) {
              //   if (res.width > w) {
              //     h = res.height * w / res.width
              //     y = (0.5 * that.data.winHeight - h) / 2
              //   } else {
              //     w = res.width
              //     h = res.height
              //     x = (that.data.winWidth - w) / 2
              //     y = (0.5 * that.data.winHeight - h) / 2
              //   }
              // } else {
              //   if (res.height > h) {
              //     w = res.width * h / res.height
              //     x = (that.data.winWidth - w) / 2
              //   } else {
              //     w = res.width
              //     h = res.height
              //     x = (that.data.winWidth - w) / 2
              //     y = (0.5 * that.data.winHeight - h) / 2
              //   }
              // }
              resolve(res)
              ctx.drawImage(res.path, x, y, w, h)
            }
          })
        })
        ctx.save()
        ctx.draw()
        
        ctx.translate(this.data.X, this.data.Y)
        let xx = -this.data.tempImgWidth / 2
        let yy = -this.data.tempImgHeight / 2
        ctx.rotate(this.data.rotateTemp * Math.PI / 180)
        ctx.rotate(this.data.rotateAngle * Math.PI / 180)
        if(this.data.addText){
          ctx.setFillStyle(this.data.fontColor[0])
          ctx.setFontSize(this.data.fontSize[6])
          ctx.fillText(this.data.textarea, xx, 0)
        }else if(this.data.imgUrl){
          ctx.drawImage(this.data.imgUrl, xx, yy, this.data.tempImgWidth, this.data.tempImgHeight)
        }
        ctx.rotate((360 - this.data.rotateTemp) * Math.PI / 180)
        ctx.rotate((360 - this.data.rotateAngle) * Math.PI / 180)
        ctx.draw(true)
      },
      // 清除画板
      clearCanvas () {
        this.loadSocksInfo()
        // const ctx = wx.createCanvasContext('mainCanvas')
        this.data.ctx.moveTo(0, 0)
        this.data.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.data.ctx.draw()
      },
      setMaterialCategory: function(e) {
        this.setData({
          materialCategory: e.target.dataset.index
        })
      },
      setFontCategory: function(e) {
        if(e.target.dataset.index == 0){
          this.setData({
            isText: true,
            fontCategory: e.target.dataset.index
          })
        }else if(e.target.dataset.index == 3){
          this.setData({
            isText: false,
            isTextColor: true,
            fontCategory: e.target.dataset.index
          })
        }else{
          this.setData({
            isText: false,
            fontCategory: e.target.dataset.index
          })
        }
      },
      openRecommend () {
        this.data.showRecommend = true
      },
      closeRecommend () {
        this.data.showRecommend = false
        this.draw()
      },
    onLoad:function() {
      this.getDeviceInfo()
      this.loadSocksInfo()
    },
    onShow(){
      this.setData({
        complete: false
      })
    }
})