/***************单选复选按钮 start******************/
	$(".label-select-radio").each(function(){
		$(this).find("input").prop("checked",true);

	});
	$(".label-select-checkbox").each(function(){
		$(this).find("input").prop("checked",true);
	});
	$("body").on("click",".label",function(){
		var this_=$(this),
			this_input = this_.find("input");
		if(this_.is(".label-radio")){
			this_input.prop("checked",true);
			if(this_input.attr("name")!="" && this_input.attr("name")!=undefined){
				$("input[name='"+this_input.attr("name")+"']").prop("checked",false).parents(".label").removeClass("label-select-radio");
				this_input.prop("checked",true);
			}
			this_input.prop("checked")===true ? this_.addClass("label-select-radio") : this_.removeClass("label-select-radio");
			return;
		}
		if(this_.is(".label-checkbox")){
			if(this_.is('.show_choice_default')){
				this_input.val("0");
				return ;
			}
			this_input.prop("checked",!(this_input.prop("checked")));
			this_input.prop("checked")===true ? this_.addClass("label-select-checkbox") : this_.removeClass("label-select-checkbox");
			if(this_input.attr('data-is')=="isSend-isSendEmail"){
				if(this_.is('.show_choice_default')){
					this_input.val("0");
					return ;
				}else{
					if(this_input.val()==0){
						this_input.val("1");
					}else{
						this_input.val("0");
					}
				}
				
			}
			return;
		}
		
	});
	
//	初始化短信和邮箱
$('.user_email').each(function(index){
	if(!(isEmail($(this).val()))){
		$(this).parents('.e-p-model').find('.email_isSendEmail').addClass('show_choice_default').removeClass('label-select-checkbox');
		$('input[name="airUser['+index+'].isSendEmail"]').val(0);
	}
	
});
$('.user_mobile').each(function(index){
	if(!(isPhoneSimp($(this).val()))){
		$(this).parents('.e-p-model').find('.mobile_isSend').addClass('show_choice_default').removeClass('label-select-checkbox');
		$('input[name="airUser['+index+'].isSend"]').val(0);
	}
	
});
/*****************单选复选按钮 end*********************/

/************** Custom drop menu Start ****************/
//下拉主函数
function SelectMain(){

	this.initialize=function(){
		$("._select_").each(function(){
			(new SelectMain()).creatSelect($(this));
		});
	};
	this.creatSelect=function(this_){
		SelectMain.prototype.selectFlag !== "ok" ? (new SelectMain()).event_() : ""; //初始化一次事件绑定
		var this_first_option=this_.find("option:first");
		this_.val($.trim(this_.attr("data-value"))).after("<div class='drop'></div>").addClass("_dropDown_").appendTo(this_.next()).after("<div class='drop_title'>"+this_.children("option[value='"+this_.val()+"']").html()+"</div>").next().after("<ul class='drop_option'></ul>");
		this_.children().each(function(){
			this_.parents(".drop").find(".drop_option").append("<li data-values='"+$(this).val()+"'>"+$(this).html()+"</li>");
		});
	};
	this.event_=function(){
		SelectMain.prototype.selectFlag = "ok";
		//drop shut
		$("body").on("click",".drop_title",function(event){
			// var disableds = $(this).siblings('._select_').attr('data-disableds');
			event.stopPropagation();
			// // if(disableds=="disabled"){
			// 	return ;
			// }
			$(".drop_option").not($(this).next()).slideUp("fast");
			$(this).next().slideToggle("fast");
		});
		//close drop and fill data
		$("body").on("click",".drop_option li",function(){
			$(this).parent().slideUp("fast").prev().html($(this).html());
			$(this).parents(".drop").find("select").val($(this).parents(".drop").find("option:nth-child("+($(this).index()+1)+")").val());
		});
		//click anywhere close drop
		$("body").on("click",function(){$(".drop_option").slideUp("fast");});
	};	
}
/****************Custom drop Menu End******************/

/*******************弹出窗口组件 start****************/
var zh={
	alerts:alerts,
    awares: awares,
	iframes:iframes,
	confirms:confirms
};

