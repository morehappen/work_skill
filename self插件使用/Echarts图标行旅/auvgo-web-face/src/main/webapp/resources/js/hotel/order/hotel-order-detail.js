$(function(){
});
// 显示取消弹框
function showCancelOrder(){
	var platform = $("#hotel_order_platform_i").val();
	var title = "取消原因";
	if(platform=="SELF" || platform=="PROTOCOL"){
		title = "取消订单申请";
	}
	layer.prompt({
	  formType: 2,
	  value: '',
	  title: title,
	  area: ['200px', '50px'], //自定义文本域宽高
	  yes: function(index, elem){
		  var reason = elem.find(".layui-layer-input").val();
		  if(reason==""){
			  layer.msg("请输入取消原因");
		  }else{
			  if(reason.length>50){
				  layer.msg("取消原因最多输入50个字符");
			  }else{
				  $("#cancel_reason_i").val(reason);
				  confirmCancel();
				  layer.close(index);
			  }
		  }
	  }
	});
}

/**
 * 确定取消订单
 * @param orderNo 订单号
 */
function confirmCancel(){
	$.ajax({
		type : "POST",
		url : "/hotel/order/cancel/order",
		data : $("#cancel_order_form").serialize(),
		beforeSend: function () {
			$(document.body).css({"overflow-x":"hidden", "overflow-y":"hidden"});
			$("body .loginBox").html("<p style='width:50px;height:50px;position:fixed;left:0;top:0;bottom:0;right:0;transform:translate(-50%,-50%);z-index:1000;margin:auto;'><img  src='/resources/js/plugin/layer/theme/default/loading-2.gif'/></p>").show();
		},
		success : function(result){
			$("body .loginBox").hide();
			$(document.body).css({"overflow-x":"auto", "overflow-y":"auto"});
			if(result.status == 200){
				var platform = $("#hotel_order_platform_i").val();
				if(platform=="SELF" || platform=="PROTOCOL"){
					layer.msg("取消订单申请成功");
				}else{
					layer.msg(result.msg);
					window.location.reload();
				}
			}else{
				layer.msg(result.msg);
			}
		},
		error : function(){
			$("body .loginBox").hide();
			$(document.body).css({"overflow-x":"auto", "overflow-y":"auto"});
			layer.msg("系统出现异常，请联系管理员！");
		}
	});
}

// 审批订单
function approvalOrder(obj ,orderNo, status){
	$.ajax({
		type : "POST",
		url : "/hotel/order/approval",
		data : {orderno:orderNo, result:status, reason:""},
		beforeSend: function () {
			$(document.body).css({
				"overflow-x":"hidden",
				"overflow-y":"hidden"
			});
			$("body .loginBox").html("<p style='width:50px;height:50px;position:fixed;left:0;top:0;bottom:0;right:0;transform:translate(-50%,-50%);z-index:1000;margin:auto;'><img  src='/resources/js/plugin/layer/theme/default/loading-2.gif'/></p>").show();
		},
		success : function(result){
			$("body .loginBox").hide();
			$(document.body).css({"overflow-x":"auto", "overflow-y":"auto"});
			console.log(result);
			layer.msg(result.msg);
			if(result.status == 200){
				window.location.reload();
			}
		},
		error : function(){
			$("body .loginBox").hide();
			$(document.body).css({"overflow-x":"auto", "overflow-y":"auto"});
			layer.msg("系统出现异常，请联系管理员！");
		}
	});
}

// 全部订单返回
function allCallBack(){
	window.location.href = "/hotel/order/all/list?tag=hotel";
}

// 个人订单返回
function perCallBack(){
	window.location.href = "/hotel/order/my/list?tag=hotel";
}

// 待支付订单类别
function wpayCallBack(){
	window.location.href = "/hotel/order/wait/pay/list?tag=hotelPay";
}

// 审批订单返回
function aproCallBack(type){
	if(type!=""){
		var types = type.split("-");
		window.location.href = "/myApproval/getAllApproveOrder/"+types[0]+"/"+types[1];
	}else{
		window.location.href = "/myApproval/getAllApproveOrder/0/all";
	}
}


$(".loginBox ").css('width',$(document.body).outerWidth(true),'height',$(document.body).outerHeight(true));
