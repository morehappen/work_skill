// 添加城市级别
$('body').on('click', '.add-city-rank', function(){
	zh.iframes({
		url: '/crm/data/add/' +  $(this).data('zid'),
		title: $(this).html(),
		width: '430px',
		height: '260px'
	});
});

// href="/crm/data/edit/$!{cid}/$!{zid}/$!{v.id}"
// 添加城市级别
$('body').on('click', '.edit', function(){
	zh.iframes({
		url: '/crm/data/edit/'  + $(this).data('zid') + '/' + $(this).data('vid'),
		title: $(this).html(),
		width: '430px',
		height: '260px'
	});
});

//点击删除
$('body').on('click', '.btn-danger', function(){
	var vid = $(this).data('vid');
	
	zh.confirms({ title:"提示", text:"确定删除么？" });
	
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			url:'/crm/data/remove/'+vid,
			type: 'post',
			success: function(data){
				if(data.status != 200){
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
	
});
