
//后台数据准备就绪
function javaData(data){
	var setting = {view:{dblClickExpand:false,showLine:false,selectedMulti:false},check:{enable: true},data:{simpleData: {enable: true}}, callback:{onCheck:onCheck}};
	var zNodes = data.zNodes;
	$(document).ready(function() {
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
	});
	function onCheck(e,treeId,treeNode){
		var treeObj=$.fn.zTree.getZTreeObj("treeDemo"),
        nodes=treeObj.getCheckedNodes(true);
		var value="";
		 for(var i=0;i<nodes.length;i++){
			 if(null!=nodes[i].id){
			 	value+="/"+nodes[i].id;
			 }
		 }
		 
		 $("#menuId").val(value);
		 $("input[name='id']").addClass("yesCaozuo");
    }
}


/*$("body").on("click",".confirmAdd",function(){
	if($("input[name='id']").val()!=""){
		if(!($("input[name='id']").is(".yesCaozuo"))){
			parent.$(".alert_window").next().remove().end().remove();
			return false;
		}
	}
	if($("#menuId").val()===""){
		zh.alerts({"text":"请选择角色范围！",'title':'提示'});
		return false;
	}
	$(this).attr("type","submit");
	
});*/

// ****
$("#RoleForm").Validform({
	ajaxPost : true,
	beforeCheck:function(curform){
//		if($("input[name='id']").val()!=""){
//			if(!($("input[name='id']").is(".yesCaozuo"))){
//				parent.$(".alert_window").next().remove().end().remove();
//				return false;
//			}
//		}
		if($("#menuId").val()===""){
			zh.alerts({"text":"请选择角色范围！",'title':'提示'});
			return false;
		}
		//$(this).attr("type","submit");
							
	},
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status == 200) {
			$.Hidemsg();
			var tips = ($(".isEdit_").val() == "") ? "添加成功" : "保存成功";
			zh.alerts({
				title:"提示",
				text:tips
			});
			$("body").on("click",".alert_event",function(){
				top.location.reload();
			});
		} else {
			zh.alerts({
				title:"提示",
				text:"添加失败"
			});
		}
	}
});		







