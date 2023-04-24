'use strict';

/**
 * @file    工具函数聚合页面
 * */

/**
 * @namespace   maple.util
 * */

import log, {setDebug} from './log.js';

// 操作类
import debounce     from './debounce.js';
import throttle     from './throttle.js';
import lockup       from './lockup.js';
import aspect, {Aspect} from './aspect.js';
import timeout      from './timeout.js';

// 数据处理类
import merge        from './merge.js';
import classify     from './classify.js';

// 时间格式处理
import dateFormat   from './dateFormat.js';

import HandlerQueue from './handlerQueue.js';

import listener, {Listener} from './listener.js';

// 工具函数
import tools        from './tools.js';

import thread       from './thread.js';

// 数据转化工具函数
import transformer  from './transformer.js';

let util = {
		debounce
		, throttle
		, lockup
		, timeout

		// AOP
		, aspect
		, Aspect

		, merge
		, classify

		, dateFormat

		, HandlerQueue

		// , validate
		, tools

		, thread

		, ...transformer

		, listener
		, Listener

		, log
		, setDebug
	}
	;

export default util;

export const Util = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Base}  app
	 * @desc    注入为 $util
	 * */
	inject(app){
		app.inject('$util', util);
	}
};

export {
	Aspect
	, HandlerQueue
	, Listener
}