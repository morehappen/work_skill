typeof getCitys === "function" && getCitys('domair'); //兼容改签查询
var airTimeMonitor=null;
var ajax_airline_flag = true;
// 第三方接口
(function() {

	var interface = new OuterInterface(), // 实例化第三方接口
		outerData = interface.getOuterInterface(), // 读取第三方接口数据
		isEmpty = function (data) {
			return !(data === "" || data === null || data === undefined);
		},
		route = (outerData && isEmpty(outerData.route)) ? outerData.route :(outerData && isEmpty(outerData.routes)) ?outerData.routes:null;
		
	if(!outerData){ // 非第三方数据
		$(".airline-tab-select").show();
		$(".tab-city").css("visibility", 'visible'); // 城市切换显示
		$(".sevenDateContent").show();
		return;
	}else{
		if(outerData.routetype=="rt"){
			$(".airline-tab-select").show();
			$(".tab-city").css("visibility", 'visible'); // 城市切换显示
			$(".sevenDateContent").show();
		}
	}
	
	/********* 第三方有数据，开始处理 *********/

	// 根据权限清空指定内容
	interface.clearPower(outerData.product);
	var isOnly = route.isCanModify;
	if(isOnly == 0){
		interface.disableInput();
		$(".sevenDateContent").remove();
	}else{
		$(".sevenDateContent").show();
		// $(".tab-city").css("visibility", 'initial'); // 城市切换显示
	}
})();





/**********计算列表容器高度 start***************/
/*(function(){
	autoHeight();
})();
$(window).resize(function(){
	autoHeight();
});*/
function autoHeight(){
	var wheight=$(window).height(),
	offsetC=$(".air-list-content").offset(),
	top=offsetC.top;
	$(".air-list-content").css("height",wheight-top+"px");
	/*$(".air-list").css("height",wheight-top+"px");*/
}
//机票数据请求初始化
//更改日期重新查询

//请求参数初始化,并调用查询
(function(){
	if($(".backLine").val()!=="1"){
		var data=null,
			getAirData=new airListMain();
		//正常单程，填写订单跳回单程
		if($(".change-query-list").val() !== "1"){
			data=$(".bookReturnPara").val()=="" ? JSON.parse($(".ajaxCanshu").val()) : JSON.parse($(".bookReturnPara").attr("data-value"));
		}else{//改签查询
			data = {
				from: $(".from-city-code").val(),
				fromName: $(".fromCity").val(),
				arrive: $(".to-city-code").val(),
				arriveName: $(".toCity").val(),
				startdate: $("#beginDate").val(),
				backdate:"",
				type:"ow"
			}
		}

		fullQuery(data);
		getAirData.ajaxAirList(getAirData,{
			from:data.from,
			fromName:data.fromName,
	    	arrive:data.arrive,
	    	arriveName:data.arriveName,
	    	startdate:data.startdate,
	    	backdate:data.backdate,
	    	voyage:data.type
		},1);
		function fullQuery(data){
			var line=data.type=="ow" ? "单程" : "往返";
			$(".fromCity").val(data.fromName);
			$(".toCity").val(data.arriveName);
			$(".from-city-code").val(data.from);
			$(".to-city-code").val(data.arrive);
			$("#line-choice").val(data.type).parents(".drop").find(".drop_title").html(line);
			$("#beginDate").val(data.startdate);
			$("#endDate").val(data.backdate);
			if(data.type=="ow"){
				$("#endDate").parents(".toTime-p").hide();
			}
			//七天日历初始化
			(function(){
				var dateIns = new DateSeventMain({
					nowDate:data.startdate, //要显示的当前日期，可以不是今天，任意输入你想显示的日期段
					maxDate:365
				});
				dateIns.inputVolidate();
			})();
		}
	}
})();
//手动查询
$("body").on("click",".air-query",function(){
	if(ajax_airline_flag){
		ajax_airline_flag = false;
		setTimeout(function(){queryHand();}, 300);
		return;
	}
	layer.msg("正在查询，请稍等……");
});
//七天日历查询
$("body").on("click","#date_train_tab li",function(){
	if($(this).is(".history")){
		return;
	}
	var this_=$(this),
		year=this_.parents("#date_train_tab").attr("data-year"),
		this_date=this_.text().split("(")[0];
	$("#beginDate").val(year+"-"+this_date);
	queryHand();
});
//超时后，重新查询
$("body").on("click",".repeat-query",function(){
	$(".Screen-full").hide();
	$(".timeoutpage").hide();
	typeof hideCityPluginModel === "function" && hideCityPluginModel();
	$("body div:last").hide();
	queryHand();
});
//返程查询
(function(){
	if($(".backLine").val()==="1"){
		var fromCity  =$(".fromCity").val();
		var toCity = $(".toCity").val();
		$(".qc-xinxi").show();
		$(".tab-city").hide();
		$(".fromCity").attr("disabled","disabled");
		$(".toCity").attr("disabled","disabled");
		$(".sevenDateContent").hide();
		$(".fromCity").val(toCity);
		$(".toCity").val(fromCity);
		var getAirData=new airListMain();
		
		getAirData.backLineAjax(getAirData);
		$(".fromCity").val(toCity);
		$(".toCity").val(fromCity);
	}
})();


