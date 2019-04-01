function showGeoLayer(title, url) {
	zh.iframes({
		url: url,
		title: title,
		width: '435px',
		height: '300px'
	});
}

function showGeoCityLayer(title, url) {
	zh.iframes({
		url: url,
		title: title,
		width: '435px',
		height: '500px'
	});
}

// 删除
function removeGeoById(url){
	layer.confirm("确定要删除吗？", function(index){
		$.ajax({
			url : url,
			method : "POST",
			dataType : "json",
			beforeSend : function() {
				layer.load(2);
			},
			complete : function() {
				layer.closeAll('loading');
			},
			success : function(data) {
				if (data.status == 200) {
					layer.msg("操作成功");
				} else {
					layer.msg(data.msg);
				}
				setTimeout(function() {
					location.reload();
				}, 1000);
			}
		});
	});
}

// 保存修改
function submitGeoAuto(){
	var alias = $("#alias_i").val();
	var level = $("#level_i").val();
	if(alias == ""){
		layer.msg("级别名称为空");
		return false
	}
	if(level == ""){
		layer.msg("城市级别为空");
		return false
	}
	$.ajax({
		type : "POST",
		url : "/chailv/hotel/geo/save/update/geotierauto",
		data : $("#geo_auto_form").serialize(),
		dataType : "JSON",
		success : function(data){
			if(data.status == 200){
				layer.msg("保存成功");
				setTimeout(function (){top.location.reload();},1000);
			}else{
				layer.msg(data.msg);
			}
		},
		errir : function(){
			layer.msg("系统重新异常，请联系管理员");
		}
	});
}