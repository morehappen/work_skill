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


// 选择城市
$('body').on('click', '.drop_option li', function(){
	var $choseCity = $('#chose-city');
	ajaxCityData($choseCity.val(), $choseCity.attr('data-bandid'), updateCityData);
});

// ajax-请求城市数据
function ajaxCityData(proid,  bandid, callback){
	$.ajax({
		url: '/crm/data/getCityList/' + proid + '/' +  bandid,
		type: "post",
		success: function(data){
//			console.log(data);
			if(data.status != 200) return ;
			if(data.data == 'null'){
				 console.error('data.data为undefined');
				 return ;
			}
			var data = data.data;
			data = JSON.parse(data.newcity);
//			console.log(data);
			typeof callback == 'function' && callback(data);
		},
		error: function(xhr, errorType, error){
			console.log(xhr);
			console.log(errorType || error);
		}
	});
}


// 更新-城市数据
function updateCityData(data){
	var html = '';
	(function(){
		var i = 0,
			len = data.length;
		for(i = 0;i < len;i++){
			html += '<option value="' + data[i].cityCode + '">' + data[i].cityName + '</option>';
		}
	})();
	html == '' && (html += '<option value="" disabled style="color:red">该城市已关联</option>');
	$('.noSet').html(html);
}


// 查询-城市
$("body").on("click", "#searchCity", function(){
	var names = $("input[name='cityName']").val();
	names != '' && ajaxQueryData(names, updateCityData);
}); 

// ajax-查询
function ajaxQueryData(cname, callback){
	$.ajax({
		type: 'POST',
		url: '/crm/data/seachCityList/' + encodeURI(cname) + '/' + $('#chose-city').attr('data-bandid'),
		success: function(data){
			if(data.status != 200) {
				console.log(data);
				return ;
			}
			if(data.data == 'null'){
				 console.error('data.data为undefined');
				 return ;
			}

			var data = JSON.parse(data.data);
			typeof callback == 'function' && callback(data);

		},
		error: function(xhr, errorType, error){
			console.log(xhr);
			console.log(errorType || error);
		}
	});
}

// ajax 保存
$("#saveCityId").click(function(){
	var ids = '';
	$(".alwaysSet").children("option").each(function(){
		ids = ids + $(this).val() + "-";
	});
	 $.ajax({
		type: "POST",
		url:"/crm/data/saveCityList",
		data:{levelid:$('#chose-city').attr('data-bandid'),cityid:ids},
		success: function(data){
			if (data.status == 200) {
				zh.alerts({ title:"提示", text:"保存成功！" });
				location.reload();
			} else {
				zh.alerts({ title:"提示", text:"保存失败！" });
			}
		}
	 });  
}); 




