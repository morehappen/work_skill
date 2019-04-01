//初始化权限控制
/*(function(){
	if(!($(".index-content-policy").is("div"))){
		$.ajax({
	        type: "POST",
	        url:'/getChailvauth',
	        success: function(data) {
//	        	console.log(data);
	        	if(data.status===200 || data.status===301 ){
//	        		console.log(data.data);
	        		if(data.data!==1){
	        			$("a[data-flag='crm']").parents(".tab").remove();
	        		}else{
	        			$("a[data-flag='crm']").parents(".tab").removeClass("hide");
	        		}
	        		return;
	        	}
	        },
	        error:function(XMLHttpRequest){
	        	zh.alerts({
					title:"提示",
					text: "出错了..."
				});
	        	console.log(XMLHttpRequest);
	        }
	    });
	}
})();*/
(function () {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    };
    if (!($(".guoji-needs").is("div"))) {
        var flag_check = $.getUrlParam("flag");
        var tag_check = $.getUrlParam("tag");
        var pathname = window.location.pathname.split("/")[1];
//		console.log(window.location);
//		console.log(window.location.pathname);
        $(".target_a").removeClass("target_a");
        $(".sub-active").removeClass("sub-active");

        $(".nav_main[href^='/" + pathname + "']").addClass("target_a");
        $(".sub-nav a[href^='/" + pathname + "']").not(".go-home").addClass("sub-active");

        if(tag_check=='hotel' || tag_check=='hotelPay'){
            $(".sub-nav a[href^='/myChailv']").addClass("sub-active");
            return;
        };
        if (!flag_check && (pathname == 'air'||pathname == 'hotel'||pathname == 'train')) {

            $(".sub-nav a[href^='/" + pathname + "']").removeClass("sub-active");
            $(".sub-nav a[href^='/index']").addClass("sub-active");

        };
        if(pathname=='index'){
            $(".sub-nav a[href^='/" + pathname + "']").removeClass("sub-active");
            $(".sub-nav a[href^='/index']").addClass("sub-active");
        };
        if(flag_check=='personal'){
            $(".sub-nav a[href^='/myChailv']").addClass("sub-active");
            return;
        };
        $(".sub-nav a[data-default='/" + pathname + "']").addClass("sub-active");
        // 订单列表页面控制左侧导航
        var _pathname = window.location.pathname.split("/")[2];
        $('#order-left-nav').find('[data-orderflag="' + _pathname + '"]').addClass('color-6461e2');
        //icon-up-jt-second
        // 数据管理页面控制左侧导航
        var __pathname = window.location.pathname.split("/")[3];
        __pathname == 'design' && (__pathname = 'city');
        $('#data-manage-left').find('[data-manageflag="' + __pathname + '"]').addClass('color-6461e2');
    } else {
        $('[data-flag="guoji"]').addClass("sub-active");
    }
})();
//运行下拉主函数
(new SelectMain()).initialize();
//启动iframe窗口
function openIframe(department){
	zh.iframes({
		url:department.url,
		title:department.title,
		width:department.width || "434px",
		height:department.height || "426px"
	});
}
//全选，全不选
//全选全不选
(function(){
	//全选，全不选
	$("body").on("click","#checkedAll",function(){
		$(".everyChecked input").prop("checked",$(this).find("input").prop("checked")).parents('.label').removeClass("label-select-checkbox");
		$(".everyChecked input:checked").parents('.label').addClass("label-select-checkbox");
	});
    // 逐个点击
	$("body").on("click",".everyChecked",function(){
		$(".everyChecked input:checked").length===$(".everyChecked input").length ? $("#checkedAll input").prop("checked",true).parents(".label").addClass("label-select-checkbox") : $("#checkedAll input").prop("checked",false).parents(".label").removeClass("label-select-checkbox");
	});
})();

/*************ztree start****************/
//页面ztree加载
function ztreeMain(data){
	$(function(){
		var zNodes = data.zNodes;
		var	setting = {view:{dblClickExpand:false,showLine:false,selectedMulti:false},data:{simpleData:{enable: true}},
				callback : {
					beforeClick : function(treeId, treeNode) {
						if(treeNode.id == 0){
							location.href=data.href0;
						}else{
							location.href=data.href1+"?q_EQ_deptid="+treeNode.id;
						}
					}
				}		
		};
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
	});
}
//弹窗加载ztree
function alertZtreeMain(data){
	$(function(){
		var setting = {
			view: {dblClickExpand: false},
			data: {simpleData: {enable: true}},
			callback: {onClick: onClick}
		},
		zNodes =data.zNodes;
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		
		// TODO:wxj-20170728-成本中心部门回显
		$(document).ready(function(){
			$.fn.zTree.init($("#treeDemo"), setting, zNodes);
			if ($('#deptpid').val() != '') {
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
				var nodes = treeObj.getNodeByParam("id", $('#deptpid').val(), null);
				$('#citySel').val(nodes.name).prop('title', nodes.name);
			}
		});
		
	});
}
function showMenu($this,flag) {
	var cityObj = flag == 1 ? $this : $("#citySel");
	var cityOffset = cityObj.offset();
	$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
	$("body").bind("mousedown", onBodyDown);
}

