//周几
function getWeek(str) {
	if(str==undefined || str==""){
		return str;
	}
	var d = new Date(Date.parse(str.replace(/-/g, "/")));
	d = d.getDay();
	switch (d) {
	case 1:
		return "周一";
		break;
	case 2:
		return "周二";
		break;
	case 3:
		return "周三";
		break;
	case 4:
		return "周四";
		break;
	case 5:
		return "周五";
		break;
	case 6:
		return "周六";
		break;
	case 0:
		return "周日";
		break;
	default:
		return "无法识别的日期";
	}
}
/**
 * 对时间的操作
 * @param date>>YYYY-MM-DD
 * @param days>>1
 * @returns {String}
 */
function formDate(date, days,type) {
	var d =new Date(Date.parse(date.replace(/-/g,   "/"))); 
	d.setDate(d.getDate() + days);
	var month = d.getMonth() + 1;
	var day = d.getDate();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	var val;
	if(type=="yyyy-MM-dd"){
		val = d.getFullYear() + "-" + month + "-" + day;
	}else if (type=="MM月dd日"){
		val = month + "月" + day+"日";
	}else if (type=="MM-dd"){
		val = month + "-" + day;
	}else if (type=="年月日"){
		val = d.getFullYear() + "年" + month + "月" + day +"日";
	}else if (type=="MM/dd"){
		val =  month + "/" + day;
	}
	return val;
}

// 全局对象
var hotel_obj = {
	// 每日价格fn
	everyDayPrice: function(e){
		var type = e.type,
			this_ = $(this),
			list = '';
		if(type === 'mouseenter'){
			if($(".suspension-frame").html() == ""){
				$(".everyday_rate").each(function(){
					var this_input = $(this),
						price = this_input.val(),
						date = this_input.attr('data-date'),
						cost = this_input.attr('data-cost'),
						week=getWeek(date),
						rateCode = this_input.attr('data-code');
					list += '<dl class="float-left suspension-dl"><dd class="suspension-dd"><span>'+formDate(date, 0, "MM-dd")+'</span><span>'+week+'</span></dd>'+
						'<dt class="suspension-dt"><div class="suspension-price"><span>￥</span><span class="price">'+price+'</span></div><!--<div class="suspension-early">无早</div>--></dt></dl>';
				});
				$(".suspension-frame").html('<div class="suspension-data clear">' + list + '</div>').fadeIn();
				return;
			}
			$(".suspension-frame").fadeIn();
			return;
		}
		if(type === 'mouseleave'){
			this_.next(".suspension-frame").fadeOut();
		}
	},
	// 获取员工常用联系人id
	getIds: function () {
		
		var ids = "";
		$(".passanger-model").each(function(){
			var this_ = $(this),
				empid = this_.find(".emp_id").val(),
				emprank = this_.find(".emp_rank").val();
			if(empid!= undefined && empid!="" && emprank!=undefined && emprank!=""){
				ids += empid + "-" + emprank + ",";
			}
		});
		if(ids != ""){
			ids = ids.substring(0, ids.length-1);
		}
		return ids;
	},
	// 常用联系人公共方法实例存储
	contact : new Contact(),
	// 常用联系人回调函数
	contactCallBack_ : function () {
		if($(".passanger-model").size() != 0){
			//默认选中已添加的联系人
			(function selectPassanger(){
				$("#container_hotel .passanger-model").each(function(index){
					var indexS = parseInt(index)+1;
					var emp = $(this).find(".emp_id").val();
					$("#often-contacts span[id='"+emp+"']").addClass("active");
					$(this).find('.pass-bg').html(indexS);
				});
			})();
		}
	},
	// 审批实例存储
	approve: new Approve($.trim($("#apprule_i").val())).eventApprove(),
	// 动态赋值审批规则值回调
	approveCallback: function (value) {
		$('[name="apprule"]').val(value);
	},
	//初始化乘客选择模块
	choicePerson: $.trim($("#ifallowbook").val()) == "1" ? new PassengerModel() : ($('[data-person="choice"]').remove(),undefined),
	//差旅政策实例存储
	policy: (new HotelPolicy($.trim($("[name='overMsg']").val()),$.trim($('[name="overMsgId"]').val()))).eventPolicy(),
	// 差旅政策回调
	standardPeople: {},
	policyCallback: function (policy) {
		this.standardPeople.flages =policy;
		var controller = policy.controller,
			policy_all = policy.policy,
			isViolate = policy.isViolate,
			cls =policy.cls,
			ids = this.getIds(),
			coerceApprove = $("#coerceApprove_i").val(), // 是否强制审批 1是 0否
			idArr = policy.ids != undefined ? policy.ids.split("-") : [],
			standPriceArr = policy.standPrice != undefined ? policy.standPrice.split("-") : "",
			beyondPriceArr = policy.beyondPrice != undefined ? policy.beyondPrice.split("-") : "",
			assignment = function (data) {
				$.each(data,function (index, item) {
					var itemArr = item.split("-"),
						empid = itemArr[0],
						basePrice = itemArr[2],
						overPrice = itemArr[3];
					$(".emp_standard_"+empid).val(basePrice); // 员工差旅标准价格
					$(".emp_overAvg_"+empid).val(overPrice); // 超出部分价格
				});
			},
			violatePrice = $.trim($("#averageDaily_i").val());
		// 为有差旅政策的人赋值
		$.each(idArr,function (index,item) {
			var $item = null;
			if(item != ''){
				$item = $('[data-model="passenger"][data-id^="' + item + '"]');
				$item.find("[name$='standard']").val(standPriceArr[index]);
				$item.find("[name$='priceAvg']").val(beyondPriceArr[index]);
			}

		});
		
		policy_all != null && assignment(policy_all);
		$('[name="violateApruleRule"]').val(isViolate);
		// 是否需要审批
		if($("#modifyApproval").val() != "0"){
			if(coerceApprove == 1 || (controller == 1 && isViolate == 1)||cls==1){
				$('[name="isApproved"]').val(1);
				this.approve.getApprove({
					empids: ids,
					module: "gnjd",
					webeiflage: isViolate,
					violatePrice: violatePrice
				},hotel_obj);
				return;
			}else{
				$('[data-approve="approvePerson"]').html("");
				$('[data-approve="container"]').hide();
			}
			this.clearPageApprove(); // 清空审批
		}
		// 第三方追加审批人
		approval(policy);
	},
	// 超标原因回调 flag:违背标识 1 | 0
	violateCallback: function (flag,msg) {
		var $select = $('[data-select="violate"]'),
			val = $select.val(),
			option = $select.find("option[value='" + val + "']"),
			content = $.trim(option.html()),
			text = msg == undefined ? (content == "其他原因" ? msg : content) : msg;
		if(flag == 1){
			$('[name="overMsg"]').val(text);
			$('[name="overMsgId"]').val(val);
			$('[name="violateApruleRule"]').val(1);
			return;
		}
		this.clearPageVolodate();

	},
	// 选择乘客后回调函数
	/***
	 *  para:
	 *  	idsArr:{
	 *  		addId: [], // 需要添加的员工，
	 *			removeId: [] // 需要删除的员工
	 *			size: number //	实际要添加的乘客人数
	 *   	}
	 *
	 * ***/
	contactCallback: function (idsArr,this_) {
		// this_ 当前点击的元素
		var addId = idsArr.addId,
			removeId = idsArr.removeId,
			size = idsArr.length;
			empidLenvel = this.getIds(), // 员工id-员工职级 多个用,逗号隔开
			geolevel = $("#cityLevel_i").val(), // 当前城市级别
			price = $("#averageDaily_i").val(), // 每日价格
			coerceApprove = $("#coerceApprove_i").val(); // 是否强制审批 1是 0否
		var this_ = this_;
		// 删除取消的人
		function removePerson (removeId,addId) {
			$.each(removeId,function(index,item){
				var index_=$("#temp_"+item).find("input[name='indexSeq']").val();
				$("#temp_"+item).remove();
				$(".contact_item[id='" + item + "']").removeClass("active");
				removeRoom();
				updateIndex(index_);
			});
			addId.length <= 0 ? ($(".layer-container").remove(),$("body").removeClass('modal-open')) : "";
		}
		// 添加入住人
		function addPerson (addId) {
			
			if(!addRoom(true,size)){
				this_.is(".contact_item") ? this_.toggleClass("active") : "";
				return;
			}
			var _index=$(".passanger-model").length;//乘客人数
			$.ajax({
				type : "POST",
				url : "/shopping/gust/detail" ,
				data:{empids:addId.join(), "module":"hotel"},
				dataType : "json",
				success : function(json) {
					if(json.status==200){
						travellerTransform(json);
						empidLenvel = hotel_obj.getIds();
						hotel_obj.policy.getPolicy(hotel_obj,{
							empidLenvel: empidLenvel,
							geolevel: geolevel,
							price: price,
							coerceApprove: coerceApprove
						});
					}else{
						layer.msg(json.msg);
					}
				}
			});
			$(".layer-container").remove();
			$("body").removeClass('modal-open');
		}
		removeId.length > 0 && removePerson(removeId,addId);
		addId.length > 0 ? addPerson(addId) : (this.getIds() != "" ? this.policy.getPolicy(this,{empidLenvel: this.getIds(), geolevel: geolevel, price: price, coerceApprove: coerceApprove}) : (this.approve.clearApprove(),this.policy.clearPolicy(),this.policy.resetReson(),this.clearPageApprove(),this.clearPageVolodate()));
		if(removeId.length === 0 && addId.length === 0){
			$(".layer-container").remove();
			$("body").removeClass('modal-open');
		}
	},
	// 清空页面的违背信息值
	clearPageVolodate: function () {
		// $('[name="overMsg"]').val("");
		// $('[name="overMsgId"]').val("");
		$('[name="violateApruleRule"]').val(0);
		$('[name="overItem"]').val("");
	},
	// 清空是否审批
	clearPageApprove: function () {
		$('[name="apprule"]').val("");
		$('[name="isApproved"]').val("");
	}
};


