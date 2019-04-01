
var startDate = $(".query_form .startDate");
var endDate = $(".query_form .endDate");
var startDateVal = '';
var endDateVal = '';
if (startDate.length > 0 && endDate.length > 0) {
    startDateVal = startDate.val().replace(/-/g,"/");
    endDateVal = endDate.val().replace(/-/g,"/");
};
// function valueReturn() {
//
// }
(function () {
    //左侧导航栏的悬停事件
    $(".ss-link").hover(function () {
        var tag = window.location.search.split("?")[1].split("&")[0].split("=")[1];
        if (($(this).attr("data-tag").toString()) != tag) {
            $(this).addClass("target");
        }
    }, function () {
        var tag = window.location.search.split("?")[1].split("&")[0].split("=")[1];
        if (($(this).attr("data-tag").toString()) != tag) {
            $(this).removeClass("target");
        }
    });

    // 结束时间回显问题
    (function reShow() {

        var $LTEdate = $('#LTE_date');
        if ($LTEdate.val() && $LTEdate.val().length > 10) {
            var reShowStr = $LTEdate.val().substr(0, 10);
            $LTEdate.val(reShowStr);
        }

    })();
    //左侧导航默认激活

    var pathname = window.location.pathname,
        search = window.location.search,
        tag = search.slice(1).split(";")[0].split("=")[1],
        href = pathname + search;
    $(".s-jt-bg").removeClass("icon-up-jt-second");

    $(".second-side-nav a[data-tag='" + tag + "']").addClass("target").parents("dl").find("dd").show();
    $(".second-side-nav a[data-tag='" + tag + "']").parents("dl").find("dt").find(".s-jt-bg").addClass("icon-up-jt-second");
    $(".tab-model a[href='" + href + "']").addClass("tab-target");
    //icon-down-jt-second
    //订单详情跳转链接
    $("body").on("click", ".orderToDetail", {flag: $(".tab-model .tab-target ").attr("data-flag")}, detailHref);

    //订单详情跳转链接主函数
    function detailHref(e) {
        window.location.href = $(this).attr("data-href_") + "?flag=" + e.data.flag;
    }


    // var pathname = window.location.pathname,
    //     search = window.location.search.slice(1).split(";")[0];
    // $(".query_form").attr("action", pathname + "?" + search);

    /*粉色按钮点击事件*/
    $('.pink-btn').toggle(function () {
        $('.aggr-table').stop().slideUp(300);
        $(this).addClass('clickUp');
    }, function () {
        $('.aggr-table').stop().slideDown(300);
        $(this).removeClass('clickUp');
    });


    /*粉色按钮点击事件*/
    $('.pink-btn').toggle(function () {
        $('.aggr-table').stop().slideUp(300);
        $(this).addClass('clickUp');
    }, function () {
        $('.aggr-table').stop().slideDown(300);
        $(this).removeClass('clickUp');
    });

    //控制当月的选定
    function getCurrMonthDays() {
        var date = [];
        var start = moment().add('month', 0).format('YYYY-MM') + '-01';
        var end = moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD');
        date.push(start);
        date.push(end);
        return date;
    };

    //控制去年的选定
    function lastYear() {
        var date = [];
        // var start = moment().add(1, 'year').add(0, 'month').add(0, 'days').format('YYYY-MM') + '-01';
        var start = moment().add('year', '-1').startOf('year').format('YYYY-MM-DD');
        // var end = moment(start).add('year', 1).format('YYYY-MM-DD');
        var end = moment(start).endOf('year').format('YYYY-MM-DD');
        // var end = moment.duration().asYears(1).format('YYYY-MM-DD');
        date.push(start);
        date.push(end);
        return date;
    };
    //此行代码暂时不用
    // $('.ranges_1 ul').remove();
    //日期插件初始化
    setTimeout(function(){
        $('#daterange-btn').daterangepicker(
            {
                opens: "center",
                autoUpdateInput: true,
                dateLimit: {
                    days: 730
                }, //起止时间的最大间隔
                ranges: {
                    '全部': [moment(), moment().subtract(-1, 'days')],
                    '当月': getCurrMonthDays(),
                    // '未来30天': [moment(), moment().subtract(-29, 'days')],
                    // '上一年': [moment().subtract(365, 'days'), moment(),],
                    '上一年': lastYear()

                },
                startDate: moment().subtract(29, 'days'),
                endDate: moment(),
                // minDate:moment().add(-92,'days'),
                maxDate: moment()
            },
            function (start, end, label) {
                //label:通过它来知道用户选择的是什么，传给后台进行相应的展示
                //console.log(label)
                //设置外部变量，抓取每次点击的变量
                var res_time = start.format('YYYY/MM/DD') + '-' + end.format('YYYY/MM/DD');

                if (startDate.length > 0 && endDate.length > 0) {
                    startDate.val(start.format('YYYY-MM-DD'));
                    endDate.val(end.format('YYYY-MM-DD'));
                }
                console.log(res_time);
                if (label == '全部') {
                    $('#daterange-btn span').html('全部');
                } else if (label == '今天') {
                    $('#daterange-btn span').html(end.format('YYYY/MM/DD'));
                } else if (label == '明天') {
                    $('#daterange-btn span').html(start.format('YYYY/MM/DD'));
                } else if (label == '未来七天') {
                    $('#daterange-btn span').html(start.format('YYYY/MM/DD') + '-' + end.format('YYYY/MM/DD'));
                } else if (label == '上一年') {
                    $('#daterange-btn span').html(start.format('YYYY/MM/DD') + '-' + end.format('YYYY/MM/DD'));
                } else if (label == '当月') {
                    $('#daterange-btn span').html(start.format('YYYY/MM/DD') + '-' + end.format('YYYY/MM/DD'));
                }
            }
        );
    },1000);
    //手动默认日期选择
    if (startDateVal.length > 0 && endDateVal.length > 0) {
        $('#daterange-btn span').html(startDateVal + '-' + endDateVal);
    } else {
        $('#daterange-btn span').html(moment().subtract(29, 'days').format('YYYY/MM/DD') + '-' + moment().format('YYYY/MM/DD'));
        startDate.val(moment().subtract(29, 'days').format('YYYY-MM-DD'));
        endDate.val(moment().format('YYYY-MM-DD'));
    }
})();

//返回
function perCallBack() {
    window.location.href = "javascript:history.go(-1)";
}
