//总夜数
function countNight(){
	var time1 = Date.parse(new Date($.trim($("#checkIn").val())));
	var time2 = Date.parse(new Date($.trim($("#checkOut").val())));
	var dayNum = Math.abs(parseInt((time2 - time1)/1000/3600/24));
	$("#interval").html(dayNum);
}

//周几
function getWeek(str) {
	if(str==undefined || str==""){
		return str;
	}
	var d = new Date(Date.parse(str.replace(/-/g, "/")));
	d = d.getDay();
	switch (d) {
	case 1:
		return "周一";
		break;
	case 2:
		return "周二";
		break;
	case 3:
		return "周三";
		break;
	case 4:
		return "周四";
		break;
	case 5:
		return "周五";
		break;
	case 6:
		return "周六";
		break;
	case 0:
		return "周日";
		break;
	default:
		return "无法识别的日期";
	}
}


/**
 * 对时间的操作
 * @param date>>YYYY-MM-DD
 * @param days>>1
 * @returns {String}
 */
function formDate(date, days,type) {
	var d =new Date(Date.parse(date.replace(/-/g,   "/"))); 
	d.setDate(d.getDate() + days);
	var month = d.getMonth() + 1;
	var day = d.getDate();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	var val;
	if(type=="yyyy-MM-dd"){
		val = d.getFullYear() + "-" + month + "-" + day;
	}else if (type=="MM月dd日"){
		val = month + "月" + day+"日";
	}else if (type=="MM-dd"){
		val = month + "-" + day;
	}else if (type=="年月日"){
		val = d.getFullYear() + "年" + month + "月" + day +"日";
	}else if (type=="MM/dd"){
		val =  month + "/" + day;
	}
	return val;
}
//图片加载
function loadImages(){
	//图片初始化
	var images=$("#hotelImages").val();
	if(images!=null && images.length>1){
		var hotelImages=images.split(",");
		for(j = 0; j < hotelImages.length; j++) {
			if(hotelImages[j]!=''){
			   $("#slider_con").append('<div class="e-img '+(j==0?"active":"")+'" ><div class="small-mask"></div><img src="'+$.trim(hotelImages[j])+'"></div>');
		     }
		}
	};
}

/**
 * 房型、产品、价格
 */
function loadRoom(){
	var hotelNo=$("#hotel-id").attr("data-hotelid");
	var checkIn=$("#checkIn").val();
	var checkOut=$("#checkOut").val();
	$.ajax({
		type : "POST",
		url : "/hotel/room",
		data : {
			hotelNo : hotelNo,
			checkIn : checkIn,
			checkOut : checkOut
		},
		dataType : "json",
		beforeSend : function() {
			$("#hotelRooms").html("<p style='width:50px;margin:0 auto;'><img src='/resources/js/plugin/layer/theme/default/loading-2.gif'/></p>");
		},
		success : function(json) {
			roomParse(json);
		},
		error:function(err,status){
			
		},
		complete:function(XMLHttpRequest,status){
			
		}
	});
}


