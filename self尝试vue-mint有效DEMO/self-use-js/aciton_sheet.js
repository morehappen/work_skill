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
            // action sheet 选项内容
            sheetData: [{
                name: '拍照',
                method: this.sky1 // 调用methods中的函数
            }, {
                name: '从相册中选择',
                method: this.sky2 // 调用methods中的函数
            }, {
                name: '从相册中选择2',
                method: this.sky3 // 调用methods中的函数
            }],
            // action sheet 默认不显示，为false。操作sheetVisible可以控制显示与隐藏
            sheetVisible: false
        }
    },
    watch: {},
    filters: {

    },
    methods: {
        actionSheet: function() {
            // 打开action sheet
            this.sheetVisible = true;
        },
        sky1() {
            console.log("sky1")
        },
        sky2() {
            console.log("sky2")
        },
        sky3() {
            console.log("sky3")
        },
    },
    mounted: function mounted() {

    }
});