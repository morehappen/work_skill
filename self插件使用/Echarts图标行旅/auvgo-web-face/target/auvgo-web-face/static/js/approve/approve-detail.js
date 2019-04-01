$(function(){

	// 审批
	$("body").on("click","#main-content button",approveMain);

	// 审批主函数
	function approveMain () {
		var this_ = $(this),
			this_p = this_.parent(),
			size = this_p.find("button").size(),
			result = this_.index() === 0 ? "Y" : (this_.index() === 1 ? "N" : ""),
			type = $(".mark_").val(),
			orderNo = $(".get_orderno").attr("data-orderno"),
			cancle = function () {
				var pathnameArr = window.location.search.slice(1).split("&"),
					tag = pathnameArr[0].split("=")[1],
					type = pathnameArr[1].split("=")[1];
				window.location.href = '/myApproval/getAllApproveOrder/' + tag + '/' + type;
			},
			submitApprove = function () {
				$.ajax({
					url: '/' + type + '/order/approvesave',
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
						preventRepeatSubmit("add",this_,24,result);
					},
					success : function(data) {
						if (data.status === 200) {
							layer.msg(data.msg);
							preventRepeatSubmit("clear");
							setTimeout(function() {location.reload();}, 3000);
						}else{
							layer.alert("系统偶尔也会累，请重新提交或拨打客服电话4006060011");
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
			};
		if(size > 1 && !(this_.index() === 2)){
			submitApprove();
			return;
		}
		cancle();
	}

	$('.tuigai-des').hover(function(){
		$(this).find('table').stop().fadeIn();
	}, function(){
		$(this).find('table').stop().fadeOut();
	});


});