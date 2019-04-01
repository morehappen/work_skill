check();
//找回密码主模块
var findPassWord = {
	yzmText:"",
	yzmFlag: false,
	isError: false,
	inputEmpty: function(){ //信息框滤空校验主函数
		var this_ = $(this),
			val = $.trim(this_.val()),
			parents = this_.parents(".f-p-input"),
			flag = true;
		$(".f-p-tips").html("").hide();
		if('' === val){
			parents.addClass("warn_text");
		}else{
			parents.removeClass("warn_text");
		}
		$(".f-p-m-little input[type='text']").each(function(){
			var this_ = $(this),
				val = $.trim(this_.val());
			if(val === "" || val === undefined){
				flag = false;
			}
		});
		if(flag){
			$(".find-btn-group button").addClass("normalshow");
			return;
		}
		$(".find-btn-group button").removeClass("normalshow");
	},
	getYzm: function () { //请求验证码
		findPassWord.yzmText = "";
		$("#yzm_sr").val("");
		$.ajax({
			type: "POST",
			url:'/person/getRandom',
			success: function(data) {
				if(data.status === 200){
					findPassWord.viewYzm(data);
					return;
				}
				layer.msg("获取验证码失败，请刷新浏览器重试！");
			},
			error:function(XMLHttpRequest){
				zh.alerts({
					title:"提示",
					text: XMLHttpRequest.statusText
				});
				console.log(XMLHttpRequest);
			}
		});
	},
	viewYzm: function(data){ //展示验证码
		var data = data.data;
		findPassWord.yzmText = data;
		$("#img_yzm").attr("src","/person/getVerify?random_yzm=" + data);
	},
	volidate: function (random) {
		//验证验证码
		;
		findPassWord.yzmFlag = false;
		$.ajax({
			type: "POST",
			async:false,
			url:'/person/checkRandom',
			data:{
				random: random,
				codeRandom: findPassWord.yzmText
			},
			success: function(data) {
				if(data.status === 200){
					findPassWord.yzmFlag = true;
					return;
				}
				findPassWord.yzmFlag = false;
				if(data.status === 300){
					findPassWord.volidateShow(data);
				}
			},
			error:function(XMLHttpRequest){
				zh.alerts({
					title:"提示",
					text: XMLHttpRequest.statusText
				});
				findPassWord.yzmFlag = false;
				console.log(XMLHttpRequest);
			}
		});
	},
	volidateShow: function(data) {
		$("#yzm_sr").val("");
		$(".find-btn-group button").removeClass("normalshow");
		layer.msg(data.msg);
		setTimeout(findPassWord.getYzm,1000);
	},
	beforeSubmit:function(data){
		if("" === data.kahao){
			return;
		}
		if("" === data.username){
			return;
		}
		if($.trim($("#yzm_sr").val()) == ""){
			return;
		}
		if(!findPassWord.yzmFlag){
			if($("#yzm_sr").val() != ""){
				findPassWord.getYzm();
				$("#yzm_sr").val("");
				$(".find-btn-group button").removeClass("normalshow");
			}
			return;
		}
		findPassWord.findPassWordSubmit(data.kahao,data.username,data.yzm);
	},
	findPassWordSubmit: function(kahao,username,yzm) {
		$.ajax({
			type: "POST",
			url:'/person/getUserMsg?kahao=' + kahao + "&username=" + username + "&random=" + yzm + "&codeRandom=" + findPassWord.yzmText,
			success: function(data) {
				if(data.status === 200){
					location.href = "/person/toFindPage?kahao=" + kahao + "&username=" + username;
					return;
				}
				findPassWord.fullError(data);
			},
			error:function(error){
				var  text = "";
				if(error.status === 0){

					text = "确保您的网络畅通，请重新提交~";
				}else{
					text = "系统偶尔也会累，请重新提交或拨打客服电话4006060011";
				}
				zh.alerts({
					title:"提示",
					text: text
				});
				console.log(error);
			}
		});
	},
	fullError: function(data){

		findPassWord.getYzm();
		function area_clear() {
            $(".kahao_tip").html("");
            $(".userName_tip").html("");
            $(".yzm_tip").html("");
        }
		if(data.status === 301){
			// $(".f-p-tips").html(data.msg).show();
            area_clear();
			$(".kahao_tip").html(data.msg).show();
			return;
		}
		if(data.status === 304){
			// $(".f-p-tips").html(data.msg).show();
            area_clear();
			$(".userName_tip").html(data.msg).show();
			return;
		}
        if(data.status === 302 || data.status === 303 || data.status === 305){
            // $(".f-p-tips").html(data.msg).show();
            area_clear();
            $(".yzm_tip").html(data.msg).show();
            return;
        }
		layer.alert(data.msg);

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
};


//页面初始化，请求验证码
(function(){findPassWord.getYzm();})();

//更换验证码
$("body").on("click","#img_yzm",findPassWord.getYzm);

//验证验证码正确性
$("body").on("blur","#yzm_sr",function(){
	;
	var random = $.trim($(this).val());
	if("" === random){
		return;
	}
	findPassWord.volidate(random);
});
//悬停显示二维码
$("body").on("mouseover",".lg_mobile",function(){
    $(".lg_erwei_img").show();
});
$("body").on("mouseout",".lg_mobile",function(){
    $(".lg_erwei_img").hide();
});
//input失去焦点滤空验证
$("body").on("blur","input[type='text']",findPassWord.inputEmpty);

//实时改变输入内容滤空验证
$("body").on("input propertychange","input[type='text']",findPassWord.inputEmpty);

//提交找回密码
$("body").on("click",".find-btn-group button",function(){
    area_clear();
	findPassWord.beforeSubmit({
		kahao: $.trim($(".cardNum").val()),
		username: $.trim($(".username").val()),
		yzm: $.trim($("#yzm_sr").val()),
	});
});

//卡号格式验证
$("body").on("input propertychange",".cardNum",function(){
	findPassWord.valValidate($(this),/[^A-Za-z0-9]/gi,10);
});
//用户名验证
$("body").on("input propertychange",".username",function(){
	findPassWord.valValidate($(this),/[^A-Za-z0-9]/gi,20);
});
//验证码验证
$("body").on("input propertychange","#yzm_sr",function(){
	findPassWord.valValidate($(this),/[^A-Za-z0-9]/gi,4);
});
//清空警示
function area_clear(){
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


