// 页面初始化
(function () {
	// 初始化常用联系人
	hotel_obj.contact.getData('hotel').Event(hotel_obj);

	// 初始化乘客模块
	hotel_obj.choicePerson != undefined ? hotel_obj.choicePerson.Events(hotel_obj) : "";

	// 初始化出差单号，出差事由
	(function(){
		var isShowTravelorder = $.trim($("#crm_travelorder").val()),
			isShowTravelItem = $.trim($("#crm_travelreason").val());
		if(isShowTravelorder == 1 || isShowTravelorder == 3){
			$('[data-travel="travelinput"]').show();
			isShowTravelorder == 1 ? ($("[name='travelNo']").removeAttr("ignore"),$("[name='travelNo']").next(".danger-p").show()) : "";
		}
		isShowTravelItem == 1 ? ($("[name='travelReason']").removeAttr("ignore"),$("[name='travelReason']").next(".danger-p").show()) : "";
	})();
	if($("#modifyCustomer").val() != "0"){
		if($(".passanger-model").size() > 0){
			var empidLenvel = hotel_obj.getIds(),
				geolevel = $("#cityLevel_i").val(), // 当前城市级别
				price = $("#averageDaily_i").val(), // 每日价格
				coerceApprove = $("#coerceApprove_i").val(); // 是否强制审批 1是 0否
			hotel_obj.policy.getPolicy(hotel_obj,{
				empidLenvel: empidLenvel,
				geolevel: geolevel,
				price: price,
				coerceApprove: coerceApprove
			});
		}
	}
})();

// 每日价格监听
$("body").on("mouseenter mouseleave", ".suspension-frame-box", hotel_obj.everyDayPrice);


/**房间数**/
$('body').on('click', '.ctrl-l', function () {
	removeRoom();
});

$('body').on('click', '.ctrl-r', function () {
	addRoom(false);
});

/***
 * 移除入住人
 */
$('body').on('click', '.remove_p', function () {
	
	var gust=$(this).attr("data-gust");
	var index=$(this).children().val();
	$("#"+gust).remove();
	removeRoom();
	var vv=gust.split("_");
	if(vv[0]=="temp"){
		var $item=$("#"+vv[1]);
		if($item.length>0){
			$item.toggleClass("active");
		}
	}
	updateIndex(index);
	roomRate();
	if($(".passanger-model").length == 0){
		hotel_obj.approve.clearApprove();
		hotel_obj.policy.clearPolicy();
		hotel_obj.clearPageApprove();
		hotel_obj.clearPageVolodate();
		return;
	}else{
		hotel_obj.policy.getPolicy(hotel_obj,{
			empidLenvel: hotel_obj.getIds(),
			geolevel: $("#cityLevel_i").val(),
			price: $("#averageDaily_i").val(),
			coerceApprove: $("#coerceApprove_i").val()
		});
	}
	
});

