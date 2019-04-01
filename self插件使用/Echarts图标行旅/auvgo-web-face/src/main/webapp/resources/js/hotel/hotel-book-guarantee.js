/**
 * Created by dell on 2018/5/3.
 */
$(function(){
	//入住人悬浮框样式
	if(parseInt($(".gt-name").width())>450){
		// console.log("121223");overflow: hidden;
		$(".gt-occupant").css({'overflow':"hidden"});
		$('.gt-ps').hover(function () {
			$(".text-hover").css({"left":$('.gt-ps').width()+5,"display":"block"});
		},function(){
			$(".text-hover").css("display","none");
		});
	}
});



/**
 * card-number 信用卡号
 * vd-start    年
 * vd-end     月
 * cardholder-name  持卡人的姓名
 * document-type     证件的选择
 * certificates-number    证件号码
 *
 */

//输入框的正则验证
//信用卡号验证
CodeCompatibility('card-number',/^[0-9]{1,}$/g,/\D/g);
CodeCompatibility('vd-start',/^[0-9]{1,}$/g,/\D/g);
CodeCompatibility('vd-end',/^[0-9]{1,}$/g,/\D/g);
// CodeCompatibility('cardholder-name',/^[[\u4e00-\u9fa5]|\.|[a-z A-Z]]$/,new RegExp ("[`~!@#$^&*()=|{}':;',\\[\\] <>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]","g"));
// var reg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\] <>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
/*点击提交按钮时进行验证*/
$("body").on("click"," .btn-submit",function(){
	// console.log("click")
	var len = $('.card-box input' ).length;
	var input = $('.card-box input' );
	var resouts = [
		{test:'^[0-9]{1,}$',val:$("#card-number").val(),name:"信用卡号"},
		{test:'^[0-9]{1,}$',val:$("#vd-start").val(),name:"年"},
		{test:'^[0-9]{1,}$',val:$("#vd-end").val(),name:"月"},
		{test:"^[\\u4e00-\\u9fa5a-zA-Z\\d•.·.·▪•·▪.·]+$",val:$("#cardholder-name").val(),name:"持卡人姓名"},
		{test:'',val:$("#certificates-number").val(),name:'证件号'}
	]
	// console.log(resouts,$("#document-type").val());
	$("#card-number").val()
	var tests ;
	var arr =[] ;
	$.each(resouts,function(index,item){
		switch (index){
			case 0:tests = new RegExp(item.test);
				arr.push(tests.test(item.val));
				// console.log(tests.test(item.val))
				break;
			case 1:tests = new RegExp(item.test);
				arr.push(tests.test(item.val));
				break;
			case 2:tests =new RegExp(item.test) ;
				arr.push(tests.test(item.val));
				break;
			case 3:tests = new RegExp(item.test);
				// console.log(tests)
				arr.push(tests.test(item.val));
				break;
			case 4:switch ($("#document-type ").val()){
				case "Passport":tests = /^[A-Za-z0-9]{5,15}$/;
					arr.push(tests.test(item.val));
					break;
				case "IdentityCard":tests =/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
							arr.push(tests.test(item.val));
							break ;
				case "Other":tests = /\S/g;
							arr.push(tests.test(item.val));
							break ;
				case "":arr.push("type");
							break;
				default:;
			};
				break ;
			default :;
		}
	});
	// console.log(resouts[0].val);
	// console.log(arr);
	var ls =false;
	var index ;
	$.each(arr,function(ind,ite){
		if(ite==false||ite=="type"){
			if(ite=="type"){
				information(5);
			}else{
				index = ind;
				information(ind);
			}
			
			ls = true;
			return false;
		}
	});
	//提示信息
	function information(ind){
		// console.log(ind);
		switch (ind){
			case 0:layer.msg("请输入正确的信用卡号");break;
			case 1:layer.msg("请输入正确的年份");break;
			case 2:layer.msg("请输入正确的月份");break;
			case 3:layer.msg("请输入正确的持卡姓名");break;
			case 4:layer.msg("请输入正确的正确的证件号");break;
			case 5:layer.msg("请选择正确的证件类型");break;
			default:;
		}
		
	}
	// 132201966110510021
	// 信用卡号  5359180059451506   4895920308723971
	if(!ls){
		//禁止提交
		var _this = $(this);
		$(this).attr('disabled',"disabled");
		$.ajax({
			timeout: 3000,
			url:"/hotel/book/creditcard/"+resouts[0].val,
			type:"post",
			datatype:"json",
			beforeSend: function() {
				$(".cvv-box,.cvv-msg").css("display","block");
				$("body .cvv-msg").html("<p style='width:50px;height:50px;position:fixed;left:0;top:0;bottom:0;right:0;transform:translate(-50%,-50%);z-index:1000;margin:auto;'><img  src='/resources/js/plugin/layer/theme/default/loading-2.gif'/></p>").css("display","block");
			},
			success:function (json,textStatus) {
				var data = json.data;
				if(json.status==200){
					if(data.valid&&data.cvv){
						$('.cvv-content').css("display","block");
						$(".cvv-box").html('<div class="cvv-msg" ></div>'+'<div class="cvv-content" >'
							+'<h2 >输入卡验码 <span class="delete">X</span></h2>'
							+'<div class="cvv-input" style="">cvv <input type="text" id="cvv-val" lenght="3"  placeholder="请输入卡验码" ><br><button class="btn-default" type="button" id="cvv-btn" >确定</button></div>'
							+'</div>');
					}else if(data.valid&&!data.cvv){
						//成功表单提交
						if($("input[name='target']").val()=="pay"){
							_this.removeAttr('disabled');
							var form=document.getElementById("hotel-book-form");
							form.action="/hotel/order/doPay";
							form.submit();
						}else{
							_this.removeAttr('disabled');
							var form=document.getElementById("hotel-book-form");
							form.action="/hotel/book/create";
							form.submit();
						}
						
					}else if(json.status==200&&!data.valid){
						$("body .cvv-box,cvv-msg").html("").css("display","none");
						_this.removeAttr('disabled');
						layer.msg("该卡号无效，请更换卡号");
					}
				}else{
					$("body .cvv-box,cvv-msg").html("").css("display","none");
					_this.removeAttr('disabled');
					layer.msg(json.msg);
				}
			},
			error: function (textStatus) {
				$("body .cvv-box,cvv-msg").html("").css("display","none");
				_this.removeAttr('disabled');
				layer.msg("网络超时");
			},
			complete:function(XMLHttpRequest,status){
				_this.removeAttr('disabled');
				if(status=="err"){
					$("body .cvv-box,cvv-msg").html("").css("display","none");
					layer.msg("确保您的网络畅通，请稍后再试!");
				}
			}
		});
	};
});
//cvv验证
var cvvtest = /^[0-9]{1,3}$/;
$("body").on("click",".delete",function(){
	$(".btn-submit").removeAttr('disabled');
	$('.cvv-box,.cvv-msg,.cvv-content').css("display","none");
});
$('body').on("click",'#cvv-btn',function(){
	var cvvVal=$("#cvv-val").val();
	if(cvvtest.test(cvvVal)){
		//	卡验证正确
		$("body .cvv-box").html('<div class="cvv-msg" ></div>').css("display","none");
		$('.cvv-box,.cvv-msg').css("display","none");
		$(".btn-submit").removeAttr('disabled');
		$("#cvv-val-hidden").val(cvvVal);
		
		if($("input[name='target']").val()=="pay"){
			var form=document.getElementById("hotel-book-form");
			form.action="/hotel/order/doPay";
			$(this).prop("disabled", true);
			layer.msg('正在生成订单，请稍候', {icon: 16,time:5000000,shade:0.5});
			//屏蔽后退代码，导致火狐提交订单白屏
			form.submit();
		}else{
			var form=document.getElementById("hotel-book-form");
			form.action="/hotel/book/create";
			$(this).prop("disabled", true);
			layer.msg('正在生成订单，请稍候', {icon: 16,time:5000000,shade:0.5});
			//屏蔽后退代码，导致火狐提交订单白屏
			form.submit();
		}
	}else{
		layer.msg("请输入正确的卡验码");
	}
})




