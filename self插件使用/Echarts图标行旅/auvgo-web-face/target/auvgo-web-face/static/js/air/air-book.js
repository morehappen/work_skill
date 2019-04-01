// updateLoginUser
getLoginUserInfor(updateLoginUser);

// data: outerData.shenpi,
// 	approveName : outerData.approveRuleName
var interface = new OuterInterface(),// 实例化第三方接口
	outerData = interface.getOuterInterface(); // 读取第三方接口数据
function outer_shenpi (data,flag) {
	$("#createForm").find("[name^='shenpi']").remove();
	var level = [],
		list = "";
		approves_ = "";
	if(!(data.data instanceof Array && data.data.length > 0)){
		return;
	}
	$.each(data.data,function(index,item){
		var nowLevel=item.level;
		if(level.length===0){
			level.push(nowLevel);
		}else{
			$.each(level,function(index,item){
				if(item==nowLevel){
					return false;
				}else if(item!=nowLevel && index===level.length-1){
					level.push(nowLevel);
				}
			});
		}
	});
	var xuhao = 0;
	$.each(level,function(index,item){
		var eLevelList="",
			levelItem=item;
		$.each(data.data,function(index,item){
			if(item.level==levelItem){
				if(!(item.isDefaultApprove == 0 && flag != 1)){

					eLevelList+='<div class="sp-jb-person">'+
						'<div class="sg-jb-p" data-sprid="'+item.id+'">'+item.name+'</div></div>';
					approves_ += '<input type="hidden" name="shenpi[' + xuhao +'].email" value="' + item.email + '">' +
						'<input type="hidden" name="shenpi[' + xuhao + '].isDefaultApprove" value="' + item.isDefaultApprove + '">' +
						'<input type="hidden" name="shenpi[' + xuhao + '].level" value="' + item.level + '">' +
						'<input type="hidden" name="shenpi[' + xuhao + '].mobile" value="' + item.mobile + '">' +
						'<input type="hidden" name="shenpi[' + xuhao + '].name" value="' + item.name + '">' +
						'<input type="hidden" name="shenpi[' + xuhao + '].username" value="' + item.username + '">';
					xuhao++;
				}
			}
		});
		if(index < xuhao){
			eLevelList='<div class="clear"><div class="sp-jb float-left line-height-48">'+(index)+'级审批</div><div class="sp-jb float-left">'+eLevelList+ '</div></div>';
		}
		if(index!=level.length-1){
			eLevelList+='';
		}
		list+=eLevelList;
	});
	$(".sp-show").html(list);
	if($(".sp-show > div:last").is(".dote-line")){
		$(".sp-show > div:last").remove();
	}
	$("#createForm").append(approves_);
	var select=$('<select class="_select_ approve_rule_select" name="' + $('#model-flag').attr('data-modelflag') + '.approveid"></select>'),
		options = '<option value="">'+data.approveName+'</option>';
	select.html(options);
	$(".approve_rule").html(select);
	(new SelectMain()).creatSelect($(".approve_rule_select"));
	$("body").off("click",$(".approve_rule_select").parents(".drop").find(".drop_title").selector);
}



