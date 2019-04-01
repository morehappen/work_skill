$(function() {
    //【知识点】60秒倒计时
    var wait = 60;
    var timerId;

    function time(o) {
        if (wait == 0) {
            o.removeAttr("disabled");
            o.text("免费获取验证码");
            wait = 60;
        } else {
            o.attr("disabled", true);
            o.text("重新发送(" + wait + ")");
            wait--;
            timerId = setTimeout(function() {
                time(o)
            }, 1000)
        }
    }

    function removetime(o) {
        clearInterval(timerId);
        o.removeAttr("disabled");
        o.text("免费获取验证码");
        wait = 60;
    }

    //点击删除小图标
    $("body").on("click", ".delete_icon", function() {
        var input_dom = $(this).parents(".input").find("input");
        input_dom.val("");
        input_dom.trigger("blur");
    });
    // 点击获取验证码按钮
    $("body").on("click", ".code_receive", function() {
        getPhoneCode();
    });
    //【标记4】将所有的输入框失焦校验【每个input独立去失焦的时候，遍历所有未通过校验dom，并直接调用校验函数。
    // 注意这里有个技巧，不能每个未通过输入框都去聚焦，不然会造成浏览器内存溢出】
    $("body").on("blur", ".input input", function() {
        var _$this = $(this);
        validate(_$this);
        var warn_dom = $("[data-regexok=0]");
        if (warn_dom.length > 0) {
            $(".main_btn").removeClass("btn_active");
            warn_dom.each(function(i, v) {
                    validate($(v));
                })
                //标记
            warn_dom.eq(0).focus();
            $(".main_btn").removeClass("btn_active");
        } else {
            $(".main_btn").addClass("btn_active");

        }

    });
    //【标记1】点击主提交按钮【此处的核心理念：主按钮要触发校验，将每个input都trigger失焦事件】
    $("body").on("click", ".main_btn", function() {
        submit_fun();
        $(".input input").trigger("blur");
        // $("[data-regexok=0]").eq(0).focus();
        // //如果有激活类名，可以提交，没有，跳出。
        // var active_flag = $(".main_btn").hasClass("btn_active");
        // if (active_flag) {
        //     submit_fun();
        // } else {
        //     return;
        // }
    });
});
// 邮箱正则
var email_regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
// 手机号正则
// var mPattern = /^1[34578]\d{9}$/; 
var phone_regex = /^1[2345678]\d{9}$/;

//【标记2】登录验证【封装函数内部，判定每个触发源头，从而进入每个分支逻辑，在每个分支逻辑内部调用相同的警示语句】
function validate(parma) {
    var _$this = parma;
    // 公司名称(必填)
    var firm_name = $.trim($(".firm_name").val());
    // 联系人中文/英文名字(必填)
    var user_name = $.trim($(".user_name").val());
    // 常用联系人邮箱(必填)
    var email_name = $.trim($(".email_name").val());
    // 联系人手机号
    var cell_name = $.trim($(".cell_name").val());
    // 4位验证码
    var code_name = $.trim($(".code_name").val());
    // 输入图形验证码
    var imgCode_name = $.trim($(".imgCode_name").val());
    if (_$this.is(".firm_name")) {
        if (firm_name == "") {
            infohtml($(".firm_name"), "请输入公司名称", false);
            return false;
        } else {
            infohtml($(".firm_name"), "", true);
        }
    }
    if (_$this.is(".user_name")) {
        if (user_name == "") {
            infohtml($(".user_name"), "请输入联系人名字", false);
            return false;
        } else {
            infohtml($(".user_name"), "", true);
        }
    }

    if (_$this.is(".email_name")) {
        if (email_name == "") {
            infohtml($(".email_name"), "请输入常用联系人邮箱", false);
            return false;
        } else if (!email_regex.test(email_name)) {
            infohtml($(".email_name"), "邮箱格式错误！", false);
            return false;
        } else {
            infohtml($(".email_name"), "", true);
        }
    }
    if (_$this.is(".cell_name")) {
        if (cell_name == "") {
            infohtml($(".cell_name"), "请输入联系人手机号", false);
            return false;
        } else if (!phone_regex.test(cell_name)) {
            infohtml($(".cell_name"), "手机号格式错误！", false);
            return false;
        } else {
            infohtml($(".cell_name"), "", true);
        }
    }
    // 图形验证码过滤
    if (_$this.is(".imgCode_name")) {
        if (imgCode_name == "") {
            $(".imgCode_name").addClass("warn_validate_color");
            $('.imgCode_warn').text('请输入图形验证码');
            return false;
        } else {
            if (cell_name != "" && !phone_regex.test(cell_name)) {
                infohtml($(".cell_name"), "手机号格式错误！", false);
                return false;
            } else if (cell_name == "") {
                infohtml($(".cell_name"), "请输入联系人手机号", false);
                return false;
            } else {
                getsmscode();
                debugger
                if ($('.imgCode_warn').text("").length > 0) {
                    return false;
                }
            }
            // $(".imgCode_name").removeClass("warn_validate_color");
            // $('.imgCode_warn').text("");
        }
    }
    // 验证码过滤
    if (_$this.is(".code_name")) {
        if (code_name == "") {
            $(".code_name").addClass("warn_validate_color");
            $('.codename_warn').text('请输入4位验证码');
            return false;
        }
        // else {
        //     $(".email_name").removeClass("warn_validate_color");
        //     $('.codename_warn').text("");
        //     校验手机验证码是否正确
        //     getPhoneCode();
        // }
    }
    return true;
}

