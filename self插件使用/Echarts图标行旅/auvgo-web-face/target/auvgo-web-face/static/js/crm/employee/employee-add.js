
bookPermissions();
canAddEmpCtrl();

// action-点击-预订权限
$('body').on('click', '.label.ifallowbook', function() {
	bookPermissions();
});

// action-点击-代订范围
$('body').on('click', '.isBookDepartment .drop_option li', function() {
	canAddEmpCtrl();
});

// action-点击-是否抄送
$('body').on('click', '.csr-select .drop_option li', function() {
	isAddOrRemoveIgnore();
});
// action-点击-是否抄送
$('body').on("click",'.ifchaosong',function(){
	if($(this).find('input[name="ifchaosong"]').val()==1){
		$(".ifchaosong_select").show();
	}else{
		$(".ifchaosong_select").hide();
	}
});
isAddOrRemoveIgnore();
/**mobileRegExp
 * 是否添加或者删除ignore属性
 */
function isAddOrRemoveIgnore() {
	var status = $('.csr-select').find('._select_').val() == 1;
	
	var $chaosongren = $('.chaosongren');
	// var $csrMobile = $chaosongren.find('.mobile');
	// var $csrEmail = $chaosongren.find('.email');
	if (status) {
		$chaosongren.show();
		// $csrMobile.removeAttr('ignore');
		// $csrEmail.removeAttr('ignore');
	}else {
		$chaosongren.hide();
		// $csrMobile.attr('ignore', 'ignore');
		// $csrEmail.attr('ignore', 'ignore');
	}
}


/**
 * 员工预定权限控制
 */
function bookPermissions() {
	var status = $('input[name="ifallowbook"]:checked').val() == 1;
	
	var $bookRange = $('.isBookDepartment');
	var $canAdd = $('.canAdd');
	if (status) {
		$bookRange.show();
		$canAdd.show();
	}else {
		var selectClassStr = 'label-select-radio';
		$bookRange.hide();
		$canAdd.hide();
		$canAdd.find(':checked').closest('.' + selectClassStr).removeClass(selectClassStr);
		$canAdd.find(':checked').prop('checked', false);
		$canAdd.find('input[value="0"]').prop('checked', true);
		$canAdd.find('input[value="0"]').closest('.label').addClass(selectClassStr);
	}
}

/**
 *　是否可以添加员工
 */
function canAddEmpCtrl() {
	// select赋值过慢
	setTimeout(function () {
		var status = $('.isBookDepartment').find('._select_').val() == 3;
		
		var $canAddEmp = $('.canAddEmp');
		
		if (status) {
			var selectClassStr = 'label-select-radio';
			$canAddEmp.hide();
			$canAddEmp.find(':checked').closest('.' + selectClassStr).removeClass(selectClassStr);
			$canAddEmp.find(':checked').prop('checked', false);
			$canAddEmp.find('input[value="0"]').prop('checked', true);
			$canAddEmp.find('input[value="0"]').closest('.label').addClass(selectClassStr);
		}else {
			$canAddEmp.show();
		}
		
	}, 100);
}


// action-点击-添加-抄送人
$('body').on('click', '.add-csr', function() {
	var  $this = $(this);
	var $everyCSR = $this.closest('.every-csr');
	var cloneHtml = $everyCSR.clone();
	var $chaosongren = $everyCSR.closest('.chaosongren');
	var csrIndex = $chaosongren.find('.every-csr').length;
	
	if (csrIndex >= 6) {
		layer.msg('添加人数已达上限6人');
		return ;
	}
	
	csrChangeName($(cloneHtml), csrIndex, true);
	
	$(cloneHtml).find('.btn').removeClass('btn-primary add-csr').addClass('btn-danger del-csr').text('删除');
	$chaosongren.append(cloneHtml);
	
});

// action-点击-删除-抄送人
$('body').on('click', '.del-csr', function() {
	var  $this = $(this);
	var $everyCSR = $this.closest('.every-csr');
	var $chaosongren = $this.closest('.chaosongren');
	$everyCSR.remove();
	
	$chaosongren.find('.every-csr').each(function() {
		var $everyCSR = $(this);
		var csrIndex = $everyCSR.index();
		
		csrChangeName($everyCSR, csrIndex);
		
	});
});

