$(function(){

	// 获取文件路径
	function getPath () {
		var location_ = window.location,
			href = location_.href,
			pathname = location_.pathname,
			pathnameArr = pathname.split("/"),
			tag = pathnameArr[pathnameArr.length-2],
			type = pathnameArr[pathnameArr.length-1];
		return {
			href: href,
			pathname: pathname,
			tag: tag,
			type: type,
			pathnameArr: pathnameArr
		};
	}

	// 页面审批跳转
	function approveHref (type,index) {
		var loactionObj = getPath(),
			oldPathArr = loactionObj.pathnameArr;
		index !== undefined ? oldPathArr[oldPathArr.length-2] = index : "";
		oldPathArr[oldPathArr.length-1] = type;
		window.location.href = oldPathArr.join("/");
	}
	// 结束时间回显问题
	(function reShow(){

		var $LTEdate = $('#LTE_date');
		if ($LTEdate.val() && $LTEdate.val().length > 10) {
			var reShowStr = $LTEdate.val().substr(0, 10);
			$LTEdate.val(reShowStr);
		}

	})();
	// 获取文件路径，增加控制二级导航，三级导航
	(function(){
		var loactionObj = getPath(),
			tag = loactionObj.tag,
			type = loactionObj.type,
			allType = {'all': 0,'air': 1,'hotel': 2,'train': 3,'approve': 4,'newhotel': 5},
			sideEle = $(".second-side-nav dl");
		sideEle.eq(tag).find("a").addClass("target")
		$(".second-side-nav a[data-tag='" + tag + "']").addClass("target").parents("dl").find("dd").show();
		$(".tab-model a").eq(allType[type]).addClass("tab-target");
	})();

	// 切换审批模块
	$("body").on("click",".second-side-nav a",function(){
		var index = $(this).parents("dl").index();
		approveHref ('all',index);
	});

	// 切换审批订单类型
	$("body").on("click",".tab-model a",function(){
		var index = $(this).parents("li").index(),
			type = ['all','air','hotel','train','approve','newhotel'];
		approveHref (type[index]); //这里只允许传一个参数
	});

	// 订单详情跳转链接
	$("body").on("click","tr a",function(){
		var this_ = $(this),
			inputH = this_.parents("tr").find("input[type=hidden]"),
			orderNo = $.trim(inputH.val());
			loactionObj = getPath();
			type = inputH.attr("data-type");
			if(type == "newhotel"){
				window.location.href = "/hotel/order/approval/input/" + orderNo + "?&type=" + loactionObj.tag+"-"+loactionObj.type+"&flag=myApproval";
			}else{
				window.location.href = "/myApproval/toApproveDetail/" + orderNo + "?tag=" + loactionObj.tag + "&type=" + loactionObj.type;
			}
			
	});

	//调用审批
	$("body").on("click","table button",function(){
		var this_ = $(this),
			dataInput = this_.parents("tr").find("input:first"),
			orderNo = dataInput.val(),
			type = dataInput.attr("data-type"),
			result = this_.index() === 0 ? "Y" : "N";
			if(type == "newhotel"){
				url = "/hotel/order/approval";
			}else{
				url = "/" + type + "/order/approvesave";
			}
		$.ajax({
			url: url,
			type: 'post',
			data: {
				'orderno': orderNo,
				'result': result,
				'reason': ""
			},
			beforeSend: function () {
				if(preventRepeatSubmit("prevent")){ // 防止请求过程中重复点击及点击其他按钮进行请求
					return false;
				}
				preventRepeatSubmit("add",this_,16,result);
			},
			success : function(data) {
				if (data.status === 200) {
					layer.msg(data.msg);
					preventRepeatSubmit("clear");
					setTimeout(function() {location.reload();}, 3000);
				}else{
					if(type == "newhotel"){
						layer.alert(data.msg);
					}else{
						layer.alert("系统偶尔也会累，请重新提交或拨打客服电话4006060011");
					}
					preventRepeatSubmit("clear");
				}
			},
			error : function(error) {
				console.error(error);
				preventRepeatSubmit("clear");
				if(error.status === 0){
					layer.alert("确保您的网络畅通，请重新提交~");
					return;
				}
				layer.alert("系统偶尔也会累，请重新提交或拨打客服电话4006060011");
			}
		});
	});

});