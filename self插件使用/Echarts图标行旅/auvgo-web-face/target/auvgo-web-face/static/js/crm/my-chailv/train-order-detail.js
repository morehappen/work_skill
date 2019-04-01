
//返回按钮链接控制
$("body").on("click",".train-order-cancle",{pathname:"/myChailv/toNewTrainOrder/",search:"?tag=train"},addReturnHref); //method is order-details-commom.js


//订单号
var orderno = $('#order-no').data('orderno');

// 非审批中订单点击-取消订单
$('#cancel-order').on('click', function() {
	new Confirm({
		text: '一天内最多取消三次订单，确定要取消该订单吗？',
		confirmCallback: function(){
			cancelOrder();
		}
	});
});

//审批中订单点击-取消订单
$('#cancel-order-approve').on('click', function() {
	new Confirm({
		text: '取消订单后需要重新预订，确定取消吗？',
		confirmCallback: function(){
			cancelOrder();
		}
	});
});

/**
 * ajax-取消订单
 */
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
		error: function(xhr, errorType, error) {
			layer.msg('取消订单失败！' + xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}
//action 确认出票
$("#endorse-order_confirm").on('click',function(){
	var price = $.trim($("#total").text());
	$.ajax({
		url:" /shareAcc/beforeCofirm",
		type:"post",
		data:{orderno:orderno,type:"train"},
		success:function(data){
			if(data.status=="200"){
				location.href="/train/order/confirm/"+orderno;
			}else if(data.status=="300"){
				layer.alert(data.msg);
			}else{
				layer.alert(data.msg);
			}
		},
		error:function(err){
			layer.alert("请确保网络畅通");
		}
	})
});
//action-点击-申请退票
$('#refund-order').on('click', function() {
	$.ajax({
		url:"/common/checktime",
		type:"post",
		success: function(data){
			// console.log(data)
			if(data.status==200){
				zh.iframes({
					width: "750px",
					height: "410px",
					url : "/train/order/refund/"+orderno,
					title: "申请退票",
					newStyle: true
				});
			}else {
				layer.alert(data.msg);
			}
		},
		error: function(xhr, errorType, error) {
			layer.alert("网络超时" +xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
	
});

// action-点击-申请改签
$('#endorse-order').on('click', function() {
	///common/checktime  获取服务器时间
	$.ajax({
		url:"/common/checktime",
		type:"post",
		success: function(data){
			// console.log(data)
			if(data.status==200){
				zh.iframes({
					width: "750px",
					height: "390px",
					url : "/train/order/endorse/"+orderno,
					title: "申请改签",
					newStyle: true
				});
			}else {
				layer.alert(data.msg);
			}
		},
		error: function(xhr, errorType, error) {
			layer.alert("网络超时" +xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
});