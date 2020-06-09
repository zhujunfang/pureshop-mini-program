// application instance
const app = getApp()

/**
 * 调用微信登录
 */
function login() {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (res) {
                if (res.code) {
                    resolve(res.code);
                } else {
                    reject(res);
                }
            },
            fail: function (err) {
                reject(err);
            }
        });
    });
}

/**
* 检查微信会话是否过期
*/
function checkSession() {
    return new Promise(function (resolve, reject) {
        wx.checkSession({
            success: function () {
                resolve(true);
            },
            fail: function () {
                reject(false);
            }
        })
    });
}

function redirect(url = '/pages/auth/login/login', type = 1) {

    const data = { url }

    switch (type) {
        case 1:
            wx.redirectTo(data)
            break
        case 2:
            wx.switchTab(data)
            break;
        case 3:
            wx.navigateTo(data)
            break
    }
}

function getUserInfo() {
    return new Promise(function (resolve, reject) {
        wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
                if (res["detail"] && res["detail"]["errMsg"] && (res.detail.errMsg === 'getUserInfo:ok')) {
                    resolve(res);
                } else if (res["errMsg"] && (res.errMsg === 'getUserInfo:ok')) {
                    resolve(res);
                } else {
                    reject(res)
                }
            },
            fail: function (err) {
                reject(err);
            }
        })
    });
}

function showErrorToast(msg) {
    wx.showToast({
        title: msg,
        image: '/static/images/icon_error.png'
    })
}

function updateAuthLocalData() {
    // todo
}

function removeAuthLocalData() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    app.globalData.token = ''
    app.globalData.userInfo = null
}

export {
    login,
    getUserInfo,
    checkSession,
    redirect,
    showErrorToast,
    updateAuthLocalData,
    removeAuthLocalData
}