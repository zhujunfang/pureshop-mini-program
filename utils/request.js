import wf from 'wefetch'
import api from '../config/api'
import { login, checkSession, redirect, showErrorToast, getUserInfo } from './wxutils'

class Request {
    // init
    constructor() {
        // 请求队列
        this.queue = {};
        // 配置请求域名
        this.baseUrl = api.baseUrl;
        // 仅支付宝小程序支持
        this.timeout = 3000;
        // 创建 wefetch 实例
        this.instance = wf.create();
    }
    // 参数合并
    merge(options) {
        return { ...options, baseUrl: this.baseUrl }
    }
    // 执行 wefetch 实例
    request(options) {
        return this.instance(this.merge(options));
    }

    // 对 fetch response.ok 进行增强，返回数据里的errno不等于0时，为业务异常 
    responseIsOk(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
            return false
        }

        if (response.data.errno !== 0) {
            return false
        }

        return true
    }
}

let awaitAuth = false

function switchawaitAuth(value = null) {
    if (value === null) {
        value = !awaitAuth
    } else {
        value = Boolean(value)
    }

    console.log(`switch awaitAuth: {now: ${awaitAuth}, after: ${value}}`)
    awaitAuth = !awaitAuth
}

const r = new Request

/**
 * 401: await login
 *  |- awaitAuth
 *      |- is timeout: reject
 *      |- success: re request
 *  |- not awaitAuth
 *      |- switch awaitAuth: true
 *      |- login and get userInfo
 *          |- success: re request
 *          |- fail: open auth dialog 
 */
function request(url, data = {}, method = "GET") {
    console.log(`[begin: ${method}] ${url}`)

    return r.request({
        url,
        data,
        method,
        header: {
            'Content-Type': 'application/json',
            'X-Nideshop-Token': wx.getStorageSync('token')
        }
    }).then(response => {
        const responseIsOk = r.responseIsOk(response)
        console.log(`[end:${method}:${responseIsOk ? "success" : "error"}] ${url}`)

        if (responseIsOk) {
            return response
        }

        return new Promise((resolve, reject) => {
            const res = response.data

            if (res.errno !== 401) {
                reject("request biz error")
            }

            if (awaitAuth === false) {
                switchawaitAuth()
                return getTokenByWx().then(res => {
                    return request(url, data, method)
                }).catch(err => {
                    reject(err)
                })
            } else {// 等待并设置超时处理
                console.log(`await auth, pause request ${url} `)

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (awaitAuth === false) {
                            console.log(`重新请求 ${url}`)
                            request(url, data, method).then(res => {
                                resolve(res)
                            }).catch(err => {
                                reject(err)
                            })
                        } else {
                            reject(new Error("await auth timeout"))
                        }
                    }, 5000)
                })
            }
        })
    }).then(response => {
        const data = response.data
        return data
    })
}

function getTokenByWx() {
    let code = ""

    return login()
        .then((res) => { // 获得用户信息
            code = res
            return getUserInfo()
        }).then((res) => { // 请求身份认证api，获得token
            const data = { code: code, userInfo: res }
            console.log("auth login by weixin", data)
            return request(api.AuthLoginByWeixin, data, 'POST')
        }).then(res => {
            console.log("auth login by weixin data", res)

            const errno = res?.errno !== undefined ? res.errno : null
            console.log(`get auth token errno: ${errno} ${errno === 0 ? "is zero" : "is not zero"}`)

            if (errno !== 0) {//用户身份认证失败
                const message = res?.data?.message !== undefined ? res.data.message : ""
                console.log(`用户身份认证失败, ${message}`)
                // todo 抛出错误
                return
            }

            const app = getApp()

            // 存储用户信息
            app.globalData.userInfo = res.data.userInfo;
            app.globalData.token = res.data.token;
            wx.setStorageSync('userInfo', JSON.stringify(res.data.userInfo));
            wx.setStorageSync('token', res.data.token);

            return res
        }).catch(err => {
            console.log("需要用户授权", err)
            //跳转到授权窗口
            redirect("/pages/auth/wx/authorize")
        })
}

export { request, getTokenByWx }