//单点登录是否需要追加审批人
function approval(data){
//	当页面
	var bookSources = $('#bookSources').val();
	var addition_appro_i = $('#addition_appro_i').val();// 是否追加审批人 1追加  0不追加
	var over_appro_map_json_i = $('#over_appro_map_json_i').val();// 追加审批人json数据
	var appro_map_json_i = $('#appro_map_json_i').val();// 审批人json数据
	var list ='';
	 if(bookSources=='1'){
	 	if(appro_map_json_i!="" && appro_map_json_i!=undefined && appro_map_json_i!=null){
			var approv_jsonList = JSON.parse(appro_map_json_i);
			 $('.approval_shenpi').remove();
				 $.each(approv_jsonList,function (index,item) {
					 list +='<div class="clear e-sp approval_shenpi"><div class="float-left e-sp-t">'+index+'级审批</div>';
					 $.each(item,function(indexs,items){
						 list +='<div class="float-left sp-person" data-eapid="'+items.userId+'">'+items.userName+'</div>';
					 });
					 list+='</div>';
				 });
				 $('.container_approve').show();
		}
		if(data.controller!=-1 && addition_appro_i=="1" && over_appro_map_json_i!=""){
			var jsonList = JSON.parse(over_appro_map_json_i);
				$.each(jsonList, function (index, item) {
					list += '<div class="clear e-sp approval_shenpi"><div class="float-left e-sp-t">' + index + '级审批</div>';
					$.each(item, function (indexs, items) {
						list += '<div class="float-left sp-person" data-eapid="' + items.userId + '">' + items.userName + '</div>';
					});
					list += '</div>';
				});
			$('.container_approve').show();
		}
		 $('[data-approve="approvePerson"]').html(list);
	}
}
//预订按钮
$('body').on('click', '#btn-hotel-book', function () {
	// 初始化出差单号，出差事由
	var isSubmit = verifyBook();
	if(!isSubmit){
		return false;
	}
	$("#hotel-confirm-form").Validform({
		tiptype:function(msg,o,cssctl){
			if(msg != ""){
				layer.msg(msg);
			}
		},
		datatype:{
			"phone":function(gets,obj,curform,regxp){
				/*参数gets是获取到的表单元素值，
				  obj为当前表单元素，
				  curform为当前验证的表单，
				  regxp为内置的一些正则表达式的引用。*/
				var reg1=/^1[0123456789]{10}$/,
					reg2=/^\w+([-+.@\w])*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
					mobile=obj.parents('[data-phone="content"]').find('[data-phone="true"]');
				if(reg1.test(mobile.val())){return true;}
				if(reg2.test(gets)){return true;}
				return false;
			}
		},
		beforeSubmit: function () {
		
		},
		callback:function(form){
			// verifyBook();
			fnls();
			return false;
		}
	})
});

function fnls(){
	var aler = '';
	var aotodo = aotodos();
	if(aotodo.prohibit.length>0){
		aler+="<ul>";
		$.each(aotodo.prohibit,function(index,item){
			aler+="<li> <span style='color:#6461e2'>"+item.name +"</span> 超出了该城市预订酒店不得高于  <span style='color:#6461e2'>"+item.price+"元/夜 </span>的差旅标准！</li>";
			
		});
		aler+="</ul>";
		new Confirm({
			text: aler + '禁止预订！',
			arr: ['知道了', '取消']
		},(parseInt(aotodo.prohibit.length)+2)*50+"px");
	}else if(aotodo.standardArrs.length>0){
		aler+="<ul>";
		$.each(aotodo.standardArrs,function(index,item){
			aler+="<li>  <span style='color:#6461e2'>"+item.name +"</span> 超出了该城市预订酒店不得高于  <span style='color:#6461e2'>"+item.price+"元/夜 </span>的差旅标准！</li>";
		});
		aler+="</ul>";
		new Confirm({
			text:  aler+ '是否继续预订酒店？',
			arr: ['继续', '取消'],
			confirmCallback: function () {
				verifySimiOrder();
			}
		},(parseInt(aotodo.standardArrs.length)+2)*50+"px");
	}else{
		verifySimiOrder();
	}

}
//预订按钮minDays
$('body').on('click', '#btn-hotel-go', function () {
	   var form=document.getElementById('hotel-confirm-form');
	   form.action="/hotel/detial/"+$("#hotelNo").val();
	   form.submit();
});


function submitForm(){
	(new CookieMain()).setCookie(); // 存储历史记录
    var form=document.getElementById('hotel-confirm-form');
    form.action="/hotel/book/confirm";
    form.submit();
}

// 验证相似订单
function verifySimiOrder(){
	var checkIn=$("#checkIn").val();
	var checkOut=$("#checkOut").val();
	var empid = "";
	$(".passanger-model").each(function(){
		if(empid != ""){
			empid += ",";
		}
		empid += $(this).attr("data-id");
	});
	
	$.ajax({
		url:"/hotel/book/verify/similarity/order",
		dataType:"JSON",
		type :"POST",
		data:{"empids":empid, "checkIn":checkIn, "checkOut":checkOut},
	    beforeSend :function(){
	    	 $('#btn-hotel-book').attr('disabled',true);
	         layer.load(2);
	    }
	  }).done(function(json){
	     $('#btn-hotel-book').attr('disabled',false);
         layer.closeAll('loading');
		 if(json.status==200){
			 verifyroom();
		 }else if(json.status==300){
			layer.msg(json.msg);
		 }else{
			 // 相似订单
			 showSimiOrder(json);
		 }
	   }).fail(function(){
		   layer.closeAll('loading');
	   });
}

// 提示相似订单
function showSimiOrder(data){
	if(data.data != null){
		var html = "";
		html += '<div class="hotel_order_popup_box">';
		html += '	<div class="hotel_order_popup_header margin-bottom-39 font-size-24">';
		html += '		查询有以下相似订单，是否继续预订？';
		html += '	</div>';
		$.each(data.data, function(i, d){
			html += '<div class="box-popup-top" style="margin-bottom: 30px;">' +
				'<div class="font-size-16-s margin-bottom-11">'+d.creatName+'预订酒店订单   订单号：' + d.orderNo + '</div>';
			html += '<table style="border:0;border-spacing:0px;width:100%;">	<thead class="">';
			html += '		<tr class="clear background-E0E1FF ">';
			html += '			<td class="  font-size-14-s" style="padding-left:20px;">入住日期</td>';
			html += '			<td class="  font-size-14-s">离店日期</td>';
			html += '			<td class="  font-size-14-s">酒店名称</td>';
			html += '			<td class=" font-size-14">房型</td>';
			html += '			<td class=" font-size-14">入住人</td>';
			html += '		</tr></thead>';
			html += '<thead>';
			html += '		<tr class="clear background-fff box-shadow">';
			html += '			<td class="  font-size-14-s" style="padding-left:20px;">'+addDate(d.checkIn, 0, "年月日")+'</td>';
			html += '			<td class="  font-size-14-s">'+addDate(d.checkOut, 0, "年月日")+'</td>';
			html += '			<td class=" font-size-14-s">'+d.hotelName+'</td>';
			html += '			<td class=" font-size-14">'+d.roomName+'</td>';
			html += '			<td class=" font-size-14-s">'+d.guests+'</td>';
			html += '		</tr>';
			html += '	</thead>';
			html += '</table></div>';
		});
		html += '</div>';
		layer.open({
		  type: 1,
		  title:" ",
		  area: ['850px', '500px'],
		  content: html,
		  btn: ['继续预订', '考虑一下'],
		  btnAlign: 'c',
		  yes: function(index, layero){
			  layer.closeAll();
			  verifyroom();
		  },
		  btn2: function(index, layero){
			  layer.closeAll();
		  }
		});
	}else{
		verifyroom();
	}
}