//手动查询主函数
function queryHand(){
	var getAirData=new airListMain(),
		fromName=$(".fromCity").val(),
		arriveName=$(".toCity").val(),
		from=$(".from-city-code").val(),
		arrive=$(".to-city-code").val(),
		type=$("#line-choice").val(),
		startdate=$("#beginDate").val(),
		backdate=$("#endDate").val(),
		startdateArr = startdate.split("-"),
		backdateArr = backdate ? backdate.split("-") : "";
	//去除样式 checkbox样式
	$('input[name="stopnumber"]').prop("checked",false).parents('.label').removeClass('label-select-checkbox');
	$('input[name="sharecarrier"]').prop("checked",false).parents('.label').removeClass('label-select-checkbox');
	//起飞时间
	$('input[name="qifeiTime"]').each(function(){
		$(this).prop("checked",false).parents('.label').removeClass('label-select-checkbox');
	});
	$(".tab-city").show();
	$(".fromCity").removeAttr("disabled");
	$(".toCity").removeAttr("disabled");
	if(fromName==arriveName){
		layer.msg("出发地与目的地不能相同！");
		ajax_airline_flag = true;
		return;
	}
	if($(".toTime-p").is(":visible")){
		if((new Date(startdateArr[0],startdateArr[1],startdateArr[2])).getTime()>(new Date(backdateArr[0],backdateArr[1],backdateArr[2]))){
			ajax_airline_flag = true;
			layer.msg("去程日期不能大于返程日期！");
			return;
		}
	}
	
	getAirData.ajaxAirList(getAirData,{
		from:from,
		fromName:fromName,
		arrive:arrive,
		arriveName:arriveName,
		startdate:startdate,
		backdate:backdate,
		voyage:type
	},'1');
}
//判断公司的结算方式
$.ajax({
	url:'/crm/jiesuan',
	success:function(data){
		if(data.data!=null&&data.data!=""){
			if(data.data.fukuankemu==4){
				$(".xianfan").val("true");
				$(".filter-hb-xianfan").show();
			}
		}
	}
});
/*******************机票列表主函数 start*************************/
//需要传入的参数
function airListMain(){
	this.ajaxAirList=function(getAirData,canshuList,cabFlag){ //单程，往返
		$(".air-form-date").val(canshuList.startdate);
		var data_ = {
			from:canshuList.from,
			fromName:canshuList.fromName,
			arrive:canshuList.arrive,
			arriveName:canshuList.arriveName,
			startdate:canshuList.startdate,
			backdate:canshuList.backdate
		},
		queryUrl = "/air/getFlight";
		if($(".change-query-list").val() !== "1"){
			data_.voyage = canshuList.voyage;
			ajaxData = data_;
		}else{
			data_.airline = $(".carriecode").val();
			var query = JSON.stringify(data_);
			ajaxData = {query:query,companyid:$(".cid_").val()};
			queryUrl = "/ticketChange/gaiQuery";
		}
		$.ajax({
            type: "POST",
            url:queryUrl,
            data:ajaxData,
            beforeSend:function(){  //启动loading;
            	getAirData.loadingControl();
            },
            success: function(data) {
				ajax_airline_flag = true;
            	if(typeof data !="object"){
            		window.location.href=window.location.href;
            		return;
            	}
            	if($(".backLine").val()==="1"){
            		$(".backLine").val("");
            		$(".qc-xinxi").hide();
            	}
            	var data=data,airData=null;
            	if(data.status===200){ //数据请求成功
            		airData=JSON.parse(data.data);
            		if(airData.flights == null || airData.flights.length===0){
            			getAirData.loadingControl(); //隐藏loading;
            			/*$(".air-list").html("");*/
            			airListMain.prototype.airData=null;
            			$(".e-fliter-dongtai ul").html("");
            			zh.alerts({
            				title:"提示",
            				text:"您查询的城市对之间没有航班信息，试试预订火车票"
            			});
            			return;
            		}
            		clearTimeout(airTimeMonitor);
            		airTimeMonitor=setTimeout(function(){ //监听机票数据是否过期
            			$(".Screen-full").show();
            			$(".timeoutpage").show();
            		},600000);
            		if(cabFlag!="1"){
            			$(".filter-tj input:checked").each(function(){
                			$(this).prop("checked",false).parents("lable").removeClass("label-select-checkbox");
                		});
            		}
            		airListMain.prototype.airData=airData; //存储数据，便于筛选排序
            		airListMain.prototype.filterFlag=true;
            		$(".filter-ul").html("");
            		screenMain(1,getAirData);
            		//getAirData.airView(airData,getAirData);
            		//setTimeout(function(){
            			getAirData.loadingControl(); //隐藏loading;
            		//},500);
            	}else if(data.status===301){
            		getAirData.loadingControl(); //隐藏loading;
            		zh.alerts({
        				title:"提示",
        				text: data.msg
        			});
            	}else if(data.status===302){
            		zh.alerts({
        				title:"提示",
        				text: "登录失效，请重新登录!"
        			});
            	}else{
            		getAirData.loadingControl(); //隐藏loading;
            		zh.alerts({
        				title:"提示",
        				text: data.msg+"("+data.status+")!"
        			});
            	}
            },
            error:function(XMLHttpRequest){
				ajax_airline_flag = true;
            	getAirData.loadingControl(); //隐藏loading;
            	zh.alerts({
    				title:"提示",
    				text: "航班列表数据请求失败!"
    			});
            	console.log(XMLHttpRequest);
            }
        });
	};
	this.backLineAjax=function(getAirData){ //返程
		$.ajax({
            type: "POST",
            url:'/air/getBackFlight',
            beforeSend:function(){  //启动loading;
            	getAirData.loadingControl("back");
            },
            success: function(data) {
            	var data=data,airData=null;
            	if(data.status===200){ //数据请求成功
            		airData=JSON.parse(data.data);
            		if(airData.flights.length===0){
            			getAirData.loadingControl(); //隐藏loading;
            			/*$(".air-list").html("");*/
            			airListMain.prototype.airData=null;
            			$(".e-fliter-dongtai ul").html("");
            			zh.alerts({
            				title:"提示",
            				text:"您查询的城市对之间没有航班信息，试试预订火车票"
            			});
            			return;
            		}
            		clearTimeout(airTimeMonitor);
            		airTimeMonitor=setTimeout(function(){ //监听机票数据是否过期
            			$(".Screen-full").show();
            			$(".timeoutpage").show();
            		},600000);
            		airListMain.prototype.airData=airData; //存储数据，便于筛选排序
            		airListMain.prototype.filterFlag=true;
            		screenMain(1,getAirData);
            		//getAirData.airView(airData,getAirData);
            		//setTimeout(function(){
            			getAirData.loadingControl("back"); //隐藏loading;
            		//},500);
            	}else if(data.status===301){
            		getAirData.loadingControl("back"); //隐藏loading;
            		zh.alerts({
        				title:"提示",
        				text: data.msg
        			});
            	}else if(data.status===302){
            		zh.alerts({
        				title:"提示",
        				text: "登录失效，请重新登录!"
        			});
            	}else{
            		getAirData.loadingControl("back"); //隐藏loading;
            		zh.alerts({
        				title:"提示",
        				text: data.msg+"("+data.status+")!"
        			});
            	}
            },
            error:function(XMLHttpRequest){
            	getAirData.loadingControl("back"); //隐藏loading;
            	zh.alerts({
    				title:"提示",
    				text: "航班列表数据请求失败!"
    			});
            	console.log(XMLHttpRequest);
            }
        });
	};
	this.airView=function(airData,getAirData){
		var flights=airData.flights,
			listAll="";
		
		if(flights instanceof Array && flights.length>0){
			//请求差旅政策
			var airpolicy=new AirPolicy();
			airpolicy.ajaxAirPolicy({
				level:$(".loginZhiji").val(),
				distance:flights[0].flydistance
			});
			//循环解析列表
			$.each(flights,function(index,item){
				listAll+=getAirData.ListFragment(item,airpolicy);
			});
		}
		if (listAll == '') {
			$('.no-data-wraper').css('display', 'table');
			$(".air-list").hide();
		}else {
			$('.no-data-wraper').css('display', 'none');
			$(".air-list").html(listAll).show();
			//$(".air-list-content").mCustomScrollbar();
			//$('.no-data-wraper .no-data').addClass('rotateOut');
		}
		/*if(listAll==""){
			zh.alerts({
				title:"提示",
				text: "暂无符合的航班!"
			});
		*/	
	};
	this.ListFragment=function(item,airpolicy){
		var airline=item.airline, //航班号
			carriecode=item.carriecode, //航空公司代码
			carriername=item.carriername, //航空公司名称
			planestyle=item.planestyle, //机型
			depttime=item.depttime, //起飞时间
			arritime=item.arritime, //到达时间
			orgname=item.orgname, //起飞机场
			arriname=item.arriname, //到达机场
			arriterm=item.arriterm==="" ? "" : "("+item.arriterm+")", //到达航站楼T
			deptterm=item.deptterm==="" ? "" : "("+item.deptterm+")", //起飞航站楼T
			meal=item.mealcode, //是否有餐食，true有
			lowprice=item.low.price, //展示价格
			discount=item.low.discount, //折扣
			farebase=item.low.farebase, //舱位代码
			/*eCangWei="",*/ //每个舱位拼接
			sharecarrier=item.sharecarrier, //如果为空，非共享航班
			cangweiList=item.cangweis, //所有舱位
			stopnumber=item.stopnumber, //是否有经停站，1有，0没有
			everyList="",
			ischeap=item.ischeap,//是否廉航
			mileage=item.flydistance,//里程
			//匹配差旅政策
			volidateMation=airpolicy.airMatch(airpolicy.policy,{
				date:$(".air-form-date").val(),
				discount:discount,
				farebase:farebase,
				alldayLow:$(".air-list").attr("data-alldayprice"), //	全天最低价
				airlineLow:lowprice, //航班最低价，
				price:item.cangweis[0].price
			});

			everyList='<div class="clear air-list-title">';
			    if(ischeap!=null&&ischeap==1){
			    	everyList+='<div class="float-left  cheap">廉</div>';
			    }
			    everyList+=
					'<img style="margin-left: 20px" src="/static/img/airImg/airline/'+carriecode+'.png" alt="" class="float-left air-list-hbimg">'+
					    '<div class="air-list-comp float-left">'+
					      '<div class="clear hb-content">'+
					        '<div class="a-l-com float-left">'+carriername+'</div>'+
					        '<div class="shareHb color-6461e2 float-left cursor hoverTips hoverOther" data-hist="58px" data-gqTip="'+(sharecarrier!="" ? "您选择的是共享航班，实际承运是"+sharecarrier+"航班。预订此航班可能导致一定概率的乘机不顺、改签障碍、无法提前网上值机等情况发生，为了保证顺利出行，建议慎重选择。" : "")+'">'+(sharecarrier!="" ? "共享" : "")+'</div>'+
					      '</div>'+
					      '<div>'+
					        '<span class="a-l-hbNum" data-hbNum="'+airline+'">'+airline+'</span>'+
					        '<span>机型 '+planestyle+'</span>'+
					      '</div>'+
					    '</div>'+
					    '<div class="a-l-city float-left text-align-r">'+
					      '<div class="air-list-time">'+depttime+'</div>'+
					      '<div class="air-list-airport">'+orgname+deptterm+'</div>'+
					    '</div>'+

					    '<div class="a-l-point position float-left">';
			     if(mileage!=null&&mileage>=0){

			    	 everyList+='<div style="top: 10px; left: 20px;position:absolute">'+mileage+'KM</div>';
			     }
			     everyList+='<div class="position-ab a-l-jtz hover_control_jt color-6461e2 cursor '+(stopnumber!="1" ? "hide" : "")+'" data-shiji="'+(sharecarrier=="" ? airline : sharecarrier)+'">经停'+
					        '<div class="hover-content radius position-ab background-fff">'+
					          '<img src="/static/img/common/top_jt.png" class="position-ab top-jiantou" alt="up">'+
					          '<div class="jt_container"></div>'+
					        '</div>'+
					      '</div>'+
					    '</div>'+
					    '<div class="a-l-city float-left">'+
					      '<div class="air-list-time">'+arritime+'</div>'+
					      '<div class="air-list-airport">'+arriname+arriterm+'</div>'+
					    '</div>'+
					    '<div class="float-left a-l-canshi text-align">'+meal+'</div>'+
					    '<div class="air-list-weiFlag float-left">' +  (volidateMation=="-1" ? "" : (volidateMation.volidate===true ? "<span class='exceed-flag'>超标</span>" : "")) + '</div>'+
					    '<div class="air-list-price float-left">'+
					      '<span class="a-l-countFlag">￥</span>'+
					      '<span class="a-l-priceNum">'+item.cangweis[0].price+'</span>'+
					      '<span class="a-l-qi">起</span>'+
					    '</div>'+
						'<div class=" float-left font-size-20 " style="padding:5px 5px 0 ;font-weight: 100;">'+
				($('.xianfan').val()=="true"?'<span class="float-left font-size-20 "><span class="font-size-12">￥</span>'+(item.low.customprice?item.low.customprice:"0")+'</span>':"")+
						'</div>'+
					    '<div class="air-list-book-shut float-right">'+
					      '<button type="button" class="btn btn-default btn-book text-align-l btn-book-shut position">预订</button>'+
					    '</div>'+
					  '</div>'+
					  '<ul class="air-list-cw hide">';
		//	<span class="font-size-12 ">￥</span>'+item.low.customprice!=null&&item.low.customprice!=""?item.low.customprice:0+'

		if(cangweiList instanceof Array && cangweiList.length>0){ //判断舱位列表是否为数组，为解析
			$.each(cangweiList,function(index,item){
				var pfrom=item.pfrom==="W" ? "官网" : (item.pfrom==="B" ? "协议" :""), //是否官网价
					codeDes=item.codeDes, //舱位描述文字
					disdes=item.disdes, //折扣带中文
					discount=item.discount, //折扣
					code=item.code, //舱位代码
					farebase=item.farebase, //基础运价舱位，用于比较差旅政策
					refundrule=item.refundrule, //退票规则
					changerule=item.changerule, //改签规则
					signrule=item.signrule, //签转规则
					price=item.price, //价格
					seatNum=item.seatNum, //票量
					eCangWei="",
					luggage=item.isluggage,//行李额
					luggageDetail=item.luggageDetail==null?"":item.luggageDetail,//行李额描述
					//匹配差旅政策
					volidateMation=airpolicy.airMatch(airpolicy.policy,{
						date:$(".air-form-date").val(),
						discount:discount,
						farebase:farebase,
						alldayLow:$(".air-list").attr("data-alldayprice"), //	全天最低价
						airlineLow:lowprice, //航班最低价，
						price:price //当前航班价格
					});
					eCangWei='<li class="every-Cab clear" style="position:relative;height:65px;">'+
					           '<div class="float-left a-l-cgw">'+
					             '<div class="text-align '+(pfrom==="" ? "vhide" : (item.pfrom=="B" ? "xieyi" : ""))+'">'+pfrom+'</div>'+
					           '</div>'+
				               '<div class="float-left a-l-city text-align-r color-666 cabContent" data-cab="'+code+'" >'+code+"/"+codeDes+'</div>'+
				               '<div class="float-left color-666 a-l-zhekou">'+disdes+'</div>'+

				               '<div class="float-left" style="margin-right: 20px">'+
				                 '<span class="color-6461e2 cursor hover_control air-tgq position cursor">退改签'+
				                   '<div class="hover-content hotel-c-big radius position-ab background-fff">'+
				                     '<img src="/static/img/common/top_jt.png" class="position-ab top-jiantou" alt="up">'+
				                     '<div class="table-content">'+
				                       '<table>'+
				                         '<tbody>'+
				                           '<tr>'+
				                             '<td class="table-c-title">退票：</td>'+
				                             '<td class="tdc">'+refundrule+'</td>'+
				                           '</tr>'+
				                           '<tr>'+
				                             '<td class="table-c-title">改签：</td>'+
				                             '<td class="tdc">'+changerule+'</td>'+
				                           '</tr>'+
				                           '<tr>'+
				                             '<td class="table-c-title">签转：</td>'+
				                             '<td class="tdc">'+signrule+'</td>'+
				                           '</tr>'+
				                         '</tbody>'+
				                       '</table>'+
				                     '</div>'+
				                   '</div>'+
				                 '</span>'+
				               '</div>'+
                        '<div class="float-left" >'+
                        '<span class="color-6461e2 hover_control position  '+(luggageDetail?"cursor air-tgq":"")+' " style="display:inline-block;width:100px;">';
					  eCangWei+=luggage;
					  eCangWei+= '<div class=" hover-content hotel-c-big radius position-ab background-fff">'+
                        '<img src="/static/img/common/top_jt.png" class="position-ab top-jiantou" alt="up">'+
                        '<div class="table-content">'+
                       '<span>'+luggageDetail+'</span>'+
                        '</div>'+
                        '</div>'+
                         '</span>'+
                        '</div>'+
				               '<div class="float-left a-l-canshi"></div>'+
				               '<div class="float-left">'+
				                 '<div class="air-list-weiFlag a-l-cw-wei float-left">' + (volidateMation=="-1" ? "" : (volidateMation.volidate===true ? "<span class='exceed-flag'>超标</span>" : "")) + '</div>'+
				               '</div>'+
				               '<div class="air-list-ep float-left">'+
				                 '<span class="a-l-countFlag">￥</span>'+
				                 '<span class="a-l-priceNum" data-price="'+price+'">'+price+'</span>'+
				               '</div>'+
								'<div class="float-left" style="min-width:40px;height:42px;line-height: 42px;">' +
						($('.xianfan').val()=="true"?'<span class="font-size-12">￥</span>':"")+
						($('.xianfan').val()=="true"?'<span class="font-size-20">'+(item.customprice?item.customprice:"0")+'</span>':"")+
								'</div>'+
				               '<div class="float-left a-l-cw-btn">'+
				                 '<button type="button" data-mile="'+mileage+'" data-tipsNoApprove="' + volidateMation.tipsNoApprove + '" data-startmile="'+volidateMation.startmile+'" data-endmile="'+volidateMation.endmile+'" data-farebase="'+farebase+'" data-isUseHour="'+volidateMation.isUseHour+'" data-lowc="'+volidateMation.lowc+'" data-flightlimit="'+volidateMation.flightlimit+'" data-flightlowtype="'+volidateMation.flightlowtype+'" data-flighthour="'+volidateMation.flighthour+'" data-noPolicy="'+(volidateMation=="-1" ? "1" : "0")+'" data-book="'+volidateMation.book+'" data-tips="'+volidateMation.tips+'" data-volidate="'+volidateMation.volidate+'" class="btn btn-default btn-book air-booking position">'+
				                   '<span class="position-ab a-l-yuliang'+(seatNum==="A" ? " hide" : " show")+'">余'+seatNum+'</span>预订'+
				                 '</button>'+
				               '</div>'+
								'<div class="'+(seatNum==="A" ? " hide" : " show")+'" style="position:absolute;bottom:5px;left:248px;line-height:20px;background: #cacbfb;border-radius: 11px;width: 329px;text-align: center;font-size: 12px;">当前舱位剩余票量有限，可能出现价格变动，请谨慎选择</div>'+
				             '</li>';
				everyList+=eCangWei;
			});
			everyList="<li class='everyLine' data-airlineLowPrice='"+lowprice+"'>"+everyList+"</ul></li>";
			return everyList;
		}
	};
	this.loadingControl=function(back){ //查询loading
		if(back!="back"){
			$(".wait-c-from").text($(".fromCity").val());
			$(".wait-c-to").text($(".toCity").val());
			$(".wait-hb-date").text($("#beginDate").val());
		}else{
			$(".wait-c-from").text($(".toCity").val());
			$(".wait-c-to").text($(".fromCity").val());
			$(".wait-hb-date").text($("#endDate").val());
		}
		$("body").toggleClass("scroll-hide");
		$(".Screen-full").toggle();
    	$(".query-loading").toggle();
	};
}

