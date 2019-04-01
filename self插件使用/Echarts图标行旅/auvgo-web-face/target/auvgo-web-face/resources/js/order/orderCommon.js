$(function(){
	
	// 结束时间回显问题
	(function reShow(){
		
		var $LTEdate = $('#LTE_date');
		if ($LTEdate.val() && $LTEdate.val().length > 10) {
			var reShowStr = $LTEdate.val().substr(0, 10);
			$LTEdate.val(reShowStr);
		}
		
	})();
	
	//获取查询字符串，匹配指定订单控制
	(function(){
		var pathname = window.location.pathname,
			search = window.location.search,
			tag = search.slice(1).split(";")[0].split("=")[1],
			href = pathname+search;
		$(".s-jt-bg").removeClass("icon-up-jt-second");
		$(".second-side-nav a[data-tag='" + tag + "']").addClass("target").parents("dl").find("dd").show();
		$(".second-side-nav a[data-tag='" + tag + "']").parents("dl").find("dt").find(".s-jt-bg").addClass("icon-up-jt-second");
		$(".tab-model a[href='" + href + "']").addClass("tab-target");
		//icon-down-jt-second
		
	})();
	
	//订单详情跳转链接
	$("body").on("click",".orderToDetail",{flag:$(".tab-model .tab-target ").attr("data-flag")},detailHref);
	//订单详情跳转链接主函数
	function detailHref(e){
		window.location.href = $(this).attr("data-href_") + "?flag=" + e.data.flag;
	}
	
});