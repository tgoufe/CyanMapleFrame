'use strict';

/**
 * @file    识别当前运行设备
 * @todo    评估一下是否有用，基本上只用到判断是否为微信，判断 app 使用了 cookie。。。
 * */

const alias = {
		androidchorme: 'androidchrome'
		, guge: 'chrome'
		, webview: 'webView'
		, minimalui: 'minimalUi'
		, statusbar: 'statusBar'
		, pixelratio: 'pixelRatio'
		, wechat: 'weixin'
		, wx: 'weixin'
	}
	, ua = navigator.userAgent
	;

/**
 * @summary     判断当前设备是否满足期望
 * @function
 * @param       {...string}
 * @return      {boolean}
 * @desc        可以传多个参数，当同时满足时，返回 true，否则 false
 * */
let device = function(){
		let argc = arguments.length
			, result = true
			, i, temp
			;

		if( argc === 0 ){
			result = false;
		}
		else{
			for(i = 0; i < argc; i++){

				temp = arguments[i];

				if( temp in device && device.hasOwnProperty(temp) ){
					result = result && device[temp];
				}
				else{
					temp = temp.toLowerCase();

					if( temp in alias ){
						result = result && device[alias[temp]];
					}
					else{
						result = result && false;
					}
				}

				if( !result ){
					break;
				}
			}
		}

		return result;
	}
	, android = ua.match(/(Android);?[\s/]+([\d.]+)?/)
	, ipad = ua.match(/(iPad).*OS\s([\d_]+)/)
	, ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/)
	, iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/)
	;

device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

// Chrome
device.chrome = ua.toLowerCase().indexOf('chrome') >= 0;

// Android
if( android ){
	device.os = 'android';
	device.osVersion = android[2];
	device.android = true;
	device.androidChrome = device.android && device.chrome;
}

// iOS
if( ipad || iphone || ipod ){
	device.os = 'ios';
	device.ios = true;
}
if( iphone && !ipod ){
	device.osVersion = iphone[2].replace(/_/g, '.');
	device.iphone = true;
}
if( ipad ){
	device.osVersion = ipad[2].replace(/_/g, '.');
	device.ipad = true;
}
if( ipod ){
	device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
	device.iphone = true;
}
// iOS 8+ changed UA
if( device.ios && device.osVersion && ua.indexOf('Version/') >= 0 ){
	if( device.osVersion.split('.')[0] === '10' ){
		device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
	}
}

// WebView
device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

// 微信，坑..
device.wechat = device.weixin = /MicroMessenger/i.test( ua );

// UC 浏览器
device.uc = ua.indexOf('UCBrowser') > -1;

// 支付宝
device.alipay = ua.indexOf("AlipayClient") > 0;

/**
 * @exports     device
 * @type        {Object}
 * @memberOf    maple
 * */
export default device;

export const Device = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Object}    app
	 * @desc    注入为 $device
	 * */
	inject(app){
		app.inject('$device', device);
	}
};