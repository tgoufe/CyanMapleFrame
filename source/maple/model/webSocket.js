'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

/**
 * @class
 * @classdesc   WebSocket 接口，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 webSocket，别名 socket，将可以使用工厂方法生成
 * @extends     Model
 * */
class WebSocketModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, WebSocketModel._CONFIG);
	}
}

/**
 * 默认配置
 * @static
 * */
WebSocketModel._CONFIG = {

};

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('webSocket', WebSocketModel);
/**
 * 注册别名
 * */
Model.registerAlias('webSocket', 'socket');

export default WebSocketModel;