//警示信息清空
function area_clear() {
    $(".input_warn").html("");
    $(".input input").removeClass("warn_validate_color");
}

//获取验证码
function getauvcode() {
    console.log(22);
    var yzm = document.getElementById("yzm_img");
    yzm.src = '/getimgcode?randdate=' + new Date();
}

//
$(".alert_btn").click(function() {
    //关闭图片验证
    if ($("#auvcode").val() == "") {
        alert("请输入右图的验证码");
        // $("#auvcode").focus();
    } else {
        $(".yzm_zhezhao").hide();
        $(".alert_li").hide();
        getsmscode();
    }
});

//校验图片验证码是否输入正确
function getsmscode(mobile) {
    time($(".code_receive"));
    $.ajax({
        type: "post",
        url: "/getvalid",
        data: "&mobile=" + $(".cell_name").val() + "&auvcode=" + $(".imgCode_name").val(),
        success: function(result) {
            debugger
            if (result.msg == "success") {
                // $(".codename_warn").text("验证码已发送到您的手机");
                infohtml($(".imgCode_name"), "验证码已发送到您的手机", true);
                $(".imgCode_name").parents("li").find(".input_warn").text("验证码已发送到您的手机").removeClass("reject").addClass("pass");
                // infohtml($(".firm_name"), "请输入公司名称", false);
                return true;
            } else if (result.msg == "手机验证码已发送到您手机，请不要重复发送") {
                $(".imgCode_name").parents("li").find(".input_warn").text("验证码已发送到您的手机").removeClass("reject").addClass("pass");
                removetime($(".code_receive"));
            } else {
                infohtml($(".imgCode_name"), result.msg, false);
                // $('.imgCode_warn').text(result.msg);
                removetime($(".code_receive"));
                return false;
            }
        },
        error: function() {
            infohtml($(".imgCode_name "), "验证码获取失败", false);
            removetime($(".code_receive"));
            // $('.imgCode_warn').text("验证码获取失败..");
            return false;
        }
    });
}

//校验手机验证码是否输入正确
// function getPhoneCode() {
//     $.ajax({
//         type: "post",
//         url: "/getvalid",
//         data: "&mobile=" + $(".cell_name").val() + "&auvcode=" + $(".imgCode_name").val(),
//         success: function (result) {
//             debugger
//             //此处可以根据状态码进行跟进。
//             if (result.msg == "success") {
//                 $(".codename_warn").text("验证码输入错误！");
//             }else if(result.msg =="手机验证码已发送到您手机，请不要重复发送"){
//
//             } else {
//                 $('.top_mask').show();
//                 setTimeout(function () {
//                     //这里写时间到后执行的代码
//                     $('.top_mask').slideUp();
//                 }, 2000);
//                 window.location.href = "./index.html";
//             }
//         },
//         error: function () {
//             $('.imgCode_warn').text("验证码获取失败..");
//         }
//     });
// }
// 主提交函数
function submit_fun() {
    // var repeat_flag = $("this").attr("data-repeat", "0");
    var request_data = $("#main_form").formJson();
    debugger
    $.ajax({
        type: "post",
        url: "/tryapply",
        // data: "&mobile=" + $(".cell_name").val() + "&auvcode=" + $(".imgCode_name").val(),
        data: request_data,
        beforeSend: function() {
            // 禁用按钮防止重复提交
            // $(".main_btn").attr("data-repeat", "0");
            $(".main_btn").addClass("btn_active");
        },
        success: function(result) {
            //此处正常的status才能设置为1
            $(".main_btn").attr("data-repeat", "1");
            //此处可以根据状态码进行跟进。
            if (result.msg == "success") {
                $('.top_mask').show();
                setTimeout(function() {
                    //这里写时间到后执行的代码
                    $('.top_mask').slideUp();
                }, 2000);
                window.location.href = "/";
            } else {
                infohtml($(".code_name"), "验证码输入错误！", false);
                // $(".codename_warn").text("验证码输入错误！");
            }
        },
        error: function() {},
        complete: function() {
            $(".main_btn").removeClass("btn_active");
        }
    });
}
// 【标记3】将警示语句提取，针对不同的dom源头进行不同的警示语句渲染
function infohtml(elem, parma, flag) {
    if (flag) {
        elem.removeClass("warn_validate_color");
        elem.attr("data-regexok", "1")
        elem.parents("li").find(".input_warn").text("").removeClass("reject").addClass("pass");
    } else {
        elem.addClass("warn_validate_color");
        // elem.focus();
        elem.attr("data-regexok", "0");
        elem.parents("li").find(".input_warn").text(parma).removeClass("pass").addClass("reject");
    }
}