$(function(){
	// action-点击tab
	$('body').on('click', '.t-c-t', function(e) {
		e.stopPropagation();
		var activerStr = 'active';
		var $this = $(this);
		var tab = $this.attr('data-tab');
		var $efilterc = $this.closest('.e-filter-c');
		var $con = $efilterc.find('[data-con="' + tab + '"]');
		// 激活状态时-再次点击
		if ($this.hasClass(activerStr)) {
			$this.removeClass(activerStr);
			$con.slideUp();
			return ;
		}
		$this.siblings().removeClass(activerStr);
		$this.addClass(activerStr);
		$con.siblings().slideUp();
		$con.slideToggle();
	});
	//点击查询
	$('#hotel-query').on('click', function() {
		 if(verifyQuery()){
			$("#searchForm").prop("action","/hotel/list").submit();
		 }
	});

	//点击详情
	$("body").on("click",".btn-see, .btn-hotel-name",function(){
		var url=location.protocol + "//"+location.host+"/hotel/detial/"+$(this).attr('data-hotelNo')+"?checkIn="+$("#checkIn").val()+"&checkOut="+$("#checkOut").val();
		window.location.pathname="/hotel/detial/";
		window.location.href=url;
	});
	
	// action-点击-展示更多设施
	$('#more-trig').on('click', function() {
		var $this = $(this)
		$fwall = $('.f-w-all'),
		span = '<span class="icon-img position-ab flod-img"></span>';
		if ($fwall.is(':hidden')) {
			$fwall.slideDown();
			$this.html('收起' + span).removeClass('fold').addClass('unfold');
		} else {
			$fwall.slideUp();
			$this.html('更多' + span).removeClass('unfold').addClass('fold');
		}
	});
	// 单击空白收起tab展开内容
	$("body").on("click",function(){
			$(".t-c-t").removeClass("active");
			$(".t-c-c").slideUp();
	});
	// // action-点击-展示更多设施
	// $('#more-trig').on('click', function() {
	// 	var $this = $(this)
	// 	$fwall = $('.f-w-all'),
	// 		span = '<span class="icon-img position-ab flod-img"></span>';
	//
	// 	if ($fwall.is(':hidden')) {
	// 		$fwall.slideDown();
	// 		$this.html('收起' + span).removeClass('fold').addClass('unfold');
	// 	} else {
	// 		$fwall.slideUp();
	// 		$this.html('更多' + span).removeClass('unfold').addClass('fold');
	// 	}
	// });

	//展示筛选条件
	$("body").on("click",".slide_shut",function(e){
		e.stopPropagation();
		$(this).parent().find(".default-height").toggleClass("show-height");
	});
	hotelQuery(1);
	
});

var search=false;
/**
 * 列表页查询航班
 */
function hotelQuery(tag){
	 if(verifyQuery() && !search){
		 initPage("0",tag,true,"");
		 //锚定头部
		 if(tag != "" && tag != undefined && tag!= "1"){
			scrollTo(0,60)
		 }
		 $.ajax({
			type : "post",
			url : "/hotel/search",
			data: $("#searchForm").serialize(),
			dataType : "json",
			beforeSend : function(){
			    search = true;
				$("#hotel-list").html("<p style='width:50px;margin:0 auto;'><img src='/resources/js/plugin/layer/theme/default/loading-2.gif'/></p>");
				//显示遮罩
			},success : function(json) {
				$("#hotel-list").html("");
				if(null==json || json == ""){
					showMsg("查询失败，请重新查询。");
					return false;
				}
				if(json==null || json==undefined || json.status!=200){
					showMsg(json.msg);
					return false;
				}
				$(".no-data-wraper").css("display","none");
				$(".hotel-list-wraper").css("background","");
				jsonParse(json);
			},complete:function(XMLHttpRequest,status){
				search = false;
				if(status=='timeout' || status=='parsererror'){
					showMsg("查询失败，请重新查询。");
				}
			}
		});
	 }
}

