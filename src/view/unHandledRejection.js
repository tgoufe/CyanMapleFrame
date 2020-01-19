'use strict';

import listener from "../util/listener";

/**
 * @summary     添加全局 unhandledrejection 事件监听
 * @memberOf    maple
 * @param       {ListenerCallback}  callback
 * @return      {Object}
 * */
let unHandledRejection = (callback)=>{
		return listener.on('unhandledrejection', callback, {
			capture: true
		});
	}
	;

export default unHandledRejection;