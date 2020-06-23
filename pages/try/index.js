Page({
    data:{
        materialCategory: 'custom',// 素材分类
        currentPosition: 'left',   // 当前袜子的位置
        currentColor: 'w',         // 当前袜子的颜色
        currentGender: 'm',        // 当前性别
        currentMaterial: {},       // 当前素材
        isShowHistory: false,      // 是否显示历史记录
        historyList: new Set(),    // 历史列表
        showRecommend: false,      // 是否显示推荐列表
        cartNum:0,
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
        tempImgWidth: 100,         // 最终绘入的图片高度
        tempImgHeight: 100,        // 最终绘入的图片高度
        rotateAngle: 0,            // 旋转角度
        rotateTemp: 0,             // 缓存 旋转角度
        iconSize: 20,              // 操作图标的大小
        operate: 'draw'            // 操作类型
    },

      onStart (e) {
        // console.log(e)
        this.operate = 'none'
        // 图标半径
        let r = this.iconSize
        let x = this.X - this.tempImgWidth / 2
        let y = this.Y - this.tempImgHeight / 2
        // 存储新点击的位置,方便计算
        this.tempX = e.touches[0].x
        this.tempY = e.touches[0].y
        // 是否点中 缩放 按钮
        let isScale = this.isInRange(
          x + this.tempImgWidth - r,
          y + this.tempImgHeight - r,
          x + this.tempImgWidth + r,
          y + this.tempImgHeight + r,
          this.tempX,
          this.tempY
        )
        // 是否点中 旋转 按钮
        let isRotate = this.isInRange(
          x + this.tempImgWidth - r,
          y - r,
          x + this.tempImgWidth + r,
          y + r,
          this.tempX,
          this.tempY
        )
        // 是否点中 删除 按钮
        let isDelete = this.isInRange(
          x - r,
          y - r,
          x + r,
          y + r,
          this.tempX,
          this.tempY
        )
        // 是否是 拖动 (点中除以上按钮以外的其他区域,但是又在图片区域内)
        let isDraw = this.isInRange(
          x,
          y,
          x + this.tempImgWidth,
          y + this.tempImgHeight,
          this.tempX,
          this.tempY
        )
        if (isScale) {
          this.operate = 'scale'
          this.imgHeight = this.tempImgHeight
          this.imgWidth = this.tempImgWidth
          // console.log('scale')
          return
        }
        if (isRotate) {
          this.operate = 'rotate'
          // console.log('rotate')
          return
        }
        if (isDelete) {
          this.operate = 'delete'
          // console.log('delete')
          this.draw()
          return
        }
        if (isDraw) {
          // 保存点击的位置(diffX,diffY),避免每次都以中心拖动
          this.diffX = e.touches[0].x - this.X
          this.diffY = e.touches[0].y - this.Y
          this.X = e.touches[0].x - this.diffX
          this.Y = e.touches[0].y - this.diffY
          this.operate = 'draw'
          // console.log('draw')
          this.draw()
          return
        }
      },
      onMove (e) {
        // console.log('move')
        if (this.operate === 'scale' || this.operate === 'rotate') {
          this.newX = e.touches[0].x
          this.newY = e.touches[0].y
        }
        if (this.operate === 'draw') {
          // 扣除掉 点击位置到中心的距离(diffX,diffY)
          this.X = e.touches[0].x - this.diffX
          this.Y = e.touches[0].y - this.diffY
        }
        this.draw()
      },
      onEnd (e) {
        if (this.operate === 'rotate') {
          this.rotateAngle += this.rotateTemp
          this.rotateAngle %= 360
          this.rotateTemp = 0
          // console.log('end')
        }
        this.operate = 'none'
      },
      draw () {
        // 判断是否超出边界
        if (this.X > this.canvasWidth + this.tempImgWidth / 2 - 20) {
          this.X = this.canvasWidth + this.tempImgWidth / 2 - 20
        }
        if (this.Y > this.canvasHeight + this.tempImgHeight / 2 - 20) {
          this.Y = this.canvasHeight + this.tempImgHeight / 2 - 20
        }
        if (this.X < -this.tempImgWidth / 2 + 20) {
          this.X = -this.tempImgWidth / 2 + 20
        }
        if (this.Y < -this.tempImgHeight / 2 + 20) {
          this.Y = -this.tempImgHeight / 2 + 20
        }
        let r = this.iconSize / 2     // 图标半径
        let d = this.iconSize         // 图标直径

        if (this.operate === 'delete') {
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
        if (this.operate === 'scale') {
          let scaleX = (this.X - this.newX) / (this.X - this.tempX)
          let scaleY = (this.Y - this.newY) / (this.Y - this.tempY)
          let scale = scaleX < scaleY ? scaleX : scaleY
          this.tempImgWidth = this.imgWidth * scale
          this.tempImgHeight = this.imgHeight * scale
        }
        if (this.operate === 'rotate') {
          this.rotateTemp = this.getAngle(this.tempX, this.tempX, this.newX, this.newY)
        }
        // 中心位移
        ctx.translate(this.X, this.Y)
        // 设置新的原点
        let x = -this.tempImgWidth / 2
        let y = -this.tempImgHeight / 2
        // 新旧2种角度,分开旋转
        ctx.rotate(this.rotateTemp * Math.PI / 180)
        ctx.rotate(this.rotateAngle * Math.PI / 180)
        if (!this.imgUrl) return
        ctx.drawImage(this.imgUrl, x, y, this.tempImgWidth, this.tempImgHeight)
        // 旋转回来,保证除了图片以外的其他元素不被旋转
        ctx.rotate((360 - this.rotateTemp) * Math.PI / 180)
        ctx.rotate((360 - this.rotateAngle) * Math.PI / 180)
        // 画边框
        ctx.setStrokeStyle('#fd749c')
        ctx.setLineDash([5, 5], 10);
        ctx.strokeRect(x, y, this.tempImgWidth, this.tempImgHeight)
        // 画 删除 按钮
        ctx.drawImage('/images/delete.png', x - r, y - r, d, d)
        // 画 旋转 按钮
        ctx.drawImage('/images/rotate.png', x + this.tempImgWidth - r, y - r, d, d)
        // 画 缩放 按钮
        ctx.drawImage('/images/scale.png', x + this.tempImgWidth - r, y + this.tempImgHeight - r, d, d)
        ctx.draw()
      },
      // 保存图片配置到服务器
      async saveConfig () {
        if (!this.imgUrl) {
          wx.showToast({
            title: '请先选择图案',
            icon: 'none',
            duration: 2000
          })
          return
        }
        console.log(this.currentMaterial)
        let url = 'https://api.mic.hn.cn/api/po/123'
        let body = {
          id: 0,
          sid: '123',
          type: 1,
          sex: this.currentGender === 'm' ? '男' : '女',
          LorR: this.currentPosition === 'left' ? 0 : 1,
          iscustom: this.currentMaterial.styleId === 0,
          imgindex: this.currentMaterial.styleId,
          orderdate: this.miment().format('YYYY-MM-DD hh:mm:ss')
        }
        wx.showLoading({title:'保存中...'})
        let res = await this.$post(url,body)
        wx.hideLoading()
        if(res.info === 'success') {
          wx.showToast({title:'保存成功!'})
        }
      },
      // 把平常图片到本地
      async drawToTemp () {
        if (!this.imgUrl) {
          wx.showToast({
            title: '请先选择图案',
            icon: 'none',
            duration: 2000
          })
          return
        }
        const ctx = wx.createCanvasContext('tempCanvas')
        ctx.translate(0, 0)
        let socksUrl = this.socks.url + this.currentColor + '.png'
        let that = this
        let w = 0.9 * this.winWidth
        let h = 0.5 * this.winHeight
        let x = 0
        let y = 0
        let whRate = w / h
        await new Promise((resolve) => {
          wx.getImageInfo({
            src: socksUrl,
            success: function (res) {
              if (res.width > res.height * whRate) {
                if (res.width > w) {
                  // console.log('enter')
                  h = res.height * w / res.width
                  y = (0.5 * that.winHeight - h) / 2
                } else {
                  w = res.width
                  h = res.height
                  x = (0.9 * that.winWidth - w) / 2
                  y = (0.5 * that.winHeight - h) / 2
                }
              } else {
                if (res.height > h) {
                  w = res.width * h / res.height
                  x = (0.9 * that.winWidth - w) / 2
                } else {
                  w = res.width
                  h = res.height
                  x = (0.9 * that.winWidth - w) / 2
                  y = (0.5 * that.winHeight - h) / 2
                }
              }
              resolve(res)
            }
          })
        })
        ctx.drawImage(socksUrl, x, y, w, h)
        ctx.save()
        // 设置 蒙版 剪切掉框外面多余的像素
        ctx.rect(this.socks.x * this.winWidth, this.socks.y * this.winHeight, this.canvasWidth, this.canvasHeight)
        // ctx.fill()
        ctx.clip()
        // 设置新的原点
        let nx = this.socks.x * this.winWidth + this.X
        let ny = this.socks.y * this.winHeight + this.Y
        // 中心位移
        ctx.translate(nx, ny)
        // 新旧2种角度,分开旋转
        ctx.rotate(this.rotateTemp * Math.PI / 180)
        ctx.rotate(this.rotateAngle * Math.PI / 180)
        ctx.drawImage(this.imgUrl, -this.tempImgWidth / 2, -this.tempImgHeight / 2, this.tempImgWidth, this.tempImgHeight)
        ctx.restore()
        ctx.draw(false, function () {
            wx.canvasToTempFilePath({
              canvasId: 'tempCanvas',
              success: function (res) {
                console.log('图片路径', res.tempFilePath)
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
          }
        )
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
        // this.clearCanvas()
        let that = this
        await new Promise(resolve => {
          that.imgUrl = url
          that.operate = 'draw'
          resolve()
        })
        this.draw()
      },
      // 选择本地图片
      chooseLocalImages () {
        this.isShowHistory = false
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
        this.isShowHistory = !this.isShowHistory
        if (this.isShowHistory) {
          var that = this
          wx.getStorage({
            key: 'history',
            success (res) {
              that.historyList = res.data
            }
          })
        }
      },
      // 删除单条历史记录
      deleteHistory (item) {
        let set = new Set(this.historyList)
        set.delete(item)
        this.historyList = Array.from(set)
        wx.setStorage({
          key: "history",
          data: this.historyList
        })
      },
      // 清除所有历史记录
      clearHistory () {
        this.historyList = []
        wx.setStorage({
          key: "history",
          data: this.historyList
        })
      },
      // 选择素材
      selectMateria(){
        this.getFileInfo('/images/search.png')
      },
      // 获取图片信息,并把宽高设置给 canvas
      async getFileInfo (src) {
        console.log(src)
        // 如果是远程图片,就先下载成本地图片,再渲染
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
        let whRate = this.canvasWidth / this.canvasHeight  // 图片纵横比
        this.imgWidth = this.canvasWidth * 0.8
        this.imgHeight = this.canvasHeight * 0.8
        wx.getImageInfo({
          src: src,
          success: function (res) {
            // 判断是否超大.计算缩放比例
            if (res.width > res.height * whRate) {
              if (res.width > that.imgWidth) {
                that.imgHeight = res.height * that.imgWidth / res.width
              } else {
                that.imgWidth = res.width
                that.imgHeight = res.height
              }
            } else {
              if (res.height > that.imgHeight) {
                that.imgWidth = res.width * that.imgHeight / res.height
              } else {
                that.imgWidth = res.width
                that.imgHeight = res.height
              }
            }
            that.tempImgWidth = that.imgWidth
            that.tempImgHeight = that.imgHeight
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
          this.winWidth = res.windowWidth
          this.winHeight = res.windowHeight
        } catch (e) {
        }
      },
      // 初始化 袜子信息
      loadSocksInfo () {
        this.canvasWidth = this.winWidth *0.9
        this.canvasHeight = this.winHeight *0.5
        this.X = this.tempX = this.newX = this.canvasWidth / 2
        this.Y = this.tempY = this.newY = this.canvasHeight / 2
        this.imgWidth = this.tempImgWidth = this.canvasWidth * 0.8
        this.imgHeight = this.tempImgHeight = this.canvasHeight * 0.8
        this.rotateAngle = 0
        this.imgUrl = ''
      },
      // 切换袜子位置

      // 切换袜子性别

      // 切换袜子颜色

      // 清除画板
      clearCanvas () {
        this.loadSocksInfo()
        const ctx = wx.createCanvasContext('mainCanvas')
        ctx.moveTo(0, 0)
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.draw()
      },
      // 设置素材分类
      setMaterialCategory (category) {
        this.materialCategory = category
      },
      // 加入购物车
      toCard () {
        wx.showToast({
          title: '提交成功!',
        })
      },
      openRecommend () {
        this.showRecommend = true
      },
      closeRecommend () {
        this.showRecommend = false
        this.draw()
      },
      addCartNum () {
        this.cartNum++
      },
    onLoad:function() {
      this.getDeviceInfo()
      this.loadSocksInfo()
    }
})