<template>
<div class="cmui-list-item" v-bind:class="[itemClass,paddingClass]" v-bind:style="{'clear':clear}">
  <slot></slot>
</div>
</template>
<script>
function getClassListByColList(colList){
	var total=colList.reduce((pre,next)=>pre+next);
	if(total%2==0||total%3==0){
		return colList.map(item=>'box-span'+parseInt(12/total*item))
	}else if(total%5==0){
		return colList.map(item=>'box-col'+parseInt(15/total*item))
	}else{
		return ['box-span12']
	}
}

export default {
	computed:{
	    itemClass:function(){
        	if(typeof this.$parent.col=='number'){
    	        switch(this.$parent.col){
    	            case 2:
    	             return 'box-span6';
    	            case 3:
    	             return 'box-span4';
    	            case 4:
    	             return 'box-span3';
    	            case 5:
    	             return 'box-col3';
    	            case 6:
    	             return 'box-span2';
    	            default:
    	            return 'box-span12';
    	        }
        	}else if(
        		(Object.prototype.toString.call(this.$parent.col)=='[object Array]')
        		&&this.$parent.col.every(item=>item==parseInt(item))
        		){
        		const rs=this.$parent.$children.filter(item=>item.$options._componentTag=="cmui-list-item")
        		const i=_.findIndex(rs,this)%this.$parent.col.length;
        		return getClassListByColList(this.$parent.col)[i]
        	}else{
        		return 'box-span12'
        	}
	    },
	    paddingClass:function(){
	    	return 'paddingr'+this.$parent.spaceName
	    },
        clear(){
            const rs=this.$parent.$children.filter(item=>item.$options._componentTag=="cmui-list-item")
            const i=_.findIndex(rs,this);
            console.log(this)
            return i%(this.$parent.col.length||this.$parent.col)==0?'left':''
        }
	}
};

</script>
