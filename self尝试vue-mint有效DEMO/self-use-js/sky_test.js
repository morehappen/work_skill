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
            mint_startTime: '',
            mint_endTime: '',
        };
    },

    watch: {},
    filters: {
        time_obj_string: function time_obj_string(value) {
            return moment(value).format('YYYY-MM-DD');
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
        this_.cleanSearchParam();
    }
});