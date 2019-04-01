// 第三方数据
var outerData_outer = null;
function initOuterInterface(flag) {
    var interface = new OuterInterface(), // 实例化第三方接口
        outerData = interface.getOuterInterface(), // 读取第三方接口数据
        outerData_outer = outerData;
    isEmpty = function (data) {
        return !(data === "" || data === null || data === undefined);
    },
        route = (outerData && isEmpty(outerData.route)) ? outerData.route : (outerData && isEmpty(outerData.routes)) ? outerData.routes : null,
        initData = function (data) { // data需要初始化的参数对象
            var flag = data.flag,
                fromCity = data.fromCity ? data.fromCity : (flag === 'train' ? "北京" : "北京"),
                fromCode = data.fromCode ? data.fromCode : (flag === 'train' ? "beijing" : "BJS"),
                arriveCity = data.arriveCity ? data.arriveCity : (flag === 'train' ? "上海" : "上海"),
                arriveCode = data.arriveCode ? data.arriveCode : (flag === 'train' ? "shanghai" : "SHA"),
                fromTime = data.fromTime ? data.fromTime : $(".from-time").val(),
                arriveTime = data.arrive ? data.arrive : $(".arrive-time").val();
            $(".from-city").val(fromCity);
            $(".from-city-code").val(fromCode);
            $(".to-city").val(arriveCity);
            $(".to-city-code").val(arriveCode);
            $(".from-time").val(fromTime);
            $(".arrive-time").val(arriveTime);
        };
    if (!outerData) { // 非第三方数据
        // 默认值-手动触发-air
        $('body').find('.tab-model .tab-target').trigger('click');
        initData({flag: flag});
        $(".tab-city").css("visibility", 'visible'); // 城市切换显示
        $(".airline-return").css("visibility", 'visible'); // 显示返程
        return;
    } else {
        if (outerData.routetype == "rt") {
            // initData({flag:flag});
            $('body').find('.tab-model .tab-target').trigger('click');
            $(".tab-city").css("visibility", 'visible'); // 城市切换显示
            $(".airline-tab .label-radio").removeClass('label-select-radio');
            $(".airline-return").css("visibility", 'visible').addClass("label-select-radio").find("input[name='type']").prop("checked", true); // 显示返程
            $(".fancheng_date").show();//默认往返
            /********* 第三方有数据，往返开始处理 *********/
            // $(".airline-return").css("visibility",'hidden');
            // 根据权限清空指定内容

            interface.clearPower(outerData.product);
            if (!route) { // 第三方城市数据为空
                initData({flag: outerData.product});
                return;
            }
            if (route instanceof Array) {
                route = route[0];
                var isOnly = route.isCanModify,
                    fromCity = route.from != "" ? route.from : "",
                    fromCode = route.fromcode != "" ? route.fromcode : "",
                    arriveCity = route.arrive != "" ? route.arrive : "",
                    arriveCode = route.arrivecode != "" ? route.arrivecode : "",
                    fromTime = route.startdate != "" ? route.startdate : "",
                    arriveTime = route.arrivedate != "" ? route.arrivedate : "";
                initData({
                    flag: outerData.product,
                    fromCity: fromCity,
                    fromCode: fromCode,
                    arriveCity: arriveCity,
                    arriveCode: arriveCode,
                    fromTime: fromTime,
                    arriveTime: arriveTime
                });
                if (isOnly == 0) {
                    interface.disableInput();
                } else {
                    // $(".tab-city").css("visibility", 'initial'); // 城市切换显示
                }
            }

            return;
        }
        /********* 第三方有数据，开始处理 *********/
        $(".airline-return").css("visibility", 'hidden');
        // 根据权限清空指定内容
        interface.clearPower(outerData.product);
        if (!route) { // 第三方城市数据为空
            initData({flag: outerData.product});
            //$(".tab-city").css("visibility", 'initial'); // 城市切换显示
            return;
        }
        $(".airline-return").remove(); // 删除返程
        //isCanModify
        var isOnly = route.isCanModify,
            fromCity = route.from != "" ? route.from : "",
            fromCode = route.fromcode != "" ? route.fromcode : "",
            arriveCity = route.arrive != "" ? route.arrive : "",
            arriveCode = route.arrivecode != "" ? route.arrivecode : "",
            fromTime = route.startdate != "" ? route.startdate : "",
            arriveTime = route.arrivedate != "" ? route.arrivedate : "";
        initData({
            flag: outerData.product,
            fromCity: fromCity,
            fromCode: fromCode,
            arriveCity: arriveCity,
            arriveCode: arriveCode,
            fromTime: fromTime,
            arriveTime: arriveTime
        });
        if (isOnly == 0) {
            interface.disableInput();
        } else {
            // $(".tab-city").css("visibility", 'initial'); // 城市切换显示
        }
    }
}

