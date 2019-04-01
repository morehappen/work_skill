/*关联/解除角色用户 start*/
function cityMove(element_start,element_end){ //参数：原位置，目标位置
		element_end.append(element_start);
}
/*保存已关联人的id*/
function alwaysRoleids(){
	var ids="";
	$(".alwaysSet option").each(function(){
		ids+=$(this).val()+"-";
	});
	$(".alwaysRole").val(ids);
}
alwaysRoleids();
$("body").on("click",".rightMove",function(){ //右移
	cityMove($(".noSet option:selected"),$(".alwaysSet")); 
	alwaysRoleids();
});
$("body").on("click",".leftMove",function(){ //左移
	cityMove($(".alwaysSet option:selected"),$(".noSet"));
	alwaysRoleids();
});

/*关联/解除角色用户 end*/