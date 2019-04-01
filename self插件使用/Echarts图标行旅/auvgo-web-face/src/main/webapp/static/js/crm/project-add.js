$("#projectForm").Validform({
	ajaxPost : true,
	beforeCheck:function(curform){
		var startDate = new Date($('[name="startdate"]').val());
		var endDate = new Date($('[name="enddate"]').val());
		
		if(startDate > endDate){
			zh.alerts({
				title:"提示",
				text: '请选择正确的开始/结束时间！'
			});
			return false;
		}
	},
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status == 200) {
			zh.alerts({
				title:"提示",
				text:data.msg
			});
			$("body").on("click",".alert_event",function(){
				top.location.reload();
			});
		} else {
			console.log(data);
			zh.alerts({
				title:"提示",
				text:data.msg
			});
		}
	}
});	