'use strict';

Vue.prototype.$ = $;
Vue.prototype.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
};
var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            msg: '猥琐发育，别浪~',
            intervalId: null
        };
    },
    watch: {},
    filters: {

    },
    methods: {
        lang() { // 为了不重复执行走马灯，我们需要进行判断，如果为null，则执行走马灯，否则不执行
            if (null != this.intervalId) return;
            this.intervalId = setInterval(() => {     
                var start = this.msg.substring(0, 1);    // 获取到 后面的所有字符
                var end = this.msg.substring(1);    // 将字符串拼接
                this.msg = end + start;   
            }, 400)            
        },
        stop() {
            clearInterval(this.intervalId); // 每当清除了id，需要将id重新赋值为null
            this.intervalId = null;            
        }

    }
});