$(function () {

    //通过2级主导航跳转到指定模块
    (function () {
        //抓取？后面参数
        var href = location.search;
        var href_flag = "";
        //将前三个的值缓存起来
        var arrFlag = [$("input[name='airServer']").val(), $("input[name='trainServer']").val(), $("input[name='hotelServer']").val()];
        var target = "";
        //当是空的时候，处理左侧导航的逻辑
        if (href == "") {
            if ($("input[name='noserver']").val() == "noserver") {
                return;
            }
            //直接赋值变量target是air
            $.each(arrFlag, function (index, item) {
                if (item != undefined) {
                    target = item;
                    return false;
                }
            });
            //如果是air，给主导航的air加激活
            if (target == "air") {
                $(".tab-model li[data-linshi='air']").addClass("tab-target");
                return;
            } else {
                $(".tab-model li[data-flag='" + target + "']").addClass("tab-target");
                return;
            }
        }
        href_flag = href.split("=")[1];

        if (href_flag == "air") {
            ajaxModel(href_flag);
            //控制左导航的激活
            $(".tab-model li").removeClass("tab-target");
            //控制主导航的激活
            // $(".sub-nav-ul a").removeClass("sub-active");
            $(".tab-model li[data-linshi='air']").addClass("tab-target");
            $(".sub-nav-ul a[data-linshi='air']").not('.go-home').addClass("sub-active");
        } else {
            ajaxModel(href_flag);
            $(".tab-model li").removeClass("tab-target");
            // $(".sub-nav-ul a").removeClass("sub-active");
            $(".tab-model li[data-flag='" + href_flag + "']").addClass("tab-target");
            // $(".sub-nav-ul a[data-flag='" + href_flag + "']").not('.go-home').addClass("sub-active");
        }
    })();
    if (location.search == "") {
        initOuterInterface("air");// 初始化第三方接口
    } else {
        var search = location.search.split("?");
        initOuterInterface(search[1].split("=")[1]);
    }
    /********机票标签页 start********/
    //初始化差旅政策及权限
    (function () {
        if (typeof chailvLimit == "function") {
            chailvLimit();
        }
    })();

    //获取航空公司
    $("body").on("click", ".airCompany", function () {
        var this_ = $(this);
        $.ajax({
            type: "POST",
            url: '/air/getAirline',
            success: function (data) {
                var datas = null,
                    airCompany = [{text: "不限", code: ""}];
                if (data.status === 200) {
                    if (data.data === null || data.data === "") {
                        zh.alerts({
                            title: "提示",
                            text: "航空公司数据为空"
                        });
                        return;
                    }
                    datas = JSON.parse(data.data);
                    for (name in datas) {
                        var o = {
                            text: datas[name],
                            code: name
                        };
                        airCompany.push(o);
                    }
                    _autoFile_.runMain({
                        this_: this_,
                        url: "",   //请求地址
                        reg: "",   //模糊搜索正则
                        ziduan: "text", //需要显示的字段
                        arr: airCompany,
                        value: "code"
                    });

                }
            },
            error: function (XMLHttpRequest) {
                zh.alerts({
                    title: "提示",
                    text: "航空公司请求失败..."
                });
                console.log(XMLHttpRequest);
            }
        });
    });
    //单程往返切换
    $("body").on("click", ".airline-tab .label-radio", function () {
        var this_input = $(this).find("input[type='radio']"),
            date = $(".fancheng_date"),
            this_val = this_input.val();
        this_val === "ow" ? date.hide() : date.show();
    });

    //舱位类型初始化
    $("body").on("click", ".cangweiType", function (event) {
        event.stopPropagation();
        _autoFile_.runMain({
            this_: $(this),
            url: "",   //请求地址
            reg: "",   //模糊搜索正则
            ziduan: "text", //需要显示的字段
            arr: [{text: "不限", "code": ""}, {text: "经济舱", "code": "Y"}, {text: "头等舱", "code": "F"}, {
                text: "公务舱",
                "code": "B"
            }],
            value: "code"
        });
    });

    //出发到达城市切换
    $("body").on("click", ".tab-city", function () {
        setTimeout(function () {//配合城市插件 需要100ms的延迟
            var fCity = $(".from-city").val(),
                tCity = $(".to-city").val(),
                fCityCode = $(".from-city-code").val(),
                tCityCode = $(".to-city-code").val();
            $(".from-city").val(tCity);
            $(".to-city").val(fCity);
            $(".from-city-code").val(tCityCode);
            $(".to-city-code").val(fCityCode);
        }, 300);
    });
    //机票表单提交
    $("body").on("click", ".air-query", function () {

        setTimeout(function () {//配合城市插件 需要100ms的延迟
            var fromCity = $('[name="fromName"]').val(),
                toCity = $('[name="arriveName"]').val(),
                fromDate = $('[name="startdate"]').val(),
                toDate = $('[name="backdate"]').val();
            // if($(".airController").val() == "0"){
            // layer.msg("差旅政策不允许乘坐飞机，如有问题请联系贵公司管理员~");
            // return;
            // }
            if (fromCity === "") {
                layer.msg("请选择出发地！");
                return;
            }
            if (toCity === "") {
                layer.msg("请选择目的地！");
                return;
            }
            if (fromCity == toCity) {
                layer.msg("出发地与目的地不能相同！");
                return;
            }
            if (fromDate === "") {
                layer.msg("请选择出发日期！");
                return;
            }
            if ($(".airline-tab input:checked").val() === "rt") {
                if (toDate === "") {
                    layer.msg("请选择返程日期！");
                    return;
                }
                var fromTime = fromDate.split("-"),
                    toTime = toDate.split("-"),
                    fromMs = (new Date(fromTime[0], fromTime[1], fromTime[2])).getTime(),
                    toMs = (new Date(toTime[0], toTime[1], toTime[2])).getTime();
                if (fromMs > toMs) {
                    layer.msg("出发日期不能大于返程日期!");
                    return;
                }
            }
            $("#air-form").submit();
        }, 100);

    });

    /********机票标签页 end********/


    /******** 火车票标签页 begin ********/

    //舱位类型初始化
    $('body').on('click', '.train-type', function (event) {
        event.stopPropagation();
        _autoFile_.runMain({
            this_: $(this),
            url: "",   //请求地址
            reg: "",   //模糊搜索正则
            ziduan: "text,code", //需要显示的字段
            arr: [{text: '不限', 'code': ''}, {text: "高铁", "code": "C/G"}, {text: "动车", "code": "D"}, {
                text: "普快",
                "code": "Z/T/K"
            }, {'text': '其他', 'code': 'L/Y等'}],
            value: "code"
        });
    });

    // 火车票表单提交
    $('body').on('click', '.train-query', function () {
        setTimeout(function () {//配合城市插件 需要100ms的延迟
            if ($('[name="fromName"]').val() == $('[name="arriveName"]').val()) {
                layer.msg('出发地与目的地不能相同！');
                return;
            }

            $("#train-form").submit();

        }, 100);
    });

    /******** 火车票标签页 begin ********/


    /******** 酒店标签页 begin ********/
//    $('body').on('click', '.hotel-query', function(){
//        var $hotelForm = $('#hotel-form');
//
//        setTimeout(function(){//配合城市插件 需要100ms的延迟
//            var arrivalVal = $hotelForm.find('[name="arrivalDate"]').val().split("-"),
//                departureVal = $hotelForm.find('[name="departureDate"]').val().split("-"),
//                arrivalDate = new Date(arrivalVal[0],arrivalVal[1],arrivalVal[2]);
//            var departureDate = new Date(departureVal[0],departureVal[1],departureVal[2]);
//
//            var diff = departureDate - arrivalDate;
//
//            var onDay = 1 *24 *60 * 60 * 1000;
//
//            var interval = diff/onDay;
//
//            if (interval > 19) {
//                hotelOver20DaysTips();
//                return false;
//            }
//            $("#hotel-form").submit();
//
//        }, 100);
//    });


    /******** 酒店标签页 begin ********/

});


