/**
 * Created by dell on 2018/4/16.
 */

function bookTime(start,critical){
	(function(){
		// console.log(start,critical)
		var startRemainder = start%100;
		var criticalRemainder = critical%100;
		function compilation(start,critical,callback){
			start = parseInt(start/100);
			// critical = parseInt(critical/100)
			// console.log(start,critical)
			return callback(start,critical);
			// return {start:start,critical:critical,startRemainder:startRemainder,criticalRemainder:criticalRemainder}
		};
		// console.log(compilation(start,critical?parseInt(critical/100):undefined,dataObject))
		// var arrs = dataObject(parseInt(start),critical?parseInt(critical):undefined);
		var arrs = compilation(start,critical?parseInt(critical/100):undefined,dataObject) ;
		// var arr = [11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5,6];
		$.each(arrs,function(index,value){
			// console.log(value);
			var beforeDawn;
			// console.log(arrs[0].val);
			if(0<=parseInt(arrs[0].val) && parseInt(arrs[0].val)<=6){beforeDawn="凌晨"}else{beforeDawn="次日"};
			if(value.val==0){
				var oA = '<a href="javascript:;" id="time'+index+'" class="time'+index+'" value="'+index+'|'+value.bol+'|'+value.val+'">'+beforeDawn+'<div class="suspension-time-box"></div></a>';
			}else{
				var oA = '<a href="javascript:;" id="time'+index+'" class="time'+index+'" value="'+index+'|'+value.bol+'|'+value.val+'">'+value.val+':00<div class="suspension-time-box"></div></a>';
			};
			$('.box').append(oA);
		});
		var $a = $("#box a");
		parameters();
		// console.log(100/$a.length);
		$a.css({"display":"inline-block","width":100/$a.length+"%"});
		$a.on('click',function(){
			var ls =  $(this).context.className.split(' ')[0];
			//todo c向后端传递点击选中的时间
			var values=$("."+ls).attr('value').split('|');
			var value=values[2];
			var isfree=values[1];
			// console.log(c);
			$('#box a').removeClass("border-color-614dc2");
			$(this).addClass("border-color-614dc2");
			//担保费用显示 赋值
			var gtype=$("#guaranteeCost").val();
			var $latestCheckTime=$("#latestCheckTime");
			var $isGuarantee=$("#isGuarantee");
			if(isfree=="false"){
				$isGuarantee.val("true");
				var arr = new Array();  
				$(".dailyPrice").each(function(){
					arr.push($(this).attr("id"));  
					arr.sort(function(a, b){  
					    return a > b ? 1 : -1;  
					});  
				});
				var guarantee=0;
				if(gtype=="FirstNightCost"){
					guarantee=$("#"+arr[0]).attr("data-rate");
				}
				if(gtype=="FullNightCost"){
					$(".dailyPrice").each(function(index,el){
						guarantee=add($(el).attr("data-rate"),guarantee);
					});
				}
				$("#p_guarante").removeClass("hide");
				var $guaranteRule=$("#guaranteRule");
				var changeRule=$guaranteRule.attr("data-changeRule");
				var $roomNumber=$("input[name='roomCount']");
				var tge=guarantee*$roomNumber.val();
				if((tge+"").indexOf(".")<0){
					tge=tge+".0";
				}
				if($("#guaranteeType").val()!="FORCE"){
					$("#cancelRule").html('<span class="w-p-62 float-left">'+(changeRule=='NeedSomeDay'?'限时取消：':changeRule=='NoChange'?'不可取消：':'免费取消：')+'</span>  <div class="float-left font-size-12 w-p-246">'+$guaranteRule.attr("data-cancelRule")+'</div>');
					$("input[name='refundType']").val(changeRule);
					$("input[name='refundRule']").val($guaranteRule.attr("data-cancelRule"));
					$("#guaranteeType").val($guaranteRule.attr("data-guaranteeType"));
				}
				
				$("#guaranteeRoomUnit").html(tge)
				$("#span_guarantee").html(tge);
				$("#guaranteeRate").val(tge);
			}else{
				$isGuarantee.val("false");
				var refundType=$("#refund_type_i").val();
				var refundRule=$("#refund_rule_i").val();
				$("#guaranteeType").val("");
				$("#span_guarantee").html("0.0");
				$("#guaranteeRate").val("0.0");
				$("#p_guarante").addClass("hide");
				$("input[name='refundType']").val(refundType);
				$("input[name='refundRule']").val(refundRule);
				$("#cancelRule").html('<span class="w-p-62 float-left">'+(refundType=='NeedSomeDay'?'限时取消：':refundType=='NoChange'?'不可取消：':'免费取消:')+'</span> <div class="float-left font-size-12 w-p-246">'+refundRule+'</div> ');
			}
			$latestCheckTime.val(value+":00");
		});
		
		// 接收页面上传过来的参数  计算位移  计算时间
		function parameters(){
			var ind,indgs,d;
			var $a = $("#box a");
			//上一步选中
			var selectValue=$("#latestCheckTime").val();
			if(selectValue!=""){
				selectValue=selectValue.replace(":00","");
			}
			$a.each(function(index,value){
				var ls =  $(this).context.className;
				var c = $("."+ls).attr('value');
				var values=c.split('|');
				if(values[1] == "true"){
					$(this).addClass('color-614dc2');
					ind = index;
				};
				if(values[2]==18){indgs=index};
				if(selectValue!="" && selectValue!=parseInt(critical/100)){
					if(selectValue==values[2]){
						d=values[0];
					}
				}
			});
			if(critical){//默认选中
				if($("#guaranteeType").val()=="FORCE"){
					$('.time'+2).addClass('border-color-614dc2');
					selectCheckTime(2);
				}else{
					$('.time'+ind).addClass('border-color-614dc2');
					selectCheckTime(ind);
				}
			}else{
				if(selectValue!=""){//返回上一步选中
					$('.time'+d).addClass('border-color-614dc2');
					selectCheckTime(d);
				}else{
					if(parseInt(start/100)<=18&&parseInt(start/100)>6){
						selectCheckTime(indgs);
						$('.time'+indgs).addClass('border-color-614dc2');
					}else{
						selectCheckTime(2);
						$('.time'+2).addClass('border-color-614dc2');
					}
				}
			}
			
			/**
			 * 悬浮框的样式
			 */
			$('#box a').hover(function(){
				var startTime=$("#startTime").val();
				// console.log(ind==_thisIndex)
				if(startTime!="" && startTime.length>0){
					var value=$(this).attr("value").split('|');
					var _thisIndex = $(this).attr("value").split('|')[0]
					// console.log(ind==_thisIndex)
					var $alinkbox=$(this).children(".suspension-time-box");
					// console.log($alinkbox)
					var gtype=$("#guaranteeCost").val();
					var beforeDawn="";
					if(0<=parseInt(arrs[0].val) && parseInt(arrs[0].val)<=6){beforeDawn="凌晨"}else{if(0<=parseInt(value[2]) && parseInt(value[2])<=6){beforeDawn="次日"}};
					if(value[1]=="true"){
						$alinkbox.html(beforeDawn+(parseInt(critical/100)+":"+(criticalRemainder==0?"00":criticalRemainder))+"之前无需担保");
					}else{
						// $alinkbox.html(parseInt(critical/100)+":00之后担保"+(gtype=="FirstNightCost"?"首晚":"全额")+"房费");
						$alinkbox.html(parseInt(critical/100)+":"+(criticalRemainder==0?"00":criticalRemainder)+"之后担保"+(gtype=="FirstNightCost"?"首晚":"全额")+"房费")
					}
					
					$alinkbox.css("display","block")
				}
			},function(){
				$(this).children(".suspension-time-box").css("display","none")
			})
		};
	})();
}

