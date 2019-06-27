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
            value: '',
            // 默认数据
            defaultResult: [
                'Apple',
                'Banana',
                'Orange',
                'Durian',
                'Lemon',
                'Peach',
                'Cherry',
                'Berry',
                'Core',
                'Fig',
                'Haw',
                'Melon',
                'Plum',
                'Pear',
                'Peanut',
                'Other'
            ]
        }
    },
    watch: {},
    filters: {

    },
    methods: {

    },
    computed: {
        filterResult: function filterResult() {
            return this.defaultResult.filter(value => new RegExp(this.value, 'i').test(value));
        }
    },
    mounted: function mounted() {}
});