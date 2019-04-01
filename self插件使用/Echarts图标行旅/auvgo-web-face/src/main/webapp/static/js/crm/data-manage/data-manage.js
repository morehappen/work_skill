// ajax-content
//function valuelist(treeid, treename, callback){
//	$.ajax({
//		url: '/crm/data/valuelist',
//		type: 'post',
//		data: {zid:treeid, treename:treename},
//		success: function(data){
//			if(data.status != 200){
//				console.log(data);
//				return ;
//			}
//			
//			if(data.data == null){
//				console.log('data.data为null');
//				return ;
//			}
//			
//			var data = JSON.parse(data.data);
//			
//			$('#btn-des').html(treename).data('treeid', treeid);
//			
//			typeof callback == 'function' && callback(data);
//			
//		},
//		error:function(xhr, errorType, error){
//			console.log(xhr);
//			console.log(errorType || error);
//		}
//	});
//};

// 删除
function deleteitem(vid,treeid,treename, callback){
	
	zh.confirms({
		title:"提示",
		text:"确定删除么？"
	});
	
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			url: '/crm/data/remove/'+vid,
			type: 'post',
			success: function(data){
				if(data.status != 200){
					console.log(data);
					return ;
				}
				
				location.reload();
				
				//valuelist(treeid , '添加' + treename, updateContent);
			},
			error:function(xhr, errorType, error){
				console.log(xhr);
				console.log(errorType || error);
			}
		});
	});
}

// 更新-dom
//function updateContent(data){
//	var html = '';
//	for(var i = 0; i < data.length; i++){
//		var curr = data[i];
//		html += 
//			'<tr>' +
//				'<td>' + (i+1) + '</td>' +
//				'<td>' + curr.name + '</td>' +
//				'<td>' + (curr.value ? curr.value:'') + '</td>' +
//				'<td>' + (curr.sort ? curr.sort : '')  + '</td>' +
//				'<td class="table_caozuo">' +
//					'<div class="clear table-btn-div">' +
//						'<button type="button" class="btn btn-default btn-small edit" data-zid="' + curr.zidianid + '" data-vid="' + curr.id + '">编辑</button>' +
//						'<button type="button" class="btn btn-danger btn-small" data-vid="' + curr.id + '">删除</button>' +
//					'</div>' +
//				'</td>' +
//			'</tr>';
//	}
//	
//	$('#ajax-table').html(html);
//}


// 点击-tab
//$('body').on('click', '.aside-nav-tab', function(){	
//	var $this = $(this);
//	
//	$this.addClass('color-6461e2').siblings().removeClass('color-6461e2');
//	
//	valuelist( $this.data('value'), '添加' + $this.text(), updateContent);
//	
//});


// 点击-删除
$('body').on('click', '.table .btn-danger', function(){
	var $this = $(this);
	var vid = $this.data('vid'); 
	var treeid = $('#btn-des').data('treeid');
	var treename = $('.aside-nav').find('.color-6461e2').html();
	deleteitem(vid, treeid, treename);
});


// 点击按钮-跳转
$('body').on('click', '#btn-des', function(){
	zh.iframes({
		url: '/crm/data/add/' + $(this).data('treeid'),
		title: $(this).html(),
		width: '435px',
		height: '300px'
	});
});


// 点击-编辑
$('body').on('click', '.edit', function(){
	zh.iframes({
		url: '/crm/data/edit/' + $(this).data('zid') + '/' + $(this).data('vid'),
		title: $(this).html(),
		width: '435px',
		height: '300px'
	});
});









