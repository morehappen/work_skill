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



$(function(){
	//初始化分页
    kkpagerMain({'pno':$('[data-ele="pagenum"]').val(),'total':$('[data-ele="pages"]').val(),'totalRecords':$('[data-ele="total"]').val(),'pageSize':$('[data-ele="pagesize"]').val(),'pageNo':$("#pageNo"),'submit_element':$("#ChailvApplicationForm")}); 
});