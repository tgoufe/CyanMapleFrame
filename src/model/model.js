'use strict';

import Base from '../base.js';
import {Listener} from '../util/listener.js';
import merge from '../util/merge.js';
import log from '../util/log.js';

/**
 * 默认配置
 * @const
 * */
const MODEL_CONFIG = {
		eventType: 'modelChange'
	}
	/**
	 * 子类
	 * @const
	 * */
	, MODEL = {}
	/**
	 * 子类对象缓存
	 * @const
	 * */
	, MODEL_CACHE = {}
	/**
	 * 子类别名列表
	 * @const
	 * */
	, MODEL_ALIAS = {}
	;

/**
 * @summary     数据改变事件触发回调函数
 * @callback    ModelChangeEvent
 * @param       {Event}     event
 * @param       {string}    topic
 * @param       {*}         newValue
 * @param       {*}         [oldValue]
 * @this        {Model}
 * @desc        函数将传入 topic,newValue 值，当 removeData 执行时也会触发事件，newValue 被传为 null
 *              由于统一使用 Listener 对象，第一个参数将为事件对象，当前事件将传入 {type: modelChange, target: 对象实例}
 * */

/**
 * @class
 * @desc    数据层基类，将数据保存在内存中
 * @extends Base
 * @requires    Listener
 * @example
<pre>
let model = new Model();

// 保存数据，以 key-value 的形式保存
model.setData('index/first', true).then(()=>{
	console.log('数据保存成功');
});
// 保存对象
model.setData({
	isLogin: true
	, token: '123123123123123'
	, hybrid: false
}).then(()=>{
	// do something
});

// 获取数据
model.getData('index/first').then((value)=>{
	console.log('获取到数据 ', value);
}, (e)=>{
	console.log('当数据不存在时，reject 传入 null');
});
// 以数组的形式获取数据，返回的数据会被组成一个 Json，若 key 对应的 value 不存在会设为 null
model.getData(['isLogin', 'token', 'hybrid']).then(({isLogin, token, hybrid})=>{
	console.log(isLogin, token, hybrid);    // true, '123123123123123', false
	// 利用 JSON.parse 可以解析出基础类型数据
});
// 获取多个数据的返回结果与数组形式相同
model.getData('isLogin', 'token', 'hybrid').then(({isLogin, token, hybrid})=>{
	//
})
</pre>
 * */
