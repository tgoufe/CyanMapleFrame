'use strict';

/**
 * @file    全局事件 pointer
 *          使用捕捉方式
 *          存在 point 事件时使用 pointer 事件
 *          否则存在 touch 事件时使用 touch 事件替代
 *          否则使用 mouse 事件替代
 * */

import listener from '../util/listener.js';

// const pointerEventType = [
// 		'over'
// 		, 'enter'
// 		, 'down'
// 		, 'move'
// 		, 'up'
// 		, 'cancel'
// 		, 'out'
// 		, 'leave'
// 	]
// 	, touchEventType = [
// 		'start'
// 		, 'end'
// 		, 'move'
// 		, 'cancel'
// 	]
// 	, mouseEventType = [
// 		'click'
// 		, 'up'
// 		, 'down'
// 		, 'move'
// 		, 'enter'
// 		, 'leave'
// 		, 'out'
// 		, 'over'
// 	]
// 	;

let start
	, move
	, end

	// todo 用途？
	, over
	, out
	, enter
	, leave
	;

if( 'PointerEvent' in window ){
	start   = (callback)=>{
		return listener.on('pointerdown', callback);
	};
	move    = (callback)=>{
		return listener.on('pointermove', callback);
	};
	end     = (callback)=>{
		return listener.on('pointerup', callback);
	};

	// todo 用途？
	over    = (callback)=>{
		return listener.on('pointerover', callback);
	};
	out     = (callback)=>{
		return listener.on('pointerout', callback);
	};
	enter   = (callback)=>{
		return listener.on('pointerenter', callback);
	};
	leave   = (callback)=>{
		return listener.on('pointerleave', callback);
	};
}
else if( 'TouchEvent' in window ){
	start   = (callback)=>{
		return listener.on('touchstart', callback);
	};
	move    = (callback)=>{
		return listener.on('touchmove', callback);
	};
	end     = (callback)=>{
		return listener.on('touchend', callback);
	};
}
else{
	start   = (callback)=>{
		return listener.on('mousedown', callback);
	};
	move    = (callback)=>{
		return listener.on('mousemove', callback);
	};
	end     = (callback)=>{
		return listener.on('mouseup', callback);
	};

	// todo 用途？
	over    = (callback)=>{
		return listener.on('mouseover', callback);
	};
	out     = (callback)=>{
		return listener.on('mouseout', callback);
	};
	enter   = (callback)=>{
		return listener.on('mouseenter', callback);
	};
	leave   = (callback)=>{
		return listener.on('mouseleave', callback);
	};
}