//h.settle==1?('<span class="position-ab hotel-type" style="margin-left:5px;white-space: nowrap;">公司支付</span>'):""
function jsonParse(json){
	if(json.data!=null && json.data!=undefined){
		for(i=0;i<json.data.data.length;i++){
			var h = json.data.data[i];
			var html = '<div class="every-cell clear" price = "'+h.lowRate+'" data="'+h.hotelNo+'" baidulat="'+h.latitude+'" baidulon="'+h.longitude+'"><div class="clear">';
			    html += '<div class="e-cell-l clear"><div class="e-cell-i">';
			    html += '<img onerror="this.src=\'/resources/images/hotel/default.png\'"  src="'+((h.coverImage==undefined || h.coverImage=="")?'/resources/images/hotel/default.png':h.coverImage.replace("120_120","180_135"))+'" alt="'+h.nameCn+'"></div>';
			    html += '<div class="e-cell-des position"><div class="e-cell-t height-23"><span class="hoverTips hover_content btn-hotel-name" data-hotelNo="'+h.hotelNo+'">'+h.nameCn+'</span><span>'+(h.settle=="1"?'<span class=" hotel-type-6BA8F3 color-6BA8F3" style="margin-left:5px;white-space: nowrap;">公司付</span>&nbsp;':"") +((h.tags!=undefined && h.tags.indexOf('P')>-1)?'<span class=" hotel-type-6BA8F3">协议</span>&nbsp;':"")+ ((h.tags!=undefined && h.tags.indexOf('D')>-1)?'<span class="hotel-type-6BA8F3">直销</span>':"")+'</span></div>';
				if(h.geohash==undefined || h.geohash==''){
				    html += '<div class="e-cell-a font-size-12">' ;
					html += '<span class="e-cell-rank font-size-12 margin-right-14">';
					if(h.category==5){
						html += '<span class="margin-right-10">' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'</span>豪华型';
					}else if(h.category==4){
						html += '<span class="margin-right-10">' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'</span>高档型';
					}else if(h.category==3){
						html += '<span class="margin-right-10">' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'</span>舒适型';
					}else if(h.category==2){
						html +='<span class="margin-right-10">' +
							'<span class="star-level"></span>' +
							'<span class="star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'<span class="nothing-star-level"></span>' +
							'</span>经济型';
					}
					html += '</span>';
					html += h.addressCn+'<span class="baidu-btn  cursor color-888">查看地图<span class="baidu-img"></span></span></div>';
				}else{
				    html += '<div class="e-cell-a font-size-12">['+h.geohash+']'+h.addressCn+'<span class="baidu-btn  cursor color-888">查看地图<span class="baidu-img"></span></span></div>';
				}
			 
				html +=	'<div class="show-server">';
				//服务图标
				if(h.facilities!='' && h.facilities!=undefined){
					var facilities=h.facilities.split(',');
					for (var f= 0; f< facilities.length;f++) {
						var type=facilities[f];
						if (type == '1' || type == '2' || type == '3' || type == '4') {//1、免费wifi 2、收费wifi 3、免费宽带 4、收费宽带
							// 免费wifi
							html+= ' <div class="float-left margin-right-27 color-333">' +
								'<span title="上网" class="e-server e-s-wifi float-left"></span> 上网</div>';
						}else if (type == '5' || type == '6') {//5、免费停车场 6、收费停车场
							// 免费停车场
//							html += '<span class="e-server e-s-parking float-left"></span>';
						}else if (type == '7' || type == '8') {////7、免费接机服务 8、收费接机服务
							html += ' <div class="float-left color-333 margin-right-27">' +
								'<span title="'+(type==7?"免费接机服务":"收费接机服务")+'" class="e-server e-s-stair float-left"></span>' +
								'接机服务</div>';
						}else if (type == '9' || type == '10') {//9、室内游泳池 10、室外游泳池
							html += '<div class="float-left color-333 margin-right-27">' +
								'<span title="'+(type==9?"室内游泳池":"室外游泳池")+'" class="e-server e-s-swimming float-left"></span> ' +
								'游泳池</div>';
						} else if (type == '11') {//11、健身房
							html += '<div class="float-left color-333 margin-right-27"><span title="健身房"  class="e-server e-s-gym float-left"></span> 健身房</div>';
						} else if (type == '12') {//商务中心
							html += '<div class="float-left color-333 margin-right-27">' +
								'<span title="商务中心" class="e-server e-s-centre float-left"></span>' +
								'商务中心 </div>';
						} else if (type == '13') {//13、会议室
							html += '<div class="float-left color-333 margin-right-27">' +
								'<span title="会议室" class="e-server e-s-meeting float-left"></span> ' +
								'会议室 </div>';
						}else if (type == '14') {//14、酒店餐厅
								html += '<div class="float-left color-333 margin-right-27">' +
									'<span title="酒店餐厅" class="e-server e-s-restaurant float-left"></span> ' +
									'酒店餐厅 </div>';
						}else if (type == '15') {//15、叫醒服务
								html += '<div class="float-left color-333 margin-right-27">' +
									'<span title="叫醒服务" class="e-server e-s-wake float-left"></span>叫醒服务</div>';
						}else if (type == '16') {//16、提供发票
								html += '<div class="float-left color-333 margin-right-27">' +
									'<span title="提供发票" class="e-server e-s-invoice float-left"></span>' +
									'提供发票</div>';
						}else if (type == '17') {//17、租车服务
								html += '<div class="float-left color-333 margin-right-27">' +
									'<span title="租车服务" class="e-server e-s-renting float-left"></span>' +
									'租车服务</div>';
						}else if (type == '18') {//18、洗衣服务
								html += '<div class="float-left color-333">' +
									'<span title="洗衣服务" class="e-server e-s-laundry float-left"></span>' +
									'洗衣服务</div>';
						}
					}
				}
				html+='</div></div></div>';
				// if(h.tags!=undefined){
				// 	if(h.tags.indexOf('P')>-1){
				// 		html+='<span class="position-ab hotel-type">协议</span>';
				// 	}
				// 	if(h.tags.indexOf('D')>-1){
				// 		html+='<span class="position-ab hotel-type">直销</span>';
				// 	}
				// }
				// if(h.settle=="1"){
				// 	html+='<span class="position-ab hotel-type">公司支付</span>';
				// }
				//edit price
				var servScort = 0;
				if(h.serviceScore!=undefined && h.serviceScore.reviewGood!=undefined ){
					servScort=h.serviceScore.reviewGood;
				}
				if(servScort<=10){
					servScort=Math.floor(Math.random()*100)+500;
				}
				html+='<div class="clear float-right height-160">' +
					'<div class="background-fdfdfd height-160 clear">' +
					'<div class="float-left pl-model">' +
					// '<div class="pl-c font-size-16 clear">' +
					'<div class="font-size-12 pl-num margin-top-16 color-BDBDBD">' ;
				html+= '<span class="float-right font-size-12">好评率</span><span class="float-right color-D44A9F font-size-16 margin-left-8" >'+(h.serviceScore==null?"0":h.serviceScore.reviewScore)+'</span>' ;
				html +='<span class="float-right font-size-12">' +
					'来自 ' +
					'<span class="font-size-12 color-BDBDBD">'+servScort+'</span> 条点评' +
					'</span>';
				html+='</div>';
				
				if (h.lowRate <= 0) {
                    html+='<div class="float-left book-model"><div class="book-text globalColor clear">';
                    html+='<span class="float-left color-d10773" style="font-size: 12px;color: grey;margin-left: 30px">已订完</span></div>';
                    html+='<div class=""><button type="button" data-hotelNo="'+h.hotelNo+'" class="btn btn-cancel btn-see font-size-16" style="background-color:#ccc;border: #ccc;color: white">查看详情</button></div></div>';
				} else  {
                    html+='<div class=" book-model"><div class="book-text globalColor clear"><span class="font-size-12 float-right sub-text">起</span>';
                    html+='<span class="float-right color-D44A9F" style="">'+h.lowRate+'</span><span class="float-right color-D44A9F font-size-16">￥</span></div>';
                    html+='<div class=""><button type="button" data-hotelNo="'+h.hotelNo+'" class="btn btn-cancel btn-see font-size-12" >查看详情</button></div></div></div></div></div> </div>';
				}

				
				html+='<div class="allmap-box"></div>';
				$("#hotel-list").append(html);
		}
		if(json.status!=200){
			intPage(0,json.data.currentPage,false,"共"+json.data.totalPage+"页")
		}else{
			initPage(json.data.total,json.data.currentPage,false,"共"+json.data.totalPage+"页")
		}
		pageNav.page(json.data.currentPage,json.data.totalPage);
	}else{
		showMsg("很抱歉，暂时未找到符合条件的酒店。");
	}
}

