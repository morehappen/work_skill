$(function(){
	

	
//不支持线上退票改签提示

$("body").on("click",".btn-tips",tips_main);
function tips_main(){
	zh.alerts({ title: '提示', text: '暂不支持线上操作退票和改签，请拨打客服电话' + untilConfig.telPhoneNo });
}	
	

	
});
(function(){
	var search = window.location.search.split("=")[1],
		ele = $(".y_order");
	ele.attr("href",ele.attr("href") + search);
})();


//返回链接主函数
function addReturnHref(e){
	window.location.href=e.data.pathname + window.location.search.split("=")[1] + e.data.search + ";return=-1";
}