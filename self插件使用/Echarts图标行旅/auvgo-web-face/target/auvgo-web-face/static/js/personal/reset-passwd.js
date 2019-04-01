check();
var chooseValue="";
var resetPasswd = {
	getYzmFlag: 1,
	setInterval: null,
	time: 60,
	pwd: 1,
	getYzmMain:function(){
		var ele = $("#getPara"),
			companyid = ele.attr("data-companyid"),
			empid = ele.attr("data-empid"),
			// choose = $('[name="choose"]').val();
			choose = chooseValue;
		$.ajax({
			type: "POST",
			url:'/person/sendIdentify?companyid=' + companyid + "&empid=" + empid + "&choose=" + choose,
			success: function(data) {

				layer.msg(data.msg);
			},
			error:function(XMLHttpRequest){
				zh.alerts({
					title:"提示",
					text: XMLHttpRequest
				});
				console.log(XMLHttpRequest);
			}
		});
	},
	inputEmpty: function(){ //信息框滤空校验主函数
		var this_ = $(this),
			val = $.trim(this_.val()),
			parents = this_.parents(".f-p-input");
		if('' === val){
			parents.addClass("warn_text");
		}else{
			parents.removeClass("warn_text");
		}
	},
	submitMain: function(){
		var code = $.trim($("#yzm_sr").val()),
			ele = $("#getPara"),
			loginId = $.trim(ele.attr("data-empid")),
			cid = $.trim(ele.attr("data-companyid")),
			password = $.trim($(".pw").val());

		if("" === code){
			$("#yzm_sr").addClass("warn_validate_color");
            $(".yzm_tip").html("请输入验证码！").show();
			// layer.msg("请输入验证码！");
			return;
		}
		if("" === $.trim($(".pw").val())){
			$(".pw").addClass("warn_validate_color")
			$(".newpsd_tip").html("请输入新密码").show();
			// layer.msg("请输入新密码！");
			return;
		}
		if("" === $.trim($(".rpw").val())){
			// layer.msg("请确认新密码！");
			$(".rpw").addClass("warn_validate_color");
            $(".surepsd_tip").html("请输入新密码").show();
			return;
		}
		if(resetPasswd.pwd !== 1){
			return;
		}

		$.ajax({
			type: "POST",
			url:'/person/confirmChangePw?code=' + code + "&loginId=" + loginId + "&cid=" + cid + "&password=" + password,
			success: function(data) {
                area_clear();
				if(data.status === 200){
					layer.confirm(data.msg, {
						btn: "重新登录",
						closeBtn: 0, //不显示关闭按钮
					}, function(){
						location.href = location.href.split(location.pathname)[0];
					});
					//
					return;
				}else if(data.status === 300||	data.status === 301){
					$("#yzm_sr").addClass("warn_validate_color");
                    $(".yzm_tip ").html(data.msg).show();
					return;
				}
				$(".surepsd_tip").html(data.msg).show();
				// layer.alert(data.msg);
			},
			error:function(error){
                area_clear();
				var  text = "";
				if(error.status === 0){
					text = "确保您的网络畅通，请重新提交~";
				}else{
					text = "系统偶尔也会累，请重新提交或拨打客服电话4006060011";
				};
                $(".surepsd_tip").html(text).show();
				// zh.alerts({
				// 	title:"提示",
				// 	text: text
				// });
				// console.log(error);
			}
		});
	},
	valValidate: function (this_,reg,maxlength) {
		var this_ =this_,
			currentVal = $.trim(this_.val()),
			val = currentVal.replace(reg,"");
		if(typeof maxlength === "number"){
			val = val.length > maxlength ? val.slice(0,maxlength) : val;
		}
		this_.val(val);
	}

}

//获取验证码
$("body").on("click",".get-yzm button",function(){
	var this_ = $(this);
	$("#yzm_sr").removeAttr("disabled");
	if(resetPasswd.getYzmFlag === 1){
		this_.addClass("stop");
		resetPasswd.getYzmFlag = 0;
		resetPasswd.setInterval = setInterval(function(){
			var times = --resetPasswd.time;
			if(times == 0){
				clearInterval(resetPasswd.setInterval);
				this_.text("获取验证码");
				this_.removeClass("stop");
				resetPasswd.time = 60;
				resetPasswd.getYzmFlag = 1;
			}else{
				this_.text(times + "s");
			}
		},1000);
		resetPasswd.getYzmMain();
	}
});

//判断密码是否相同
$("body").on("blur",'[type="password"]',function(){
    area_clear();
	var pw = $(".pw"),
		rpw = $(".rpw"),
		pwV = $.trim(pw.val()),
		rpwV = $.trim(rpw.val());
	if((pwV.length > 0 && pwV.length < 6) || pwV.length > 16){
		resetPasswd.pwd = 0;
		// layer.msg("请输入6-16位字母或数字的密码");
        $(".surepsd_tip").html("请输入6-16位字母或数字的密码").show();
        $(".newpsd_tip ").html("请输入6-16位字母或数字的密码").show();
		$("input[type='password']").parents(".f-p-input").addClass("warn_text");
		return;
	}
	if("" != pwV && "" != rpwV){
		if(pwV !== rpwV){
			resetPasswd.pwd = 0;

			// layer.msg("请输入与新密码一致的密码");
            $(".surepsd_tip").html("请输入与新密码一致的密码").show();
			$("input[type='password']").parents(".f-p-input").addClass("warn_text");
			return;
		}
		$("input[type='password']").parents(".f-p-input").removeClass("warn_text");
		resetPasswd.pwd = 1;
		return;
	}
	resetPasswd.pwd = 1;
});

//滤空校验
$("body").on("input propertychange","input[type='text']",resetPasswd.inputEmpty);
$("body").on("input propertychange","input[type='password']",resetPasswd.inputEmpty);

$("body").on("click",".reset-g button",function(){
	resetPasswd.submitMain();
});

//验证码验证
$("body").on("input propertychange","#yzm_sr",function(){
	resetPasswd.valValidate($(this),/[^0-9]/gi,6);
});
// 密码验证
$("body").on("input propertychange","input[type='password']",function(){
	resetPasswd.valValidate($(this),/[^A-Za-z0-9]/gi,16);
});
//清空警示
function area_clear() {
	$(".warn_validate_color").removeClass("warn_validate_color");
	$(".yzm_tip").html("");
	$(".newpsd_tip").html("");
	$(".surepsd_tip").html("");
}
$(function () {
    //初始化下拉
    $("#selectbox").selectBox("selectForIndex", 0);
    chooseValue = $(".selectbox_selected").data("value");

    $("#selectbox ul li").click(function() {

        var $this = $(this);
        chooseValue = $this.attr('data-value'); //一级id抓取
    })
})
//悬停显示二维码
$("body").on("mouseover",".lg_mobile",function(){
    $(".lg_erwei_img").show();
});
$("body").on("mouseout",".lg_mobile",function(){
    $(".lg_erwei_img").hide();
});
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