/*
 * 模块切换,请求模块内容
 */
$('body').on('click', '.tab-model li', function () {
    var $this = $(this),
        flag = $this.attr('data-flag'),
        linshi = $this.attr("data-linshi");
    $this.siblings().removeClass('tab-target');
    $this.addClass('tab-target');
    //背景图切换
    if (flag == "air") {
        $('.bg-box').removeClass("hotel-home-bg train-home-bg air-home-bg").addClass('air-home-bg');
        $('.board-air ,.board-air-title').show();
        // $('.board-train').hide();
        $('.board-hotel ,.board-hotel-title ,.board-train ,.board-train-title').hide();
    } else if (flag == "train") {
        $('.bg-box').removeClass("hotel-home-bg train-home-bg air-home-bg").addClass('train-home-bg');
        $('.board-air , .board-air-title,.board-hotel ,.board-hotel-title').hide();
        $('.board-train , .board-train-title').show();
    } else {
        $('.bg-box').removeClass("hotel-home-bg train-home-bg air-home-bg").addClass('hotel-home-bg');
        $('.board-train ,.board-train-title ,.board-air ,.board-air-title').hide();
        $('.board-hotel ,.board-hotel-title').show();
    }
    // $(".sub-nav-ul a").removeClass("sub-active");
    if (linshi == "true") {
        $(".sub-nav-ul a[data-linshi='true']").addClass("sub-active");
    } else {
        if (linshi == "air") {
            $(".sub-nav-ul a[data-linshi='air']").addClass("sub-active");
        } else {
            $(".sub-nav-ul a[data-flag='" + flag + "']").addClass("sub-active");
        }
    }
    ajaxModel(flag);
    // initOuterInterface(flag);
});

