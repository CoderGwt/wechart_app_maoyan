Page({
  data: {
    tabIndex: 'hots',
    limit: 12,
    page: 1
  },

  // 生命周期函数
  onLoad: function() {
    // 保留外部的this
    var self = this;

    // 当页面加载完成之后，获取用户的位置
    wx.getLocation({
      success: function(res) {
        console.log(res);
        // 获取经纬度，并通过toFixed(5)指定小数点后 保留5位数
        var latitude = res.latitude.toFixed(5);
        var longitude = res.longitude.toFixed(5);

        // 只能获取到用户所在位置的经纬度，需要进一步的推算出具体的城市
        // 其推算过程可以通过访问(请求)接口来实现

        wx.request({
          url: 'https://wx.maoyan.com/hostproxy/locate/v2/rgeo',
          data: {
            coord: [latitude,longitude,1].join(",")
          },
          header: {
              "x-host": "http://apimobile.vip.sankuai.com"
          }, 
          method: 'get',
          success: function(info){
            // 获取所在城市的信息
            // console.log(info);
            console.log(info.data.data.country);

            // 添加数据模型
            self.setData({
              city: info.data.data.city
            });

            // 成功返回之后
            wx.request({
              url: 'https://wx.maoyan.com/mmdb/movie/v2/list/hot.json',
              data: {
                limit: 12,
                offset: 0,
                ct: info.data.data.city
              },
              method: 'get',
              success: function(val){
                  // console.log(val);
                  val.data.data.hot.forEach(function(vl){
                    vl.img = vl.img.replace('w.h', '128.180');
                  });
                  console.log(val);
                  self.setData({
                    hots: {
                      items: val.data.data.hot,
                      // 通过hasMore判断是否加载跟多的数据
                      hasMore: val.data.data.paging.hasMore
                    }
                  })
              }
            })
          }
        })
      },
    });
  },

  // 上拉触底
  onReachBottom: function(){
    console.log("上啦触底");
    // 小程序中可以通过 this.data 获取到data中的数据
    
    var self = this;

    if(!self.data.hots.hasMore) return;

    // 0 - 11
    // 请求新的数据，从第12条开始 offset
    // 12 - 23
    // 24 - 35
    // 36 - 47
    wx.request({
      url: 'https://wx.maoyan.com/mmdb/movie/v2/list/hot.json',
      data: {
        limit: self.data.limit,  // 每次12条
        offset: self.data.limit * self.data.page,
        ct: self.data.city  // 城市
      },
      method: 'get',
      success: function(info){
        // 将 新 请求来的数据追加到原来的数据后面 ,通过 concat 连接
        console.log(info);

        console.log(self.data);
        var items = self.data.hots.items.concat(info.data.data.hot);
        // console.log(items);
        

        // 遍历，replace修改值
        info.data.data.hot.forEach(function(val){
          val.img = val.img.replace('w.h', '128.180');
        })

        self.setData({
          page: ++self.data.page,
          hots: {
            items: items,
            hasMore: info.data.data.paging.hasMore
          }
        })
      }
    })
  },
  
  buy: function(){
    wx.showToast({
      title: '购买成功',
    })
  },


  switch: function(ev){
    console.log(ev)
    // 通过自定义属性 tabIndex 的值来判断用户的点击
    var tabIndex = ev.target.dataset.tabIndex;
    console.log(tabIndex);

    // 通过setData设置 来实现数据的更改
    // 
    this.setData({
      tabIndex: tabIndex
    })
  },

  
  onPullDownRefresh: function(){
    console.log("下拉...")

    var self = this;

    // 发送请求最新的数据
    // 其实就是重新获取第一页的数据
    wx.request({
      url: 'https://wx.maoyan.com/mmdb/movie/v2/list/hot.json',
      data: {
          ct: self.data.city,
          limit: 12,
          offset: 0
      },
      method: 'get',
      success: function(info){
        console.log(info)

        info.data.data.hot.forEach(function(val){
          val.img = val.img.replace('w.h', '128.180')
        })

        // 更新原有的数据
        self.setData({
          hots: {
            items: info.data.data.hot,
            hasMore: info.data.data.paging.hasMore
          },
          page: 1
        })
      }
    })

  }

})