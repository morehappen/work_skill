//控制显示为项目中心还是Showname

(function(){
	if($(".project-code-shut").val()!=="1"){
		return;
	}
	$.ajax({
		 type: "POST",
	     url:"/getShowname",
         success: function(data) {
        	if(data.status===200){ //数据请求成功
        		if(data.data==="0"){
					$('.getShowname').val(0);
        			$(".project-shut").remove();
        			$(".showName-container .input-c span").css("width","96px");
        			$(".detail-title").html("SHOWNAME");
        			$(".project-show-c").remove();
        			$(".project-code-shut").attr("data-flag","1");
        			$('.showname_falge').removeClass('project-input')
        		}else{
        			$(".showName-container").remove();
        			$(".showNameCode").remove();
        		}
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
})();


//获取成本中心
$("body").on("click",".costCenter-input",function(e){
	e.stopPropagation();
	if($(this).attr("data-flag-c") != "y"){
		return;
	}
	if($(this).attr("ignore") == "ignore"){
		$(this).removeAttr("readonly").removeAttr("unselectable");
		return;
	}
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData,
		eventMain:eventMain,
		url:'/getCostcenter',
		this_:$(this),
		showField:"name",
		hideField:"id",
		tips:"成本中心数据为空,请在后台维护！",
		model:"paging"
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){ 
		var data=JSON.parse(data.data);
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.list); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		var parents=active.parents(".costCenter-c");
		parents.find(".costCenterId").val(this_.attr("data-id"));
		
	}
});

//获取项目中心
$("body").on("click",".project-input",function(e){
	e.stopPropagation();
	if($(this).attr("data-flag-c") != "y"){
		return;
	}
	if($(this).attr("ignore") == "ignore"){
		$(this).removeAttr("readonly").removeAttr("unselectable");
		return;
	}
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData,
		eventMain:eventMain,
		url:'/getProject',
		this_:$(this),
		showField:"name",
		hideField:"id",
		tips:($(".project-code-shut").attr("data-flag")!="1") ? "项目中心数据为空！" : "SHOWNAME不能为空！",
		model:"paging"
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){ 
		var data=JSON.parse(data.data);
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.list); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		var parents=active.parents(".project-c");
		parents.find(".projectId").val(this_.attr("data-id"));
	}
	
	
});

//获取出差单申请号
$("body").on("click",".travelorder-val",function(e){
	e.stopPropagation();
	if($(this).attr("data-flag-c") != "y"){
		return;
	}
	if($(this).attr("ignore") == "ignore"){
		$(this).removeAttr("readonly").removeAttr("unselectable");
		return;
	}
	if($.trim($(this).val())==""){
		//初始化自动下拉数据模块
		var addrData=new DropAutoData({
			analyzerData:analyzerData,
			eventMain:eventMain,
			url:'/findAppForm',
			time:$(".orderTimes").val(),
			this_:$(this),
			showField:"approvalno",
			hideField:"id",
			tips:"没有符合日期的出差单，请申请出差单后再进行预订操作！",
			model:"paging"
		});
		addrData.interceptor();
		/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
		function analyzerData(data){
	//		console.log(data);
			var data=JSON.parse(data.data);
			this.pagingIn(data); //初始化分页参数
			this.volidate(data.list); //执行
		}
		/***********数据处理器*单击下拉项，向页面指定位置铺值************/
		function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
			var parents=this_.parents(".travelorder-c");
			parents.find(".travelorder-val").val(this_.attr("data-id"));
		}
	}
});





/*************************审批主模块***************************/
/*
 * 调用方法 ，参数：超标标识：0或1，审批类型：gjjp/gnjp/gnjd/gnhcp/jptp/jpgq/hcptp/
 * (new isApprove({
 * weibei:$(".isWei").val(),
 *	type:"gnjp"
 *	})).ajaxIsApprove();
 * 
 * 
 */