/*
 * 请求不同的查询模块-局部刷新页面
 * @param {String} flag 机票-air||火车票-train 等-标识
 */
function ajaxModel(flag) {
    var url = "";
    if (flag == "hotel") {
        url = "/hotel";
    } else {
        url = '/common/index/' + flag
    }
    $.ajax({
        url: url,
        type: 'post',
        async: false,
        success: function (data) {
            var indexFs = "";
            var listFS = "";
            var board = '';
            $('.iframe-model').html(data);
           switch (flag){
			   case "air":indexFs="air-home-bg";listFS="board-air-title";board="board-air";break;
			   case "train":indexFs="train-home-bg";listFS="board-train-title";board="board-train";break;
			   case "hotel":indexFs="hotel-home-bg";listFS="board-hotel-title";board="board-hotel";break;
           }
			$('.bg-box').removeClass("hotel-home-bg train-home-bg air-home-bg").addClass(indexFs);
			$('.board-air-title,.board-train-title,.board-hotel-title').hide();
            $('.board-air,.board-train,.board-hotel').hide();
			$('.board-cantainer').hide();
            $('.'+listFS).show();
            if($('.'+board).length>0){
				$('.board-cantainer').show();
				$('.'+board).show();
            }else{
				$('.board-cantainer').hide();
            }
            
            initDate(flag == 'hotel' && true);
            if (outerData_outer != "" && outerData_outer != null) {
                if (outerData.routetype == "rt") {
                    $(".tab-city").css("visibility", 'visible');
                }
            } else {
                $(".tab-city").css("visibility", 'visible');
            }
            _initCity(flag);
            outerData_outer == null || outerData_outer == "" ? $(".airline-return").css("visibility", "visible") : "";
        },
        error: function (xhr, errorType, error) {
            console.error(xhr);
            console.error(errorType || error);
        }
    });
}

