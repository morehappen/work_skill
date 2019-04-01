$(function() {
    /*导航栏效果开始*/
    $(".navLink").each(function() {
        $(this).click(function() {
            if ($(this).siblings("ul").css("display") == "none") {
                $(this).siblings("ul").slideDown();
                $(this).parent().siblings("li").children("ul").slideUp();
            } else {
                $(this).siblings("ul").slideUp();
            }
        });
    });
    var cLeft;
    var cWidth;
    /*鼠标滑过顶部菜单切换active*/
    $(".nav-center li").mouseover(function() {
        // var navBlueWidth = $(this).width();
        //此处控制顶部的nav子选项的底部的下划线。
        // $(this).append('<div class="blueLine" style="position:absolute;height:2px;bottom:0;left:15px;background:#4289e9;width:' + navBlueWidth + 'px"></div>');
        // $(this).siblings("li").children(".blueLine").remove();
        // $(this).addClass("active").siblings("li").removeClass("active");
    });

    /*鼠标滑过菜单详情下拉展示*/
    var timerMenu = null;
    $(".nav-center .detailUl").each(function() {
        $(this).mouseenter(function() {
            var index = $(this).index('.detailUl');
            timerMenu = setTimeout(function() {
                if ($("#detailList").css("display") == "none") {
                    $("#detailList").slideDown(function() {
                        cWidth = $(".detail-large .con").eq(index).width();
                        cLeft = $(".detail-large .con").eq(index).offset().left - $(".detail-large .container").offset().left;
                        $(".triangle-box").animate({ "left": cLeft, "width": cWidth }, "1s");

                    });
                    $(".nav_wapper").removeClass("opacity35").addClass("opacity90");
                    $("nav").mouseleave(function() {
                        $("#detailList").slideUp();
                        clearTimeout(timerMenu);
                        $(".nav-center li").children(".blueLine").remove();
                        $(".nav_wapper").removeClass("opacity90").addClass("opacity35");
                    });
                    $("#detailList container>div").mouseenter(function() {
                        $("#detailList").show();
                    });
                } else {
                    cWidth = $(".detail-large .con").eq(index).width();
                    cLeft = $(".detail-large .con").eq(index).offset().left - $(".detail-large .container").offset().left;
                    $(".triangle-box").stop().animate({ "left": cLeft, "width": cWidth }, "1s");
                }
            }, 60);
        });
    });
    /*菜单详情部分鼠标滑过效果*/
    var timer = null;
    $(".detail-large .con").on('mouseenter', function() {
        var _this = $(this);
        timer = setTimeout(function() {
            var leftCon = _this.offset().left - $(".detail-large .container").offset().left;
            var widthCon = _this.width();
            $(".triangle-box").animate({ "left": leftCon, "width": widthCon }, 300);
        }, 30);
    });
    $(".detail-large .con").on('mouseleave', function() {
        clearTimeout(timer);
    });
    $(".detailNo").mouseenter(function() {
        $("#detailList").slideUp();
        $(".triangle-box").css({ "left": 0, "width": 0 });
        $(".nav_wapper").removeClass("opacity90").addClass("opacity35");
    });
    /*鼠标画出导航下拉框时收起下拉框*/
    $("#detailList").mouseleave(function() {
        $(this).slideUp();
        $(".navDetail i").removeClass("menu_icon3").addClass("menu_icon1");
        $(".nav_wapper").removeClass("opacity90").addClass("opacity35");
    });

    $(".detailNo").mouseenter(function() {
        $("#detailList").slideUp();
        $(".triangle-box").css({ "left": 0, "width": 0 });
        $(".nav_wapper").removeClass("opacity90").addClass("opacity35");
    });

    //悬停显示二维码
    $("body").on("mouseenter mouseleave", ".app_box", function(event) {
        var e = event,
            type = e.type;
        var erwei_imgDom = $(this).find(".erwei_img_box");
        if (type == 'mouseenter') {
            erwei_imgDom.show();
            return;
        }
        if (type == 'mouseleave') {
            erwei_imgDom.hide();
            return;
        }
    });
    //点击锚点
    var anchor_dom = $(".action_up_fix");
    if (anchor_dom.length > 0) {
        $(".action_up_fix").click(function() {
            $("html").scrollTop(0)
        });
    };
    //点击试用锚点
    $("body").on("click", ".on_trial_fix", function() {
        window.location.href = "./login.html";
    });
    // 点击客服电话锚点
    $("body").on("mouseenter mouseleave", ".service_cell_fix", function(event) {
        var e = event,
            type = e.type;
        var num_dom = $(this).find(".cell_num");
        if (type == 'mouseenter') {
            $(this).addClass("cell_active");
            num_dom.show();
            return;
        }
        if (type == 'mouseleave') {
            $(this).removeClass("cell_active");
            num_dom.hide();
            return;
        }
    });
    //增值服务的鼠标悬停图片放大
    var service_liDom = $(".service-box .main ul li");
    if (service_liDom.length > 0) {
        service_liDom.each(function() {
            $(this).mouseover(function() {
                $(this).css({ "-webkit-transform": "scale(1.025)", "-moz-transform": "scale(1.025)", "transform": "scale(1.025)", "-moz-transition": "all ease 2s", "-webkit-transition": "all ease 0.5s", "transition": "all ease 0.5s" });
            });
            $(this).mouseout(function() {
                $(this).css({ "-webkit-transform": "none", "-moz-transform": "none", "transform": "none" });
            });
        });
    }

})