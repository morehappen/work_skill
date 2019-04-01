/***** author:zhanghao 2018-4-20 O(∩_∩)O~ *****/



class Approve {

	constructor (id) {
		this.id = id;
	}

	// 清空审批信息
	clearApprove () {
		$('[data-approve="container"]').hide();
		$('[data-approve="approveRule"]').html("");
		$('[data-approve="approvePerson"]').html("");
	}
	
	// 初始化审批信息

	initApprove () {
		let data = $.extend(true,[],this.data.data),
			length = data.length;
		if(length <= 0){
			$('[data-approve="container"]').hide();
			$(".sp-rule").html(`<input type="hidden" name="" value="">`); //没设置审批规则，防止后台空指针
			return;
		}
		this.viewApprovePerson(this.viewApproveRule(data)); // 视图审批人 ，内层为视图审批规则
		return this;
	}

	// 获取审批信息
	/*
	* 	para list
	* 	global_obj: 页面全局对象
	* 	para(object):
	* 		empids: 员工id 以-分割 如：90-09-
	* 		module: 模块类型， 值的选择列表：gjjp | gnjp | gptp | gpgq | gnhcp | hcptp | gnjd | gnyc
	* 		webeiflage: 0 | 1 0不违背，1违背 empids=&module=gnjd&webeiflage=0'
	* */
	getApprove (para,global_obj) {
		Approve.prototype.global_obj == undefined ? Approve.prototype.global_obj = global_obj : "";
		$.ajax({
			type: 'POST',
			url: `/shopping/approve?empids=${para.empids}&module=${para.module}&webeiflage=${para.webeiflage}&violatePrice=${para.violatePrice}`,
			dataType: 'json',
			success: data => {
				if(data.status === 200) {
					!Approve.prototype.data ? this.eventApprove : "";
					Approve.prototype.data = data; // 存储审批信息数据
					this.initApprove(); // 初始化审批信息
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

	// 视图审批规则
	/*
	* 	para:
	* 		eRule:审批规则数据
	* */
	viewApproveRule (data) {
		let rule = data,
			list = '',
			id = (this.id != "" && this.id != undefined) ? this.id : rule[0].id;
		for(let i = 0; i < rule.length; i++){
			let eRule = rule[i];
			list += `<option value="${eRule.id}">${eRule.name}</option>`;
		}
		$('[data-approve="approveRule"]').html(`<div class="float-left b-m-c-t">审批级别：</div> <div class="float-left"><select class="_dropDown_ hide" data-select="approveRule" name="" data-value="${id}">${list}</select></div>`);
		(new SelectMain()).creatSelect($('[data-select="approveRule"]'));
		return id; // 返回当前选中的审批规则id
	}
	//展示审批人
	/*
	*	para list
	*		id: 选中审批规则的id
	* */
	viewApprovePerson (id) {
		let eid = parseInt(id),
			ePerson = $.extend(true,[],this.data.data),
			selectData = null,
			shenpirens = null,
			level = [],
			list = '',
			compare = level => (a, b) => b[level] - a[level];
		this.global_obj.approveCallback && this.global_obj.approveCallback(eid); // 选中审批规则回调
		$('[data-approve="approvePerson"]').html("");
		for(let i = 0; i < ePerson.length; i++){
			if(ePerson[i].id === eid){
				selectData = ePerson[i];
				break;
			}
		}
		shenpirens = selectData.shenpirens.sort(compare);
		for(let i = 0; i < shenpirens.length; i++){
			let level_ = shenpirens[i].level;
			if(level.length === 0){
				level.push(level_);
				continue;
			}
			if(level_ !== level[level.length-1]){
				level.push(level_);
			}
		}
		for(let i = 0; i < level.length; i++){
			let level_ = level[i];
			list += `<div class="clear e-sp"><div class="float-left e-sp-t b-m-c-t">第${level_}级审批：</div>`;
			for(let i =0; i< shenpirens.length; i++){
				let eAp = shenpirens[i];
				if(level_ === eAp.level){
					list += `<div class="float-left sp-person" data-eapid="${eAp.id}">${eAp.name}</div>`;
					shenpirens.splice(i,1);
					--i;
					continue;
				}
			}
			list += `</div>`;
		}

		$('[data-approve="approvePerson"]').html(list);
		$('[data-approve="container"]').show();
		return;
	}

	eventApprove () {
		// 切换审批规则
		$("body").on("click",".drop_option li", event => {
			let this_ = $(event.target),
				select = this_.parents('.drop').find('select'),
				id = select.val();
			if(select.is('[data-select="approveRule"]')){
				this.viewApprovePerson(id);
			}
		});
		return this;
	}

}