function hideMenu() {
	$("#menuContent").fadeOut("fast");
	$("body").unbind("mousedown", onBodyDown);
}

function onBodyDown(event) {
	if (!(event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
		hideMenu();
	}
}

function onClick(e, treeId, treeNode) {
	// console.log(treeNode.id);
	$("#citySel").val(treeNode.name);
	$("#deptpid").val(treeNode.id);
}

/*************ztree end****************/


function selectCheck(this_){ //select非空校验，需要给select添加select_checked类
	if(this_.val()===''){
		return false;
	}
	return true;
}

//自适应高度
(function(){
	autoBottom();
})();
function autoBottom(){
	if($(".auto_bottom").length>0){
		var autoOffset=$(".auto_bottom").offset(),
		autoOffsetTop=autoOffset.top,
		autoHeight=$(".auto_bottom").height(),
		htmlHeight=$("html").height(),
		height=htmlHeight-autoOffsetTop-10;
		$(".auto_bottom").css("min-height",height+"px");
	}
}
//页面填充整屏
$(window).resize(function(){
	autoBottom();
});

//分页添加可控条数


// 订单列表页面右侧固定展示控制
function ScrollNav($targer){
	
	
	$targer.height(($(window).height() - 166 -10));// 初始化
	$(window).scroll(function(){
		var srcollHeight = $('body').scrollTop();
		
		var _scrollHeight = srcollHeight > 166 ? srcollHeight : 166;
		
		$targer.height(($(window).height() - 10)).offset({top: _scrollHeight});
		
	});
}


// 时间比较函数
function compareTime(start, end){
	// 起止时间 至少一个不存在时
	if (start == '' || end == '') {
		return true;
	}
	var startT = start.split("-"),
		endT = end.split("-");
	// 起止时间 都存在
	return (new Date(endT[0],endT[1]-1,endT[2].split(" ")[0])).getTime() >= (new Date (startT[0],startT[1]-1,startT[2])).getTime();
}

//日期错误提示
function timeTips($start, $end) {
	var status = compareTime($start.val(), $end.val());
	
	if (!status) {
		zh.alerts({ title: '提示', text: '截止日期不能早于开始日期！' });
		return status;
	}
	
	if ($end.val() != '' && $end.val().length < 11) {
		var _endTime = $end.val() + ' 23:59:59';
		$end.val(_endTime);
	}
}

// 顶部导航
// 提示-待开发...
/*$('body').on('click', '[data-flag="waiting"]', function(e){
	layer.msg('正在开发中...敬请期待！', {icon: 6});
});*/


/*
 * 20170811 by wxj
 * 弹窗插件
 * @param {Object} currData 
 */
function Confirm(currData,ls){

	/*
	 * 参数默认值
	 * @param {String} text 提示文本
	 * @param {Arrary} arr 按钮文本
	 * @param {Function} confirmCallback 成功回调
	 * @param {Function} cancelCallback 失败回调
	 */
	var defaultData = {
			text: '提示！',
			arr: ['确定', '取消'],
			width: '328px',
			height: ls?ls:'125px',
			textWidth: '245px',
			confirmCallback: function(){},
			cancelCallback: function(){}
		}; 
	
	var data = $.extend(true, {}, defaultData, currData);
	
	// 防止函数初始化多次  多次时只保留最后一次的初始化
	if ($('.alert-model').length > 0) {
		$('.alert-model').each(function(){
			$(this).remove();
		});
	}
		
	// 函数-初始化
	(function(){
		var str = 	
			'<div class="modal-model">' +
				'<div class="modal-mask"></div>' +
				'<div class="modal-content animated bounceInDown" style="width: ' + data.width + ';height:' + data.height + ';">' +
					'<div class="clear">' +
						'<div class="tips-img"></div>' +
						'<div class="tips-text" style="width: ' + data.textWidth + ';text-align: justify;">' + data.text + '</div>' +
					'</div>' +
					'<div class="btn-group">' +
						'<button type="button" class="btn btn-default btn-big modal-confirm">' + data.arr[0] + '</button>' +
						'<button type="button" class="btn btn-cancel btn-big modal-cancel">' + data.arr[1] + '</button>' +
					'</div>' +
				'</div>' +
			'</div>';
		
		$('body').addClass('modal-open').append(str);
	}());
	
	// 相关事件-初始化
	initConfirmEvent(data);
	
};

// 弹窗相关事件
function initConfirmEvent(data){
	//console.log(data);
	var $modalModel = $(document).find('.modal-model');
	
	// 点击-确定
	$('.modal-confirm').on('click', function(){
		if (typeof data.confirmCallback != 'function') {
			console.error('param "confirmCallback" type is a function！');
			return ;
		}
		
		data.confirmCallback();
		removeModel();
		
	});
	
	// 点击-取消
	$('.modal-cancel').on('click', function(){
		if (typeof data.cancelCallback != 'function') {
			console.error('param "cancelCallback" type is a function！');
			return ;
		}
		
		data.cancelCallback();
		removeModel();
	});
	
	// 点击-遮罩
	$('.modal-mask').on('click', function(){
		removeModel();
	});
	
	// 遮罩消失
	function removeModel(){
		$('.modal-content').addClass('animated bounceOutUp');
		setTimeout(function(){
			$modalModel.remove();
			$('body').removeClass('modal-open');
		}, 1000);
	}
}
//二级导航展开收起
(function(){
	$("body").on("click",".ss-every-model",function(){
		var this_ = $(this),
			this_p = this_.parents("dl");
		this_p.parents(".second-side-nav").find("dl").not(this_p).find("dd").slideUp("fast").end().end().end().end().find("dd").slideToggle("fast");
		this_.parents(".second-side-nav").find("dl").not(this_p).find(".s-jt-bg").removeClass("icon-up-jt-second");
		this_.find(".s-jt-bg").toggleClass("icon-up-jt-second");
	});
	var pathname = window.location.pathname,
		search = window.location.search.slice(1).split(";")[0];
	$(".query_form").attr("action",pathname + "?" + search);
})();

(function(){
	$(".ss-link").hover(function(){
		var tag = window.location.search.split("?")[1].split("&")[0].split("=")[1];
		if(($(this).attr("data-tag").toString()) != tag){
			$(this).addClass("target");
		}
	},function(){
		var tag = window.location.search.split("?")[1].split("&")[0].split("=")[1];
		if(($(this).attr("data-tag").toString()) != tag){
			$(this).removeClass("target");
		}
	});
})();






function loadingCommon(){
	if($("#loading_main").size() === 0){
		var loading="<div id='loading_main' style='width:100%;height:100%;position:fixed;top:0;left:0;z-index:100'>" +
		"<div style='width:100%;height:100%;top:0;left:0;background:#000;opacity:0.4;z-index:101'></div>" +
		"<img src='/static/project-resource/img/loading-linshi.gif' style='width:100px;height:100px;margin:auto;top:0;left:0;right:0;bottom:0;position:fixed'></div>";
		$("body").css("overflow","hidden").append(loading);
		return;
	}
	$("#loading_main").remove();
	$("body").css("overflow","visible");
	
}

/**
 * 酒店-查询时间超过20天-提示框
 */
function hotelOver20DaysTips () {
    zh.alerts({
        title: '提示',
        text: '如果您需要入住酒店超过20天，请致电' + untilConfig.telPhoneNo + '。'
    });
}


/**
 * 浏览器检测
 */
(function($) {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]:
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

    if(!$.browser){
        $.browser = Sys;
    }
})($);
/**
 * 添加标识浏览器类型的class
 */
