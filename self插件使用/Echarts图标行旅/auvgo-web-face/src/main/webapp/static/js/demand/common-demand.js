//判读是否维护了签证/租车等类型
function isType(msg){
	layer.msg(msg);
}

$(function(){
	
	//目标导航显示目标样式
	(function(){
		$(".sub-nav-ul a[data-flag='" + $(".demand-c").attr("data-value") + "']").addClass("sub-active");
	})();
	
});