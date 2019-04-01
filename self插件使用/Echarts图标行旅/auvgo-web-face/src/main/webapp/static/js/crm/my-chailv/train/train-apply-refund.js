/**
 * Created by yugong on 2018/1/12.
 */


$('body').on('click', '.label', function() {
	var idsStr = '';
	$(':checked').each(function() {
		idsStr += $(this).val() + '-';
	});
	$('.ids').val(idsStr);
});

// action-点击-点击查询
$('body').on('click', '#refund-btn', function() {

    if ($('.ids').val() == '') {
        layer.msg('请选择改签乘客！');
        return ;
    }
    
$.ajax({
  url:"/common/checktime",
  type:"post",
  success:function(data){
     if(data.status==200){
    	 $('#refund-form').submit();
     }else {
        layer.alert(data.msg);
     }
  },
  error: function(xhr, errorType, error) {
     layer.alert( "网络超时"+xhr.status);
     console.error(xhr);
     console.error(errorType || error);
  }
});
    
});