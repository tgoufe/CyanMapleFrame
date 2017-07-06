'use strict';

/**
 * @file    陀螺仪事件
 * */

import Listener from '../listener.js';

/**
 * @memberOf    maple.view
 * */
let deviceMotion = null
	, type = ''
	;

if( 'DeviceMotionEvent' in window ){    // 获取陀螺仪加速度
	type = 'devicemotion';
}
// else if( 'DeviceOrientationEvent' in window ){  // 获取旋转信息
// 	eventType = 'deviceorientation';
// }

if( type ){
	deviceMotion = new Listener({
		type
		, target: window
	});
}

export default deviceMotion;