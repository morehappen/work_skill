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
            hourglass_value_show: "展示区",
            popupVisible: false,
            slots: [{
                divider: true, //是不是分割符
                flex: 1,
                content: '到达后', //中部类名
                className: 'slot1', //左侧类名
                textAlign: 'right' //文本居中控制
            }, {
                values: ['10', '20', '30', '40', '50', '60'],
                defaultIndex: 2, //【标记】展示默认值。
                className: 'slot2'
            }, {
                divider: true, //是不是分割符
                flex: 1,
                content: '分钟', //中部类名
                className: 'slot3', //右侧类名
                textAlign: 'left'
            }]
        };
    },

    watch: {},
    filters: {

    },
    methods: {
        //沙漏选择完毕回调事件控制
        hourglass_sure: function hourglass_sure() {
            //抓取已经选择的默认值，注意，glass_ref这个标记refs的放置是必须的
            this.hourglass_value_show = "航班到达后   " + this.$refs.glass_ref.getValues()[0] + "分钟 上车";
            this.popupVisible = false;
        },
        show_pop: function show_pop() {
            var this_ = this;
            this_.popupVisible = true
        }
    }
});