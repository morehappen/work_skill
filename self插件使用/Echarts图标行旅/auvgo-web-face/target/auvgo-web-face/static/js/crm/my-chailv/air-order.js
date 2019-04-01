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

$(function(){
	//初始化分页
    kkpagerMain({'pno':$('[data-ele="pagenum"]').val(),'total':$('[data-ele="pages"]').val(),'totalRecords':$('[data-ele="total"]').val(),'pageSize':$('[data-ele="pagesize"]').val(),'pageNo':$("#pageNo"),'submit_element':$("#AirOrderForm")}); 
});