function roomParse(json){
	$("#hotelRooms").html("");
	if(json.status==200 && json.data.status=="00000" && json.data.rooms!=null && json.data.rooms.length>0){
		for(i=0;i<json.data.rooms.length;i++){
			var room= json.data.rooms[i];
			var htmlPlan='';
			 //遍历产品	
			var p=false;
			var d=false;
			var c=false;
			for (var r= 0;r<room.rateplans.length;r++) {
				if(room.rateplans[r].tags=="P"){
					p=true;
				}
				if(room.rateplans[r].tags=="D"){
					d=true;
				}
				if(room.rateplans[r].settlement=="Enterprise"){
					c=true;
				}
				htmlPlan+=appendPlan(room,r,json)
			}
			var html = '<li class="e-room-t clear"><div class="e-room-t-head clear" style="position:relative;"> <input type="hidden" class="hidden-price" value="'+room.lowAverage.toFixed(0)+'"> ' +
						'<img  src="' + (!(room.imageUrl==null || room.imageUrl=="") ? room.imageUrl : "/resources/images/hotel/default.png") + '" alt="" class="float-left"><div class="float-left">' +
						'<div class="font-size-16 clear">' +
						'<span class="room_rname float-left">' + room.rname + '</span>'+
							'<span class="float-left">' +
								(room.area? '<span class="room_information">' +
									'<div class="font-size-12 color-888" style="margin-bottom:15px;">房间</div>' +
									'<div class="font-size-16">'+ room.area + 'm<sup style="font-size:12px;">2</sup></div>' +
									'</span>':"")+
								(room.bedDesc? '<span class="room_information">' +
									'<div class="font-size-12 color-888" style="margin-bottom:15px;">床</div>' +
									'<div class="font-size-16">'+ room.bedDesc + '</div>' +
									'</span>':"")+
								(room.capacity? '<span class="room_information">' +
									'<div class="font-size-12 color-888" style="margin-bottom:15px;">可住</div>' +
									'<div class="font-size-16">'+ room.capacity + '</div>' +
									'</span>':"")+
								(room.floor? '<span class="room_information">' +
									'<div class="font-size-12 color-888" style="margin-bottom:15px;">楼层</div>' +
									'<div class="font-size-16">'+ room.floor +'</div>' +
									'</span>':"")+
								(room.windows? '<span class="room_information">' +
									'<div class="font-size-12 color-888" style="margin-bottom:15px;">窗户</div>' +
									'<div class="font-size-16">'+ (room.windows=="1" ? "有窗" : (room.windows == "2" ? "部分有窗" : "无窗")) + '</div>' +
								'</span>':"")+
							'</span>'+
							
						'</div>' +
				        // '<div class="e-room-f clear font-size-12 clear" >' +
						// (room.windows? '<div class="e-room-f-wraper"><span class="e-f-bg icon-img e-f-01"></span><span class="e-f-text">' + (room.windows=="1" ? "有窗" : (room.windows == "2" ? "部分有窗" : "无窗")) + '</span></div>':'') +
						// (room.floor?'<div class="e-room-f-wraper"><span class="e-f-bg icon-img e-f-02"></span><span class="e-f-text">' + room.floor + '层</span></div>':'') +
						// (room.capacity?'<div class="e-room-f-wraper"><span class="e-f-bg icon-img e-f-05"></span><span class="e-f-text">可住' + room.capacity + '人</span></div>':'') +
						// (room.area?'<div class="e-room-f-wraper"><span class="e-f-bg icon-img e-f-03"></span><span class="e-f-text">' + room.area+ '㎡</span></div>':'') +
						// (room.bedDesc?'<div class="e-room-f-wraper"><span class="e-f-bg icon-img e-f-04"></span><span class="e-f-text">' + room.bedDesc + '</span></div></div></div>':'') +
					'</div>'+
				        	'<div class="low-price-wraper clear">' +
								'<div class="color-purple float-right" style="position:relative;width:105px;text-align: left;">' +
									'<span class="font-600 font-size-14 '+(room.amount<0?'color-cccccc':'color-d10773')+'">￥<span class="font-size-28">' + room.lowAverage.toFixed(0)+ '</span></span>' +
									'<span class="color-999 font-size-12 color-cccccc">起</span>' +
								'</div>' +
								'<span class="exceed-flag exceed-flag-padding exceed-standard float-right hide margin-right-9">超标</span>' +
								(c?' <span class="exceed-flag exceed-flag-6BA8F3 exceed-flag-padding float-right margin-right-9">公司付</span>':'')+
								(p?' <span class="exceed-flag exceed-flag-6BA8F3 exceed-flag-padding float-right margin-right-9">协议</span>':'')+
								(d?' <span class="exceed-flag exceed-flag-6BA8F3 exceed-flag-padding float-right margin-right-9">直销</span>':'')+
							'</div>' +
							'<br>' +
							'<span style="position: absolute; bottom:18px;right:51px;">' +
								'<span style="margin-right:20px; font-size:12px;">共'+room.rateplans.length+'个产品</span> ' +
								'<div class="slide_shut position-ab cursor"></div>' +
							'</span>' +
						'</div>' +
							'<ul class="e-room-t-b clear font-size-12" style="display: none;"">' +
							'<li><div class="e-r-title-wraper h-53 clear color-999">' +
				        	'<div class="float-left w-d margin-left-79" >产品名称</div><div class="float-left w-150">早餐</div><div class="float-left w-200">取消政策</div><div class="float-left w-180">付款方式</div><div class="float-left w-84">日均价</div><div class="float-left w-d"></div></div>';
			html+=htmlPlan;
			html += '</li></ul></li>';
			$("#hotelRooms").css("background","");
			$(".no-data-wraper").css("display",'none');
			$("#hotelRooms").append(html);
		}
		hotel_query_detail.ajax_detail();
	}else{
		if(json.data.status!="00000"){
			$("#hotelRooms").html(json.data.msg);
		}else{
			$("#hotelRooms").css("background","#ffffff");
			html = '<div class="no-data-wraper"><div class="auvgo-approve-bgs no-data-pics" title="很抱歉，当前日期已售完"></div> <div class="no-data-text">很抱歉，当前日期已售完</div> </div>';
			$("#hotelRooms").html(html);
			$(".no-data-wraper").css("display",'block');
			// $("#hotelRooms").html("很抱歉，当前日期已售完");
		}
	}
}

