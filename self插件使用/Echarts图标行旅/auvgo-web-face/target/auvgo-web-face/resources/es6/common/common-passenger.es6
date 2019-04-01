/***** author:zhanghao 2018-4-20 O(∩_∩)O~ *****/
// import resources from '/resources/js/common/My97DatePicker/WdatePicker.js';
	class PassengerModel {

		constructor () {

		}

		// 初始化权限
		initAuthority () {
			let addempflag = $.trim($("#addempflage").val()), // 是否可以添加员工
				addcustflag = $.trim($("#addcustflage").val()), // 是否可以添加常用联系人
				isSearch =	1,// 是否显示搜索框
				AuthArr = [];

			isSearch == 1 ? AuthArr.push("queryView") : "";
			addempflag == 1 ? AuthArr.push("addEmpView") : "";
			addcustflag == 1 ? AuthArr.push("addOffenView") : "";
			PassengerModel.prototype.tabData = AuthArr;

			this.viemMain(isSearch == 1 ? this.queryView() : (addcustflag == 1 ? this.addEmpView() : (addempflag == 1 ? this.addOffenView() : "")),{
				addempflag,
				addcustflag,
				isSearch
			});

		}
		// 主视图函数
		/*
		* 	para:
		*		contentView: 初始化默认视图
		*		authority: 权限
		*					{
		*						addempflag, // 是否可添加员工 1|0
		*						addcustflag, // 是否可添加常用联系人 1|0
		*						isSearch	// 是否可搜索 1|0
			*				}
		* */
		viemMain (contentView,authority) {
			//${authority.addcustflag == 1 ? `<li ${authority.isSearch != 1 && authority.addempflag != 1 ? "class='layer-tab-target'" : ""}>新增常用联系人</li>` : ""}
			let html = $.trim(`<div class="layer-container">
							<div class="layer-cover"></div>
							<div class="layer-content">
							<div class="layer-title">
								<span>选择入住人</span>
								<span class="layer-close">×</span>
							</div>
							<div class="layer-main">
								<div class="layer-select">
									<ul>${this.selectCusPerson()}</ul>
									<button>确定</button>
								</div>
								<ul class="layer-tab">
									${authority.isSearch == 1 ? `<li class="layer-tab-target">企业员工</li>` : ""}
									${authority.addempflag == 1 ? `<li ${authority.isSearch != 1 ? "class='layer-tab-target'" : "" }>新增员工</li>` : ""}
								</ul>
								<div class="layer-tab-content">${contentView}</div>
							</div>
						</div>
						</div>`),
				
				select_ = new SelectMain();
			$("body").append(html);
			$("body").addClass('modal-open');
			$(".layer-tab-content select").each(function(){
				select_.creatSelect($(this));
			});
			// console.log(this,$('body .staffRank'));
			if($('.staffRank').length>0){
				this.getEmpLevel($('.staffRank'),true);
			}
			return this;
		}

		// 已选中的常用联系人
		selectCusPerson () {
			let list = "";
			$(".passanger-model").each(function () {
				let this_ = $(this),
					id = $.trim(this_.attr("data-id")),
					name = $.trim(this_.attr("data-name"));
				list += `<li class="float-left hoverTips" data-id="${id}">${name}</li>`;
			});
			return list;
		}

		// 查询视图
		queryView () {
			let cookies = (new CookieMain()).readCookie()
				,list = "";
			// console.log(cookies);
			if(typeof cookies == 'object' && cookies instanceof Array){
				for(let i = 0; i < cookies.length; i++){
					let item = cookies[i];
					list += `<span class="e-history-p float-left cursor" data data-id="${item.id}" data-name="${item.name}">${item.name}</span>`;
				}
			}

			return $.trim(`<div class="clear font-size-12 history-container" data-history="container">
								<div class="color-cccccc float-left">历史记录：</div>
								<div class="float-left">
									${list}
								</div>
							</div>
							<div class="search-container position font-size-12 clear" data-search="container">
								<span class="search-icon position-ab"></span>
								<input type="text" class="input search-input" data-search="input" placeholder="员工姓名">
								<ul class="search-passenger-list mCustomScrollbar">
									
								</ul>
							</div>
						`);
		}


		// 新增员工视图
		addEmpView () {
			var this_=this;
			return $.trim(`
							<form action="/component/save/update/employee" method="post" id="addForm">
								<ul class="clear">
									<li class=" float-left position font-size-12 padding-bottom-14"style="width: 335px">
										<span class="ul-item-name float-left">证件姓名：</span>
										<input id="name_place" type="text" name="cert.username" class="input float-left" maxlength="20" datatype="*2-20" nullmsg="请填写员工姓名" errormsg="姓名内容过短（小于2个字符）/过长（大于20个字符）">
										<span class="position-ab ul-item-select">*</span>
											<span class="chinese"><img  id="chinese" src="/static/img/common/zhong.png"width="40px"height="20px"></span>
											<input type="hidden" name="cert.isChinese" value="1" id="is_chinese_i_">
									</li>
		                              
								     <li class=" float-left position font-size-12 padding-bottom-14">
										<span class="ul-item-name float-left">手机号码：</span>
										<input type="text" name="phone" class="input float-left" maxlength="11" datatype="/^1[0123456789]{10}$/" nullmsg="手机号不能为空！" errormsg="手机号格式错误！">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class=" float-left position font-size-12 padding-bottom-14 card_type">
										<span class="ul-item-name float-left">证件类型：</span>
										<select class="_select_ cert_type_i" name="cert.certtype" data-value="1" datatype="*1-10" nullmsg="请选择证件类型">
											<option value="">请选择</option>
											<option value="1">身份证</option>
											<option value="C">港澳通行证</option>
											<option value="G">台湾通行证</option>
											<option value="B">护照</option>
											<option value="ID">其他</option>
										</select>
											<span class="position-ab ul-item-select">*</span>
									</li>
									<li class=" float-left position font-size-12 remove-fenxiao padding-bottom-14  " style="margin-left: 60px">
										<span class="ul-item-name float-left">证件号码：</span>
										<input type="text" id="certno" name="cert.certificate" class="input float-left" maxlength="20" datatype="*"     nullmsg="请输入合法的证件号码">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="float-left position font-size-12 remove-fenxiao padding-bottom-14">
										<span class="ul-item-name float-left">员工部门：</span>
										<input type="text" name="deptName" id="citySel"  data-value="#treeDemo_18_span"   class="input float-left" readonly datatype="*2-50" nullmsg="请选择部门">
										<input type="hidden" name="depId" id="deptpid">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class=" float-left position font-size-12 remove-fenxiao p_select_list padding-bottom-14" style="margin-left: 60px">
										<span class="ul-item-name float-left">员工职级：</span>
										<select class="_select_ p-select staffRank" data-value="" name="zhiwei" value="" datatype="*1-10" nullmsg="请选择员工职级">
											<option value="">请选择</option>
										</select>
										<span class="position-ab ul-item-select">*</span>
									</li>
									<!--<li class="ul-item float-left position font-size-12 remove-fenxiao">-->
										<!--<span class="ul-item-name float-left">权限级别：</span>-->
										<!--<select class="_select_" name="depName" data-value="geren" datatype="*1-10" nullmsg="请选择权限级别">-->
											<!--<option value="geren">个人</option>-->
											<!--<option value="geren">个人</option>-->
											<!--<option value="all">全部</option>-->
											<!--<option value="dept">本部门及下级</option>-->
										<!--</select>-->
										<!--<span class="position-ab ul-item-select">*</span>-->
									<!--</li>-->
									<!--<li class="ul-item float-left position font-size-12 remove-fenxiao">-->
										<!--<span class="ul-item-name float-left">员工工号：</span>-->
										<!--<input type="text" id="pwd" name="accno" class="input float-left" maxlength="20" datatype="*1-20" nullmsg="请填写员工工号" errormsg="员工工号过长（大于20个字符）">-->
										<!--<span class="position-ab ul-item-select">*</span>-->
									<!--</li>-->
									
									<li class=" float-left position font-size-12 remove-fenxiao padding-bottom-14">
										<span class="ul-item-name float-left">审批规则：</span>
										<input type="hidden" name="approveId" value="">
										<input type="text" id="shengpiguize" autocomplete="off" class="input float-left" datatype="*" >
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="float-left position font-size-12 remove-fenxiao show padding-bottom-14" style="margin-left: 60px">
										<span class="ul-item-name float-left">出生日期：</span>
								<input type="yyymmdd" id="bd" name="cert.birthday" maxlength="10" class="input float-left"  onfocus="WdatePicker({dateFmt:'yyyyMMdd ',maxDate:'%y-%M-%d'})">
									</li>
									<li class=" float-left position font-size-12 remove-fenxiao show maring-bottom-20" >
										<span class="ul-item-name float-left" style="width: 75px;margin-left: -5px">证件有效期：</span>

									   <input type="text" name="cert.passportdate" autocomplete="off" class="input float-left"  onfocus="WdatePicker({dateFmt:'yyyyMMdd ',minDate:'%y-%M-%d'})" >
									</li>
									<li class="float-left position font-size-12 remove-fenxiao show padding-bottom-14" style="margin-left: 60px">
										<span class="ul-item-name float-left">签发地：</span>
										<input type="text"  name="cert.placeIssue"  class="input nationality"  nullmsg="请输入" placeholder="如：中国"/>
									</li>
									<li class=" float-left position font-size-12 remove-fenxiao show maring-bottom-20" style="width: 280px; height: 30px;">
									<span class="ul-item-name float-left">性别：</span>
									 <div class="label label-radio   clear vertical float-left"style="margin-top: 8px;margin-left: 20px" >
										<span class="show_choice"></span>
										<input type="radio" name="cert.sex" value="M"/>
										<span>男</span>
									</div>
									<div class="label label-radio   clear vertical float-left" style="margin-top: 8px;margin-left: 50px">
										<span class="show_choice"></span>
										<input type="radio" name="cert.sex" value="F" />
										<span>女</span>
									</div>
									</li>
									<li class=" float-left position font-size-12 remove-fenxiao show padding-bottom-14" style="margin-left: 57px">
										<span class="ul-item-name float-left">国籍：</span>
											<input  type="text"  name="cert.guoji"  class="input nationality"  nullmsg="请输入" placeholder="如：中国"/>
									</li>
										</ul>
								<div class="text-align" style="margin-top:10px;">
									<button type="submit" class="btn btn-3E4EB2  btn-big" id="save-addForm">保存</button>
								</div>
							</form>
						`);
		}
		//<li class="ul-item float-left position font-size-12 remove-fenxiao">
// <span class="ul-item-name float-left">审批规则：</span>
// <input type="hidden" name="approveid" value="">
// 	<input type="text" id="shengpiguize"  class="input float-left" datatype="*" >
// 	<span class="position-ab ul-item-select">*</span>
// 	</li>
		// 新增常用联系人视图
		addOffenView () {
			return $.trim(`
							<form action="/component/save/update/employee" method="post" id="addForm" data-type="cus">
								<ul class="clear">
									<li class="ul-item float-left position font-size-12">
										<span class="ul-item-name float-left">证件姓名：</span>
										<input type="text" id="name_place"  name="username" class="input float-left" maxlength="20" datatype="*2-20" nullmsg="请填写联系人姓名" errormsg="姓名内容过短（小于2个字符）/过长（大于20个字符）">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="ul-item float-left position font-size-12">
										<span class="ul-item-name float-left">手机号码：</span>
										<input type="text" name="mobile" class="input float-left"  maxlength="11" datatype="/^1[0123456789]{10,10}$/" nullmsg="手机号不能为空！" errormsg="手机号格式错误！" >
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="ul-item float-left position font-size-12">
										<span class="ul-item-name float-left">证件类型：</span>
										<select class="_select_" name="certtype" data-value="1" nullmsg="请选择证件类型" datatype="*1-10" nullmsg="请选择证件类型">
											<option value="1">身份证</option>
											<option value="C">港澳通行证</option>
											<option value="G">台湾通行证</option>
											<option value="B">护照</option>
											<option value="ID">其他</option>
										</select>
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="ul-item float-left position font-size-12">
										<span class="ul-item-name float-left">证件号码：</span>
										<input type="text"  name="certno"  maxlength="20" class="input float-left"  datatype="*0-20" nullmsg="请输入合法的证件号码">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<li class="ul-item float-left position font-size-12">
										<span class="ul-item-name float-left">出生日期：</span>
										<input type="text"  name="birthday"  maxlength="10" class="input float-left" id="born"  onfocus="WdatePicker({readOnly:true,dateFmt:'yyyyMMdd ',maxDate:'%y-%M-%d'})">
									</li>
								</ul>
								<div class="text-align">
									<button type="submit" class="btn btn-3E4EB2 btn-big" id="save-addForm">保存</button>
								</div>
							</form>
						`);
		}

        // 添加乘客
		addPassenger (name,id) {
			// console.log(name,id);
			if($(".layer-select ul").find(`li[data-id=${id}]`).is("li")){
				layer.msg("请不要重复添加");
				return;
			}
			$(".layer-select ul").append(`<li class="float-left hoverTips" data-id="${id}">${name}</li>`);
		}

		// 请求员工数据
		/*搜索员工
		* 	para:
		* 			keyword:键入的关键词
		*			callback:响应成功的回调函数
		* */
		getEmpData (keyword,callback) {
			$.ajax({
				type: 'POST',
				url: '/shopping/query/employee',
				data: {
					keyword: keyword,
					size:50
				},
				success: data => {
					// console.log(data);
					if(data.status === 200){
						callback(data.data);
						return;
					}
					layer.msg(data.msg);
				},
				error: error => {
					layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
				}
			});
		}

		// 展示员工数据
		/*
		* 	para：
		* 		empData: 员工数据 array
		* 		this_: 当前搜索框
		* */
		showEmpData (empData, this_) {
			let emp = empData.items,
				ele = this_,
				ul = ele.next(),
				length = emp != undefined ? emp.length : "",
				list = "";
			if(emp == undefined || length <= 0){
				ul.html(`<li class="clear">暂无符合的结果</li>`);
				return;
			}
			for(let i = 0; i < length; i++){
				let ePerson = emp[i];
				list += `
					<li class="clear" style="position:relative;">
						<input type="hidden" value="${ePerson.crmEmployee.id}" data-name="${ePerson.crmEmployee.name}">
						${ePerson.linkEmpid==1?`<span class="commonlyUsed">常用</span>`:""}
						<span class="s-p-l-name hoverTips">${ePerson.crmEmployee.name}</span>
						<span class="s-p-l-certno">${ePerson.crmEmployee.certno}</span>
						<span class="s-p-l-mobile" >${(ePerson.crmEmployee.mobile?ePerson.crmEmployee.mobile:"")}</span>
						<span class="s-p-l-certer hoverTips text-ellipsis">${ePerson.crmEmployee.deptname}</span>
					</li>
				`;
			}
			ul.html(list);

		}
		

		// 添加员工、常用联系人成功后回调
		/*
		* 	para:
		* 	data,保存成功后返回的数据
		* 	flag:true(常用联系人)|false(员工)
		* */
		addPersonSuccess (data,flag) {
			let data_ = data.data,
				empid = data_.id,
				name = flag ? `${data_.username}` : `${data_.name}`;
			$(".layer-tab-content input[type='text']").val("");
			$(".layer-tab-content select").each(function(){
				var this_ = $(this),
					option_select = this_.find("option:first"),
					selectV = option_select.val(),
					text = option_select.text(),
					this_drop = this_.parents(".drop"),
					drop_title = this_drop.find(".drop_title");
				this_.val(selectV);
				drop_title.html(text);
			});
			$(".layer-select ul").append(`<li class="float-left hoverTips" data-id="${empid}">${name}</li>`);
		}

		// 获取员工职级
		getEmpLevel ($this,ls) {
			let staff = '';
			$.ajax({
				type: 'POST',
				url: '/shopping/baseData',
				data: {
					type:'rank'
				},
				async:false,
				success: data => {
					if(data.status === 200){
						if(ls){
							if(data.data!=null&&data.data!=""){
								staff=data.data;
							}
							
						}else{
							this.showEmpLeve(data,$this);
						}
						return;
					}
					layer.msg(data.msg);
				},
				error: error => {
					layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
				}
			});
			if(staff!=""){
				return staff;
			}
		}
		// 展示员工职级
		showEmpLeve (data,$this) {
			let dataArr = data.data,
				options= '',
				lis = '',
				ul = $this.next(),
				select_ = $this.prev();
			if(!(dataArr instanceof Array && dataArr.length > 0)){
				layer.alert("请维护员工职级");
				return;
			}
			$.each(dataArr,function(index,item){
				options += `<option value="${item.value}">${item.name}</option>`;
				lis += `<li>${item.name}</li>`;
			});
			select_.append(options);
			ul.append(lis);
		}
	// 展示员工职级 普通员工
		showEmpLevestaff($this,ls){
			return this.getEmpLevel($this,ls)[0].value;
		}
		// 获取部门
		getDept ($this) {
			$.ajax({
				type: 'POST',
				url: '/dept/0',
				success: data => {
					if(data.status === 200){
						this.showDept(data,$this);
						return;
					}
					layer.msg(data.msg);

				},
				error: error => {
					layer.msg(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
				}
			});
		}

		//展示部门
		showDept (data,$this) {
			let data_ = JSON.parse(data.data);
			$(function(){
				let setting = {
					view: {dblClickExpand: false},
					data: {simpleData: {enable: true}},
					callback: {onClick: onClick}
				};
				let zNodes = data_;
				function onClick(e, treeId, treeNode) {
					$this.val(treeNode.name);
					$this.next('input[type="hidden"]').val(treeNode.id);
					$(".ztree").css("width","160px;");
					$("#menuContent").hide();
				}
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);
				let treeObj = $.fn.zTree.getZTreeObj("treeDemo");
			});
			$(".ztree").css("width","242px");
			showMenu();
		}

		// 添加相应事件
		Events (global_obj) {
			// 打开乘客模块
			$("body").on("click", '[data-person="choice"]', () => {
				this.initAuthority();
			});
            //新增员工中英文切换
            let isCn = true;
            $("body").on("click","#chinese",function () {
                isCn = !isCn;
                if (isCn) {
                    $('#chinese').attr('src', '/static/img/common/zhong.png');
                    $('#name_place').attr("placeholder", "如钱多多（必填）");
                    $("#is_chinese_i_").val("1");

                }
                else {
                    $('#chinese').attr('src', '/static/img/common/ying.png');
                    $('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
                    $("#is_chinese_i_").val("0");
                }
            });

			// 切换模块
			$("body").on("click",".layer-tab li",event => {
				let targetEle = $(event.target),
					tabData = this.tabData,
					content = targetEle.parent('ul').next(),
					select_ = new SelectMain();
				targetEle.is(".layer-tab-target") ? false : targetEle.addClass("layer-tab-target").siblings(".layer-tab-target").removeClass("layer-tab-target");
				content.html(this[tabData[targetEle.index()]]());
               $('.show').hide();
               $('#chinese').hide();
               if(targetEle.is(".layer-tab-target")){
					if($(".fanxian").val()=="true"){
						$('input[name="mobile"]').attr('ignore',"ignore");
						let cid = $(".cid").val(),linshiId = $(".fanxian-linshi").val();
						let html= `<li class=" clear float-left position font-size-12" style="margin-left: 60px" >
										<span class="ul-item-name float-left">证件号码：</span>
										<input type="text" id="certno" name="certno" class="input float-left" maxlength="20" datatype="*"     nullmsg="请输入合法的证件号码">
										<span class="position-ab ul-item-select">*</span>
									</li>
									<input type="hidden" name="accno" value="" id="emp-accno">
									<input type="hidden" name="username" value="" id="emp-username">
									<input type="hidden" name="name" value="" >
									<input type="hidden" name="certtype" value="" >
									<input type="hidden" name="companyid" value="${cid}" >
									<input type="hidden" name="deptid" value="${linshiId}">`;
						let htmls = `<span class="ul-item-name float-left">手机号码：</span>
										<input type="text" name="mobile" class="input float-left"><!--<input type="hidden" name="certno" value="" >-->
									`;
						
						if($("#emp-accno").length<=0){
							$(".user_name_addform").html(htmls);
							$('#addForm ul').append(html);
						}
						$("#addForm").attr('action','/crm/employee/save');
						
						$(".remove-fenxiao").remove();
					}else{
						$("#deptpid").val($("#defaultDeptId").val());
						$("[name='deptName']").val($("#defaultDeptName").val());
						var id = $.trim($(".approve_id").val());
						var name = $(".approve_name").val();
						$('input[name="approveId"]').val(id!=""?id:"0");
						$('#shengpiguize').val(id!=""?name:"无需审批");
					}
				}
				$(".layer-tab-content select").each(function(){
					select_.creatSelect($(this));
				});
			});

			$('body').on("blur",'#shengpiguize',function(){
				if($.trim($("input[name='approveId']").val())==""){
					$("#shengpiguize").val("");
				}
			});

			//审批规则匹配
			$('body').on("click keyup",'#shengpiguize',function(){
				if($.trim($('#shengpiguize').val())==""){
					$("input[name='approveId']").val("");
				};
				//初始化自动下拉数据模块
				var addrData=new DropAutoData({
					analyzerData:analyzerData,
					eventMain:eventMain,
					url:'/getApproveAll',
					this_:$(this),
					showField:"name",
					hideField:"id",
					model:'paging',
					index:"120000",
					keyword:$(this).val(),
					// departmentid
				});
				addrData.interceptor();
				/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
				function analyzerData(data){
					var data=JSON.parse(data.data);
					// console.log(data);
					$(".input-addr").addClass("_dataFull_");
					this.volidate(data.list);
				}
				/***********数据处理器*单击下拉项，向页面指定位置铺值************/
				function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
					$("input[name='approveId']").val(this_.attr("data-id"));
					
				}
			});

			// 关闭当前乘客模块
			$("body").on("click",".layer-title span:last", event => {
				let this_ = $(event.target);
				this_.parent().parent().parent().remove();
				$("body").removeClass('modal-open');
			});

			// 添加乘客
			$("body").on("click", ".search-passenger-list li", event => {
				let e = event,
					$ele = $(e.target);
				!$ele.is("li") ? $ele = $ele.parents("li") : "";
				let input_h = $ele.find("input[type='hidden']");
				this.addPassenger(input_h.attr('data-name'),input_h.val());
			});

			// 添加历史记录乘客
			$("body").on("click","[data-history='container'] span",event => {
				let e = event,
					$ele = $(e.target);
				this.addPassenger($ele.attr("data-name"),$ele.attr("data-id"));
			});

			// 悬浮显示选中乘客删除按钮
			$("body").on("mouseenter mouseleave", ".layer-select li", event => {
				let e = event,
					type = e.type,
					ele = $(e.target);
				if(type == 'mouseenter'){
					ele.attr("data-value", $.trim(ele.text())).addClass("remove-target-p").html("删除");
					return;
				}
				if(type == 'mouseleave'){
					ele.html(ele.attr("data-value")).removeClass("remove-target-p").removeAttr("data-value");
				}
			});

			// 删除当前乘客
			$("body").on("click", ".remove-target-p", (event) => {
				$(event.target).remove();
				$(".hoverTips_content").remove();
			});

			// 关闭乘客选择框
			$("body").on("click",".layer-select button",function(){
				let this_ = $(this),
					ul = this_.prev("ul"),
					ids = "",
					size = ul.find("li").size(),
					$passangerModel = $(".passanger-model"),
					idsArr = {
						addId: [],
						removeId: [],
						length:0   // 要添加的员工数
					};
				if(size <= 0){
					layer.msg("至少选择一位");
					return;
				}
				ul.find("li").each(function () {
					ids += $(this).attr("data-id") + ",";
				});
				if($passangerModel.size() > 0){
					$passangerModel.each(function(){
						let this_ = $(this),
							id = this_.attr("data-id"),
							reg = new RegExp(id,'g');
						if(reg.test(ids)){
							ids = ids.replace(id + ",","");
						}else{
							idsArr.removeId.push(id);
						}

					});
					idsArr.addId = ids.split(",");
					idsArr.addId = idsArr.addId.slice(0,idsArr.addId.length - 1);
				}else{
					ids = ids.split(",");
					idsArr.addId = ids.slice(0,ids.length - 1);
				}
				idsArr.length = idsArr.addId.length;
				let empid = $(".contact_item:first").attr("id");
				if(idsArr.addId.length<=5){
					for(let i = 0; i < idsArr.addId.length; i++){
						if(empid == idsArr.addId[i]){
							$(".contact_item:first").addClass("active");
						}
					}
				}
				global_obj.contactCallback && global_obj.contactCallback(idsArr,this_); // 添加乘客回调
				if($('[data-person="choice"]').attr("data-flag") != "1"){
					$(".layer-container").remove();
					$("body").removeClass('modal-open');
				}
			});
			
			//实时搜索乘客
			$("body").on("textchange", 'input', event =>{
				let e = event,
					ele = $(e.target),
					val = $.trim(ele.val()),
					callback = (data) => {
						// console.log(data);
						this.showEmpData(data,ele);
					};
				if(ele.parents('[data-search="container"]').is("div")){
					ele.next().html("");
					this.getEmpData(val,callback);
				}
			});

			// 保存新增常用联系人，新增员工
			$("body").on("click","#save-addForm",event => {
				let e = event,
					ele = $(e.target),
					this_ = this,
					$form = ele.parents("form"),
					flag = $form.is('[data-type="cus"]') ? true : false; // true 常用联系人
				$form.Validform({
					ajaxPost: true,
					tiptype:function(msg,o,cssctl){
						// console.log(msg,o,cssctl);
						if(msg!=""){
							layer.msg(msg);
						}
						
					},
					beforeCheck:function(){
						if($(".fanxian").val()=="true") {
							/*<input type="hidden" name="certtype" value="" >
							 <input type="hidden" name="certno" value="" >*/
							$("#emp-accno").val($("input[name='phone']").val());
							$("#emp-username").val($("input[name='phone']").val());
							$("input[name='name']").val($("input[name='cert.username']").val());
							$("input[name='certtype']").val($('.cert_type_i').val());
							$("input[name='certno']").val($("input[name='phone']").val());
						}
					},
					beforeSubmit:function(){
						//在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
						//这里明确return false的话表单将不会提交;
						if($.trim($('input[name="approveId"]').val())=="" && $(".fanxian").val()!="true"){
							layer.msg("请必须选择审批规则项");
							return false;
						}
					},

					callback: function(data){
						if($(".fanxian").val()=="true"){
							layer.msg(data.info);
							if(data.status=="y"){
								setTimeout(function(){
									$('#addForm').find('input[name="cert.username"]').val('');
									$('#addForm').find('input[name="phone"]').val("");
									$('#addForm').find('input[name="cert.certificate"]').val("");
								},3000);
							};
						}else{
							if(data.status === 200){
								this_.addPersonSuccess(data,flag);
							}
							layer.msg(data.msg);
						}
						

					}
				});
			});

			// 获取员工职级
			$("body").on("click",".drop_title",event => {
				let target = event.target,
					$this = $(target),
					$select = $this.prev();
				// console.log(target,$this);
				if($select.is('[name="zhiwei"]') && $select.find("option").size() === 1){
					this.getEmpLevel($this);
				}
			});

			// 获取部门
			$("body").on("click",'[name="deptName"]',event => {
				let target = event.target,
					$this = $(target);
				this.getDept($this);
			});

			return this;
		}
	}

	
	// 常用联系人模块
	class Contact {
		//参数：页面的全局对象
		constructor () {

		}

		// 获取常用联系人数据
		/*
		*	para list
		*	type:air | train | hotel
		* */
		getData (type) {
			if($('#bookFlag').val()=="2"||$('#bookFlag').val()=="3"||$('#bookFlag').val()=="4")return;
			$.ajax({
				type: 'POST',
				url: `/shopping/obtain/contact/${type}`,
				dataType: 'json',
				success: data => {
					if(data.status === 200){
						this.viewContact(data);
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
		//

		// 视图常用联系人
		/*
		*	para list
		*	data:常用联系人数据
		 */
		viewContact (data) {
			let dataArr ,
				length ,
				user = data.data.user,
				userId = data.data.user.id,
				list = "";
			if(data.data.contacts!=""&& data.data.contacts!=null){
				dataArr = data.data.contacts;
				length = dataArr.length;
			}else{
				dataArr=[];
				length = 1
			}
			
			
			// console.log(dataArr);
			if(length <= 0){
				$('[data-js="contact"]').hide();
				return this;
			}
			//生成当前登陆人 排在第一位
			list += `
					<span class="float-left contact_item border-radius text-ellipsis" id="${user.id}">
						${user.name}
					</span>
				`;
			if(dataArr.length>0){
				for(let i = 0; i < length; i++){
					if(userId!=dataArr[i].id){
						list += `
					<span class="float-left contact_item border-radius text-ellipsis" id="${dataArr[i].id}">
						${dataArr[i].name}
					</span>
				`;
					}
					
				}
			}
			
			length <= 5 ? $('[data-js="contactshut"]').remove() : "";
			$('[data-js="contactcontent"]').html(`${list}`);
			$('[data-js="contact"]').show();
			this.global_obj.contactCallBack_ && this.global_obj.contactCallBack_(); // 添加常用联系人回调
			return this;
		}

		// 事件绑定
		/*
		*	para list
		*	global_obj:调用页面的全局对象
		* */
		Event (global_obj) {
			Contact.prototype.global_obj == undefined ? Contact.prototype.global_obj = global_obj : "";
			// 展开收起常用联系人
			$("body").on('click', '[data-js="contactshut"]' , event => {
				var this_ = $(event.target),
					this_c = this_.prev('[data-js="contact-container"]');
				if(this_c.height() > 45){
					this_c.height(40);
					this_.html("展开");
					return;
				}
				this_.html("收起");
				this_c.css("height","100%");
			});
			$("body").on("click", '[data-js="contactcontent"] span', function(){
				// 参数ids，逗号隔开
				let this_ = $(this),
					$passangerModel = $(".passanger-model"),
					id = $(this).attr("id"),
					idsArr = {
						addId: [],
						removeId: [],
						length:0   // 要添加的员工数
					},
					flag = true;
				this_.toggleClass("active");

				if(this_.is(".active")){
					if($passangerModel.size() > 0){
						$passangerModel.each(function () {
							let $thisM = $(this),
								this_id = $thisM.attr("data-id");
							if(id == this_id){
								flag = false;
								return false;
							}
						});
						if(!flag){
							this_.toggleClass("active");
							layer.msg("请不要重复添加！");
							return;
						}
						idsArr.addId.push(id);
						idsArr.length = 1;
					}else{
						idsArr.addId.push(id);
						idsArr.length = 1;
					}
				}else{
					idsArr.removeId.push(id);
				}
				global_obj.contactCallback && global_obj.contactCallback(idsArr,$(this)); // 添加/移除乘客回调
			});
			return this;
		}
	}

// 操作历史记录

class CookieMain {
	constructor (){

	}

	// 设置历史记录
	setCookie () {
		let persons = [],
			historyPersons = $.cookie('historyPersons');

		// 遍历获取需要存cookie的name，id
		$("[data-model='passenger']").each(function () {
			let $this = $(this),
				id = $this.attr("data-id"),
				name = $this.attr("data-name");
			((name != "" && name != undefined && name != null) && (id != "" && id != undefined && id != null)) ? persons.push({name:name,id:id}) : "";
		});

		// 未选择人，不存cookie
		if(persons.length <= 0){ // 未选择任何乘客
			return;
		}
		// 判断cookie是否有值，没有直接存值
		if(historyPersons == "" || historyPersons == undefined || historyPersons == null){
			historyPersons = persons.length <= 5 ? JSON.stringify(persons) : JSON.stringify(persons.slice(0,5));
		}else{
			// 为cookie设置值
			historyPersons = JSON.stringify(this.removeRepeatArr(JSON.parse(historyPersons).concat(persons)));
		}

		// 更新cookie的有效期
		let date = new Date();
		date = date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);

		// 存储
		$.cookie('historyPersons', historyPersons, { expires: date, path: '/' });
		return this;
	}

	//读取历史记录
	readCookie () {
		return $.cookie('historyPersons') ? JSON.parse($.cookie('historyPersons')) : "";
	}

	// 数组去重 (应该归为公共方法) 返回去重后的数组
	removeRepeatArr (arr) {
		let i = 0,
			len = arr.length,
			arrObj = {},
			newArr = [],
			getId = function (obj){
				return obj.id;
			};
		for(i; i < len; i++){
			let id = getId(arr[i]);
			if(!arrObj[id]){
				arrObj[id] = true;
				newArr.push(arr[i]);
			}
		}
		return (newArr.length <= 5 ? newArr : newArr.slice(newArr.length - 5));
	}
}

// 出生日期
function getData(){
	var ido=document.getElementById('certno');
	var bd=document.getElementById('bd');
	if(!/^\d{6}((?:19|20)((?:\d{2}(?:0[13578]|1[02])(?:0[1-9]|[12]\d|3[01]))|(?:\d{2}(?:0[13456789]|1[012])(?:0[1-9]|[12]\d|30))|(?:\d{2}02(?:0[1-9]|1\d|2[0-8]))|(?:(?:0[48]|[2468][048]|[13579][26])0229)))\d{2}(\d)[xX\d]$/.test(ido.value)){
		// alert('身份证号非法.');
		return;
	}
	bd.value=(RegExp.$1).substr(0,4)+'-'+(RegExp.$1).substr(4,2)+'-'+(RegExp.$1).substr(6,2);
	
}
//新增员工的信息的展示和隐藏
$('body').on('click', '.card_type li', function () {
    //如果点击的是身份证
	 if (this.innerText === '身份证')  {
        $('.show').hide();
        $('#chinese').hide();
        $('#name_place').attr("placeholder", "如钱多多（必填）");
        $("#is_chinese_i_").val("1");
    }else {
        $('.show').show();
        $('#chinese').show();
        $('#chinese').attr('src', '/static/img/common/ying.png');
        $('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
        $("#is_chinese_i_").val("0");
    }
});
