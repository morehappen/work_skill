//返回按钮链接控制
$("body").on("click",".train-order-cancle",{pathname:"/myChailv/toNewTrainGaiOrder/",search:"?tag=trainEndrose"},addReturnHref); //method is order-details-commom.js

// action-点击-改签单详情页面-取消功能
$('#train-cancel-endorse').on('click', function() {
	var orderno = $(this).attr('data-gqorderno');
	$.ajax({
		url: '/train/gaiqian/cancel/' + orderno,
		type: 'post',
		success: function(data){
			
			if (data.status != 200) {
				layer.msg(data.msg + '|' + data.status);
				console.error(data);
				return ;
			}
			
			setTimeout(function () { location.reload(); }, 1000)
			
		},
		error: function(xhr, errorType, error){
			layer.msg('取消改签失败！' + xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
});

// action-点击-改签单详情页面-确认改签功能
$('#train-confirm-endorse').on('click', function() {
	var orderno = $(this).attr('data-gqorderno');
	$.ajax({
		url: '/train/gaiqian/confirmGaiqian',
		type: 'post',
		data:{'gqorderno':orderno},
		success: function(data){
			
			if (data.status != 200) {
				layer.msg(data.msg + '|' + data.status);
				return ;
			}
			
			setTimeout(function () { location.reload(); }, 1000)
			
		},
		error: function(xhr, errorType, error){
			layer.msg('确认改签失败！' + xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
});