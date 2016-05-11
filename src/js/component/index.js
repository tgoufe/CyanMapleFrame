var Vue = require('vue')
var _ = require('_');
var maple = require('../ns');
var Component = function(selector, options) {
	return new Component.prototype.privateInit(selector, options);
}
Component.prototype.privateInit = function(selector, options) {
	var list = document.querySelectorAll('selector');
	this.constructor.dataList[selector] = options;
	_.forEach(list, function(dom) {

	})
}
Component.pageData = {};
Component.dataList = {};
Component.init = function(url) {
	var _this=this;
	var allTag = document.querySelectorAll('*');
	var allTagLen = allTag.length;
	var i = 0;
	var htmlTagReg = /^(a|abbr|acronym|address|applet|area|b|base|basefont|bdo|big|blockquote|body|br|button|caption|center|cite|code|col|colgroup|dd|del|dfn|dir|div|dl|dt|em|fieldset|font|form|frame|frameset|head|h1> - <h6|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|map|menu|meta|noframes|noscript|object|ol|optgroup|option|p|param|pre|q|s|samp|script|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|tt|u|ul|var)$/i;
	while (allTag[i++]) {
		if (!allTag[i - 1].tagName.match(htmlTagReg) && !_this.dataList[allTag[i - 1].tagName]) {
			_this.dataList[allTag[i - 1].tagName] = {}
		}
	}
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var resp = request.responseText;
			_this.pageData = typeof resp == 'string' ? (new Function('return ' + resp + ';'))() : resp;
		} else {
			// We reached our target server, but it returned an error
		}
	};
	request.onerror = function() {
		_this.pageData.SLIDER.data = [{
				imageUrl: 'http://test.image.51tiangou.com/product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG'
		}, {
			imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
		}]
	};
	request.send();
}
Component.prototype.privateInit.prototype = Component.prototype;
module.exports = maple.component = Component;