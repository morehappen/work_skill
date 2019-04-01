jQuery.extend({  
    browser: function()   
    {  
    	var  
    	rwebkit = /(webkit)\/([\w.]+)/,  
    	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,  
    	rmsie = /(msie) ([\w.]+)/,  
    	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
        browser = {},  
        ua = window.navigator.userAgent,  
        browserMatch = uaMatch(ua,rwebkit,ropera,rmsie,rmozilla);
        if (browserMatch.browser) {  
            browser[browserMatch.browser] = true;  
            browser.msie = browserMatch.browser;  
            browser.version = browserMatch.version;  
        }
        return { browser: browser };  
    }
});  
function uaMatch(ua,rwebkit,ropera,rmsie,rmozilla){  
	ua = ua.toLowerCase();  
	var match = rwebkit.exec(ua)  
	               || ropera.exec(ua)  
	               || rmsie.exec(ua)  
	               || ua.indexOf("compatible") < 0 && rmozilla.exec(ua)  
	               || [];  
	 return {  
	      browser : match[1] || "",  
	      version : match[2] || "0"  
	  };  
}

/**
 * 城市自动补全
 */
$(function() {
	var item=document.getElementById('keyValue');
    var width=(item.offsetWidth+20)+"px";
    var oldkeyValue=item.value;
	$('body').on('click',"#keyValue",function () {
		$("#keyValue").autocomplete("/hotel/autoComplete", {
			delay : 300,//延迟500毫秒
			max : 25,//最多5条记录
			minChars :1,
			matchSubset : true,
			cacheLength : 20,
			matchContains : true,
			scrollHeight : 250,
			mustMatch : false,
			autoFill:false,
			width :width,
			extraParams: {geo:$("#geoCode").val()},
			dataType : 'json',
			parse : function(data) {
				var parsed = [];
				if(data.status==200 && data.data!=null && typeof(data.data)!="undefined"){
					for ( var i = 0; i <data.data.length; i++) {
						parsed[parsed.length] = {
						data : data.data[i],
						value : data.data[i].name,
						result : data.data[i].name
						};
					 }
				 }
				return parsed;
			},
			formatItem : function(item) {//显示下拉列表的内容
				return "<div class='ac_even_w'>" + item.name +"</div><div class='float-right'>"+(item.category==0?'酒店':item.category==3?'品牌':item.category==4?'行政区':item.category==5?'商圈':item.category==6?'<span >地点</span>':item.category==8?'医院':item.category==9?'学校':item.category==10?'景点':item.category==11?'地铁':item.category==12?'机场/车站':item.category==13?'集团':item.category==14?'景区':'')+"</div>";
			},
			formatMatch : function(item) {
				return item.category;
			},
			formatResult : function(item) {
				return item.category;
			}
			}).result(function(event, item, formatted) {//把返回的结果内容显示在其他文本框上
				  $("#queryType").val(item.category);
				  $("#propertiesId").val(item.propertiesId);
				  if(item.category!="0"){
						 $("#latitude").val(item.latitude);
						 $("#longitude").val(item.longitude);
				  }else{
					  cleanLatLog();
				  }
			if(item.category =="0"&& item.hotelNo !="" && item.hotelNo!=null){
				  	window.location.href="/hotel/detial/"+item.hotelNo+"?checkIn="+$('#checkIn').val()+"&checkOut="+$('#checkOut').val();
			}else if(verifyQuery()){
					  var form=document.forms[0];
					  form.action="/hotel/list";
					  form.submit();
				  }
			}).focus(function(){
				oldkeyValue=$("#keyValue").val();
				if($.trim($("#keyValue").val())==""){
					cleanValues();
				}
			}).blur(function(){
				if(oldkeyValue!=$("#keyValue").val()){
					cleanLatLog();
					$("#queryType").val("");
				}
				if($.trim($("#keyValue").val())==""){
					cleanLatLog();
					cleanValues();
				}
			});
	});
	  $("#firstQuery").click(function(){
		  if(verifyQuery()){
			  $("#query-form").attr('action',"/hotel/list");
			  $("#query-form").submit();
		  };
      });
});

function verifyQuery(){
	var $geo=$("#geoCode");
	var $checkIn=$("#checkIn");
	var $checkOut=$("#checkOut");
	if($geo.val()==""){
		$geo.focus();
		layer.tips("请选择城市","#geoName",{
			tips:2
		});
		return false;
	}
	if($checkIn.val()==""){
		$checkIn.focus();
		layer.tips("请选择入住日期","#checkIn",{
			tips:2
		});
		return false;
	}
	if($checkIn.val()==""){
		$checkOut.focus();
		layer.tips("请选择离店日期","#checkOut",{
			tips:1
		});
		return false;
	}
	return true;
}

/**
 * 清空页面经纬度
 */
function cleanLatLog(){
	$("#latitude").val("");
	$("#longitude").val("");
}

function cleanValues(){
	$("#keyValue").val("");
	$("#queryType").val("");
}
//酒店的点击事件
$("body").on("click",'.home-left-aircraft',function(){
	$(".home-left-aircraft").removeClass("aircraft-flie");
	$(this).addClass("aircraft-flie");
});





//酒店日期
/**
 * 日期检查
 * @param oneDay 入住日期 id
 * @param twoDay 离店日期 id
 * @param dayNum 离店日期在入住日期的基础上加几天
 * @param differNum 日期相隔天数
 */
function checkDate(oneDay, twoDay, dayNum, differNum){
	var CheckIn = $.trim(document.getElementById(oneDay).value);
	var CheckOut = $.trim(document.getElementById(twoDay).value);
	// 如果离店日期小于入住日期 离店日期为入住日期+dayNum天
	if(compareDate(CheckOut, CheckIn)){
		var nextDay = addDate(CheckIn, dayNum, "yyyy-MM-dd");
		$("#" + twoDay).val(nextDay);
	}
	var CheckOut = $.trim(document.getElementById(twoDay).value);
	if(dayDifferNum(CheckIn, CheckOut) > differNum){
		var nextDay = addDate(CheckIn, dayNum, "yyyy-MM-dd");
		$("#" + twoDay).val(nextDay);
		layer.msg("日期不能相差"+differNum+"天", {zIndex: 1961545621321});
	}
	// 酒店详情页更新入住天数
	typeof countNight == 'function' && countNight();
};