// 展示信息提示
function showMsg(msg){
	$(".no-data-wraper").css("display","block");
	$(".hotel-list-wraper").css("background","#fff");
	$(".no-data-pics").attr("title",msg);
	$(".no-data-text").html(msg);
	$("#hotel-list").html("");
}

function initPage(totalNum,index,tag,totalPage){
	$("#totalNum").text(totalNum);
	$("#currentPage").val(index);
	if(tag){
	   $("#pageNav").html("");
	}
	$("#totalPage").html(totalPage);
}



// $(function(){
// 	//筛选条件下拉
// 	$("body").on("click",".slide_shut",function(){
// 		$(this).parent().find(".default-height").toggleClass("show-height");
// 	});
//
// 	//展示筛选条件
// 	$("body").on("click",".filter-model .label",function(){
// 		var this_ = $(this);
// 		if(this_.is("[data-flag='1']")){
// 			$("[data-zprice='ele']").removeAttr("disabled");
// 			return;
// 		}
// 		this_.find("input").is("[name=price]") ? $("[data-zprice='ele']").val("") : "";
// 		$("[data-zprice='ele']").attr("disabled","disabled");
// 		queryList.showSelect(this_);
// 	});
// 	//清空筛选条件
// 	$("body").on("click","#remove-all-filter",function(){
// 		$("[data-show='select']").html("");
// 		$(".all-con-wraper").hide();
// 		$(".filter-model").find(".label").removeClass("label-select-radio label-select-checkbox").find("input").prop("checked",false);
// 	});
//
// 	//删除单个条件
// 	$("body").on("click",".remove-filter",function(){
// 		var this_ = $(this),
// 			parents = this_.parents("span"),
// 			input = $(".filter-model").find(".label").find("input[name='" + parents.attr("data-match") + "'][value='" + parents.attr("data-val") + "']"),
// 			label = input.parents(".label"),
// 			wrap = $("[data-show='select']"),
// 			wrapp = wrap.parents(".all-con-wraper");
// 		label.removeClass("label-select-radio label-select-checkbox");
// 		input.prop("checked",false);
// 		parents.remove();
// 		wrap.html() == "" ? wrapp.hide() : wrapp.show();
// 	});
// 	//过滤输入的自定义价格
// 	$("body").on("input propertychange","[data-zprice='ele']",function(){
// 		var this_ = $(this),
// 			this_val = $.trim(this_.val()),
// 			val = "";
// 		val = this_val.replace(/[^0-9]/gi,"");
// 		this_.val(val);
//
// 	});
//
// 	//自定义价格
// 	$("body").on("click",".btn-spe",function(){
// 		var labelEle = $(".label[data-flag='1']"),
// 			inputz = labelEle.find("input"),
// 			price = [],
// 			fullfill = function(f_val,f_text){
// 				inputz.val(f_val);
// 				inputz.attr("data-text",f_text);
// 				queryList.showSelect(labelEle);
// 			};
//
// 		$("[data-zprice='ele']").each(function(){
// 			price.push($.trim($(this).val()));
// 		});
// 		if(price[0] == "" && price[1] == ""){
// 			fullfill("0-","不限");
// 			return;
// 		}
// 		price[0] = price[0] == "" ? 0 : price[0];
// 		if(price[1] == ""){
// 			fullfill(price[0],price[0] + "元以上");
// 			return;
// 		}
// 		if(price[1] <= price[0]){
// 			alert("请输入正确的区间范围！");
// 			return;
// 		}
// 		fullfill(price.join("-"),price.join("-") + "元");
// 		return;
// 	});
// });
