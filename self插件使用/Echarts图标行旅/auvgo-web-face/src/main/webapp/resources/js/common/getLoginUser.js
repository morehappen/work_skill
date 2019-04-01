/**
 * ajax-获取-登录人信息
 * @param {Function} callback 成功后的回调函数
 */
function getLoginUserInfor (callback) {
    $.ajax({
        url: '/getLoginUser',
        type: 'POST',
        async: false,
        success: function(data) {
            if(data.status != 200){
                layer.msg(data.msg + '|' + data.status);
                console.error(data);
                return ;
            }

            var _data = JSON.parse(data.data);

            typeof callback == 'function' && callback(_data);

        },
        error: function(xhr, errorType, error){
			layer.msg('获取登录人失败！');
			console.error(xhr);
			console.error(errorType || error);
        }
    });
}

/**
 * ajax-获取登录人数据后的回调
 * @param {Object} data 登录人数据
 */
function updateLoginUser (data) {
    // console.log(data);
	// ifallowbook-是否是预订人  1||0
	var isBookPerson = data.ifallowbook == 1;
	// todo:wxj-20180105-代订范围是否为个人和常用联系人
	var isBookSelf = data.bookrange == 3;
	// console.log('isBookSelf: ' +isBookSelf);
	
	// addempflage-是否可以新增员工  1||0
	var canAddEmp = data.addempflage == 1;
	//向页面追加添加员工权限标志
	$('.addempflage').val(data.addempflage);
	// console.log('canAddEmp: ' + canAddEmp);
 
	// addcustflage-是否可以添加常用联系人  1||0
	var canAddCust = data.addcustflage == 1;
	// console.log('canAddCust: ' + canAddCust);
	//判断是从那个页面进入 增加标志pre  true 和对页面到填写订单页面 “”或false list=>填写订单页面
	var pre = $("#pre").val();
	$('#model-flag').attr({
        'data-isBookPerson': isBookPerson,
        'data-isBookSelf': isBookSelf,
        'data-canAddEmp': canAddEmp,
        'data-canAddCust': canAddCust,
		'data-birthday': data.birthday});
	
    var $passengerModel = $('.passanger-model');
	$passengerModel.attr({'data-loginlevel': data.zhiwei, 'data-logindept': data.deptname});
	var $loginM = $passengerModel.find('.e-p-model:first');
	
	// todo:wxj-20171219-是否为预定人
	//todo : wsm-20180702-判断是从那个页面进入 增加标志pre

	if(!(pre=="true")){
			if (isBookPerson) {
				$loginM.remove();
			}
		
		var certtype = data.certtype ? data.certtype : '';
		var mobile = $.trim(data.mobile);
	
		$loginM.attr('data-id', data.id)
			.attr('data-level', data.zhiwei)
			.attr('data-certtype', certtype)
			.attr('data-certno', data.certno)
			.attr('data-name', data.name)
			.attr('data-deptname', data.deptname)
			.attr('data-passtype', 1)
			.attr('data-mobile', mobile).show();
		$(".cid").val(data.companyid);
		$loginM.find('.loginName').prop('title', data.name).html(data.name);
		
		// 编辑权限控制
		if (!canAddEmp && !canAddCust) {
			$('.person-model').attr('data-editctr', 0);
			$('body').off('click', '.edit_p');
			$('.edit_p').remove();
		}
		
		// 非预定人
		if (!isBookPerson) {
			$(".choice-cjr").remove();
			$(".remove_p").remove();
		}
		// 预定人
		else {
			
			if (isBookSelf && !canAddEmp && !canAddCust) {
				$(".choice-cjr").remove();
			}
			
			// 代订范围-预定人和常用联系人
			if (isBookSelf) {
				$("[data-tabshut='0']").remove();
				$(".tab-c-1").remove();
			}
			// 非可新增员工
			if (!canAddEmp) {
				$("[data-tabshut='1']").remove();
				$(".tab-c-2").remove();
			}
			// 非可添加常用联系人
			if (!canAddCust) {
				$("[data-tabshut='2']").remove();
				$(".tab-c-3").remove();
			}
			
			// 默认第一个选中
			var $tabFirst = $('body').find('.tab-e:first-child');
			$tabFirst.addClass("tab-e-select");
			$("div[data-tabContent]").hide();
			$("div[data-tabContent='" + $tabFirst.attr('data-tabshut') + "']").show();
		}
	
		// hidden input 赋值
		$loginM.find('.e-id').val(data.id);
		$loginM.find('.e-certtype').val(certtype);
		$loginM.find('.e-passtype').val(1);
	
		// 动态赋值
		$loginM.find('._select_').val(certtype).attr('data-value', certtype);
	
		// 展示效果
		var text = $loginM.find('._select_ option:selected').text();
		$loginM.find('._select_').next().text(text);
	
		$loginM.find('.user_centro').val(data.certno);
		$loginM.find('.user_mobile').val(mobile);
		$loginM.find('.user_dept').val(data.deptname);
		$loginM.find('.user_email').val(data.email);
		// 联系人||联系方式
		$('.link-name').val(data.name);
		$('.link-phone').val(mobile);
		$('.link-email').val(data.email);
		if(mobile!=""){
			$('input[name="order.isSend"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
			$('input[name="order.isSend"]').val(1);
		}else{
			$('input[name="order.isSend"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
			$('input[name="order.isSend"]').val(0);
		}
		if(data.email!=""){
			$('input[name="order.isSendEmail"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
			$('input[name="order.isSendEmail"]').val(1);
		}else{
			$('input[name="order.isSendEmail"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
			$('input[name="order.isSendEmail"]').val(0);
		}
		$(".cid").val(data.companyid);
		policyCallback(data.zhiwei);
	}else{
		//编辑权限控制 ;
		// if (!canAddEmp && !canAddCust) {
		// 	$('.person-model').attr('data-editctr', 0);
		// 	$('body').off('click', '.edit_p');
		// 	$('.edit_p').remove();
		// }
		$(".cid").val(data.companyid);
		policyCallback(data.zhiwei);
	}

}