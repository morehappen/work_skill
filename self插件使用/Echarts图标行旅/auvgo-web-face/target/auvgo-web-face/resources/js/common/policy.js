

//差旅政策
function Policy(){
	this.ajaxPolicy=function(para,policyShow,policy){ //参数为cid和level ，回调函数，差旅政策实例
		if(para.cid==="" || para.level===""){
			zh.alerts({
				title:"提示",
				text: '差旅政策请求失败(para)'
			});
			return;
		}
		$.ajax({
            type: "POST",
            url:'/mytravel',
            data:{
            	companyid:para.cid,
            	level:para.level
            },
            success: function(data) {
            	if(data.status===200){
            		$(".showChailv").show();
        			$(".tipsChailv").hide();
            		policyShow(data,policy);
            	}
            	if(data.status===202){
            		$(".showChailv").hide();
        			$(".tipsChailv").show();
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
	};
	this.policyShut=function(data,policy){ //是否开启了差旅政策
		var airPolicy=JSON.parse(data.airPolicy), //机票差旅政策
			trainPolicy=JSON.parse(data.trainPolicy), //火车票差旅政策
			hotelPolicy=JSON.parse(data.hotelPolicy);	//酒店差旅政策
		if(airPolicy===201){
			$(".board-cantainer").hide();
			$(".board-air").remove();
			return;
		}
		policy.airShowPolicy(airPolicy);
		policy.trainShowPolicy(trainPolicy);
		policy.hotelShowPolicy(hotelPolicy);
		$("a[data-flag='crm']").parents(".tab").removeClass("hide");
	};
	this.airShowPolicy=function(data){
		if(data===2021){ //判断是否设置了差旅政策
			var setText="";
			$(".board-air").remove();
			chailvSearch();
			return;
		}
		if(data===202){ //判断是否设置了差旅政策
			var setText="";
			$(".board-air").remove();
			chailvSearch();
			return;
		}
		var policyText=''; //差旅标准语句
		// $(".board-air").show();
		$.each(data.policyAir,function(index,item){
			elichengPolicy(item);
		});
		chailvSearch();
		
		
		
		function elichengPolicy(data){
			//已设置差旅政策，执行下列语句
			var	startmile=data.startmile,//起始里程数
				endmile=data.endmile, //终止里程数
				allowfly=data.allowfly, //是否允许乘坐飞机
				cabinlimit=data.cabinlimit, //是否设置了折扣
				cabinzhekou=data.cabinzhekou, //折扣
				flightlimit=data.flightlimit, //最低价限制
				flightlowtype=data.flightlowtype, //何种最低价，0航班最低价，1全天最低价，2前后n小时
				flighthour=data.flighthour,  //前后几小时
				allowbefore=data.allowbefore, //提前几天预订
				beforeday=data.beforeday, //提前天数
				allowc=data.allowc, //是否允许飞
				epolicy="", //每条差旅政策
				cabinText = ""; //折扣具体表现方式
			policyText+="<p>"+startmile+"公里至"+endmile+"公里：</p>";
			if(allowc=="1"){
				if(allowfly===1){
					epolicy+="允许乘坐飞机；";
				}else{
					epolicy+="不允许乘坐飞机；";
				}
				if(cabinlimit===1){
					if(cabinzhekou<100){
						cabinText = "经济舱" + cabinzhekou + "折；";
					}else if(cabinzhekou == 100){
						cabinText = "全价经济舱；";
					}else if(cabinzhekou == 120){
						cabinText = "公务舱；";
					}else{
						cabinText = "头等舱；";
					}
					epolicy+="不得高于" + cabinText;
				}
				if(flightlimit===1){
					if(flightlowtype===0){
						epolicy+="预订航班最低价；";
					}
					if(flightlowtype===1){
						epolicy+="预订全天最低价；";
					}
					if(flightlowtype===2){
						epolicy+="预订前后"+flighthour+"小时最低价；";
					}
				}
				if(allowbefore===1){
					epolicy+="需提前"+beforeday+"天预订；";
				}
			}else{
				epolicy='不允许乘坐飞机；';
				$(".airController").val("0");
			}
			policyText+="<p>"+epolicy+"</p>";
		}
		
		$(".board-air .board-c").html(policyText);
	};
	this.trainShowPolicy=function(data){
		if(data===2021){ //判断是否设置了差旅政策
			var setText="";
			$('.board-train ').remove();
			return;
		}
		if(data===202){ //判断是否设置了差旅政策
			var setText="";
			$('.board-train ').remove();
			return;
		}
		var gaotie=data.gaotie.split("/"), //高铁席别
			donche=data.donche.split("/"), //动车席别
			pukuai=data.pukuai.split("/"), //普快席别
			gaotieText="", //高铁差旅标准语句
			dongcheText="", //动车差旅标准语句
			pukuaiText=""; //普快差旅标准语句
		//拼接席别
		function createSeat(seatArr){
			var seatList="";
			$.each(seatArr,function(index,item){
				if(item!=""){
					seatList+=trainSeat(item)+"、";
				}
			});
			if(seatList===""){
				return "暂无可乘坐席别";
			}
			if(seatList!==""){
				return seatList.slice(0,seatList.length-1);
			}
		}
		// $(".board-train").show();
		gaotieText=createSeat(gaotie); //高铁席别集
		dongcheText=createSeat(donche); //高铁席别集
		pukuaiText=createSeat(pukuai); //高铁席别集
		$(".gaotie-c").html(gaotieText);
		$(".dongche-c").html(dongcheText);
		$(".pukuai-c").html(pukuaiText);
	};
	this.hotelShowPolicy=function(data){
		var policy=data.policy, //酒店差旅政策
			citylevelname=(policy===null || policy === "" || data===202) ? "" : policy.citylevelname, //几线城市，中文集合
			price=(policy===null || policy === "" || data===202) ? "" : policy.price, //各线城市限制价格
			hotelText=""; //差旅政策描述
		if(data===202){ //判断是否设置了差旅政策
			$(".board-hotel").remove();
			return;
		}
		if(policy===null){ //判断某个职级是否设置了差旅政策
			$(".board-hotel").remove();
			return;
		}
		citylevelname=citylevelname.slice(0,citylevelname.length-1).split("/");
		price=price.slice(0,price.length-1).split("/");
		$.each(citylevelname,function(index,item){
			hotelText+="<p>"+item+"不得高于"+price[index]+"元/间夜</p>";
		});
		// $(".board-hotel").show();
		$(".board-hotel .board-c").html(hotelText);
	};
}
//席别转换
function trainSeat(code){
		var xibie="";
		switch(code){
			case "9": xibie="商务座";break;
			case "P": xibie="特等座";break;
			case "M": xibie="一等座";break;
			case "O": xibie="二等座";break;
			case "gws":
			case "6":xibie="高级软卧";break;
			case "rws":
			case "4": xibie="软卧";break;
			case "yws":
			case "ywx":
			case "3": xibie="硬卧";break;
			case "2": xibie="软座";break;
			case "1": xibie="硬座";break;
			case "wz": xibie="无座";break;
			default:"";
		}
		return xibie;
}

//差旅管理权限

function chailvLimit(){
	$.ajax({
        type: "POST",
		async: false,
        url:'/getChailvauth',
        success: function(data) {
        	if(data.status===200 || data.status===301 ){
        		Policy.prototype.quanxian=data.data;
        		initChailv();
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


function initChailv(){
	var cid=$("input[name='cid']").val(), //input->cid
	level=$("input[name='level']").val(), //input->level
	policy=new Policy(); //实例化差旅政策
	policy.ajaxPolicy({cid:cid,level:level},policyShow,policy); //请求差旅政策： 传入请求参数,回调函数，差旅政策实例对象
	//差旅政策入口
	function policyShow(data,policy){
		var policyData=JSON.parse(data.data);
		policy.policyShut(policyData,policy);
	}
}
function chailvSearch(){
	if(location.search){
		var isSearch = location.search.split('?flag=')[1];
		switch (isSearch){
			case "air":  if($('.board-air').length>0){$('.board-air').show();}else{$('.board-cantainer').hide();} break;
			case "hotel":break;
			case "train":break;
		}
	}else{
		if($('.board-air').length>0){$('.board-air').show();}else{$('.board-cantainer').hide();}
	}
}







