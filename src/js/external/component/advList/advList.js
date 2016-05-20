var tpl=require('./advList.html');
var _=require('_');
var Vue=require('vue');
module.exports=function(selector,options){
	return new Vue(_.extend({
		el: selector,
		template:tpl
	},options))
}