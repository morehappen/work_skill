// 点击-添加地址
$('body').on('click', '.add-address', function(){
	zh.iframes({
		url: '/crm/psaddress/add',
		title: $(this).html(),
		width: '600px',
		height: '480px'
	});
});


// 点击-编辑
$('body').on('click', '.edit', function(){
	zh.iframes({
		url: '/crm/psaddress/edit/' + $(this).data('aid'),
		title: $(this).html(),
		width: '600px',
		height: '480px'
	});
});

// 点击-删除
function removeAddress(id){
	zh.confirms({
		title:"提示",
		text:"确定删除该地址么？"
	});
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			   type: "POST",
			   url: "/crm/psaddress/remove",
			   data:{id:id},
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