function appendPlan(room,index,json){
	var rate=room.rateplans[index];
	var checkOut = $('#checkOut').val();
	var checkIn = $('#checkIn').val();
	var htmlRs="";
    //每日价格
	var htmlaverage="";
    //按钮显示
    var htmlButton="";
    for(var e=0;e<rate.rates.length;e++) {
		var re=rate.rates[e];
      	htmlaverage+='<input type="hidden" class="'+room.roomNo+rate.planId+index+'" value="'+re.member+'" data-date="'+re.date+'" data-cost="'+re.cost+'" data-code="'+re.rateCode+'"/>';
    }
    //预订规则文本说明
    var bruleText="";
    //预订规则类型
    var bruleType="";
    if(rate.averageRate>0 && rate.status){
	    var bruleId=rate.bookingRuleIds;
	    if(bruleId!=null && bruleId.length>0){
	    	    var bruleIds=bruleId.split(",");
	    	    for (var b= 0; b<bruleIds.length;b++) {
			   if(bruleIds[b]!=""){
				   bruleText+=json.data.bookingRules[rate.platform+'_'+bruleIds[b]].description+";";
				   bruleType+=json.data.bookingRules[rate.platform+'_'+bruleIds[b]].typeCode+";"
			    }
			  }
        }
      	htmlButton='<button value="'+room.hotelNo+'" type="button" data-plancode="'+rate.planCode+'" data-platform="'+rate.platform+'" data-guaranteecost="'+(rate.guaranteeCost!=null?rate.guaranteeCost:"")+'"'+
		'data-settlement="'+rate.settlement+'" data-roomno="'+room.roomNo+'" data-index="'+index+'" data-bruletype="'+bruleType+'" data-invoice="'+rate.productGroup+'" data-currentalloment="'+rate.currentalloment+'"'+
		'data-planId="'+rate.planId+'" data-paymenttype="'+rate.paymentType+'" data-rule="'+bruleText+'" data-customertype="'+(rate.customerType!=null?rate.customerType:"")+'" data-isguarantee="'+rate.isGuarantee+'"'+
		'data-roomtypeid="'+rate.roomTypeId+'" data-total="'+rate.totalRate+'" data-covercharge="'+rate.coverCharge+'" data-planname="'+rate.planName+'"'+
		'data-minamount="'+(rate.minAmount!=null?rate.minAmount:1)+'" data-mindays="'+(rate.daysMin!=null?rate.daysMin:1)+'" data-maxdays="'+(rate.daysMax!=null?rate.daysMax:10)+'"'+
		'data-averagedaily="'+rate.averageRate.toFixed(2)+'" data-bookingruleids="'+(rate.bookingRuleIds!=null?rate.bookingRuleIds:"")+'" data-guaranteeruleids="'+(rate.guaranteeRuleIds!=null?rate.guaranteeRuleIds:"")+'" '+
		'data-prepayruleids="'+(rate.prepayRuleIds!=null?rate.prepayRuleIds:"")+'" data-valueaddids="'+(rate.valueAddIds!=null?rate.valueAddIds:"")+'" data-refunddesc="'+(rate.refundDesc!=null?rate.refundDesc:"")+'" '+
		'data-breakfast="'+rate.breakfast+'" data-refundtype="'+(rate.refundType!=null?rate.refundType:"")+'" data-refundtime="'+(rate.refundTime!=null?rate.refundTime:"")+'" data-instantconfirmation="'+rate.instantConfirmation+'"'+
		'data-checkIn="'+checkIn+'" data-checkOut="'+checkOut+'"'+
		'class="btn btn-default-new btn-big  now-book">预订</button>';
    }else{
      	htmlButton='<span class="btn btn-AAAAAA btn-big exceed-flag-padding" >房满</span>';
    };
    htmlRs= '<div class="e-r-con-wraper"><div class="e-con-w  '+(!(rate.averageRate>0 && rate.status)?"sold_out":"")+' h-53 background-fff"> <input type="hidden" class="e-r-con-wraper-price" value="'+rate.averageRate.toFixed(0)+'" /> '+htmlaverage+
			'<div class="float-left  w-d margin-left-79"><div class="hoverTips hover_content">' + rate.planName + '</div></div>' +
			'<div class="float-left w-150">' + rate.breakfast + '</div>' +
			'<div class="float-left w-200 cancel-rules"><span class="cancel-title sold_out-color sold_out-border">' + (rate.refundType=="NeedSomeDay" ? "限时取消" : (rate.refundType=="AnyChange" ? "免费取消" : "不可取消")) + '</span>' +
			'<div class="cancel-desc ">' + rate.refundDesc + '</div></div>'+
			'<div class="float-left w-180"><span class="exceed-flag exceed-flag-padding exceed-flag-6BA8F3">' + (rate.settlement=="Enterprise" ? "公司付" : (rate.paymentType=="Prepay" ? "预付" : "到店付"))+'</span></div>' +
			'<div class="float-left  w-84 color-purple suspension-frame-box" data-ratetag="'+room.roomNo+rate.planId+index+'"><span class="font-size-14 font-600 color-d10773 border-dashed-D44A9F sold_out-color sold_out-border">￥' + rate.averageRate.toFixed(0)+'</span><div class="suspension-frame hide"></div></div>' +
			
			'<div class="float-right margin-right-49  position">'+htmlButton+
			'<span class="border-radius position-ab room-count '+((rate.currentalloment>0 && rate.currentalloment<5)?'':'hide')+'">余'+rate.currentalloment+'</span></div>' +
			'<div class="float-right t-con-s-flag-w ">' +
			'<span class="exceed-flag exceed-flag-padding exceed-standard animated rotateIn hide margin-right-9">超标</span>' +
			'</div>' +
			'<div class="float-right  cancel-rules ">'+
			(rate.tags=="P"?'<span class="color-fff btn-default-new margin-right-9 exceed-flag-padding">协议</span> ':'')+
			(rate.tags=="D"?'<span class="color-fff btn-default-new  margin-right-9 exceed-flag-padding">直销</span> ':'')+
			'<span class=" guarantee-rule margin-right-9 background-5D95E4 color-fff exceed-flag-padding ' + (rate.isGuarantee?"":"hide")+'">担保</span>' +
			'<div class="cancel-desc guarantee-desc"></div>' +
			'</div>' +
			
		'</div></div><div class="room-img-detail clear hide"><img src="" alt="" class="float-left r-i-d-e"></div>';
    return htmlRs;
}

