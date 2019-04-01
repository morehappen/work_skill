var trainBookParam = {
    passNum: 0
    ,selectSeat: []
};

// updateLoginUser
getLoginUserInfor(updateLoginUser);
var interface = new OuterInterface(), // 实例化第三方接口
    outerData = null; // 读取第三方接口数据
// console.log(outerData);
function outer_shenpi (data,flag) {
    $("#train-book-form").find("[name^='shenpi']").remove();
    var level = [],
        list = "";
    approves_ = "";
    if(!(data.data instanceof Array && data.data.length > 0)){
        return;
    }
    $.each(data.data,function(index,item){
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
    var xuhao = 0;
    $.each(level,function(index,item){
        var eLevelList="",
            levelItem=item;
        $.each(data.data,function(index,item){
            if(item.level==levelItem){
                if(!(item.isDefaultApprove == 0 && flag != 1)){

                    eLevelList+='<div class="sp-jb-person">'+
                        '<div class="sg-jb-p" data-sprid="'+item.id+'">'+item.name+'</div></div>';
                    approves_ += '<input type="hidden" name="shenpi[' + xuhao +'].email" value="' + item.email + '">' +
                        '<input type="hidden" name="shenpi[' + xuhao + '].isDefaultApprove" value="' + item.isDefaultApprove + '">' +
                        '<input type="hidden" name="shenpi[' + xuhao + '].level" value="' + item.level + '">' +
                        '<input type="hidden" name="shenpi[' + xuhao + '].mobile" value="' + item.mobile + '">' +
                        '<input type="hidden" name="shenpi[' + xuhao + '].name" value="' + item.name + '">' +
                        '<input type="hidden" name="shenpi[' + xuhao + '].username" value="' + item.username + '">';
                    xuhao++;
                }
            }
        });
        if(index < xuhao){
            eLevelList='<div class="sp-jb float-left">'+eLevelList+
                '<div>'+ item +'</div></div>';
        }
        if(index!=level.length-1){
            eLevelList+='<div class="dote-line float-left"></div>';
        }
        list+=eLevelList;
    });
    $(".sp-show").html(list);
    if($(".sp-show > div:last").is(".dote-line")){
        $(".sp-show > div:last").remove();
    }
    $("#train-book-form").append(approves_);
    var select=$('<select class="_select_ approve_rule_select" name="' + $('#model-flag').attr('data-modelflag') + '.approveid"></select>'),
        options = '<option value="">'+data.approveName+'</option>';
    select.html(options);
    $(".approve_rule").html(select);
    (new SelectMain()).creatSelect($(".approve_rule_select"));
    $("body").off("click",$(".approve_rule_select").parents(".drop").find(".drop_title").selector);
}

// action-解绑
$('body').on('click', '.unbind-12306', function(){
    new Confirm({
        text: '解除后需要重新绑定才可以继续使用12306账号购票，确定需要解绑吗？',
        confirmCallback: function() {
            ajaxUnBind();
        }
    });
});

// action-绑定-12306账号
$('body').on('click', '.bind-12306', function() {
    alert(1)
    new Bind12306({
        text: '绑定12306账号',
        callback: function(){}
    }, 1);
});

// action-修改-12306账号
$('body').on('click', '.edit-12306', function() {
    new Bind12306({
        text: '修改12306账号',//绑定12306账号
        account: $('.account').text(),
        pwd: $('.pwd').val(),
        id:$('.accountid').text,
        callback: function(){}
    }, 1);
});

// 点击-购票须知
$('body').on('click', '.tips-inform', function() {
    Bind12306({}, 0);
});


// 绑定12306
function Bind12306(currData, flag){

    var defaultData = {
        text: '提示！',//绑定12306账号
        account: '',
        pwd: '',
        id:'',
        callback: function() {}
    };

    var data = $.extend(true, {}, defaultData, currData);

    (function(){
        var str = '';
        if (flag == 1) {
            str +=
                '<div class="modal-model">' +
                '<div class="modal-mask"></div>' +
                '<div class="modal-content alert-content animated bounceInDown">' +
                '<div class="alert-title clear">' +
                '<span class="title">' + data.text + '</span>' +
                '<span class="alert-close">x</span>' +
                '</div>' +
                '<div class="alert-input clear">' +
                '<div class="alert-row clear margin-bottom-20">' +
                '<span class="input-desc">账号：</span><input type="text" class="input border-radius account" value="' + data.account + '" placeholder="12306账号" />' +
                '</div>' +
                '<div class="alert-row clear">' +
                '<span class="input-desc">密码：</span><input type="password" class="input border-radius pwd" value="' + data.pwd + '" placeholder="密码" />' +
                '</div>' +
                '</div>' +
                '<div class="btn-group">' +
                '<button type="button" class="btn btn-default btn-big alert-btn">绑 定</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        else if (flag == 0) {
            str +=
                '<div class="modal-model">' +
                '<div class="modal-mask"></div>' +
                '<div class="modal-content alert-tips animated bounceInDown">' +
                '<div class="clear">' +
                '<div class="alert-title clear" style="margin-bottom: 30px;">' +
                '<span class="title">购票须知</span>' +
                '<span class="alert-close">x</span>' +
                '</div>' +
                '<div class="clear">' +
                '<div class="every-part clear">' +
                '<div class="part-title">购票说明</div>' +
                '<div class="part-content">' +
                '<p>1.因受全国各铁路局的不同规定与要求，无法承诺百分之百代购成功，具体出票结果，请用户关注订单最新状态、客户端消息通知或出票结果短信。</p>' +
                '<p>2.系统暂不支持学生票，请填写本人有效身份证件信息。</p>' +
                '<p>3.购票时可使用的有效身份证件包括：中华人民共和国居民身份证、港澳居民来往内地通行证、台湾居民来往大陆通行证和按规定可使用的有效护照。</p>' +
                '</div>' +
                '</div>' +

                '<div class="every-part clear">' +
                '<div class="part-title">退票规定</div>' +
                '<div class="part-content">' +
                '<p>在线申请退票，不得晚于开车前35分钟；错过时间或者已经取票时，请持相关证件到车站办理退票。距离发车时间15天以上提交退票的，无退票手续费。退票扣款比例在开车时间前48小时至15天的，按票价的5%计；24小时至48小时的，按票价的10%计；小于24小时的，按票价的20%计。根据退票扣款比例计算的手续费，最小单位为0.5元，当计算的手续费尾数小于0.25元（不包含0.25元）的舍去、0.25至0.75元（不含0.75元）的计为0.5元，0.75元以上的进为1元。退票费最低按2元计收。</p>' +
                '</div>' +
                '</div>' +

                '<div class="every-part clear">' +
                '<div class="part-title">改签规定</div>' +
                '<div class="part-content">' +
                '<p>改签必须不晚于原票开车前35分钟方可进行，只能对未换取纸质车票的车票进行改签。同一订单中相同日期、车次、发站、到站、席别的车票方可批量改签，批量改签时，选择新票座位席别必须一致，并且不能是卧铺。一张车票只能办理一次改签，改签后若要退票，请到车站办理。开车前48小时以内，可改签从办理改签之时至票面日期当日24：00之间的其他车次。不办理票面日期次日及以后的改签。</p>' +
                '<p>新车票票价高于原车票的，补收差额，同样对差额部分核收退票费并执行退票费标准。</p>' +
                '</div>' +
                '</div>' +

                '<div class="every-part clear">' +
                '<div class="part-title">身份核验</div>' +
                '<div class="part-content">' +
                '<p>身份核验说明：订单中若有首次乘坐火车的乘客，需要尽快本人持二代身份证原件，到火车站的售票人工窗口，办理实名认证方可预订。</p>' +
                '</div>' +
                '</div>' +

                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        $('body').addClass('modal-open').append(str);
        JPlaceHolder.init();
    }());


    // 相关事件-初始化
    initAlertEvent(data);

};


// 相关事件-初始化
function initAlertEvent(){
    var $modalModel = $(document).find('.modal-model');
    // 点击-确定
    $('.alert-btn').on('click', function(){
        var account = $modalModel.find('.account').val();
        var pwd = $modalModel.find('.pwd').val();

        if (account == '') {
            layer.msg('请填写12306账号！', {icon: 7});
            return ;
        }
        if (pwd == '') {
            layer.msg('请填写密码！', {icon: 7});
            return ;
        }

        if ($(this).attr('data-sendajax')) {
            layer.msg('绑定中，请勿重复发送请求！');
            return ;
        }
        var id = $('#accountid').val();

        $(this).html('绑定...').attr('data-sendajax', true);

        ajaxBind(account, pwd, id);

    });

    // 点击-关闭
    $('.alert-close').on('click', function(){
        removeModel();
    });

    // 点击-遮罩
    $('.modal-mask').on('click', function(){
        removeModel();
    });

    // 遮罩消失
    function removeModel(){
        $('.modal-content').addClass('animated bounceOutUp');
        setTimeout(function(){
            $(document).find('.modal-model').remove();
            $('body').removeClass('modal-open');
        }, 1000);
    }
}


// ajax-绑定12306账号
function ajaxBind(account, pass, id) {

    $.ajax({
        url: '/train/saveaccount',
        type: 'post',
//		async: false,
        data: {account: account, pass: pass,id: id},
        success: function(data){

            layer.msg(data.msg);

            if (data.status == 200 ) {

                $('.modal-content').addClass('animated bounceOutUp');
                setTimeout(function(){
                    $(document).find('.modal-model').remove();
                    $('body').removeClass('modal-open');

                    location.reload();

                }, 1000);

            }
            else {
                $('body').find('.alert-btn').html('绑 定').attr('data-sendajax', false);
            }

        },
        error: function(xhr, errorType, error){
            layer.msg('绑定12306账号失败！' + (errorType || error));
            $('body').find('.alert-btn').html('绑 定').attr('data-sendajax', false);
            console.error(xhr);
            console.error(errorType || error);
        }
    });
}

// ajax-解除绑定-12306账号
function ajaxUnBind() {

    $.ajax({
        url: '/train/removeaccount',
        type: 'post',
        data:$('.accountid').text,
        success: function(data){

            layer.msg(data.msg);

            if (data.status != 200) return ;

            setTimeout(function(){ location.reload(); }, 1000);

        },
        error: function(xhr, errorType, error){
            layer.msg('解除绑定12306账号失败！' + (errorType || error));
            console.error(xhr);
            console.error(errorType || error);
        }
    });
}


// 总价计算
autoCountPrice();

// 总价-计算
function autoCountPrice() {
    // 乘客-人数
    var passNum = $('.passanger-model').find('.e-p-model').size();

    // todo:wxj-20180115-在线选座
    // console.log(passNum);
    trainBookParam.passNum = passNum;
    $('#all-pass-num').text(passNum);
    var $everySeatLine = $('.every-seat-line');
    var $seatWraper = $('.seat-wraper');
    if (passNum > 1) {
        if ($everySeatLine.length == 1) {
            var everySeatLineHtml = $everySeatLine.clone();
            $(everySeatLineHtml).find('.active').removeClass('active');
            $(everySeatLineHtml).find('.cell-seat').each(function () {
                var $this = $(this);
                var orginVal = $this.attr('data-value');
                $this.attr('data-value', orginVal.replace(/\d/, 2));
            });
            $seatWraper.append(everySeatLineHtml);
        }
    }else {
        $seatWraper.find('.every-seat-line:eq(1)').remove();
    }

    // 票
    var ticketPrice = $('.price-model').attr('data-ticketprice');
    var tickeTotal = ticketPrice*passNum;
    $('.ticket-p').find('.e-p-num').html(ticketPrice + '*' + passNum + '人');
    $('.ticket-p').find('.e-p-total').html(tickeTotal);

    // 保险
//	var insurancePrice = 3;
//	var insuranceTotal = insurancePrice*passNum;
//	$('.insurance-p').find('.e-p-num').html(insurancePrice + '*' + passNum + '人');
//	$('.insurance-p').find('.e-p-total').html(insuranceTotal);

    // 服务费
    var serviceFee = 0;//单价
    var serviceCount = 0;//数量

    var $serviceP = $('.service-p');

    var traintype = $serviceP.attr('data-traintype');

    //  订单收取服务费
    if (traintype == 'order') {
        serviceFee = $serviceP.attr('data-trainweb');//web收取
        serviceCount = passNum;
    }

    // 百分比收取服务费
    else if (traintype =='per') {
        serviceFee = tickeTotal;

        serviceCount = $serviceP.attr('data-trainpertype') == 2 ? 0 : ($serviceP.attr('data-trainper')/100);

//		// 月流水
//		if ($serviceP.data('trainpertype') == 2) {
//			serviceCount = 0;
//		}
//		// 单张订单-百分比
//		else if ($serviceP.data('trainpertype') == 1) {
//			serviceCount = $serviceP.data('trainper')/100;
//		}

    }

    var serviceTotal = parseFloat((serviceFee*serviceCount).toFixed(1));

    var str = traintype == 'order' ? (serviceFee + '*' + serviceCount + '人') : (serviceFee + '*' + serviceCount*100 + '%' + ($serviceP.attr('data-trainpertype') == 2 ? '(协议)' : ''));

    $('.service-p').find('.e-p-num').html(str);

    $('.service-p').find('.e-p-total').html(serviceTotal);

    // 总计
    var total = tickeTotal /*+ insuranceTotal*/ + serviceTotal;
    $('.p-m-price').html(total);

    initCellSeat();
}
// 初始化选中座位
function initCellSeat(){
    var cs = $("#choose_seat_i").val();
    if(cs != ""){
        var len = cs.length/2;
        for(var i=0; i<len; i++){
            var cv = cs.substring(i*2, ((i+1)*2));
            $("body").find(".cell-seat[data-value='"+cv+"']").addClass("active");
            $("body").find(".cell-seat[data-value='"+cv+"']").attr("data-index", i);
        }
    }
}

/**
 * 匹配差旅政策-提示 - 您超出了“只允许乘坐高铁硬座/硬卧”的差旅标准
 * @param {String} level 职级字符串，如:'2/6/1/'
 */
function policyCallback(level) {
    // todo:wxj-20180116-在线选座
    initSeatNumStatus();
    interface = new OuterInterface();
    outerData = interface.getOuterInterface();
    var outerInterface = function () { // 实例化第三方接口
        var costcenter = $('.costcenter_hidden').val(); //成本中心
        var projectinfo = $('.projectinfo_hidden').val();//项目中心
        var isEmpty = function (data) {
                return !(data === "" || data === null || data === undefined);
            },
            addPerson = function (data) {
                var person = "";
                level = "";
                $.each(data,function(index,item){
                    var certypeName = (function(certtype){
                        var value = '';
                        switch (certtype){
                            case "1": value = '身份证';break;
                            case "B": value = '护照';break;
                            case "C": value = '港澳通行证';break;
                            case "G": value = '身份台胞证证';break;
                            default: value = "其他";
                        }
                        return value;
                    })(item.certtype);
                    if(item.zhiwei != ""){
                        level += item.zhiwei + "/";
                    }
                    person += '<div class="passanger-model" ' +
                        'data-loginlevel="' + (item.zhiwei ? item.zhiwei : "") + '" ' +
                        'data-logindept="' + (item.deptname ? item.deptname : "") + '">' +
                        '<div class="e-p-model font-size-12" ' +
                        'data-id="' + (item.id ? item.id : "") + '" ' +
                        'data-level="' + (item.zhiwei ? item.zhiwei : "") + '" ' +
                        'data-certtype="' + (item.certtype ? item.certtype : "") + '" ' +
                        'data-certno="' + (item.certno ? item.certno : "") + '" ' +
                        'data-name="' + (item.name ? item.name : "") + '" ' +
                        'data-deptname="' + (item.deptname ? item.deptname : "") + '" ' +
                        'data-passtype="' + ((outerData.bookFlag == 1 || outerData.bookFlag == 2) ? "1" : "0") + '" ' +
                        'data-mobile="' + (item.mobile ? item.mobile : "") + '"' +
                        '>' +
                        '<div class="clear margin-bottom-10">' +
                        '<span class="float-left p-m-name clear position"><span class="icon-img pass-bg position-ab"></span>' +
                        '<span class="loginName p-every-passes text-ellipsis" title="' + (item.name ? item.name : "") + '">' + (item.name ? item.name : "") + '</span>' +
                        '</span>' +
                        '<div class="float-left clear"></div>' +
                        '<div class="float-left clear">' +
                        '<div class="label label-checkbox cursor notice-margin" >' +
                        '<span style="margin-left: 150px">发送通知</span>' +
                        '</div>' +
                        '<div class="label label-checkbox cursor notice-margin '+(item.mobile?"label-select-checkbox":"show_choice_default")+' " >' +
                        '<span class="show_choice"></span>' +
                        '<input type="hidden" name="airUser['+index+'].isSend" data-is="isSend-isSendEmail" checked="checked" value="'+(item.mobile?1:0)+'">' +
                        '<span>短信</span>' +
                        '</div>' +
                        '<div class="label label-checkbox cursor notice-margin '+(item.email?"label-select-checkbox":"show_choice_default")+'" >' +
                        '<span class="show_choice"></span>' +
                        '<input type="hidden" name="airUser['+index+'].isSendEmail"  data-is="isSend-isSendEmail" checked="checked" value="'+(item.email?1:0)+'">' +
                        '<span>邮箱</span>' +
                        '</div>'+
                        '</div>' +
                        '</div>' +
                        '<div class="clear margin-bottom-10 p-t-999">' +
                        '<div class="float-left p-w-120">证件类型</div>' +
                        '<div class="float-left p-w-160">证件号码</div>' +
                        ((costcenter==3||costcenter==1)?'<div class="float-left p-w-160" style="position: relative;">成本中心 <b class="nessary-b '+(costcenter!=1?"hide":"")+'" style="top:2px;left:53px">*</b></div>' :"")+""+
                        ((projectinfo==3||projectinfo==1)?'<div class="float-left p-w-160" style="position: relative;">项目中心 <b class="nessary-b '+(projectinfo!=1?"hide":"")+'" style="top:2px;left:53px">*</b></div>' :"")+

                        '</div><div class="clear margin-bottom-10"><div class="float-left drop-centro">' +
                        '<div class="drop"><select class="_select_ _dropDown_" data-value="' + (item.certtype ? item.certtype : "") + '" datatype="*" nullmsg="请选择证件类型">' +
                        '<option value="' + item.certtype + '">' + certypeName + '</option></select>' +
                        '<div class="drop_title">' + certypeName + '</div>' +
                        '<ul class="drop_option"><li>' + certypeName + '</li></ul></div></div>' +

                        '<div class="float-left p-w-160 input-centro">' +
                        '<input type="text" class="input user_centro border-0" value="' + (item.certno ? item.certno : "") + '" readonly="readonly" ></div>' +
                        ((costcenter==3||costcenter==1)?'<div class="float-left p-w-160 input-email">' +
                            '<input   type="text" '+(costcenter==3?'nullmsg="请选择成本中心" datatype="*"':"" )+'   class="input' + (outerData.costname?"":"costCenter-input") + ' "  name="users[' + index + '].costName" ' + (outerData.costname?"readonly":"") + ' value="' + (outerData.costname?outerData.costname:"") + '">' +
                            '<input   type="hidden"  name="users[' + index + '].costId" value="' + (outerData?0:"") + '" >' +
                            '</div>':"") +""+
                        ((projectinfo==3||projectinfo==1)?'<div class="float-left p-w-160 input-email">' +
                            '<input  type="text"  class="input' + (outerData.proname?"":"project-input") + ' " '+(costcenter==3?'nullmsg="请选择项目中心" datatype="*"':"" )+""+ (outerData.proname?"readonly":"") + ' name="users[' + index + '].itemNumber" value="' + (outerData.proname?outerData.proname:"") + '">' +
                            '<input  type="hidden"  name="users[' + index +'].itemNumberId" value="' +(outerData?0:"") + '">' +
                            '</div> ':"")+

                        '</div><div class="clear margin-bottom-10 p-t-999">' +
                        '<div class="float-left p-w-120">邮箱</div>' +
                        '<div class="float-left p-w-160">联系电话</div>' +
                        '<div class="float-left p-w-160">所在部门</div>' +
                        '</div><div class="clear">' +
                        '<div class="float-left p-w-120 input-email">' +
                        '<input type="text" name="users[' + index + '].email" value="' + (item.email ? item.email : "") + '" class="input user_email border-0" > ' +
                        '</div> ' +
                        '<div class="float-left p-w-160 input-mobile">' +
                        '<input type="text" name="users[' + index + '].userPhone" readonly value="' + (item.mobile ? item.mobile : "") + '" class="input user_mobile border-0" >' +
                        '</div>' +
                        '<div class="float-left p-w-160">' +
                        '<input type="text" class="input user_dept border-0" value="' + (item.deptname ? item.deptname : "") + '" readonly="readonly" >' +
                        '</div>' +
                        '</div>' +
                        '<input type="hidden" name="users[' + index + '].userId" class="e-id" value="' + (item.id ? item.id : "") + '">' +
                        '<input type="hidden" name="users[' + index + '].idsType" class="e-certtype" value="' + (item.certtype ? item.certtype : "") + '">' +
                        '<input type="hidden" name="users[' + index + '].id" class="e-passtype" value="' + ((outerData.bookFlag == 1 || outerData.bookFlag == 2) ? "1" : "0") + '"></div></div>';
                });
                $(".passanger-container").html(person);
            },
            data_ = null;
        if(!outerData){ // 非第三方数据
            return;
        }
        if(outerData.bookFlag != 1) {
            $("#train-book-form").attr("action", "/train/cas/createTrainorder");
        }
        $(".travelorder-val").val(outerData.traverorderno).attr("readonly","readonly");
        $(".project-input").val(outerData.proname).attr("readonly","readonly");
        $(".costCenter-input").val(outerData.costname).attr("readonly","readonly");
        if(!isEmpty(outerData.custinfo.bookUserName)){
            $(".link-name").val(outerData.custinfo.bookUserName);
            $(".link-phone").val(outerData.custinfo.bookMobile);
            if(outerData.custinfo.bookMobile!=""){
                $('input[name="order.isSend"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
                $('input[name="order.isSend"]').val(1);
            }else{
                $('input[name="order.isSend"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
                $('input[name="order.isSend"]').val(0);
            }
            if($(".link-email").val()!=""){
                $('input[name="order.isSendEmail"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
                $('input[name="order.isSendEmail"]').val(1);
            }else{
                $('input[name="order.isSendEmail"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
                $('input[name="order.isSendEmail"]').val(0);
            }
        }
        $(".link-email").val("");
        if(outerData.bookFlag == 1){
            return;
        }
        interface.clearPower(outerData.product);
        if(outerData.bookFlag == 5){
            return;
        }
        interface.getPersons(personCallback);

        function personCallback(data){
            if(data.status != 200){
                return;
            }
            if(outerData.bookFlag == 2){
                data_ = data.data;
            }else{
                data_ = outerData.passengers;
            }
            if(!isEmpty(outerData.custinfo.bookUserName)){
                mobile = outerData.custinfo.bookMobile;
                name = outerData.custinfo.bookUserName;
                $(".link_name").val(name);
                $(".link_phone").val(mobile);
                if(mobile!=""){
                    $('input[name="order.isSend"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
                    $('input[name="order.isSend"]').val(1);
                }else{
                    $('input[name="order.isSend"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
                    $('input[name="order.isSend"]').val(0);
                }
                if($(".link-email").val()==""){
                    $('input[name="order.isSendEmail"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
                    $('input[name="order.isSendEmail"]').val(1);
                }else{
                    $('input[name="order.isSendEmail"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
                    $('input[name="order.isSendEmail"]').val(0);
                }
            }
            addPerson(data_);
        }
        /********* 第三方有数据，开始处理 *********/
        $(".choice-cjr").remove();
        $(".air-common-p").html("");
        // 根据权限清空指定内容
    };
    outerInterface();
    // console.log(outerData);
    if(outerData != null && outerData.bookFlag != 1 && outerData.bookFlag != 2  &&  outerData.bookFlag != 5){
        outer_shenpi({
            data: outerData.shenpi,
            approveName : outerData.approveRuleName
        },null);
        return;
    }
    if (level == '' || $(".e-p-model").size() == 0) {

        $('[name="order.bookpolicy"]').val('');

        $('input.weibeiflag').val(0);

        $('[name="order.wbreason"]').attr('ignore', 'ignore');
        if(outerData!= null && outerData.bookFlag != 1){
            outer_shenpi({
                data: outerData.shenpi,
                approveName : outerData.approveRuleName
            },null);
        }
        weibeiTips(false);
        return ;
    }


    var policy = getTrainPolicy(level);
    // console.log(policy);

    var trainTypeFlag = ('' + $('#seat_name_s').attr('data-traincode')).slice(0, 1);

    var seatFlag = $('#seat_code_s').attr('data-seatcode');

    var policyResult = matchTrainPolicy(policy, trainTypeFlag, seatFlag);
    // console.log(policyResult);


    // 不超标
    if (policyResult.flag != 1) {

        // TODO:wxj-20170919-bookpolicy字段赋值
        $('[name="order.bookpolicy"]').val('');

        $('input.weibeiflag').val(0);

        $('[name="order.wbreason"]').attr('ignore', 'ignore');
        if(outerData != null && outerData.bookFlag != 1){
            outer_shenpi({
                data: outerData.shenpi,
                approveName : outerData.approveRuleName
            },null);
        }
        weibeiTips(false);
        return ;
    }

    // 超标
    $('input.weibeiflag').val(1);
    $('[name="order.wbreason"]').removeAttr('ignore');

    // TODO:wxj-20170919-bookpolicy字段赋值
    // matchBookPolicyStr(policy);


    // getWeibeiReason(wbRCallback);

    $('#train-book').attr('data-weibeiflag', policyResult.flag).attr('data-ctr', policyResult.controller);

    var str = policyResult.space == '0' ? '超标事项：您超出了' + policyResult.traintype + '：不允许乘坐所有座席的差旅标准！' : '超标事项：您超出了' + policyResult.traintype + '：只允许乘坐“' + policyResult.space + '”的差旅标准！';

    policyResult.controller == 0 && (str += '禁止预订！！！');

    $('[name="order.bookpolicy"]').val(str);
    if(outerData != null && (outerData.bookFlag == 2 || outerData.bookFlag == 5)){
        outer_shenpi({
            data: outerData.shenpi,
            approveName : outerData.approveRuleName
        },1);
    }
    weibeiTips(true, str);
}

/**
 * todo:wxj-20180208-差旅违背字符串
 * 匹配差旅政策-拼接bookpolicy字符串 //TODO:wxj-20170919-bookpolicy字段赋值
 * @param {Object} policy 差旅政策
 */
// function matchBookPolicyStr(policy){
// 	// TODO:20170902-新增 bookpolicy 字段赋值
// 	var policyStr = '';
//
// 	var allowStr = '：允许乘坐';
// 	var noAllowStr = '：不允许乘坐所有座席；';
//
// 	var gPolicyRes = matchTrainPolicy(policy, 'G', 'M');
// //	console.log(gPolicyRes);
// 	policyStr +=  gPolicyRes.space != '0' ? (gPolicyRes.traintype + allowStr +  gPolicyRes.space + '；') : (gPolicyRes.traintype + noAllowStr);
//
// 	var dPolicyRes = matchTrainPolicy(policy, 'D', 'M');
// //	console.log(dPolicyRes);
// 	policyStr +=  dPolicyRes.space != '0' ? (dPolicyRes.traintype + allowStr +  dPolicyRes.space + '；') : (dPolicyRes.traintype + noAllowStr);
//
// 	var pPolicyRes = matchTrainPolicy(policy, 'K', '1');
// //	console.log(pPolicyRes);
// 	policyStr +=  pPolicyRes.space != '0' ? (pPolicyRes.traintype + allowStr +  pPolicyRes.space + '；') : (pPolicyRes.traintype + noAllowStr);
//
// //	console.log(policyStr);
// 	$('[name="order.bookpolicy"]').val(policyStr);
//
// }



// 审批规则
function isApproveMain() {
    (new isApprove({
        weibei:$("input.weibeiflag").val(),
        type:"gnhcp"
    })).ajaxIsApprove();
}


/**
 * ajax-获取-超标原因
 * @param {Function} callback 处理超标原因数据的回调函数
 */
function getWeibeiReason (callback) {

    $.ajax({
        type: "POST",
        url:'/getWeibei',
        async:false,
        data:{ type: "train"},
        success: function(data) {

            if (data.status != 200) {
                layer.msg(data.msg + '（' + data.status + '）' || '获取超标原因请求失败！');
                console.log(data);
                return ;
            }

            var _data = JSON.parse(data.data);
            //console.log(_data);

            typeof callback == 'function' && callback(_data);
        },
        error:function(xhr, errorType , error){
            console.log(xhr);
            console.log(errorType || error);
            layer.msg('获取超标原因失败！' + (errorType || error));
        }
    });
}
/**
 * 处理超标原因的回调
 * @param {Object} data 超标原因数据
 */
function wbRCallback(data){
    var html = '';
    html += '<select class="_select_ w-reason-select" data-value="'+data[0].value+'">';
    $.each(data, function(index, item){
        html += '<option value="' + item.value + '">' + item.name + '</option>';
        index == 0 && $('[name="order.wbreason"]').val(item.name);
    });
    html += '</select>';

    $(".wb-c-select").html(html);
    (new SelectMain()).creatSelect($(".w-reason-select"));

    if($(".w-reason-select").val() == 4){
        $(".full-reason-c").show();
    }else{
        $(".full-reason-c").hide();
    }
    $(".weibei-container").show();
}

// action-点击-选择 其他||最后一条 超标原因处理
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
//判断是否是分销公司
$.ajax({
    url:"/crm/jiesuan",
    type:"post",
    success:function(data){
        // console.log(data);
        if(data.data.fukuankemu=="4"){
            //判断是否是分销公司  是分销的不显示差旅信息
            $('.chailv-mation-remove').remove();
        }

    }
});

/**
 * 提示消息框动效
 * @param {Boolean} flag true:显示||false:隐藏
 * @param {String} [tipsText] 超标提示消息，显示时才有次参数
 *
 */
function weibeiTips (flag, tipsText) {
    if(outerData == null || outerData.bookFlag ==1){
        isApproveMain();
    }
    var $clMShow = $('.t-p-c-des');

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


// form-表单提交
$("#train-book-form").Validform({
    btnSubmit: "#train-book",
    beforeSubmit: function(curform){
        $('input[name="approvename"]').val($(".approve_rule_select").parents(".drop").find(".drop_title").text());
        var len = $('.e-p-model').length;
        if (len == 0) {
            layer.msg('至少选择一个乘客！');
            return false;
        }
        // 成本中心 项目中心
        if($('.costcenter_hidden').val()=="1" || $('.projectinfo_hidden').val()=="1"||$('.getShowname').val()=="0"){
            var cname="";
            var pname="";
            var Showname = "";//判断bkjt的标志
            $(".passanger-model .e-p-model").each(function(){
                var cn = $(this).find("input[name$=costName]").val();
                var pn = $(this).find("input[name$=itemNumber]").val();
                var sn = $.trim($(this).find('.input[name$="showCode"]').val());
                var na = $(this).attr("data-name");
                if(cn == ""){
                    if(cname!=""){
                        cname+=",";
                    }
                    cname+=na;
                }
                if(pn == ""){
                    if(pname!=""){
                        pname+=",";
                    }
                    pname+=na;
                }
                if($('.getShowname').val()==0 && sn==""){
                    if(Showname!=""){
                        Showname+=",";
                    }
                    Showname+=na;
                }
            });
            if($('.costcenter_hidden').val()=="1" && cname!=""){
                layer.msg(cname + "请选择成本中心");
                return false;
            }
            if($('.projectinfo_hidden').val()=="1" && pname!=""){
                layer.msg(pname + (($('.getShowname').val()=="0")?"请输入SHOWNAME":"请选择项目中心"));
                return false;
            }
            if($('.getShowname').val()=="0" && Showname!=""){
                layer.msg(Showname + "请输入SHOWCODE");
                return false;
            }
        }
        if ($('#train-book').attr('data-weibeiflag') == 1 && $('#train-book').attr('data-ctr') == 0) {
            layer.msg('超出差旅标准，禁止预订！');
            return false;
        }

        var seats = $('.person-model').attr('data-seats');

        // TODO:wxj-20170919-是数字 && 人数大于坐席数
        if (!isNaN(seats) && len > seats) {
            layer.msg('当前车次席别仅剩' + seats + '张，选择人数不能大于票数！');
            return false;
        }
        var sign = false;
        // todo:wxj-20180115-在线选座
        var seatType = $(".choose-seat-type[value='1']").parents(".sel_train_seat");
        if(seatType.hasClass("auto_sel_seat")){
            if (len != $('.cell-seat.active').length) {
                zh.alerts({title:"提示", text: '您还有未选座的乘客，请全部选座后再提交订单。'});
                return false;
            }
        }
        var linkPhone = $(".link-phone").val();
        if(linkPhone==""){
            layer.msg('联系人手机号为空');
            return false;
        }
        if(!isPhoneSimp(linkPhone)){
            layer.msg('联系人手机号格式不正确');
            return false;
        }
        // $("[name='order.acceptNoSeat']:eq(0)").attr("checked",true);

        var passes = '';
        var signature = $.trim($(".p-m-price").text());
        var fromTime =$('.fromTime').val();
        var travelTime =$('.travelTime').val().split('-').join('');
        var arriveTime =$('.arriveTime').val();
        var runTimeSpan =$('.runTimeSpan').val();
        var ids ='' ;

        $('.e-p-model').find('.loginName').each(function() {
            passes += $(this).text() + '，';
        });
        $('.e-p-model').each(function() {
            ids+= $(this).attr('data-id') + '-';
        });

        $('[name="passengers"]').val(passes.slice(0, -1));
        loadingCommon();
        //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
        //这里明确return false的话表单将不会提交;
        $.ajax({
            url:"/train/checksimple",
            type:"post",
            async:false,
            data:{ids:ids,fromTime:fromTime,travelTime:travelTime,arriveTime:arriveTime,runTimeSpan:runTimeSpan},
            success:function (data) {
                if(data.status==200){
                    sign=true;
                }else if(data.status==201){
                    loadingCommon();
                    zh.alerts({
                        title:"提示",
                        text: data.data
                    });
                    sign=false;
                }
            },
            error:function(){
                sign=true;
            }
        });
        if(!sign){
            return sign;
        }



    },
    // callback: function(data){
    //
    // 	$.Hidemsg();
    //
    // 	if (data.status != 200) {
    // 		layer.msg(data.msg);
    // 		loadingCommon();
    // 		loadingCommon();
    // 		return ;
    // 	}
    // 	location.href = data.data;
    // }
});


// todo:wxj-20180115-新增在线选座功能
$('body').on('click', '.cell-seat', function() {

    var len = $('.passanger-model').find('.e-p-model').length;
    if (len == 0) {
        layer.msg('请先选择乘客，再选择座位');
        return ;
    }

    var $this = $(this);
    $this.toggleClass('active');

    selectSeat($this);
});

/**
 * 选座数据处理
 * @param {Element} $this 当前$dom对象
 */
// console.log(trainBookParam.selectSeat);
function selectSeat($this) {
    if ($this.hasClass('active')) {
        if ((trainBookParam.selectSeat.length + 1) > trainBookParam.passNum) {
            removeSeat(0);
        }
        trainBookParam.selectSeat.push($this.attr('data-value'));
        $this.attr('data-index', trainBookParam.selectSeat.length - 1);

        // console.log(trainBookParam.selectSeat);
    }else {
        removeSeat($this.attr('data-index'));
    }

    var $allSeat = $('.all-seat'),
        $allSelectNum = $('#all-select-num'),
        $allSelectSeat = $('#all-select-seat');
    $allSelectSeat.empty();
    if (trainBookParam.selectSeat.length > 0) {

        $allSeat.val(trainBookParam.selectSeat.join(''));
        $allSelectNum.text(trainBookParam.selectSeat.length);
        var divStr = "";
        for (var i = 0; i < trainBookParam.selectSeat.length; i++) {
            divStr+='<div class="train-seat float-left">'+trainBookParam.selectSeat[i]+'</div>';
        }
        $allSelectSeat.append(divStr);

        // $allSelectSeat.text(trainBookParam.selectSeat.join('       '));
    }
    else {
        $allSeat.val('');
        $allSelectNum.text(0);
        $allSelectSeat.text('');
    }
}



/**
 * 删除选座数据，同时处理视图显示
 * @param {Number} index 删除的当前数据的索引
 */
function removeSeat(index) {
    trainBookParam.selectSeat.splice(index, 1);

    $('.cell-seat[data-index="' + index + '"]').removeClass('active').removeAttr('data-index');
    // console.log(trainBookParam.selectSeat);

    $('.cell-seat[data-index]').each(function() {
        var $this = $(this);
        var _index = parseInt($this.attr('data-index'));
        if (_index > index) {
            $this.attr('data-index', (_index - 1));
        }
    });
}

/**
 * 清空所选座席数据并且处理页面座席为非选中状态
 */
function initSeatNumStatus() {
    trainBookParam.selectSeat.length = 0;
    $('.cell-seat').removeClass('active').removeAttr('data-index');
    $('.all-seat').val('');
    $('#all-select-num').text(0);
    $('#all-select-seat').text('');
}

// action-hover-高铁动车选座说明
$('.gd-desc').hover(
    function () {
        $('.gd-desc-wraper').stop().slideToggle();
    }
);


//设置公司配置，服务费配置
(function(){
    // $("#btn-train-back").click(function () {
    //     history.back(-1);
    // });
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
            jpinsurance="", //是否强制保险
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




/*history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
	history.pushState(null, null, document.URL);
});*/


$("body").on("click", ".checkOrder", function(){
    var sign = false;

    $.ajax({
        type:"post",
        url:"/train/checkPassenger",
        async:false,
        data:{signature:signature},
        success:function(data){
            if(data.status=='200'){
                $("#loading_main").remove();
                $('#createForm').attr('action', actionStr).submit();
                return sign=true;
            }else if(data.status =='300'){
                $("#loading_main").remove();
                layer.alert(data.msg);
                return sign=false;
            }else{
                $("#loading_main").remove();
                layer.alert(data.msg);
                return sign=false;
            }
        },
        error:function(err){
            $("#loading_main").remove();
            layer.alert(data.msg);
            return sign=false;
        }
    });
    return signs
});

//常用联系人的短信和邮箱
//	联系人的短信和邮箱
$("body").on("keyup",'input[name="order.linkPhone"]',function(){
    if(isPhoneSimp($(this).val())){
        $('input[name="order.isSend"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
        $('input[name="order.isSend"]').val(1);
    }else{
        $('input[name="order.isSend"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
        $('input[name="order.isSend"]').val(0);
    }
});
//
$("body").on("keyup",'input[name="order.linkEmail"]',function(){
    if(isEmail($(this).val())){
        $('input[name="order.isSendEmail"]').parents('.label-checkbox').removeClass('show_choice_default').addClass('label-select-checkbox');
        $('input[name="order.isSendEmail"]').val(1);
    }else{
        $('input[name="order.isSendEmail"]').parents('.label-checkbox').addClass('show_choice_default').removeClass('label-select-checkbox');
        $('input[name="order.isSendEmail"]').val(0);
    }
});

$(function(){
    // 初始化选座
    checkSelSeat();
    // 切换选座
    $("body").on("click", ".sel_train_seat", function(){
        $(".choose-seat-type").val("0");
        $(".sel_train_seat").removeClass("label-select-radio");
        $(this).addClass("label-select-radio");
        $(this).find(".choose-seat-type").val("1");
        if($(this).hasClass("auto_sel_seat")){
            $(".select-seat-wraper").stop().slideDown();
        }else{
            initSeatNumStatus();
            $(".select-seat-wraper").stop().slideUp();
        }
    });

    $("body").on("click", ".sel_train_seat_cb", function(){
        if($(this).hasClass("label-select-checkbox")){
            $(this).removeClass("label-select-checkbox");
            $(this).find("input").val("0");
        }else{
            $(this).addClass("label-select-checkbox");
            $(this).find("input").val("1");
        }
    });

    // 返回上一步
    $("body").on("click", "#train_book_callback", function(){
        window.location.href = "/train/Returnlist";
    });

});

function checkSelSeat(){
    var ln = $(".sel_train_seat").length;
    $(".choose-seat-type").val("0");
    $(".sel_train_seat").removeClass("label-select-radio");
    if(ln>1){
        $(".sel_train_seat:first").addClass("label-select-radio");
        $(".choose-seat-type:first").val("1");
    }else{
        $(".sel_train_seat:last").addClass("label-select-radio");
        $(".choose-seat-type:last").val("1");
    }
}


