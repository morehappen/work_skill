$(function() {
    // 轮播图初始化
    var swiper = new Swiper('.swiper-container', {
        pagination: {
            el: '.swiper-pagination'
        },
        loop: true,
        autoplay: true //等同于以下设置
    });
    // 处理视频播放
    var video = document.getElementById("video_main");
    this.controls = true; //控制条
    var current = true;
    $("body").on("click", ".play_ctr", function() {
        if (current) {
            //暂停状态下逻辑：
            video.play();
            $(".mask").hide();
            // $(".pause_btn").show();
            $(".play_ctr").removeClass("play_btn").addClass("pause_btn");
            // 正在播放的时候，将状态设置为false
            current = false; //下次点击的状态
        } else {
            $(".mask").show();
            $(".play_ctr").removeClass("pause_btn").addClass("play_btn");
            video.pause();
            current = true;
        }
    });
    $("body").on("mouseenter mouseleave", ".video_box", function(event) {
        var e = event,
            type = e.type,
            ele = $(e.target);
        if (current == false) {
            if (type == 'mouseenter') {
                $(".play_ctr").show();
                return;
            }
            if (type == 'mouseleave') {
                $(".play_ctr").hide();
                return;
            }
        }
    });
})