function isApprove(para){ //是否无条件审批...
	if(para instanceof Object){
		this.weibei=para.weibei; //超标标识
		this.type=para.type;//请求是否需要审批，请求审批人标识，机票为：gjjp/gnjp/gnjd/gnhcp/jptp/jpgq/hcptp/
	}
	/****************请求是否需要审批的控制条件******************/
	this.ajaxIsApprove=function(){
		if($(".e-p-model").size() == 0){
			clearApprove(para.weibei);
			return;
		}
		var this_now=this;
		$.ajax({
            type: "POST",
            url:'/checkApprove',
            data:{type:this.type},
            success: function(data) {
            	if(data.status===200){ //是否无条件审批请求成功
            		this_now.approveShut(JSON.parse(data.data));
            	}else{
            		zh.alerts({
        				title:"提示",
        				text: data.msg+"("+data.status+")!"
        			});
            		console.log(data.msg);
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

	//判断是否需要审批，无条件审批、超标审批、超标不审批
	this.approveShut=function(data){
		if(data.condition==="1"){ //必须审批
			this.ruleAjax("1");
			return;
		}
		if(data.need==="1"){ //超标需要审批
			this.ruleAjax(this.weibei);
			return;
		}
		clearApprove(para.weibei);
	};

	/****************审批规则，审批人数据请求*****************/
	this.ruleAjax=function(flag){
		if(flag!=="1"){
			clearApprove(para.weibei);
			return;
		}
		var ids="",now_this=this,allLinshi = true;

		$(".e-p-model").each(function(){
			var this_e_p = $(this);
			if(allLinshi && this_e_p.attr("data-passtype") == 1){
				allLinshi = false;
			}
			ids+=$(this).attr("data-id")+"-";
		});
		if(allLinshi){
			ids = $(".loginid").val();
		}

		$.ajax({
	        type: "POST",
	        url:' /getShenpi',
	        async:false,
	        data:{
	        	empids:ids,
	        	type:this.type,
	        	webeiflage:this.weibei
	        },
	        success: function(data) {
	        	if(data.status===200){ //审批人请求成功
	        		var data=JSON.parse(data.data);
	        		if(data == null || data.length === 0){
	        			/*zh.alerts({
		    				title:"提示",
		    				text: "此订单需要审批才可出票，请联系管理员设置审批人!"
		    			});
	        			$(".approve_content").remove();
	        			$(".book-submit").remove();*/
	        			clearApprove(para.weibei);
	        			return;
	        		}
	        		isApprove.prototype.data=data;
	        		now_this.ruleView(); //显示审批规则
	        		now_this.rulePerson(); //显示审批人
	        		$(".approve_content").show();
	        	}else{
	        		zh.alerts({
	    				title:"提示",
	    				text: data.msg+"("+data.status+")!"
	    			});
	        		console.log(data.msg);
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

	/**********审批规则下拉view********/
	this.ruleView=function(){
		var approveid = $(".approveid").val();
		var data=this.data;
		select=$('<select class="_select_ approve_rule_select" name="' + $('#model-flag').attr('data-modelflag') + '.approveid" data-value="'+(approveid!==""?approveid:data[0].id)+'"></select>'),
		options='',
		list='';
		$.each(data,function(index,item){
			options+='<option value="'+item.id+'">'+item.name+'</option>';
		});
		select.html(options);
		$(".approve_rule").html(select);
		(new SelectMain()).creatSelect($(".approve_rule_select"));
	};
	this.rulePerson=function(){
		var data=this.data,
			selectVal=$(".approve_rule_select").val(),
			selectObj=[],
			level=[],
			list="";
		$.each(data,function(index,item){
			if(item.id==selectVal){
				$.extend(selectObj,item.shenpirens);
				return false;
			}
		});


		$.each(selectObj,function(index,item){
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
		$.each(level,function(index,item){
			var eLevelList="",
				levelItem=item;
			eLevelList+='<div class="clear"></div>'
            eLevelList+='<div class="sp-jb float-left ">'+eLevelList+
                '<div style="margin-top: 10px">'+(index+1)+'级审批</div></div>';
            eLevelList+='<div class=" float-left">'
			$.each(selectObj,function(index,item){
                // eLevelList='<div classft">'+eLevelList+
                //     '<div>'+(index+1)+'级审批</div></div>';
                if(item.level==levelItem){
                    // eLevelList='<div class="sp-jb float-left" style="margin-top: 5px">'+eLevelList+
                    //     '<div>'+(index+1)+'级审批</div></div>';

                    eLevelList+='<div class="sp-jb-person">'+
                        '<div class="sg-jb-p" data-sprid="'+item.id+'">'+item.name+'</div></div>';

				}
			});
            eLevelList+='</div>'

			if(index!=level.length-1){
				// eLevelList+='<div class="dote-line float-left"></div>';
			}
			list+=eLevelList;
		});
		$(".sp-show").html(list);
	};
}
function clearApprove(weibei) {
	if(weibei != 1){
		$(".weibei-container").hide;
		$(".wb-c-select").html("");
		$(".input-full-reason").val("").attr("ignore","ignore");
	}
	$(".approve_content").hide();
	$(".approve_rule").html("");
	$(".sp-show").html("");
}



$("body").on("click",".drop_option li",function(){
	var this_=$(this),
		select=this_.parents(".drop").find("select");
	if(select.is(".approve_rule_select")){
		(new isApprove).rulePerson();
	}
});




