



$(function(){
	//返回按钮链接控制
	$("body").on("click",".air-order-cancle",{pathname:"/myChailv/toNewAirGaiOrder/",search:"?tag=airEndrose"},addReturnHref); //method is order-details-commom.js
	//鼠标经过-退改签
	$('.tuigai-des').hover(function(){
		$(this).find('table').stop().fadeIn();
	}, function(){
		$(this).find('table').stop().fadeOut();
	});
});











