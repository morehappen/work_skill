// updateLoginUser
console.log(updateLoginUser)
getLoginUserInfor(updateLoginUser);

// action-点击-常用联系人
$('body').on('click', '.e-c-y-lx', function() {
    calcPassCount();
});

// action-点击-删除
$('body').on('click', '.remove_p', function() {
    calcPassCount();
});


// action-点击-选择乘客-确定按钮
$('body').on('click', '.select-true-p', function() {
    calcPassCount();
});

// 计算乘客人数
function calcPassCount() {
    var passCount = $('body').find('.passanger-model .e-p-model').length;

    $('.count-ctrl .ctrl-m').val(passCount == 0 ? 1 : passCount);

    $('#r-c-w').text(passCount == 0 ? 1 : passCount);

    autoCountPrice();
}

// 总价计算
autoCountPrice();

// 总价-计算
function autoCountPrice() {
    // 乘客-人数
    var passNum = $('.passanger-model').find('.e-p-model').size();


    // 房间数
    var roomCount = parseInt($('#r-c-w').text());
    // console.log(roomCount);


    // 夜数
    var interval = parseInt($('#iterval-day').text());
    console.log(interval);


    // 房费
    var hotelPrice = $('.price-model').attr('data-hotelprice');
    var hotelTotal = hotelPrice * roomCount * interval;
    //$('.hotel-p').find('.e-p-num').html(hotelPrice + '*' + passNum + '人');
    $('.hotel-p').find('.e-p-total').html(hotelTotal);

	/**
     * currGuaranteeTime 获取页面上的值(时间)
     * interval 夜数
     * roomCount 房间数量
     * hotelPrice 房间的价格（房费）
     * */
    // 计算担保费
    var currGuaranteeTime = $('.h-infor-con').find('.drop_title').text();
    // console.log($('.h-infor-con').find('.drop_title').text())
    // console.log(roomCount,interval)
    guaranteeModel(currGuaranteeTime, roomCount, interval, hotelPrice);


    // 服务费
    var serviceFee = 0;//单价
    var serviceCount = 0;//数量

    var $serviceP = $('.service-p');
    var $ePNum = $serviceP.find('.e-p-num');

    var gnhoteltype = $serviceP.attr('data-gnhoteltype');
    // console.log(gnhoteltype);

    var serviceTotal = 0;

    //  订单收取服务费
    if (gnhoteltype == 'order') {
        serviceFee = $serviceP.attr('data-gnhotelweb');//web收取

        $ePNum.text(serviceFee);
        serviceTotal = parseFloat(serviceFee).toFixed(1);
    }

    // 间夜收取服务费
    else if (gnhoteltype == 'jianye') {
        serviceFee = $serviceP.attr('data-gnhotelweb');//web收取

        $ePNum.text(roomCount + '间x' + interval + '夜x' + serviceFee);
        serviceTotal = parseFloat(roomCount*interval*serviceFee).toFixed(1);

    }

    // 百分比收取服务费
    else if (gnhoteltype =='per') {
        serviceFee = hotelTotal;
        serviceCount = $serviceP.attr('data-hotelpertype') == 2 ? 0 : ($serviceP.attr('data-gnhotelper')/100);

        $ePNum.text(hotelTotal + 'x' + serviceCount*100 + '%');
        serviceTotal = parseFloat((serviceFee*serviceCount)).toFixed(1);
    }

    $serviceP.find('.e-p-total').text(serviceTotal);

}


// action-点击选择-最晚到店时间
$('body').on('click', '.h-infor-con .drop_option li', function () {
    autoCountPrice();
});


/**
 * 担保模块-担保价格计算
 * @param {String} currGT 最晚到店时间
 * @param {Number} roomCount 房间数量
 * @param {Number} interval 夜数
 * @param {Number} hotelPrice 酒店单价-/间夜
 */
