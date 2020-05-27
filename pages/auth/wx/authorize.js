// var util = require('../../utils/util.js');
// var api = require('../../config/api.js');
import * as util from '../../../utils/util'
import * as api from '../../../config/api'

var app = getApp();

Page({
    data: {
        hasAuthorize: false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
    },
    onReady: function () {
        // 页面渲染完成

    },
    onShow: function () {
        // 页面显示
        // check hasAuthorize
        if (app.globalData.token) {
            this.hasAuthorize = true
        } else {
            this.hasAuthorize = false
        }
    },
    onHide: function () {
        // 页面隐藏

    },
    onUnload: function () {
        // 页面关闭

    },
    onWechatLogin(e) {
        util.getTokenByWx().then(data => {
            this.hasAuthorize = true
            wx.switchTab({
                url: '/pages/index/index'
            });
        }).catch(err => {

        })
    },
})