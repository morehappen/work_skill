function removeLevel(id){
	zh.confirms({
		title:"提示",
		text:"确定删除该部门么？"
	});
}

$('body').on('click', '.addEmpLevelPage', function(){
	var $this = $(this);
	zh.iframes({
		url: '/crm/employee/toAdd/' + $this.data('zidianid'),
		title: $this.data('textdes'),
		width:"420px",
		height:"298px"
	});
});

//删除职级
function removeLevel(leveid){
	zh.confirms({
		title:"提示",
		text:"确定删除该职级么？"
	});
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			   type: "POST",
			   url: "/crm/employee/remove/"+leveid,
			   success: function(data){
				   if (data.status == 200) {
						zh.alerts({
							title:"提示",
							text:"删除成功"
						});
						$("body").on("click",".alert_event",function(){
							top.location.reload();
						});
					} else {
						zh.alerts({
							title:"提示",
							text:"删除失败"
						});
					}
			   }
		});
	});
}


//编辑员工等级
function EditLevel(leveid){
	zh.iframes({
		url: '/crm/employee/editEmplevel/' + leveid,
		title: "编辑员工等级",
		width: "420px",
		height: "298px"
	});
}