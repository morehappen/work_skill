/**
 * Created by yugong on 2018/1/12.
 */

// action-点击-选乘客
$('body').on('click', '.e-l-c-person .label', function() {
	var idsStr = '', idStr = '';
	
	$('.e-l-c-person').find(':input:checked').each(function() {
		idsStr += $(this).val() + '-';
		idStr += $(this).attr('data-id') + '-'
	});
	
	$('.ids').val(idsStr);
	$('.id').val(idStr);
	
});


// action-点击-点击查询
$('body').on('click', '#endorse-btn', function() {
	
	if ($('.ids').val() == '') {
		layer.msg('请选择改签乘客！');
		return ;
	}
	
	if ($('.endorse-date').val() == '') {
		layer.msg('请选择改签日期！');
		return ;
	}
	
	$('#endorse-form').submit();
});