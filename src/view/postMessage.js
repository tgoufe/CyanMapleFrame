'use strict';

/**
 * @summary     向其它窗口 或 Web Worker 发送消息
 * @function
 * @memberOf    maple.view
 * @param       {Window|Worker|Object}  targetWindow
 * @param       {*}                     message
 * @param       {string}                [targetOrigin='*']  * 表示无限制，也可以是一个 url
 * @param       {*}                     [transfer]
 * @desc        MessageHandler 为 iOS 下原生与 JS 交互的接口
 * */
let postMessage = (targetWindow, message, targetOrigin='*', transfer)=>{
	targetWindow.postMessage(message, targetOrigin, transfer);
};

export default postMessage;