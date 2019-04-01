
(function() {

	var interface = new OuterInterface(), // 实例化第三方接口
		outerData = interface.getOuterInterface(), // 读取第三方接口数据
		isEmpty = function (data) {
			return !(data === "" || data === null || data === undefined);
		},
		route = (outerData && isEmpty(outerData.route)) ? outerData.route : null;

	if(!outerData){ // 非第三方数据
		$(".tab-city").css("visibility", 'initial'); // 城市切换显示
		$(".sevenDateContent").show();
		return;
	}
	/********* 第三方有数据，开始处理 *********/

	// 根据权限清空指定内容
	interface.clearPower(outerData.product);
	var isOnly = route.isCanModify;
	if(isOnly == 0){
		interface.disableInput();
		$(".sevenDateContent").remove();
	}else{
		$(".sevenDateContent").show();
		// $(".tab-city").css("visibility", 'initial'); // 城市切换显示
	}
})();


// init-初始化一些参数
// 主要区分正常查询|改签查询
var queryListParam = {
	isEndorseStatus: false
	,empIds: ''
	,queryListLevelStr: ''
	,orderNo: ''
	,id: ''
};
(function() {
	queryListParam.isEndorseStatus = $('#isendorse').attr('data-isendorse') == '1';

	if (queryListParam.isEndorseStatus) {
		var $isendorse = $('#isendorse');
		queryListParam.empIds = $isendorse.attr('data-empIds');
		queryListParam.queryListLevelStr = $isendorse.attr('data-levels');
		queryListParam.orderNo = $isendorse.attr('data-orignorderno');
		queryListParam.id = $isendorse.attr('data-id');
	}else {
		getCitys('train');
		queryListParam.queryListLevelStr = $('.loginZhiji').val();
	}
}());


//七天日历初始化
(function(){
	var dateArr = $('#beginDate').val().toString().split("-"),
		dateIns = new DateSeventMain({
			nowDate: new Date(dateArr[0],dateArr[1]-1,dateArr[2]), //要显示的当前日期，可以不是今天，任意输入你想显示的日期段
			maxDate: 29
		});
	dateIns.inputVolidate();
})();

autoHeight($('.train-list-content'));

$(window).resize(function(){
	autoHeight($('.train-list-content'));
});

// 点击-筛选的title
$("body").on("click",".e-f-title",function(){
	$(".e-f-title").not($(this)).next("ul").slideUp('fast');
	$(this).next("ul").slideToggle('fast');
});

// 点击-出发到达城市切换
$("body").on("click",".tab-city",function(){
	if (queryListParam.isEndorseStatus) return ;
	setTimeout(function(){//配合城市插件 需要100ms的延迟
		var fCity=$(".from-city").val(),
			tCity=$(".to-city").val(),
			fCityCode=$(".from-city-code").val(),
			tCityCode=$(".to-city-code").val();
		$(".from-city").val(tCity);
		$(".to-city").val(fCity);
		$(".from-city-code").val(tCityCode);
		$(".to-city-code").val(fCityCode);
	}, 300);
});


