// 提交修改
$('#modify-personal-infor').Validform({
	ajaxPost : true,
	beforeCheck:function(curform){
		// Validform验证之前逻辑
		// return false;终止提交
		
		var certtype = $('[name="certtype"]').val();
		
		if(certtype == ''){
			zh.alerts({'title':'提示','text':'请选择证件类型'});
			return false;
		}
		
		var centno = $('[name="certno"]').val();
		
		// 证件号 为空
		if(centno == ''){
			zh.alerts({'title':'提示','text':'证件号不能都为空'});
			return false;
		}
		
		var centnoRegE = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
//		var passportnoRegE = new RegExp(/^1[45][0-9]{7}|G[0-9]{8}|P[0-9]{7}|S[0-9]{7,8}|D[0-9]+$/);
		var passportnoRegE = new RegExp(/^[a-zA-Z0-9]{5,15}$/);//护照
//		var gangaonoRegE = new RegExp(/^[HMhm]{1}([0-9]{10}|[0-9]{8})$/);//港澳通行证
//		var taiwannoRegE = new RegExp(/^[HMhm]{1}([0-9]{10}|[0-9]{8})$/);//港澳通行证
		
		// 证件号非空
		if(certtype != 'B'){//非护照
			if(!centnoRegE.test(centno)){
				zh.alerts({'title':'提示','text':'请输入正确的证件号'});
				return false;
			}
		}else{//护照
			if(!passportnoRegE.test(centno)){
				zh.alerts({'title':'提示','text':'请输入正确的护照号'});
				return false;
			}
		}
		
	},
	beforeSubmit : function(curform){
		// Validform验证通过之后逻辑
		// return false;终止提交
		
	},
	callback:function(data){
		$("#Validform_msg").hide();
		if(data.status=='y'){
			zh.alerts({'title':'提示','text':data.info});
			$("body").on("click",".alert_event",function(){
				top.location.reload();
			});
		}else{
			zh.alerts({'title':'提示','text':data.info});
		}
	}
});