// 点击-添加
$('body').on('click', '.add-approve', function(){
	updateTr();
});

// 更新-dom
function updateTr(){
	var len = $('#approve-wrapper').find('tr').length + 1;
	
	var html = 
		'<tr>' + 
			'<td>' + len + '级审批</td>' + 
			'<td class="input-td">' + 
				'<input type="text" class="input"  name="spname" id="name_' + len + '"/>' +
				'<ul class="input-ul"></ul>' +
				
				'<input type="hidden" name="spuserid" id="userid_' + len + '" value="" />' +
				'<input type="hidden" name="splevel" value="' + len + '" />' +
			'</td>' + 
			'<td class="table_caozuo">' + 
				'<div class="clear table-btn-div">' + 
					'<button type="button" class="btn btn-danger btn-small">删除</button>' + 
				'</div>' + 
			'</td>' + 
		'</tr>';
	$('#approve-wrapper').append(html);
}

$("#approveForm").Validform({
	ajaxPost : true,
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status == 'y') {
			zh.alerts({
				title:"提示",
				text:data.info
			});
			$("body").on("click",".alert_event",function(){
				location.href="/crm/approve/";
			});
		} else {
			zh.alerts({
				title:"提示",
				text:data.info
			});
		}
	}
});


// 获取-焦点
$('body').on('focus', '[name="spname"]', function(){
	var $this = $(this);
	var $currInputUl = $this.next('.input-ul');
	
	$currInputUl.show();
	
	ajaxGetApprove( $currInputUl);
});


// 失去-焦点
//$('body').on('blur', '[name="spname"]', function(){
//	$('.input-ul').hide();
//});


// ajax-获取审批人
function ajaxGetApprove( $target){
	$.ajax({
		   type: 'POST',
		   url: '/crm/employee/jqauto',
		   success: function(data){
//			   console.log(data);
			   updateApprove(data, $target);
		   }
	});
}


// 更新-审批人
function updateApprove(data, $targ){
	var html = '';
	data.forEach(function(curr, index, array){
		html += '<li class="every-list" data-id="' + curr.id + '" data-content="' + curr.name + '">' + curr.name + '[' + curr.deptname + ']' + '</li>';
	});
	
	$targ.html(html);
	
	$('body').on('click', '.every-list', function(){
		var $this = $(this);
		$this.closest('.input-ul').prev('input').val($this.data('content'));
		$this.closest('.input-ul').next('input').val($this.data('id'));
		$this.closest('.input-ul').hide();
	});
}

// 点击-删除
$('body').on('click', '.btn-danger', function(){
	$(this).closest('tr').remove();
});