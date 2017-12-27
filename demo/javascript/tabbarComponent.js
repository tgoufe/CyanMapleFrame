import '../../src/pageComponent/head/index.js'
new Vue({
	el:'#main',
	data:{
		tabbarData:_.times(26,index=>{
			return {
				title:String.fromCharCode(index+97)
			}
		}),
		name:'sdf'
	},
	methods:{
		add(){
			this.tabbarData.push({
				title:'new Tab'
			})
		},
		extra(vm,item,index){
			console.log(vm,item,index)
		},
		navItem(){
			// console.log(arguments)
		},
		xxx(){
			// console.log(123)
		}
	}
})