/**
 * 修改name属性值
 * @param {Element} $everyCSR 当前csr dom元素
 * @param {Number} index 当前csr的值
 * @param {Boolean} isClear 是否清空val并且去除选中效果
 */
function csrChangeName($everyCSR, index, isClear) {
	$everyCSR.find(':input').each(function() {
		var $this = $(this);
		var orignName = $this.attr('name');
		var isCheckBox = $this.attr('type') == 'checkbox';
		if (!orignName) return true;
		var newName = orignName.replace(/\d/, index);
		// console.log(newName);
		$this.attr('name', newName);
		
		// isClear && $this.val('').prop('checked', false);
		
		if (isClear) {
			var selectClassStr = 'label-select-checkbox';
			// $this.val('').prop('checked', false);
			isCheckBox ? $this.prop('checked', false) : $this.val('');
			$this.closest('.' + selectClassStr).removeClass(selectClassStr);
		}
	});
}



/*员工管理部分代码*/
function defaultChecked(this_,controlElement){
	if(this_.val()=="1"){
		controlElement.show();
	}else{
		controlElement.hide();
	}
}
defaultChecked($("[name='ifallowbook']:checked"),$(".isBookDepartment"));
defaultChecked($("[name='ifapprove']:checked"),$(".approveStyle"));
$("body").on("click",".label.ifallowbook",function(){
	defaultChecked($(this).find("[name='ifallowbook']"),$(".isBookDepartment"));
});	
$("body").on("click",".label.ifapprove",function(){
	defaultChecked($(this).find("[name='ifapprove']"),$(".approveStyle"));
});
//指定部门
(function(){
	$('select[name="bookrange"]').val()=='2' ? $(".sd-bm").show() : $(".sd-bm").hide();
	$("body").on("click",".isBookDepartment .drop_option li",function(){
		$('select[name="bookrange"]').val()=='2' ? $(".sd-bm").show() : $(".sd-bm").hide();
	});
	
})();
//开启指定部门
function openZdpart(url){
	openIframe({'url':url,'title':"添加部门", width: '430px', height: '380px'});
}
//ztree
function ztreeMain(data){
	$(function(){
		var setting = {
			view: {dblClickExpand: false},
			data: {simpleData: {enable: true}},
			callback: {onClick: onClick}
		};
		var zNodes =data.zNodes;
		function onClick(e, treeId, treeNode) {
			$("#citySel").val(treeNode.name);
			$("#deptpid").val(treeNode.id);
		}
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
	});
}


// ==================================== 分离 begin ===================================================
/* $("body").on("click",".emp_submit",function(){
var flags=true;
$("._select_yz_").each(function(){
	if(!selectCheck($(this))){
		zh.alerts({"title":"提示","text":'请选择'+$(this).data("yz")+"!"});
		flags=false;
		return false;
	}
});
console.log($('[name="approvesms"]:checked').val());
if(flags){
	$(this).attr("type","submit");
}else{
	return false;
}
}); */
function onCheck(e,treeId,treeNode){
	var treeObj=$.fn.zTree.getZTreeObj("treeDemo"),
	nodes=treeObj.getCheckedNodes(true);
	var value="";
	 for(var i=0;i<nodes.length;i++){
		 if(null!=nodes[i].id){
		 	value+="/"+nodes[i].id;
		 }
	 }
	 parent.$("#bookdept").val(value);
}