function selectCheckTime(index){
	if($("#latestCheckTime").val()=="" && $('.time'+index).attr("value")!=null){
		var values=$('.time'+index).attr("value").split('|');
		$("#latestCheckTime").val(values[2]+":00");
	}
}

//todo 时间计算数组 a初始的时间 id担保的临界值
function dataObject(a,id){
	// console.log(id)
	var arr  = [];
	if(a>=0&&a<=6){
		var len = 7-parseInt(a);
		// 0 1 2 3 4 5 6
	}else{
		var len = 23-parseInt(a)+8;
	};
	
	//当a初始值为次日时间时
	//当不传临界值时 id 全部不需要担保(字体颜色全部为紫色)
	// console.log(id,(typeof id))
	if(id==undefined){
		var id=id ? id :18;
		// console.log(len,"ssss");
		if(a>=0 && a<=6 || id==18){
			noGuarantee(a,id,arr,len);
			$('#parameter').css({'display':'none'});
		};
		//id担保的临界值
	}else if(a>=0&&a<=6){
		if(id>=0&&id<=6){guarantee(a,id,arr,len);}else{critical(a,id,arr,len);};
		
		// $('#parameter').css({'display':'none'});
	}else if(id>=a && id<=23){
		guarantee(a,id,arr,len);
	}else if(a>id && id<23){
		if(id>=0 && id<=6){
			critical(a,id,arr,len)
			// console.log("1")
			// guarantee(a,id,arr,len);
			// $('#parameter').css({'display':'none'});
		}else{
			guarantee(a,id,arr,len);
			// $('#parameter').css({'display':'none'});
		}
		
	};
	return arr;
};
// console.log(dataObject(11,18))
//todo 样式的控制 需要担保的样式;
function guarantee(a,id,arr,len){
	// console.log(arr);
	var roust ={};
	if(a>=0&&a<=6 && id>=0&&id<=6){
		if(a>id){
			roust.val=a;
			roust.bol=false;
			arr.push(roust);
			a++;
			guarantee(a,id,arr,len);
		}
		if(a<id){
			roust.val=a;
			roust.bol=true;
			arr.push(roust);
			a++;
			guarantee(a,id,arr,len);
		}
	}
	if(a>=0&&a<=6 && id>6&&id<=23){
		switch(a){
			case 0:roust.val =0,roust.bol = false ;break;
			case 1:roust.val=1, roust.bol = false ;break;
			case 2:roust.val=2,roust.bol = false; break;
			case 3:roust.val=3,roust.bol = false;break;
			case 4:roust.val=4,roust.bol = false;break;
			case 5:roust.val=5,roust.bol = false;break;
			case 6:roust.val=6,roust.bol = false;break;
			default : roust.val=a;
		};
		arr.push(roust);
		a++;
		guarantee(a,id,arr,len);
	}else{
		if(arr.length<len){
			if(a<=id){
				roust.val = a;
				roust.bol = true;
				arr.push(roust);
				a++;
				guarantee(a,id,arr,len);
			};
			if(a>id && arr.length<len && id>6&&id<=23){
				if(a>23){
					switchFalse(a,roust);
					arr.push(roust);
					a++;
					guarantee(a,id,arr,len);
				};
				if(a>id && a<=23 && arr.length<len){
					roust.val = a;
					// console.log(a);
					roust.bol = false;
					arr.push(roust);
					a++;
					guarantee(a,id,arr,len);
				};
			};
		};
	};
};
// todo 当控制一样的样式时 不需要担保的样式;
function noGuarantee(a,id,arr,len){
	// console.log(arr);
	var roust ={};
	if(arr.length<len){
		if(a<=id){
			roust.val = a;
			roust.bol = true;
			arr.push(roust);
			a++;
			noGuarantee(a,id,arr,len);
			// console.log(a)
		};
		if(a>id && arr.length<len){
			if(a>23 || id<=6&&id>=0){
				switchTrue(a,roust);
				arr.push(roust);
				a++;
				noGuarantee(a,id,arr,len);
			};
			if(a>id && a<=23 && arr.length<len){
				roust.val = a;
				// console.log(a);
				roust.bol = true;
				arr.push(roust);
				a++;
				noGuarantee(a,id,arr,len);
			};
		};
	};
};

