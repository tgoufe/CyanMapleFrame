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
         +---------+-------------+-------+-----+---------+---------+------------+------------+-----------+
         |         |             |             |         |         |            |            |           |
         |         |             |             |         |         |            |            |           |
         |         |             |             |         |         |            |            |           |
         v         |             v             |         v         |            v            |           |
 +-------+-------+ | +-----------+-----------+ | +-------+-------+ | +----------+----------+ | +---------+---------+
 |               | | |                       | | |               | | |                     | | |                   |
 |  CookieModel  | | |  SessionStorageModel  | | |  WebSQLModel  | | |  CacheStorageModel  | | |  FileSystemModel  |
 |               | | |                       | | |               | | |                     | | |                   |
 +---------------+ | +-----------------------+ | +---------------+ | +---------------------+ | +-------------------+
                   |                           |                   |                         |
                   |                           |                   |                         |
                   |                           |                   |                         |
                   v                           v                   v                         v
         +---------+-----------+   +-----------+------+   +--------+-------+   +-------------+------+
         |                     |   |                  |   |                |   |                    |
         |  LocalStorageModel  |   |  IndexedDBModel  |   |  ServiceModel  |   |  EventSourceModel  |
         |                     |   |                  |   |                |   |                    |
         +---------------------+   +------------------+   +----------------+   +--------------------+
</pre>
 * */

import Model from './model.js';

// 缓存
import './cookie.js';
import './localStorage.js';
import './sessionStorage.js';
import './indexedDB.js';
import './webSQL.js';
import './fileSystem.js';

// 网络请求
import './service.js';
import './webSocket.js';
import './eventSource.js';

export default Model;