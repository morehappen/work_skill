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
            // 存放所选选项（字符串）
            value: "",
            // radio的选项
            options: [{
                    label: '被禁用',
                    value: '值F',
                    disabled: true
                },
                {
                    label: '南航MU5790<br>到达时间 10:35 2018/5/21',
                    value: '值A'
                },
                {
                    label: '选项B',
                    value: '值B'
                }
            ]
        };
    },

    watch: {},
    filters: {

    },
    methods: {
        check() {
            console.log(this.value)
        }
    }
});