$(function(){
//    var prefix = "browser-";
//    var $root = $("html");
//    if($.browser.ie){
//        // IE10、11开始不支持条件注释
//        var version = parseInt($.browser.ie);
//        var ieclass = "";
//        if(version>=10){
//            ieclass = "ie-gte10";
//        }else {
//            ieclass = "ie-lt10";
//        }
//        var ieVersion = "ie-" + version;
//
//        $root.addClass(prefix + "ie " + ieclass + " " + ieVersion);
//    }else {
//        for(var key in $.browser){
//            if(!key){
//                continue;
//            }
//            $root.addClass("" + prefix + key);
//        }
//    }
});

//插件互斥，关闭插件
$("body").on("blur","input",function () {
	if($(this).attr("onfocus")){
		if(typeof hideCityPluginModel == "function"){
			hideCityPluginModel();
		}
	}
});


// todo:wxj-20180111-face-相关的全局参数|方法
// todo:修改此处时同时修改/js/common下的static-variable.html文件
var FACEGLUTIL = {
	textMsg: {
		mobile: '手机号'
		,email: '邮箱'
		,ID: '身份证号'
		,otherID: '证件号'
		,errMsg: '格式错误'
		,nullMsg: '不能为空'
	}
	,regExp: {
		mobile: /^(0|86|17951)?(13[0-9]|15[012356789]|16[6]|17[035678]|18[0-9]|14[5678]|19[89])[0-9]{8}$/
		,email: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
		,ID: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
		,otherID: /^[a-zA-Z0-9]{5,15}$/
	}
};

//项目中心改为项目编码配置
$.ajax({
	url:"/isHuiChuan",
	type:"POST",
	success:function (data) {
		if(data.status==200){
			$('.isHuiChuan').val(1);
			$('.isHuiChuan_text').html(data.msg);
		}
	},
	error:function(err){
		console.error(err);
	}
	
});
//mao
$(function () {
    // 右上角个人中心悬停事件

    $('body').on('mouseenter', '.user-box', function () {
        $('.user_drap').removeClass("hide");
        $('.selectbox_arrow').removeClass('hide');
        $('.selectbox_up').addClass('hide');
    });
    $('body').on('mouseleave', '.user-box', function () {
        $('.user_drap').addClass("hide");
        $('.selectbox_arrow').removeClass('hide');
        $('.selectbox_down').addClass('hide');
    });
//

});
if($('.isoalogin_flag').val()!=""){
	$('[data-flag="air"]').remove();
	if($('.sub-nav .sub-nav-ul a').length>0){
		$('.sub-nav').show();
	}else{
		$('.sub-nav').hide();
	}
}