

//差旅政策
function AirPolicy(){
	this.ajaxAirPolicy=function(canshu){ //参数：level 员工职级，distance 距离
		$.ajax({
			type: "POST",
			url:'/getAirPolicy',
			async:false,
			data:{
				level:canshu.level,
				distance:canshu.distance
			},
			success: function(data) {
				var now=new Date(); //存储今天的日期毫秒数
				if(data.status===200 || data.status===201 || data.status === 202 || data.status===2021){
					AirPolicy.prototype.policy={
						data:data,
						nowDay:(new Date(now.getFullYear(),now.getMonth(),now.getDate())).getTime()
					};

				}else{
					zh.alerts({
						title:"提示",
						text: "请求参数异常("+data.status+")!"
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
	AirPolicy.prototype.airMatch=function(data,airlineData){
		if(data.data.status === 201 || data.data.status === 202 || data.data.status === 2021 || data.data.data.policyAir == null){
			return -1;  //未设置，未开启差旅政策，直接通过
		}
		var policy=data.data.data.policyAir[0], //差旅政策
			nowDay=data.nowDay, //今天
			allowfly=policy.allowfly, //是否允许飞
			allowc=policy.allowc,
			cabinlimit=policy.cabinlimit, //是否开启折扣限制
			cabinzhekou=policy.cabinzhekou, //折扣
			cabText="", //折扣中文转换
			cabc=policy.cabc,
			flightlimit=policy.flightlimit,//是否开启最低价限制
			flightlowtype=policy.flightlowtype,//限制类型
			flighthour=policy.flighthour, //前后n小时数
			lowc=policy.lowc,
			allowbefore=policy.allowbefore, //是否开启提前n天预订
			beforeday=policy.beforeday, //提前n天
			startmile=policy.startmile, //开始里程
			endmile=policy.endmile, //结束里程
			beforeHm=beforeday*24*60*60*1000, //提前n天,换算成毫秒
			brec=policy.brec,
			date=(new Date(airlineData.date)).getTime(), //起飞日期
			discount=airlineData.discount, //折扣
			farebase=airlineData.farebase, //舱位代码
			alldayLow=parseFloat(airlineData.alldayLow), //全天最低价
			airlineLow=parseFloat(airlineData.airlineLow), //航班最低价
			price=parseFloat(airlineData.price), //当前价格
			book=true,//可否预订
			//mileText=startmile+"-"+endmile+"公里", //公里
			tips=[],//违背提示语
			volidate=false, //是否违背差旅政策
			isUseHour=true; //是否调用前后两小时接口
			noNeedTips = []; //违背无需审批的政策提示语
			isNoMation = false; //是否有违背无需审批提示语
			isNoNeedTips = false; //判断提示语里边是否加上还有两个字

		//差旅条件控制，0 不允许预订，1 只做提醒，2 违背，无需审批
		//参数为对象，
		// control 管控方式；
		// controlType 管控方式字符串；'cabc' 折扣；'brec' 提前几天; 'lowc' 最低价
		// tipsText 违背提示语；
		// noNeedText 违背无需审批提示语
		function isController(controlPara) {
			if(controlPara.control==="0"){ //不允许预订
				book = false;
				tips.push(controlPara.tipsText + "不允许预订");
				volidate = true;
				return true;
			}
			if(controlPara.control==="1"){ //只做提醒
				tips.push(controlPara.tipsText);
				volidate = true;
				return true;
			}
			if(controlPara.control==="2"){ //只提醒,无需审批
				noNeedTips.push(controlPara.noNeedText);
				if(controlPara.controlType == "cabc" || controlPara.controlType == "lowc"){
					isNoNeedTips = true;
				}
				isNoMation = true;
				return true;
			}
		}

		//拼接 违背/违背无需审批 主方法
		//para 语句数组
		function exportStr(arr) {
			var str = "";
			for(var i = 0; i < arr.length; i++){
				str = str + arr[i] + "、";
			}
			if(str != ""){
				str = str.slice(0,(str.length-1));
			}
			return str;
		}

		//是否允许乘坐飞机
		function isAllowFlyMain() {
			var tipsText = "不允许乘坐飞机";
			if(!(allowfly===0 && allowc==="0")){ //不允许乘坐飞机，只做提醒
				if(allowfly!==1){ //不允许乘坐，只做提醒
					volidate=true;
					tips.push(tipsText);
				}
				return true;
			}
			book = false;
			volidate = true;
			tips.push(tipsText + "不可预订");
			return false;
		}
		//折扣是否超标
		function isDiscountMain() {

			var tipsText=""; //是否全价经济舱提示
			if(cabinlimit === 1){ //折扣限制
				if(cabinzhekou <= 100){
					tipsText = farebase == 100 ? "不得高于全价经济舱" : "不得高于经济舱" + cabinzhekou + "折";
					if(farebase!=="Y"){ //如果不是经济舱
						return isController({
							control: cabc,
							controlType: "cabc",
							tipsText: tipsText,
							noNeedText: tipsText
						});
					}
					if(discount>cabinzhekou){ //是经济舱但违背了
						return isController({
							control: cabc,
							controlType: "cabc",
							tipsText: tipsText,
							noNeedText: tipsText
						});
					}
					return true;
				}
				if(cabinzhekou>100 && cabinzhekou<=120){
					tipsText = "不得高于公务舱";
					if(farebase==="F"){
						return isController({
							control: cabc,
							controlType: "cabc",
							tipsText: tipsText,
							noNeedText: tipsText
						});
					}
					return true;
				}
				return true;
			}
			return true;
		}

		//最低价限制
		function lowPriceMain() {
			var tipsText = "预订航班最低价";

			if(flightlimit===1){
				if(flightlowtype===0){ //航班最低价
					isUseHour=false;
					if(price>airlineLow){
						return isController({
							control: lowc,
							controlType: "lowc",
							tipsText: "预订航班最低价",
							noNeedText: "还有最低价可选择"
						});
					}
					return true;
				}
				if(flightlowtype===1){ //全天最低价
					isUseHour=false;
					if(price>alldayLow){
						return isController({
							control: lowc,
							controlType: "lowc",
							tipsText: "预订全天最低价",
							noNeedText: "还有最低价可选择"
						});
					}
					return true;
				}
				return true;
			}
			isUseHour=false;
			return true;
		}

		//提前n天预订
		function beforeDayMain() {
			var tipsText = brec == 0 ? ("超出" + beforeday + "天") : ("提前" + beforeday + "天预订"),
				noNeedText = "需要提前" + beforeday + "天预订";
			if(allowbefore===1){
				if(date-nowDay<beforeHm){
					return isController({
						control: brec,
						controlType: "brec",
						tipsText: tipsText,
						noNeedText: noNeedText
					});
				}
				return true;
			}
			return true;
		}

		// 是否允许飞 && 折扣 && 最低价 && 提前n天预订
		isAllowFlyMain() && isDiscountMain() && lowPriceMain() && beforeDayMain();

		return {
			book: book,
			tips: exportStr(tips),
			tipsNoApprove: isNoMation ? exportStr(noNeedTips) : "",
			volidate: volidate,	//是否违背
			startmile: startmile,
			endmile: endmile,
			isUseHour: isUseHour,
			flighthour: flighthour,
			flightlimit:flightlimit,
			flightlowtype:flightlowtype,
			lowc:lowc
		};
	};
	AirPolicy.prototype.lowPrice=function(){

	};
}