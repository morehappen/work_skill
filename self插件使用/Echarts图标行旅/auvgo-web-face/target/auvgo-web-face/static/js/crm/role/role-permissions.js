function javaData(data){
	//添加角色
	$("body").on("click",".add_role",function(){
		openIframe({'url':data.role.url,'title':data.role.title,'width':"794px",'height':'350px'});
	});
}
//修改角色
function editRole(roleId){
	openIframe({'url':"/crm/role/edit/"+roleId,'title':'编辑角色','width':"794px",'height':'350px'});
}
//删除角色
function removeRole(roleid){
	zh.confirms({
		title:"提示",
		text:"确定删除该角色么？"
	});
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			   type: "POST",
			   url:'/crm/role/remove/'+roleid,
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