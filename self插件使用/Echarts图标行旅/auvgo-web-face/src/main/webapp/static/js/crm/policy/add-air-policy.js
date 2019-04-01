// 点击-确定按钮
$("#chailvguoneiForm").Validform({
	btnSubmit: '#save-btn',
	ajaxPost : true,
	callback : function(data) {
		$("#Validform_msg").hide();
		if (data.status != 200) {
			zh.alerts({ title:"提示", text:data.msg });
			return ;
		}
		zh.alerts({
			title:"提示",
			text:"操作成功！"
		});
		$("body").on("click",".alert_event",function(){
			location.href="/crm/chailv/";
		});
	}
});


// 点击-可否乘坐飞机
//$('body').on('click', '.allowfly',function(){
//	var $this = $(this);
//	
////	$this.hasClass('label-select-checkbox') ? $('.allowfly-content').show() : $('.allowfly-content').hide();
//	
//	var $allowflyContent = $('.allowfly-content');
//	
//	if($this.hasClass('label-select-checkbox')){
//		$allowflyContent.show();
//	}else{
//	
//		$allowflyContent.hide();
//		
//		$allowflyContent.find('label').removeClass('label-select-checkbox label-select-radio');
//		$allowflyContent.find('.input').val('');
//		$allowflyContent.find('._select_').val('');
//		$allowflyContent.find('.drop_title').html('请选择');
//	}
//	
//});


// 点击-添加里程
$('body').on('click', '.add-licheng', function(){
	var $this = $(this),
		$eveyModel = $this.closest('.every-model'),
		$licheng = $eveyModel.find('.licheng:first'),
		$newlicheng = $licheng.clone(true);
	// 初始化默认选中-控件
	initCtr($newlicheng);
	// 追加删除按钮
	$newlicheng.find('.add-licheng').parent().append('<button type="button" class="btn btn-danger btn-middle remove-licheng">删除</button>');
	$eveyModel.append($newlicheng);
	$('[name="chailvSize"]').val($('.licheng').length);
});

// 初始化所有控件的默认选中值
function initCtr($licheng){
	// 修改name属性值
	var currIndex = $('.licheng').length;//新增里程下角标
	$licheng.find('[name]').each(function(){
		var $this = $(this);
		var orginName = $this.prop('name');
		var newName = orginName.replace('0', currIndex);
		$this.prop('name', newName);
	});
	$licheng.find('._select_').each(function(){
		var $this = $(this);
		$this.val('').next().html($this.find("option:first").text());
	});
	// 复选框
	$licheng.find('.label-checkbox').each(function(){
		$(this).removeClass('label-select-checkbox');
	});
	// 输入框
	$licheng.find(':text').each(function(){
		$(this).val('');
	});
	// 单选框
	$licheng.find('.label-radio').each(function(){
		var $this = $(this);
		$this.index() == 0 ? $this.addClass('label-select-radio') : $this.removeClass('label-select-radio');
	});
	// 部分控件的显示与隐藏控制
	$licheng.find('.allowfly-ctr').css({'display': 'none'});
	$licheng.find('.can-fly').css({'display': 'block'});
}


// 点击-删除里程
$('body').on('click', '.remove-licheng', function(){
	var $this = $(this);
	var $licheng = $this.closest('.licheng');
	$licheng.remove();
	$('[name="chailvSize"]').val($('.licheng').length);

	// 修改除第一个以外的所有name属性值
	$('.licheng').each(function() {
		var $this = $(this);
		var newIdex = $this.index() - 1;//脚标
		// 所有name元素
		$this.find('[name]').each(function(){
			var $this = $(this);
			var orginName = $this.prop('name');//原始name属性值
			var newName = '';
			// ！(提醒&&不允许)
			if ( !(/controller/.test(orginName)) ) {
				newName = orginName.substr(0, (orginName.length - 1)) + newIdex;
			}
			// 提醒||不允许
			else {
				newName = 'controller_' + newIdex +  orginName.substr(-2); 
			}
			$this.prop('name', newName);
		});
	});
});

// 允许||不允许-fly
$('body').on('click', '.can-allow .label-radio', function(){
	var $this = $(this),
		canallow = $this.closest('.can-allow').find('.label-select-radio input').val(),
		$allowflyCtr = $this.closest('.licheng').find('.allowfly-ctr');
//	canallow == 0 ? $allowflyCtr.show() : $allowflyCtr.hide();
	if (canallow == 0) {
		$allowflyCtr.show();
	}else {
		// 允许乘坐飞机
		// 重置ctr && 展示can-fly
		$allowflyCtr.hide();
		$allowflyCtr.find('.label-radio').each(function(){
			$(this).index() == 0 ? $(this).addClass('label-select-radio') : $(this).removeClass('label-select-radio');
		});
		var $canfly = $this.closest('.licheng').find('.can-fly');
		$canfly.show();
	}
});


// 允许||不允许-ctrl
$('body').on('click', '.allowfly-ctr .label-radio', function(){
	var $this = $(this),
		canfly = $this.closest('.allowfly-ctr').find('.label-select-radio input').val(),
		$canfly = $this.closest('.licheng').find('.can-fly');
	canfly == 1 ? $canfly.show() : $canfly.hide();
});









