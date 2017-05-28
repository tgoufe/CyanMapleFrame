export default function imageLazyLoad(){
    if(this.lazyLoad){
        var el=this.$el;
        var elTop=el.y;
        var htmlBottomPosition=document.body.scrollTop+document.documentElement.clientHeight;
        if(htmlBottomPosition>elTop){
            this.lazyLoad=false;
        }
    }
}