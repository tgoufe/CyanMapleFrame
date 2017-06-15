<template>
<div class="cmui-list overflow-xh">
	<div class="clearfix" :class="'marginr-n'+spaceName">
		<slot></slot>
	</div>
</div>
</template>
<script>
import listList from './listList';
export default {
	props:{
	    col:{type:[Number,Array]},
	    space:{type:Number},
	    target: {type:Object}
	},
	computed:{
	    spaceName:function(){
	        if(this.space%10==0&&this.space<51&&this.space>-1){
	            return this.space;
	        }
	        else{
	            return 20
	        }
	    }
	},
	mounted(){
		listList.add($(this.$el))
	}
};
</script>