$(function(){
	countNight();
	loadRoom();
	loadImages();
    // action-点击-房型列表-head
	$('body').on('click', '.e-room-t-head', function () {
		var $this = $(this);
		var $eRoomT = $this.closest('.e-room-t');
		var $eRoomTB = $eRoomT.find('.e-room-t-b');
		$eRoomTB.stop().slideToggle('fast');
	});
	
	/***担保**/
	$('body').on('mouseover mouseout', '.guarantee-rule', function () {
		if(event.type == "mouseover"){
			$(this).children(".guarantee-desc").show();
		    $(".guarantee-desc").html('担保：房型太抢手了，酒店需要您提供信用卡或支付宝担保预订。<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 我们会预先冻结或扣除相应担保金，实际入住后，担保金会在您离店后3-5个工作日内解冻或退款。退还金额境内卡5个工作日内到账，境外卡20个工作日内到账。');
		}else if(event.type == "mouseout"){
			$(this).children(".guarantee-desc").hide();
		}
	});
	
	// 每日价格-鼠标经过取消规则
	$('body').on('mouseenter', '.suspension-frame-box', function (e) {
		e.stopPropagation();
		$(".suspension-frame").stop().fadeOut("fast");
		$(this).find(".suspension-frame").stop().fadeIn("fast");
	    var ratetag=$(this).attr("data-ratetag");
	    var suspend='<div class="suspension-data clear">';
		$("."+ratetag).each(function(){
			var price=$(this).val();
			var date = $(this).attr('data-date');
			var cost = $(this).attr('id');
            var week=getWeek(date);
			var rateCode = $(this).attr('data-code');
			suspend+='<dl class="float-left suspension-dl"><dd class="suspension-dd"><span>'+formDate(date, 0, "MM-dd")+'</span><span>'+week+'</span></dd>'+
			'<dt class="suspension-dt"><div class="suspension-price"><span>￥</span><span class="price">'+price+'</span></div><!--<div class="suspension-early">无早</div>--></dt></dl>';
		});
		suspend+='</div>';
        $(this).find(".suspension-frame").html(suspend);

        var suspLig=$(this).find('.suspension-dl').length;
        var suspWid=$(this).find('.suspension-dl').outerWidth(true);
        $(this).find(".suspension-frame").width(suspLig*suspWid);
        $(this).find(".suspension-data").width(suspLig*suspWid);
	});




	// 每日价格-离开-鼠标离开取消规则
	$('body').on('mouseleave', '.suspension-frame-box', function (e) {
		e.stopPropagation();
		$(".suspension-frame").stop().fadeOut("fast");

	});

	//查询房型
	$('body').on('click', '#query-room', function () {
		countNight();
		loadRoom();
	});

// action-点击-酒店图片tab切换
	$('body').on('click', '.e-tab', function () {
		var activeStr = 'active';
		var $this = $(this);
		if ($this.hasClass(activeStr)) {
			return ;
		}
		$this.siblings().removeClass(activeStr);
		$this.addClass(activeStr);
		var $sMWraper = $('.slider-small-wraper');
		var tab = $this.attr('data-tab');
		var $aCon = $sMWraper.find('[data-con="' + tab + '"]');
		$aCon.addClass(activeStr).siblings().removeClass(activeStr);
		var src = $aCon.find('.' + activeStr + ' img').attr('src');
		// $('.slider-big').find('img').attr('src', src);
		$('.slider-big').css('background-image', 'url(' + src + ')');
	});

	// action-点击-酒店小图片
	$('body').on('click', '.e-img', function () {
		
		var $this = $(this);
		var activeStr = 'active';
		if ($this.hasClass('activeStr')) return ;
		$this.addClass(activeStr).siblings().removeClass(activeStr);
		var src = $this.find('img').attr('src');
		src=src.replace('Mobile640_960','Hotel795_325');
		// $('.slider-big').find('img').attr('src', src);
		$('.slider-big').css('background-image', 'url(' + src + ')');
	});

// action-点击-左右箭头
	$('body').on('click','.slider-arrow',function() {
		var $this = $(this);
		var isLeftArrow = $this.hasClass('left-arrow');
		var isRightArrow = $this.hasClass('right-arrow');
		var MOVEDISTANCE = 870;
		var IMGOCCUO = 174;
		var $eSlideCon = $this.closest('.slider-small').find('.e-slider-con.active');
		var currLeft = parseInt($eSlideCon.css('left')) || 0;
		// 左侧按钮防止左侧溢出
		if (isLeftArrow && currLeft == 0) return ;
		// 右侧按钮防止右侧溢出
		if (isRightArrow && $eSlideCon.attr('data-ishavenext') == 'false') return ;
		var affterLeft = isLeftArrow ? (currLeft + MOVEDISTANCE) : (currLeft - MOVEDISTANCE);
		$eSlideCon.css('left', affterLeft);
		var currActiveIndex = Math.abs(Math.floor(affterLeft/IMGOCCUO));
		var $currActive = $eSlideCon.find('.e-img').eq(currActiveIndex);
		$currActive.addClass('active').trigger('click').siblings().removeClass('active');
		var isHaveNext = ($currActive.nextAll().length > 7);
		$eSlideCon.attr('data-ishavenext', isHaveNext);

	});
	// action-经过-鼠标经过取消规则
	$('body').on('mouseenter', '.cancel-title', function () {
		$(this).next().stop().fadeIn();
	});
	// action-离开-鼠标离开取消规则
	$('body').on('mouseleave', '.cancel-title', function () {
		$(this).next().stop().fadeOut();
	});

	// 简介展开收起
	$("body").on("click",".slide_shut",function(){
		var this_ = $(this),
			this_p = this_.parents(".introduction-wraper");
		$('.introduction-wraper-show').not(this_p).removeClass("introduction-wraper-show");
		this_p.toggleClass("introduction-wraper-show");
	});
});


