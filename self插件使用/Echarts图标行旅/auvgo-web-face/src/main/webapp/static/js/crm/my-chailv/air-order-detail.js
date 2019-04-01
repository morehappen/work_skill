//========= 正常单详情 begin =============

function cancleOrderMain(orderno,layShow) {
	$.ajax({
		url: '/air/cancle',
		data: {'orderno':orderno},
		type: 'POST',
		success: function(data){
			layer.msg(data.msg);
			layer.close(layShow);
			if (data.status == 200) {
				setTimeout(function(){ location.reload(); }, 1000);
			}
		},
		error: function(xhr, errorType, error){
			console.error(xhr);
			console.error(errorType || error);
			layer.close(layShow);
		}
	});
}
$.ajax({
	url:"/crm/jiesuan",
	type:"post",
	success:function(data){
		// console.log(data);
		if(data.data.fukuankemu=="4"){
			$(".fanxian").val("true");
			$(".fanxian-hide").show();
		}
		
	}
});
// action-点击-取消订单
$("body").on("click", ".cancleOrder", function(){
	var layShow = layer.confirm('取消订单后需要重新预订，确定取消吗？', {
		btn: ['确定','取消']
	}, function(){
		// 确定取消订单
		var orderno = $('#normal-orderno').data('orderno');
		cancleOrderMain(orderno,layShow);
	}, function(){
		layer.close(layShow);
	});
});


//申请改签
$("body").on("click",".js-apply-change",function(){
var orderno=$("#normal-orderno").attr("data-orderno");
var ordertype=$("#orderfrom").val();
if(ordertype=="4"){
	layer.msg("如需操作此订单的退票/改签，请拨打客服电话4006060011");
}else{
	$.ajax({
		url:"/myChailv/iscantg/"+orderno+"/0",
		type:"post",
		success:function(data){
			if(data.status==200){
				zh.iframes({
					width: "688px",
					height: "480px",
					url : "/ticketChange/applyGQ/" + $("#normal-orderno").attr("data-orderno"),
					title: "申请改签",
					newStyle: true
				});
			}else{
				layer.msg(data.msg);
			}
		}
	});
}
});
//申请退票
$("body").on("click",".js-apply-refund",function(){
	
	var orderno=$("#normal-orderno").attr("data-orderno");
	var ordertype=$("#orderfrom").val();
	if(ordertype=="4"){
		layer.msg("如需操作此订单的退票/改签，请拨打客服电话4006060011");
	}else{
		$.ajax({
			url:"/myChailv/iscantg/"+orderno+"/1",
			type:"post",
			success:function(data){
				if(data.status==200){
					zh.iframes({
						width: "688px",
						height: "480px",
						url : "/air/tuipiao/toPage/" + $("#normal-orderno").attr("data-orderno"),
						title: "申请退票",
						newStyle: true
					});
				}else{
					layer.msg(data.msg);
				}
			}
		});
	}	
});






/* 	
//退票按钮
$("body").on("click",".normal-refund",function(){

	var orderno = $('#normal-orderno').data('orderno');
	
	$.ajax({
		url : '/air/airtuipiao',
		data : {'orderno' : orderno},
		type : 'POST',
		success: function(data){
			
			layer.msg(data.msg);
			
			if (data.status == 200) {
				setTimeout(function(){ location.reload(); }, 1000);
			}
			
		},
		error: function(xhr, errorType, error){
			console.error(xhr);
			console.error(errorType || error);
		}
	});
	
});
//改签按钮
$("body").on("click",".normal-endorse",function(){

	var orderno = $('#normal-orderno').data('orderno');
	
	$.ajax({
		url : '/air/airgaiqian',
		data : {'orderno' : orderno},
		type : 'POST',
		success: function(data){
			
			layer.msg(data.msg);
			
			if (data.status == 200) {
				setTimeout(function(){ location.reload(); }, 1000);
			}
			
		},
		error: function(xhr, errorType, error){
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}); */


