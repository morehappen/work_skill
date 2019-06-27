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
            sky_modelTime: '',
            sky_showTime: '',
            sky_startTime: "",
            sky_endTime: ""
        };
    },

    watch: {},
    filters: {
        time_obj_string: function time_obj_string(value) {
            if (!value) {
                return "初始无值"
            } else {
                return moment(value).format('YYYY-MM-DD');
            }
        }
    },
    methods: {
        //打开自定义日期插件
        togglePickerSky: function togglePickerStart() {
            let this_ = this;
            if (!this_.sky_showTime) {
                this_.cleanSearchParam();
            } else {
                this_.syncShowTime();
            }
            this_.$refs.picker_sky_test.open();
        },

        //抓取自定义时间的日期[确定按钮]
        sky_modelTimeGet: function sky_modelTimeGet(value) {
            let this_ = this;
            let date = moment(value).format('YYYY/MM/DD HH:mm');
            this_.sky_showTime = new Date(date);
            this_.sky_modelTime = "";
            this_.$refs.picker_sky_test.close();
            // this.year = value.getFullYear();
            // this.month = value.getMonth() + 1;
            // this.date = value.getDate();
            // this.hours = value.getHours();
            // this.minutes = value.getMinutes();
        },
        sky_modelTimeCancle: function sky_modelTimeCancle() {
            let this_ = this;
            this_.sky_modelTime = "";
            this_.$refs.picker_sky_test.close();
        },
        //初始空白时候将日期插件赋值
        cleanSearchParam: function cleanSearchParam() {
            //自定义日期插件代码
            var this_ = this;
            let sky_modelTime = moment(new Date()).format('YYYY-MM-DD HH:mm');
            //左极值获取
            let sky_start_time = moment(new Date()).format('YYYY-MM-DD HH:mm');
            //右极值获取
            let sky_end_time = moment(new Date()).set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 59
            }).add('days', 2).format('YYYY-MM-DD HH:mm');
            //将日期插件绑定值转换
            this_.sky_modelTime = new Date(sky_modelTime.replace(/-/g, "/"));
            //将日期插件左极值转换
            this_.sky_startTime = new Date(sky_start_time.replace(/-/g, "/"));
            //将日期插件右极值转换
            this_.sky_endTime = new Date(sky_end_time.replace(/-/g, "/"));
        },
        //showtime有值，日期插件同步该值
        syncShowTime: function syncShowTime() {
            var this_ = this;
            this_.sky_modelTime = "";
            // 分割线
            let sky_modelTime = moment(this_.sky_showTime).format('YYYY-MM-DD HH:mm');
            debugger
            //左极值获取
            let sky_start_time = moment(new Date()).format('YYYY-MM-DD HH:mm');
            //右极值获取
            let sky_end_time = moment(new Date()).set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 59
            }).add('days', 2).format('YYYY-MM-DD HH:mm');
            //将日期插件绑定值转换
            this_.sky_modelTime = new Date(sky_modelTime.replace(/-/g, "/"));
            //将日期插件左极值转换
            this_.sky_startTime = new Date(sky_start_time.replace(/-/g, "/"));
            //将日期插件右极值转换
            this_.sky_endTime = new Date(sky_end_time.replace(/-/g, "/"));
        }
    },
    mounted: function mounted() {
        var this_ = this;
    }
});