function alerts(configure){
	// 防止键盘的enter键多次触发弹窗bug
	$(window).keydown(function(event){
		if($('.alert_window').length > 0) return false;
	});
	(new AlertMain()).createAlert(configure);
	$(".alert_window").addClass('alert_main_');
	$(".alert_main_").find(".alert_content").append('<div class="alert_btn btn_group"><button type="button" class="btn btn-default btn alert_btn_fixed alert_close_ alert_event">确定</button></div>').find(".main_content").append(configure.text);
	if(configure.color=="1"){
		$(".alert_mengceng").addClass("alert_mc_transparent");
	}
	
	$(".alert_main_").show();
	$("body").addClass("scroll-hide");
}

function  awares(configure){
    // 防止键盘的enter键多次触发弹窗bug
    $(window).keydown(function(event){
        if($('.alert_window').length > 0) return false;
    });
    (new AlertMain()).createAlert(configure);
    $(".alert_window").addClass('alert_main_');
    $(".alert_main_").find(".alert_content").append('<div class="alert_btn btn_group"><button type="button" class="btn btn-default btn alert_btn_fixed alert_close_ alert_event" id="knows">知道了</button></div>').find(".main_content").append(configure.text);
    if(configure.color=="1"){
        $(".alert_mengceng").addClass("alert_mc_transparent");
    }

    $(".alert_main_").show();
    $("body").addClass("scroll-hide");
}
function confirms(configure){
	// 防止键盘的enter键多次触发弹窗bug
	$(window).keydown(function(event){
		if($('.alert_window').length > 0) return false;
	});
	(new AlertMain()).createAlert(configure);
	$(".alert_window").addClass('confirm_main_');
	$(".confirm_main_").find(".alert_content").append('<div class="alert_btn btn_group"><button type="button" class="btn btn-default btn alert_btn_fixed alert_close_ confirm_sure">确定</button>'+
	'<button type="button" class="btn btn-cancel btn alert_btn_fixed alert_close_">再想想</button></div>').find(".main_content").append(configure.text);
	
	$(".confirm_main_").show();
	$("body").addClass("scroll-hide");
}

function iframes(configure){
	var marginLeft = -(configure.width.toString().split("px")[0])/2,
		marginTop = -(configure.height.toString().split('px')[0])/2;
	// 防止键盘的enter键多次触发弹窗bug
	$(window).keydown(function(event){
		if($('.alert_window').length > 0) return false;
	});
	(new AlertMain()).createAlert(configure);
	$(".main_content").html("<iframe src='"+configure.url+"'></iframe>");
	$(".alert_window").css({"width":configure.width,"height":configure.height,"margin-left":marginLeft+"px","margin-top":marginTop+"px"});
	$(".main_content").css({"height":($(".alert_window").height()-$(".alert_title").height())+"px"});
	$(".alert_window").css("display","table");
	$("body").addClass("scroll-hide");
}
function AlertMain(){
	this.createAlert=function(configure){
		var windows='<div class="alert_window ' + (configure.newStyle === true ? "new_alert_window" : "") + '">'+
		'<div class="alert_title">'+configure.title+'<span class="alert_close_ alert_close_list">' + (configure.newStyle ? "×" : "") + '</span></div>'+
		'<div class="alert_content"><div class="main_content" style="margin-bottom:35px;"></div>'+
		'</div></div><div class="alert_mengceng"></div>';
		$("body").append(windows);

	};
	this.closeAlert=function(this_){
		if(this_.parents(".alert_window").length=="0"){
			parent.$("body").removeClass("scroll-hide");
			parent.$(".alert_window").next().remove().end().remove();
		}else{
			$("body").removeClass("scroll-hide");
			this_.parents(".alert_window").next().remove().end().remove();
		}
	};
}
$("body").on("click",".alert_close_",function(){
	(new AlertMain()).closeAlert($(this));
});
/*******************弹出窗口组件 end****************/

/*******************悬浮插件 start****************/