//房量验证
function verifyroom(){
	var checkIn=$("#checkIn").val();
	var checkOut=$("#checkOut").val();
	var platform=$("#platform").val();
	var latestcheckInTime=$("#latestCheckTime").val();
	var hotelNo=$("#hotelNo").val();
	var roomCount=$("#roomCount").val();
	var totalPrice=sub($("#totalRate_i").val(),$("#coverCharge").val());
	var planCode=$("#planCode").val();
	var res=false;
    // 房价房量验证
	$.ajax({
		url:"/hotel/book/verify",
		dataType:"JSON",
		type :"POST",
		data:{"checkIn":checkIn,"checkOut":checkOut,"platform":platform,"roomCount":roomCount,"latestcheckInTime":latestcheckInTime,"hotelNo":hotelNo,"totalPrice":totalPrice,"planCode":planCode},
	    beforeSend :function(){
	    	 $('#btn-hotel-book').attr('disabled',true);
	         layer.load(2);
	    }
	  }).done(function(json){
	     $('#btn-hotel-book').attr('disabled',false);
         layer.closeAll('loading');
		 if(json.status==200){
				 submitForm();
			 }else{
				layer.msg(json.msg);
			 }
	   }).fail(function(){
			console.log("ERROR");
	   });
};
function verifyBook(){
	//验证表单 
	var count=$(".passanger-model").length,//乘客人数
		max = parseFloat($("#roomCount").val());
	if(count<=0){
		layer.msg("请选择入住人信息");
		return;
	}

	if(count != max){
		layer.msg("一位入住人只能预订一间房！");
		return;
	}
	var minAmount=$("#minAmount").val();
	var minDays=$("#minDays").val();
	var maxDays=$("#maxDays").val();
	var $roomNumber=$("input[name='roomCount']");
	var limit=parseInt($roomNumber.attr("data-limit"));//剩余房间数
	var roomAcount=$roomNumber.val();//房间数
	var capacity=$("#capacity").val()!=""?$("#capacity").val():1;//房间最大入住人数
	// 最少入住的天数判断
	var checkIn = $("#checkIn").val();
	var checkOut = $("#checkOut").val();
	if(parseInt(minDays)>parseInt(dateDiff(checkOut,checkIn))){
		layer.msg('最少入住天数'+minDays);
		return ;
	};
	if(limit>0 && limit<roomAcount){
		layer.msg('预订房间数不能超过剩余量');
		return;
	}
	capacity=roomAcount*capacity;
	if(count>capacity){
	    layer.msg('入住人数超过房间最大允许入住人数');
		return;
	}
	if(roomAcount>5){
	    layer.msg('房间最多预订5间，如需预订多间，请分开预订');
		return;
	}
	if(minAmount>0 && minAmount>count){
	    layer.msg('最少入住'+minAmount+'间房（含）以上');
		return;
	}
	
	
	return true;
}

/**
 * 更新索引序号
 * @param index
 * @returns
 */
function updateIndex(index){
	$("input[name='indexSeq']").each(function(){
		var v=$(this).val();
		if(v>index){
			$(this).val(v-1);
		}
	});
	$('#container_hotel .passanger-model').each(function (index,item) {
		$(this).find('.pass-bg').html(parseInt(index)+1);
	});
	$("input[name^='customers']").each(function(){
		var r = /^.+?\[(.+?)\].*$/;
		var m = r.exec($(this).attr("name"));
		if(parseInt(m[1])>index){
			 var ss = $(this).attr("name").replace(/\[[^\)]*\]/g,"["+(parseInt(m[1])-1)+"]");
			 $(this).attr("name",ss)
		}
	})
}

/**
 * 旅客信息转化
 * @param json
 * @returns
 */