/*时间的插件*/
//年
var date = new Date();
var yearArry = [];
var arrs = [];
var monthArry=[];
var monthHtml = "";
var year = date.getFullYear();
var month =date.getMonth() + 1;
for(var i=0 ; i<12;i++){
	yearArry.push(parseInt(year)+i);
	monthArry.push(i+1);
};
var yearHtml ='<option>请选择</option>';
$.each(yearArry,function(index,item){
	yearHtml+='<option>'+item+'</option>'
	
});
$.each(monthArry,function (index,item) {
	if(item==month){
		arrs = monthArry.slice(index)
	}
});

$.each(arrs,function(index,item){
	monthHtml+='<option>'+item+'</option>';
});
$("#vd-start").html(yearHtml);
$("body").on('change','#vd-start',function(){
	monthHtml="<option>请选择</option>";
	var val = $("#vd-start").val();
	// console.log(monthArry,val)
	var idn ;
	if(val=="请选择"){
		arrs=[];
		$("#vd-end").html("");
	}else{
		switch (month){
			case monthArry[0]:idn=0;break;
			case monthArry[1]:idn=1;break;
			case monthArry[2]:idn=2;break;
			case monthArry[3]:idn=3;break;
			case monthArry[4]:idn=4;break;
			case monthArry[5]:idn=5;break;
			case monthArry[6]:idn=6;break;
			case monthArry[7]:idn=7;break;
			case monthArry[8]:idn=8;break;
			case monthArry[9]:idn=9;break;
			case monthArry[10]:idn=10;break;
			case monthArry[11]:idn=11;break;
			// case monthArry[12]:monthArry;idn=12;break;
		}
		if(val == year){
			arrs = monthArry.slice(idn);
			// console.log(arrs)
		}else{
			arrs = monthArry;
		}
		$.each(arrs,function(index,item){
			monthHtml+='<option>'+item+'</option>';
		})
		$("#vd-end").html(monthHtml);
	};
	
	
});




//输入时时验证
function CodeCompatibility(id,test,ls){
	var obj = document.getElementById(id);
	var listValue = test;
	if(obj.addEventListener){
		$("body ").on("input propertychange","#"+id,function(){
			var _this = $(this);
			listValue.test($(this).val());
			if(listValue.test($(this).val())){
				_this.val(_this.val());
			}else{
				$(this).val($(this).val().replace(ls,""));
				// layer.msg("请输入正确的字符")
			}
		});
	}else if(obj.attachEvent){
		obj.attachEvent("onfocus", pchange);
		obj.attachEvent("onblur", function(){
			obj.onpropertychange = null;
		});
	};
	function pchange(){
		obj.onpropertychange = function(){
			if(window.event.propertyName == "value"){
				var _this = window.event.srcElement;
				_this.blur();
				_this.focus();
				if(listValue.test(_this.value)){
					_this.value = _this.value;
				}else{
					_this.value = _this.value.replace(ls,'');
				};
			};
		};
	};
};

// console.log($('input[name="target"]').val());