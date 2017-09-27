'use strict';

import Model        from './model.js';
import merge        from '../util/merge.js';
import {listener}   from '../listener.js';

/**
 * @class
 * @classdesc   对 localStorage 进行封装，统一调用接口，在 Model.factory 工厂方法注册为 localStorage，别名 ls，将可以使用工厂方法生成
 * @extends     Model
 * @example
 *
<pre>
let localStorageModel = new LocalStorageModel()
	, storage = Model.factory('localStorage')
	, ls = Model.factory('ls')
	;

storage.getData('fittingShow/index/first').then((value)=>{
	console.log('获取到 ', value);
});
</pre>
 * */
class LocalStorageModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {Boolean}   [config.listen] 是否开启监听事件
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, LocalStorageModel._CONFIG);

		if( 'localStorage' in self ){
			this._enabled = true;
			this._storeSync = self.localStorage;
			this._store = Promise.resolve( self.localStorage );

			config.listen && !LocalStorageModel._listenOn && LocalStorageModel.listenOn();
		}
		else{
			this._enabled = false;
			this._storeSync = null;
			this._store = Promise.reject( new Error('此浏览器不支持 localStorage') );
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 全局 storage 事件监听
	 * @static
	 * @desc    只执行一次，执行后将 LocalStorageModel._listenOn 设为 true，该监听事件只能由其他页面修改 localStorage 的数据时触发
	 * */
	static listenOn(){
		
		if( LocalStorageModel._listenOn ){
			return;
		}
		
		LocalStorageModel._globalStorage = listener('storage', function(e){
			let topic = e.key
				, newVal = e.newValue
				, oldVal = e.oldValue
				;

			if( LocalStorageModel._EVENT_LIST.length ){

				LocalStorageModel._EVENT_LIST.forEach((d)=>d(topic, newVal, oldVal));
			}
		});
		LocalStorageModel._listenOn = true;
	}
	static listenOff(){
		if( LocalStorageModel._listenOn && LocalStorageModel._globalStorage ){
			LocalStorageModel._globalStorage.off();

			LocalStorageModel._listenOn = false;
		}
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @param   {String|Object} topic
	 * @param   {*}             value   当 topic 为 object 类型时被忽略
	 * @return  {Promise}       返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    保持值得时候，同时会保持在内存中
	 * */
	setData(topic, value){
		let result
			;

		if( typeof topic === 'object' ){
			result = this._setByObject( topic );
		}
		else{
			result = super.setData(topic, value).then(()=>{
				return this._store.then((store)=>{
					store.setItem(topic, this._stringify(value));

					return true;
				});
			});
		}

		return result;
	}
	/**
	 * @summary 获取数据
	 * @param   {String|String[]|...String} topic
	 * @return  {Promise}                   返回一个 Promise 对象，若存在 topic 的值，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    获取数据时会优先从内存中取值，若没有则从 localStorage 中取值并将其存入内存中，当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._getByArray( topic );
		}
		else if( argc.length > 1 ){
			result = this._getByArray( [].slice.call(arguments) );
		}
		else{
			result = super.getData( topic ).catch(()=>{
				return this._store.then((store)=>{
					let value = store.getItem( topic )
						;

					if( value === null ){
						value = Promise.reject( null );
					}
					else{
						try{
							value = JSON.parse( value );
						}
						catch(e){}

						// 在内存中保留该值
						super.setData(topic, value);
					}

					return value;
				});
			});
		}
		
		return result;
	}
	/**
	 * @summary 以同步的方式获取 localStorage 中的数据
	 * @param   {String|String[]|...String}   topic
	 * @return  {Object|String}     若存在 topic 的值，返回查询出来的 value，否则返回 null
	 * @desc    获取数据时会优先从内存中取值，若没有则从 localStorage 中取值并将其存入内存中，当 topic 的类型为数组的时候，返回结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getDataSync(topic){
		let argc = arguments.length
			, keyList
			, result
			;
		
		if( this._enabled ){

			if( !Array.isArray(topic) ){
				keyList = [topic];
			}
			else if( argc > 1 ){
				keyList = [].slice.call( arguments );
			}
			else{
				keyList = topic;
			}

			result = keyList.reduce((all, d)=>{
				if( d in this._value ){
					all[d] = this._value[d];
				}
				else{
					all[d] = this._storeSync.getItem( d );

					try{
						all[d] = JSON.parse( all[d] );
					}
					catch(e){}

					super.setData(d, all[d]);
				}
			}, {});

			if( !Array.isArray(topic) ){
				result = result[topic];
			}
		}
		else{
			result = null;
		}

		return result;
	}
	/**
	 * @summary 将数据从缓存中删除
	 * @param   {String|String[]}   topic
	 * @return  {Promise}           返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	removeData(topic){
		let result
			;

		if( Array.isArray(topic) ){
			result = this._removeByArray( topic );
		}
		else{
			result = super.removeData( topic ).then(()=>{
				return this._store.then((store)=>{
					store.removeItem( topic );

					return true;
				});
			});
		}

		return result;
	}
	/**
	 * @summary 清空数据
	 * @return  {Promise}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	clearData(){
		return super.clearData().then(()=>{
			return this._store.then((store)=>{
				store.clear();

				return true;
			});
		});
	}

	/**
	 * @summary 绑定数据监视事件
	 * @param   {ModelChangeEvent}  callback
	 * */
	on(callback){

		this._eventList.push( callback );

		LocalStorageModel._EVENT_LIST.push( callback );
	}
	/**
	 * @summary 解除绑定数据监控回调函数
	 * @param   {ModelChangeEvent}  callback
	 * */
	off(callback){
		let i = this._eventList.indexOf( callback )
			;

		if( i !== -1 ){
			this._eventList.splice(i, 1);
		}

		i = LocalStorageModel._EVENT_LIST.indexOf( callback );
		if( i !== -1 ){
			LocalStorageModel._EVENT_LIST.splice(i, 1);
		}
	}
}

/**
 * 默认参数
 * @const
 * @static
 * */
LocalStorageModel._CONFIG = {
	listen: true
};
/**
 * 保存的事件队列
 * @static
 * */
LocalStorageModel._EVENT_LIST = [];
/**
 * 全局 storage 监听事件是否开启
 * @static
 * */
LocalStorageModel._listenOn = false;

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('localStorage', LocalStorageModel);
/**
 * 注册别名
 * */
Model.registerAlias('localStorage', 'ls');

export default LocalStorageModel;