/*******************机票列表主函数 end*************************/

$("body").on("click",".air-booking",function(){
	bookingMain($(this));
});
//跳转到提交改签
function changeHref(){
	var ele = $(".search_str"),
		orderno = ele.attr("data-orderno"),
		passid = ele.attr("data-passid"),
		routeid = ele.attr("data-routeid"),
		airline = ele.attr("data-airline"),
		code = ele.attr("data-code"),
		weibeiflag = ele.attr("data-weibeiflag"),
		wbreason = ele.attr("data-wbreason"),
		bookPrice = ele.attr("data-bookprice"),
		dayprice = ele.attr("data-dayprice"),
		lowprice = ele.attr("data-lowprice"),
		gqreason = ele.attr("data-gqreason");
	zh.iframes({
		width: "720px",
		height: "480px",
		url : "/ticketChange/book/gaiqian?orderno=" + orderno + "&passid=" + passid + "&routeid=" + routeid + "&airline=" + airline + "&code=" + code + "&weibeiflag=" + weibeiflag + "&wbreason=" + wbreason + "&bookPrice=" + bookPrice + "&dayprice=" + dayprice + "&lowprice=" + lowprice + "&gqreason=" + gqreason,
		title: "提交改签",
		newStyle: true
	});
}


//预订主函数
function bookingMain(this_){
	var this_=this_,
		parents=this_.parents(".everyLine"),
		parent=this_.parents(".every-Cab"),
		airline=parents.find(".a-l-hbNum").attr('data-hbnum'), //航班号
		cab=parent.find(".cabContent").attr("data-cab"), //舱位
		chooseprice=parent.find(".a-l-priceNum").attr("data-price"), //价格
		daylow=$(".air-list").attr("data-alldayprice"),//全天最低价
		flightlow=parents.attr("data-airlinelowprice"),//航班最低价
		flightlimit=this_.attr("data-flightlimit"), //是否开启了最低价限制
		flightlowtype=this_.attr("data-flightlowtype"), //限制类型
		flighthour=this_.attr("data-flighthour"), //前后n小时
		isUseHour=this_.attr("data-isUseHour"), //是否需要请求前后两小时接口
		farebase=this_.attr("data-farebase"), //基础运价舱
		startmile=this_.attr("data-startmile"), //起始公里数
		endmile=this_.attr("data-endmile"), //终止公里数
		lowc=this_.attr("data-lowc"), //最低价controller
		book=this_.attr("data-book"), //是否允许预订
		tips=this_.attr("data-tips"), //超标提示语
		tipsNoApprove = this_.attr("data-tipsNoApprove"), //违背不审批提示语
		volidate=this_.attr("data-volidate"), //是否超标前几条
		noPolicy=this_.attr("data-nopolicy"), //是否设置了差旅政策 1，未设置，0设置了
		href="/air/book/",// {airline}/{cab}/{chooseprice}/{daylow}/{flightlow}
		mile = this_.attr("data-mile")//里程
		changEle = $(".change-query-list").val(); //是否是申请改签1是
		$(".search_str").attr({"data-airline":airline,"data-code":cab,"data-weibeiflag":(volidate == "true" ? 1 : 0),"data-wbreason":tips,"data-bookprice":chooseprice,"data-dayprice":daylow,"data-lowprice":flightlow});

		/******超标差旅政策，继续预定*****/
		function hrefSuccess(){ 
			location.href=href+airline+"/"+cab+"/"+chooseprice+"/"+daylow+"/"+flightlow;
		}
		if(noPolicy=="1"){ //未设置差旅政策，直接跳转
			if(changEle !== "1"){ //是否改签查询 1为改签查询
				hrefSuccess();
				return;
			}
			changeHref();
			return;
		}
		if(book!="true"){ //不允许预订
			zh.alerts({
				title:"提示",
				text:"您选择的舱位超出了“"+tips+"”的差旅标准" + (tipsNoApprove != "" ? ("，" + tipsNoApprove) : "")
			});
			return;
		}
		if(isUseHour==="true"){ //是否需要调用前后两小时最低价限制
			$(".continue-book").attr({"data-lowc":lowc,"data-hour":flighthour,"data-url":href+airline+"/"+cab+"/"+chooseprice+"/"+daylow+"/"+flightlow});
			var flighthours=new FlighthourMain();
			flighthours.ajaxHour({
				bookairline:airline,
				hour:flighthour,
				price:chooseprice,
				this_:this_,
				miles:startmile+"-"+endmile+"公里",
				href:href+airline+"/"+cab+"/"+chooseprice+"/"+daylow+"/"+flightlow,
				tips: tips,
				tipsNoApprove: tipsNoApprove,
				lowc: lowc,
				volidate: volidate,
				mile:mile,
				hrefSuccess: (changEle !== "1") ? hrefSuccess : changeHref
			},flighthours);
			return;
		}
		if(volidate=="true"){ //超标继续预定
			var confirm=new Confirm({
				text:"您选择的舱位超出了“" + tips + "”的差旅标准" + (tipsNoApprove != "" ? ("，" + tipsNoApprove + "，是否继续预订？") : "，是否继续预订？"),
				arr:["继续预订","取消"],
				height:"136px",
				confirmCallback: (changEle !== "1") ? hrefSuccess : ($(".continue-book").attr({"data-weibeiflag":(volidate == "true" ? 1 : 0),"data-wbreason":tips}),changeHref)
				//cancelCallback:hrefFiled
			});
			return;
		}
		if(tipsNoApprove != ""){
			var confirm=new Confirm({
				text:"您选择的舱位" + tipsNoApprove + "，是否继续预订？",
				arr:["继续预订","取消"],
				height:"136px",
				confirmCallback: (changEle !== "1") ? hrefSuccess : ($(".continue-book").attr({"data-weibeiflag":(volidate == "true" ? 1 : 0),"data-wbreason":tips}),changeHref)
				//cancelCallback:hrefFiled
			});
			return;
		}
	(changEle !== "1") ? hrefSuccess() : ($(".continue-book").attr({"data-weibeiflag":(volidate == "true" ? 1 : 0),"data-wbreason":tips}),changeHref());
}


