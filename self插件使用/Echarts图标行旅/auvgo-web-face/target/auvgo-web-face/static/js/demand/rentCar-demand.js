//租车表单提交
$("#rentCar").Validform();
$(function(){
	//判断是否设置了类型
	(function(){
		if($(".findzdMsg_hidden").attr("data-istype") == "1"){
			isType("请先设置租车类型，以操作需求单!");
		}
	})();
});