'use strict';

/**
 * @file    基础框架聚合
 *          模块聚合关系如下：
<pre>
 +-----------------------------------------------------------+
 |                                                           |
 |             Maple( index.js )                              |
 |                                                           |
 |  +-------+  +----------+  +------------+  +------------+  |
 |  |       |  |          |  |            |  |            |  |
 |  |  url  |  |  device  |  |  listener  |  |  util      |  |   运行环境检测 & 基础工具函数
 |  |       |  |          |  |            |  |            |  |
 |  +-------+  +----------+  +------------+  +------------+  |
 |                                                           |
-----------------------------------------------------------------------
 |                                                           |
 |  +--------------+  +---------------+  +----------------+  |
 |  |              |  |               |  |                |  |
 |  |  model       |  |  view         |  |  router        |  |   Model 数据处理 & View 视图处理 & router 路由配置
 |  |              |  |               |  |                |  |
 |  +--------------+  +---------------+  +----------------+  |
 |                                                           |
-----------------------------------------------------------------------
 |                                                           |
 |  +-------+  +------------+  +----------+                  |
 |  |       |  |            |  |          |                  |
 |  |  geo  |  |  register  |  |  notify  |                  |  浏览器增强功能
 |  |       |  |            |  |          |                  |
 |  +-------+  +------------+  +----------+                  |
 |                                                           |
 +-----------------------------------------------------------+
</pre>
 * */

/**
 * @namespace   maple
 * */

import Base from './base.js';

/**
 * ---------- 通用工具 ----------
 * */
import util, {Util, HandlerQueue}   from './util/index.js';
export * from './util/index.js';

/**
 * ---------- 事件队列监听 ----------
 * */
import listener, {Listener} from './util/listener.js';

/**
 * ---------- 全局运行时检测 ----------
 * */
// 运行参数
import url, {Url, CurrentUrl}   from './runtime/url.js';

// 运行设备、系统、内核、浏览器
import device, {Device} from './runtime/device.js';

/**
 * ---------- 数据层 ----------
 * */
import model, * as ModelList    from './model/index.js';
export * from './model/index.js';

/**
 * ---------- View 监控对象 ----------
 * */
import view, {View} from './view/index.js';
export * from './view/index.js';

/**
 * ---------- 获取地理位置 ----------
 * */
import geo from './view/geo.js';

/**
 * ---------- Router 路由控制 ----------
 * */
import router, {Router} from './router/index.js';

/**
 * ---------- 错误处理 ----------
 * */
// 全局错误
import error                from './view/error.js';
// 为捕获的 promise reject
import unHandledRejection   from './view/unHandledRejection.js';

// /**
//  * ---------- 动画库 ----------
//  * todo 实验性功能
//  * */
// import * as animate from './animate/index.js';

/**
 * ---------- 注册后台 worker ----------
 * */
import register from './register/index.js';

/**
 * ---------- 桌面通知 ----------
 * */
import notify     from './view/notify.js';

import useAxios, {setOpts} from './service/useAxios.js';

const
	{ Model
	, ServiceModel
	, WebSocketModel } = ModelList
	;
let maple = {
		App: Base
		, Listener
		, listener
		, util
		, log: util.log
		, setDebug: util.setDebug

		, url
		, device

		, ...ModelList
		, model

		, view

		, Router
		, router

		, error
		, unHandledRejection

		, geo

		// 实验性功能
		// , animate
		, register
		, notify
		, useAxios(options){
			setOpts( options );

			ServiceModel.use( useAxios );
		}

		/**
		 * 设置默认依赖关系
		 * 此方法应该在 useAxios 前使用
		 * */
		, setDefaultDI(){
			Router.use(Url, Listener, HandlerQueue);

			Model.use( Listener );

			WebSocketModel.use( Url );
		}
	}
	;

export default maple;

export {
	Base as App
	, Url
	, CurrentUrl
	, Device
	, View
	, Util
	, Router
};