// $("body").on("mouseover mouseout",".hoverTips",function(event){
// 	if(event.type=="mouseover"){
// 		hoverTips($(this));
// 	}else if(event.type=="mouseout"){
// 		$(".hoverTips_then").removeClass("hoverTips_then");
// 		$(".hoverTips_content").remove();
// 	}
// });
//
// function hoverTips(this_){
// 	this_.addClass("hoverTips_then");
// 	var offset=$(".hoverTips_then").offset(),
// 		oleft=offset.left,
// 		otop=offset.top,
// 		pageX=oleft+this_.width()+8,
// 		pageY=otop,
// 		content=hoverContents(this_),
// 		rWidth=$("body").width()-pageX,
// 		rHeight=$("body").height()-pageY;
// 	if(content!=""){
// 		var hoverContent="<div class='hoverTips_content radius' style='z-index:1035'>"+
//  		"<img src='/static/img/plugin/qipao.png' class='_hover_img_' style='width:7px;position:absolute;left:-6px;top:6px'>"+
//  		"<div class='zhengceContent'>"+content+"</div></div>";
// 		$("body").append(hoverContent);
// 		$(".zhengceContent").css({"max-width":(rWidth-45)+"px"});
// 		if((rHeight-40)>$(".hoverTips_content").height()){
// 			$(".hoverTips_content").css({"left":pageX,"top":pageY});
// 		}else{
// 			$("._hover_img_").attr("src","/static/img/plugin/qipaoleft.png").css({"left":$(".hoverTips_content").width()+10,top:$(".hoverTips_content").height()-(this_.height()-$("._hover_img_").height())/2+3});
// 			$(".hoverTips_content").css({"left":oleft-(rWidth-26),"bottom":rHeight-this_.height()});
// 		}
// 		$(".hoverTips_content").show();
// 	}
//
// 	function hoverContents(this_){
// 		if(!(this_.is(".hoverOther"))){
// 			return this_.html();
// 		}else{
// 			return this_.attr("data-gqTip");
// 		}
//
// 	}
// }
(function(){
	//展示悬浮窗
	$("body").on("mouseenter",".hoverTips",function(){
		!$(".hoverFather").is("span") ? (new HoverTipMain()).hoverEntry($(this)) : "";

	});
	$("body").on("mouseleave",".hoverFather",function(){
		(new HoverTipMain()).clearHoverTip($(this));
	});
	//悬浮提示主函数
	function HoverTipMain(){

		if(typeof this.hoverEntry !== "function"){

			//悬浮提示入口
			HoverTipMain.prototype.hoverEntry = function(this_ele){
				var content = "",position = null,hist="";
				content = this.getContent(this_ele).dataText; // 需要悬浮显示内容
				hist = this.getContent(this_ele).dataHist;
				if(content === "" || !this.isHover(content,this_ele)){return;} // 无内容/实际内容没有当前元素宽,无需悬浮
				position = this.getPosition(this_ele);  // 获取悬浮窗位置信息
				this.view({
					content: content,
					this_ele: this_ele,
					position: position,
					hist:hist
				});
			};

			//获取需要悬浮的内容，返回需要悬浮的内容
			HoverTipMain.prototype.getContent = function(this_ele){
				var dataText = $.trim(this_ele.attr("data-gqTip")),
					text = $.trim(this_ele.text()),
					value = $.trim(this_ele.val());
				var dataHist = $.trim(this_ele.attr("data-hist"));
				
				//先判断data-gqTip是否有值，如有返回，否则返回html/value的值
				return {dataText:dataText ? dataText : (text ? text : value),dataHist:dataHist};
			};

			//当前非空内容是否需要悬浮窗 ，返回值true或false
			HoverTipMain.prototype.isHover = function(content,this_ele){
				$("body").append("<p class='hoverTipsHide' style='font-size:12px;line-height:18px;margin:0;padding:0;display:none;white-space: nowrap;'>" + content + "</p>");
				return $(".hoverTipsHide").outerWidth() <= this_ele.outerWidth() ? ($(".hoverTipsHide").remove(),false) : true;
			};

			//获取悬浮窗位置
			HoverTipMain.prototype.getPosition = function(this_ele){
				var offset = this_ele.offset(), //当前悬浮元素的位置
					scrollTop = $(document).scrollTop(),
					scrollLeft = $(document).scrollLeft(),
					left = offset.left - scrollLeft,
					top = offset.top - scrollTop,
					width = this_ele.outerWidth(),
					height = this_ele.outerHeight(),
					documentWidth = $(window).outerWidth(),
					documentHeight = $(window).outerHeight(),
					limitWidthR = documentWidth - left - width - 20, //当前元素距离右侧浏览器边缘留白20的宽度
					limitWidthL = left - 20, //当前元素距离左侧浏览器边缘留白20的宽度
					limitHeight = documentHeight - top - 20,  //当前元素距离底部浏览器边缘留白20的高度
					hoverTipsHide_ele = $(".hoverTipsHide"),
					contentWidth = hoverTipsHide_ele.outerWidth(),  //内容的实际长度
					contentHeight = 18, //实际高度，单行时为18
					leftFlag = 1, //1悬浮在右侧默认，0悬浮在左侧
					topFlag = 1, ////1悬浮在下方默认，0悬浮在上方
					position = {
						//提示文字只有一行，默认显示在右侧下部
						left: left + width + 5,
						top: top,
						width:0,
						height:18,
						leftFlag: 1,
						topFlag: 1
					};
				// 获取悬浮窗宽度和高度，更新到position.width,position.height
				if((contentWidth + 17) > limitWidthR){
					if(limitWidthR <= 160){
						if((contentWidth + 17) > limitWidthL){
							position.width = limitWidthL - 12;
							contentWidth = limitWidthL -17;
						}else{
							position.width = contentWidth + 5;
						}
						leftFlag = 0;
						position.left = left - position.width - 5;
					}else{
						position.width = limitWidthR - 12;
						contentWidth = limitWidthR -17;
					}
					hoverTipsHide_ele.css({"white-space":"normal","width":contentWidth + "px"});
					contentHeight = hoverTipsHide_ele.outerHeight();
					if(contentHeight > 18 && (contentHeight + 10) > limitHeight){
						position.height = top + height - 20 - 10;
						position.top = 30; // 让框稍微靠下一些
						topFlag = 0;
					}else{
						position.height = contentHeight;
					}
				}else{
					position.width = contentWidth + 5;
				}
				hoverTipsHide_ele.remove();
				position.leftFlag = leftFlag;
				position.topFlag = topFlag;
				return position;

			};

			//展示悬浮窗
			HoverTipMain.prototype.view = function(viewPara){
				var img = "",row = "",ver = "",rowVal = "-6px", verVal = "5px",hoverContent = "";
				viewPara.position.leftFlag === 1 ? (img = "qipao.png",row = "left") : (img = "qipaoleft.png",row = "right");
				ver = viewPara.position.topFlag == 1 ? "top" : "bottom";

				var outerCss = 'font-size:12px;padding:2px 5px;background: #fff;width:' + viewPara.position.width +
					'px;height:' + (viewPara.hist!=""?viewPara.hist:viewPara.position.height) + 'px;z-index:1035;position:fixed;left:' +
					viewPara.position.left + 'px;top:' + viewPara.position.top + 'px;-ms-border-radius: 3px;' +
					'-webkit-border-radius: 3px;border-radius: 3px;-moz-box-shadow: 0 0 3px 0 #333;-webkit-box-shadow: 0 0 3px 0 #333;box-shadow: 0 0 3px 0 #333;',
					imgCss = 'width:7px;position:absolute;z-index:1035;' + row + ':' + rowVal + ';' + ver + ':' + verVal + ';';

				hoverContent = "<div class='first' style='" + outerCss + "'>" +
					"<img src='/static/img/plugin/" + img + "' style='" + imgCss + "' />" +
					"<div style='line-height:18px'>" + viewPara.content + "</div>" +
					"</div>";
				viewPara.this_ele.after("<span class='hoverFather' style='white-space: normal;text-align: left;'>"+hoverContent+"</span>");
				$(".hoverFather").append(viewPara.this_ele);

			};

			//清除悬浮窗
			HoverTipMain.prototype.clearHoverTip = function(this_ele){
				var this_ = this_ele.find(".hoverTips");
				this_ele.after(this_).remove();
				return this;
			};

		}

	}

})();

/*******************悬浮插件 end****************/