// action-点击-确定
$("#employeeForm").Validform({
	ajaxPost: true,
	beforeCheck: function(curform){
		var certtypeIsID = $('[name="certtype"]').val() == 1;
		var $birthday = $('.birthday');
		
		certtypeIsID ? $birthday.removeAttr('ignore') : $birthday.attr('ignore', 'ignore');
		if($('.input_fenxiao').val()=="true"){
			//给accno和username 赋值
			var mobile = $(".mobileValue").val().trim();
			$("#emp-accno").val(mobile);
			$("#emp-username").val(mobile);
		}
	},
	beforeSubmit: function(curform){
		// Validform验证通过之后逻辑
		// return false;终止提交
		
		var certtype = $('[name="certtype"]').val();
		
		if(certtype == ''){
			zh.alerts({'title':'提示','text':'请选择证件类型'});
			return false;
		}
		
		var centno = $('[name="certno"]').val();
		
		// 证件号 为空
		if(centno == ''){
			zh.alerts({'title':'提示','text':'证件号不能为空'});
			return false;
		}
		
		var centnoRegE = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
		var passportnoRegE = new RegExp(/^[a-zA-Z0-9]{5,15}$/);
		
		// 证件号非空
		if(certtype == '1'){//身份证
			if(!centnoRegE.test(centno)){
				zh.alerts({'title':'提示','text':'请输入正确的身份证号！'});
				return false;
			}
		}else{//非身份证
			if(!passportnoRegE.test(centno)){
				zh.alerts({'title':'提示','text':'请输入正确的证件号！'});
				return false;
			}
		}
		
		// 添加员工时 密码加密处理
		if ($('[name="password"]').length > 0 && $('[name="password"]').val().length > 0) {
			// var passWord = md5(Utf8Encode($('[name="username"]').val() + $('.emp_submit').data('cno') + $('[name="password"]').val())).toUpperCase();
			var passWord = md5(($('[name="username"]').val() + $('.emp_submit').data('cno') + $('[name="password"]').val())).toUpperCase();
			$('[name="password"]').val(passWord);
		}
		
		
		// todo:wxj-20180126
		var status = $('.csr-select').find('._select_').val() == 1;
		var everyCSRStatus = true;
		if (status) {
			$('.every-csr').each(function() {
				var $this = $(this);
				var mobileStatus = $.trim($this.find('.mobile').val()) == '';
				var emailStatus = $.trim($this.find('.email').val()) == '';

				if (mobileStatus && emailStatus) {
					everyCSRStatus = false;
					return false;
				}
			});
		}
		
		if (!everyCSRStatus) {
			zh.alerts({'title': '提示','text': '请保证至少有一种接收通知的方式（手机号或邮箱）'});
			return false;
		}
		
		
	},
	callback: function(data){
		$.Hidemsg();
		
		zh.alerts({'title':'提示','text': data.info});
		
		if (data.status == 'y') {
			$("body").on("click",".alert_event",function(){
				if($("#persons_edit_sd").val()=="true"){
					parent.location.reload();
					parent.$("body").removeClass("scroll-hide");
					parent.$(".alert_window").next().remove().end().remove();
					
				}else{
					location.href = '/crm/employee';
				}
			});
		}
	} 
});
//==================================== 分离 end ===================================================




