<template>
	<div class="cmui-tabbar">
		<div class="cmui-tabbar-container" :class="containerClass">
			<slot></slot>
		</div>
	</div>
</template>
<style lang="scss">
	
</style>
<script>
	export default{
		name:'tabbar',
		props:{
			col:{type:[String,Number],default:'auto'}
		},
		data:function(){
			return {
				activeIndex:0
			}
		},
		computed:{
			realCol(){
				if(_.isString(this.col)){
					if(this.col==='auto'||this.col==='flex'){
						return this.col;
					}else{
						return 'auto';
					}
				}else if(_.isNumber(this.col)){
					return this.col;
				}else{
					return 'auto'
				}
			},
			itemWidth(){
				if(_.isNumber(this.col)){
					return 100/this.col+'%';
				}
			},
			containerClass(){
				var rs={}
				if(this.realCol==='flex'){
					rs['flex-container']=true
				};
				if(this.realCol==='auto'||typeof this.realCol==='number'){
					rs['scroll-container']=true
				}
				return rs
			}
		}
	}
</script>