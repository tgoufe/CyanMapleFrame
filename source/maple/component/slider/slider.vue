<template>
	<div class="cmui-slider">
		<div class="swiper-container" >
			<div class="swiper-wrapper">
				<slot></slot>
			</div>
		    <div class="pagination"></div>
		</div>
	</div>
</template>
<script>

import Swiper from '../../lib/swiper/swiper';
import thememaker from './themeMaker';
export default {
	created:function(){
		var _this=this;
		setTimeout(function(){
			if(_this.items&&_this.items.length>1){
				_this.swiper=new Swiper($('.swiper-container',_this.$el), thememaker.call(_this));
			}
		}, 0);
	},
    watch:{
		items:function(newData,oldData){
			var _this=this;
			this.swiper && this.swiper.destroy(false, true);
			if( !(newData && oldData && newData.length === oldData.length) ){
				$(_this.$el).find('.pagination').empty();
			}
			setTimeout(function(){
				if(_this.items&&_this.items.length>1){
					_this.swiper=new Swiper($('.swiper-container',_this.$el), thememaker.call(_this));
				}
			}, 0);
		}
	},
	methods: {
		itemEvent: function(index, data) {
			this.$dispatch('itemEvent', this, index, data)
		}
	},
	props:{
		items: {type: Array},
		theme:{type:Number},
		col:{type:Number},
		span:{type:Number},
		space:{type:Number},
		auto:{type:Number},
		loop:{type:Boolean},
		autoplayDisable:{type:Boolean},
		target: {type:Object},
		autoHeight:{type:Boolean,default:false},
		options:{type:Object}
	}
};
</script>
<style>
@import '../../lib/swiper/swiper.css';
.swiper-pagination-bullet {
	border:0;
}
</style>
