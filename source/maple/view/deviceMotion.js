'use strict';

/**
 * @file    陀螺仪事件
 * */

import Listener from './listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener|Null}
 * */
let deviceMotion = null
	, eventType = ''
	;

if( 'DeviceMotionEvent' in window ){    // 获取陀螺仪加速度
	eventType = 'devicemotion';
}
// else if( 'DeviceOrientationEvent' in window ){  // 获取旋转信息
// 	eventType = 'deviceorientation';
// }

if( eventType ){
	deviceMotion = new Listener({
		eventType
	});
}

export default deviceMotion;