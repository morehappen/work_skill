/******* 酒店差旅政策 * author:zhanghao * O(∩_∩)O哈哈~ *******/
class HotelPolicy {
	constructor (msg,id) {
		this.msg = msg; //差旅政策
		this.id = id;
	}

	// 清空违背信息
	clearPolicy () {
		$('[data-violate="reason"]').html("");
		$(".weibei-container").hide();
		$('[name="overMsg"]').val("");
		$('[data-violate="other"] input').val("");
		$('[data-violate="showMation"]').html("").hide();
		$('.showMation_title').hide();
	}

	// 获取酒店差旅政策
	/*
	*	para: (type:object)
	*		global: 全局对象
	*		sendData = { // 请求参数
	*			empidLenvel : 员工id-员工职级，多个逗号分隔 （12,1212,）
	*			geolevel : 	当前城市级别,
	*			price : 酒店当前价格,
	*			coerceApprove : 是否强制审批 1是 0否
	*		}
	*
	* */
	getPolicy (global,sendData){
		HotelPolicy.prototype.global == undefined ? HotelPolicy.prototype.global = global : "";
		$.ajax({
			type: "POST",
			url: "/hotel/approveRule",
			data: sendData,
			success : data => {
				if(data.status === 200) {
					this.getStrictPolicy(data.data);
					return;
				}
				layer.msg(data.msg);
			},
			error: error => {
				layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
	}

	// 获得综合差旅政策 （最严格差旅政策）
	getStrictPolicy (data) {
		let data_ = data,
			controller = data_.approveType, // 0 不允许预订，1 审批， 2 只做提醒, -1无需审批
			policy = data_.empApproveType; // 差旅政策
		// 超标原因重置
		this.resetReson();
		if(!(policy instanceof Array && policy.length > 0)){
			this.global.policyCallback && this.global.policyCallback ({
				controller: controller,
				isViolate:0,
				isShut:0,
				policy: policy
			});
			return;
		}

		let violate = null,
			ids = '',
			standPrice = '', // 差旅标准价格
			beyondPrice = ''; // 超出价格
		$.each(policy,(index,item) => {
			let itemArr = item.split("_"),
				e_data = function () {
					return {
						ids: itemArr[0],
						controller: itemArr[1], // 管控方式
						price: parseFloat(itemArr[2]),
						exceedPrice: parseFloat(itemArr[3]),
						cls:controller
					}
				};
			ids += itemArr[0] + "-";
			standPrice += itemArr[2] + "-";
			beyondPrice += itemArr[3] + "-";
			if(violate === null){
				violate = e_data();
				return;
			}
			if(itemArr[1] == controller){
				violate = e_data();
			}
		});
		violate.isViolate = violate.exceedPrice > 0 ? 1 : 0;
		violate.ids = ids;
		violate.standPrice = standPrice;
		violate.beyondPrice = beyondPrice;
		violate.isShut = 1;
		violate.policy = policy;
		this.global.policyCallback &&　this.global.policyCallback (violate);
		this.getViolateReason(violate);
		this.showViolateItem(violate);
		
	}

	// 获取超标原因
	/*
	*	para:
	*		violate(object):{
	*			ids: itemArr[0],
				controller: itemArr[1], // 管控方式
				price: parseFloat(itemArr[2]),
				exceedPrice: parseFloat(itemArr[3])
				policy: 完整的差旅政策
				isViolate： 是否违背 1|0
	*	    }
	*
	* */
	getViolateReason (violate) {
		if(violate.isViolate === 0){
			this.resetReson();
			return;
		}
		$.ajax({
			type: "POST",
			url: "/shopping/baseData",
			data: {
				type: 'hotel'
			},
			success : data => {
				if(data.status === 200) {
					this.showViolateReason(data.data);
					return;
				}
				layer.msg(data.msg);
			},
			error: error => {
				layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
		return this;

	}

	// 展示超标事项
	showViolateItem (violate) {
		//name="overItem"
		let controller = violate.controller,
			isShut = violate.isShut,
			isViolate = violate.isViolate,
			price = violate.price,
			text = "当前城市超出了" + $("#cityLevel_i").val() + "线城市不得高于" + price + "元的差旅标准";
		if(isShut == 0){
			$("[data-violate='showMation']").html("").hide();
			$('.showMation_title').hide();
			return;
		}
		if(isViolate == 1){
			if(controller == 1){
				$("[data-violate='showMation']").html(text).show();
				$('.showMation_title').show();
				$("[name='overItem']").val(text);
				return;
			}
			if(controller == 0){
				$("[data-violate='showMation']").html(text + "，不允许预订").show();
				$('.showMation_title').show();
				$("[name='overItem']").val(text + "，不允许预订");
				return;
			}
		}
	}

	// 展示超标原因
	showViolateReason (data) {
		let msg = this.msg,
			id = this.id,
		 	val = $("#overMsgId_i").val(),
			qita = 0,
			overMsg = $('input[name="overMsg"]').val();
		if(!(data instanceof Array && data.length > 0)){
			layer.msg("请维护超标原因");
			return;
		}
		id = id == "" ? data[0].id : id;
		let option = function (data) {
				let list = "";
				list +=`<option value="">请选择</option>`;
				for(let i = 0; i < data.length; i++){
					//todo wangshengmei 2018-06-08 增加其他原因判断 ；
					if(id==data[i].id && data[i].name== "其他原因"){
						qita = 1;
					};
					list += `<option value="${data[i].id}">${data[i].name}</option>`;
				}
				return list;
			},
			html = `<select class="_dropDown_ hide" datatype="*" nullmsg="请选择超标原因" data-select="violate" name="" data-value="${val?val:""}">
					${option(data)}
					</select>`;
		
		$('[data-violate="reason"]').html(html);
		(new SelectMain()).creatSelect($('[data-select="violate"]'));
		$('[data-violate="container"]').find('[data-violate="content"]').show();
		if(qita==1){
			this.id == "" ? $('[data-violate="other"]').find("input").val("").attr("ignore","ignore") : $('[data-violate="other"]').show().find("input").val(msg).removeAttr("ignore");
			
		}else{
			this.id == "" ? $('[data-violate="other"]').find("input").val("").attr("ignore","ignore") : $('[data-violate="other"]').hide().find("input").val("");
			
		}
		msg==""?msg = data[0].name:msg;
		this.global.violateCallback && this.global.violateCallback(1,msg);
		return this;
	}
	// 超标原因重置
	resetReson () {
		this.global.violateCallback && this.global.violateCallback();
		$('[data-violate="other"]').hide().find("input").val("");
		$('[data-violate="content"]').hide();
		$('[data-violate="reason"]').html("");
		$('[data-violate="showMation"]').html("").hide();
		$('.showMation_title').hide();
	}

	//
	eventPolicy () {
		$("body").on("click",".drop_option li", event => {
			let this_ = $(event.target),
				select = this_.parents('.drop').find('select'),
				id = select.val(),
				msg = select.find(`option[value='${id}']`).html();
			if(select.is('[data-select="violate"]')){
				if(msg == "其他原因"){
					$('[data-violate="other"]').show().find("input").removeAttr("ignore").end().find(".danger-p").show();
				}else {
					$('[data-violate="other"]').hide().find("input").val("").attr("ignore","ignore").end().find(".danger-p").hide();
				}
				this.global.violateCallback && this.global.violateCallback(1);
			}
		});
		$("body").on("blur",'[data-violate="other"]',event => {
			let this_ = $(event.target),
				msg = this_.val();
			this.global.violateCallback && this.global.violateCallback(1,msg);
		});
		return this;
	}

}





























































