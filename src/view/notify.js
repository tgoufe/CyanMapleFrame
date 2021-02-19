'use strict';

/**
 * 显示桌面通知
 * @function    notify
 * @param       {string}        title
 * @param       {string|Object} content
 * @param       {string}        content.body
 * @param       {string}        [content.icon]
 * @param       {string}        [content.tag]
 * @param       {number|number[]}   [content.vibrate]
 * @param       {Array}             [content.actions]
 * @param       {string}            content.actions[].action
 * @param       {string}            content.actions[].title
 * @param       {string}            content.actions[].icon
 * @param       {string}            [icon]
 * @return      {Promise}
 * */
let notify
	;

if( 'Notification' in self ){
	notify = function(title, content, icon){
		let Notify = self.Notification
			, notification
			, permission
			;

		//判断浏览器是否已允许桌面提醒
		if( Notify.permission === 'granted' ){	// 已允许
			permission = Promise.resolve();
		}
		else{	// 用户未设置
			if( 'requestPermission' in Notify ){
				permission = Notify.requestPermission();
			}
			else{
				permission = Promise.reject('需要请求允许');
			}
		}

		return permission.then(function(){

			return new Promise((resolve, reject)=>{
				try{
					if( typeof content === 'object' ){
						notification = new Notify(title, content);
					}
					else{
						notification = new Notify(title, {
							icon: icon || '/image/favicon.ico'
							, body: content
						});
					}

					notification.onclick = function(){
						notification.close();

						resolve();
					};
				}
				catch(e){
					console.log( e );

					reject( e );
				}
			});
		});
	};
}
/**
 * 取消对旧版本兼容
 * */
// else if( 'webkitNotifications' in self ){    // 兼容旧版本 chrome
// 	notify = function(title, content){
// 		let Notify = self.webkitNotifications;
//
// 		// 判断浏览器是否已允许桌面提醒
// 		if( Notify.checkPermission() === 0 ){	// 已允许
//
// 			Notify.createNotification('/image/favicon.ico', title, content).show();
// 		}
// 		else{	// 未允许
// 			Notify.requestPermission();
// 		}
// 	};
// }
// else if( 'mozNotifications' in navigator ){
// 	notify = function(title, content){
// 		return navigator.mozNotification.createNotification(title, content, '/image/favicon.ico').show();
// 	}
// }
else{
	notify = function(){
		return Promise.reject( new Error('浏览器不支持 Notification 功能') );
	}
}

export default notify;

export const Notify = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Base}  app
	 * @desc    注入为 $notify
	 * */
	inject(app){
		app.inject('$notify', notify);
	}
};