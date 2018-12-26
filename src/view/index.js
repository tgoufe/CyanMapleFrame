'use strict';

/**
 * @file    view    视图功能聚合
 * */

import url          from '../runtime/url.js';
import {listener}   from '../listener.js';

import resize       from './resize.js';
import scroll, {ScrollObserver} from './scroll.js';

import devicemotion from './deviceMotion.js';

import pageshow     from './pageShow.js';
import pagehide     from './pageHide.js';

import visibilitychange from './visibilityChange.js';

import message      from './message.js';

/**
 * 统计将用到的事件
 * */
import beforeunload from './beforeUnload.js';
import unload       from './unload.js';

import postMessage  from './postMessage.js';

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

		pageshow.add(()=>{
			pagehide.add(()=>{
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

		, ScrollObserver

		, needRefresh

		, postMessage

		, offset
	}
	;

/**
 * @exports view
 * */
export default view;