
// 订单号
var orderno = $('#order-no').attr('data-orderno');

// action-点击-取消订单
$('#cancel-order').on('click', function() {
	new Confirm({
		text: '一天内最多取消三次订单，确定要取消该订单吗？',
		confirmCallback: function(){
			cancelOrder();
		}
	});
});

// ajax-取消订单
function cancelOrder(){
	$.ajax({
		url: '/train/order/cancel',
		type: 'post',
		async: false,
		data: {orderno: orderno},
		success: function(data){
			
			layer.msg(data.msg);
			
			if (data.status != 200) return ;
			
			setTimeout(function() { location.reload(); }, 1000);
			
		},
		error: function(xhr, errorType, error){
			console.error(xhr);
			console.error(errorType || error);
			layer.msg('链接服务器失败！xhr.status=' + xhr.status + ',' + (errorType || error));
		}
	});
}




// action-点击-退票
$('#refund').on('click', function() {
	layer.msg('暂不支持线上操作退票和改签，<br/>请拨打客服电话4006060011');
});

// action-点击-改签
$('#endrose').on('click', function() {
	layer.msg('暂不支持线上操作退票和改签，<br/>请拨打客服电话4006060011');
});