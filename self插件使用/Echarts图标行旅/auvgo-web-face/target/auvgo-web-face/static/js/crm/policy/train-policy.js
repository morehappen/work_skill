//后台数据准备就绪
function javaData(trainData){
	var control=trainData.trainStatus.contr.split('/');
	$("#gaotie .train-seats input").each(function(){
		regExpMain($(this),trainData.trainStatus.gaotie);
	});
	$("#dongche .train-seats input").each(function(){
		regExpMain($(this),trainData.trainStatus.dongche);
	});
	$("#pukuai .train-seats input").each(function(){
		regExpMain($(this),trainData.trainStatus.pukuai);
	});
	$(".train-gdp-rank").each(function(i){
		if($("select[name='startlevel']").data('value')!=''){
			$(this).find(".gkfs").parents(".label").removeClass("label-select-radio");
		}
		$(this).find(".gkfs").prop("checked",false).parents(".label").removeClass("label-select-radio");
		$(this).find(".gkfs[value='"+control[i]+"']").prop('checked',true).parents(".label").addClass("label-select-radio");
	});
	function regExpMain(this_,returnData){
		var this_=this_,
			value=this_.val(),
			regexp=new RegExp(value,'g');
		regexp.test(returnData)===true ? this_.prop("checked",true).parents('.label').addClass("label-select-checkbox") :"";
	}
}


// 点击-确定
$("#chailvTrainForm").Validform({
	ajaxPost : true,
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status == 200) {
			zh.alerts({'title':"提示",'text':"操作成功！"});
			$("body").on("click",".alert_event",function(){
				location.href="/crm/chailv/";
			});
		} if (data.status ==300) {
			zh.alerts({'title':"提示",'text':data.msg});
		}
	}
});
