var tpl=require('./headBar.html');
var _=require('_');
var Vue=require('vue');
module.exports=function(selector,options){
	return new Vue(_.extend({
		el: selector,
		template:tpl,
		data:{
			leftHtml:'<i class="icon-back fs-20"></i>',
			centerHtml:'天狗网',
			rightHtml:'...'
		},
		methods:{
			leftEvent:function(data){
				window.history.back();
			},
			centerEvent:function(data){

			},
			rightEvent:function(data){

			}
		}
	},options))
}