/******前后两小时主函数******/
function FlighthourMain(){
	if(FlighthourMain.prototype.ajaxHour!="function"){
		FlighthourMain.prototype.ajaxHour=function(canshu,flighthours){
			$.ajax({
	            type: "POST",
	            url:'/air/getHourFlight', 
	            data:{
	            	bookairline:canshu.bookairline,
					hour:canshu.hour,
					price:canshu.price,
					type:$(".backLine").val()!=="1" ? "0" : "1", //返回值为0，单程；1返程
					mile:canshu.mile		
	            },
	            success: function(data) {
	            	if(data.status===200){ //前后n小时数据请求成功
	            		flighthours.view(data,{
	            			price: canshu.price,
	            			href: canshu.href,
	            			hour: canshu.hour,
	            			this_: canshu.this_,
	            			miles: canshu.miles,
							tips: canshu.tips,
							tipsNoApprove: canshu.tipsNoApprove,
							lowc: canshu.lowc,
							volidate: canshu.volidate,
							hrefSuccess: canshu.hrefSuccess
	            		});
	            	}else if(data.status===302){
	            		zh.alerts({
	        				title:"提示",
	        				text:"登录失效，请重新登录"
	        			});
	            	}else{
	            		zh.alerts({
	        				title:"提示",
	        				text: data.msg+"("+data.status+")!"
	        			});
	            	}
	            },
	            error:function(XMLHttpRequest){
	            	zh.alerts({
	    				title:"提示",
	    				text: XMLHttpRequest
	    			});
	            	console.log(XMLHttpRequest);
	            }
	        });
		};
		FlighthourMain.prototype.view=function(data,viewPara){
			var data_json=JSON.parse(data.data),
				hoursData=data_json.flights,
				everyList="",
				saveMoney=0,
				lowprice=0,
				hour = viewPara.hour,
				tips = viewPara.tips, //违背提示语
				tipsNoApprove = viewPara.tipsNoApprove, //违背无需审批提示语
				tipAll = "", //显示用的提示信息
				contolType = viewPara.lowc, //管控类型
				href="/air/book/",
				changEle = $(".change-query-list").val(); //是否是申请改签1是

			if(hoursData.length===0){
					if(viewPara.volidate=="true"){ //超标继续预定
						var confirm=new Confirm({
							text:"您选择的舱位超出了“" + tips + "”的差旅标准" + (tipsNoApprove != "" ? ("，" + tipsNoApprove + "，是否继续预订？") : "，是否继续预订？"),
							arr:["继续预订","取消"],
							height:"136px",
							confirmCallback:($(".continue-book").attr({"data-weibeiflag":(viewPara.volidate == "true" ? 1 : 0),"data-wbreason":tips}),viewPara.hrefSuccess)
							//cancelCallback:hrefFiled
						});
						return;
					}
					if(changEle != "1"){
						location.href=viewPara.href;
					}else{
						$(".continue-book").attr({"data-weibeiflag":(viewPara.volidate == "true" ? 1 : 0),"data-wbreason":tips});
						viewPara.hrefSuccess();
					}
					return;
			}
			lowprice=hoursData[0].low.price;
			$.each(hoursData,function(index,item){
				var airline=item.airline, 
					carriecode=item.carriecode,
					carriername=item.carriername,
					depttime=item.depttime,
					arritime=item.arritime,
					farebase=item.farebase,
					orgname=item.orgname,
					cab=item.low.code,
					deptterm=item.deptterm==="" ? "" : "("+item.deptterm+")",
					arriname=item.arriname,
					arriterm=item.arriterm==="" ? "" : "("+item.arriterm+")",
					price=item.low.price,
					code = item.low.code,
					lowprice=item.low.price,
					daylow=$(".air-list").attr("data-alldayprice"),//全天最低价
					flightlow=viewPara.this_.parents(".everyLine").attr("data-airlinelowprice"),//航班最低价
					href_=href+airline+"/"+cab+"/"+price+"/"+daylow+"/"+flightlow+"?isLow=1";
				everyList+=	'<li class="e-hb-tuijian"><div class="font-size-12 tuijian-airline">'+
			   	'<img src="/static/img/airImg/airline/'+carriecode+'.png" alt="" class="float-left air-list-hbimg">'+carriername+' '+airline+'</div>'+
				'<div class="clear tuijian_airport font-size-12"><span class="float-left tuijian-time-z">'+depttime+'</span>'+
				'<span class="float-left">'+orgname+deptterm+'</span></div><div class="clear tuijian_airport font-size-12">'+
				'<span class="float-left tuijian-time-z">'+arritime+'</span><span class="float-left">'+arriname+arriterm+'</span></div>'+
				'<div class="t-p-group"><span class="float-left tuijian-price-z"><span class="font-size-12">￥</span>'+
				'<span class="font-size-20 t-count">'+price+'</span></span>'+
				'<a href="'+(changEle != "1" ? href_ : 'javascript:void(0)')+'" data-airline="' + airline + '" data-code="' + code + '" data-price="' + price + '" class="btn btn-default tuijian-book float-right font-size-12 text-align ' + (changEle != "1" ? '' : 'change-before-submit') + '">预订</a></div></li>';
			});
			if(contolType == 2){
				tipsNoApprove = tipsNoApprove == "" ? "还有最低价可选择" : (tipsNoApprove + "、还有最低价可选择");
			}else{
				tips = tips == "" ? ("前后" + hour + "小时最低价") : (tips + "、前后" + hour + "小时最低价");
			}
			tipAll = tips == "" ? "" : ("超出了“" + tips + "”的差旅标准");
			tipAll = tipAll == "" ? tipsNoApprove : (tipsNoApprove == "" ? tipAll : (tipAll + ",<br />" + tipsNoApprove));
			saveMoney=viewPara.price-lowprice;
			$(".continue-book").attr("data-weibeiflag",(viewPara.volidate == "true" ? 1 : 0)).attr("data-wbreason",tips);
			$(".tuijian-list-ul").html(everyList);
			$(".tj_t-price").html("￥ "+saveMoney);
			$(".volidate_text").html("您选择的舱位" + tipAll + "，我们推荐以下航班");
			$(".Screen-full").show();
			$(".tuijiao-line").show();
			$("body").toggleClass("scroll-hide");
		};
	}
}
//绑定继续预定事件
$("body").on("click",".continue-book",function(){
	var this_=$(this);
	if(this_.attr("data-lowc")==="0"){
		zh.alerts({
			title:"提示",
			text: "您超出了前后"+this_.attr("data-hour")+"小时最低价，不允许预订！"
		});
		return;
	}
	if($(".change-query-list").val() != "1"){
		location.href=this_.attr("data-url");
	}else{
		changeHref();
	}

});
//改签查询单击前后两小时最低价
$("body").on("click",".change-before-submit",function(){
	var $this = $(this);
	$(".search_str").attr("data-bookprice",$this.attr("data-price")).attr("data-code",$this.attr("data-code")).attr("data-airline",$this.attr("data-airline"));
	changeHref();
});

