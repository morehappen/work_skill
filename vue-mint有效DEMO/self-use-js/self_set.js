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
            timeType: "book",
            sky_testTime: '',
            sky_startTime: "",
            sky_endTime: ""
        };
    },

    watch: {},
    filters: {
        time_obj_string: function time_obj_string(value) {
            return moment(value).format('YYYY-MM-DD');
        }
    },
    methods: {
        //打开自定义日期插件
        togglePickerSky: function togglePickerStart() {
            let this_ = this;
            this_.$refs.picker_sky_test.open();
        },

        //抓取自定义时间的日期
        sky_testTimeGet: function sky_testTimeGet(value) {
            let this_ = this;
            let date = moment(value).format('YYYY/MM/DD HH:mm');
            this_.sky_testTime = new Date(date);
            // this.year = value.getFullYear();
            // this.month = value.getMonth() + 1;
            // this.date = value.getDate();
            // this.hours = value.getHours();
            // this.minutes = value.getMinutes();
        },

        cleanSearchParam: function cleanSearchParam() {
            //自定义日期插件代码
            var this_ = this;
            let sky_testTime = moment(new Date()).format('YYYY-MM-DD HH:mm');
            let sky_start_time = moment(new Date()).format('YYYY-MM-DD HH:mm');
            let sky_end_time = moment(new Date()).set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 59
            }).add('days', 2).format('YYYY-MM-DD HH:mm');
            this_.sky_testTime = new Date(sky_testTime.replace(/-/g, "/"));
            this_.sky_startTime = new Date(sky_start_time.replace(/-/g, "/"));
            this_.sky_endTime = new Date(sky_end_time.replace(/-/g, "/"));
        },

    },
    mounted: function mounted() {
        var this_ = this;
        this_.cleanSearchParam();
    }
});