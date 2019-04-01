//// 点击-酒店信息-折叠||收起
//$('body').on('click', '.hotel-infor-more', function(){
//	var $this = $(this);
//	var $hotelDes = $('.hotel-des');
//	
//	$this.hasClass('infor-less') ? $hotelDes.slideUp(500) : $hotelDes.slideDown(500);
//	
//	$this.toggleClass('infor-less');
//	
//});
//
//
//// 点击-查看地图
//$('body').on('click', '.map-location', function(){
//	zh.iframes({
//		url: '/myChailv/toHotelLocation',
//		title: $(this).html(),
//		width: '900px',
//		height: '500px',
//	});
//});


//返回按钮链接控制
$("body").on("click",".hotel-order-cancle",{pathname:"/myChailv/toNewHotelOrder/",search:"?tag=hotel"},addReturnHref); //method is order-details-commom.js