//关闭前后两小时页面

$("body").on("click",".close-tuijian",function(){
	$(".Screen-full").hide();
	$(".tuijiao-line").hide();
	$("body").removeClass("scroll-hide");
});










/********************排序主函数 start**********************/
//
function airSort(){
	this.sortMain=function(dataObj){
		if(dataObj.airData==null || dataObj.airData.length==0){
			return;
		}
		var data=$.extend({}, dataObj.airData);
		data.flights.sort(dataObj.sorts.compare(dataObj.name,dataObj.flag,dataObj.this_));
		var getAirData=new airListMain();
		getAirData.airView(data,getAirData);
	};
	this.compare=function(name,flag,this_){
		return function(a,b){
			var value1,value2,nameArr=name.split("/");
				if(nameArr.length===1){
					value1=a[nameArr[0]];			
					value2=b[nameArr[0]];
				}else{
					value1=a[nameArr[0]][0][nameArr[1]];			
					value2=b[nameArr[0]][0][nameArr[1]];
				}
			if(flag==="0"){
				this_.attr("data-flag","1").addClass("stg-s-up");
				return resault();
			}else{
				this_.attr("data-flag","0").addClass("stg-s-down");
				return -resault();
			}
			function resault(){
				if(value1<value2){
					return -1;
				}else if(value1>value2){
					return 1;
				}else{
					return 0;
				}
			}
		};
	};
}

