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
            slots: [{
                divider: true, //是不是分割符
                flex: 1,
                content: '到达后', //中部类名
                className: 'slot1', //左侧类名
                textAlign: 'right' //文本居中控制
            }, {
                values: ['10', '20', '30', '40', '50', '60'],

                className: 'slot2'
            }, {
                divider: true, //是不是分割符
                flex: 1,
                content: '分钟', //中部类名
                className: 'slot3', //右侧类名
                textAlign: 'left'
            }],
            slotsAPI_DEMO: [{
                flex: 1,
                values: ['2015-01', '2015-02', '2015-03', '2015-04', '2015-05', '2015-06'],
                className: 'slot1', //左侧类名
                textAlign: 'right' //文本居中控制
            }, {
                divider: true, //是不是分割符
                content: '索尼', //中部类名
                className: 'slot2'
            }, {
                flex: 1,
                values: ['2015-01', '2015-02', '2015-03', '2015-04', '2015-05', '2015-06'],
                className: 'slot3', //右侧类名
                textAlign: 'left'
            }],
            simple: [{
                flex: 1,
                values: ['我要退票', '就是要退票', '测试退票'],
                className: 'slot1', //左侧类名
                textAlign: 'center' //文本居中控制
            }],
        };
    },

    watch: {},
    filters: {

    },
    methods: {
        onValuesChange(picker, values) {
            if (values[0] > values[1]) {
                picker.setSlotValue(1, values[0]);
            }
        }
    },
    mounted: function mounted() {

    }
});