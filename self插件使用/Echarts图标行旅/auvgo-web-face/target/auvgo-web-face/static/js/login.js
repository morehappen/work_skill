check();
var acookie = document.cookie.split(";"),
    passwords = '';
//单击登录
$("body").on('click', ".submitForm", function () {
    area_clear();
    validate();
});
// 配置键盘enter键事件
$(document).keydown(function (event) {
    //
    if ($("#passWord_").is(":focus")) {
        if ($('[name="autologin"]').attr("data-clearP") != "1") {
            $('[name="autologin"]').attr("data-clearP", "1");
        }
    }
    if ($('.alert_window').length > 0) return;
    if (event.keyCode == 13) validate();
});

//登录验证
function validate() {
    var cardNum = $.trim($(".card-num").val().toUpperCase());
    var userName = $.trim($(".username").val());
    var passWord = $.trim($(".password").val());
    $(".card-num").val(cardNum);
    $(".username").val(userName);
    $(".password").val(passWord);
//	console.log(passWord);
    if (cardNum == "") {
        // $('.errorwraper').text('请输入商旅卡号');
        $('.kahao_tip').text('请输入商旅卡号');
        $(".card-num").addClass("warn_validate_color");
        return;
    } else {
        $('.kahao_tip').text("");
        $(".card-num").removeClass("warn_validate_color");
    }
    if (userName == "") {
        $(".username").addClass("warn_validate_color");
        $('.userName_tip').text('请输入用户名');
        return;
    } else {
        $(".username").removeClass("warn_validate_color");
        $('.userName_tip').text("")
    }
    if (passWord == "") {
        $(".password").addClass("warn_validate_color");
        $('.passWord_tip').text('请输入密码');
        return;
    } else {
        $(".password").removeClass("warn_validate_color");
        $('.passWord_tip').text();
    }
    var kpd = $('[name="autologin"]');
    if (($('[name="autologin"]').attr("data-clearP") != "1") && ((kpd.prop("checked") == true && (passwords != "" && passwords != undefined)) || (kpd.prop("checked") == false && kpd.attr("data-flag") == "1"))) {
        passWord = passwords;
        $(".password").val(passWord);
    } else {
        passWord = md5((userName + cardNum + passWord)).toUpperCase();
        //console.log(passWord);
        $(".password").val(passWord);
    }
    $("#login").submit();
}

//function errorMain(error){
//	if(error!=""){
//		zh.alerts({'title':'登录失败','text':error});
//	}
//}
//errorMain($('[name="submitError"]').val().length > 40 ? '服务器内部错误！' : $('[name="submitError"]').val());
//保存用户名
$("body").on("click", ".user_name input", function () {
    baocunXinxi($(this));
});
//保存密码
$("body").on("click", ".user_password", function () {
    baocunXinxi($(this));
});

function baocunXinxi(this_) {
    this_.prop("checked") === true ? this_.val("1") : this_.val("0");
}

setTimeout('', 300);

function cookies_func() {
    $("#kahao_").val("");
    $("#userName_").val("");
    $("#passWord_").val("");
		var mation = '';
		$.each(acookie, function (item) {
			var newItem = item.toString().split("=")[0].replace(/\s+/g, '');
			if (newItem == 'loginParam') {
				if (JSON.parse(item.split("=")[1]).length > 0) {
					mation = JSON.parse(JSON.parse(item.split("=")[1]));
				}
			}
		});
		if (mation != "") {
        $("#kahao_").val((mation.kahao || ""));
        $("#userName_").val((mation.username || ""));
        $("#passWord_").val((mation.password || ""));
        passwords = mation.password;
        if (mation.autologin === 1) {
            $('[name="autologin"]').prop("checked", true).val("1").attr("data-flag", "1").parents("label").addClass("label-select-checkbox");
        } else {
            $('[name="autologin"]').prop("checked", false).val("0").parents("label").removeClass("label-select-checkbox");
        }
    }
}

cookies_func();

$("body").on("click", "#passWord_", function () {
    $(this).val("");
});
//悬停显示二维码
$("body").on("mouseover", ".lg_mobile", function () {
    $(".lg_erwei_img").show();
});
$("body").on("mouseout", ".lg_mobile", function () {
    $(".lg_erwei_img").hide();
});
$("body").on("click", ".usenameDele_img", function () {
    $("#kahao_").val("");
});
//忘记密码

$("body").on("click", ".ret-password a", function () {
    window.open("/person/forgetPw");
});

// //卡号格式验证
// $("body").on("input propertychange","#kahao_",function(){
// 	valValidate($(this),/[^A-Za-z0-9]/gi,10);
// });
//
// //用户名验证
// $("body").on("input propertychange","#userName_",function(){
// 	valValidate($(this),/[^A-Za-z0-9]/gi,20);
// });
//
// // 密码验证
// $("body").on("input propertychange","input[type='password']",function(){
// 	valValidate($(this),/[^A-Za-z0-9]/gi,16);
// });

// 验证用户输入内容是否合法
function valValidate(this_, reg, maxlength) {
    var this_ = this_,
        currentVal = $.trim(this_.val()),
        val = currentVal.replace(reg, "");
    if (typeof maxlength === "number") {
        val = val.length > maxlength ? val.slice(0, maxlength) : val;
    }
    this_.val(val);
}
//警示信息清空
function area_clear() {
    $(".lg_tip").html("");
    $(".warn_validate_color").removeClass("warn_validate_color");
}
//检查移动用户端
function check() {
    var u = navigator.userAgent, app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid) {
        //这个是安卓操作系统
        $(".phone_ajump").attr("href","http://www.auvgo.com/appskip/online");
    }else if(isIOS) {
        //这个是ios操作系统
        $(".phone_ajump").attr("href","https://itunes.apple.com/cn/app/id1218107207?mt=8");
    }else {
        return;
    }
}
