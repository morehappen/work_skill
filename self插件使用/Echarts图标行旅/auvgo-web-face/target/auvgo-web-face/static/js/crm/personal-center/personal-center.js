//layer.msg('title', {icon: 1,time: 2000/*2秒关闭（如果不配置，默认是3秒）*/}, function(){/*do something*/}); 
//layer.msg('this is a test text.', {}, function(){});

	
// 个人中心左侧导航
var _pathname = window.location.pathname.split("/")[2];
$('.person-aside').find('[data-tag="' + _pathname + '"]').addClass('active');

// 点击-左侧导航
$('.person-aside').on('click', 'li',  function(){
	location.href = $(this).attr('data-href');
});


// 保存员工个人信息
$("#employee-form").Validform({
	btnSubmit: '#save-infor',
    tiptype:3,
    label:".label",
    showAllError:true,
    datatype:{
        "zh1-6":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,6}$/
    },
	ajaxPost: true,
	beforeSubmit: function(curform){
		
	},
	callback: function(data){
		$.Hidemsg();
		
		layer.msg(data.msg);
		
		if(data.status != 200) return ;
		
		setTimeout(function(){ location.reload(); }, 1000);
		
	}
});

// 修改密码
$("#edit-pwd-form").Validform({
	btnSubmit: '#save-pwd',
	tiptype:3,
    label:".label",
    showAllError:true,
    datatype:{
        "zh1-6":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,6}$/
    },
    ajaxPost: true,
	beforeSubmit: function(curform){

	},
	callback: function(data){

		$.Hidemsg();

		layer.msg(data.msg);

		if(data.status != 200) return ;

		setTimeout(function(){ location.reload(); }, 1000);

	}
});


// 鼠标-移入-卡片内部
$('body').on('mouseenter mouseleave', '.every-card', function(event){
	
	var $cardMask = $(this).find('.card-mask');
	
	event.type == 'mouseenter' && $cardMask.show();
	event.type == 'mouseleave' && $cardMask.hide();
	
});
// 点击-卡片-编辑
$('body').on('click', '.credentials-edit', function(){
	var id=$(this).attr("data-id");
	zh.iframes({
		url: '/employess/cert/update/'+id,
		title: '修改证件信息',
		width: '800px',
		height: '440px'
	});
});
// 点击-卡片-删除
$('body').on('click', '.credentials-del', function(){
	var certid=$(this).attr("data-id");
	layer.confirm('确定删除吗？', {icon: 7}, function(){
		$.ajax({
			url:"/component/delete/cert",
			data:{"certId":certid},
			success:function(data){
				layer.msg(data.msg);
				setTimeout(function(){ location.reload(); }, 1000);
			}
		});
	});
});

// action-点击-卡片-默认
$('body').on('click', '.credentials-default', function(){
	var certid=$(this).attr("data-id");
	$.ajax({
		url: '/component/update/cert/defult',
		data: {'id': certid},
		success:function(data){
			layer.msg(data.msg);
			setTimeout(function(){ location.reload(); }, 1000);
		}
	});
});

// 点击-卡片-新增
$('body').on('click', '.add-card', function(){
	zh.iframes({
		url: '/employess/cert/update/0',
		title: '新增证件信息',
		width: '800px',
		height: '440px'
	});
});
// 证件信息保存
$("#edit-card").Validform({
	btnSubmit:'.btn-save',
	ajaxPost: true,
	beforeSubmit: function() {
		$("#different_bir_d").html("");
		$("#different_bir_d").hide();
		var centno = $('[name="certificate"]').val();
		
		// 证件号 为空
		if(centno == ''){
			layer.msg('证件号不能为空！');
			return false;
		}
		var centnoRegE = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
		var passportnoRegE = new RegExp(/^[a-zA-Z0-9]{5,15}$/);
		
		var certtype = $('[name="certtype"]').val();
		
		// 证件号非空
		if(certtype == '1'){//身份证
			if(!centnoRegE.test(centno)){
				layer.msg('请输入正确的身份证号！');
				return false;
			}
		}else{//非身份证
			if(!passportnoRegE.test(centno)){
				layer.msg('请输入正确的证件号！');
				return false;
			}
		}
		
	},
	callback: function(data){
		$.Hidemsg();
		if(data.status == 411 && data.data != null){
			defBirHtml(data);
		}
		layer.msg(data.msg);
		if (data.status == 200){
			setTimeout(function(){ top.location.reload(); }, 1000);
		}
	}
});