function guaranteeModel(currGT, roomCount, interval, hotelPrice) {
    var $guranteeP = $('.gurantee-p');
    var $isGuarantee = $('.isguarantee')

    // 无需担保
    if ($guranteeP.length == 0) return ;

    // 担保
    var isTimeGuarantee = $guranteeP.attr('data-istg');
    var startT = $guranteeP.attr('data-starttime');
    var endT = $guranteeP.attr('data-endtime');
    var isT = $guranteeP.attr('data-istom');
    // console.log(isTimeGuarantee);

    var isAmountGuarantee = $guranteeP.attr('data-isag');
    var amount = $guranteeP.attr('data-amount');
    // console.log(isAmountGuarantee);


    // 数量担保结果  || 时间担保结果
    var timeStatusResult = timeStatus(startT, endT, isT, currGT);
    // console.log(timeStatusResult);
    var amountStatusResult = amountStatus(amount, roomCount);
    // console.log(amountStatusResult);

    // 担保方式
    var guaranteeType = $guranteeP.attr('data-guaranteetype');
    // console.log(guaranteeType);

    // todo:需要担保时担保价格初始化
    $('.gurantee-p').find('.e-p-total').text(0);

    // 无条件担保
    if (!isTimeGuarantee && !isAmountGuarantee) {
        countGuarFee(guaranteeType, roomCount, interval, hotelPrice);
    }

    // 数量担保
    if (isAmountGuarantee && !isTimeGuarantee) {
        amountStatusResult && countGuarFee(guaranteeType, roomCount, interval, hotelPrice);
    }

    // 时间担保
    if (isTimeGuarantee && !isAmountGuarantee) {
        timeStatusResult && countGuarFee(guaranteeType, roomCount, interval, hotelPrice);
    }

    // 混合担保
    if (isTimeGuarantee && isAmountGuarantee) {
        (amountStatusResult && timeStatusResult) && countGuarFee(guaranteeType, roomCount, interval, hotelPrice);
    }
}


/**
 * 计算担保费用与担保明细展示
 * @param {String} type 担保方式-间夜'FirstNightCost'||全部'FullNightCost'
 * @param {Number} roomCount 房间数量
 * @param {Number} interval 夜数
 * @param {Number} hotelPrice 酒店单价
 */
function countGuarFee(type, roomCount, interval, hotelPrice) {
    // 间夜||订单

    var guaranreeFee = 0;
    var $guranteeP = $('.gurantee-p');
    var $ePNum = $guranteeP.find('.e-p-num');

    // 间夜-FirstNightCost
    if (type == 'FirstNightCost') {
        guaranreeFee = roomCount*hotelPrice;
        $ePNum.text(roomCount + 'x' + hotelPrice);
    }
    // 订单
    else {
        guaranreeFee = roomCount*hotelPrice*interval;
        $ePNum.text(roomCount + 'x' + hotelPrice + 'x' + interval);
    }

    $guranteeP.find('.e-p-total').text(guaranreeFee);

}


// 06:00 -> 0600
function time2Num(timeStr) {
    return parseInt(timeStr.split(':').join(''));
}

// 数量判断
function amountStatus(amount, currA) {
    return currA >= amount;
}

// 时间判断
function timeStatus(startT, endT, isT, currTime) {
    if (currTime.indexOf('凌晨') > -1) {
        currTime = currTime.slice(2);
        currTime = time2Num(currTime) + 2400;
    }else {
        currTime = time2Num(currTime);
    }

    var startTime = time2Num(startT);
    var endTime = isT ? (time2Num(endT) + 2400) : time2Num(endT);

    return (currTime >= startTime && currTime <= endTime);
}


/**
 * 匹配差旅政策-提示 - 您超出了“一线城市不得高于200元/间夜”的差旅标准
 * @param {String} level 职级字符串，如:'2/6/1/'
 */
function policyCallback(level) {
    // console.log(level);
    if (level == '') {

        $('[name="order.bookpolicy"]').val('');

        $('input.weibeiflag').val(0);

        $('[name="order.wbreason"]').attr('ignore', 'ignore');

        weibeiTips(false);
        return ;
    }

    var policy = getHotelPolicy(level, $('.h-infor-address').attr('data-cityid'));
    console.log(level);

    var policyResult = matchHotelPolicy(policy, $('.price-model').attr('data-hotelprice'));
    // console.log(policyResult);

    // 不超标
    if (policyResult.flag != 1) {

        // 清空bookpolicy
        $('[name="order.bookpolicy"]').val('');

        $('input.weibeiflag').val(0);

        $('[name="order.wbreason"]').attr('ignore', 'ignore');

        weibeiTips(false);
        return ;
    }

    // 超标
    $('input.weibeiflag').val(1);
    $('[name="order.wbreason"]').removeAttr('ignore');

    // bookpolicy字段赋值
    matchBookPolicyStr(policy);

    // getWeibeiReason(wbRCallback);

    $('#hotel-book').attr('data-weibeiflag', policyResult.flag).attr('data-ctr', policyResult.controller);

    var str = '您超出了“' + policyResult.cityName + '不得高于' + policyResult.price + '元/间夜”的差旅标准！';

    policyResult.controller == 0 && (str += '禁止预订！！！');

    weibeiTips(true, str);
}

