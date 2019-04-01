//获取成本中心

$("body").on("click keyup", ".costCenter-input", function(e){
	e.stopPropagation();
	var depid = $(this).attr("depid");// 部门id
	var _this = $(this);
	if(depid==undefined){
		depid = "";
	}
	var empid = $(this).attr("empid"); // 员工id
	if(empid==undefined){
		empid = "";
	}
	var keyword = $(this).val(); // 关键字
	if(keyword==""){
		_this.parents(".costCenter-c").find(".costCenterId").val("");
	}
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器
		eventMain:eventMain, 		// 单击列表的主函数
		url:'/shopping/cost/center', 		// 请求url
		this_:$(this), 				// 当前元素
		showField:"name",			// 要展示在当前触发元素里的字段
		hideField:"id",				// 要展示在其他位置的字段
		model:"paging", 			// 判断是否为分页模式。paging代表分页模式
		departmentid:depid,			// 部门id
		employeeid:empid,			// 员工id
		keyword:keyword				// 关键字
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){
		var data=data.data;
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.items); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		var parents=active.parents(".costCenter-c");
		parents.find(".costCenterId").val(this_.attr("data-id"));

	}
});


//获取项目中心
$("body").on("click keyup",".project-input",function(e){
	e.stopPropagation();
	var keyword = $(this).val(); // 关键字
	var _this = $(this);
	if(keyword ==""){
		_this.parents(".project-c").find(".projectId").val("");
	}
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData,
		eventMain:eventMain,
		url:'/shopping/project',
		this_:$(this),
		showField:"name",
		hideField:"id",
		model:"paging",
		keyword:keyword				// 关键字
	});
	addrData.interceptor();
	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
	function analyzerData(data){ 
		var data=data.data;
		this.pagingIn(data); //初始化分页参数
		this.volidate(data.items); //执行
	}
	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
		var parents=active.parents(".project-c");
		parents.find(".projectId").val(this_.attr("data-id"));
	}
});
//项目中心失焦事件清空
$("body").on("blur",".project-input",function(){
	var projectinfoinput_hidden = $('.projectinfoinput_hidden').val();
	var _this = $(this);
	var val = _this.siblings('.projectId').val();
	if(projectinfoinput_hidden!=1){
		if($.trim(val)==""||val=="0"){
			_this.val("");
		}
	}
});
//成本中心失焦事件清空
$("body").on("blur",".costCenter-input",function(){
	var costcenterinput_hidden = $('.costcenterinput_hidden').val();
	var _this = $(this);
	var val = _this.siblings('.costCenterId').val();
	if(costcenterinput_hidden!=1){
		if($.trim(val)==""||val=="0"){
			_this.val("");
		}
	}
});
//获取出差单申请号
// $("body").on("click keyup","#travelNo_i",function(e){
// 	e.stopPropagation();
// 	//初始化自动下拉数据模块
// 	var addrData=new DropAutoData({
// 		analyzerData:analyzerData,
// 		eventMain:eventMain,
// 		url:'/findAppForm',
// 		time:$(".orderTimes").val(),
// 		this_:$(this),
// 		showField:"approvalno",
// 		hideField:"id",
// 		tips:"没有符合日期的出差单，请申请出差单后再进行预订操作！",
// 		model:"paging"
// 	});
// 	addrData.interceptor();
// 	/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
// 	function analyzerData(data){
// //		console.log(data);
// 		var data=JSON.parse(data.data);
// 		this.pagingIn(data); //初始化分页参数
// 		this.volidate(data.list); //执行
// 	}
// 	/***********数据处理器*单击下拉项，向页面指定位置铺值************/
// 	function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
// 		var parents=this_.parents(".travelorder-c");
// 		parents.find(".travelorder-val").val(this_.attr("data-id"));
// 	}
// });