//右侧的地图
$(function(){
	//	lat,lon,data,price
	var lat = $('#map-container').attr('data-latitude');
	var lon = $('#map-container').attr('data-longtitude');
	var data = $('#map-container').attr('data');
	var lsd = 'map-container';
	introduceMap(lsd,lat,lon,data);
	function introduceMap(id,lat,lon,data){
		var map = new BMap.Map(id);          // 创建地图实例
		map.addControl(new BMap.NavigationControl());
		map.addControl(new BMap.ScaleControl());
		map.addControl(new BMap.OverviewMapControl());
		map.enableScrollWheelZoom(); //滚轮放大
		var $mapContainer = $(id);
		var point = new BMap.Point(lon,lat);        // 创建点坐标
		map.centerAndZoom(point, 15);
		var markerOpts = {
			icon: new BMap.Icon('../../resources/images/common/baidu-location.png', new BMap.Size(32, 32), {})
		};
		var marker = new BMap.Marker(point, markerOpts);
		map.addOverlay(marker);
		
		marker.setAnimation(BMAP_ANIMATION_BOUNCE);//跳动动画
	}
	
})
/*差旅政策的匹配*/
// 获取酒店差旅政策
/*
 *	para: (type:object)
 *		global: 全局对象
 *		sendData = { // 请求参数
 *			empidLenvel : 员工id-员工职级，多个逗号分隔 （12,1212,）
 *			geolevel : 	当前城市级别,
 *			price : 酒店当前价格,
 *			coerceApprove : 是否强制审批 1是 0否
 *		}
 *
 *
 * */

