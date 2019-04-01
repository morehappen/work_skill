// 点击-删除
$('body').on('click', '.btn-danger', function(){
	var $this = $(this);
	deleteitem($this.data('id'));
});

//删除
function deleteitem( id){
	
	zh.confirms({
		title:"提示",
		text:"确定删除该审批级别么？"
	});
	
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			url: '/crm/approve/remove/' + id,
			type: 'post',
			success: function(data){
				if(data.status != 200){
					console.log(data);
					return ;
				}
				location.reload();
			},
			error:function(xhr, errorType, error){
				console.log(xhr);
				console.log(errorType || error);
			}
		});
	});
}

// 点击关联部门
$('body').on('click', '.associated-dept', function(){
	costAssoEmp($(this).data('apid'));
});

// 关联部门
function costAssoEmp(apid){
	openIframe({
		'url':"/crm/approve/relationdept/"+apid,
		'title':"关联部门",
		'width':'470px',
		'height':'400px'
	});	
}