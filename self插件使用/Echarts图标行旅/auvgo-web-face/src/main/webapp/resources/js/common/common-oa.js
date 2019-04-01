/**
 * Created by dell on 2018/11/14.
 */
//        第三方登录是否有值
if($('.isoalogin_flag').val()!=""){
	$('[data-flag="air"]').remove();
	if($('.sub-nav .sub-nav-ul a').length>0){
		$('.sub-nav').show();
	}else{
		$('.sub-nav').hide();
	}
}