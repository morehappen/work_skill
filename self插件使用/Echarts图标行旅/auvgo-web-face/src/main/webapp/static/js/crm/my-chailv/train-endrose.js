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


$(function(){
	//初始化分页
    kkpagerMain({'pno':$('[data-ele="pagenum"]').val(),'total':$('[data-ele="pages"]').val(),'totalRecords':$('[data-ele="total"]').val(),'pageSize':$('[data-ele="pagesize"]').val(),'pageNo':$("#pageNo"),'submit_element':$("#TrainEndroseForm")}); 
    
});