//按起飞时间排序
$("body").on("click",".stg-sort-time",function(){
	var sorts=new airSort(),
		this_=$(this);
		SortCondition(this_);
		sorts.sortMain({
			sorts:sorts,
			airData:airSort.prototype.data,
			name:"depttime",
			flag:this_.attr("data-flag"),
			this_:$(this)
		});
});
//航班价格排序
$("body").on("click",".stg-sort-price",function(){
	var sorts=new airSort(),
		this_=$(this);
		SortCondition(this_);
		sorts.sortMain({
			sorts:sorts,
			airData:airSort.prototype.data,
			name:"cangweis/price",
			flag:this_.attr("data-flag"),
			this_:$(this)
		});
});
//排序样式，控制条件重置默认值
function SortCondition(this_){
	$(".stg-s-down").removeClass("stg-s-down");
	$(".stg-s-up").removeClass("stg-s-up");
	$(".stg-sort").each(function(){
		if(!(this_.is($(this)))){
			$(this).attr("data-flag","0");
		}
	});
}
/********************排序主函数 end**********************/

/********************筛选主函数 start**********************/

//筛选主函数

//去重函数
function RemoveRepeat(){ //参数：需要去重的数据，存放数组
	this.rpMethod=function(removeDate,arr){
		if(arr instanceof Array){
			var len=arr.length;
			
			for(var i=0;i<len;i++){
				if(removeDate.rdata1==arr[i].rdata1){
					break;
				}else if(i==(len-1)){
					arr.push(removeDate);
				}
			}
		}else{
			arr=[removeDate];
		}
		return arr;
	};
}
//渲染筛选条件主函数
function FilterView(){
	this.view=function(arr,element){
		var list="";
		if(arr.length<2){
			$("."+element).parents(".e-filter").hide();
			return;
		}
		$.each(arr,function(index,item){
			list+='<li><div class="label label-checkbox label-margin-right clear">'+
				'<span class="show_choice"></span>'+
				'<span>'+item.rdata2+'</span><input type="checkbox" name="'+element+'" value="'+item.rdata1+'"></div></li>';
		});
		$("."+element).html(list).parents(".e-filter").show();
		if(arr.length<5){
			$("."+element).parents(".scroll_filter").css("height",($("."+element).find("li").height())*arr.length+"px");
		}else{
			$("."+element).parents(".scroll_filter").css("height","200px");
		}
	};
}
//渲染筛选航空公司主函数
function FilterViiew(){
    this.view=function(arr,element){
        var list="";
        if(arr.length<2){
            $("."+element).parents(".e-filter").hide();
            return;
        }
        $.each(arr,function(index,item){
            list+='<li><div class="label label-checkbox label-margin-right clear">'+
                '<img src="/static/img/airImg/airline/'+item.rdata1+'.png" alt="" class="air-icon ">' +
                '<span class="show_choice"></span>'+
                '<span>'+item.rdata2+'</span><input type="checkbox" name="'+element+'" value="'+item.rdata1+'"></div></li>';
        });
        $("."+element).html(list).parents(".e-filter").show();
        if(arr.length<5){
            $("."+element).parents(".scroll_filter").css("height",($("."+element).find("li").height())*arr.length+"px");
        }else{
            $("."+element).parents(".scroll_filter").css("height","200px");
        }
    };
}