/*id 临界值的判断*/
function critical(a,id,arr,len){
	// console.log(a)
		var roust ={};
		if(arr.length<len){
			//&&a>=0&&a<=6&&id>6&&id<23       当a>=0 && a<=6时 待定看id传入的时间是前一天还是当天时间
			if(a<=id&&a>=0&&a<=6&&id>6&&id<23){
				roust.val = a;
				roust.bol =false;
				arr.push(roust);
				a++;
				critical(a,id,arr,len);
				// console.log(a)
			};
			if(a>id && a<=23 && arr.length<len){
				roust.val = a;
				// console.log(a);
				roust.bol = true;
				arr.push(roust);
				a++;
				critical(a,id,arr,len);
			};
			if(id<=6&&arr.length<len){
				if(a>23 || id<=6){
					if(id<=6&&id>=0){
						switchTrue(a,roust);
					}
					if(id<0){
						switchFalse(a,roust);
					}
					arr.push(roust);
					a++;
					id--;
					// console.log(id)
					critical(a,id,arr,len);
				};
				
			};
		};
}

function switchFalse(a,roust){
	switch(a){
		case 24:roust.val =0,roust.bol = false ;break;
		case 25:roust.val=1, roust.bol = false ;break;
		case 26:roust.val=2,roust.bol = false; break;
		case 27:roust.val=3,roust.bol = false;break;
		case 28:roust.val=4,roust.bol = false;break;
		case 29:roust.val=5,roust.bol = false;break;
		case 30:roust.val=6,roust.bol = false;break;
		default : roust.val=a;
	};
	return roust
}

function switchTrue(a,roust){
	switch(a){
		case 24:roust.val =0,roust.bol = true ;break;
		case 25:roust.val=1, roust.bol = true ;break;
		case 26:roust.val=2,roust.bol = true; break;
		case 27:roust.val=3,roust.bol = true;break;
		case 28:roust.val=4,roust.bol = true;break;
		case 29:roust.val=5,roust.bol = true;break;
		case 30:roust.val=6,roust.bol = true;break;
		default : roust.val=a;
	};
	return roust
}