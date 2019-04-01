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
			this_input.prop("checked",!(this_input.prop("checked")));
			this_input.prop("checked")===true ? this_.addClass("label-select-checkbox") : this_.removeClass("label-select-checkbox");
			return;
		}
	});
/*****************单选复选按钮 end*********************/

/************** Custom drop menu Start ****************/
//下拉主函数
function SelectMain(){
	this.initialize=function(){
		SelectMain.prototype.selectFlag !== "ok" ? (new SelectMain()).event_() : ""; //初始化一次事件绑定
		$("._select_").each(function(){
			(new SelectMain()).creatSelect($(this));
		});
	};
	this.creatSelect=function(this_){
		var this_first_option=this_.find("option:first");
		this_.val(this_.attr("data-value")).after("<div class='drop'></div>").addClass("_dropDown_").appendTo(this_.next()).after("<div class='drop_title'>"+this_.children("option[value='"+this_.val()+"']").html()+"</div>").next().after("<ul class='drop_option'></ul>");
		this_.children().each(function(){
			this_.parents(".drop").find(".drop_option").append("<li>"+$(this).html()+"</li>");
		});
	};
	this.event_=function(){
		SelectMain.prototype.selectFlag = "ok";
		//drop shut
		$("body").on("click",".drop_title",function(event){
			event.stopPropagation();
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
		'<div class="alert_title">'+configure.title+'<span class="alert_close_">' + (configure.newStyle ? "×" : "") + '</span></div>'+
		'<div class="alert_content"><div class="main_content"></div>'+
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

$("body").on("mouseover mouseout",".hoverTips",function(event){
	if(event.type=="mouseover"){
		hoverTips($(this));
	}else if(event.type=="mouseout"){
		$(".hoverTips_then").removeClass("hoverTips_then");
		$(".hoverTips_content").remove();
	}
});

function hoverTips(this_){
	this_.addClass("hoverTips_then");
	var offset=$(".hoverTips_then").offset(),
		oleft=offset.left,
		otop=offset.top,
		pageX=oleft+this_.width()+8,
		pageY=otop,
		content=hoverContents(this_),
		rWidth=$("body").width()-pageX,
		rHeight=$("body").height()-pageY;
	if(content!=""){
		var hoverContent="<div class='hoverTips_content radius' style='z-index:1035'>"+
 		"<img src='/resources/images/common/qipao.png' class='_hover_img_' style='width:7px;position:absolute;left:-6px;top:6px'>"+
 		"<div class='zhengceContent'>"+content+"</div></div>";
		$("body").append(hoverContent);
		$(".zhengceContent").css({"max-width":(rWidth-45)+"px"});
		if((rHeight-40)>$(".hoverTips_content").height()){
			$(".hoverTips_content").css({"left":pageX,"top":pageY});
		}else{
			$("._hover_img_").attr("src","/resources/images/common/qipao.png").css({"left":$(".hoverTips_content").width()+10,top:$(".hoverTips_content").height()-(this_.height()-$("._hover_img_").height())/2+3});
			$(".hoverTips_content").css({"left":oleft-(rWidth-26),"bottom":rHeight-this_.height()});
		}
		$(".hoverTips_content").show();
	}
	
	function hoverContents(this_){
		if(!(this_.is(".hoverOther"))){
			return this_.html();
		}else{
			return this_.attr("data-gqTip");
		}
		
	}
}


/*******************悬浮插件 end****************/