/********************筛选主函数 end**********************/








//单程往返切换
$("body").on("click",".drop_option li",function(){
	var this_=$(this),
		select=this_.parents(".drop").find("select");
	if(select.is("#line-choice")){
		if(select.val()=="ow"){
			$("#endDate").parents(".toTime-p").hide();
		}else{
			$("#endDate").parents(".toTime-p").show();
		}
	}
});


/**********计算列表容器高度 start***************/
/***********悬浮显示隐藏 start ****************/

/*$("body").on("mouseover mouseout",".hover_control_jt",function(e){
	var this_=$(this);
	if(e.type=="mouseover"){
		this_.find(".hover-content").show();
		jingting({airline:this_.attr("data-shiji"),date:$(".air-form-date").val()});
	}else if(e.type=="mouseout"){
		this_.find(".hover-content").hide();
	}
});*/

$("body").on("click",".hover_control_jt",function(e){
	e.stopPropagation();
	var this_=$(this);
	$(".hover-content").not(this_.find(".hover-content")).hide();
	if(this_.find(".hover-content").is(":visible")){
		this_.find(".hover-content").hide();
	}else{
		this_.find(".hover-content").show();
		jingting({airline:this_.attr("data-shiji"),date:$(".air-form-date").val()});
	}
});
$("body").on("click",".hover_control_jt .hover-content",function(e){
	e.stopPropagation();
	$(this).show();
});
$("body").on("click",function(){
	$(".hover-content").hide();
});


//点击显示退改签

$("body").on("click",".air-tgq",function(e){
	e.stopPropagation();
	var this_ = $(this),
		hoverC = this_.find(".hover-content");
	$(".hover-content").not(this_.find(".hover-content")).hide();
	hoverC.is(":visible") ? hoverC.hide() : hoverC.show();
});





function jingting(data){
	$.ajax({
        type: "POST",
        url:'/air/getAirStop',
        data:{
        	airline:data.airline,
        	date:data.date
        },
        success: function(data) {
        	if(data.status===200){ //数据请求成功
        		var data_=JSON.parse(data.data);
        		fullData(data_);
        	}else{
        		zh.alerts({
    				title:"提示",
    				text: "请求经停站异常("+data.status+")!"
    			});
        	}
        },
        error:function(XMLHttpRequest){
        	zh.alerts({
				title:"提示",
				text: XMLHttpRequest
			});
        	console.log(XMLHttpRequest);
        }
    });
	function fullData(dataArr){
//		console.log(dataArr);
		var list="";
		/*$.each(dataArr,function(index,item){
			var orgcode=item.orgcode,
				depttime=item.depttime.split(" ")[1],
				arritime=item.arritime.split(" ")[1];
			list+='<div class="jt_xinxi jt_xinxi_t">经停机场：'+item.orgcode+'</div>'+
				  '<div class="jt_xinxi jt_bottom_12">经停时间：'+depttime+'-'+arritime+'</div>';
			
		});*/
		list+='<div class="jt_xinxi jt_xinxi_t jt_bottom_12">经停机场：'+dataArr.airstop+'</div>'+
		  '<div class="jt_xinxi jt_bottom_12">到达时间：'+dataArr.arrivetime+'</div>'+
		  '<div class="jt_xinxi jt_bottom_12">起飞时间：'+dataArr.flighttime+'</div>';;
		$(".jt_container").html(list);
	}
}

/***********悬浮显示隐藏 end ****************/


/**********左侧筛选条件 start**********/

/********筛选主函数 Start**********/
function screenMain(flag,getAirData){
	var airReturnData=$.extend(true, {}, (new airListMain()).airData),
		airdatas=airReturnData.flights,
		isFromTime=true, //出发时间
		isCangWeiType=true, //舱位类型
		isFromStation=true, //出发站
		isArriveStation=true, //到达站
	 	isAirLine=true, //按航空公司筛选
	 	isStyle=true, //按计划机型
		allDayLowPrice=-1, //全天最低价
		isStopnumber=true, //直飞
		isSharecarrier=true, //隐藏共享
		airlineCompany=null,
		startLand=null,
		arriveLand=null,
		planeStyle=null,
		canshu=$(".ajaxCanshu").val()=="" ? {airline:"",cab:""} : JSON.parse($(".ajaxCanshu").val()),
		removeRepeatMain=new RemoveRepeat();
	if(flag=="1"){
		$('body').append("<input type='checkbox' name='airlineFilter' value='"+canshu.airline+"' "+(canshu.airline!="" ? "checked" : "")+" class='hide'>");
		$('[name="cangwei"][value="'+canshu.cab+'"]').prop("checked",true).parents(".label").addClass("label-select-checkbox");
	}
	if(airdatas==null || airdatas.length==0){
		$(".filter-tj input:checked").prop("checked",false).parents(".label").removeClass("label-select-checkbox");
		zh.alerts({
			title:"提示",
			text: "暂无符合的航班!"
		});
		return;
	}
	for(var i=0;i<airdatas.length;i++){
		if(flag!="1" || canshu.airline!="" || canshu.cab!=""){
			isFromTime=fromTime(airdatas[i]); //按出发时间
			isStopnumber =(new SxStation()).station(airdatas[i].stopnumber,"[name='stopnumber']input");//仅看直飞
			isSharecarrier =(new SxStation()).station(airdatas[i].sharecarrier,"[name='sharecarrier']input");//隐藏共享航班
			isFromStation=(new SxStation()).station(airdatas[i].orgcode,"[name='startAirPort']input");//按出发站筛
			isArriveStation=(new SxStation()).station(airdatas[i].arricode,"[name='arriveAirPort']input");//按到达站筛	
			isAirLine=(new SxStation()).station(airdatas[i].carriecode,"[name='airlineFilter']input"); //按航空公司筛
			isStyle=(new SxStation()).station(airdatas[i].planestyle.split("(")[1].split(")")[0],"[name='projectStyle']input");//按计划机型筛选
			isCangWeiType=cangweiType(airdatas[i]); //按舱位筛选
		}
		//获取全天最低价
		allDayLowPrice=(allDayLowPrice===-1 ? airdatas[i].low.price : (allDayLowPrice>airdatas[i].low.price ? airdatas[i].low.price : allDayLowPrice));
		var eplaneStyle=airdatas[i].planestyle.split("(")[1].split(")")[0]; //获取飞机类型
		if(airListMain.prototype.filterFlag){ //第一次载入，获取起飞机场，到达机场等字段
			airlineCompany=removeRepeatMain.rpMethod({rdata1:airdatas[i].carriecode,rdata2:airdatas[i].carriername},airlineCompany);
			startLand=removeRepeatMain.rpMethod({rdata1:airdatas[i].orgcode,rdata2:airdatas[i].orgname},startLand);
			arriveLand=removeRepeatMain.rpMethod({rdata1:airdatas[i].arricode,rdata2:airdatas[i].arriname},arriveLand);
			planeStyle=removeRepeatMain.rpMethod({rdata1:eplaneStyle,rdata2:eplaneStyle},planeStyle);
		}
		if(!(isFromTime&&isCangWeiType&&isFromStation&&isArriveStation&&isAirLine&&isStyle&&isSharecarrier&&isStopnumber)){
			airdatas.splice(i,1);
			--i;
		}
	}
	
	if(airListMain.prototype.filterFlag){
		$("[name='airlineFilter']input").remove();
		$("[name='airlineFilter']input").remove();
		(new FilterViiew()).view(airlineCompany,"airlineFilter");
		(new FilterView()).view(startLand,"startAirPort");
		(new FilterView()).view(arriveLand,"arriveAirPort");
		(new FilterView()).view(planeStyle,"projectStyle");
		$(".air-list").attr("data-allDayPrice",allDayLowPrice); //全天最低价赋值
		$('[name="airlineFilter"][value="'+canshu.airline+'"]').prop("checked",true).parents(".label").addClass("label-select-checkbox");
		showFilterSelect();//初始化选中的筛选条件
		airListMain.prototype.filterFlag=false;
		//$(".ajaxCanshu").val(""); //清除首次进来的查询条件
	}
	airReturnData.flights=airdatas;
	airSort.prototype.data=airReturnData; //将筛选后的结果
	if(flag!="1"){
		var getAirData=new airListMain();
	}
	getAirData.airView(airReturnData,getAirData);
}