/*
 * 初始化出发到达日期
 * @param {Boolean} today 是否今天
 */
function initDate(today) {
    var nowTime = new Date(),
        fromTime = null,
        arriveTime = null,
        fromTimeM = 0,
        arriveTimeM = 0;
    fromTimeM = nowTime.getTime() + 24 * 60 * 60 * 1000;
    arriveTimeM = nowTime.getTime() + 2 * 24 * 60 * 60 * 1000;
    formTime = new Date(fromTimeM);
    arriveTime = new Date(arriveTimeM);

    var hotelFM = add0Flag(nowTime.getMonth() + 1);
    var hotelFD = add0Flag(nowTime.getDate());

    var formTimeMonth = add0Flag(formTime.getMonth() + 1);
    var formTimeDate = add0Flag(formTime.getDate());

    var arriveTimeMonth = add0Flag(arriveTime.getMonth() + 1);
    var arriveTimeDate = add0Flag(arriveTime.getDate());

    if (today) {
        $("#beginDate").val() == "" ? $("#beginDate").val(nowTime.getFullYear() + "-" + hotelFM + "-" + hotelFD) : "";
        $("#endDate").val() == "" ? $("#endDate").val(formTime.getFullYear() + "-" + formTimeMonth + "-" + formTimeDate) : "";
    } else {
        $("#beginDate").val() == "" ? $("#beginDate").val(formTime.getFullYear() + "-" + formTimeMonth + "-" + formTimeDate) : "";
        $("#endDate").val() == "" ? $("#endDate").val(arriveTime.getFullYear() + "-" + arriveTimeMonth + "-" + arriveTimeDate) : "";
    }
};

// 不满10-补0
function add0Flag(num) {
    return num < 10 ? '0' + num : num;
}

function _initCity(flag) {
    flag == 'air' && getCitys('domair');
    flag == 'train' && getCitys('train');
    flag == 'hotel' && getCitys('hotel');
}

// action-input-关键字模糊搜索
$('body').on('input', '.keyword-search-input', function () {
    var $target = $('.search-list');
    getSearchList($('[name="cityId"]').val(), $(this), $target);
});
// action-点击-模糊关键字
$('body').on('click', '.e-search-l', function () {
    $('.keyword-search-input').val($(this).text());
    $('.search-list').slideUp();
});


// action-点击-body
$('body').on('click', function () {
    $('.search-list').slideUp();
});
$(".tab-model li").hover(
    function () {
        if (!(($(this).attr("data-flag").toString()) == ($("[name='hoverFlag']").val().toString()))) {
            $(this).addClass("tab-target");
        }
    },
    function () {
        if (!(($(this).attr("data-flag").toString()) == ($("[name='hoverFlag']").val().toString()))) {
            $(this).removeClass("tab-target tab-f");
        }
    }
);

//底部的判断
// 取窗口可视范围的高度
function getClientHeight() {
    var clientHeight = 0;
    if (document.body.clientHeight && document.documentElement.clientHeight) {
        var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    }
    else {
        var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    }
    return clientHeight;
}

if (getClientHeight() > 888) {
    $('.public-footer').css({"position": "absolute", "bottom": 0, "width": "100%"});
}
$(window).resize(function () {
    if (getClientHeight() > 888) {
        $('.public-footer').css({"position": "absolute", "bottom": 0, "width": "100%"});
    } else {
        $('.public-footer').css({"position": "relative", "width": "100%"});
    }
});

// //判断第三方登录过来的时候导航栏
// $(function(){
// 	if($('.sub-nav .sub-nav-ul a').length>0){
// 		$('.sub-nav').show();
// 	}else{
// 		$('.sub-nav').hide();
// 	}
// });

































