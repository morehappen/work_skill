// 初始化右侧订单状态 以及window滚动事件
new ScrollNav($('.order-right'));

// 鼠标经过-退改签
$('.tuigai-des').hover(function(){
	$(this).find('table').stop().fadeIn();
}, function(){
	$(this).find('table').stop().fadeOut();
});

// 点击-火车票时刻表
$('body').on('click', '.time-table', function () {
	var param = $(this).data('param');
	zh.iframes({
		url: '/myChailv/luguochezhan/' + param, 
		title: '时刻表',
		width: '600px', 
		height: '360px'
	});
	
});