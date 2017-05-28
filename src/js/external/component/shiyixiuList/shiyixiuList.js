var tpl=require('./shiyixiulist.html');
var _=require('_');
var Vue=require('vue');
Vue.filter('pickzhuti',function(value){
	return value.replace(/#(.*?)#/g, '<span class="text-red">#$1#</span>')
})
module.exports=function(selector,options){
	return new Vue(_.extend({
		el: selector,
		template:tpl,
		methods:{
			toupiao:function(index,data){
				if(data.itemList[index].hasFlower){
					alert("已经给"+data.itemList[index].memberId+"投票过了不能重复投票")
				}else{
					alert("给"+data.itemList[index].memberId+"投票成功")
					data.itemList[index].hasFlower=true;
					data.itemList[index].flowerCount+=1;
				}
			}
		}
	},options)) 
}