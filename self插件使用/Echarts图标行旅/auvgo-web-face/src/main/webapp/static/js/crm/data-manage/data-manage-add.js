// 点击-添加-确定-机票超标||机票退票||火车票超标||酒店超标
$(".alert-form").Validform({
	ajaxPost : true,
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status == 200) {
			top.location.reload();
		} else {
			zh.alerts({ title:"提示", text:data.msg });
		}
	}
});