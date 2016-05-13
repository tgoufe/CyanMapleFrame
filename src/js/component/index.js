var Vue = require('vue')
var _ = require('_');
var maple = require('../ns');
var Component = function(selector, options) {
	return new Component.prototype.privateInit(selector, options);
}
Component.prototype.privateInit = function(com, options) {
	var needNode=arguments[2]||true;
	var el=typeof options=='string'?options:options.el;
	options=typeof options=='object'?options:{};
	var vm=com(el,options);
	if(needNode){
		if(!options.data||options.dataSource){
			this.constructor.sendList.push(el)
			this.constructor.componentList[el]=vm;
		}
	}
}
Component.componentList={};
Component.sendList=[];
Component.init = function(url) {
	var _this=this;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var resp = request.responseText;
			resp = typeof resp == 'string' ? (new Function('return ' + resp + ';'))() : resp;
			for(var i in resp){
				_this.componentList[i].$data=json[i]
			}
		} else {
			// We reached our target server, but it returned an error
		}
	};
	request.onerror = function() {
		var json = {
			"maple-slider":{
				itemList: [{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG'
				}, {
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				}]
			},
			"#test1":{
				itemList:[{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG'
				}, {
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				},{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				}]
			}
		}
		for(var i in json){
			_this.componentList[i].$data=json[i]
		}
	};
	request.send();
}
Component.load=function(com){
	this.componentList.push(com);
}
Component.prototype.privateInit.prototype = Component.prototype;
module.exports = maple.component = Component;