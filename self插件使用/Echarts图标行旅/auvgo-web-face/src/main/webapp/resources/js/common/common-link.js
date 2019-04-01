$(function(){
	
	com_link.intSmsEmail();
});

var com_link={
	//初始化短信邮箱选择
	intSmsEmail:function(){
		// 短信
		if(typeof($("#link_sms_sel"))!="undefined"){
			var phone = $("#link_sms_sel").parents("#link_info_d").find(".link-phone").val();
			this.checkSmsEmail(phone, 1);
		}
		// 邮箱
		if(typeof($("#link_email_sel"))!="undefined"){
			var email = $("#link_email_sel").parents("#link_info_d").find(".link-email").val();
			this.checkSmsEmail(email, 2);
		}
	},
	// 验证是否选中 value-手机号或邮箱， type-1短信，2邮箱验证
	checkSmsEmail:function(value, type){
		if(type == 1){
			var sms = $("#link_sms_sel");
			sms.removeClass("label-select-checkbox");
			sms.removeClass("show_choice_default");
			if(value == "" || !isPhoneSimp(value)){
				// 不符合条件不能选择
				sms.addClass("show_choice_default");
				sms.find("input").val("0");
			}else{
				sms.addClass("label-select-checkbox");
				sms.find("input").val("1");
			}
		}else{
			var eml = $("#link_email_sel");
			eml.removeClass("label-select-checkbox");
			eml.removeClass("show_choice_default");
			if(value == "" || !isEmail(value)){
				// 不符合条件不能选择
				eml.addClass("show_choice_default");
				eml.find("input").val("0");
			}else{
				eml.addClass("label-select-checkbox");
				eml.find("input").val("1");
			}
		}
	}
		
}