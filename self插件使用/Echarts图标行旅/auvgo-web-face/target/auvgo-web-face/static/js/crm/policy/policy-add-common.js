/*员工职级两输入框由低到高校验*/
/*监听第一个输入框*/
$("body").on("click",".drop_option li",function(){
	if($(this).parents(".drop").find("select").is("[name='startlevel']")){
		if($("._select_[name='endlevel']").val()!=""){
			CompZhiJi($(this));
		}	
	}
});
/*监听第二个输入框*/
$("body").on("click",".drop_option li",function(){
	if($(this).parents(".drop").find("select").is("[name='endlevel']")){
		if($("._select_[name='startlevel']").val()!=""){
			CompZhiJi($(this));
		}	
	}
});
/*员工职级比较函数*/
function CompZhiJi(this_){
	var val1=Number($("._select_[name='startlevel']").val());
	var val2=Number($("._select_[name='endlevel']").val());
	var this_=this_.parents(".drop");
	if(val1>val2){
		zh.alerts({'title':'提示','text':"员工职级只能由底到高"});
		this_.find("._select_").val("");
		this_.find(".drop_title").html(this_.find("option:first").html());
	}
}


/*里程范围-两输入框由低到高校验*/
/*监听第一个输入框*/
$("body").on("click",".drop_option li",function(){
	if($(this).parents(".drop").find("select").is("[name='startmile']")){
		if($("._select_[name='endmile']").val()!=""){
			CompLiCheng($(this));
		}	
	}
});
/*监听第二个输入框*/
$("body").on("click",".drop_option li",function(){
	if($(this).parents(".drop").find("select").is("[name='endmile']")){
		if($("._select_[name='startmile']").val()!=""){
			CompLiCheng($(this));
		}	
	}
});
/*员工职级比较函数*/
function CompLiCheng(this_){
	var val1=Number($("._select_[name='startmile']").val());
	var val2=Number($("._select_[name='endmile']").val());
	var this_=this_.parents(".drop");
	if(val1>val2){
		zh.alerts({'title':'提示','text':"请选择正确的里程范围"});
		this_.find("._select_").val("");
		this_.find(".drop_title").html(this_.find("option:first").html());
	}
}


//航班前后N小时是否显示经停航班
$('body').on('click','.isfilterStop_ls .isfilterStop_label',function () {
	var isfilterStop_box = $(this).siblings('.isfilterStop_box');
	var index = $(this).find('input').attr("name").split('_')[1];
	$(this).parents('.isfilterStop_ls').find('.isfilterStop_box').find('input').attr('name',"").prop('checked',false).val("0");
	$('.isfilterStop_ls').find('.isfilterStop_box').hide();
	if(isfilterStop_box.length>0){
		if($(this).find('input').prop("checked")){
			$(this).parents('.isfilterStop_ls').find('.isfilterStop_box').removeClass('label-select-checkbox');
			isfilterStop_box.find('input').attr('name',"isfilterStop_"+index).val("0");
			isfilterStop_box.show();
		}else{
			isfilterStop_box.hide();
			isfilterStop_box.find('input').attr('name',"isfilterStop_"+index).val("0");
		}
	}
});
$('body').on('click','.isfilterStop',function () {
	if($(this).prop("checked")){
		$(this).val("1");
	}else{
		$(this).val("0");
	}
	
});