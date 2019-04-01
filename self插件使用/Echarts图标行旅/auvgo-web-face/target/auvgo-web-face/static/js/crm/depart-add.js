//后台数据准备就绪，开始读取
function javaData(data){
	//ztree
	$(function(){
		var setting = {
			view: {dblClickExpand: false},
			data: {simpleData: {enable: true}},
			callback: {onClick: onClick}
		},
		zNodes =data.ztree.zNodes;
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		if($('[name="id"]').val()!=""){
			var nodes = treeObj.getNodeByParam("id", data.dept, null);
			$("#citySel").val(nodes.name);
		}
	});
}

function showMenu() {
	var cityObj = $("#citySel");
	var cityOffset = $("#citySel").offset();
	$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
	$("body").bind("mousedown", onBodyDown);
}

function hideMenu() {
	$("#menuContent").fadeOut("fast");
	$("body").unbind("mousedown", onBodyDown);
}

function onBodyDown(event) {
	if (!(event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
		hideMenu();
	}
}

function onClick(e, treeId, treeNode) {
	$("#citySel").val(treeNode.name);
	$("#deptpid").val(treeNode.id);
}

		
			
			
			
			
			
			
			
			
			
			
			
			