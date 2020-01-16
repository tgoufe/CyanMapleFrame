'use strict';

import listener from "../util/listener";

/**
 * @summary     添加全局异常事件监控
 * @memberOf    maple
 * @param       {ListenerCallback}  callback
 * @return      {Object}
 * */
let error = (callback)=>{
		return listener.on('error', callback, {
			capture: true
		});
	}
	;

export default error;