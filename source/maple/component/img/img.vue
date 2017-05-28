<template>
<img class="cmui-img" :src="realSrc" alt="" @click="imgClick()"/>
</template>
<script>
import imageLazyLoad from './imageLazyLoad';
var preViewVMList={}
export default {
        props:{
            src:{type:String},
            lazyLoad:{type:Boolean,default:false},
            preView:{type:Boolean,default:false},
            preViewList:{type:Array,default:[]},
            preViewOptions:{type:Object},
            target: {type:Object}
        },
        computed:{
            realSrc:function(){
                if(this.lazyLoad){
                    return 'http://img.zcool.cn/community/01443f564897a432f87512f6eed753.gif'
                }else{
                    return this.src;
                }
            }
        },
        ready:function(){
            imageLazyLoad.call(this)
        },
        methods:{
            imgClick:function(){
                var _this=this;
                if(this.preView){
                    var preViewTpl='';
                    var preViewTplId='preView_'+(Math.random()*1000|0);
                    preViewTpl+='<div class="fixed-full bg-black" id="'+preViewTplId+'"style="z-index:9;">';
                    preViewTpl+='    <cmui-slider :items="preViewList_temp" :auto="0" :options="'+this.preViewOptions+'" :loop="preViewList_temp.length>1">';
                    preViewTpl+='        <cmui-slider-item v-for="item in preViewList_temp" >';
                    preViewTpl+='            <img :src="item" alt="" @click="preViewListClick()">';
                    preViewTpl+='        </cmui-slider-item>';
                    preViewTpl+='    </cmui-slider>';
                    preViewTpl+='</div>';
                    $('body').append(preViewTpl);
                    var inSlider=this.$parent.constructor.name=='CmuiSliderItem'
                    preViewVMList[preViewTplId]=new Vue({
                        el:'#'+preViewTplId,
                        data:{
                            preViewList_temp:this.preViewList.length?this.preViewList:[this.src]
                        },
                        methods:{
                            preViewListClick:function(){
                                $(this.$el).remove();
                            }
                        }
                    })
                    var $cmuiSlider=$(preViewVMList[preViewTplId].$el).find('>.cmui-slider');
                    $cmuiSlider.css('margin-top',(index,num)=>{
                        return (document.documentElement.clientHeight-$cmuiSlider.height())/2
                    });
                }
            }
        },
        events:{
            pageScroll:function(){
                imageLazyLoad.call(this)
            }
        }
};
</script>
