'use strict';

Vue.prototype.$ = $;
Vue.prototype.getUrlParam = function (name) {
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
            mint_startTime: '',
            mint_endTime: '',
            //【严重警告标记】这里有个技巧，即避免用户点击出来时间控件但是没有选择的问题
            // （限制为必须点击确定才能选择到时间）
            // 还有一个很重要的理念，就是在确定的时候，才去进行绑定时间的对象的实例化【本demo有两个时间，没有细致分开处理】
            sky_testTime_ctr: false
        };
    },

    watch: {},
    filters: {
        time_obj_string: function time_obj_string(value) {
            if (!value) {
                return "此处默认值（必填）";
            } else {
                return moment(value).format('YYYY-MM-DD HH:mm');
            }
        }
    },
    methods: {
        //打开日期插件
        togglePickerStart: function togglePickerStart() {
            var this_ = this;
            this_.$refs.picker_start.open();
        },
        togglePickerEnd: function togglePickerEnd() {
            var this_ = this;
            this_.$refs.picker_end.open();
        },
        //抓取起始时间的日期
        startTimeGet: function startTimeGet(value) {
            var this_ = this;
            this_.cleanSearchParam();
            var date = moment(value).format('YYYY/MM/DD HH:mm:ss');
            this_.mint_startTime = new Date(date)

        },
        //抓取结束时间的日期
        endTimeGet: function endTimeGet(value) {
            var this_ = this;
            var date = moment(value).format('YYYY/MM/DD HH:mm:ss');
            this_.mint_endTime = new Date(date);
        },

        //打开日期插件
        togglePickerStart: function togglePickerStart() {
            this.$refs.picker_start.open();
        },

        //抓取起始时间的日期
        startTimeGet: function startTimeGet(value) {
            var date = moment(value).format('YYYY/MM/DD HH:mm:ss');
            this.mint_startTime = new Date(date);
            var date1 = moment(value).format('YYYY/MM/DD HH:mm:ss');
            this.mint_endTime = new Date(date1);
        },
        cleanSearchParam: function cleanSearchParam() {
            var first_end_time = moment(new Date()).format('YYYY-MM-DD');
            this.mint_endTime = new Date(first_end_time.replace(/-/g, "/"));
            var first_start_time = moment(first_end_time).add('days', -90).format('YYYY-MM-DD');
            this.mint_startTime = new Date(first_start_time.replace(/-/g, "/"));
        },

    },
    mounted: function mounted() {
        var this_ = this;
    }
});