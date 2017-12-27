<template>
	<div class="cmui-tabbar-item" @click="itemEvent()" :style="itemStyle" :class="itemClass">
		<div class="cmui-tabbar-item-container">
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
				this.$emit('item-event',this,index,preIndex);
			}
		},
		data:function(){
			var isFlex=!!(this.$parent.realCol==='flex');
			var itemList=this.$parent.$children.filter(item=>item.$options._componentTag==='cmui-tabbar-item')
			var index=_.findIndex(itemList,this);
			var itemClass={
				'flex1':isFlex,
				'cmui-tabbar-item-active':index===this.$parent.activeIndex
			};
			var itemStyle={
				width:this.$parent.itemWidth
			};
			console.log(this.tabBarRoot)
			return {
				isFlex,
				itemClass,
				itemStyle,
				index
			}
		}
	}
</script>