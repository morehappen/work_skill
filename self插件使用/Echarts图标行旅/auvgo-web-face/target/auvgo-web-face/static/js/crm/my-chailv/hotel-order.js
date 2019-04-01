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



$(function(){
	//初始化分页
    kkpagerMain({'pno':$('[data-ele="pagenum"]').val(),'total':$('[data-ele="pages"]').val(),'totalRecords':$('[data-ele="total"]').val(),'pageSize':$('[data-ele="pagesize"]').val(),'pageNo':$("#pageNo"),'submit_element':$("#HotelOrderForm")}); 
});