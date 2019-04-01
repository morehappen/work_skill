//抓取员工id
(function(){
	var ids='';
	parent.$(".everyChecked:checked").each(function(){
		ids+=$(this).val()+"-";
	});
	$(".empids").val(ids);
})();
