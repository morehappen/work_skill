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
            items: [{
                title: '你的名字',
                href: 'http://google.com',
                url: './sky2.jpg'
            }, {

                title: '我的名字',
                href: 'http://baidu.com',
                url: './sky1.jpg'
            }]
        };
    },
    watch: {},
    filters: {

    },
    methods: {

    }
});