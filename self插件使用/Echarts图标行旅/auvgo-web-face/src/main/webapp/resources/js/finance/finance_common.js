// var startDate = $(".query_form .startDate");
// var endDate = $(".query_form .endDate");
// var startDateVal = '';
// var endDateVal = '';
// if (startDate.length > 0 && endDate.length > 0) {
//     startDateVal = startDate.val().replace(/-/g,"/");
//     endDateVal = endDate.val().replace(/-/g,"/");
// };
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
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    };
    var tag = $.getUrlParam("tag");
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




})();

//返回
function perCallBack() {
    window.location.href = "javascript:history.go(-1)";
}
