'use strict';

/**
 * @file    数据层
 *          统一临时数据、本地缓存、服务器接口的调用，数据调用统一为 setData、getData、removeData、clearData 接口，也可继承相关的类，自定义实现接口
 *          当前继承关系
<pre>
                                    +---------+
                                    |         |
                                    |  Model  |
                                    |         |
                                    +----+----+
                                         |
                                         |
         +---------+-------------+-------+-----+---------+---------+------------+------------+-----------+-----------+
         |         |             |             |         |         |            |            |           |           |
         |         |             |             |         |         |            |            |           |           |
         |         |             |             |         |         |            |            |           |           |
         v         |             v             |         v         |            v            |           |           |
 +-------+-------+ | +-----------+-----------+ | +-------+-------+ | +----------+----------+ | +---------+---------+ |
 |               | | |                       | | |               | | |                     | | |                   | |
 |  CookieModel  | | |  SessionStorageModel  | | |  WebSQLModel  | | |  CacheStorageModel  | | |  FileSystemModel  | |
 |               | | |                       | | |               | | |                     | | |                   | |
 +---------------+ | +-----------------------+ | +---------------+ | +---------------------+ | +-------------------+ |
                   |                           |                   |                         |                       |
                   |                           |                   |                         |                       |
                   |                           |                   |                         |                       |
                   v                           v                   v                         v                       v
         +---------+-----------+   +-----------+------+   +--------+-------+   +-------------+------+   +------------+-----+
         |                     |   |                  |   |                |   |                    |   |                  |
         |  LocalStorageModel  |   |  IndexedDBModel  |   |  ServiceModel  |   |  EventSourceModel  |   |  WebSocketModel  |
         |                     |   |                  |   |                |   |                    |   |                  |
         +---------------------+   +------------------+   +----------------+   +--------------------+   +------------------+
</pre>
 * */

import Model from './model.js';

// 缓存
import CookieModel         from './cookie.js';
import LocalStorageModel   from './localStorage.js';
import SessionStorageModel from './sessionStorage.js';
import IndexedDBModel      from './indexedDB.js';
import WebSQLModel         from './webSQL.js';
import FileSystemModel     from './fileSystem.js';

import CacheStorageModel from './cacheStorage.js';

// 网络请求
import ServiceModel     from '../service/service.js';
import WebSocketModel   from '../service/webSocket.js';
import EventSourceModel from '../service/eventSource.js';

export default Model;

export {
	Model
	, CookieModel
	, LocalStorageModel
	, SessionStorageModel
	, IndexedDBModel
	, WebSQLModel
	, FileSystemModel

	, CacheStorageModel

	, ServiceModel
	, WebSocketModel
	, EventSourceModel
};