var hotel_query_detail = {
	hotelPolicy: new HotelPolicy(),
	violateCallback:function(){},
	policyCallback : function (violate) {
		//isViolate　1违背　　0不违背
		//controller　0 不允许预订，1 审批， 2 只做提醒, -1无需审批（未开启差旅政策）
		/* violate={
		 	controller:"1",
		 	exceedPrice:0,
		 	ids:"7888-",
		 	isViolate:0,
		 	policy:["7888-1-500-0.0"],
		 	price:500
		 };*/
		//页面上的价格
		if(violate.isShut==0){//未开启差旅政策
			$('body').on('click', '.now-book', function () {
				var _this = $(this);
				hotel_query_detail.submitFn(_this);
			});
			return ;
		}else if(violate.isShut==1){//开启差旅政策
			// 判断价格是否超标
				$(".room-type-list .hidden-price").each(function(){
					if(Number($(this).attr("value"))>violate.price){//超标
						$(this).parents(".e-room-t-head").find(".exceed-standard").removeClass("hide");
						$(this).parents(".e-room-t").find(".e-r-con-wraper-price").attr("data-exceed-standard",false);
						$(this).parents(".e-room-t").find(".e-room-t-b ").find('.exceed-standard').removeClass("hide");
					}else {//未超标
						$(this).parents(".e-room-t").find(".e-room-t-b ").find(".e-r-con-wraper-price").each(function(){
							if(Number($(this).attr("value"))>violate.price){//超标
								$(this).parents(".e-con-w").find(".e-r-con-wraper-price").attr("data-exceed-standard",false);
								$(this).parents(".e-con-w").find('.exceed-standard').removeClass("hide");
							}else {//未超标
								$(this).parents(".e-con-w").find(".e-r-con-wraper-price").attr("data-exceed-standard",true);
							};
						});
					};
				});
				if(violate.controller==0){//不允许预定
					//预订按钮
					$('body').on('click', '.now-book', function () {
						var _this = $(this);
						var a = $(this).parents(".e-con-w").find(".e-r-con-wraper-price").attr("data-exceed-standard");
						if(a=="false"){
							layer.alert("您超出了该城市不得高于"+violate.price+"元的差旅政策，不允许预订！")
						}else{
							hotel_query_detail.submitFn(_this);
						};
					});
				}else if(violate.controller==1){
					$('body').on('click', '.now-book', function () {
						var _this = $(this);
						var a=_this.parents(".e-con-w").find(".e-r-con-wraper-price").attr("data-exceed-standard");
						if(a=="true"){
							hotel_query_detail.submitFn(_this);
						}else{
							layer.confirm("您超出了该城市不得高于"+violate.price+"元的差旅政策，是否继续预订",function (index) {
								hotel_query_detail.submitFn(_this);
							});
							
						};
					});
				}else if(violate.controller==2){
					$('body').on('click', '.now-book', function () {
						var _this = $(this);
						var a=$(this).parents(".e-con-w ").find(".e-r-con-wraper-price").attr("data-exceed-standard");
						if(a=="true"){
							hotel_query_detail.submitFn(_this);
						}else{
							layer.confirm("该城市不得高于"+violate.price+"元，是否继续预订",function (index) {
								hotel_query_detail.submitFn(_this);
							});
							
						};
					});
				};
		};
	},
	ajax_detail:function(){
		//	获取当前登录人的id
		var sendData={
			empidLenvel:$(".loginid").attr("value")+"-"+$(".loginZhiji").val(),
			geolevel:$("#city_level_i").val(),
			price:'',
			coerceApprove:''
		};
		this.hotelPolicy.getPolicy(hotel_query_detail,sendData);
	},
	submitFn:function(_this){
		if(_this.val()!=null && _this.val().length>0){
			$("#placeholder").html("");
			var hotelNo=_this.val();
			var attrbutes=_this.attr("data-*");
			var roomNo=_this.attr("data-roomno");
			var index=_this.attr("data-index");
			var planId=_this.attr("data-planid");
			var checkIn=_this.attr("data-checkIn");
			var checkOut=_this.attr("data-checkOut");
			var planCode=_this.attr("data-plancode");
			var customerType=_this.attr("data-customertype");
			var invoice=_this.attr("data-invoice");
			var platform=_this.attr("data-platform");
			var bruleType=_this.attr("data-bruletype");
			var rule=_this.attr("data-rule");
			var guaranteeRuleIds=_this.attr("data-guaranteeruleids");
			var guaranteeCost=_this.attr("data-guaranteecost");
			var prepayRuleIds=_this.attr("data-prepayruleids");
			var valueAddIds=_this.attr("data-valueaddids");
			var averageDaily=_this.attr("data-averagedaily");
			var refundType=_this.attr("data-refundtype");
			var refundTime=_this.attr("data-refundtime");
			var refundDesc=_this.attr("data-refunddesc");
			var breakfast=_this.attr("data-breakfast");
			var roomTypeId=_this.attr("data-roomtypeid");
			var total=_this.attr("data-total");
			var coverCharge=_this.attr("data-covercharge");
			var platform=_this.attr("data-platform");
			var planName=_this.attr("data-planname");
			var paymentType=_this.attr("data-paymenttype");
			var settlement=_this.attr("data-settlement");
			var isGuarantee=_this.attr("data-isguarantee");
			var currentalloment=_this.attr("data-currentalloment");
			var instantConfirmation=_this.attr("data-instantconfirmation");
			var minAmount=_this.attr("data-minamount");
			var mindays=_this.attr("data-mindays");
			var maxdays=_this.attr("data-maxdays");
			var formItem="";
			$("."+roomNo+planId+index).each(function(){
				var price=$(this).val();
				var date = $(this).attr('data-date');
				var cost = $(this).attr('data-cost');
				var rateCode = $(this).attr('data-code');
				var i=$(this).index()-1;
				formItem+='<input type="hidden" name="rates['+i+'].rate" value="'+price+'">';
				formItem+='<input type="hidden" name="rates['+i+'].date" value="'+date+'">';
				formItem+='<input type="hidden" name="rates['+i+'].cost" value="'+cost+'">';
				formItem+='<input type="hidden" name="rates['+i+'].rateCode" value="'+rateCode+'">';
			});
			var hform='<input type="hidden" name="hotelNo" value="'+hotelNo+'">'+
				'<input type="hidden" name="roomNo" value="'+roomNo+'">'+
				'<input type="hidden" name="checkIn" value="'+checkIn+'">'+
				'<input type="hidden" name="checkOut" value="'+checkOut+'">'+
				'<input type="hidden" name="planCode" value="'+planCode+'">'+
				'<input type="hidden" name="refundType" value="'+refundType+'">'+
				'<input type="hidden" name="refundTime" value="'+refundTime+'">'+
				'<input type="hidden" name="paymentType" value="'+paymentType+'">'+
				'<input type="hidden" name="refundRule" value="'+refundDesc+'">'+
				'<input type="hidden" name="breakfast" value="'+breakfast+'">'+
				'<input type="hidden" name="currentalloment" value="'+currentalloment+'">'+
				'<input type="hidden" name="bruleType" value="'+bruleType+'">'+
				'<input type="hidden" name="bookRule" value="'+rule+'">'+
				'<input type="hidden" name="invoiceType" value="'+invoice+'">'+
				'<input type="hidden" name="prepayRuleIds" value="'+prepayRuleIds+'">'+
				'<input type="hidden" name="guaranteeCost" value="'+guaranteeCost+'">'+
				'<input type="hidden" name="isGuarantee" value="'+isGuarantee+'">'+
				'<input type="hidden" name="guaranteeRuleIds" value="'+guaranteeRuleIds+'">'+
				'<input type="hidden" name="valueAddIds" value="'+valueAddIds+'">'+
				'<input type="hidden" name="averageDaily" value="'+averageDaily+'">'+
				'<input type="hidden" name="customerType" value="'+customerType+'">'+
				'<input type="hidden" name="plandId" value="'+planId+'">'+
				'<input type="hidden" name="total" value="'+total+'">'+
				'<input type="hidden" name="coverCharge" value="'+coverCharge+'">'+
				'<input type="hidden" name="platform" value="'+platform+'">'+
				'<input type="hidden" name="planName" value="'+planName+'">'+
				'<input type="hidden" name="settlement" value="'+settlement+'">'+
				'<input type="hidden" name="instantConfirmation" value="'+instantConfirmation+'">'+
				'<input type="hidden" name="minAmount" value="'+minAmount+'">'+
				'<input type="hidden" name="minDays" value="'+mindays+'">'+
				'<input type="hidden" name="maxDays" value="'+maxdays+'">'+
				'<input type="hidden" name="roomTypeId" value="'+roomTypeId+'">';
			$("#placeholder").append(hform);
			$("#placeholder").append(formItem);
			$("#bookForm").attr("action","/hotel/book/select");
			$("#bookForm").submit();
		}
		var loadi=layer.msg('请稍等，正在为您预订！',{icon: 16,time:30000,shade:0.5});
	}
};



//单点登录导航判断
if($('.isoalogin_flag').val()!=""){
	$('[data-flag="air"]').remove();
	if($('.sub-nav .sub-nav-ul a').length>0){
		$('.sub-nav').show();
	}else{
		$('.sub-nav').hide();
	}
}





















