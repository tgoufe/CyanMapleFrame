'use strict';

/**
 * @file    view    视图功能聚合
 * */

import url          from '../runtime/url.js';
import {listener, Listener} from '../listener.js';

import resize       from './resize.js';
import scroll       from './scroll.js';

import devicemotion from './deviceMotion.js';

import pageshow     from './pageShow.js';
import pagehide     from './pageHide.js';

import visibilitychange from './visibilityChange.js';

import message      from './message.js';

/**
 * 统计将用的的事件
 * */
import beforeunload from './beforeUnload.js';
import unload       from './unload.js';

let needRefreshOn = false

	/**
	 * @summary     设置页面回退时刷新该页面
	 * @function
	 * @memberOf    maple.view
	 * @desc        当 Chrome 由当前页面跳转到下一页面后，浏览回退到当前页面时，页面不会刷新，调用此函数以达成刷新页面的效果
	 * */
	, needRefresh = ()=>{
		if( needRefreshOn ){
			return ;
		}

		pageShow.add(()=>{
			pageHide.add(()=>{
				url.reload();
			});
		});

		needRefreshOn = true;
	}
	/**
	 * @summary     获取节点的方位、大小信息
	 * @function
	 * @memberOf    maple.view
	 * @param       {Element}       target
	 * @param       {string}        [key]
	 * @return      {Object|number}
	 * */
	, offset = (target, key)=>{
		let rs = null
			;

		if( 'getBoundingClientRect' in target ){
			rs = target.getBoundingClientRect();

			if( key ){
				rs = rs[key];
			}
		}

		return rs;
	}

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
	, postMessage = (targetWindow, message, targetOrigin='*', transfer)=>{
		targetWindow.postMessage(message, targetOrigin, transfer);
	}

	/**
	 * @namespace   maple.view.eventList
	 * */
	, eventList = {
		resize
		, scroll
		, devicemotion

		, pageshow
		, pagehide

		, visibilitychange

		, message

		, beforeunload
		, unload
	}

	/**
	 * @summary     绑定事件
	 * @function
	 * @memberOf    maple.view
	 * @param       {string}    eventType
	 * @param       {Function}  callback
	 * */
	, on = (eventType, callback)=>{
		if( !(eventType in eventList) ){
			eventList[eventType] = listener( eventType );
		}

		eventList[eventType].add( callback );
	}
	/**
	 * @summary     触发事件
	 * @function
	 * @memberOf    maple.view
	 * @param       {string}    eventType
	 * @param       {...*}      argv
	 * @return      {*}
	 * */
	, trigger = (eventType, ...argv)=>{
		if( eventType in eventList ){
			return eventList[eventType].trigger(...argv);
		}
		else{
			console.log('不存在', eventType, '类型的事件');
		}
	}
	;


/**
 * @namespace   maple.view
 * */
let view = {
		on
		, trigger
		, eventList
		, ...eventList

		, needRefresh

		, postMessage

		, offset
	}
	;

/**
 * @exports view
 * */
export default view;