function travellerTransform(json){
	var g = json.data.gusts;
	var ct = $("#com_type_i").val();// 公司类型 1笔克
	if(g.length > 0){
		var cost = $("#crm_costcenter").val(); // 成本中心是否必填  1:必填  2:不必填并且不显示  3:不必填并且显示
		var proj = $("#crm_projectinfo").val(); // 项目信息是否必填  1:必填  2:不必填并且不显示  3:不必填并且显示
		var projectinfoinput = $('.projectinfoinput_hidden').val();//项目中心标志判断 是否可以输入
		var costcenterinput = $('.costcenterinput_hidden').val(); //成本中心标志的判断 是否可以输入
		var everyPrice = $.trim($("#averageDaily_i").val());
		var isHuiChuan = $('.isHuiChuan').val();
		var index= $.trim($(".passanger-model").size());
		for (var i = 0; i <g.length; i++) {
			var gust=g[i];
			var gid=gust.userId;
			var module=$(".module").val();
			var html='';
			var dataId = '';
			if(module=="hotel"){
				if(gid!=null){
					dataId = gid;
					gid='temp_'+gid;
				}else{
					if(gust.userId!=null){
						dataId = gust.userId;
						gid='employee_'+gust.userId;
					}
				}
				html=
				 '<ul class="passanger-model border-top-dashed" data-model="passenger" data-name="' + gust.uname + '" data-id="' + dataId + '" id="'+gid+'">'+
				 '<li class="e-p-model font-size-12">'+
				 	'<div class="clear margin-bottom-10 alert_content">'+
				 		'<span class="float-left p-m-name clear position">'+
				 			'<span class=" pass-bg position-ab">'+(parseInt(index)+1)+'</span>'+
				 			'<input type="hidden" name="customersModel['+index+'].userId" value="'+gust.userId+'" class="emp_id"/>'+ // 员工id
				 			'<input type="hidden" name="customersModel['+index+'].gender" value="'+(gust.gender!=null?gust.gender:"U")+'"/>'+ // 员工性别 F 女，M 男, U 保密
				 			'<input type="hidden" name="customersModel['+index+'].accountNo" value="'+(gust.accountNo!=null?gust.accountNo:"")+'"/>'+ // 员工工号
				 			'<input type="hidden" name="customersModel['+index+'].uname" value="'+(gust.uname!=null?gust.uname:"")+'" class="emp_uname"/>'+ // 员工姓名
				 			'<input type="hidden" name="customersModel['+index+'].levelId" value="'+(gust.levelId!=null?gust.levelId:"")+'" class="emp_rank"/>'+ // 员工职级
				 			'<input type="hidden" name="customersModel['+index+'].standard" class="emp_standard_'+gust.userId+'" value=""/>'+ // 员工住宿标准价--日均价标准
				 			'<input type="hidden" name="customersModel['+index+'].priceAvg" class="emp_priceAvg_'+gust.userId+'" value="' + everyPrice + '"/>'+ // 订单日均价
				 			'<input type="hidden" name="customersModel['+index+'].overAvg" class="emp_overAvg_'+gust.userId+'" value=""/>'+ // 日均价超出部分  正数为超出，负数为节省
				 			'<input type="hidden" name="customersModel['+index+'].costDeptId" value/>'+ // 费用承担部门ID
				 			'<input type="hidden" name="customersModel['+index+'].costDeptName" value/>'+ // 费用承担部门名称
				 			'<input type="hidden" name="customersModel['+index+'].language" value="cn"/>'+ // 短信语言
				 			'<input type="hidden" name="customersModel['+index+'].mappring" value="0"/>'+ // 合住映射关系  序号相同表示合住房间  0-表示不合住
				 			'<input type="hidden" name="customersModel['+index+'].vip" value="'+(gust.vip!=null?gust.vip:"")+'"/>'+ // vip标记 0:是vip,1:不是vip
				 			'<input type="hidden" name="customersModel['+index+'].commonLinkId" value="'+gust.userId+'" class="emp_extend"/>'+ // 常用联系人的id-类型
				 			'<span class="p-every-passes text-ellipsis" title="'+gust.uname+'">'+gust.uname+'</span>'+ 
			 			'</span>'+
			 			'<div class="float-left clear">';
			 			if($("#addempflageCustomer").val()=="1" || ($("#addempflageCustomer").val()=="0" && gust.userId == $("#user_id_").val())){
			 				html += '<span class="edit_p edit_p_s">编辑</span>';
			 			}
			 			html += '<span class="remove_p e-p-delete e-p-delete" data-gust="'+gid+'">'+
			 					'删除<input type="hidden" name="indexSeq" value="'+index+'"/>'+ // 当前员工下表从0开始
		 					'</span>';
					html += '</div>'+
					'</div>'+
					'<div class="clear" data-phone="content">'+
						'<div class="clear"><div class="book-model-c-10 input-c position float-left p-w-50">'+
							'<div class="b-m-c-t">手机号码：</div>'+
							'<div class="input-c input-225">'+ // 当前员工电话
								'<input  type="text" maxlength="11" name="customersModel['+index+'].phone" class="input border-0" datatype="/^1[0123456789]{10}$/" ignore="ignore" data-phone="true" errormsg="请输入正确的手机号码" nullmsg="手机号与邮箱至少填写一项" unselectable="on" readonly value="'+(gust.phone!=null?gust.phone:"")+'">'+
							'</div>'+
						'</div>'+
						'<div class="book-model-c-10 input-c position float-left p-w-50">' +
						'<div class="b-m-c-t">发送通知：</div>' ;
						html += customerSms(gust, index);
						html += customerEmail(gust, index);
						html +='</div>'+
						'<div class="book-model-c-10 input-c position float-left p-w-50">'+
							'<div class="b-m-c-t">邮箱：</div>'+
							'<div class="input-c input-225">'+ // 当前员工邮箱
								'<input type="text"  name="customersModel['+index+'].email" class="input border-0" datatype="phone" errormsg="请输入正确的邮箱" nullmsg="电话与邮箱至少填写一项" unselectable="on" readonly value="'+(gust.email!=null?gust.email:"")+'">'+
							'</div>'+
						'</div>'+
						'<div class="book-model-c-10 input-c position float-left p-w-50">'+
							'<div class="b-m-c-t">部门：</div>'+
							'<div class="input-c input-225 ">'+ // 当前员工部门id 和 部门name
								'<input type="hidden" name="customersModel['+index+'].deptId" class="input" unselectable="on" readonly value="'+(gust.deptId!=null?gust.deptId:"")+'">'+
								'<input type="text"  name="customersModel['+index+'].deptName" class="input deptName_ citySel border-0" unselectable="on" readonly datatype="*" nullmsg="请选择部门" value="'+(gust.deptName!=null?gust.deptName:"临时旅客")+'">'+
							'</div>'+
						'</div>';
                 
                 html += 
            	 	'<div class="book-model-c-10 input-c position float-left p-w-50">'+
            	 		'<div class="b-m-c-t">国籍：</div>'+
            	 		'<div class="input-c input-225">'+ // 当前员工国籍
            	 			'<input  autocomplete="off" type="text" name="customersModel['+index+'].nationlity" class="input border-0" unselectable="on" readonly value="中国">'+
        	 			'</div>'+
            	 	'</div></div>';
                 html+='<div class="clear">';
				if(cost!="2"){ // 成本中心
					var cosName = gust.costName == null ? "" : gust.costName;
					if($("#bookSources").val()=="1" && cosName == "" && $("#oacostname").val()!=""){
						cosName = $("#oacostname").val();
					}
					html +=
						'<div class="book-model-c-10 input-c position float-left p-w-50">'+
						'<div class="b-m-c-t">成本中心：</div>'+
						'<div class="input-c input-225 costCenter-c position">'+ // 当前员工成本中心id和成本中心name
						'<input type="text" ' + (cost == "1" ? ('datatype="*"') : "") + 'nullmsg="请选择'+(costcenterinput==1?"或输入":"")+'"  placeholder="请选择'+(costcenterinput==1?"或输入":"")+'" name="customersModel['+index+'].costName" class="input costCenter-input" depid="'+(gust.deptId!=null?gust.deptId:"")+'" empid="'+(gust.userId==null?"":gust.userId)+'" value="'+cosName+'" autocomplete="off">'+
						'<input type="hidden" name="customersModel['+index+'].costId" class="costCenterId" value="'+(gust.costId!=null?gust.costId:"")+'">'+
						(cost == "1" ? '<b class="position-ab red">*</b>' : '')+
						'</div>'+
						'</div>';
				}
				if(proj!="2"){ // 项目编号
					var itemNumber = gust.itemNumber == null ? "" : gust.itemNumber;
					if($("#bookSources").val()=="1" && itemNumber == "" && $("#oaproname").val()!=""){
						itemNumber = $("#oaproname").val();
					}
					html +=
						'<div class="book-model-c-10 input-c position float-left p-w-50">'+
						'<div class="b-m-c-t isHuiChuan_text">'+(ct=="1"?"SHOWNAME":(isHuiChuan==1?"项目编码":"项目中心"))+'：</div>'+
						'<div class="input-c input-225 project-c position">'+ // 当前员工项目中心id和项目中心name
						'<input  type="text" ' + (proj == "1" ? 'datatype="*"' : "") + 'nullmsg="请'+(ct=="1"?"填写SHOWNAME":(projectinfoinput==1?"选择或输入":"选择"))+'" placeholder="请'+(ct=="1"?"填写SHOWNAME":(projectinfoinput==1?"选择或输入":"选择"))+'" name="customersModel['+index+'].itemNumber" class="input '+(ct != "1" ? "project-input" : "")+'" value="'+itemNumber+'" autocomplete="off">'+
						'<input type="hidden" name="customersModel['+index+'].itemNumberId" value="'+(gust.itemNumberId!=null?gust.itemNumberId:"")+'" class="projectId">'+
						(proj == "1" ? '<b class="position-ab red">*</b>' : '')+
						'</div>'+
						'</div>';
					
					if(ct == "1"){
						html +=
							'<div class="book-model-c-10 input-c position float-left p-w-50">'+
							'<div class="b-m-c-t">SHOWCODE：</div>'+
							'<div class="input-c input-225 costCenter-c position">'+ // 笔克showCode
							'<input type="text" autocomplete="off" datatype="*" nullmsg="请填写SHOWCODE" name="customersModel['+index+'].showCode" class="input" value="">'+
							'<b class="position-ab red">*</b>'+
							'</div>'+
							'</div>';
					}
				}
             	'</div></div></li></ul>';
				++index;
			}
			$("#container_"+module).append(html);
			hotel_obj.contactCallBack_();
			
		}
	}
}
// 短信
function customerSms(gust, index){
	var html = "";
	if(gust.phone==null || gust.phone=="" || !isPhoneSimp(gust.phone)){
			html += '<div class="label label-checkbox cursor notice-margin click_select_qh show_choice_default" style="margin-top: 6px;" data-value="0" data-data="" data-type="sms">'+
				'<span class="show_choice"></span>'+
				'<input type="hidden" name="customersModel['+index+'].isSend" value="0">'+ // 是否发生通知
				'<span class="color-666">短信</span>'+
			'</div>';
		} else {
			html += '<div class="label label-checkbox cursor notice-margin click_select_qh label-select-checkbox" style="margin-top: 6px;" data-value="1" data-data="'+gust.phone+'" data-type="sms">'+
				'<span class="show_choice"></span>'+
				'<input type="hidden" name="customersModel['+index+'].isSend" value="1">'+ // 是否发生通知
				'<span class="color-666">短信</span>'+
			'</div>';
		}
	return html;
}
// 邮件
function customerEmail(gust, index){
	var html = "";
	if(gust.email==null || gust.email=="" || !isEmail(gust.email)){
		html += '<div class="label label-checkbox cursor notice-margin click_select_qh show_choice_default" style="margin-top: 6px; margin-left: 60px;" data-value="0" data-data="" data-type="email">'+
			'	<span class="show_choice"></span>'+
			'	<input type="hidden" name="customersModel['+index+'].isSendEmail" value="0">'+ // 是否发生通知
			'	<span class="color-666">邮件</span>'+
		'</div>';
	}else{
		html += '<div class="label label-checkbox cursor notice-margin click_select_qh label-select-checkbox" style="margin-top: 6px; margin-left: 60px;" data-value="1" data-data="'+gust.email+'" data-type="email">'+
			'	<span class="show_choice"></span>'+
			'	<input type="hidden" name="customersModel['+index+'].isSendEmail" value="1">'+ // 是否发生通知
			'	<span class="color-666">邮件</span>'+
		'</div>';
	}
	return html;
}

