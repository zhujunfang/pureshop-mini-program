App({
  onLaunch: function () {
    try {
      this.globalData.token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = JSON.parse(userInfo);
      }
      console.log(`token ${this.globalData.token}`)
      console.log(`userinfo`, this.globalData.userInfo)
    } catch (e) {
      console.log(e);
    }
  },

  globalData: {
    userInfo: {
      nickname: '点击登录',
      avatar: 'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png'
    },
    token: '',
  }
})