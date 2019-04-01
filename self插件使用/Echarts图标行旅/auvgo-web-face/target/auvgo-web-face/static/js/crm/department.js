// 添加部门
$("body").on("click",".add_department",function(){
	openIframe({'url':"/crm/depart/add/" + $(this).attr('data-cid'),'title':"添加部门"});
});
// 删除部门
function removeDepartment(depid){
	zh.confirms({
		title:"提示",
		text:"确定删除该部门么？"
	});
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			   type: "POST",
			   url: "/crm/depart/remove/"+depid,
			   success: function(data){
				   if (data.status == 200) {
						zh.alerts({
							title:"提示",
							text:"删除成功"
						});
						$("body").on("click",".alert_event",function(){
							top.location.href='/crm/depart';
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
//批量导入
$('body').on('click', '.bulk-import', function(){
	openIframe({'url':"/crm/depart/toupload/" + $(this).attr('data-cid'),'title':'批量导入','height':"425px"});
});
// 点击-批量生成成本中心
$("body").on("click",".bulk-costcenter",function(){
	addListCost($(this).attr('data-cid'));
});
//批量生成成本中心
function addListCost(cid){
	var ss="";
	$("[name='ids']:checked").each(function(){
		ss+=$(this).val()+"-";
	});
	if(ss===''){
		zh.alerts({"title":"关联失败","text":"请选择部门！"});
		return false;
	}
	$.ajax({
		url:'/crm/depart/saveList/'+cid,
		type:'post',
		data:{'ss':ss},
		success:function(data){
			if(data.status=200){
				zh.alerts({'title':"提示",'text':"批量添加成功"});
			}else{
				zh.alerts({'title':"提示",'text':data.msg});
			}
		}
	});
}
function ztreeMain(data){
	$(function(){
		var zNodes = data.zNodes;
		var	setting = {view:{dblClickExpand:false,showLine:false,selectedMulti:false},data:{simpleData:{enable: true}},
				callback : {
					beforeClick : function(treeId, treeNode) {
						if(treeNode.id == 0){
							location.href=data.href0;
						}else{
							location.href=data.href1+"?q_EQ_id="+treeNode.id;
						}
					}
				}		
		};
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		
		var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		var nodes = treeObj.getSelectedNodes();
		if (nodes.length>0) {
			treeObj.expandNode(nodes[0], false, false, false);
		}
	});
}
// 组织架构
$(document).ready(function(){
    $("#relevation-person").click(function(){
        $(".framework").slideToggle();
    });
});
$('#relevation-person').click(function(){
    if($(this).text() == '收起')
    {$(this).text('组织架构').css({"background":'white',"color":'#6461e2'})}
    else
    {$(this).text('收起').css({"background":'#6461e2',"color":'white'})}
})