/*间隔计算*/
function  dateDiff(sDate1,  sDate2){
	//sDate1和sDate2是2006-12-18格式
	var  aDate,  oDate1,  oDate2,  iDays;
	aDate  =  sDate1.split("-");
	//调用Date的构造函数，转换为12-18-2006格式
	oDate1 = new Date(aDate[0] , aDate[1]- 1 ,aDate[2]) ;
	aDate = sDate2.split("-") ;
	
	oDate2  =  oDate2 = new Date(aDate[0] , aDate[1] - 1, aDate[2]) ;
	//把相差的毫秒数转换为天数
	iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24);
	return  iDays
}



//function addGust(){
//	$roomNumber=$("input[name='roomCount']");
//	var limit=parseInt($roomNumber.attr("data-limit"));//剩余房间数
//	var rnum=$(".passanger-model").length;//乘客人数
//	var roomAcount=$roomNumber.val();//房间数
//	var capacity=$("#capacity").val()!=""?$("#capacity").val():1;//房间最大入住人数
//	if(rnum<=0){
//		capacity=1*capacity;
//	}else{
//		if(rnum<5){
//			capacity=(roomAcount+1)*capacity;
//		}else{
//			capacity=roomAcount*capacity;
//		}
//	}
//	if(limit>0 && limit<=roomAcount){
//		layer.tips('预订房间数不能超过剩余量', '#roomCount');
//		return false;
//	}
//	if(roomAcount<5){
//		$roomNumber.val(rnum+1);
//		roomRate();
//		return true;
//	}else{
//		if(rnum<capacity){
//			return true;
//		}else{
//		    layer.tips('房间最多预订5间，如需预订多间，请分开预订', '#roomCount');
//			return false;
//		}
//	}
//}


/**
 * 增加房间数
 * @returns
 */

function addRoom(add,size){
	var $roomNumber=$("input[name='roomCount']");
	var limit=parseInt($roomNumber.attr("data-limit"));
	var passanger = $(".passanger-model").length;
	var rnum=1;
	if(add && passanger==0){
		rnum=0;
	}else{
		rnum=parseInt($roomNumber.val());
	}
	if(limit>0 && limit<=rnum){
		if($(".layer-container").is("div")){
			layer.msg('预订房间数不能超过剩余量');
		}else{
			layer.tips('预订房间数不能超过剩余量', '#roomCount');
		}
		return false;
	}
	if((size != undefined ? (rnum + size) : (rnum + 1)) <= 5){
		$roomNumber.val(rnum + (size != undefined ? size : 1));
		roomRate();
		return true;
	}else{
		if($(".layer-container").is("div")){
			layer.msg('房间最多预订5间，如需预订多间，请分开预订');
		}else{
			layer.tips('房间最多预订5间，如需预订多间，请分开预订', '#roomCount');
		}

		return false;
	}
}

/**
 * 减少房间数
 * @returns
 */
function removeRoom(){
	$roomNumber=$("input[name='roomCount']");
	var passanger=$(".passanger-model").length;//乘客人数
	var rnum=parseInt($roomNumber.val());
	if(passanger>=5){
	     return;
	}
	if(rnum>1){
		 $roomNumber.val(rnum-1);
		 roomRate();
	}
}

function roomRate(){
	var rate=$("#unitPrice").val(); // 产品价格
	var guaranteeCost=$("#guaranteeCost").val(); //
	var roomNumber=$("input[name='roomCount']").val(); // 房间数
	var roomRate=mul(rate,roomNumber); // 产品总价*房间数
	var rateType=$("#rateType").val(); // 服务费手续方式 jianye-间夜   order-订单  per-百分比 
	var rateValue=$("#rateValue").val(); // 服务费对应的值
	var rateUnit=$("#rateUnit").val(); // 百分比计算基准 按照单Or月流水  1--订单  2-月流水
	var coverCharge=0.0; // 服务费
	guaranetAmout(roomNumber,guaranteeCost);//超量担保
	var isGuarantee=$("#isGuarantee").val();
	if("jianye"==rateType || "order"==rateType) {
		if("order"==rateType){
			coverCharge=parseInt(rateValue).toFixed(2);
		}else {
			var time1 = Date.parse(new Date($.trim($("#checkIn").val())));
			var time2 = Date.parse(new Date($.trim($("#checkOut").val())));
			var dayNum = Math.abs(parseInt((time2 - time1)/1000/3600/24)); // 入住天数
			coverCharge=mul(mul(rateValue,dayNum),roomNumber).toFixed(2); // 服务费*入住天数*房间数
		}
	}
	if("per"==rateType && rateValue!=""){//百分比值
		if("1"==rateUnit){
			coverCharge=mul(roomRate,div(rateValue,100)).toFixed(2); // 产品总价*百分比
		}
	}
    var totalPrice=add(roomRate,coverCharge); // 产品总价+服务费
	if((roomRate+"").indexOf(".")<0){
		roomRate=roomRate+".0";
	}
	if((totalPrice+"").indexOf(".")<0){
		totalPrice=totalPrice+".0";
	}
	var arr = new Array();  
	$(".dailyPrice").each(function(){
		arr.push($(this).attr("id"));  
		arr.sort(function(a, b){  
		    return a > b ? 1 : -1;  
		});  
	});
	var guarantee=0.0;
	if(isGuarantee=="true"){
		if(guaranteeCost=="FirstNightCost"){
			guarantee=$("#"+arr[0]).attr("data-rate");
		}
		if(guaranteeCost=="FullNightCost"){
			$(".dailyPrice").each(function(index,el){
				guarantee=add($(el).attr("data-rate"),guarantee);
			});
		}
		guarantee=mul(guarantee,roomNumber); // 担保总金额=担保金额*房间数
		if((guarantee+"").indexOf(".")<0){
			guarantee=guarantee+".0";
		}
	}
	//服务费
	$("#span_coverCharge").html(coverCharge);
	$("#coverCharge").val(coverCharge);
	$("#span_guarantee").html(guarantee);
	$("#guaranteeRate").val(guarantee);
	$("#guaranteeRoomUnit").html(guarantee)
	$("#s_room_rate").html(roomRate);
	$("#s_room_subtotal").html(rate+" * "+roomNumber+" + "+coverCharge+" = "+totalPrice);
	$("#totalRate_i").val(totalPrice);
}

