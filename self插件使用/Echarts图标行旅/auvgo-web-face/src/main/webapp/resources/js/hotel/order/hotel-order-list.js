$(function(){
	// 初始化分页  当前页数，  总页数， 总条数，  没页显示数据大小，  form表单， 模式
	kkpagerMain({'pageNo':$("#pageNo"), 'totalPage':$("#totalPage"), 'totalRecords':$("#total"), 'pageSize':$("#pageSize"), 'submit_element':$("#HotelOrderForm"), 'mode':'click'});
});


//获取成本中心
$("body").on("click keyup", "#cost_center_i", function(e){
	e.stopPropagation();
	var keyword = $(this).val(); // 关键字
	if(keyword==""){
		$("#cost_center_id_i").val("");
	}
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器 
		eventMain:eventMain, 		// 单击列表的主函数
		url:'/shopping/cost/center',// 请求url
		this_:$(this), 				// 当前元素
		showField:"name",			// 要展示在当前触发元素里的字段
		hideField:"id",				// 要展示在其他位置的字段
		model:"paging", 			// 判断是否为分页模式。paging代表分页模式
		departmentid:"all",			// 部门id
		employeeid:"all",			// 员工id
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
		$("#cost_center_id_i").val(this_.attr("data-id"));
	}
});

// 项目中心
$("body").on("click keyup", "#project_i", function(e){
	e.stopPropagation();
	var keyword = $(this).val(); // 关键字
	//初始化自动下拉数据模块
	var addrData=new DropAutoData({
		analyzerData:analyzerData, 	// 分析器 
		eventMain:eventMain, 		// 单击列表的主函数
		url:'/shopping/project',   // 请求url
		this_:$(this), 				// 当前元素
		showField:"name",			// 要展示在当前触发元素里的字段
		hideField:"id",				// 要展示在其他位置的字段
		model:"paging", 			// 判断是否为分页模式。paging代表分页模式
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
	}
});

function searchOrder(){
	$("#pageNo").val(1);
	$("#HotelOrderForm").submit();
}