function defBirHtml(data){
	var bir = $("#cert_birthday_").val();
	var html = '<a href="javascript:;" class="modal-close"id="close_dif_div_"></a>';
		html += '<p class="born" >已存在以下出生日期信息，请选择正确项：</p>';
	$.each(data.data, function(i, d){
		html+='<div class="label label-radio ifapprove clear vertical float-left margin-left-20 different_birthday_d_" data-value="'+d.birthday+'">';
		html+='<span class="show_choice"></span>';
		html+='<input type="radio" name="ifapprove" value="0" >';
		html+='<span>'+d.certtypeName+':'+d.birthday+'</span>';
		html+='</div>';
	});
	html+='<div class="label label-radio ifapprove clear vertical float-left margin-left-20 different_birthday_d_" data-value="'+bir+'">';
	html+='<span class="show_choice"></span>';
	html+='<input type="radio" name="ifapprove" value="0" >';
	html+='<span>正在编辑的证件:'+bir+'</span>';
	html+='</div>';
	$("#different_bir_d").html(html);
	$("#different_bir_d").show();
}

// 新增||编辑常用联系人
$("#saveOrUpdateLinshiForm").Validform({
	btnSubmit:".btn-save_",

	ajaxPost:true,
	beforeSubmit: function() {
		var centno = $('[name="certno"]').val();
		// 证件号 为空
		if(centno == ''){
			layer.msg('证件号不能为空！');
			return false;
		}
		
		var centnoRegE = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
		var passportnoRegE = new RegExp(/^[a-zA-Z0-9]{5,15}$/);
		var certtype = $('[name="certtype"]').val();
		
		// 证件号非空
		if(certtype == '1'){//身份证
			if(!centnoRegE.test(centno)){
				layer.msg('请输入正确的身份证号！');
				return false;
			}
		}else{//非身份证
			if(!passportnoRegE.test(centno)){
				layer.msg('请输入正确的证件号！');
				return false;
			}
		}
	},
	callback:function(data){
		$.Hidemsg();
		layer.msg(data.msg);
		
		if (data.status != 200) return ;
		
		setTimeout(function(){ top.location.reload(); }, 1000);
	}
});

// input-获取焦点
$('body').on('focus blur', '.input', function(event) {
	
	if ($(this).prop('readonly')) return ;
	
	event.type == 'focusin' && $(this).addClass('active');
	
	event.type == 'focusout' && $(this).removeClass('active');
});

// 点击-新增常用联系人
$('body').on('click', '#add-common-person', function() {
	zh.iframes({
		url: '/personal/toCommonPersonsAdd/0',
		title: '新增常用出行人',
		width: '780px',
		height: '440px',
        position:' relative'
	});
});

// 点击-编辑常用联系人
$('body').on('click', '.edit-common-person', function(){
	var id = $(this).attr("data-id");
	zh.iframes({
		url: '/crm/employee/edit/2/'+id,
		title: '修改常用出行人',
		width: '780px',
		height: '440px',
        position:' relative'
	});
});

// 点击-删除常用联系人
$('body').on('click', '.del-common-person', function(){
	var id=$(this).attr("data-id");
	layer.confirm('确定取消关联吗？', {icon: 7}, function(){
		$.ajax({
			url:"/personal/deleteLinshi",
			data:{"linshiId":id},
			success:function(data){
				
				layer.msg(data.msg);
				
				setTimeout(function(){ location.reload(); }, 1000);
			}
		});
	});
	
});

//点击-编辑12306
$('body').on('click', '#binding', function(){
	
	zh.iframes({
		url: '/personal/toBindAdd',
		title: '绑定12306账号',
		width: '500px',
		height: '360px'
	});
});

// 点击-解绑12306
$('body').on('click', '.bind-12306-del', function(){
	
	layer.confirm('确定解除绑定吗？', {icon: 7}, function(){
		
		unbind();		
		
	}, function(){
		
		//layer.msg('不解绑....');
		
	});
	
});


