//预订按钮
$('body').on('click', '#hotel-book-cancle', function () {
	  var form=document.getElementById("hotel-book-form");
	  form.action="/hotel/book/backFill";
	  form.submit();
});

//支付
$('body').on('click','#btn-pay-fee',function () {
	  var form=document.getElementById("hotel-book-form");
	  form.action="/hotel/book/guarantee";
	  form.submit();
});

//提交表单
$('body').on('click','#btn-submit',function () {
      $(this).attr("disabled",true);
	  layer.msg('正在生成订单，请稍候', {icon: 16,time:5000000,shade:0.5});
	  var form=document.getElementById("hotel-book-form");
	  form.action="/hotel/book/create";
	  form.submit();
});

//入住人的样式判断
$(".Occupant-box-list").each(function(index,item){
	// console.log(index)
	if(index==0){
		$(this).removeClass('Occupant-box-list-bottom')
	}
})