
//申请退票上传图片功能
function getPhoto(node) {
	var imgURL = "";
	try{
		var file = null;
		if(node.files && node.files[0] ){
			file = node.files[0];
		}else if(node.files && node.files.item(0)) {
			file = node.files.item(0);
		}
		//Firefox 因安全性问题已无法直接通过input[file].value 获取完整的文件路径
		try{
			imgURL =  file.getAsDataURL();
		}catch(e){
			imgRUL = window.URL.createObjectURL(file);
		}
	}catch(e){
		if (node.files && node.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				imgURL = e.target.result;
			};
			reader.readAsDataURL(node.files[0]);
		}
	}
	creatImg(imgRUL);
	return imgURL;
}
function creatImg(imgRUL){
	$("._logo").find("img").remove();
	var textHtml = "<img class='_logo' src='"+imgRUL+"'/>";
	$("._logo").append(textHtml);
}
$("body").on("mouseenter",".file_up",function(){
	$(".size_limit").show();
});
$("body").on("mouseleave",".file_up",function(){
	var $loginPic =  $('#logopic');
	var $sizeLimit = $('.size_limit');

	if ($loginPic.length == 0) {
		$sizeLimit.show();
	}
	else {
		$loginPic.attr('src') != '' && $sizeLimit.hide();
	}
});




//机票改签查询

$("body").on("click","#change-query",function(){

	if($('input[name="orderNo"]').val() === ""){
		layer.msg("未获取到订单号！");
		return;
	}
	if($('input[name="passid"]').val() === ""){
		layer.msg("请选择需要改签的乘机人！");
		return;
	}
	if($('input[name="queryDate"]').val() === ""){
		layer.msg("请选择改签日期！");
		return;
	}
	if($.trim($('input[name="gqreason"]').val()) == ""){
		layer.msg("请填写改签原因！");
		return;
	}
	$("#changeQueryForm").submit();
});
//选择乘机人
$("body").on("click",".person-c .label",function(){
	var this_ = $(this),
		parents = this_.parents(".person-c"),
		ids = "";
	parents.find(".label").each(function(){
		var this_ = $(this).find("input");
		if(this_.prop("checked")){
			ids += this_.val() + "-";
		}
	});
	$('input[name="passid"]').val(ids);
});
// 鼠标经过-退改签
$('.tuigai-des').hover(function(){
	$(this).find('table').stop().fadeIn();
}, function(){
	$(this).find('table').stop().fadeOut();
});

//切换退票原因
$('body').on('click', '.tp-content .drop_option li', function() {
	var $this = $(this),
		$select = $this.parents(".drop").find("select");

	if ($select.is(".tp_reason_select")) {
		if($select.val() == "其他原因"){
			$('input[name="tpReason"]').val("").show();
		}else{
			$('input[name="tpReason"]').val($select.val()).hide();
		}
	}
});



//提交退票
$("body").on("click",".js-sure-tuipiao",function(){
	var ids = "",
		passid = "",
		ele = $('input[name="orderNo_"]'),
		orderno = ele.attr("data-orderno"),
		routeids = "",
		tpReason = $('input[name="tpReason"]').val(),
		ziyuantp = "";
	$(".person-c .label").each(function () {
		var input = $(this).find("input");
		if(input.prop("checked")){
			ids += input.val() + "-";
			passid += input.attr("data-passid") + "-";
		}
	});

	if(ids == ""){
		layer.msg("请选择需要退票的乘机人！");
		return;
	}

	$('input[name="ziyuantp"]').each(function () {
		var $this = $(this);
		if($this.prop("checked")){
			ziyuantp = $this.val();
		}
	});
	if(ziyuantp == 0 && $.trim($('input[name="tpReason"]').val()) == ""){
		layer.msg("请输入16个字以内的退票原因！");
		return;
	}
	$(".airline_e").each(function () {
		var val = $(this).find('input[name="routeid"]').val();
		routeids += val + "-";
	});
	var href = "/air/tuipiao/createTuipiao?orderNo=" + orderno + "&passid=" + passid + "&routeids=" + routeids + "&tpReason=" + tpReason + "&ziyuantp=" + ziyuantp;
	$("#tp_form_submit").attr("action",href).submit();
});






















