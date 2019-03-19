Page({
  data: {
    tabIndex: 'hots',
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
  }

})