/**
 * 匹配差旅政策-拼接bookpolicy字符串
 * @param {Object} policy 差旅政策
 */
function matchBookPolicyStr(policy){
    console.log(policy);
    var policyStr = '';

    var allPolicy = policy.policy;
    /**
     * allPolicy
     * {
     *      id":162,
     *      "companyid":61,
     *      "startlevel":1,
     *      "endlevel":1,
     *      "jdcitylevelid":"772/448/449/450/653/",
     *      "citylevelname":"其他城市/一线城市/二线城市/三线城市/特殊城市/",
     *      "price":"150/250/200/150/100/",
     *      "controllertype":"1/1/1/1/1/"
     *  }
     */

    var cityArr = allPolicy.citylevelname.slice(0, -1).split('/');
    var priceArr = allPolicy.price.slice(0, -1).split('/');

    $.each(cityArr, function(index, item) {
        policyStr += item + '不得高于' + priceArr[index] + '元/间夜；';
    });
    // console.log(policyStr);

    $('[name="order.bookpolicy"]').val(policyStr);

}


// 审批规则
function isApproveMain() {
    (new isApprove({
        weibei:$("input.weibeiflag").val(),
        type:"gnjd"
    })).ajaxIsApprove();
}


/**
 * ajax-获取-超标原因
 * @param {Function} callback 处理超出原因数据的回调函数
 */
function getWeibeiReason(callback) {
    $.ajax({
        type: 'POST',
        url: '/getWeibei',
        async: false,
        data: { type: "hotel"},
        success: function(data) {

            if (data.status != 200) {
                layer.msg(data.msg + ' | ' + data.status);
                console.error(data);
                return ;
            }

            var _data = JSON.parse(data.data);
            // console.log(_data);

            typeof callback == 'function' && callback(_data);
        },
        error:function(xhr, errorType , error){
            console.error(xhr);
            console.error(errorType || error);
            layer.msg('获取超标原因失败！' + (errorType || error));
        }
    });
}
/**
 * 处理超出原因的回调
 * @param {Object} data 超出原因数据
 */
function wbRCallback(data) {

    var html = '';
    html += '<select class="_select_ w-reason-select" data-value="'+data[0].value+'">';
    $.each(data, function(index, item){
        html += '<option value="' + item.value + '">' + item.name + '</option>';
        index == 0 && $('[name="order.wbreason"]').val(item.name);
    });
    html += '</select>';
    $('.wb-c-select').html(html);

    (new SelectMain()).creatSelect($(".w-reason-select"));

    if($(".w-reason-select").val() == 4){
        $(".full-reason-c").show();
    }else{
        $(".full-reason-c").hide();
    };
    $(".weibei-container").show();
}

// action-点击-选择 其他||最后一条 超出原因处理
$('body').on('click', '.wb-c-select .drop_option li', function() {
    var $this = $(this);

    $('[name="order.wbreason"]').val($this.text());

    var len = $this.closest('.drop_option').children().length - 1;

    if ($this.index() == len) {
        $(".full-reason-c").show();
        $('[name="order.wbreason"]').val('');
    }
    else {
        $(".full-reason-c").hide();
    }
});


/**
 * 提示消息框动效
 * @param {Boolean} flag true:显示||false:隐藏
 * @param {String} [tipsText] 超出提示消息，显示时才有次参数
 *
 */
function weibeiTips(flag, tipsText) {
    isApproveMain();

    var $clMShow = $('.cl-m-show');

    var inStr = 'bounceInRight', outStr = 'bounceOutRight';

    if (flag) {
        getWeibeiReason(wbRCallback);

        $clMShow.removeClass(outStr).addClass(inStr);

        setTimeout(function() { $clMShow.html(tipsText).show(); }, 1000);
    }

    else {

        $clMShow.removeClass(inStr).addClass(outStr);

        setTimeout(function() { $clMShow.hide(); }, 1000);
    }
}


