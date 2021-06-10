'use strict';

import Model from './model.js';
import merge from '../util/merge.js';
import log   from '../util/log.js';

function sqlTpl(strings, ...keys){
	return function(...values){
		let dict = values[values.length -1] || {}
			, result = [strings[0]]
			;

		keys.forEach((k, i)=>{
			let value = Number.isInteger(k) ? values[k] : dict[k]
				;

			result.push(value, strings[i +1]);
		});

		return result.join('');
	}
}

/**
 * 默认配置
 * @const
 * */
const WEB_SQL_MODEL_CONFIG = {
		dbName: 'storage'
		, tableName: 'storage'
		, dbVersion: 1
		// 数据库可用空间大小，如果指定太大，浏览器会提示用户是否允许使用这么多空间
		, dbSize: 2<<20
		, sql: {
			create:         sqlTpl`create table if not exists \`${'tableName'}\`(id integer primary key autoincrement,topic text unique,value text)`
			, select:       sqlTpl`select * from \`${'tableName'}\` where topic=?`
			, update:       sqlTpl`update \`${'tableName'}\` set value=? where topic=?`
			, insert:       sqlTpl`insert into \`${'tableName'}\`(topic,value) values(?,?)`
			, delete:       sqlTpl`delete from \`${'tableName'}\` where topic=?`
			, clear:        sqlTpl`delete from \`${'tableName'}\``
			, createIndex:  sqlTpl`create index if not exists index_${'col'} on \`${'tableName'}\`(\`${'col'}\`)`
		}
	}
	;

/**
 * @class
 * @desc    对 WebSQL Database 进行封装，统一调用接口，在 Model.factory 工厂方法注册为 webSQL，别名 ws,sql，将可以使用工厂方法生成。默认使用表名为 storage，有 id,topic,value 3 个列的表，在生成对象时传入 options 可覆盖默认 SQL 语句
 * @extends Model
 * @example
<pre>
let webSQLModel = new WebSQLModel()
	, storage = Model.factory('webSQL')
	, ws = Model.factory('ws')
	, sql = Model.factory('sql')
    , newSQL = Model.factory('webSQL', {
        tableName: 'newStorage'
    })
	;

newSQL.setData('index/data', {});   // newSQL 不会被缓存
</pre>
 * */
class WebSQLModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.dbName]
	 * @param   {string}    [config.tableName]
	 * @param   {number}    [config.dbVersion]
	 * @param   {number}    [config.dbSize] 单位字节
	 * @param   {Object}    [config.sql]
	 * @param   {string|Function}   [config.sql.create] 创建表时执行的 sql 语句
	 * @param   {string|Function}   [config.sql.select] 查询时执行的 sql 语句
	 * @param   {string|Function}   [config.sql.update] 更新时执行的 sql 语句
	 * @param   {string|Function}   [config.sql.insert] 插入时执行的 sql 语句
	 * @param   {string|Function}   [config.sql.delete] 删除时执行的 sql 语句
	 * @param   {string|Function}   [config.sql.clear]  clearData 时执行的 sql 语句
	 * @param   {string}            [config.eventType]
	 * @desc    自定义 sql 语句时，若动态可用可以设置为函数类型
	 * */
	constructor(config={}){
		config = merge(config, WebSQLModel.CONFIG);
		config.sql = merge(config.sql, WebSQLModel.CONFIG.sql);

		super( config );

		this._config = config;

		// this._store 为 Promise 类型，会在 resolve 中传入 db 实例，因为要保证数据表存在才可以操作
		this._store = new Promise((resolve, reject)=>{
			let db
				;

			if( !('openDatabase' in self) ){
				reject( new Error('此浏览器不支持 Web SQL Database') );

				return ;
			}

			// 打开数据库，若不存在则创建
			db = openDatabase(this._config.dbName, ''+ this._config.dbVersion, this._config.dbName, this._config.dbSize);

			// db.readTransaction()
			db.transaction((tx)=>{
				// 若没有数据表则创建
				tx.executeSql(this._transSql( this._config.sql.create ), [], ()=>{
					resolve( db );
				}, (tx, e)=>{
					log( e );
					reject( e );
				});
			}, reject, ()=>{
				resolve( db );
			});
		});
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $sql，配置参数名 sql
	 * */
	static inject(app){
		app.inject('$sql', new WebSQLModel( app.$options.sql ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return WEB_SQL_MODEL_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 替换表名
	 * @private
	 * @param   {string|Function}   sql
	 * @param   {Object}            [data={}]
	 * @return  {string}            替换完成的 sql 语句
	 * */
	_transSql(sql, data={}){
		if( typeof sql === 'function' ){
			return sql({
				tableName: this._config.tableName
				, ...data
			});
		}

		return sql;
	}
	/**
	 * @summary 通用执行 sql 方法
	 * @param   {string}    sql
	 * @param   {Array}     [value=[]]
	 * @param   {boolean}   [isRead]
	 * @return  {Promise<*, ErrorEvent>} 返回一个 Promise 对象，在 resolve 时传回 sql 语句的执行结果
	 * */
	_executeSql(sql, value=[], isRead=false){
		let transaction = isRead ? 'readTransaction' : 'transaction'
			;

		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				db[transaction]((tx)=>{
					tx.executeSql(sql, value, (tx, rs)=>{
						resolve( rs );
					}, (tx, e)=>{
						log( e );
						reject( e );
					});
				});
			});
		});
	}
	/**
	 * @summary 查询
	 * @private
	 * @param   {string}    topic
	 * @return  {Promise<string, ErrorEvent>}    返回一个 Promise 对象，在 resolve 时传回查询出来的数组
	 * */
	_select(topic){
		return this._executeSql(this._transSql( this._config.sql.select ), [topic], true).then((rs)=>{
			return rs.rows;
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @override
	 * @param   {string|Object} topic
	 * @param   {*}             value
	 * @return  {Promise<boolean>}   返回一个 Promise 对象，在 resolve 时传回影响行数的 boolean 值
	 * @desc    保持值得时候，同时会保持在内存中
	 * */
	setData(topic, value){
		let result
			;

		if( typeof topic === 'object' ){
			result = this._setByObject( topic );
		}
		else{
			result = this._select( topic ).then((rs)=>{
				let result
					;

				if( rs && rs.length ){    // topic 已存在
					result = this._executeSql(this._transSql(this._config.sql.update, value), [value, topic]).then((rs)=>{
						return !!rs.rowsAffected;
					});
				}
				else{
					result = this._executeSql(this._transSql(this._config.sql.insert, value), [topic, value]).then((rs)=>{
						return !!rs.insertId;
					});
				}

				super.setData(topic, value);

				return result;
			});
		}

		return result;
	}
	/**
	 * @summary 获取数据
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<*, null>}  返回一个 Promise 对象，若存在 topic 的值，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    获取数据时会优先从内存中取值，若没有则从 WebSQL Database 中取值并将其存入内存中，当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
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

				if( rs && rs.length ){
					// 只返回第一条数据
					value = rs[0].value;

					try{
						value = JSON.parse( value );
					}
					catch(e){}

					// 在内存中保留该值
					super.setData(topic, value);
				}
				else{
					value = Promise.reject( null );

					// 在内存中保留该值
					super.setData(topic, null);
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
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回影响行数的 boolean 值
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
			result = this._executeSql(this._transSql( this._config.sql.delete ), [topic]).then((rs)=>{
				return !!rs.rowsAffected;
			});

			super.removeData( topic );
		}

		return result;
	}
	/**
	 * @summary 清空数据
	 * @override
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回影响行数的 boolean 值
	 * */
	clearData(){
		super.clearData();

		return this._executeSql( this._transSql(this._config.sql.clear) ).then((rs)=>{
			return !!rs.rowsAffected;
		});
	}

	/**
	 * @summary 独立执行 sql 方法
	 * @param   {string}    sql
	 * @param   {Array}     [value=[]]
	 * @return  {Promise<*, ErrorEvent>} 返回一个 Promise 对象，在 resolve 时传回 sql 语句的执行结果
	 * */
	executeSql(sql, value=[]){
		return this._executeSql(sql, value);
	}
	/**
	 * @summary 针对某列建立索引
	 * @param   {string}    col
	 * @return  {Promise<boolean, ErrorEvent>}   返回一个 Promise 对象，在 resolve 时传回 sql 语句的执行结果
	 * */
	createIndex(col){
		return this._store.then((db)=>{
			return new Promise((resolve, reject)=>{
				db.transaction((tx)=>{
					let sql = this._config.sql.createIndex
						;

					if( typeof sql === 'function' ){
						sql = sql({
							tableName: this._config.tableName
							, col
						});
					}

					tx.executeSql(sql, [], (tx, rs)=>{
						resolve( !!rs.rowsAffected );
					}, (tx, e)=>{
						reject( e );
					});
				});
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
Model.register('webSQL', WebSQLModel);
/**
 * 注册别名
 * */
Model.registerAlias('webSQL', ['ws', 'sql']);

export default WebSQLModel;