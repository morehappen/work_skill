//初始化出发返程日期

(function(){
	var date=(new Date()).getTime();
		fromDate=new Date(date+1000*60*60*24);
		toDate=new Date(date+2*1000*60*60*24);
		$("#beginDate").val(fromDate.getFullYear()+"-"+((fromDate.getMonth()+1)<10 ? "0"+(fromDate.getMonth()+1) : fromDate.getMonth()+1)+"-"+(fromDate.getDate()<10 ? "0"+fromDate.getDate() : fromDate.getDate()));
		$("#endDate").val(toDate.getFullYear()+"-"+((toDate.getMonth()+1)<10 ? "0"+(toDate.getMonth()+1) : toDate.getMonth()+1)+"-"+(toDate.getDate()<10 ? "0"+toDate.getDate() : toDate.getDate()));
})();


//国际机票表单提交
$("#createXQD").Validform({
	beforeSubmit:function(){
		var startVal=$(".from_gg_name").val().replace(/(^\s*)|(\s*$)/g, ""),
			endVal=$(".to_gg_name").val().replace(/(^\s*)|(\s*$)/g, "");
		if(startVal==endVal){
			layer.msg("出发地与目的地不能相同！");
			return false;
		}
	}
});





/*$("#createXQD").Validform({
	btnSubmit: ".validform-submit",
	ajaxPost: true,
	callback: function(data){
		$.Hidemsg();
		if(data.status==200){
			layer.msg(data.msg);
			setTimeout(function(){
				location.reload();
			}, 3000);
		}else {
			layer.msg(data.msg);
		}
		if(data.status == 300){
			layer.msg(data.msg);
			return;
		}
		
	}
});*/
