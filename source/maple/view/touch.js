'use strict';

/**
 * @file    全局事件 pointer
 *          使用捕捉方式
 *          存在 point 事件时使用 pointer 事件
 *          否则存在 touch 事件时使用 touch 事件替代
 *          否则使用 mouse 事件替代
 * */

import Listener from './listener.js';

const pointerEventType = [
		'over'
		, 'enter'
		, 'down'
		, 'move'
		, 'up'
		, 'cancel'
		, 'out'
		, 'leave'
	]
	, touchEventType = [
		'start'
		, 'end'
		, 'move'
		, 'cancel'
	]
	, mouseEventType = [
		'click'
		, 'up'
		, 'down'
		, 'move'
		, 'enter'
		, 'leave'
		, 'out'
		, 'over'
	]
	;

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
	start   = new Listener({
		eventType: 'pointerdown'
	});
	move    = new Listener({
		eventType: 'pointermove'
	});
	end     = new Listener({
		eventType: 'pointerup'
	});

	// todo 用途？
	over    = new Listener({
		eventType: 'pointerover'
	});
	out     = new Listener({
		eventType: 'pointerout'
	});
	enter   = new Listener({
		eventType: 'pointerenter'
	});
	leave   = new Listener({
		eventType: 'pointerleave'
	});
}
else if( 'TouchEvent' in window ){
	start   = new Listener({
		eventType: 'touchstart'
	});
	move    = new Listener({
		eventType: 'touchmove'
	});
	end     = new Listener({
		eventType: 'touchend'
	});
}
else{
	start   = new Listener({
		eventType: 'mousedown'
	});
	move    = new Listener({
		eventType: 'mousemove'
	});
	end     = new Listener({
		eventType: 'mouseup'
	});

	// todo 用途？
	over    = new Listener({
		eventType: 'mouseover'
	});
	out     = new Listener({
		eventType: 'mouseout'
	});
	enter   = new Listener({
		eventType: 'mouseenter'
	});
	leave   = new Listener({
		eventType: 'mouseleave'
	});
}

// /**
//  * @memberOf    maple.view
//  * @type        {Listener}
//  * */