function isTimeBook (callback) {
	$.ajax({
		url: '/common/checktime',
		type: 'POST',
		success: function (data) {
			if(data.status === 200){
				isTimeBook.flag = false;
				callback && callback(data);
				return;
			}
			callback && callback(data);
			isTimeBook.flag = true;
			$(".train-book").addClass("train-book-no");

		},
		error: function (error) {
			isTimeBook.flag = true;
			$(".train-book").addClass("train-book-no");
			layer.alert(error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
		}
	});
}



// action-点击-预订
$('body').on('click', '.train-book', function(){
	var this_ = $(this),
		booking = function (data) {
			if(data.status !== 200){
				layer.msg("温馨提示：每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
				$(".train-book").addClass("train-book-no");
				return;
			}
			var $this = this_;
			var wflag = $this.attr('data-wflag');
			var ctr = $this.attr('data-ctr');
			var href = $this.attr('data-href');
			var enHref = $this.attr('data-enhref');
			var traintype = $this.attr('data-traintype');

			var space = $this.attr('data-space');

			var tipStr = '您超出了' + traintype + '：只允许乘坐“' + space + '”的差旅标准！';
			var _tipStr = traintype + '：所有座席均超出差旅标准！';

			// 不超标
			if (wflag == 0) {
				book(href, enHref);
			}
			// 超标&&只提醒
			else if (wflag == 1 && ctr == 1) {
				new Confirm({
					text: space == '0' ? _tipStr + '是否继续预订？' : tipStr + '是否继续预订？',
					arr: ['继续', '取消'],
					confirmCallback: function(){
						book(href, enHref);
					}
				});
			}
			// 超标&&禁止预订
			else if (wflag == 1 && ctr == 0) {
				new Confirm({
					text: space == '0' ? _tipStr + '禁止预订！' : tipStr + '禁止预订！',
					arr: ['知道了', '取消']
				});
			}
		};
	isTimeBook (booking);
});


// 预订
/**
 * 预定校验-
 * @param url
 */
function book(url, enUrl) {
	// console.log(url);

	var _url = queryListParam.isEndorseStatus ? enUrl : url;

	$.ajax({
		url: _url,
		type: 'post',
		beforeSend: function(xhr){

		},
		success: function(data){

			if (data.status != 200) {
				layer.msg(data.msg);
				console.error(data);
				return ;
			}

			var href = data.data;
			// 直接跳转
			if (data.msg == '' || data.msg == undefined) {
				// location.href = data.data;
				bookJump(href);
			}

			// 给出提示
			else {
				new Confirm({
					text: data.msg,
					arr: ['继续', '取消'],
					width: '455px',
					height: '240px',
					textWidth: '284px',
					confirmCallback: function(){
						// location.href = data.data;
						bookJump(href);
					}
				});
			}
		},
		error: function(xhr, errorType, error){
			layer.msg('预订失败！（' + (errorType || error) + ')');
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}

// 点击预订跳转
function bookJump(url) {
	// console.log(url);

	if (queryListParam.isEndorseStatus) {
		// var endorseBookUrl = '/train/gaiqian/book/{empIds}/{trainCode}/{seatCode}/{queryDate}/{orderno}';
		// var urlArr = url.split('/');
		// var trainCode = urlArr[3];
		// var seatCode = urlArr[4];
		// var endorseBookUrl = '/train/gaiqian/book/' + queryListParam.empIds + '/' + trainCode + '/' + seatCode + '/' + $.trim($('#beginDate').val()) + '/' + queryListParam.orderNo;
		// console.log(endorseBookUrl);
		zh.iframes({
			width: "650px",
			height: "350px",
			url : url,
			title: "提交改签",
			newStyle: true
		});
	}else {
		location.href = url;
	}
}


// action-点击-删选条件
$('body').on('click', '.label-checkbox', function(){
	var $this = $(this).closest('li');
	var $ul = $this.closest('ul');

	// 手动控制-选中-不限
//	if ($ul.find('.label-select-checkbox').length == 0) {
//		$ul.find('li:eq(0)').find('.label-checkbox').addClass('label-select-checkbox');
//	}
//
//	if ($ul.find('.label-select-checkbox').length > 1) {
//		$ul.find('li:eq(0)').find('.label-checkbox').removeClass('label-select-checkbox');
//	}
//
//	if ($this.find('.label-select-checkbox').length == 0 && $this.index() == 0) {
//		$this.find('.label-checkbox').addClass('label-select-checkbox');
//		$this.siblings().find('.label-checkbox').removeClass('label-select-checkbox');
//	}

});

getTrainData(updateTrainData);
// 车次原始数据
var trainOrignData = '';
/**
 * ajax-请求-火车票列表数据
 * @param {Object} currData 请求参数
 * @param {Function} callback 数据解析回调函数
 */
function getTrainData(callback){
	var defaultData = {
		type: '',// 单程或往返
		from: $('[name="from"]').val(),//LFP-廊坊 PIJ-平凉
		fromName: $('[name="fromName"]').val(),// 始发城市
		arrive: $('[name="arrive"]').val(),// 到达地代码
		arriveName: $('[name="arriveName"]').val(),// 到达城市
		startDate: $('[name="startDate"]').val(),// 出发时间
		backDate: '',//返回时间
		trainType: '',//车次

		orderno: $('#isendorse').attr('data-orignorderno') || '' // 改签订单查询时原订单号

	};

	if (defaultData.fromName == defaultData.arriveName) {
		layer.msg('出发地与目的地不能相同！');
		return false;
	}

	$('.train-list').html('');
	toggleModal(true);

	$.ajax({
		url: '/train/clquery/list',
		type: 'post',
//		async: false,
		timeout: 30000,
		data: defaultData,
		success: function(data){
			// console.log(data);
			toggleModal(false);

			if (data.status != 200) {
				layer.msg(data.msg + '|' + data.status);
				return ;
			}
			/************************************未修改 start*******************************************/
			// 处理提示框栏 --TODO 需要23：00以后看一下其数据结构
			//if (data.msg == 0) $('.tips').show();
			/************************************未修改 end*******************************************/

			var _data = JSON.parse(data.data);
			//console.log(_data);
			//var resultData = _data.d;
			var resultData = _data;
			/************************************未修改 start*******************************************/
			// if (resultData == null) {
			// 	layer.msg(_data.m, {icon: 2});
			// 	$('.no-data-wraper').css('display', 'table');
			// 	return ;
			// }
			/************************************未修改 end*******************************************/
			trainOrignData = resultData;//存储原始数据

			var $trainTypeLabel = $('.train-type').find('.label-select-checkbox');

			// 车次类型筛选
			if ($trainTypeLabel.length > 0) {
				$('.train-type .label-select-checkbox input').trigger('click');
			}
			// 车次类型不筛选
			else {
				typeof callback == 'function' && callback(trainOrignData);
			}

			// 初始化出发&&终点站
			var startStations = {};//始发站
			var endStations = {};//终点站

			$.each(trainOrignData.trains, function(index, curr){
				startStations[curr.fromStationCode] = curr.fromStation;
				endStations[curr.toStationCode] = curr.toStation;
			});
			;
			updateStartEndStations(startStations, $('.start-station'));
			updateStartEndStations(endStations, $('.end-station'));

		},
		error: function(xhr, errorType, error){
			toggleModal(false);

			errorType == 'timeout' ? layer.msg('网络异常，请重试！') : layer.msg('获取车次列表失败！' + xhr.status);

			console.error(xhr);
			console.error(errorType || error);
		}
	});
}


// parse-解析-火车票数据解析
function updateTrainData(datas){
//	console.log(data);

	// js forEach()//兼容到ie9
//	data.forEach(function(curr, index, array){
//		console.log(arguments);
//	});
	var dataOri = datas,
		data = datas.trains,
		html = '';
	$.each(data, function(index, curr){
		// this -> 指向当前数组内每个元素

		// console.log(curr);
		var runTime = curr.runTimeSpan,
			runTimeHour = Math.floor(curr.runTimeSpan/60),
			runTimeMinute = curr.runTimeSpan%60;
		html +=
			'<li class="clear">' +
			'<div class="float-left">' +
			'<div class="every-line clear">' +
			'<span class="font-size-14 font-weight w-141 float-left">' + curr.trainNo + '</span>' +

			'<span class="font-size-16 font-weight w-120 margin-left-16 float-left">' + curr.fromTime + '</span>' +
			'<span class="font-size-16 font-weight w-120 margin-left-16 float-left">' + curr.toTime + '</span>' +

			'<span class="color-999 float-left" style="width:62px">' + (runTimeHour == "0" ? "" : runTimeHour + "小时") + runTimeMinute + '分</span>' +
			'</div>' +
			'<div class="every-line stations-p clear">' +
			'<div class="all-stations-wraper">' +
			'<span class="all-stations w-141 float-left" ' +
			'data-trainno="' + curr.trainNo + '" ' +
			'data-querydate="' + dataOri.trainDate + '" ' +
			'data-fromcode="' + curr.fromStationCode + '" ' +
			'data-tocode="' + curr.toStationCode + '">时刻表</span>' +
			'<div class="time-table-wraper mCustomScrollbar">' +
			'<table class="table">' +
			'<thead>' +
			'<tr>' +
			'<th>站序</th>' +
			'<th>车站名</th>' +
			'<th>到站时间</th>' +
			'<th>出发时间</th>' +
			'<th>停留时间</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			'</tbody>' +
			'</table>' +
			'</div>' +
			'</div>' +

			(curr.fromPassType == 0 ?
				'<span class="station-flag star-flag float-left">始</span>'
				: '<span class="station-flag transfer-flag float-left">经</span>') +
			'<span class="w-120 float-left">' + curr.fromStation + '</span>' +

			(curr.toPassType == 2 ?
				'<span class="station-flag end-flag float-left">终</span>'
				: '<span class="station-flag transfer-flag float-left">经</span>') +
			'<span class="w-120 float-left">' + curr.toStation + '</span>' +

			'</div>' +
			'</div>' +
			'<div class="float-left right-content">';
		//判断诸如列车停运，车次售完***************************************************************
		if ((curr.saleFlag != '0' && curr.saleFlag != "3") || curr.bookState == "2") {

			html += '<div style="text-align: center;width: 307px;height: 60px;line-height: 60px;font-size: 16px;color: #D10773;">' + (curr.note == "" ? "票已售完" : curr.note) + '</div>';
		}
		else {
			html += seatHtml({
				tickets: curr.tickets,  		//坐席
				trainClass: curr.trainClass,	//高铁动车标识
				trainNo: curr.trainNo			//车次
			});
		}
		html +=
			'</div>' +
			'</li>';
	});

	if (html == '') {
		$('.no-data-wraper').css('display', 'table');
	}else {
		$('.no-data-wraper').css('display', 'none');
		//$('.no-data-wraper .no-data').addClass('rotateOut');
	}
	$('.train-list').html(html);
	isTimeBook.flag == undefined ? isTimeBook(TimeCallBack) : "";
	function TimeCallBack(data) {
		if(data.status === 200){
			isTimeBook.flag = false;
			return;
		}
		$(".train-book").addClass("train-book-no");
		isTimeBook.flag = true;
	}
	if (isTimeBook.flag) {
		$(".train-book").addClass("train-book-no");
	}

}

// 获取差旅政策
var trainPolicy = getTrainPolicy(queryListParam.queryListLevelStr);
/**
 * parse-坐席-数据解析
 * @param {Object} para
 * 					{
 * 						tickets: {Object}		坐席，车票数据
 * 						,trainClass: {String}	高铁动车标识，车次类型
 * 						,trainNo: {String}  	车次首字母，车次标识
 * 					}
 * @return {string}
 */
function seatHtml(para) {
	// console.log(para);
	// console.log(curr);
	var html = '',
		ticket = para.tickets,
		checiType = para.trainClass,
		trainNo = para.trainNo;

	ticket.noseat && everyseat((checiType == "GD" || checiType == "C" || checiType == "D") ? (ticket.noseat.seatType = "O",ticket.noseat) : (ticket.noseat.seatType = "1",ticket.noseat),{trainNo: trainNo});//无座
	ticket.hardseat && everyseat(ticket.hardseat,{trainNo: trainNo}); //硬座
	ticket.softseat && everyseat(ticket.softseat,{trainNo: trainNo}); //软座
	ticket.hardsleepermid && everyseat(ticket.hardsleepermid,{trainNo: trainNo}); //硬卧
	ticket.softsleeperdown && everyseat(ticket.softsleeperdown,{trainNo: trainNo}); //软卧
	ticket.advancedsoftsleeper && everyseat(ticket.advancedsoftsleeper,{trainNo: trainNo}); //高软
	ticket.secondseat && everyseat(ticket.secondseat,{trainNo: trainNo}); //二等座
	ticket.firstseat && everyseat(ticket.firstseat,{trainNo: trainNo}); //一等座
	ticket.specialseat && everyseat(ticket.specialseat,{trainNo: trainNo}); //特等座
	ticket.dsleeperdown && everyseat(ticket.dsleeperdown,{trainNo: trainNo}); //动卧
	ticket.businessseat && everyseat(ticket.businessseat,{trainNo: trainNo}); //商务座

	function everyseat(seatData,para){
		var policyResult = matchTrainPolicy(trainPolicy, para.trainNo.slice(0,1), seatData.seatType);

		html +=
			'<div class="every-line clear" data-canbuynow="' + 'curr.can_buy_now' + '" data-saledatetime="' + 'curr.sale_date_time' + '">' +
			'<span class="w-64 float-left">' + seatData.seatName + '</span>' +
			'<span class="price float-left"><span class="float-left">￥</span><span class="font-size-18 float-left">' + seatData.price + '</span></span>' +
			'<div class="float-left" style="width: 46px;height:30px;line-height:30px;">' +
			(policyResult.flag == 1 ? '<span class="exceed-flag">超标</span>' : '') +
			'</div>' +
			'<span class="tiket-count float-left">' + (parseFloat(seatData.seats) == 0 ? '' : isNaN(parseFloat(seatData.seats)) ? '' : (parseFloat(seatData.seats) > 9 ? '' : '余' + parseFloat(seatData.seats) + '张')) + '</span>' +

			(seatData.seatState == 0 ?
				'<button type="button" class="btn btn-default book-btn train-book-no float-left">' + (seatData.price == '' ? '停  售' : '已售完') + '</button>'
				: '<button type="button" class="btn btn-default book-btn train-book float-left" data-wflag="' + policyResult.flag + '" data-traintype="' + policyResult.traintype + '" data-ctr="' + policyResult.controller + '"' + 'data-space="' + policyResult.space + '"' + ((policyResult.flag == 1 && policyResult.controller == 0) ? '' : 'data-href="/train/checktrain/' + para.trainNo + '/' + seatData.seatType + '"') +
				'data-enhref="/train/gaiqian/check/' + queryListParam.empIds + '/' + trainNo + '/' + seatData.seatType + '/' + $.trim($('#beginDate').val()) + '/' + queryListParam.orderNo + '/' + queryListParam.id + '">预 订</button>') +

			'</div>';
	}
//	// 针对23:00以后的情况
//	else if (curr[seatStr + '_price'] == '' && curr.edz_num != '--'){
//		html += '<div style="height: 60px; line-height: 60px;">' + curr.sale_date_time + '</div>';
//	}
	return html;
}



/**
 * parse-解析-出发站||终点站
 * @param {Object} data 出发||到达-站点数据
 * @param {QueryDom} $target 存放解析后html存放的目标dom
 */
function updateStartEndStations(data, $target){
	var html = '';
	// for (code in data){
    ;
	$.each(data, function(key, val) {
		html +=
			'<li>' +
			'<div class="label label-checkbox label-margin-right clear">' +
			'<span class="show_choice"></span>'+
			'<span>' + val + '</span>' +
			'<input type="checkbox" value="' + key + '">' +
			'</div>' +
			'</li>';
		// }
	});

	$target.html(html);
}


// 遮罩层-显示||隐藏
function toggleModal(status) {
	if (status) {

		$('.wait-city-before').text($('[name="fromName"]').val());
		$('.wait-hb-date').text($('[name="startDate"]').val());
		$('.wait-city-after').text($('[name="arriveName"]').val());

		$('.Screen-full').show();
		//$('body').addClass('modal-open');
	} else {
		$('.Screen-full').hide();
		//$('body').removeClass('modal-open');
	}
}


/**
 * ajax-请求-经停站数据
 * @param {Object} data 请求参数-时间||车号||出发站code||终点站code
 * @param {Function} callback 解析经停站数据回调函数
 * @param {QueryDom} $this 触发元素dom
 */
function getStations(data, callback, $this){
	$this.attr('data-sendajax', true);

	$.ajax({
		url: '/train/clquery/stopover/' + data.querydate + '/' + data.fromcode + '/' + data.tocode + '/' + data.train_no,
		type: 'post',
		async: false,
		beforeSend: function(xhr){
			//console.log(xhr);

		},
		success: function(data){
			// console.log(data);

			if (data.status != 200) {
				layer.msg(data.msg, {icon: 5});
				$this.attr('data-sendajax', false);
				console.error(data);
				return ;
			}

			var _data = JSON.parse(data.msg).stations;
			// console.log(_data);
			typeof callback == 'function' && callback(_data, $this);

		},
		error: function(xhr, errorType, error){
			layer.msg('获取经停站失败！');
			$this.attr('data-sendajax', false);
			console.error(xhr);
			console.error(errorType || error);
		}
	});
}

/**
 * 经停站-数据解析
 * @param {Array} data 经停站数据
 * @param {QueryDom} $this 触发元素dom
 */
function updateStations(data, $this){
	var html = '';

	$.each(data, function(index, curr){
		html +=
			'<tr>' +
			'<td>' + curr.serialNumber + '</td>' +
			'<td>' + curr.station + '</td>' +
			'<td>' + curr.arrivalTime + '</td>' +
			'<td>' + curr.departureTime + '</td>' +
			'<td>' + curr.stayTimeSpan + '</td>' +
			'</tr>';
	});
	$this.next('.time-table-wraper').find('tbody').html(html);

}


// action-点击-经停
$('body').on('click', '.all-stations', function(){
	var $this = $(this);

	// 最多显示一个时间列表
	$('body').find('.time-table-wraper').slideUp(100);

	!$this.attr('data-sendajax') &&
	getStations({
		querydate: $this.attr('data-querydate'),
		fromcode: $this.attr('data-fromcode'),
		tocode: $this.attr('data-tocode'),
		train_no: $this.attr('data-trainno')
	}, updateStations, $this);

	var $table = $this.next();


	// 判断当前鼠标的位置   以确定经停车站展示列表展示的位置
	var offset = $this.offset();
	// console.log(offset);

	var winHeight = $(window).height();
	// console.log(winHeight);

	var currPosi = winHeight - offset.top;
	// console.log(currPosi);
	if (currPosi <= 318) {
		$table.css({'top' : '-318px'});
	}

	if ($table.is(':hidden')) {
		$table.slideDown();
	}else {
		$table.slideUp();
	}

});

// mouseleave-离开-鼠标离开车站列表
$('body').on('mouseleave', '.time-table-wraper', function(){
	$(this).slideUp();
});


// action-点击-筛选-复选框
$('body').on('click', '.e-filter .label', function(){
	fiterCon(true);
});


/**
 * parse-筛选数据-并更新dom
 * @param {Boolean} param true-数据筛选||false-指定车次筛选
 */
function fiterCon(param){// trainOrignData - 原始数据
//	console.log(trainOrignData);

	// 清空排序
	$('.stg-sort').each(function () {
		$(this).removeClass('stg-s-up stg-s-down');
	});

	var copyOrignData = $.extend(true,{},trainOrignData);
	// 筛选
	if (param) {
		$('.filter-input').val('');

		// type-车次条件
		var typeCon = getTraintypeCon();

		// 始发站条件
		var sStation = getSStationCon();
		//console.log(sStation);

		// 终点站条件
		var eStation = getEStationCon();

		// 出发时间
		var sTime = getSTimeCon();

		// 到达时间
		var eTime = getETimeCon();

	}

	// 指定车次筛选
	else {
		$('.label-select-checkbox').each(function(){
			$(this).removeClass('label-select-checkbox');
		});

		var filterCon = $('.filter-input').val().toUpperCase();

	}

	var newData = $.grep(copyOrignData.trains, function(curr, index){

		//console.log(curr);

		var status = true;//筛选通过-true 否则-false

		// 筛选
		if (param) {
			// 车次类型
			var firstLetter = curr.trainNo.substr(0, 1);
			//console.log(firstLetter);

			// type-不需要验证||验证失败
			if (typeCon != '' && typeCon.indexOf(firstLetter) == -1) {
				return false;
			}


			// 始发站
			if (sStation.length > 0) {
				var sRult = seStations(sStation, curr.fromStationCode);
				if (!sRult) {
					return false;
				}
			}


			// 终点站
			if (eStation.length > 0) {
				var eRult = seStations(eStation, curr.toStationCode);
				if (!eRult) {
					return false;
				}
			}


			// 出发时间
			if (sTime.length > 0) {
				var sResult = seTime(sTime, curr.fromTime);
				if (!sResult) {
					return false;
				}
			}


			// 到达时间
			if (eTime.length > 0) {
				var eResult = seTime(eTime, curr.toTime);
				if (!eResult) {
					return false;
				}
			}
		}

		// 指定车次筛选
		else {

			status =  filterCon == '' || filterCon == curr.trainNo;

		}

		return status;

	});
	copyOrignData.trains = newData;
//	console.log(newData);
	updateTrainData(copyOrignData);

}
/**
 * parse-出发站||终点站-筛选结果
 * @param {Array} station 筛选条件车站
 * @param {String} filterCode 当前车次站点
 *
 * @return {Boolean} 验证结果  true-通过||false-不通过
 */
function seStations (station, filterCode) {
	for (var i = 0; i < station.length; i++) {
		// 车站验证通过
		if (station[i] == filterCode) {
			return true;
		}
	}

	return false;
}
/**
 * 出发时间||到达时间-筛选结果
 * @param {Array} time 筛选条件车站
 * @param {String} filterTime 当前车次时间
 *
 * @return {Boolean} 验证结果  true-通过||false-不通过
 */
function seTime (time, filterTime) {
	for (var i = 0; i < time.length; i++) {

		var timeArr = time[i].split('-');
		var sTime = timeArr[0];
		var eTime = timeArr[1];

		// 时间验证通过
		if (time2Str(sTime) <= time2Str(filterTime) && time2Str(filterTime) <= time2Str(eTime)) {
			return true;
		}
	}

	return false;
}


/**
 * 筛选条件-车次类型
 *
 * @return {String} 车次类型勾选结果
 */
function getTraintypeCon(){
	var typeCon = '';
	$('.train-type').find('.label-select-checkbox').each(function(){
		typeCon += $(this).find('input').val();
	});

	return typeCon;
}

/**
 * 筛选条件-出发车站
 *
 * @return {Array} 出发车站勾选结果
 */
function getSStationCon(){
	var sStaionCon = [];
	$('.start-station').find('.label-select-checkbox').each(function(){
		sStaionCon.push($(this).find('input').val());
	});

	return sStaionCon;
}

/**
 * 筛选条件-终点车站
 *
 * @return {Array} 终点车站勾选结果
 */
function getEStationCon(){
	var eStaionCon = [];
	$('.end-station').find('.label-select-checkbox').each(function(){
		eStaionCon.push($(this).find('input').val());
	});

	return eStaionCon;
}

/**
 * 筛选条件-出发时间
 *
 * @return {Array} 出发时间勾选结果
 */
function getSTimeCon(){
	var sTimeCon = [];
	$('.start-time').find('.label-select-checkbox').each(function(){
		sTimeCon.push($(this).find('input').val());
	});

	return sTimeCon;
}

/**
 * 筛选条件-到达时间
 *
 * @return {Array} 到达时间勾选结果
 */
function getETimeCon(){
	var eTimeCon = [];
	$('.end-time').find('.label-select-checkbox').each(function(){
		eTimeCon.push($(this).find('input').val());
	});

	return eTimeCon;
}


// action-点击-重新查询
$('body').on('click', '.train-query', function() {

	// 重新查询时清空左侧-指定车次筛选
	$('.filter-input').val('');

	$('.stg-sort').removeClass('stg-s-up').removeClass('stg-s-down');

	// 重新查询时清空左侧筛选条件
	$('.label-select-checkbox').each(function(){
		$(this).removeClass('label-select-checkbox');
	});

	setTimeout(function(){//配合城市插件 需要100ms的延迟
		getTrainData(/*{},*/ updateTrainData);
	}, 100);
});


// action-点击-切换日期
$("body").on("click","#date_train_tab li",function(){
	var $this = $(this);

	// 查询不在规定范围内的日期
	if ($this.is('.history')) return ;

	var _date = $this.attr('data-date');

	$('#beginDate').val(_date);

	$('.train-query').trigger('click');

});


// action-点击-查询车次
$('body').on('click', '.filter-traintype', function() {
	fiterCon(false);
});


// action-点击-排序
$('body').on('click', '.stg-sort', function () {
	var $this = $(this);
	var sortFlag = 'sflag';
	var upStr = 'stg-s-up';
	var downStr = 'stg-s-down';

	$this.siblings().removeClass('stg-s-up stg-s-down').attr('data-' + sortFlag, 0);

	if ($this.attr('data-' + sortFlag) == 0 && !$this.hasClass(upStr) && !$this.hasClass(downStr)) {
		$this.addClass(upStr).attr('data-' + sortFlag, 1);

		sortData($this.attr('data-flag'), $this.attr('data-' + sortFlag));
		return ;
	}

	if ($this.hasClass(upStr)) {
		$this.removeClass(upStr).addClass(downStr).attr('data-' + sortFlag, 0);
	}else if ($this.hasClass(downStr)) {
		$this.removeClass(downStr).addClass(upStr).attr('data-' + sortFlag, 1);
	}

	sortData($this.attr('data-flag'), $this.attr('data-' + sortFlag));

});


/**
 * 排序
 * @param {String} sortFlag 排序字段
 * @param {Boolean} sortType 升序-1||降序-0
 */
function sortData (sortFlag, sortType) {
	// trainOrignData//原始数据
	// 清空筛选条件
	$('.label-select-checkbox').each(function () {
		$(this).removeClass('label-select-checkbox');
	});
	var trainData = trainOrignData,
		trains = trainData.trains;

	var newData = trains.sort(compares(sortFlag, sortType));
	trainData.trains = newData;
	//console.log(newData);
//	$.each(newData, function(index, curr){
//		console.log(curr[sortFlag]);
//	});
	updateTrainData(trainData);

}

// 默认升序
function compares(property, sign){
	return function(a, b){

		// TODO:wxj-20180227-出发时间 '--' 处理
		var aTimeStatus = /-/.test(a[property]);
		var bTimeStatus = /-/.test(b[property]);

		if (aTimeStatus && bTimeStatus) {
			return 0;
		}else if (aTimeStatus) {
			return -1;
		}else if (bTimeStatus) {
			return 1;
		}

		var value1 = time2Str(a[property]);
		var value2 = time2Str(b[property]);
		if(value1 < value2){
			return sign == 1 ? -1 : 1;
		}else if(value1 > value2){
			return sign == 1 ? 1 : -1;
		}else{
			return 0;
		}
	};
}