//差旅政策页面匹配函数
function policyCallback(level){//TODO:wxj-20170824-函数原名称-airPolicyPage
	if($(".passanger-model .e-p-model").length>0){
		var levels ='';
		$(".passanger-model .e-p-model").each(function(){
			levels+=$(this).attr("data-level")+'/'
		})
		level = levels;
	}
	interface = new OuterInterface(),// 实例化第三方接口
	outerData = interface.getOuterInterface(); // 读取第三方接口数据
	var /*level="",*/
	distance=$(".air-licheng").val(),
	volidates=[],
	level = level,
	outerInterface = function () { // 实例化第三方接口
		var costcenter = $('.costcenter_hidden').val(); //成本中心
		var projectinfo = $('.projectinfo_hidden').val();//项目中心
		var isEmpty = function (data) {
				return !(data === "" || data === null || data === undefined);
			},
			addPerson = function (data) {
				var person = "";
				level = "";
				$.each(data,function(index,item){
					// console.log(item);
					var certypeName = (function(certtype){
						var value = '';
						switch (certtype){
							case "1": value = '身份证';break;
							case "B": value = '护照';break;
							case "C": value = '港澳通行证';break;
							case "G": value = '身份台胞证证';break;
							default: value = "其他";
						}
						return value;
					})(item.certtype);
					if(item.zhiwei != ""){
						level += item.zhiwei + "/";
					}
					person += '<div class="passanger-model" data-loginlevel="' + (item.zhiwei ? item.zhiwei : "") + '" data-logindept="' + (item.deptname ? item.deptname : "") + '">' +
						      '<div class="e-p-model font-size-12" ' +
								'data-id="' + (item.id ? item.id : "") + '" ' +
								'data-level="' + (item.zhiwei ? item.zhiwei : "") + '" ' +
								'data-certtype="' + (item.certtype ? item.certtype : "") + '" ' +
								'data-certno="' + (item.certno ? item.certno : "") + '" ' +
								'data-name="' + (item.name ? item.name : "") + '" ' +
								'data-deptname="' + (item.deptname ? item.deptname : "") + '" ' +
								'data-passtype="' + ((outerData.bookFlag == 1 || outerData.bookFlag == 2) ? "1" : "0") + '" ' +
								'data-mobile="' + (item.mobile ? item.mobile : "") + '">' +
						      '<div class="clear margin-bottom-10">' +
								// '<span class="float-left p-m-name clear position"><span class="icon-img pass-bg position-ab"></span>' +
						      	'<span class="loginName p-every-passes text-ellipsis" title="' + (item.name ? item.name : "") + '">' + (item.name ? item.name : "") + '</span></span>' +
						      	'<div class="float-left clear"></div></div>' +
								'<div class="clear margin-bottom-10 p-t-999">' +
								'<div class="float-left p-w-120">证件类型</div>' +
								'<div class="float-left p-w-160">证件号码</div>' +
								((costcenter==3||costcenter==1)?'<div class="float-left p-w-160" style="position: relative;">成本中心<b class="nessary-b '+(costcenter!=1?"hide":"")+'" style="top:2px;left:53px">*</b></div>' :"")+""+
								((projectinfo==3||projectinfo==1)?'<div class="float-left p-w-160" style="position: relative;">项目中心<b class="nessary-b '+(projectinfo!=1?"hide":"")+'" style="top:2px;left:53px">*</b></div>' :"")+
								
								'</div>' +
								'<div class="clear margin-bottom-10">' +
								'<div class="float-left drop-centro">' +
						      	'<div class="drop">' +
								'<select class="_select_ _dropDown_" data-value="' + (item.certtype ? item.certtype : "") + '" datatype="*" nullmsg="请选择证件类型">' +
						      	'<option value="' + item.certtype + '">' + certypeName + '</option></select>' +
						      	'<div class="drop_title">' + certypeName + '</div>' +
						      	'<ul class="drop_option">' +
								'<li>' +certypeName + '</li>' +
								'</ul>' +
								'</div>' +
								'</div>' +
					          	'<div class="float-left p-w-160 input-centro">' +
						      	'<input type="text" class="input user_centro border-0" value="' + (item.certno ? item.certno : "") + '" readonly="readonly" >' +
								'</div>' +
								((costcenter==3||costcenter==1)?'<div class="float-left p-w-160 input-email">' +
									'<input   type="text" '+(costcenter==3?'nullmsg="请选择成本中心" datatype="*"':"" )+'   class="input ' + (outerData.costname?"":"costCenter-input") + ' "  name="airUser[' + index + '].costName" ' + (outerData.costname?"readonly":"") + ' value="' + (outerData.costname?outerData.costname:"") + '">' +
									'<input   type="hidden"  name="airUser[' + index + '].costId" value="' + (outerData?0:"") + '" >' +
									'</div> ':"") +""+
								((projectinfo==3||projectinfo==1)?'<div class="float-left p-w-160 input-email">' +
									'<input  type="text"  class="input ' + (outerData.proname?"":"project-input") + ' " '+(costcenter==3?'nullmsg="请选择项目中心" datatype="*"':"" )+' name="airUser[' + index + '].itemNumber" ' + (outerData.proname?"readonly":"") + ' value="' + (outerData.proname?outerData.proname:"") + '">' +
									'<input  type="hidden"  name="airUser[' + index +'].itemNumberId" value="' + (outerData?0:"") + '">' +
									'</div> ':"") +
								'</div>' +
								'</div>' +
								'<div class="clear margin-bottom-10 p-t-999 font-size-12">' +
								'<div class="float-left p-w-120">邮箱</div>' +
								'<div class="float-left p-w-160">联系电话</div>' +
								'<div class="float-left p-w-160">所在部门</div>' +
								'</div><div class="clear">' +
								'<div class="float-left p-w-120 input-email">' +
							  	'<input type="text" name="airUser[' + index + '].email" value="' + (item.email ? item.email : "") + '" class="input user_email border-0">' +
								'</div> ' +
								
								'<div class="float-left p-w-160 input-mobile">' +
								'<input type="text" name="airUser[' + index + '].mobile" readonly value="' + (item.mobile ? item.mobile : "") + '" class="input user_mobile border-0" ></div>' +
								'<div class="float-left p-w-160">' +
								'<input type="text" class="input user_dept border-0" value="' + (item.deptname ? item.deptname : "") + '" readonly="readonly">' +
								'</div>' +
								'</div>' +
						      	'<input type="hidden" name="airUser[' + index + '].employeeid" class="e-id" value="' + (item.id ? item.id : "") + '">' +
						      	'<input type="hidden" name="airUser[' + index + '].certtype" class="e-certtype" value="' + (item.certtype ? item.certtype : "") + '">' +
						      	'<input type="hidden" name="airUser[' + index + '].id" class="e-passtype" value="' + ((outerData.bookFlag == 1 || outerData.bookFlag == 2) ? "1" : "0") + '"></div></div>';
				});
				$(".passanger-container").html(person);
			},
			data_ = null;
		if(!outerData){ // 非第三方数据
			return;
		}
		$("#createForm").attr("action","/air/cas/createAirOrder");
		$(".travelorder-val").val(outerData.traverorderno).attr("readonly","readonly");
		$(".project-input").val(outerData.proname).attr("readonly","readonly");
		$(".costCenter-input").val(outerData.costname).attr("readonly","readonly");
		if(!isEmpty(outerData.custinfo.bookUserName)){
			$(".link-name").val(outerData.custinfo.bookUserName);
			$(".link-phone").val(outerData.custinfo.bookMobile);
		}
		$(".link-email").val("");
		if(outerData.bookFlag == 1){
			return;
		}
		interface.clearPower(outerData.product);
		if(outerData.bookFlag == 5){
			return;
		}
		interface.getPersons(personCallback);

		function personCallback(data){
			if(data.status != 200){
				return;
			}
			if(outerData.bookFlag == 2){
				data_ = data.data;
			}else{
				data_ = outerData.passengers;
			}
			if(!isEmpty(outerData.custinfo.bookUserName)){
				mobile = outerData.custinfo.bookMobile;
				name = outerData.custinfo.bookUserName;
				$(".link_name").val(name);
				$(".link_phone").val(mobile);
			}
			addPerson(data_);
		}
		/********* 第三方有数据，开始处理 *********/
		$(".choice-cjr").remove();
		$(".air-common-p").html("");
		// 根据权限清空指定内容
		// console.log(outerData);
	};
	/*$(".e-p-model").each(function(){
		level+=$(this).attr('data-level')+"/";
	});*/
	outerInterface();
	// console.log(outerData);
	if(outerData != null && outerData.bookFlag != 1 && outerData.bookFlag != 2 &&  outerData.bookFlag != 5){
		outer_shenpi({
			data: outerData.shenpi,
			approveName : outerData.approveRuleName
		},null);
		return;
	}
	// 增加一步判断
	if (level == '' || $(".e-p-model").size() == 0) {
		$('.chailv-cs').removeClass('bounceInRight').addClass('bounceOutRight');
		setTimeout(function() {
			$('.chailv-cs').hide();
		}, 1000);
		$(".isBook").val("1");
		$(".isWei").val("0");
		if(outerData!= null && outerData.bookFlag != 1){
			outer_shenpi({
				data: outerData.shenpi,
				approveName : outerData.approveRuleName
			},null);
			return;
		}
		isApproveMain();
		isApproveMain();
		return ;
	}
	
	var airpolicy=new AirPolicy();
	airpolicy.ajaxAirPolicy({
		level:level,
		distance:distance
	});
	//公司未开启差旅政策 //未设置差旅政策 //超出里程范围不超标
	if(airpolicy.policy.data.status == 201 || airpolicy.policy.data.status == 202  || airpolicy.policy.data.status == 2021 || airpolicy.policy.data.data.policyAir == null){ 
		$(".isBook").val("1");
		$(".isWei").val("0");
		if(outerData != null && outerData.bookFlag != 1){
			outer_shenpi({
				data: outerData.shenpi,
				approveName : outerData.approveRuleName
			},null);
			return;
		}
		isApproveMain();
		return;
	}
	//单程/往返 差旅政策匹配
	$(".book-xingcheng").each(function(){
		var this_=$(this),
			eVolidate=airpolicy.airMatch(airpolicy.policy,{
							date:this_.find(".air-from-date").attr("data-value"),
							discount:this_.find(".air-policys").attr("data-discount"),
							farebase:this_.find(".air-policys").attr("data-farebase"),
							alldayLow:this_.find(".air-policys").attr("data-dayprice"), //	全天最低价
							airlineLow:this_.find(".air-policys").attr("data-lowprice"), //航班最低价，
							price:this_.find(".air-policys").attr("data-price") //当前航班价格
					   });
		eVolidate.airline=this_.find(".air-policys").attr("data-airline");
		eVolidate.price=this_.find(".air-policys").attr("data-price");
		volidates.push(eVolidate);
	});
	$.each(volidates,function(index,item){
		if(item.book){
			var isLow = $("#is_low_flight").val();
			var tipsText = item.tips,
				nowText = "前后"+item.flighthour+"小时最低价";
			if(item.flightlimit===1){
				if(item.isUseHour==true && isLow != "1"){ //调用前后两小时接口
					var priceHour=-1;
					//console.log(item);
					$.ajax({
						type: "POST",
						url:'/air/getHourFlight',
						async:false,
						data:{
							bookairline:item.airline,
							hour:item.flighthour,
							price:item.price,
							type:index=="0" ? "0" : "1" //返回值为0，单程；1返程
						},
						success: function(data) {
							if(data.status===200){ //前后n小时数据请求成功
								if(data.data === undefined){
									return;
								}
								var dataParse=JSON.parse(data.data);
								var hourData=dataParse.flights;
								if(hourData.length===0){ //未违背前后两小时，维持原违背原因
									/*if(dataParse.msg!="匹配到0个2小时前后的最低价航班"){
										zh.alerts({
											title:"提示",
											text: JSON.parse(data.data).msg
										});
										return;
									}else{*/
									return;
									//}
								};
								hourData=hourData[0].low.price;
								priceHour=hourData;
							}else if(data.status===302){
								zh.alerts({
									title:"提示",
									text: "登录失效，请重新登录!"
								});
							}else{
								zh.alerts({
									title:"提示",
									text: data.msg
								});
								// console.log(data.msg);
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
					if(priceHour==-1){
						return;
					}
					if(item.price>priceHour){ //前后两小时
						if(item.lowc === "2"){
							return;
						}
						item.volidate=true;
						if(item.lowc === "0"){
							item.book=false;
							item.tips = nowText;
							return;
						}
						item.tips = tipsText == "" ? nowText : (tipsText + "、" + nowText);
					}
				}
			}
		}
	});
	$(".chailv-cs").html("");
	$(".isWei").val("0");
	if(volidates.length===1){
		weibeiView("-1",volidates[0],"0"); //判断是单程还是往返,0为单程，1位往返
	}else{
		$.each(volidates,function(index,item){
			weibeiView(index,item,"1");
		});
	}
	function weibeiView(index,item,flag){ //展示超标
		var wbtext="";
		if(item.book){
			if($(".isBook").val()!=="0"){
				$(".isBook").val("1");
			}
			if(item.volidate){
				$(".chailv-cs").append('<div class="cl-m-show">'+(flag==="0" ? "" : (index===0 ? "去程：" : "返程："))+'超标事项：您超出了“'+item.tips+'”的差旅标准</div>');
				$('.chailv-cs').removeClass('bounceOutRight').addClass('bounceInRight');
				setTimeout(function() {
					$('.chailv-cs').show();
				}, 1000);
				
				$(".isWei").val("1");
			}else{
				
					$(".isWei").val("0");
			
			}
		}else{
			$(".chailv-cs").append('<div class="cl-m-show">您超出了“'+item.tips+'”的差旅标准,不可预订</div>');
			$('.chailv-cs').removeClass('bounceOutRight').addClass('bounceInRight');
			setTimeout(function() {
				$('.chailv-cs').show();
			}, 1000);
			$(".isBook").val("0");
			$(".isWei").val("1");
		}
		$(".cl-m-show").each(function(){
			wbtext+=$(this).text()+"；";
		});
		$(".bookpolicy").val(wbtext);
	}
	function weibeiReason(data){
		if(!(data instanceof Array && data.length > 0)){
			layer.msg("请在后台维护超标原因，该订单暂不能提交");
			return;
		}
		var select=$('<select class="_select_ w-reason-select" data-value="'+data[0].value+'"></select>'),
			list="";
		$(".input-full-reason").val(data[0].name);
		$.each(data,function(index,item){
			list+='<option value="'+item.value+'">'+item.name+'</option>';
		});
		select.html(list);
		$(".wb-c-select").html(select);
		var selectMain=(new SelectMain()).creatSelect($(".w-reason-select"));
		if($(".w-reason-select").val()=="4"){
			$(".full-reason-c").show();
		}else{
			$(".full-reason-c").hide();
		}
		$(".weibei-container").show();
	}
	if($(".isWei").val()==="1"){
		$.ajax({
            type: "POST",
            url:'/getWeibei', 
            async:false,
            data:{
            	type:"air"
            },
            success: function(data) {
            	if(data.status===200){ 
            		var weibeimation=JSON.parse(data.data);
            		weibeiReason(weibeimation);
            	}else{
            		zh.alerts({
        				title:"提示",
        				text: data.msg
        			});
            		// console.log(data.msg);
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
		
		$("body").on("click",".drop_option li",function(){
			var this_=$(this),
				select=this_.parents(".drop").find("select");
			if(select.is(".w-reason-select")){
				if(select.val()==select.find("option:last").val()){
					$(".full-reason-c").show();
					$(".input-full-reason").removeAttr("ignore").val("");
					$(".full-reason-c b").show();
				}else{
					$(".full-reason-c").hide();
					$(".input-full-reason").attr("ignore","ignore").val(select.find("option[value='"+select.val()+"']").text());

					$(".full-reason-c b").hide();
				}
			}
		});
	}
	//初始化审批政策
	//参数，超标标识：0，1；哪条业务线：机票的为：
	if(outerData != null && (outerData.bookFlag == 2 || outerData.bookFlag == 5)){
		outer_shenpi({
			data: outerData.shenpi,
			approveName : outerData.approveRuleName
		},$(".isWei").val());
		return;
	}
	isApproveMain();
	
	
}
function isApproveMain(){
	(new isApprove({
		weibei:$(".isWei").val(),
		type:"gnjp"
	})).ajaxIsApprove();
}




//设置公司配置，服务费配置
(function(){
	
	$("#air_book_callback").click(function(){
		window.location.href = "/air/Returnlist";
	});
	
	$("#btn-air-back").click(function () {
        // window.location.href = "/air/query";
        history.back(-1);
    });
	$.ajax({
        type: "POST",
        url:"/getCompanyconfig",
        success: function(data) {
        	// console.log(JSON.stringify(data.data));
        	if(data.status===200){ //数据请求成功
        		var projectData=JSON.parse(data.data);
        		companySet(projectData.productSet);
        		serverCostSet(projectData.fuwufei); //服务费设置
        		autoCountPrice();
        	}else{
        		zh.alerts({
    				title:"提示",
    				text: data.msg
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
	
	function companySet(data){
		var cdata=JSON.parse(data.proconfvalue),
			travelorder="", //出差单申请号
			travelreason="", //出差事由
			projectinfo="", //项目中心
			costcenter=""; //成本中心
			peisongaddress="", //配送地址
			jpinsurance="", //是否强制保险
		$.each(cdata,function(index,item){
			switch(item.name){
				case "costcenter":costcenter=item.value;break;
				case "travelorder":travelorder=item.value;break;
				case "travelreason":travelreason=item.value;break;
				case "projectinfo":projectinfo=item.value;break;
				case "peisongaddress":peisongaddress=item.value;break;
				case "jpinsurance":jpinsurance=item.value;break;
				default:"";
			}
		});
		//设置成本中心
		if(costcenter==2){//2表示不显示
			$(".costCenter-c").remove();
		}else if(costcenter==3){//3显示非必填
			$(".costCenter-c .costCenter-input").attr("ignore","ignore");
			$(".costCenter-c").find('b').hide();
		}else{
			$(".costCenter-c").find('b').show();
		}
		//出差申请单设置
		if(travelorder==2){ //不显示
			$(".travelorder-c").remove();
		}else if(travelorder==3){
			$(".travelorder-c .travelorder-val").attr("ignore","ignore");
			$(".travelorder-c").find('b').hide();
		}else{
			$(".travelorder-c").find('b').show();
		}
		//如果出差事由必填设置为否
		if(travelreason==0){
			$(".chailvR-c .chailv-reason").attr("ignore","ignore");
			$(".chailvR-c").find("b").hide();
		}
		//设置项目信息
		if(projectinfo==2){//2表示不显示
			$(".project-c").remove();
		}else if(projectinfo==3){//3显示非必填
			$(".project-c .project-input").attr("ignore","ignore");
			$(".project-c .showname-c").attr("ignore","ignore");
			$(".project-c").find('b').hide();
		}else{
			$(".project-c").find('b').show();
		}
		//配送地址
		if(peisongaddress!=="1"){
			$(".peisongAddress-c").remove();
		}
		//是否强制保险*e-p-bx*********************************************保险强制需要在表单提交时校验*****************************************************
		if(jpinsurance==="1"){
			$(".e-p-bx").addClass("e-bx-nessary").show();
			$(".e-p-bx").find('input[type="checkbox"]:first').prop("checked",true);
			$(".e-p-bx").find(".label-checkbox:first").addClass("label-select-checkbox");
			$(".bxCodeStr").val($(".e-p-bx").find('input[type="checkbox"]:checked').val() + "-");
			// 强制保险
			var this_ = $(".e-p-bx").find('input[type="checkbox"]:first');
			selInsurance(this_);
		}
		if(jpinsurance==="0"){
			$(".e-p-bx").show();
		}
		if(jpinsurance==="2"){
			$(".e-p-bx").hide();
		}
	}
	function serverCostSet(data){
		var size=$(".book-xingcheng").size(),
			persons = $(".e-p-model").size();
		if(data.gntype==="order"){ //按每单收费
			$(".server-baifenbi").remove();
			$(".serverCost-none").remove();
			$(".e-server-cost").text(data.gnweb).attr({"data-type":"order","data-cost":data.gnweb});
			$(".e-p-total-s").text(data.gnweb*size*persons).attr("data-cost",data.gnweb*size*persons);
		}else{
			$(".order-server").remove();
			if(data.gnpertype==="2"){ //月流水收费，服务费为0
				$(".server-baifenbi").remove();
				$(".serverCost-none").attr({"data-type":"0","data-cost":"0"}).hide();
			}else{ //按百分比收费
				$(".serverCost-none").remove();
				$(".e-server-cost").text(data.gnper+"%").attr({"data-type":"0","data-cost":data.gnper});
			}
		}
	}
	
})();


//退改签事件
$("body").on("mouseover mouseout",".air-tgq",function(e){
	var this_=$(this).find(".hover-content");
	if(e.type=="mouseover"){
		this_.show();
	}else{
		this_.hide();
	}
});

//判断是否是分销公司
$.ajax({
	url:"/crm/jiesuan",
	type:"post",
	success:function(data){
		// console.log(data);
		if(data.data.fukuankemu=="4"){
			//判断是否是分销公司  是分销的不显示出差事由
			$('.chailv-mation-remove').remove();
			$.ajax({
				url:"/crm/employee/getDefaultDept",
				type:"post",
				success:function(data){
					if(data.data!=""&&data.data!=null){
						$(".fanxian-linshi").val(data.data.id);
					}
				}
			});
			$(".fanxian").val("true");
			$("#save-staff-form").attr('action','/crm/employee/save');
			$(".fanxian-hide").show();
		}
		
	}
});
//价格自动计算
function autoCountPrice(){
	
	var num=0,
		serverCost_=0,
		onlyPrice=0,
		e_serverCost = 0;
	if($.trim($(".unit-xianfan").text())==""||$.trim($(".unit-xianfan").text())==null){
		$(".unit-xianfan").attr("data-everyprice","0").text("0");
	}
	$(".e-p-model").each(function(){
		num++;
	});
	$(".cost-show").each(function(){
		var this_=$(this),
			serverCostEle=this_.find(".e-server-cost"),
			serverBaifenbi=this_.find(".server-baifenbi"),
			serverSub=$(".serverSub"),
			total_no_server=0,
			serverTotal=0;
		this_.find(".e-p-count:not(.server-baifenbi)").each(function(){
			var this_s=$(this),
				price=this_s.find("span[data-everyprice]").attr("data-everyprice"), //每行单价
				total_ele=this_s.find(".e-p-total"),
				total_price=price*num; //每行总价
				total_no_server+=total_price;
				total_ele.html(price*num).attr("data-totalPrice",total_price);
				$(".personNum").html(num);
		});
		if(serverCostEle.attr("data-type")=="0"){ 
			serverTotal+=parseFloat((total_no_server*serverCostEle.attr("data-cost")/100).toFixed("1"));
			serverSub.html(num);
			serverBaifenbi.find(".e-p-total-s").html(serverTotal);
			serverCost_+=serverTotal;
		}
		onlyPrice+=total_no_server;
	});
	if($(".e-server-cost").attr("data-type")=="2"){
		serverCost_=parseFloat($(".e-p-total-s").attr("data-cost"));
	}
	if($(".e-server-cost").attr("data-type")=="order"){
		e_serverCost=parseFloat($(".e-server-cost").attr("data-cost"));
		$(".e-num").text(num);
		serverCost_ = e_serverCost*num*$(".cost-show").size();
		$(".e-p-total-s").text(serverCost_).attr("data-cost",serverCost_);
	}
	$(".p-m-price").html(serverCost_+onlyPrice);
}

//需要配送

$("body").on("click",".isPeisong",function(){
    //peisongControl($(this));
});

function peisongControl(this_){
    if(this_.prop("checked")===true){
        $(".address_detail").show();
        $(".change-input").removeAttr("ignore");
    }else{
        $(".address_detail").hide();
        $(".change-input").attr("ignore","ignore");
    }
}


$("body").on("click keyup",".change-input",function(){
    //初始化自动下拉数据模块
    var addrData=new DropAutoData({
        analyzerData:analyzerData,
        eventMain:eventMain,
        url:'/getPeison',
        this_:$(this),
        showField:"address",
        hideField:"linkmobile,linkname",
        tips:"订单暂不能提交，请在后台配置配送地址！"

    });
    addrData.interceptor();
    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data){
        var data=JSON.parse(data.data);
        $(".change-input").addClass("_dataFull_");
        this.volidate(data);

    }
    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
        var address_detail=active.parents(".address_detail");
        address_detail.find(".addr_name").val(this_.attr("data-linkname"));
        address_detail.find(".addr_phone").val(this_.attr("data-linkmobile"));
    }
});
//获取项目中心
/*$("body").on("focus",".input-addr",function(e){
	console.log(e.type);
	var dataAuto=new DataAuto();
	dataAuto.volidate({
		this_:$(this),
		etype:e.type,
		url:"/getPeison",
		dataAuto:dataAuto
	});
});*/




//保险勾选

$("body").on("click",".e-p-bx .label",function(){
	var this_=$(this).find("input");
	selInsurance(this_);
//	var this_=$(this),
//		this_input=this_.find("input");/L:
//	if(this_input.val=="3"){
//		this_input.parents("label").removeClass("label-select-checkbox");
//	}else{
//		
//	}
});

function selInsurance(this_){
	if(this_.val()==3){
		this_.parents(".e-p-bx").find(".label-select-checkbox").removeClass("label-select-checkbox").find("input").prop("checked",false);
		this_.prop("checked",true).parents("label").addClass("label-select-checkbox");
	}else{
		this_.parents(".e-p-bx").find("input[value='003']").prop("checked",false).parents("label").removeClass("label-select-checkbox");
	}
	var codes="",cost=0;
	this_.parents('.e-p-bx').find("input:checked").each(function(){
		codes+=$(this).val()+"-";
		cost+=parseFloat($(this).attr("data-price"));
	});
	$(".bxCodeStr").val(codes);
	$(".unit-baoxian").each(function(){
		var this_=$(this);
		this_.html(cost).attr("data-everyprice",cost);
	});
	autoCountPrice();
}

// console.log($(".bxCodeStr").val());
if($(".bxCodeStr").val()!=""){
	var codes="",cost=0;
	var arr = $(".bxCodeStr").val().split("-");
	$.each(arr,function(index,item){
		$(".e-bx-parent input").each(function(){
			if(item==$(this).val()){
				$(this).parents(".label-checkbox").addClass("label-select-checkbox");
				$(this).prop("checked",true);
				cost+=parseFloat($(this).attr("data-price"))
			};
			// console.log($(this))
		});
	});
	$(".unit-baoxian").each(function(){
		var this_=$(this);
		this_.html(cost).attr("data-everyprice",cost);
	});
	autoCountPrice()
	
}



//submitMain();
//监听表单提交


// 提交订单主函数
/*function submitMain(){
	return $("#createForm").Validform({
		btnSubmit: ".book-submit",
		ajaxPost: true,
		beforeSubmit: function(curform){
			console.log();
			console.log("q1233");
			return false;
		},
		callback: function(data){
			$.Hidemsg();
			if(data.status == 300){
				layer.msg(data.msg);
				return;
			}
			if(data.status==301){
				var repat = JSON.parse(data.data);
				if(repat.length>1){
					layer.msg(repat[0]+ ""+ repat[1]);
				}else{
					layer.msg(repat[0]);
				}
				return;
			 }
			if(data.status==200){
				var ordernos = JSON.parse(data.data);
				location.href="/air/order/Tosuccess?orderno1="+ordernos[0]+"&orderno2="+(ordernos[1]?ordernos[1]:'');
			}
		}
	});
}*/

$("body").on("click",".book-submit",function(){
	// console.log(outerData);
	
	$('input[name="approvename"]').val($(".approve_rule_select").parents(".drop").find(".drop_title").text());
	var nums=parseFloat($(".e-p-model").size()), //乘客数量
		xingcheng=parseFloat($(".book-xingcheng").size()), //行程，单程1，往返2
		toNum=$(".setNumTo").val(), //去程剩余票数
		backNum=$(".setNumReturn").val(), //返程剩余票数
		tipsNum="",  //剩余票数提示
		numFlag=true,
		dateArr=$(".orderTimes").val().split(","),
		approvename =$.trim($(".approve_content .drop_title").text());
		childrenFlag = true; //是否允许订儿童票
	//添加表单提交 审批规则
	if($(".e-p-model").size()==0){
		layer.msg("请选择乘机人！");
		return;
	}
	// 成本中心 项目中心
	if($('.costcenter_hidden').val()=="1" || $('.projectinfo_hidden').val()=="1"||$('.getShowname').val()=="0"){
		var cname="";
		var pname="";
		var Showname = "";//判断bkjt的标志
		$(".passanger-model .e-p-model").each(function(){
			var cn = $(this).find("input[name$=costName]").val();
			var pn = $(this).find("input[name$=itemNumber]").val();
			var sn = $.trim($(this).find('.input[name$="showCode"]').val());
			var na = $(this).attr("data-name");
			if(cn == ""){
				if(cname!=""){
					cname+=",";
				}
				cname+=na;
			}
			if(pn == ""){
				if(pname!=""){
					pname+=",";
				}
				pname+=na;
			}
			if($('.getShowname').val()==0 && sn==""){
				if(Showname!=""){
					Showname+=",";
				}
				Showname+=na;
			}
		});
		if($('.costcenter_hidden').val()=="1" && cname!=""){
			layer.msg(cname + "请选择成本中心");
			return;
		}
		if($('.projectinfo_hidden').val()=="1" && pname!=""){
			layer.msg(pname + (($('.getShowname').val()=="0")?"请输入SHOWNAME":"请选择项目中心"));
			return;
		}
		if($('.getShowname').val()=="0" && Showname!=""){
			layer.msg(pname + "请输入SHOWCODE");
			return;
		}
	}
	if($.trim($(".isWei").val()) == 1 && !($(".w-reason-select").is("select"))){
		layer.msg("请在后台维护超标原因，该订单暂不能提交");
		return;
	}
	$(".e-p-model").each(function(){
		var this_ = $(this),
			certtype = this_.attr("data-certtype"),
			birthday = "",
			cert = this_.attr("data-certno");
		$.each(dateArr,function(index,item){
			if(item != ""){
				var date = item.split("-");
				if(childrenFlag){
					childrenFlag = IsBirthday({
						certtype: certtype,
						birthday: birthday,
						cert: cert,
						date: (new Date(date[0],date[1]-1,date[2])).getTime()
					});
				}
			}
		});
	});
	if(!childrenFlag){
		layer.msg("系统暂不支持为12周岁以下乘客预订儿童票，如需预订请联系客服热线：400-606-0011");
		return;
	}
	//判断12周岁以下不能订票
	//para，certtype:证件类型;cert: 证件号,birthday:生日,date,今天日期
	function IsBirthday(para){
		var type = para.certtype == 1 ? 1 : (para.certtype == 'B' ? 'B' : '');
		if(type == ""){
			return true;
		}
		if(type == 1){
			var Year = Number(para.cert.slice(6,10))+12;
			var Month = para.cert.slice(10,12);
			var day = para.cert.slice(12,14);
			var epdata = (new Date(Year,Month-1,day)).getTime();
			if((para.date-epdata) < 0){
				return false;
			}
			return true;
		}
		if(type == 'B'){
			if(para.birthday == ''){
				return true;
			}
			var Year = Number(para.birthday.slice(0,4))+12;
			var Month = para.birthday.slice(4,6);
			var day = para.birthday.slice(6);
			var epdata = (new Date(Year,Month-1,day)).getTime();
			if((para.date-epdata) < 0){
				return false;
			}
			return true;
		}
	}
	//验证余票量
	function ExcessTicketNum(obj){
		var nowNums = parseFloat(obj.nowNums), //当前数量
			actualNums = obj.nums; //实际需要数量
		if(!isNaN(nowNums)){
			if(nowNums<actualNums){
				numFlag=false;
				tipsNum+="您预订的"+obj.line+"航班价格仅剩"+nowNums+"张票，选择人数不能大于票数<br/>";
			}
		}
	}
	(function(arr){
		if(toNum=="" || backNum==""){
			layer.msg("余票量查询异常，刷新重试！");
			return;
		}
		for(var i = 0;i<xingcheng;i++){
			ExcessTicketNum({
				nowNums:arr[i].num,
				nums:nums,
				line:arr[i].tip
			});
		}
	})([{num:toNum,tip:"去程"},{num:backNum,tip:"返程"}]);
	if(!numFlag){
		layer.msg(tipsNum);
		return;
	}
	$(".user_centro").each(function(){
		if($(this).val()=="" || $(this).val() == undefined){
			numFlag=false;
			return false;
		}
	});
	if(!numFlag){
		layer.msg("证件号码不能为空！");
		return;
	}
	if($(".e-p-bx").is(".e-bx-nessary")){
		$(".e-p-bx input").each(function(){
			if($(this).prop("checked")){
				numFlag=false;
				return;
			}
		});
		if(numFlag){
			layer.msg("请选择保险");
			return;
		}
	}
	var flag=volidateNoBlank();
	if(!flag){
		return;
	}
	
	voliateNames(); //验证英文名是否符合
	function voliateNames(){
		var ids = "",
			cid = $.trim($(".cid").val()),
			types = "",
			passType = "";
		$(".e-p-model").each(function(){
			var this_ = $(this);
			ids += $.trim(this_.find(".e-id").val()) + "-";
			types += $.trim(this_.find(".e-certtype").val()) + "-";
			passType += $.trim(this_.attr("data-passtype")) + "-";
		});
		if(outerData!=""||outerData!=null) {
			submitHanle();
		}else{
			$.ajax({
				type: "POST",
				url:"/air/validForm",
				data:{ids:ids,cid:cid,types:types,passType:passType},
				success: function(data) {
					// console.log(data);
					if(data.status === 200){
						submitHanle();
						return;
					}
					if(data.status === 300){
						layer.alert(data.msg);
						return;
					}
				},
				error:function(XMLHttpRequest,status){
					console.log(XMLHttpRequest);
				}
			});
		}
		
	}
});

//提交前验证必填项
function volidateNoBlank(){
	var flag=true;//验证标识
	//验证未通过，弹窗提示；
	function tips(data){
		zh.alerts({
			title:"提示",
			text: data
		});
		flag=false;
		return false;
	}
	$(".volidate-input").each(function(){
		var this_=$(this);
		this_.attr("ignore")!="ignore" && (this_.val()=="") && tips(this_.attr("nullmsg"));
		if(!flag){
			return false;
		}
	});
	return flag;
}




//提交前处理
function submitHanle(this_){
	//验价主函数
	function volidatePrice(){
		idsObj=getIds(); //获取id组
		loadingCommon();
		ajaxVolidate(idsObj);//调用接口，验价
	}
	
	//获取常用联系人id，员工id
	function getIds(){
		var empIds="",
			comIds="";
		$(".e-p-model").each(function(){
			var this_=$(this);
				id=this_.attr("data-id"),
				passtype=this_.attr("data-passtype");
			passtype==1 && (empIds += id+"-");
			passtype==0 && (comIds += id+"-");
		});
		return {
			empIds:empIds,
			comIds:comIds
		};
	}
	
	//验价,重复订单请求主函数
	function ajaxVolidate(para){
		//抛出错误弹窗
		function errors(formation){
			loadingCommon();
    		zh.alerts({
				title:"提示",
				text: formation.msg
			});
    		return false;
    	}
		//舱位售完提示
		function cabinSaleOver(){
			loadingCommon();
			var confirm=new Confirm({
				text:"该舱位已售完，请重新查询",
				arr:["重新查询","取消"],
				confirmCallback:hrefSuccess
				//cancelCallback:hrefFiled
			});
			//重新查询跳转主函数
			function hrefSuccess(){
				loadingCommon();
				location.href='/air/againQuery';
			}
			return false;
		}
		//验价失败
		function volidatePriceFail(vdata){
			loadingCommon();
			var data=JSON.parse(vdata.data),
				text=(data.rtm===undefined ? "" : "去程：")+data.owm+(data.rtm===undefined ? "" : "<br />"+data.rtm),
				confirm=new Confirm({
					text:text,
					arr:["重新查询","继续提交"],
					height:"256px",
					confirmCallback:hrefSuccess,
					cancelCallback:hrefFiled
				});
			//success
			function hrefSuccess(){ //重新查询，直接跳转
				loadingCommon();
				location.href='/air/againQuery';
			}
			//fail
			function hrefFiled(para){ //继续提交，将价格传到后台
				loadingCommon();
				$.ajax({
			        type: "POST",
			        url:"/air/confirmPrice",
			        data:{owprice:data.ow,rtprice:data.rt},
			        success: function(data) {
			        	if(data.status===200){
			        		submitMain();
			        		return;
			        	}
			        	loadingCommon();
			        	var confirm=new Confirm({
							text:data.msg,
							arr:["重新查询","取消"],
							confirmCallback:hrefSuccess
							//cancelCallback:hrefFiled
						});
						function hrefSuccess(){
							loadingCommon();
							location.href='/air/againQuery';
						}
			        },
			        error:function(XMLHttpRequest,status){
			        	console.log(XMLHttpRequest);
			        }
			    });
			}
		}
		//重复订单
		function repeatOrder(rdata){
			loadingCommon();
			var data=JSON.parse(rdata.data),
				confirm=new Confirm({
					text:data.length>1 ? "去程："+data[0]+"<br />返程："+data[1] : data[0],
					arr:["仍要预订","考虑一下"],
					height:"256px",
					confirmCallback:hrefSuccess
					//cancelCallback:hrefFiled
				});
			function hrefSuccess(){
				loadingCommon();
				submitMain();
			}
		}
		var outerData = interface.getOuterInterface();
		if (outerData == null || outerData.bookFlag == 1 || outerData.bookFlag == 2){
			//发起请求
			$.ajax({
				type: "POST",
				url:"/air/getRepatRoute",
				data:{empids:para.empIds,linshi:para.comIds},
				success: function(data) {
					switch(data.status){
						case 200 : submitMain();break;
						case 300 :
						case 500 : errors({msg:data.msg,status:data.status});break;//300请求参数异常,500服务器内部错误
						case 407 : repeatOrder(data);break;//407验证重复订单
						case 408 : volidatePriceFail(data);break; //验价失败
						case 409 : cabinSaleOver();break; //舱位售完
						default :  flag=false;
					}
				},
				error:function(XMLHttpRequest,status){
					return errors({msg:XMLHttpRequest,status:status});
				}
			});
		}else{
			submitMain();
			loadingCommon();
		}
	}
	
	//验价
	return volidatePrice();
}

//订单提交
function submitMain(){
	//相似订单验证
	var ids="";
	$(".e-p-model").each(function(){
		var this_=$(this);
		ids+=this_.attr("data-id")+"-"
		
	});
	var firstFromDate =$('.firstFromDate').val(),
		firstArriveDate=$('.firstArriveDate').val(),
		secondFromDate=$('.secondFromDate').val(),
		secondArriveDate=$('.secondArriveDate').val();
	$.ajax({
		url:"/air/checksimple", //相似订单验证
		type:"post",
		data:{ ids: ids,firstFromDate:firstFromDate,firstArriveDate:firstArriveDate,secondFromDate:secondFromDate,secondArriveDate:secondArriveDate},
		success:function(data){
			if(data.status==200){
				$("#createForm").submit();
			}else if(data.status==201){
				/*
				* confirm=new Confirm({
				 text:data.length>1 ? "去程："+data[0]+"<br />返程："+data[1] : data[0],
				 arr:["继续提交","取消"],
				 height:"256px",
				 confirmCallback:hrefSuccess
				 //cancelCallback:hrefFiled
				 });*/
				// var isls=125;
				// if(data.data.length>60){
				// 	isls=125*2;
				// }
				loadingCommon();
				var confirm=new Confirm({
					text: data.data,
					arr:["仍要预订","考虑一下"],
					confirmCallback:submitLiet
				},"125px");
				function submitLiet(){
					$("#createForm").submit();
				}
				// $("body").on("click",".confirm_sure",function(){
				//
				// });
			}else{
				$("#createForm").submit();
			}
		},
		error:function(){
		
		}
	});

}

//保险说明
//开启
$("body").on("click",".e-p-xianClass",insuranceIns);
//关闭
$("body").on("click",".bx_model_close",closeInsrance);
//保险说明主函数
function insuranceIns(){
	$(".bx-illu-c").html("");
	var companyid = $(".cid").val(),
		baoxianid = $(this).parents(".e-bx-parent").find("input").val();
	if(baoxianid == ""){
		zh.alerts({
			title:"提示",
			text: "获取保险说明失败（b）！"
		});
		return;
	}
	if(companyid == ""){
		zh.alerts({
			title:"提示",
			text: "获取保险说明失败（c）！"
		});
		return;
	}
	$.ajax({
        type: "POST",
        url:"/air/baoxian/describe",
        data:{
        	companyid:companyid,
        	baoxianid:baoxianid
        },
        success: function(data) {
        	if(data.status===200){
        		var data = JSON.parse(data.data).newDescrible;
        		$(".bx-illu-c").html(data);
        		$(".bx-model-shadow").show();
        		$(".bx-model-show").show();

        	}else{
        		zh.alerts({
    				title:"提示",
    				text: data.msg
    			});
        	}
        },
        error:function(XMLHttpRequest,status){
        	zh.alerts({
				title:"提示",
				text: data.msg+"("+data.status+")!"
			});
        }
    });
}
//关闭保险
function closeInsrance(){
	$(".bx-model-shadow").hide();
	$(".bx-model-show").hide();
}
(function(){
	$(".bx-model-shadow").css("height",$(document).height()+"px");
})();


//差旅政策的调取
function removeWbei(){
	var airpolicy=new AirPolicy();
	var distance = $(".air-licheng").val();
	$(".e-p-model").each(function () {
		var level = $(this).attr("data-level");
		airpolicy.ajaxAirPolicy({
			level:level,
			distance:distance
		});
	})
}
function inform() {

var email =data.mobile;
var phone = data.email ;
var options = $("._select_").children();
if(email != "" && phone != ""){
    options.eq(1).prop("selected", "selected");
   return;
}
if(email == "" && phone == ""){
    options.each(function(){
        $(this).prop("disabled", "disabled");
    });
    return;
}
if(email == ""){
    options.eq(3).prop("selected", "selected");
    options.eq(2).prop("disabled", "disabled");
}else{
    options.eq(2).prop("selected", "selected");
    options.eq(3).prop("disabled", "disabled");
}}



// //复选框 发送短信和邮件
// $("body").on("click",".label",function(){
// 	 ;
// 	var this_=$(this),
// 		this_input = this_.find("input");
// 	if(this_.is(".label-checkbox")){
// 		console.log(this_input.val()==0,this_input.val()==1,this_input.prop("checked"));
// 		if(!(this_input.val()==0)){
// 			this_input.val("1");
// 		}
// 		if(!(this_input.val()==1)){
// 			this_input.val("0");
// 		}
// 		this_input.prop("checked",!(this_input.prop("checked")));
// 		this_input.prop("checked")===true ? this_.addClass("label-select-checkbox") : this_.removeClass("label-select-checkbox");
// 		return;
// 	}
// });


//	联系人的短信和邮箱
$("body").on("keyup",'input[name="airOrder.linkPhone"]',function(){
	if(isPhoneSimp($(this).val())){
		$('input[name="airOrder.isSend"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
		$('input[name="airOrder.isSend"]').val(1);
	}else{
		$('input[name="airOrder.isSend"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
		$('input[name="airOrder.isSend"]').val(0);
	}
});
//联系人的短信和邮箱
$("body").on("keyup",'input[name="airOrder.linkEmail"]',function(){
	if(isEmail($(this).val())){
		$('input[name="airOrder.isSendEmail"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
		$('input[name="airOrder.isSendEmail"]').val(1);
	}else{
		$('input[name="airOrder.isSendEmail"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
		$('input[name="airOrder.isSendEmail"]').val(0);
	}
});



//经停

$(".hover_control_jt").hover(function(e){
        jingting({airline:$(this).attr("data-shiji"),date:$(this).find(".air-form-date").val()},$(this));
       $(this).find('.hidedg').show();
        // is_jt_show = true;
},function(){
	$(this).find('.hidedg').hide();
});
// $("body").on(" mouseleave",".hover_control_jt",function(e){
// 	// if (one) {
// 	// 	jingting({airline:$(this).attr("data-shiji"),date:$(".air-form-date").val()});
// 		 // one = false;
// 	// }
//	
// });

function jingting(data,obj){
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
        		fullData(data_,obj);
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
	function fullData(dataArr,obj){
//		console.log(dataArr);
		var list="";
		/*$.each(dataArr,function(index,item){
			var orgcode=item.orgcode,
				depttime=item.depttime.split(" ")[1],
				arritime=item.arritime.split(" ")[1];
			list+='<div class="jt_xinxi jt_xinxi_t">经停机场：'+item.orgcode+'</div>'+
				  '<div class="jt_xinxi jt_bottom_12">经停时间：'+depttime+'-'+arritime+'</div>';
			
		});*/
		list+='<div class="jt_container hide-jt" >'+
			'<div class="jt_xinxi jt_xinxi_t jt_bottom_12">经停机场：'+dataArr.airstop+'</div>'+
		  '<div class="jt_xinxi jt_bottom_12">到达时间：'+dataArr.arrivetime+'</div>'+
		  '<div class="jt_xinxi jt_bottom_12">起飞时间：'+dataArr.flighttime+'</div>'+ '</div>';
		obj.find(".hidedg").html(list);
	}

}

//	 运行时长的转换
//		初始化时间转换
timerRun();
function timerRun(){
	$('.timer_run_').each(function(){
		var val = $.trim($(this).data('timer'));
		$(this).html(runTimer(val));
	})
}
function runTimer(val){
	var list= val.split(":");
	var html = '';
	html = list[0]+"小时"+list[1]+"分";
	return html;
}