// 确认出票
$('body').on('click', '.confirmOrder', function(){
	
	var orderno = $('#normal-orderno').attr('data-orderno');
	changePrice("");
	function changePrice (price) {
		$.ajax({
			url: '/air/confirm',
			data: {orderno: orderno,price: price},
			type: 'POST',
			success: function(data){
				if (data.status == 200) {
					setTimeout(function(){ location.reload(); }, 1000);
					layer.msg(data.msg);
					return;
				}
				if(data.status == 301){
					var layShow = layer.confirm(data.msg + data.data + "，是否继续出票?", {
						btn: ['确认出票','取消订单']
					}, function(){
						return changePrice(data.data);
					}, function(){
						return cancleOrderMain(orderno,layShow);
					});
				}else{
					layer.alert(data.msg);
				}
			},
			error: function(xhr, errorType, error){
				console.error(xhr);
				console.error(errorType || error);
			}
		});
	}

});

// ========= 正常单详情 end =============




//========= 改签单详情 begin =============
// action-改签-退票
$('body').on('click', '#endorse-refund', function(){
	zh.alerts({ title: '提示', text: '当前订单是改签单，如需再次操作，请拨打客服电话4006060011' });
});
// action-改签-改签
$('body').on('click', '#endorse-endorse', function(){
	zh.alerts({ title: '提示', text: '当前订单是改签单，如需再次操作，请拨打客服电话4006060011' });
});
//========= 改签单详情 end =============


$(function(){
	// 鼠标经过-退改签
	$('.tuigai-des').hover(function(){
		var val = $.trim($(this).data('value'));
		if(val=="true"){
			$(this).find('table').stop().fadeIn();
		}
	}, function(){
		$(this).find('table').stop().fadeOut();
	});
	
	
	/*****节省费用图标*****/
//	if(document.getElementById('saveCostChart') !== null){
//		var myChart = echarts.init(document.getElementById('saveCostChart'));
//		//参数配置
//		option = {
//			    tooltip: {
//			        trigger: 'item',
//			        formatter: "{a} <br/>{b}: {c} ({d}%)"
//			    },
//			    legend: {
//			        orient: 'vertical',
//			        x: 'left',
//			        data:['全价票价','实际票价']
//			    },
//			    series: [
//			        {
//			            name:'访问来源',
//			            type:'pie',
//			            radius: ['50%', '70%'],
//			            avoidLabelOverlap: false,
//			            label: {
//			                normal: {
//			                    show: false,
//			                    position: 'center'
//			                },
//			                emphasis: {
//			                    show: true,
//			                    textStyle: {
//			                        fontSize: '30',
//			                        fontWeight: 'bold'
//			                    }
//			                }
//			            },
//			            labelLine: {
//			                normal: {
//			                    show: false
//			                }
//			            },
//			            data:[
//			                {value:2480, name:'全价票价'},
//			                {value:310, name:'实际票价'}
//			            ]
//			        }
//			    ]
//			};
//		//初始化
//		myChart.setOption(option);
//	}
	callnbackSearch();
	function callnbackSearch() {
		var search = location.search.split('?')[1].split('&&');
		var istag = '';
		var all = '';
		if(search.length==2){
			$.each(search,function(index,item){
				var val = item.split('=');
				if(val[0]=="tag"){
					istag = val[1];
				}else if(val[0]=="flag"){
					all = val[1];
				}
			});
		}
		if(istag){
			$("body").on("click",".air-order-cancle",function(){
				if(all=="all"){
					window.location.href= '/myChailv/toNoshowAirOrder/all?tag=airNoShow';
				}else{
					window.location.href= '/myChailv/toNoshowAirOrder/personal?tag=airNoShow';
				}
			});
		}else{
			$("body").on("click",".air-order-cancle",{pathname:"/myChailv/toNewAirOrder/",search:"?tag=air"},addReturnHref);
		}
		
	}
	//返回按钮链接控制
	
});

	
