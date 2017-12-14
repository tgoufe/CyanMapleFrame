import '../../src/pageComponent/head/index.js'
new Vue({
	el:'#main',
	data:{
		list:_.times(10)
	},
	methods:{
		change(){
			this.list=_.times(5,index=>index*2)
		}
	}
})