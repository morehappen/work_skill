//初始化出发返程日期

(function(){
	var date=(new Date()).getTime();
		fromDate=new Date(date+1000*60*60*24);
		toDate=new Date(date+2*1000*60*60*24);
		$("#beginDate").val(fromDate.getFullYear()+"-"+((fromDate.getMonth()+1)<10 ? "0"+(fromDate.getMonth()+1) : fromDate.getMonth()+1)+"-"+(fromDate.getDate()<10 ? "0"+fromDate.getDate() : fromDate.getDate()));
		$("#endDate").val(toDate.getFullYear()+"-"+((toDate.getMonth()+1)<10 ? "0"+(toDate.getMonth()+1) : toDate.getMonth()+1)+"-"+(toDate.getDate()<10 ? "0"+toDate.getDate() : toDate.getDate()));
})();


//国际机票表单提交
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
$(function(){
	(function(){
		var href=location.search,href_flag="",
			arrFlag = [$("input[name='airServer']").val(),$("input[name='trainServer']").val(),$("input[name='hotelServer']").val()],
			target = "";
		if (href == ""){
			if($("input[name='noserver']").val() == "noserver"){
				return;
			}
			$.each(arrFlag,function(index,item){
				if(item != undefined){
					target = item;
					return false;
				}
			});
			if(target=="air"){
				$(".tab-model li[data-linshi='air']").addClass("tab-target");
				return;
			}else{
				$(".tab-model li[data-flag='" + target + "']").addClass("tab-target");
				return;
			}
			
		}
		href_flag=href.split("=")[1];
		if(href_flag=="guoji"){
			$(".tab-model li").removeClass("tab-target");
			$(".sub-nav-ul a").removeClass("sub-active");
			$(".tab-model li[data-linshi='true']").addClass("tab-target");
			// $(".sub-nav-ul a[data-linshi='true']").not('.go-home').addClass("sub-active");
			$(".sub-nav-ul a[data-linshi='guoji']").not('.go-home').addClass("sub-active");
		}
		// var outerData_outer = null;
		var interface = new OuterInterface(), // 实例化第三方接口
			outerData = interface.getOuterInterface(); // 读取第三方接口数据
		if(outerData!=null&&outerData!="undefined"){
			interface.clearPower(outerData.product);
		}
	})();
});
