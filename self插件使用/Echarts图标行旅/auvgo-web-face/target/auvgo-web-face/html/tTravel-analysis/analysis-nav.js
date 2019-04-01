//二级导航展开收起
(function () {
    $("body").on("click", ".ss-every-model", function () {
        var this_ = $(this),
            this_p = this_.parents("dl");
        this_p.parents(".second-side-nav").find("dl").not(this_p).find("dd").slideUp("fast").end().end().end().end().find("dd").slideToggle("fast");
        this_.parents(".second-side-nav").find("dl").not(this_p).find(".s-jt-bg").removeClass("icon-up-jt-second");
        this_.find(".s-jt-bg").toggleClass("icon-up-jt-second");
        console.log(2);
    });
    // var pathname = window.location.pathname,
    //     search = window.location.search.slice(1).split(";")[0];
    // $(".query_form").attr("action", pathname + "?" + search);
    function getCurrMonthDays() {
        var date = [];
        var start = moment().add('month', 0).format('YYYY-MM') + '-01';
        var end = moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD');
        date.push(start);
        date.push(end);
        return date;
    };

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
    $('.ranges_1 ul').remove();
    $('#daterange-btn').daterangepicker(
        {
            opens: "left",
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
            console.log(start.format('YYYY/MM/DD') + '-' + end.format('YYYY/MM/DD'));
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
    $('#daterange-btn span').html(moment().subtract(29, 'days').format('YYYY/MM/DD') + '-' + moment().format('YYYY/MM/DD'));


})();
(function () {
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
})();
