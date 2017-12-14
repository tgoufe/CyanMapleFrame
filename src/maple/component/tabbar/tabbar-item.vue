<template>
	<div class="cmui-tabbar-item" @click="itemEvent()" :style="itemStyle" >
		<div class="cmui-tabbar-item-container" :class="itemClass">
			<slot></slot>
		</div>
	</div>
</template>
<style lang="scss">
	.cmui-tabbar-item{
		font-size:initial
	}
</style>
<script>
	export default{
		name:'cmui-tabbar-item',
		props:{
			target:Object
		},
		methods:{
			itemEvent(item){
				var itemList=this.$parent.$children.filter(item=>item.$options._componentTag==='cmui-tabbar-item')
				var index=_.findIndex(itemList,this);
				var preIndex=this.$parent.activeIndex;
				this.$parent.activeIndex=index;
				this.$emit('tabBarItemEvent',this,index,preIndex);
			}
		},
		data:function(){
			var isFlex=!!(this.$parent.realCol==='flex');
			var itemClass={
				'flex1':isFlex,
				'cmui-tabbar-item-active':this.index===this.$parent.activeIndex
			};
			var itemStyle={
				width:this.$parent.itemWidth
			};
			return {
				isFlex,
				itemClass,
				itemStyle
			}
		}
	}
</script>