function guaranetAmout(roomNumber,guaranteeCost){
	//超量担保
	var $guaranteRule=$("#guaranteRule");
	var guaranteeType=$guaranteRule.attr("data-guaranteeType");
	if(guaranteeType=="OVER_AMOUNT"){
		var changeRule=$guaranteRule.attr("data-changeRule");
		var amount=$guaranteRule.attr("data-amount");
		if(amount<=roomNumber){
			$("#isGuarantee").val("true");
			$("#cancelRule").html('<span class="globalColor">'+(changeRule=='NeedSomeDay'?'限时取消':changeRule=='NoChange'?'不可取消':'免费取消')+'</span> ： '+$guaranteRule.attr("data-cancelRule"));
			$("input[name='refundType']").val(changeRule);
			$("input[name='refundRule']").val($guaranteRule.attr("data-cancelRule"));
			$("#p_guarante").removeClass("hide");
		}else{
			$("#isGuarantee").val("false");
			$("#guaranteeType").val("");
			var refundType=$("#refund_type_i").val();
			var refundRule=$("#refund_rule_i").val();
			$("input[name='refundType']").val(refundType);
			$("input[name='refundRule']").val(refundRule);
			$("#cancelRule").html('<span class="globalColor">'+(refundType=='NeedSomeDay'?'限时取消':refundType=='NoChange'?'不可取消':'免费取消')+'</span> ： '+refundRule);
			$("#p_guarante").addClass("hide");
		}
	}
}

// 编辑员工信息
$("body").on("click",".edit_p",function(){
	editPass_($(this));
});

//关闭编辑员工的窗口
$("body").on("click",".close-person",function(){
	$(".modal-model").remove();
});

// 保存编辑员工信息
$("body").on("click","#save-pass-edit",function(){
	var $this_ = $(this),
		$form = $this_.parents("form");
	$form.Validform({
		ajaxPost: true,
		tiptype:function(msg,o,cssctl){
			if(msg != ""){
				layer.msg(msg);
			}
		},
		datatype:{
			"phoneedit":function(gets,obj,curform,regxp){
				/*参数gets是获取到的表单元素值，
				  obj为当前表单元素，
				  curform为当前验证的表单，
				  regxp为内置的一些正则表达式的引用。*/
				var reg1=/^1[0123456789]{10}$/,
					reg2=/^\w+([-+.@\w])*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
					mobile=curform.find('[name="phone"]');
				if(reg1.test(mobile.val())){return true;}
				if(reg2.test(gets)){return true;}

				return false;
			}
		},
		callback: function(data){
			if(data.status === 200){
				layer.msg("保存成功");
				fullMation();
				setTimeout(function(){
					$this_.parents(".modal-model").remove();
				},2000);
				return;
			}
			layer.msg(data.msg);

		}
	});
	function fullMation () {
		var $parent = $this_.parents("form"),
			id = $.trim($parent.find('[name="id"]').val()),
			name = $.trim($parent.find('[name="name"]').val()),
			phone = $.trim($parent.find('[name="phone"]').val()),
			email = $.trim($parent.find('[name="email"]').val()),
			nationality = $.trim($parent.find('[name="nationality"]').val()),
			$pageParent = $(".passanger-model[data-id='" + id + "']");
		$pageParent.attr("data-name",name);
		$pageParent.find(".p-every-passes").attr("title",name).html(name);
		$pageParent.find("input[name$='uname']").val(name);
		$(".contact_item[id='" + id + "']").html(name);
		$pageParent.find("input[name$='phone']").val(phone);
		$pageParent.find("input[name$='email']").val(email);
		$pageParent.find("input[name$='nationlity']").val(nationality);
		$pageParent.find("input[name$='isSend']").parent().attr("data-data", phone);
		$pageParent.find("input[name$='isSendEmail']").parent().attr("data-data", email);
		$pageParent.find("input[name$='isSend']").parent().removeClass('show_choice_default');
		$pageParent.find("input[name$='isSendEmail']").parent().removeClass('show_choice_default');
		if(phone == "" || !isPhoneSimp(phone)){
			$pageParent.find("input[name$='isSend']").parent().removeClass('label-select-checkbox');
			$pageParent.find("input[name$='isSend']").parent().addClass('show_choice_default');
			$pageParent.find("input[name$='isSend']").val("0");
		}else{
			$pageParent.find("input[name$='isSend']").parent().removeClass('show_choice_default');
			$pageParent.find("input[name$='isSend']").parent().addClass('label-select-checkbox');
		}
		if(email == "" || !isEmail(email)){
			$pageParent.find("input[name$='isSendEmail']").parent().removeClass('label-select-checkbox');
			$pageParent.find("input[name$='isSendEmail']").parent().addClass('show_choice_default');
			$pageParent.find("input[name$='isSendEmail']").val("0");
		}else{
			$pageParent.find("input[name$='isSendEmail']").parent().removeClass('show_choice_default');
			$pageParent.find("input[name$='isSendEmail']").parent().addClass('label-select-checkbox');
		}
	}
});
function editPass_ ($this) {
		var titleName = "入住人",
			$this = $this,
			$li = $this.parents("li"),
			name = $.trim($li.find("input[name$=uname]").val()),
			mobile = $.trim($li.find("input[name$=phone]").val()),
			email = $.trim($li.find("input[name$=email]").val()),
			guoji = $.trim($li.find("input[name$=nationlity]").val());
			id = $.trim($li.find("input[name$=commonLinkId]").val());
		var str =
			'<div class="modal-model">' +
				'<div class="modal-mask"></div>' +
				'<div class="modal-content edit-passenger animated bounceInDown">' +
					'<div class="p-s-title position clear">' +
						'<span class="float-left font-size-14">修改' + titleName + '信息</span>' +
						'<span class="position-ab close-person edit-pass-close cursor">×</span>' +
					'</div>' +
					'<div class="p-s-tContent">' +
						'<div class="tab-c-c">' +
							'<form action="/shopping/updateEmp/hotel" method="post" id="save-pass-edit-form">' +
								'<input type="hidden" data-mation="empEdit_">' +
								'<div class="clear font-size-12 padding-bottom-14">' +
									'<div class="float-left position input-c position">' +
										'<span class="float-left">姓名：</span>' +
										'<input type="text" name="name" maxlength="20" value="' + name + '" class="input edit-name-input" placeholder="请输入姓名" datatype="*2-20" nullmsg="请填写姓名" errormsg="姓名内容过短（小于2个字符）/过长（大于20个字符）">' +
										'<input type="hidden" name="id" value="' + id + '">' +
										'<b class="nessary-b">*</b>' +
									'</div>' +
									'<div class="float-left position input-c">' +
										'<span class="float-left">手机号码：</span>' +
										'<input type="text" name="phone" maxlength="11" value="' + mobile + '" class="input" placeholder="请输入联系方式" datatype="/^1[0123456789]{10,10}$/" ignore="ignore" errormsg="请输入正确的手机号" nullmsg="手机号码和邮箱至少填一项">' +
									'</div>' +
								'</div>' +
								'<div class="clear font-size-12 padding-bottom-14">' +
									'<div class="float-left position input-c position">' +
										'<span class="float-left">邮箱：</span>' +
										'<input type="text" name="email" maxlength="50" value="' + email + '" class="input user_email" placeholder="请输入邮箱" datatype="phoneedit" errormsg="请输入正确的邮箱" nullmsg="手机号码和邮箱至少填一项">' +
									'</div>' +
									'<div class="float-left position input-c position">' +
										'<span class="float-left">国籍：</span>' +
										'<input type="text" maxlength="20" name="nationality" value="' + guoji + '" class="input" placeholder="请输入国籍" datatype="*1-20">' +
									'</div>' +
								'</div>' +
								'<div class="text-align">' +
									'<button type="submit" class="btn btn-default-new btn-big" id="save-pass-edit">保存</button>' +
								'</div>' +
							'</form>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
		$('body').append(str);
}
//修改部门
// $("body").on("click",".deptName_",function(){
// 	editDept($(this));
// });
function editDept($this){
	$.ajax({
		type: 'POST',
		url: '/dept/0',
		success: function (data) {
			if(data.status === 200){
				showDept(data,$this);
				return;
			}
			layer.msg(data.msg);
		},
		error: function (error) {
			layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
		}
	});
	function showDept (data,$this) {
		var  data_ = JSON.parse(data.data);
		$(function(){
			var setting = {
				view: {dblClickExpand: false},
				data: {simpleData: {enable: true}},
				callback: {onClick: onClick}
			};
			var zNodes = data_;
			function onClick(e, treeId, treeNode) {
				$this.val(treeNode.name);
				$this.prev('input[type="hidden"]').val(treeNode.id);
				$("#menuContent").hide();
			}
			$.fn.zTree.init($("#treeDemo"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		});
		showMenu($this,1);
	}
}
/*输入自动填充*/

$("body").on('click','#book-contacts',function(e) {
	e.stopPropagation();
	var arrs = [];
	$('.passanger-model').each(function () {
		arrs.push({
			name: $(this).attr('data-name'),
			id: $(this).attr('data-id'),
			phone: $(this).find("[name$='phone']").val(),
			email: $(this).find("[name$='email']").val()
		});
	});
	link_main(arrs, $(this));
});


function link_main(data_arr,$this) {
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器
		eventMain:eventMain, 		// 单击列表的主函数
		url:'', 		// 请求url
		this_:$this, 				// 当前元素
		showField:"name",			// 要展示在当前触发元素里的字段
		hideField:"phone,email",				// 要展示在其他位置的字段
	},1,data_arr);
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){
		if(data.length <= 0){
			return;
		}
		this.volidate(data); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		var parents=active.parents('.lianxiren');
		parents.find(".link-phone").val(this_.attr("data-phone"));
		parents.find(".link-email").val(this_.attr("data-email"));
	}
	
}