// 解绑
function unbind(){
	$.ajax({
		url:"/train/removeaccount",
		type: 'post',
		success: function(data){
			
			if (data.status != 200) {
				layer.msg('解绑失败!' + data.status);
				return ;
			}
			
			location.reload();
			
		},
		error: function(xhr, errorType, error){
			console.log(xhr);
			console.log(errorType || error);
			layer.msg('请求解绑失败！' + xhr.status);
		}
	});
}

$("#saveOrUpdateLinshiForm").Validform({
	btnSubmit:".btn-save", 
	ajaxPost:true,
	callback:function(data){
		$.Hidemsg();
		var seconds = 0;
		if (data.status == 301) {
			layer.alert(data.msg);
			seconds = 3000;
		}else {
			layer.msg(data.msg);
			seconds = 1000;
		}
		setTimeout(function(){
			top.location.reload();
		},seconds);
	}
});


//表单提交
$("#submitForm").Validform({
	btnSubmit:"#save",
	ajaxPost : true,
	callback:function(data){
		$.Hidemsg();
		if (data.status == 200) {
			 //location.href="/train/query/toBind";
			top.location.reload();
		} else {
			layer.alert(data.msg);
		}	
	}
});

//判断是否显示出生日期
$("body").on("click",".drop",function(){
	// console.log("jfhgjfh");
	// console.log($('._select_').val());
	$(".birth").addClass("birth-ds");
	var val = $('._select_').val();
	if(val=="C"||val=="G"||val=="B"||val=="ID"){
		$(".birth-ds").removeClass("birth-ds");
	}
});

// //点击-关联出行人
$('body').on('click', '#relevation-person', function() {
	// $(".h-t-p").css("display","block");
	$(".tab-e").css("display","none");
	$(".tab-e-select").css("display","block");
	$("body .history").hide();
	// $("").removeClass("").addClass("contacts-btn");
	// console.log();
	// zh.iframes({
	// 	url: '/personal/Relevation',
	// 	title: '新增常用出行人',
	// 	width: '1000px',
	// 	height: '900px',
	// 	overflow:'hidden'
	// });
	// var indexs = $(this).attr("data-relation");
	// console.log(indexs);
	// updateSelected ();
	//
	// $(".Screen-full").show();
	// $("body").addClass("scroll-hide");
	//
	// getHistory(updateHistoryPass);
});

//
//关联出行联系人

function relation(){
	var id = '';
	if($(".s-c-show").length>=1){
		$('.s-c-show').each(function(){
			// console.log($(this).attr("data-id"));
			id+=$(this).attr("data-id")+"-"
		});
		// console.log(id);
		if(id==""){
			layer.msg("至少选择一位");
			return ;
		}
		$.ajax({
			url:'/personal/RelevationSave',
			type:"post",
			data:{empListId:id},
			success:function (data) {
				if(data.status==200){
					layer.msg(data.msg);
					$(".Screen-full").hide();
					$("body").removeClass("scroll-hide");
					setTimeout(function(){
						location.reload();
					},2000);
				}else{
					layer.msg(data.msg);
				};
			},
			error:function(err){
				layer.msg("确保您的网络畅通，请重新提交");
				console.log(err);
				setTimeout(function(){
					$(".Screen-full").hide();
					$("body").removeClass("scroll-hide");
				},3000)
			}
		})
	}else{
		layer.msg("至少选择一位");
		return ;
	};
	

};
// 提示框
$('#icon').hover(function () {
	$('.ex').addClass('db');
}, function () {
    $('.ex').removeClass('db');
})

// 国籍and签发地
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

// 点击身份证自动出生日期
function fillInfo() {
    //获取输入身份证号码
    var UUserCard = document.getElementById("sfz").value;
    UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
    //判断出生日期
    if (UUserCard.length == 15) {
        var year = "19" + UUserCard.substring(6, 8) + "-" + UUserCard.substring(8, 10) + "-" +
            UUserCard.substring(10, 12);
        document.getElementById("year").value = year;
    }

    if (UUserCard.length == 18) {
        var year = UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" +
            UUserCard.substring(12, 14);
        document.getElementById("year").value = year;
    }
}

