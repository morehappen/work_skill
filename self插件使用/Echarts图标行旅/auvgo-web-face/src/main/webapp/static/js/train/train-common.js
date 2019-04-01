// 容器计算
function autoHeight($dom){
	var _height = $(window).height();
	var _top = $dom.offset().top;
	$dom.css("height", (_height - _top) + "px");
}

// 工具-19:00 格式时间 转换为 1900
function time2Str(time){
	return Number(time.split(':').join(''));
}

/**
 * 获取火车票差旅政策
 * @param {String} level 匹配差旅政策员工职级，形如“2/1/2/3/.../”
 * @return {Object}
 */
function getTrainPolicy(level) {
//	console.log(level);
	
	var policy = null;
	
	if (level == '') {
		layer.msg('获取员工职级失败！');
		return ;
	}
	
	$.ajax({
		url: '/train/query/policy',
		type: 'post',
		async: false,
		data: {level: level},
		success: function(data){
			//console.log(data);
			
			if (data.status != 200) {
				layer.msg(data.msg + ' | ' + data.status);
				console.error(data);
				return ;
			}
			
			policy = JSON.parse(data.data);
			
		},
		error: function(xhr, errorType, error){
			console.error(xhr);
			console.error(errorType || error);
			layer.msg('获取火车票差旅政策失败！' + (errorType || error));
			return ;
		}
	});
	
	if (policy == null) return ;
	
	return policy;
}


/**
 * 匹配差旅政策
 * @param {Object} policy 差旅政策
 * @param {String} trainTypeFlag 车次类型-标识:C|G|D|T|Z...
 * @param {String} seatFlag 坐席标识:P|O|M|1.....
 * 
 * @return {Object} result
 */
function matchTrainPolicy(policy, trainTypeFlag, seatFlag) {
	var result = {
			flag: 0,//是否超标- 0:不超标 1:超标
			controller: 1,//超标- ctrl 0:禁止预订  1:只作提醒
			traintype: '',//车次类型-高铁||动车||普快
			space: ''//差旅规则-允许乘坐席别
	};

	// controltype-数组
	// 关闭差旅政策时
	if (policy == 201) {
		return result;
	}
	
	if (!policy.controltype) {
		return result;
	}
	
//	console.log(policy.controltype);
	var ctrArr = policy.controltype.slice(0, -1).split('/');
//	console.log(ctrArr);
	
	// 高铁-C||G
	if (/C|G/.test(trainTypeFlag)) {
		result.traintype = '高铁/城际';
		result.space = policy.gaotie == '' ? '0' : getSpace(policy.gaotie);
		
		// 超标
		if (policy.gaotie.indexOf(seatFlag) == -1) {
			result.flag = 1;
			result.controller = ctrArr[0];
		}
	}
	
	// 动车-D
	else if (/D/.test(trainTypeFlag)) {
		result.traintype = '动车';
		result.space = policy.donche == '' ? '0' : getSpace(policy.donche);

		// 超标
		if (policy.donche.indexOf(seatFlag) == -1) {
			result.flag = 1;
			result.controller = ctrArr[1];
		}
	}
	
	// 普快
	else {
		result.traintype = '普快';
		result.space = policy.pukuai == '' ? '0' : getSpace(policy.pukuai);
		
		// 超标
		if (policy.pukuai.indexOf(seatFlag) == -1) {
			result.flag = 1;
			result.controller = ctrArr[2];
		}
	}
	
	return result;
}

/**
 * 火车票差旅政策匹配席位
 * @param {String} spaceData 形如："9/P/M/" "4/3/6/2/"
 * 
 * @return {String} 座位信息 "、"分割
 */
function getSpace(spaceData){
	
	var cab = {
				'F' : '动卧',
				'9' : '商务座', 
				'P' : '特等座',
				'M' : '一等座',
				'O' : '二等座/无座',
				'6' : '高级软卧',
				'4' : '软卧',
				'3' : '硬卧',
				'2' : '软座',
				'1' : '硬座/无座'
			  };
	
	var str = '';//坐席
	
	var spaceArr = spaceData.slice(0, -1).split('/');
	
	$.each(spaceArr, function (i, curr) {
		str += (cab[curr] + '、');
	});
	
	return str.slice(0, -1);
}