class Model extends Base{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, Model.CONFIG);

		super( config );

		this.$listener = this.$listener || null;
		
		this._value = Object.create( null );    // 不会受到 prototype 的影响，适合用来存储数据，没有 hasOwnProperty、toString 等方法
		this._history = Object.create( null );  // 历史记录
		this._syncToList = [];

		this.config = config;

		this._$trigger = this.$listener.on(this, this.config.eventType, this._sync);
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 注册子类
	 * @static
	 * @param   {string}    name
	 * @param   {Model}     model
	 * @desc    若该子类已经被注册，并且缓存中没有该子类的实例，则覆盖
	 * */
	static register(name, model){
		if( name in Model._MODEL && name in Model._MODEL_CACHE ){
			log(`${name} 重复注册，并已生成实例，不能覆盖`);
		}
		else{
			Model._MODEL[name] = model;
		}
	}
	/**
	 * @summary 注册子类的别名
	 * @static
	 * @param   {string}            name        已注册的子类名
	 * @param   {string|string[]}   aliasName   该子类的别名
	 * */
	static registerAlias(name, aliasName){
		if( !Array.isArray(aliasName) ){
			aliasName = [aliasName];
		}

		aliasName.forEach((d)=>{
			if( !(d in Model._MODEL_ALIAS) ){
				Model._MODEL_ALIAS[d] = name;
			}
			else{
				log(`${d} 已经存在`);
			}
		});
	}
	/**
	 * @summary 获取或生成 type 类型的 Model 子类的实例或 Model 类的实例
	 * @static
	 * @param   {string}            [type]
	 * @param   {boolean|Object}    [notCache=false] 为 boolean 类型时表示是否缓存，默认值为 false，设为 true 时既不从缓存中读取子类实例对象，生成的实例对象也不保存在缓存中；为 object 类型时将值赋给 options 并设置为 true
	 * @param   {Object}            [options={}]
	 * @return  {Model}             当 type 有意义的时候，为 Model 子类类的实例，否则为 Model 类的实例
	 * */
	static factory(type, notCache=false, options={}){
		let model
			;

		if( type ){

			if( typeof notCache === 'object' ){
				options = notCache;
				notCache = true;
			}

			// 判断 type 是否为别名
			if( !(type in Model._MODEL) && (type in Model._MODEL_ALIAS) ){
				type = Model._MODEL_ALIAS[type];
			}

			// 判断是否存在该子类
			if( type in Model._MODEL ){

				if( notCache || !(type in Model._MODEL_CACHE) ){    // 不使用缓存或没有该子类实例
					model = new Model._MODEL[type]( options );

					if( !notCache ){

						// 使用缓存，将该子类实例缓存
						Model._MODEL_CACHE[type] = model;

						log(`通过工厂方法生成 ${type} 类型的对象, 将 ${type} 类型的对象缓存`);
					}
				}
				else{   // 使用缓存并存在该子类实例
					model = Model._MODEL_CACHE[type];

					log(`从缓存中取到 ${type} 类型的对象`);
				}
			}
			else{
				model = new Model();

				log(`不存在注册为 ${type} 的子类`);
			}
		}
		else{
			model = new Model();

			log('生成 model 对象');
		}

		return model;
	}
	/**
	 * @summary 判断某一对象是否为 Model 类型
	 * @static
	 * @param   {*}         target
	 * @return  {boolean}   返回结果
	 * */
	static is(target){
		return target && target[Symbol.toStringTag] === 'Model';
	}
	/**
	 * @summary     转为字符串，会将 null,undefined 转为空字符串
	 * @static
	 * @protected
	 * @param       {*}     value
	 * @return      {string}
	 * */
	static stringify(value){
		if( value === null || value === undefined ){
			value = '';
		}

		return typeof value === 'object' ? JSON.stringify( value ) : value.toString();
	}
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $model，配置参数名 model
	 * */
	static inject(app){
		app.inject('$model', new Model( app.$options.model ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return MODEL_CONFIG;
	}
	/**
	 * @summary 子类
	 * @static
	 * @private
	 * @const
	 * */
	static get _MODEL(){
		return MODEL;
	}
	/**
	 * @summary 子类对象缓存
	 * @static
	 * @private
	 * @const
	 * */
	static get _MODEL_CACHE(){
		return MODEL_CACHE;
	}
	/**
	 * @summary 子类别名列表
	 * @static
	 * @private
	 * @const
	 * */
	static get _MODEL_ALIAS(){
		return MODEL_ALIAS;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary     获取上一次该 topic 最后记录
	 * @protected
	 * @param       {string}    topic
	 * @return      {*}
	 * @desc        任何 topic 记录的第一个值都为 null
	 * */
	_lastData(topic){
		let t = this._history[topic]
			;

		if( !t ){
			t = this._history[topic] = [null];
		}

		return t[t.length -1];
	}
	/**
	 * @summary     记录数据的改变
	 * @protected
	 * @param       {string}    topic
	 * @param       {*}         newVal
	 * */
	_trackData(topic, newVal){
		let oldVal = this._lastData( topic )
			;

		if( newVal !== oldVal ){
			this._history[topic].push( newVal );
			
			log(`设置 ${topic} 的值为 ${newVal}`);

			this._trigger(topic, newVal, oldVal);
		}
	}
	/**
	 * @summary     触发绑定的数据监控事件
	 * @protected
	 * @param       {string}    topic
	 * @param       {*}         newValue
	 * @param       {*}         oldValue
	 * */
	_trigger(topic, newValue, oldValue){
		this._$trigger.trigger(topic, newValue, oldValue);
	}
	/**
	 * @summary     modelChange 事件监听回调，以实现数据同步
	 * @protected
	 * @param       {Event}     e
	 * @param       {string}    topic
	 * @param       {*}         value
	 * @return      {Promise}
	 * */
	_sync = (e, topic, value)=>{
		if( !this._syncToList.length ){
			return  Promise.resolve();
		}

		return Promise.all( this._syncToList.map((m)=>{
			let result
				;

			if( value !== null ){
				result = m.setData(topic, value);
			}
			else{
				result = m.removeData( topic );
			}

			return result.catch(function(e){
				log(`${m.constructor.name} ${topic} ${value} 同步失败`, e);
			});
		}) ).then(function(){
			log('同步完成');
		});
	}

	/**
	 * @summary     当 setData 传入一个 json 时内部调用函数
	 * @protected
	 * @param       {Object}    topic
	 * @return      {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_setByObject(topic){
		return Promise.all( Object.entries(topic).map(([k, v])=>{
			return this.setData(k, v);
		}) ).then((data)=>{
			return !!data;
		});
	}
	/**
	 * @summary     当 getData 传入一个数组时内部调用函数
	 * @protected
	 * @param       {string[]}  topic
	 * @return      {Promise}   返回一个 Promise 对象，在 resolve 时传回一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * @desc        其中如果任何一个 key 没有值，则返回 null
	 * */
	_getByArray(topic){
		return Promise.all( topic.map((d)=>{
			return this.getData( d ).catch(()=>{
				return null;
			});
		}) ).then((data)=>{
			return topic.reduce((rs, d, i)=>{
				rs[d] = data[i];

				return rs;
			}, {});
		});
	}
	/**
	 * @summary     当 removeData 传入一个数组时内部调用函数
	 * @protected
	 * @param       {string[]}  topic
	 * @return      {Promise}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_removeByArray(topic){
		return Promise.all( topic.map((d)=>{
			return this.removeData( d );
		}) ).then((data)=>{
			return !!data;
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @param   {string|Object} topic   主题
	 * @param   {*}             [value] 为 null、undefined 时会被保存为空字符串，当 topic 为 object 类型时被忽略
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    设置数据的时候会使用 Object.defineProperty 定义该属性
	 *			目前子类的实现中都调用了 super.setData，若其它子类的实现中并没有调用，但需对数据监控，应在适当的时候调用 _trigger 方法
	 * */
	setData(topic, value){
		let result
			;

		if( typeof topic === 'object' ){
			result = this._setByObject( topic );
		}
		else{
			if( topic in this._value ){
				this._value[topic] = value;
			}
			else{
				/**
				 * 不能同时设置访问器（get 和 set）和 writable 或 value，否则会报错误
				 * configurable 设为 true 才可以使用 delete
				 * */
				Object.defineProperty(this._value, topic, {
					enumerable: true
					, configurable: true
					// , value: value
					, set: (newVal)=>{
						this._trackData(topic, newVal);
					}
					, get: ()=>{
						return this._lastData( topic );
					}
				});

				this._trackData(topic, value);
			}

			result = Promise.resolve( true );
		}

		return result;
	}
	/**
	 * @summary 获取数据
	 * @param   {string|string[]} topic
	 * @param   {...string}
	 * @return  {Promise<*, null>}          返回一个 Promise 对象，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值，当传入多个参数时视为传入数组的操作
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
			if( topic in this._value ){
				result = Promise.resolve( this._value[topic] );
			}
			else{
				result = Promise.reject( null );
			}
		}
		
		return result;
	}
	/**
	 * @summary 将数据从缓存中删除
	 * @param   {string|string[]}           topic
	 * @param   {...string}
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    目前子类的实现中都调用了 super.removeData，若其它子类的实现中并没有调用，但需对数据监控，应在适当的时候调用 _trigger 方法
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
			try {
				// if( topic in this._value ){
				//
				// 	let t = this._value[topic]
				// 		;
				//
				// 	delete this._value[topic];
				//
				// 	this._trigger(topic, null, t);
				// }
				// else{   // model 中不存在该数据
				// 	this._trigger(topic, null, void 0);
				// }

				/**
				 * 取消使用 delete 删除属性值，而将值设置为 null
				 * */
				this._value = null;

				result = Promise.resolve( true );
			}
			catch(e){
				result = Promise.reject( e );
			}
		}

		return result;
	}
	/**
	 * @summary 清空数据
	 * @return  {Promise<boolean>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    清空操作将不触发监听事件
	 * */
	clearData(){
		Object.keys( this._value ).forEach((k)=>{
			let oldVal = this._lastData( k )
				;

			if( oldVal !== null ){
				this._history[k].push( null );
			}
		});

		this._value = {};

		return Promise.resolve( true );
	}

	/**
	 * @summary 绑定数据监视事件
	 * @param   {ModelChangeEvent}  callback
	 * @return  {Model}             返回 this
	 * */
	on(callback){
		this.$listener.on(this, this.config.eventType, callback);

		return this;
	}
	/**
	 * @summary 解除绑定数据监控回调函数
	 * @param   {ModelChangeEvent}  callback
	 * */
	off(callback){
		this.$listener.off(this, this.config.eventType, callback);

		return this;
	}

	/**
	 * @summary 将当前 model 的数据同步到其它 model
	 * @param   {Model|Model[]} model
	 * @return  {Model}         返回 this
	 * */
	syncTo(model){
		if( !Array.isArray(model) ){
			model = [model];
		}

		model.forEach((m)=>{
			if( Model.is( m )
				&& m !== this
				&& this._syncToList.indexOf( m ) === -1 ){
				
				this._syncToList.push( m );
			}
			else{   // 该实例类型已经存在
				log('该实例类型已经存在');
			}
		});

		return this;
	}
	/**
	 * @summary 清除数据同步
	 * @param   {Model} model
	 * @return  {Model} 返回 this
	 * */
	cleanSync(model){
		let i = this._syncToList.indexOf( model )
			;

		if( i !== -1 ){
			this._syncToList.splice(i, 1);
		}

		return this;
	}

	/**
	 * @summary toString 方法
	 * */
	toString(){
		return JSON.stringify( this._value );
	}
	/**
	 * @summary toJSON 方法
	 * @desc    JSON.stringify 序列化 Model 及子类的实例对象时调用
	 * */
	toJSON(){
		return this._value;
	}
	/**
	 * @summary 实现迭代器接口
	 * @return  {Array}
	 * @desc    适用于 for-of
	 * */
	*[Symbol.iterator](){
		let entries = Object.entries( this._value )
			;

		for(let i = 0, l = entries.length; i < l; i++){
			yield {
				topic: entries[i][0]
				, value: entries[i][1]
			};
		}
	}
	/**
	 * @summary 实现异步迭代器接口
	 * @return
	 * @desc    适用于 for-await-of
	 * */
	*[Symbol.asyncIterator](){
		let entries = Object.entries( this._value )
			;

		for(let i = 0, l = entries.length; i < l; i++){
			yield Promise.resolve({
				topic: entries[i][0]
				, value: entries[i][1]
			});
		}
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new Model() ); 时将返回 [object Model]
	 * */
	get [Symbol.toStringTag](){
		return 'Model';
	}
}

Model.use( Listener );

export default Model;