// action-form表单提交
$("#hotel-book-form").Validform({
    btnSubmit: "#hotel-book",
    ajaxPost: true,
    beforeSubmit: function (curform){
        var len = $('.e-p-model').length;

        if (len == 0) {
            layer.msg('至少选择一个乘客！');
            return false;
        }

        if ($('#hotel-book').attr('data-weibeiflag') == 1 && $('#hotel-book').attr('data-ctr') == 0) {
            layer.msg('超出差旅标准，禁止预订！');
            return false;
        }

        var passes = '';

        $('.e-p-model').find('.loginName').each(function() {
            passes += $(this).text() + '，';
        });

        $('[name="passengers"]').val(passes.slice(0, -1));
    },
    callback: function(data) {
        $.Hidemsg();

        if (data.status != 200) {
            layer.msg(data.msg + ' | ' + data.status);
            console.error(data);
            return ;
        }
        location.href = data.data;
    }
});









//设置公司配置，服务费配置
(function(){
    $.ajax({
        type: "POST",
        url:"/getCompanyconfig",
        success: function(data) {
            if(data.status===200){ //数据请求成功
                var projectData=JSON.parse(data.data);
                companySet(projectData.productSet);
                serverCostSet(projectData.fuwufei); //服务费设置
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

    function companySet(data){
        var cdata=JSON.parse(data.proconfvalue),
            kaiqiccsq="", //是否开启出差单申请
            travelorder="", //出差单申请号
            travelreason="", //出差事由
            projectinfo="", //项目中心
            costcenter=""; //成本中心
        peisongaddress="", //配送地址
            jpinsurance=""; //是否强制保险
        $.each(cdata,function(index,item){
            switch(item.name){
                case "costcenter":costcenter=item.value;break;
                case "travelorder":travelorder=item.value;break;
                case "travelreason":travelreason=item.value;break;
                case "projectinfo":projectinfo=item.value;break;
                case "peisongaddress":peisongaddress=item.value;break;
                case "kaiqiccsq":kaiqiccsq=item.value;break;
                case "jpinsurance":jpinsurance=item.value;break;
                default:"";
            }
        });
        //设置成本中心
        if(costcenter==2){//2表示不显示
            $(".costCenter-c").remove();
        }else if(costcenter==3){//3显示非必填
            $(".costCenter-c .costCenter-input").attr("ignore","ignore");
            $(".costCenter-c").find('b').hide();
        }else{
            $(".costCenter-c").find('b').show();
        }
        if(kaiqiccsq==="1"){ //是否开启了出差单申请
            //出差申请单设置
            if(travelorder==2){ //不显示
                $(".travelorder-c").remove();
            }else if(travelorder==3){
                $(".travelorder-c .travelorder-val").attr("ignore","ignore");
                $(".travelorder-c").find('b').hide();
            }else{
                $(".travelorder-c").find('b').show();
            }
            //如果出差事由必填设置为否
            if(travelreason==0){
                $(".chailvR-c .chailv-reason").attr("ignore","ignore");
                $(".chailvR-c").find("b").hide();
            }
        }else{
            $(".travelorder-c").remove();
        }
        //设置项目信息
        if(projectinfo==2){//2表示不显示
            $(".project-c").remove();
        }else if(projectinfo==3){//3显示非必填
            $(".project-c .project-input").attr("ignore","ignore");
            $(".project-c .showname-c").attr("ignore","ignore");
            $(".project-c").find('b').hide();
        }else{
            $(".project-c").find('b').show();
        }
        //是否强制保险*e-p-bx*********************************************保险强制需要在表单提交时校验*****************************************************
        if(jpinsurance==="1"){
            $(".e-p-bx").addClass("e-bx-nessary");
        }
    }
    function serverCostSet(data){
        if(data.gntype==="order"){ //按每单收费
            $(".server-baifenbi").remove();
            $(".serverCost-none").remove();
            $(".e-server-cost").text(data.gnweb).attr({"data-type":"order","data-cost":data.gnweb});
            $(".e-p-total-s").text(data.gnweb).attr("data-cost",data.gnweb);
        }else{
            $(".order-server").remove();
            if(data.gnpertype==="2"){ //月流水收费，服务费为0
                $(".server-baifenbi").remove();
                $(".serverCost-none").attr({"data-type":"0","data-cost":"0"}).hide();
            }else{ //按百分比收费
                $(".serverCost-none").remove();
                $(".e-server-cost").text(data.gnper).attr({"data-type":"0","data-cost":data.gnper});
            }
        }
    }

})();











