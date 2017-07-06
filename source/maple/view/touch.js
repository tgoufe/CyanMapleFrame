'use strict';

/**
 * @file    全局事件 pointer
 *          使用捕捉方式
 *          存在 point 事件时使用 pointer 事件
 *          否则存在 touch 事件时使用 touch 事件替代
 *          否则使用 mouse 事件替代
 * */

import Listener from '../listener.js';

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
		type: 'pointerdown'
	});
	move    = new Listener({
		type: 'pointermove'
	});
	end     = new Listener({
		type: 'pointerup'
	});

	// todo 用途？
	over    = new Listener({
		type: 'pointerover'
	});
	out     = new Listener({
		type: 'pointerout'
	});
	enter   = new Listener({
		type: 'pointerenter'
	});
	leave   = new Listener({
		type: 'pointerleave'
	});
}
else if( 'TouchEvent' in window ){
	start   = new Listener({
		type: 'touchstart'
	});
	move    = new Listener({
		type: 'touchmove'
	});
	end     = new Listener({
		type: 'touchend'
	});
}
else{
	start   = new Listener({
		type: 'mousedown'
	});
	move    = new Listener({
		type: 'mousemove'
	});
	end     = new Listener({
		type: 'mouseup'
	});

	// todo 用途？
	over    = new Listener({
		type: 'mouseover'
	});
	out     = new Listener({
		type: 'mouseout'
	});
	enter   = new Listener({
		type: 'mouseenter'
	});
	leave   = new Listener({
		type: 'mouseleave'
	});
}

// /**
//  * @memberOf    maple.view
//  * @type        {Listener}
//  * */
