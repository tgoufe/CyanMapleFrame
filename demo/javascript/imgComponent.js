import '../../src/pageComponent/head/index.js'
window.vm=new Vue({
	el:'#main',
	data:{
		list:_.times(30,index=>{
			return {
				url:'../img/400-400-'+(index+1)+'.jpg'
			}
		})
	},
	methods:{
		imgClick(){
			console.log(123)
		}
	}
})