// 搜索乘机人-数据
function ajaxEmp(keyword, callback, $input) {
	
	$.ajax({
		url: '/getStaff',
		type: 'POST',
		data: { keyword: keyword },
		success: function(data) {
			
			if(data.status != 200){
				layer.msg(data.msg);
				return ;
			}
			
			var _data = JSON.parse(data.data);
			
			typeof callback == 'function' && callback(_data, $input);
		},
		error: function(xhr, errorType, error){
			layer.msg('获取员工失败！' + xhr.status);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}

function parseEmp(data, $input) {
	var empId = $.trim($('#emp-id').val());
	// console.log(empId);
	
	var html = '';
	$.each(data, function(index, curr) {
		if (empId == curr.id) return true;
		html += '<li class="every-emp text-ellipsis" data-mobile="' + curr.mobile + '" data-email="' + curr.email + '" data-id="' + curr.id + '" title="' + curr.name + '[' + curr.deptname + ']">' + curr.name + '</li>';
	});
	var offset = $input.offset();
	var height = $input.outerHeight();
	var _top = offset.top + height + 'px';
	var _left = offset.left + 'px';
	
	$('.emp-div').css({'top': _top, 'left': _left});
	$('.employee-wraper').html(html).show();
}

// action-失焦-
// $('body').on('blur', '.getStaff', function() {
// 	// !$('.employee-wraper').is(':hidden') && $(this).val('');
// 	// $('.employee-wraper').html('').hide();
// });

// action-input-事件
$('body').on('textchange click', '.getStaff', function(event) {
	event.type == 'click' && this.select();
	var $this = $(this);
	var keyword = $.trim($this.val());
	if (!keyword) {
		$('.employee-wraper').html('').hide();
		return ;
	}
	$this.closest('.every-csr').addClass('every-csr-now');
	
	ajaxEmp(keyword, parseEmp, $this);

});

// action-点击-
$('body').on('click', '.every-emp', function() {
	var $this = $(this);
	var empParam = {
		name: $this.text()
		,id: $this.attr('data-id')
		,mobile: $this.attr('data-mobile')
		,email: $this.attr('data-email')
	};
	// console.log(empParam);
	
	var everyCSRNowStr = 'every-csr-now';
	var $everyCSRNow = $('.' + everyCSRNowStr);
	$everyCSRNow.find('.getStaff').val(empParam.name);
	$everyCSRNow.find('.pId').val(empParam.id);
	$everyCSRNow.find('.mobile').val(empParam.mobile);
	$everyCSRNow.find('.email').val(empParam.email);
	
	$everyCSRNow.removeClass(everyCSRNowStr);
	$('.employee-wraper').html('').hide();
	
});

// action-鼠标-移出
$('body').on('mouseleave', '.employee-wraper', function() {
	$(this).html('').hide();
});


/**
 * 切换证件类型
 * @param {Object} data
 * @param {Function} callback
 */
function switchCertType(data, callback) {
	var $birthday = $('.birthday');
	data.certtype == 1 ? $birthday.hide() : $birthday.show();
	
	if (data.certtype == '') return ;
	
	// 防止单点登录拿不到登录人信息
	if (data.eid == '') return ;
	
	$.ajax({
		url: '/getcert',
		type: 'post',
		data: data,
		success: function(data) {
			
			if (data.status != 200) {
				layer.msg(data.msg + '(' + data.status + ')');
				return ;
			}
			
			var _data = JSON.parse(data.data);
			
			typeof callback == 'function' && callback(_data);
			
		},
		error: function(xhr, errorType, error){
			layer.msg('切换证件类型获取证件号失败！');
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}

// action-点击-切换证件类型
$('body').on('click', '.switch-certtype .drop_option li', function () {
	var $this = $(this);
	var certType = $this.closest('.select_role').find('._select_').val();
	
	var data = {
		eid: $('#emp-id').val(),
		certtype: certType,
		passtype: 1
	};
	
	switchCertType(data, switchCertTypeCallback);
});
/**
 * 切换证件类型回调
 * @param {Object} data {name: '', certno: ''}
 */
function switchCertTypeCallback(data) {
	$('[name="name"]').val(data.name);
	$('[name="certno"]').val(data.certno);
}


//**********************************************************************添加证件信息
$('body').on("click",".add_size",function () {
	var arr = [];

	var ls="'yyyyMMdd'";
	var index = $(".passanger_model_msg").length;
	var list = '<div class="clear passanger-container passanger_model_msg" style="position: relative;">' +
		'<div class="label label-radio clear vertical float-left maring-distance">' +
		'<span class="show_choice"></span>' +
		'<input type="radio" name="default" value="0"/>' +
		'<input type="hidden" name="certlist['+index+'].isdefault" class="checkbox_is" value="0"/>' +
		'<span>默认</span>' +
		'</div>' +
		'<div class="passanger-model message ">' +
		'<div class="e-p-model font-size-12 " style="margin-left: 20px;margin-top: 20px">' +
		'</div>' +
		'<div class="clear margin-bottom-10"style="margin-left: 20px;">' +
		'<div class="float-left clear margn-bottom-5 document_type position">' +
		'<div class="float-left p-w-200 papers">证件类型</div>' +
		'<select class="_select_ js_centro_type" name="certlist['+index+'].certtype" datatype="*" nullmsg="请选择证件类型" data-value="'+createType().arr[0].key+'">' +
		(createType().html)+
		'</select>' +
		'</div>' +
		'<div class="float-left clear margn-bottom-5">' +
		'<div class="p-w-200 papers">证件号码</div>' +
		'<div class=" p-w-200 papers input-centro">' +
		'<input type="text" class="input user_centro" name="certlist[' + index + '].certificate"  placeholder="证件号码" datatype="*" nullmsg="请输入证件号码" value="">' +
		'</div>' +
		'</div>' +
		'<div class="float-left clear margn-bottom-5">' +
		'<div class=" p-w-200 papers">证件姓名</div>' +
		'<div class="float-left p-w-200 papers input-centro">' +
		'<input type="text" class="input user_centro" name="certlist['+index+'].username"   placeholder="证件姓名" datatype="*" nullmsg="请输入证件姓名" value="">' +
		'</div>' +
		'</div>'+
		'<div class="float-left clear margn-bottom-5 select_hide hide">' +
		'<div class=" p-w-200 papers">性别</div>' +
		'<div class=" drop-centro " >' +
		'<select class="_select_ js_centro_type_sex" name="certlist['+index+'].sex">' +
		'<option value="">-性别-</option>' +
		'<option value="M">男</option>' +
		'<option value="F">女</option>' +
		'</select>' +
		'</div>' +
		'</div>'+
        '<div class="del_c "></div>' +
		'<div class="float-left clear margn-bottom-5 select_hide hide">' +
		'<div class=" p-w-200 papers">有效期</div>' +
		'<div class=" p-w-200 papers input-centro">' +
		'<input type="text" class="input user_centro" onfocus="WdatePicker({readOnly:true,dateFmt:'+ls+'})" name="certlist['+index+'].passportdate">' +
		'</div>' +
		'</div>'+
		'<div class="float-left clear margn-bottom-5 select_hide hide">' +
		'<div class=" p-w-200 papers">国籍</div>' +
		'<div class=" p-w-200 papers input-centro ">' +
		'<input type="text" class="input user_centro nationality" name="certlist['+index+'].guoji"  >' +
		'</div>' +
		'</div>'+
		'<div class="float-left clear margn-bottom-5 select_hide hide">' +
		'<div class=" p-w-200 papers">签发地</div>' +
		'<div class=" p-w-200 papers input-centro ">' +
		'<input type="text" class="input user_centro issue_add" name="certlist['+index+'].placeIssue" >' +
		'</div>' +
		'</div>'+
		'<div class="float-left clear margn-bottom-5 select_hide hide">' +
		'<div class="p-w-200 papers">出生日期</div>' +
		'<div class="p-w-200 papers input-centro ">' +//yyyyMMdd
		'<input type="text" class="input user_centro" onfocus="WdatePicker({readOnly:true,dateFmt:'+ls+'})" name="certlist['+index+'].birthday">' +
		'</div>' +
		'</div>'+
		'</div>'+
		'</div>' +

		'</div>';
	$('.person-container_box').append(list);
	(new SelectMain()).creatSelect($(".person-container_box").find(".passanger_model_msg:last .js_centro_type"));
	(new SelectMain()).creatSelect($(".person-container_box").find(".passanger_model_msg:last .js_centro_type_sex"));
	deleteEmployee()
	isChecked();
});
$('body').on("click",".del_c",function () {
	$(this).parents('.passanger_model_msg').remove();
	deleteEmployee();
	isChecked();
});

//        国籍
$("body").on("click keyup",'.nationality',function (e) {
	e.stopPropagation();
	var _this = $(this);
	var keyword = $(this).val(); // 关键字
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器
		eventMain:eventMain, 		// 单击列表的主函数
		url:'/component/country',   // 请求url
		this_:$(this), 				// 当前元素
		showField:"countryNameCn",			// 要展示在当前触发元素里的字段
		hideField:"id",				// 要展示在其他位置的字段
		model:"paging", 			// 判断是否为分页模式。paging代表分页模式
		keyword:keyword,				// 关键字
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){
		var data=data.data;
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.items); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		_this.val(this_.text());
//				_this.siblings('input[name$="itemNumberId"]').val(this_.attr('data-id'))
	}
});
//        签发地
$("body").on("click keyup",'.issue_add',function (e) {
	e.stopPropagation();
	var _this = $(this);
	var keyword = $(this).val(); // 关键字
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器
		eventMain:eventMain, 		// 单击列表的主函数
		url:'/component/country',   // 请求url
		this_:$(this), 				// 当前元素
		showField:"countryNameCn",			// 要展示在当前触发元素里的字段
		hideField:"id",				// 要展示在其他位置的字段
		model:"paging", 			// 判断是否为分页模式。paging代表分页模式
		keyword:keyword,				// 关键字
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){
		var data=data.data;
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.items); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		_this.val(this_.text());
//				_this.siblings('input[name$="itemNumberId"]').val(this_.attr('data-id'))
	}
});
$("body").on("click", ".document_type .drop .drop_option li", function () {
	var  this_ = $(this),
		this_p = this_.parents(".drop"),
		select_ = this_p.find("select"),
		val = select_.val(),
		drop_title = this_p.find(".drop_title"),
		trNow_ = this_.parents(".passanger_model_msg"),
		tbody_ = this_.parents(".person-container_box"),
		trAll = tbody_.find(".passanger_model_msg"),
		flaghz = true,
		tetle="",
		bilingualism="",
		defaultlanguage="";
	
	$(this).parents('.document_type').find(".js_centro_type option").each(function(){
		if($(this).val()==val){
			tetle = $(this).html();
		}
		bilingualism = $(this).attr('data-bilingualism');
		defaultlanguage = $(this).attr('data-defaultlanguage');
	});
	if(select_.is(".js_centro_type")) {
			trAll.not(trNow_).each(function () {
				var this_val = $(this).find(".js_centro_type").val();
				if ((this_val != "") && (this_val == val)) {
					layer.msg("证件类型不能相同，请重新选择!");
					select_.val(val);
					drop_title.html(tetle);
					if(val==1){
						this_.parents('.passanger_model_msg').find('.select_hide').hide();
					}else{
						$(this).parents('.passanger_model_msg').find('.select_hide').show();
					}
					flaghz = false;
					return false;
				}
			});
		}
		if(flaghz){
			if ($(this).data("values") == "1") {
				$(this).parents('.passanger_model_msg').find('.select_hide').hide();
			} else {
				$(this).parents('.passanger_model_msg').find('.select_hide').show();
			}
		}
	
});
$('.passanger_model_msg').each(function () {
	if($(this).find('.js_centro_type').val()==1||$(this).find('.js_centro_type').val()==""){
		$(this).find('.select_hide').hide();
	}else{
		$(this).find('.select_hide').show();
	}
});
// 移除和增加证件信息 序列化index
function deleteEmployee(obj){
	// $(obj).parent().parent().remove();
	$(".person-container_box .passanger_model_msg").each(function(index){
		var i = $(this).find(".index_seq").val();
		if(index != i){
			$(this).find("input[name^='certlist']").each(function(){
				var ss = $(this).attr("name").replace(/\[[^\)]*\]/g, "[" + index + "]");
				$(this).attr("name",ss);
			});
		}
	});
}
function isChecked(){
	var ischecked = false;
	$('input[name="default"]').each(function(){
		if($(this).prop("checked")){
			ischecked = true;
		};
	});
	if(ischecked){
		return ;
	}else{
		$('input[name="certlist[0].isdefault"]').val(1);
		$('input[name="certlist[0].isdefault"]').siblings('input').prop('checked',true);
		$('input[name="certlist[0].isdefault"]').parents('.label').addClass('label-select-radio');
	}
}
$('body').on('click','.label',function(){
	var this_ = $(this);
	if(this_.find('input').prop('checked')){
		this_.find('.checkbox_is').val(1);
	}
});



//获取证件信息的方法
function createType(){
	var arr = [],
		html="";
	$.ajax({
		url:"/component/obtain/certtype",
		type:"post",
		async:false,
		success:function (data) {
			arr= data.data;
		},
		error:function(){
		
		}
	});
	if(arr.length>0){
		$.each(arr,function (index,item) {
			html+='<option value="'+item.key+'" ' +
				'data-bilingualism="'+item.bilingualism+'"' +
				'data-defaultLanguage="'+item.defaultLanguage+'"' +
				'>'+item.name+'</option>'
		});
	};
	return {arr:arr,html:html}
}

