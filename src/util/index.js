'use strict';

/**
 * @file    工具函数聚合页面
 * */

/**
 * @namespace   maple.util
 * */

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

// 验证
// import validate     from './validate.js';

// 工具函数
import tools        from './tools.js';

import thread       from './thread.js';

export default {
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

	, listener
	, Listener
};

export {
	Aspect
	, HandlerQueue
	, Listener
}