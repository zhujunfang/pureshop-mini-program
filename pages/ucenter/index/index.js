// const user = require('../../../services/user.js');
import * as util from '../../../utils/util'
import * as api from '../../../config/api'

const app = getApp();

Page({
  data: {
    userInfo: {},
    hasAuthorize: false,
    showLoginDialog: false
  },
  onLoad(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady() {

  },
  onShow() {
    console.log(`onshow app data`, app)
    const newData = {}
    // check hasAuthorize
    if (app.globalData.token) {
      newData.hasAuthorize = true
      newData.showLoginDialog = false
    } else {
      newData.hasAuthorize = false
      newData.showLoginDialog = true
    }

    if (app.globalData.userInfo) {
      console.log(`有全局userInfo，赋值到此页面数据`, app.globalData.userInfo)
      newData.userInfo = app.globalData.userInfo
      console.log(`this.userInfo`, this.userInfo)
    }

    this.setData(newData)
  },
  onHide() {
    // 页面隐藏

  },
  onUnload() {
    // 页面关闭
  },

  onUserInfoClick() {
    try {
      const tokenStr = wx.getStorageSync('token')
      if (tokenStr === '') {
        this.showLoginDialog();
      }
    } catch (e) {
      this.showLoginDialog();
    }
  },

  showLoginDialog() {
    this.setData({
      showLoginDialog: true
    })
  },

  onCloseLoginDialog() {
    this.setData({
      showLoginDialog: false
    })
  },

  onDialogBody() {
    // 阻止冒泡
  },

  onWechatLogin(e) {
    util.getTokenByWx().then(data => {
      console.log("authorize success")
      this.setData({
        hasAuthorize: true,
        showLoginDialog: false,
      })

      wx.switchTab({
        url: '/pages/index/index'
      });
    }).catch(err => {
      console.log("authorize error")
    })
  },

  onOrderInfoClick(event) {
    wx.navigateTo({
      url: '/pages/ucenter/order/order',
    })
  },

  onSectionItemClick(event) {

  },

  // TODO 移到个人信息页面
  exitLogin() {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');

          this.setData({
            userInfo: {},
            token: "",
            hasAuthorize: false,
            showLoginDialog: false,
          })
          app.globalData.token = ''
          app.globalData.userInfo = null

          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    })

  }
})