//超标审批
function aotodos(){
	var prohibit =[];
	var standardArrs =[];
	if(hotel_obj.standardPeople.flages){
		var ids = hotel_obj.standardPeople.flages.policy;
		if((typeof(ids) != "undefined") && ids != null){
			$(".emp_id").each(function(index){
				var this_ = $(this);
				$.each(ids,function(index,items){
					var flases = items.split("_");
					if(flases[1]==0){
						if(this_.val() == flases[0] && flases[3]*100>0){
							prohibit.push({id:flases[0],name:this_.parents(".passanger-model").attr("data-name"),price:flases[2]});
						}
					}else if(flases[1]==2 && flases[3]*100>0){
						if(this_.val() == flases[0] ){
							standardArrs.push({id:flases[0],name:this_.parents(".passanger-model").attr("data-name"),price:flases[2]});
						}
					}
				});
			});
		}
	}
	return {prohibit:prohibit,standardArrs:standardArrs}
}


//初始化分销
$.ajax({
	url:"/crm/jiesuan",
	type:"post",
	success:function(data){
		if(data.data.fukuankemu=="4"){
			$.ajax({
				url:"/crm/employee/getDefaultDept",
				type:"post",
				success:function(data){
					if(data.data!=""&&data.data!=null){
						$(".fanxian-linshi").val(data.data.id)
					}
				}
			});
			$(".fanxian").val("true");
		}
	}
});

//短信和邮箱切换发送通知
$('body').on("click",'.click_select_qh',function(){
	var dd = $(this).attr('data-data');
	var t = $(this).attr('data-type');
	if(t=="sms"){
		if(dd=="" || !isPhoneSimp(dd)){
			selectSend(this, false);
		}else{
			selectSend(this, true);
		}
	}else{
		if(dd=="" || !isEmail(dd)){
			selectSend(this, false);
		}else{
			selectSend(this, true);
		}
	}
});

function selectSend(obj,status){
	if(!status){
		// 不可选
		$(obj).attr('data-value', "0");
		$(obj).removeClass('label-select-checkbox');
		$(obj).addClass('show_choice_default');
		$(obj).find("input").val("0");
	}else{
		var dv = $(obj).attr('data-value');
		$(obj).removeClass('show_choice_default');
		if(dv==1){
			$(obj).attr('data-value', "0");
			$(obj).removeClass('label-select-checkbox');
			$(obj).find("input").val("0");
		}else{
			$(obj).attr('data-value', "1");
			$(obj).addClass('label-select-checkbox');
			$(obj).find("input").val("1");
		}
	}
}

// 联系人检查短信 邮箱发送
function contactCheckSend(obj, type){
	var value = $(obj).val();
	if(type==1){
		// 短信
		var sms = $("input[name='contact.msgAffirm']");
		sms.parent().attr("data-data", value);
		if(value=="" || !isPhoneSimp(value)){
			sms.parent().removeClass('label-select-checkbox');
			sms.parent().addClass('show_choice_default');
			sms.val("0");
		}else{
			sms.parent().removeClass('show_choice_default');
			sms.parent().addClass('label-select-checkbox');
		}
	}else{
		// 邮箱
		var em = $("input[name='contact.isSendEmail']");
		em.parent().attr("data-data", value);
		if(value=="" || !isEmail(value)){
			em.parent().removeClass('label-select-checkbox');
			em.parent().addClass('show_choice_default');
			em.val("0");
		}else{
			em.parent().removeClass('show_choice_default');
			em.parent().addClass('label-select-checkbox');
		}
	}
	
}