//按出发时间进行筛选
function fromTime(datas) {
	var fromTimes=datas.depttime,
		input0_6 = $("input[value='00:00-06:00']").prop("checked"),
		input6_12 = $("input[value='06:00-12:00']").prop("checked"),
		input12_18 = $("input[value='12:00-18:00']").prop("checked"),
		input18_24 = $("input[value='18:00-24:00']").prop("checked");
		
	if (input0_6 || input6_12 || input12_18 || input18_24) {
		if (fromTimes > "00:00" && fromTimes <= "06:00") {
			if (input0_6) {
				return true;
			} else {
				return false;
			}
		} else if (fromTimes > "06:00" && fromTimes <= "12:00") {
			if (input6_12) {
				return true;
			} else {
				return false;
			}
		} else if (fromTimes > "12:00" && fromTimes <= "18:00") {
			if (input12_18) {
				return true;
			} else {
				return false;
			}
		} else if (fromTimes > "18:00" && fromTimes <= "24:00") {
			if (input18_24) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else {
		return true;
	}
}
//按舱位类型筛选
function cangweiType(datas) {
	var i=0,
		allCangwei=datas.cangweis, //.farebase;
		cwStr="",
		newCw=[],
		cw;
	$("[name='cangwei']input:checked").each(function(){
		cwStr+=$(this).val();
	});
	if(cwStr===""){
		return true;
	}
	//匹配符合条件的舱位
	(function(){
		var j = 0,
			len = allCangwei.length;
		for(j=0;j<len;j++){
			var reg=new RegExp((allCangwei[j].farebase.toString()),'ig');
			if(reg.test(cwStr)){
				newCw.push(allCangwei[j]);
			}
		}
	})();
	// allCangwei.forEach(function(item,index,Array){
	// 	var reg=new RegExp((item.farebase.toString()),'ig');
	// 	if(reg.test(cwStr)){
	// 		newCw.push(item);
	// 	}
	// });
	datas.cangweis=newCw;
	if(newCw.length==0){
		return false;
	}else{
		return true;
	}
}
//按出发站筛选
//出发车站
function SxStation() {
	this.station=function(datas,element_){
		var labels = false;
		var labels_ = false;
		$(element_).each(function() {
			if (labels == false) {
				if ($(this).prop("checked")) {
					labels_ = true;
					if ($(this).val() == datas) {
						labels = true;
					} else {
						labels = false;
					}
				} else {
					labels = false;
				}
			}
		});
		if (labels_ == false) {
			labels = true;
			return labels;
		} else {
			return labels;
		}
	};
}

//展示选中筛选条件

function showFilterSelect(){
	var list="";
	$(".filter-tj input:checked").each(function(){
		var this_=$(this),
			this_text=this_.parents(".label").find("span").text();
		list+='<div class="float-left filter-tag margin-bottom-10 background-fff">'+this_text+'<span data-value="'+this_.val()+'" class="filter-close cursor">×</span></div>';
	});
	$(".filter-show").html(list);
}
//关闭某个筛选条件
$("body").on("click",".filter-close",function(){
	var this_=$(this);
	$(".filter-tj input[value='"+this_.attr("data-value")+"']").prop("checked",false).parents(".label").removeClass("label-select-checkbox");
	this_.parents(".filter-tag").remove();
	screenMain();
});





/********筛选主函数 End**********/

//起飞时间
$("body").on("click",".js_qifeiTime .label",function(){
	screenMain();
	showFilterSelect();
});
//起飞机场
$("body").on("click",".js_startAirPort .label",function(){
	screenMain();
	showFilterSelect();
});
//到达机场
$("body").on("click",".js_arriveAirPort .label",function(){
	screenMain();
	showFilterSelect();
});
//航空公司
$("body").on("click",".js_airlineFilter .label",function(){
	screenMain();
	showFilterSelect();
});
//舱位类型
$("body").on("click",".js_cangwei .label",function(){
	screenMain();
	showFilterSelect();
});
//计划机型
$("body").on("click",".js_projectStyle .label",function(){
	screenMain();
	showFilterSelect();
});
//直飞和共享
$("body").on("click",".only-and-share .label",function(){
	screenMain();
	showFilterSelect();
});



















//$("p").slideToggle("slow");
$("body").on("click",".e-f-title",function(){
	$(".e-f-title").not($(this)).next("div").slideUp('fast');
	$(this).next("div").slideToggle('fast');
});
//主列表舱位展开收起
$("body").on("click",".btn-book-shut",function(){
	$(this).parents("li").find(".air-list-cw").slideToggle('fast');
});

/**********左侧筛选条件 start**********/

/******出发到达城市切换 start*******/
$("body").on("click",".tab-city",function(){
    setTimeout(function(){//配合城市插件 需要100ms的延迟
		var fCity=$(".fromCity").val(),
			tCity=$(".toCity").val(),
			fCityCode=$(".from-city-code").val(),
			tCityCode=$(".to-city-code").val();
		$(".fromCity").val(tCity);
		$(".toCity").val(fCity);
		$(".from-city-code").val(tCityCode);
		$(".to-city-code").val(fCityCode);
    }, 300);
});
/******出发到达城市切换 end*******/





















