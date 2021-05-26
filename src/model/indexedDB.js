'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

/**
 * 默认配置
 * @const
 * */
const INDEXED_DB_CONFIG = {
		dbName: 'storage'
		, tableName: 'storage'
		, dbVersion: 1
		, keyPath: 'topic'
		, index: [{
			name: 'topic'
			, keyPath: 'topic'
			, unique: true
		}, {
			name: 'value'
			, keyPath: 'value'
			, unique: false
		// }, {
		// 	// 数组类型
		// 	name: 'array'
		// 	, keyPath: 'array'
		// 	, multiEntry: true
		}]
		, autoIncrement: true
		, persist: false
	}
	;

/**
 * @class
 * @desc    对 IndexedDB 进行封装，统一调用接口，在 Model.factory 工厂方法注册为 indexedDB，别名 idb，将可以使用工厂方法生成
 * @extends Model
 * @example
<pre>
let indexedDBModel = new IndexedDBModel()
	, storage = Model.factory('indexedDB')
	, idb = Model.factory('idb')
	;
</pre>
 * @desc        IndexedDB 也提供同步 API，但同步 API 需要配合 WebWorker 一同使用。目前，没有主流浏览器支持同步 API
 * */
class IndexedDBModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.dbName]
	 * @param   {string}    [config.tableName]
	 * @param   {number}    [config.dbVersion]
	 * @param   {string}    [config.keyPath]
	 * @param   {Object[]}  [config.index]
	 * @param   {string}    [config.index[].name]
	 * @param   {string}    [config.index[].keyPath]    未设置时默认使用 name
	 * @param   {boolean}   [config.index[].unique=false]   默认值 false
	 * @param   {string}    [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, IndexedDBModel.CONFIG);

		super( config );

		this._config = config;

		// this._store 为 Promise 类型，会在 resolve 中传入 db 实例，因为要保证数据库打开成功才可以操作
		this._store = new Promise((resolve, reject)=>{
			let indexedDB
				, dbOpenRequest
				;

			indexedDB = self.indexedDB || self.mozIndexedDB || self.webbkitIndexedDB || self.msIndexedDB || null;

			if( indexedDB ){
				dbOpenRequest = indexedDB.open(this._config.dbName, this._config.dbVersion);

				/**
				 * DB 版本设置或升级时回调
				 * createObjectStore deleteObjectStore 只能在 onupgradeneeded 事件中使用
				 * */
				dbOpenRequest.onupgradeneeded = (e)=>{
					let db = e.target.result
						, store
						;

					// 创建表
					if( !db.objectStoreNames.contains(this._config.tableName) ){

						// 创建存储对象
						store = db.createObjectStore(this._config.tableName, {
							keyPath: this._config.keyPath
							// , autoIncrement: this._config.autoIncrement
						});

						this._config.index.forEach((d)=>{
							store.createIndex(d.name, d.keyPath || d.name, {
								unique: d.unique || false
							});
						});
					}
				};
				dbOpenRequest.onsuccess = (e)=>{
					resolve( e.target.result );
				};
				dbOpenRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				};
			}
			else{
				reject( new Error('此数据库不支持 IndexedDB') );
			}
		});

		if( navigator.storage && navigator.storage.persist() ){
			navigator.storage.persist().then((granted)=>{
				if( granted ){
					// todo
				}
			});
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $idb，配置参数名 idb
	 * */
	static inject(app){
		app.inject('$idb', new IndexedDBModel( app.$options.idb ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return INDEXED_DB_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 查询
	 * @private
	 * @param   {string}    topic
	 * @return  {Promise<*, ErrorEvent>} 返回一个 Promise 对象，在 resolve 时传回查询出来的 value
	 * @desc    获取数据时会将其存入内存中
	 * */
	_select(topic){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let objectStore = db.transaction([this._config.tableName], 'readonly').objectStore( this._config.tableName )
					, objectStoreRequest = objectStore.get( topic )
					;

				objectStoreRequest.onsuccess = (e)=>{
					let value = e.target.result
						;

					super.setData(topic, value);

					resolve( value );
				};
				objectStoreRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				};
			});
		});
	}
	/**
	 * @summary 新建或更新
	 * @private
	 * @param   {string}    topic
	 * @param   {string}    value
	 * @return  {Promise<boolean, ErrorEvent>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    add 接口要求数据库中不能已经有相同键的对象存在，因此统一使用 put 接口
	 *          保持值得时候，同时会保持在内存中
	 * */
	_put(topic, value){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let objectStore = db.transaction([this._config.tableName], 'readwrite').objectStore( this._config.tableName )
					, objectStoreRequest = objectStore.put({
						topic: topic
						, value: value
					})
					;

				objectStoreRequest.onsuccess = (e)=>{
					super.setData(topic, value);

					resolve( !!e.target.result );
				};
				objectStoreRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				};
			});
		});
	}
	/**
	 * @summary 删除
	 * @private
	 * @param   {string}    topic
	 * @return  {Promise<boolean, ErrorEvent>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_delete(topic){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let objectStore = db.transaction([this._config.tableName], 'readwrite').objectStore( this._config.tableName )
					, objectStoreRequest = objectStore.delete( topic )
					;

				// 即使要删除的数据不存在，也会触发 success
				objectStoreRequest.onsuccess = ()=>{
					super.removeData( topic );

					resolve( true );
				};
				objectStoreRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				};
			});
		});
	}
	/**
	 * @summary 清空
	 * @private
	 * @return  {Promise<boolean, null>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_clear(){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let objectStore = db.transaction([this._config.tableName], 'readwrite').objectStore( this._config.tableName )
					, objectStoreRequest = objectStore.clear()
					;

				objectStoreRequest.onsuccess = ()=>{
					super.clearData();

					resolve( true );
				};
				objectStoreRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				}
			});
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @override
	 * @param   {string|Object} topic
	 * @param   {*}             value
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    保持值得时候，同时会保持在内存中
	 * */
	setData(topic, value){
		let result
			;

		if( typeof topic === 'object' ){
			result = this._setByObject( topic );
		}
		else{
			result = this._put(topic, value);
		}

		return result;
	}
	/**
	 * @summary 获取数据
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<*, null>}  返回一个 Promise 对象，若存在 topic 的值，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    获取数据时会优先从内存中取值，若没有则从 indexedDB 中取值并将其存入内存中，当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._getByArray( topic );
		}
		else if( argc > 1 ){
			result = this._getByArray( [].slice.call(arguments) );
		}
		else{
			result = this._select( topic ).then((rs)=>{
				let value
					;

				if( rs ){
					value = rs.value;

					if( typeof value === 'string' ){ // 若为字符串类型的数据，尝试进行解析
						try{
							value = JSON.parse( value );
						}
						catch(e){}
					}
				}
				else{
					value = Promise.reject( null );
				}

				return value;
			});
		}

		return result;
	}
	/**
	 * @summary 将数据从缓存中删除
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	removeData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._removeByArray( topic );
		}
		else if( argc > 1 ){
			result = this._removeByArray( [].slice.call(arguments) );
		}
		else{
			result = this._delete( topic );
		}

		return result;
	}
	/**
	 * @summary 清空数据
	 * @override
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	clearData(){
		super.clearData();

		return this._clear();
	}
	/**
	 * @summary 获取通过 range 获取数据
	 * @param   {Object}            options={}
	 * @param   {string}            [options.index]
	 * @param   {number|string}     [options.only]
	 * @param   {number|string}     [options.min]
	 * @param   {number|string}     [options.max]
	 * @param   {boolean}           [options.eqMin=true]
	 * @param   {boolean}           [options.eqMax=true]
	 * @param   {IDBCursorDirection}    [options.direction]
	 * @return  {Promise}           返回一个 Promise 对象，在 resolve 时传回 cursor 列表
	 * @todo    区间取值功能
	 * */
	cursor(options={}){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let transaction = db.transaction([this._config.tableName], 'readwrite')
					, objectStore = transaction.objectStore( this._config.tableName )
					, {index, only, min, max, eqMin=false, eqMax=false, direction} = options
					, range
					, target
					, cursor
					, cursorList = []
					;

				if( only ){
					range = IDBKeyRange.only( only );
				}
				else if( min && max ){
					range = IDBKeyRange.bound(min, max, eqMin, eqMax);
				}
				else if( max ){
					range = IDBKeyRange.upperBound(max, eqMax);
				}
				else if( min ){
					range = IDBKeyRange.lowerBound(min, eqMin);
				}

				if( index ){
					target = objectStore.index( index );
				}
				else{
					target = objectStore;
				}

				cursor = target.openCursor(range, direction);

				cursor.onsuccess = (e)=>{
					let cursor = e.target.result
						;

					if( cursor ){
						cursorList.push( cursor.value );

						cursor.continue();
					}
				};
				cursor.onerror = (e)=>{
					console.log( e );
					reject( e );
				};

				transaction.oncomplete = ()=>{
					resolve( cursorList );
				};
				transaction.onerror = (e)=>{
					console.log( e );
					reject( e );
				}
			});
		});
	}

	count(){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				let objectStore = db.transaction([this._config.tableName], 'readonly').objectStore( this._config.tableName )
					, objectStoreRequest = objectStore.count()
					;

				objectStoreRequest.onsuccess = (e)=>{
					resolve( e.target.result );
				};
				objectStoreRequest.onerror = (e)=>{
					console.log( e );
					reject( e );
				};
			});
		});
	}

	/**
	 * @summary 类构造失败时的回调接口
	 * @param   {Function}  callback
	 * */
	catch(callback){
		if( typeof callback === 'function' ){
			this._store.catch( callback );
		}
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('indexedDB', IndexedDBModel);
/**
 * 注册别名
 * */
Model.registerAlias('indexedDB', 'idb');

export default IndexedDBModel;