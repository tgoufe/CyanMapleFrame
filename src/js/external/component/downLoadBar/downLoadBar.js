var tpl=require('./downLoadBar.html');
var Vue=require('vue');
module.exports=function(selector,options){
	var opts={
		el: selector,
		template:tpl,
		data:{
			isWeChart:false
		},
		methods:{
			downloadEvent:function(){
				alert(1)
			},
			WeChartEvent:function(){
				alert(2)
			}
		}
	}
	_.extend(opts.data,options.data)
	_.extend(opts.methods,options.methods)
	var vm=new Vue(opts)
	return vm;
}
