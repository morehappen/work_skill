// 初始化左侧导航 以及window滚动事件
new ScrollNav($('.aside-nav'));

// 机票正常单查询前验证
$("#AirOrderForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var val = $("#date_select").val();
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		
		if (val == '') {
			if (!($gteDate.val() == '' && $lteDate.val() == '')) {
				zh.alerts({ title:"提示", text:"请选择日期类型!" });
				return false;
			}
		}else if(val == 'createtime'){
			$gteDate.attr("name","q_GTE_orders.createtime");
			$lteDate.attr("name","q_LTE_orders.createtime");
		}else if(val == 'deptdate'){
			$gteDate.attr("name","q_GTE_routes.deptdate");
			$lteDate.attr("name","q_LTE_routes.deptdate");
		}
		//return false;
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
		
	}
});



// 机票改签单查询前验证
$("#AirEndroseForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 机票退票单查询前验证
$("#AirRefundForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 酒店订单查询前验证
$("#HotelOrderForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var val = $("#date_select").val();
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		if (val == '') {
			if (!($gteDate.val() == '' && $lteDate.val() == '')) {
				zh.alerts({ title:"提示", text:"请选择日期类型!" });
				return false;
			}
		}else if(val == 'yuding'){
			$gteDate.attr("name","q_GTE_orders.createtime");
			$lteDate.attr("name","q_LTE_orders.createtime");
		}else if(val == 'ruzhu'){
			$gteDate.attr("name","q_GTE_orders.arrivalDate");
			$lteDate.attr("name","q_LTE_orders.arrivalDate");
		}else if (val == 'lidian') {
			$gteDate.attr("name","q_GTE_orders.departureDate");
			$lteDate.attr("name","q_LTE_orders.departureDate");
		}
		//return false;
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 火车票正常单查询前验证
$("#TrainOrderForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var val = $("#date_select").val();
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		if (val == '') {
			if (!($gteDate.val() == '' && $lteDate.val() == '')) {
				zh.alerts({ title:"提示", text:"请选择日期类型!" });
				return false;
			}
		}else if(val == 'createtime'){
			$gteDate.attr("name","q_GTE_orders.createtime");
			$lteDate.attr("name","q_LTE_orders.createtime");
		}else if(val == 'deptdate'){
			$gteDate.attr("name","q_GTE_orders.travel_time");
			$lteDate.attr("name","q_LTE_orders.travel_time");
		}
		//return false;
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 火车票-退票
$("#TrainRefundForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 火车票-改签
$("#TrainEndroseForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});

// 出差申请单查询前验证
$("#ChailvApplicationForm").Validform({
	ajaxPost : false,
	beforeSubmit : function() {
		var val = $("#select_date").val();
		var $gteDate = $('#GTE_date');
		var $lteDate = $('#LTE_date');
		if (val == '') {
			if (!($gteDate.val() == '' && $lteDate.val() == '')) {
				zh.alerts({ title:"提示", text:"请选择日期类型!" });
				return false;
			}
		}else if(val == 'shenqing'){
			$gteDate.attr("name","q_GTE_approvaltime");
			$lteDate.attr("name","q_LTE_approvaltime");
		}else if(val == 'start'){
			$gteDate.attr("name","q_GTE_travelstart");
			$lteDate.attr("name","q_LTE_travelstart");
		}else if(val == 'end'){
			$gteDate.attr("name","q_GTE_travelend");
			$lteDate.attr("name","q_LTE_travelend");
		}
		//return false;
		
		// 时间判断
		var status = timeTips($gteDate, $lteDate);
		return status;
	}
});


// 结束时间回显问题
(function reShow(){
	var $LTEdate = $('#LTE_date');
	
	if ($LTEdate.val() && ($LTEdate.val().toString().length > 10)) {
		var reShowStr = $LTEdate.val().toString().substr(0, 10);
		
		$LTEdate.val(reShowStr);
	}
	
})();



