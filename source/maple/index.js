import maple from './core';
import {cookie} from './cache/cookie';
import {sessionData} from './cache/session';
import {localData} from './cache/local';
import * as util from './util';
import * as support from './support';
import url from './url';
import log from './log';
import load from './load';
import scrollBar from './scroll_bar';
import device from './device';
import vm from './vm';
import component from './component';
import alert from './ui/alert/index.js';
import confirm from './ui/confirm/index.js';
import notice from './ui/notice/index.js';
import cutImage from './ui/cutImage.js';

//挂载工具方法
maple._ = util;
maple.util = util;
//挂载支持
maple.support = support;
//挂载cookie
maple.cookie = cookie;
//挂载localStorage
maple.localData = localData;
//挂载sessionStorage
maple.sessionData = sessionData;
//挂载url处理方法
maple.url = url;
//挂载console.log
maple.log = log;
//挂载load
maple.load = load;
//挂载滚动事件
maple.scrollBar = scrollBar;
//挂载设备信息
maple.device = device;
//挂载vm控制器
maple.vm = vm;


maple.notice = notice;
maple.alert = alert;
maple.confirm = confirm;


// 初始化通用组件
Object.keys( component ).forEach(d => Vue.component(d, component[d]));
export default window.maple = maple;