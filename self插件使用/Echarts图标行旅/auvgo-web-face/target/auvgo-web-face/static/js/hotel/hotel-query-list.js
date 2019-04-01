$('.filter-wraper').find(':checked').prop('checked', false);

getCitys('hotel');

// action-点击-筛选的title
$("body").on("click",".e-f-title",function(){
    $(".e-f-title").not($(this)).next("ul").slideUp('fast');
    $(this).next("ul").slideToggle('fast');
});


// action-点击tab
$('body').on('click', '.t-c-t', function() {
    var activerStr = 'active';

    var $this = $(this);
    var tab = $this.attr('data-tab');
    var $efilterc = $this.closest('.e-filter-c');
    var $con = $efilterc.find('[data-con="' + tab + '"]');

    // 激活状态时-再次点击
    if ($this.hasClass(activerStr)) {
        $this.removeClass(activerStr);
        $con.slideUp();
        return ;
    }

    $this.siblings().removeClass(activerStr);
    $this.addClass(activerStr);

    $con.siblings().slideUp();
    $con.slideToggle();

});


// action-点击-展示更多设施
$('#more-trig').on('click', function() {
    var $this = $(this)
        $fwall = $('.f-w-all'),
        span = '<span class="icon-img position-ab flod-img"></span>';

    if ($fwall.is(':hidden')) {
        $fwall.slideDown();
        $this.html('收起' + span).removeClass('fold').addClass('unfold');
    } else {
        $fwall.slideUp();
        $this.html('更多' + span).removeClass('unfold').addClass('fold');
    }
});


// action-点击-查看大地图
$('.view-map-flag').on('click', function() {
    $('.model-list').hide();
    $('.model-map').show();
    $('.hotel-back').show();
    goMapAutoHeight();
    drawBMap();
});


// action-大地图-tab切换
$('body').on('click', '.f-filter-t', function() {

    var activeStr = 'active';
    var $this = $(this);

    $this.addClass(activeStr).siblings().removeClass(activeStr);

    var tab = $this.attr('data-tab');

    var $con = $('.map-tabcon').find('[data-con="' + tab + '"]')

    $con.addClass(activeStr).siblings().removeClass(activeStr);

    goMapAutoHeight();

});


// action-点击-返回
$('.hotel-back').on('click', function() {
    $('.model-map').hide();
    $('.hotel-back').hide();
    $('.model-list').show();
    drawMap();
});


// action-点击-查询
$('.hotel-query').on('click', function() {
    var $this = $(this);
    var isFirst = $this.attr('data-isfirst');

    $('.hotel-list').html('');
    // $('.f-filter-list-content').html('');

    setTimeout(function () {
        getHotelList({}, isFirst, parseList);
        $this.attr('data-isfirst', 0);
    }, 300);

});

// 手动初始化
triggerQuery();//init

// 手动触发
function triggerQuery () {
    setTimeout(function() { $('.hotel-query').trigger('click'); }, 300);
}

// action-点击-筛选条件
// $('body').on('click', '.filter-wraper .label input', function() {
$('body').on('click', '.filter-wraper .label', function() {
    // var $this = $(this);
    var $this = $(this).find('input');

    var type = $this.attr('type');

    var checkStatus = $this.prop('checked');

    var $label = $this.closest('.label');

    var flag = $label.attr('id');
    // console.log(flag);
    var _flag = $this.closest('.e-filter-c').attr('id');
    // console.log(_flag);
    var text = $label.text();

    var $allFilterWraper = $('#all-filter-wraper');

    if (type == 'radio') {
        var _flag = flag.split('-')[0];
        $allFilterWraper.find('[id^="e-' + _flag + '"]').remove();

        if ($this.attr('name') == 'price') {
            $('#price').find(':text').val('');
            $('#map-price').find(':text').val('');
        }
    }

    if (type == 'checkbox' && !checkStatus) {
        $allFilterWraper.find('#e-' +  flag).remove();
        filterConStatus();
        triggerQuery();
        return ;
    }

    // 处理model-map页面展示
    var $mapLabel = $('#map-' + flag);
    var $mapLabelInput = $mapLabel.find('input');
    if (_flag == 'price') {

        $('.model-map').find('#map-price')
            .find('.label-select-radio').removeClass('label-select-radio')
            .find('input').prop('checked', false);

        $mapLabel.addClass('label-select-radio');
        $mapLabelInput.prop('checked', true);

    }else if (_flag == 'starRate' || _flag == 'brands') {
        if (checkStatus) {
            $mapLabel.addClass('label-select-checkbox');
            $mapLabelInput.prop('checked', true);
        }else {
            $mapLabel.removeClass('label-select-checkbox');
            $mapLabelInput.prop('checked', false);
        }
    }

    updateFilterCon(text, _flag, flag);

    filterConStatus();

    triggerQuery();
});

// action-点击-自定义价格筛选
$('body').on('click', '.btn-price-confirm', function() {
    var $price = $('#price');

    $price.find('.label').removeClass('label-select-radio').find('input').prop('checked', false);

    var lowRate = $('#lowRate').val();
    var highRate = $('#highRate').val();

    $('#map-lowRate').val(lowRate);
    $('#map-highRate').val(highRate);

    var $idPrice = $('#all-filter-wraper').find('.e-f-r-c[id^=e-price]:not(#e-price-define)');
    var isExist = $idPrice.length > 0;

    if (isExist) {
        $idPrice.find('.remove-filter').trigger('click');
    }else {
        triggerQuery();
    }

});

// action-keyup||afterpaset||focus-自定义价格获取焦点
$('body').on('keyup', '.define-price', function() {
    validNum(this);
});
$('body').on('afterpaste', '.define-price', function() {
    validNum(this);
});
/**
 * 校验是否为数字并且替换非数字元素
 * @param {String} self 当前input的this
 */
function validNum (self) {
    var $this = $(self);
    $this.val($this.val().replace(/[^\d]/g, ''));
}


// action-点击-不限-清空筛选条件
$('body').on('click', '.btn-no-limit', function() {

    var $this = $(this);
    var flag = $this.attr('data-flag');

    // console.log(flag);
    // 处理model-map页面展示
    var $modelMap = $('.model-map');
    if (flag == 'starRate') {
        $modelMap.find('#map-start .label').removeClass('label-select-checkbox');
        $modelMap.find('#map-start :input').prop('checked', false);
    }else if (flag == 'brands') {
        $modelMap.find('#map-brands .label').removeClass('label-select-checkbox');
        $modelMap.find('#map-brands :input').prop('checked', false);
    }else if (flag == 'price') {
        $modelMap.find('#map-price .label').removeClass('label-select-radio');
        $modelMap.find('#map-price :input').prop('checked', false);

        $modelMap.find('#map-price').find('#map-price-nolimit').addClass('label-select-radio').find('input').prop('checked', true);
    }

    var $flagParent = $('#' + flag);

    $flagParent.find('.label').removeClass('label-select-checkbox label-select-radio').find('input').prop('checked', false);

    $flagParent.find(':text').val('');

    $('#all-filter-wraper').find('.f-m-' + flag).remove();

    filterConStatus();

    triggerQuery();

});


/**
 * update-更新筛选条件dom
 * @param {String} text 筛选条件的文本描述
 * @param {String} flag 每个筛选条件的标识-主要用于筛选条件的-双向的数据选中||删除
 */
function updateFilterCon(text, _flag, flag) {

    var html =
        '<span class="e-f-r-c f-m-' + _flag + '" id="e-' + flag + '">' +
            text + '<span class="hotel-bg remove-filter"></span>' +
        '</span>';

    $('#all-filter-wraper').append(html);
}


// action-点击-删除每个筛选条件
$('body').on('click', '.remove-filter', function() {
    var $this = $(this);
    var $efrc = $this.closest('.e-f-r-c');
    var id = $efrc.attr('id').substr(2);

    // 房价
    if (/price/.test(id)) {

        $this.attr('id') == 'e-price-define' && $('#price').find(':text').val('');
        $('.model-list').find('#' + id).removeClass('label-select-radio').find('input').prop('checked', false);

        $('.model-map').find('#map-price .label').removeClass('label-select-radio').find('input').prop('checked', false);

        $('.model-map').find('#map-price-nolimit').addClass('label-select-radio').find('input').prop('checked', true);
    }
    // 星级||品牌
    else {

        $('#' + id).removeClass('label-select-checkbox').find('input').prop('checked', false);

        $('#map-' + id).removeClass('label-select-checkbox').find('input').prop('checked', false);

    }

    $efrc.remove();

    filterConStatus();

    triggerQuery();

});

// action-点击-删除所有筛选条件
$('#remove-all-filter').on('click', function() {
    $('.filter-wraper')
        .find('.label').removeClass('label-select-checkbox label-select-radio')
        .find(':input').prop('checked', false);

    $('.filter-wraper').find(':text').val('');

    filterConStatus(1);

    // 清空 model-map筛选条件
    $('.model-map').find('.f-filter-c-c .label')
        .removeClass('label-select-checkbox label-select-radio')
        .find(':input').prop('checked', false);

    $('#map-price-nolimit').addClass('label-select-radio').find('input').prop('checked', true);

    triggerQuery();
});

/**
 * 筛选条件模块的显示隐藏控制
 * @param {Boolean} isALL 是否全部删除
 */
function filterConStatus(isAll) {
    var $allConWraper = $('.all-con-wraper');

    var $allFilterWraper = $('#all-filter-wraper');
    var $efrc =  $allFilterWraper.find('.e-f-r-c');

    isAll && $efrc.remove();

    // TODO:20171026-wxj
    // isAll 对应 删除所有 remove()   但是 length != 0
    if (isAll || $efrc.length == 0) {
        $allConWraper.addClass('hide');
    } else {
        $allConWraper.removeClass('hide');
    }
}


// action-点击-价格排序
$('body').on('click', '.model-list .stg-sort', function() {
    var $this = $(this);
    var upStr = 'stg-s-up';
    var downStr = 'stg-s-down';

    var upStatus = $this.hasClass(upStr);

    if (upStatus) {
        $this.removeClass(upStr).addClass(downStr).attr('data-flag', 0);
    }else {
        $this.removeClass(downStr).addClass(upStr).attr('data-flag', 1);
    }

    triggerQuery();
});

// action-点击-推荐排序
$('body').on('click', '.stg-sort-recommend', function() {

    $('.stg-sort-price').removeClass('stg-s-up stg-s-down').attr('data-flag', '');

    triggerQuery();
});

// action-点击- model-list页面 酒店类型-协议||其他
$('body').on('click', '.model-list .hotel-type-wraper .label', function() {

    var $this = $(this).find('input');
    var isChecked = $this.is(':checked');
    var flag = $this.val();

    var $input = $('.model-map').find('.hotel-type-wraper .label input[value="' + flag + '"]');
    var $label = $input.closest('.label');

    if (isChecked) {
        $input.prop('checked', true);
        $label.addClass('label-select-checkbox');
    }else {
        $input.prop('checked', false);
        $label.removeClass('label-select-checkbox');
    }

    triggerQuery();
});

// action-点击- model-map页面 酒店类型-协议||其他
$('body').on('click', '.model-map .hotel-type-wraper .label', function() {
    var $this = $(this).find('input');
    // console.log($this);
    // var isChecked = $this.is(':checked');
    // console.log(isChecked);
    var flag = $this.val();
    // console.log(flag);
    $('body').find('.model-list .hotel-type-wraper .label input[value="' + flag + '"]').parents(".label").trigger('click');
});


// action-点击- model-list 支付方式
$('body').on('click', '.model-list .pay-type-wraper .drop_option li', function() {

    // select获取不到值-延迟出发查询可得到
    // setTimeout(function () { triggerQuery(); }, 300);
    var $this = $(this);
    var $drop = $this.closest('.drop');
    var selectVal = $drop.find('._select_').val();
    var text = $this.text();

    var $payTypeWraper = $('.model-map').find('.pay-type-wraper');

    $payTypeWraper.find('._select_').val(selectVal).attr('data-value', selectVal);
    $payTypeWraper.find('.drop_title').text(text);

    triggerQuery();
});

// action-点击- model-map 支付方式
$('body').on('click', '.model-map .pay-type-wraper .drop_option li', function() {

    var i = $(this).index();

    setTimeout(function() {
        $('.model-list').find('.pay-type-wraper .drop_option li').eq(i).trigger('click');
    } ,300);

});

// action-点击-城市切换
$('body').on('click', '.every-city', function() {
    ajaxFilter();
});
$('body').on('click', '.ul-e-c', function() {
    ajaxFilter();
});

// action-点击-上一页||下一页
$('body').on('click', '.list-page', function() {
    var $this = $(this);
    var status = $this.hasClass('no-page');
    var isUp = $this.hasClass('page-up');
    var isDown = $this.hasClass('page-down');

    var $pageWraper = $('.model-list').find('.page-wraper');
    var $mapPageWraper = $('.model-map').find('.page-wraper');

    var currPage = parseInt($pageWraper.attr('data-page'));

    if (status) {
        return ;
    }

    var pageIndex = isDown ? (currPage + 1) : (currPage - 1);
    // console.log(pageIndex);
    $pageWraper.attr('data-page', pageIndex);
    $mapPageWraper.attr('data-page', pageIndex);

    triggerQuery();

});


/**
 * 渲染最近浏览过的酒店-读取cookie
 *
 * 清空历史浏览记录 $.cookie('_idNameStr', null);
 */
(function () {
    var recentlyViewedHotelStr = $.cookie('_idNameStr');
    if (!recentlyViewedHotelStr || recentlyViewedHotelStr == 'null') return ;

    var hotelArr = recentlyViewedHotelStr.split(',');

    var html = '';
    $.each(hotelArr, function(index, item) {
        var arr = item.split('-');
        html += '<li class="g-history hoverTips hover_content go-detail" data-id="' + arr[0] + '" data-name="' + arr[1] +'">' + arr[1] +'</li>'
    });

    if (html != '') {
        $('.glance-history-wraper').removeClass('hide');
    }

    $('#recently-view').html(html);

}());


// action-点击-查看详情
$('body').on('click','.go-detail',function() {
    var id = $(this).attr('data-id');
    var arrivalDate = $('[name="arrivalDate"]').val();
    var departureDate = $('[name="departureDate"]').val();
    var _paymentType = $('.model-list').find('._select_[name="paytype"]').val();
    var paymentType = _paymentType ? _paymentType : 'All';

    // 拼接cookie所需参数
    var hotelName = $(this).attr('data-name');

    var idNameStr = id + '-' + hotelName;

    var getCookie = $.cookie('_idNameStr');

    var idStr = '';
    if (getCookie && getCookie != 'null') {

        idStr = new RegExp(id).test(getCookie) ? getCookie : idNameStr + ',' + getCookie;

    }else {

        idStr = idNameStr;
    }


    if(/,/.test(idStr)){
        var orignIdStr = idStr.split(',');

        var cookieLen = 8;

        orignIdStr.length >= cookieLen && (orignIdStr.length = cookieLen);

        idStr = orignIdStr.join(',');
    }

    // var expiresDate= new Date();
    // expiresDate.setTime(expiresDate.getTime() + (1 * 60 * 1000));

    $.cookie('_idNameStr', idStr, { expires: 7 });

    location.href = '/hotel/query/gethoteldetail/' + arrivalDate + '/' + departureDate +'/' + id + '/' + paymentType;
});


/** =================== 大地图页面- action begin ===================  **/

// action-点击-房价
$('body').on('click', '#map-price .label', function() {
    var id = $(this).attr('id');

    $('#map-lowRate').val('');
    $('#map-highRate').val('');

    if (id == 'map-price-nolimit') {
        $('.model-list').find('#price').closest('.e-filter-area').find('.btn-no-limit').trigger('click');
        return ;
    }

    var sele = '#' + id.substr(4) + ' input';
    $('.model-list').find(sele).trigger('click');
});

// action-点击-自定义价格筛选确定
$('body').on('click', '.map-btn-price-confirm', function() {
    var lowRate = $('#map-lowRate').val();
    var highRate = $('#map-highRate').val();

    $('#lowRate').val(lowRate);
    $('#highRate').val(highRate);

    $('.btn-price-confirm').trigger('click');

});

// action-点击-星级
$('body').on('click', '#map-start .label', function() {
    var id = $(this).attr('id');
    // var sele = '#' + id.substr(4) + ' input';
    var sele = '#' + id.substr(4);
    $('.model-list').find(sele).trigger('click');
});

// action-点击-品牌
$('body').on('click', '#map-brands .label', function() {
    var id = $(this).attr('id');
    // var sele = '#' + id.substr(4) + ' input';
    var sele = '#' + id.substr(4);
    $('.model-list').find(sele).trigger('click');

});

// action-点击-关闭品牌弹窗
$('body').on('click', '.brands-close', function() {
    $('.map-brands').slideUp();
});

/** =================== 大地图页面- action begin ===================  **/


/**
 * ajax-请求-酒店列表数据
 * @param {Object} currData 查询参数
 * @param {Function} callback 酒店列表解析数据回调
 */
function getHotelList(currData, isFirst, callback) {
    var $modelList = $('.model-list');
    var $quertyText = $('[name="queryText"]');

    // if (!isFirst) {
    if (isFirst == 0) {
        var param = {
            brandId: '',
            paymentType: '',//''||'Prepay'||'SelfPay'
            facilities: '',
            // districtId: '',
            sort: '',//价格（低->高）'RateAsc'||价格（高->低）'RateDesc'||距离（近->远）'StarRankDesc'
            starRate: '',
            lowRate: '',
            highRate: ''
            // type: ''//'elong'||'sign'
        };

        $('#brands').find(':checked').each(function(){
            param.brandId += ($(this).val() + ',');
        });

        param.paymentType += $modelList.find('.pay-type').val();

        $('#facility').find(':checked').each(function(){
            param.facilities += ($(this).val() + ',');
        });

        // 封装queryText
        var qt2 = '';
        $('#position').find(':checked').each(function(){
            qt2 += ($(this).val());
        });

        var qt1 = $('[name="keyword"]').val();

        var qt = qt1 ? qt1 + (qt2 ? ',' + qt2 : '') : qt2;

        $quertyText.val(qt);

        var sortFlag = $modelList.find('.stg-sort-price').attr('data-flag');
        param.sort = !sortFlag ? '' : (sortFlag == 1 ? 'RateAsc' : 'RateDesc');

        $('#starRate').find(':checked').each(function(){
            param.starRate += ($(this).val() + ',');
        });

        var $priceChecked = $('#price').find(':checked');
        if ($priceChecked.length > 0) {
            var pri_valArr = $priceChecked.val().split('-');
            param.lowRate += pri_valArr[0];
            param.highRate += pri_valArr[1];
        }
        else {
            var $lowRate = $('#lowRate');
            var $highRate = $('#highRate');
            var $mapLowRate = $('#map-lowRate');
            var $mapHighRate = $('#map-highRate');

            var _lowRate = $lowRate.val();
            var _lowRateLen = _lowRate.length;
            var _lowStatus = (_lowRateLen && !isNaN(_lowRate));

            var _highRate = $highRate.val();
            var _highRateLen = _highRate.length;
            var _higrRateStatus = (_highRateLen && !isNaN(_highRate));

            if (_lowStatus) {
                param.lowRate += _lowRate;
            }else {
                $lowRate.val('');
                $mapLowRate.val('');
            }

            if (_higrRateStatus) {
                param.highRate += _highRate;
            }else {
                $highRate.val('');
                $mapHighRate.val('');
            }

            var priceDes = '';
            if (_lowStatus && _higrRateStatus) {

                if (_lowRate > _highRate) {
                    layer.msg('房价最低价不能大于最高价');
                    return ;
                }

                priceDes += _lowRate + '-' + _highRate + '元';
            }else if (_lowStatus) {
                priceDes += _lowRate + '元以上';
            }else if (_higrRateStatus) {
                priceDes += _highRate + '元以下';
            }

            if (priceDes) {

                var $ePriceDefine = $('#e-price-define');

                $ePriceDefine.length > 0 && $ePriceDefine.remove();

                updateFilterCon(priceDes, 'price', 'price-define');

                filterConStatus();

                // model-map页面展示处理
                $('.model-map').find('#map-price-nolimit').removeClass('label-select-radio').find('input').prop('checked', false);

            }
        }

        var hotelType= '';
        $modelList.find('.hotel-type-wraper').find('.hotel-type:checked').each(function() {
            hotelType += ($(this).val() + ',');
        });
        if (hotelType.length > 0) {
            var hotelTypeArr = hotelType.slice(0, -1).split(',');
            param.facilities += hotelTypeArr.length == 1 ? hotelTypeArr[0] : '';
        }
    }

    var defaultData = {
        arrivalDate: $('#beginDate').val(),
        departureDate: $('#endDate').val(),
        cityId: $('.city-code').val(),
        cityName: $('.city-name').val(),
        queryText: $('[name="queryText"]').val(),
        pageIndex: $modelList.find('.page-wraper').attr('data-page'),
        pageSize: 20,
        longitude: '',
        latitude: '',
        brandId: '',
        paymentType: '',//''||'Prepay'||'SelfPay'
        facilities: '',
        starRate: '',
        // districtId: '',
        sort: '',//价格（低->高）'RateAsc'||价格（高->低）'RateDesc'||距离（近->远）'StarRankDesc'
        // signHotelids: '',
        // eids: '',
        // customerType: '',
        lowRate: '',
        highRate: ''
        // type: ''//'elong'||'sign'
    };

    var _data = $.extend({}, defaultData, param, currData);
    // console.log(_data.pageIndex);
    var departVal = defaultData.departureDate.toString().split("-"),
        defaultVal = defaultData.arrivalDate.toString().split("-"),
        interval = (new Date(departVal[0],departVal[1],departVal[2]) - new Date(defaultVal[0],defaultVal[1],defaultVal[2]))/(1*24*60*60*1000);

    if (interval > 19) {
        hotelOver20DaysTips();
        return false;
    }

    $.ajax({
        url: '/hotel/query/list',
        type: 'post',
        data: _data,
        beforeSend: function(xhr) {
            toggleModal(true, _data);
        },
        success: function(data) {
            // console.log(data);

            toggleModal(false);

            if (data.status != 200) {
                layer.msg(data.msg + ' | ' + data.status);
                console.error(data);
                return ;
            }

            if (data.data == null) {
                console.log('data.data为undefined');
                return ;
            }

            var data = JSON.parse(data.data);
            // console.log(_data);

            typeof callback == 'function' && callback(data, _data.pageIndex);

        },
        error: function(xhr, errorType, error) {
            console.error(xhr);
            console.error(errorType || error);
            toggleModal(false);
            layer.msg('查询酒店失败！ | ' + (errorType || error));
        }
    });
}

/**
 * update-酒店列表数据解析
 * @param {Array} data 酒店数据
 * @param {Boolean} isAppend append()||html()
 */
var hotelOrign = [];//存储酒店列表原始数据
function parseList (data, pageIndex) {
    // console.log(data.list);

    parseDataList(data, pageIndex);
    parseMapList(data, pageIndex);

    hotelOrign = data.list;

    !$('.model-list').is(':hidden')  && drawMap();
    !$('.model-map').is(':hidden')  && drawBMap();
}


/**
 * 查询列表地图-初始化
 */
function drawMap() {
    var map = new BMap.Map("map-container");
    map.enableScrollWheelZoom();					    // 启用鼠标滚轮

    var pointArr = [];
    $.each(hotelOrign, function(index, item) {
        var point = new BMap.Point(item.longitude, item.latitude);
        var labelStr1 = item.hotelName;
        var labelStr2 = item.currencyFlag + item.lowRate;

        addMapMarker(map, point, labelStr1, labelStr2);

        pointArr.push(point);
    });
    // var overlayArray = map.getOverlays();
    // console.log(overlayArray);

    // console.log(pointArr);
    var mapViewport = map.getViewport(pointArr);

    map.centerAndZoom(mapViewport.center, mapViewport.zoom);

    pointArr.length == 0 && map.centerAndZoom($('[name="cityName"]').val(), 11);

}
/**
 * 酒店列表页面-添加地图marker
 * @param {String} map 地图
 * @param {Object} point 百度地图经纬度，如{lng:104.059927761,lat:30.670294075}
 * @param {String} hotelName 酒店名称
 * @param {String} price 酒店价格 ￥1230.0
 */
function addMapMarker(map, point, hotelName, price) {
    var markerOpts = {
        icon: new BMap.Icon('/static/img/common/baidu-location.png', new BMap.Size(32, 32), {})
        // title: hotelName + price
    };
    var marker = new BMap.Marker(point, markerOpts);
    // console.log(marker);
    // console.log(marker.getIcon());
    map.addOverlay(marker);

    var labelOpt = {
        offset: new BMap.Size(20, 0)
    };
    var label = new BMap.Label('', labelOpt);
    label.setContent(hotelName + '<span class="hotel-price">' + price + '</span>');
    label.setStyle({display: 'none'});
    marker.setLabel(label);

    marker.addEventListener('mouseover', function() {
        this.setIcon(new BMap.Icon('/static/img/common/baidu-location-hover.png', new BMap.Size(32, 32), {}));
        // this.setIcon(new BMap.Icon().setImageUrl('/static/img/common/baidu-location-hover.png'));
        this.setTop(true);
        label.setStyle({display: 'block'});
        label.setZIndex(20000000);
    });

    marker.addEventListener('mouseout', function() {
        this.setIcon(new BMap.Icon('/static/img/common/baidu-location.png', new BMap.Size(32, 32), {}));
        this.setTop(false);
        label.setStyle({display: 'none'});
    });
    
}


/**
 * 大地图-初始化
 */
function drawBMap() {
    var bMap = new BMap.Map('big-map-container');       // 创建地图实例
    bMap.addControl(new BMap.NavigationControl());
    bMap.addControl(new BMap.ScaleControl());
    bMap.addControl(new BMap.OverviewMapControl());
    // bMap.addControl(new BMap.MapTypeControl()); 	    // 地图||卫星||三维
    bMap.enableScrollWheelZoom();					    // 启用鼠标滚轮

    var pointArr = [];
    $.each(hotelOrign, function(index, item) {
        var point = new BMap.Point(item.longitude, item.latitude);
        var htmlStr =
            '<div class="bmap-wraper">' +
                '<div class="bmap-title font-size-16">' + item.hotelName + '</div>' +
                '<div class="bmap-line"></div>' +
                '<div class="bmap-content font-size-12 clear">' +
                    '<div class="float-left bmap-img">' +
                        '<img src="' + item.thumbnailUrl + '" />' +
                    '</div>' +
                    '<div class="float-left bmap-desc color-666">' +
                        '<div>' + item.starRateName + '</div>' +
                        '<div class="bmap-address" title="' + item.address + '">' + item.address + '</div>' +
                        '<div class="bmap-line"></div>' +
                        '<div class="clear">' +
                            '<div class="low-price float-left">' +
                                '<span class="color-purple">' + item.currencyFlag + '</span>' +
                                '<span class="color-purple font-size-18 font-600">' + item.lowRate + '</span>' +
                                '<span class="color-999">起</span>' +
                            '</div>' +
                            '<div class="float-right">' +
                                '<button type="button" class="btn btn-default btn-big go-detail" onclick="bmapClick(this);" data-id="' + item.hotelId + '" data-name="' + item.hotelName + '" >查看</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        addInfoWindow(bMap, point, htmlStr);

        pointArr.push(point);
    });

    // console.log(pointArr);
    var mapViewport = bMap.getViewport(pointArr);

    bMap.centerAndZoom(mapViewport.center, mapViewport.zoom);

    pointArr.length == 0 && bMap.centerAndZoom($('[name="cityName"]').val(), 11);
}
/**
 * 大地图-初始化弹窗
 * @param {String} map 地图
 * @param {Object} point 百度地图经纬度，如{lng:104.059927761,lat:30.670294075}
 * @param {String} htmlStr 地图弹窗html
 */
function addInfoWindow(map, point, htmlStr) {
    var markerOpts = {
        icon: new BMap.Icon('/static/img/common/baidu-location.png', new BMap.Size(32, 32), {})
    };
    var marker = new BMap.Marker(point, markerOpts);
    map.addOverlay(marker);

    var infoWindowOpts = {
        width: 350,
        height: 170
    };
    var infoWindow = new BMap.InfoWindow(htmlStr, infoWindowOpts);  // 创建信息窗口对象

    marker.addEventListener('click', function () {
        this.openInfoWindow(infoWindow);
        // // 图片加载完毕重绘infowindow
        // document.getElementById('imgDemo').onload = function (){
        //     infoWindow.redraw();   //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
        // }
    });
}
/**
 * 地图弹窗-查看按钮
 * @param {String} _this 按钮dom对象
 */
function bmapClick(_this) {
    var id = $(_this).attr('data-id');
    $('.map-list-container').find('.go-detail[data-id="' + id + '"]').trigger('click');
    
}


/**
 * update-查询列表酒店数据解析
 * @param {Array} data 酒店数据
 * @param {Number} pageIndex 当前页码
 */
function parseDataList(data, pageIndex) {
    $('#hotel-count').text(data.totalCount);

    var haveNextPage = data.isHaveNextPage;
    var $pageWraper = $('.model-list').find('.page-wraper');
    $pageWraper.attr('data-page', pageIndex);

    var $pageUp = $pageWraper.find('.page-up');
    var $pageDown = $pageWraper.find('.page-down');

    pageIndex == 1 ?
        $pageUp.addClass('no-page') :
        $pageUp.removeClass('no-page');

    haveNextPage ?
        $pageDown.removeClass('no-page') :
        $pageDown.addClass('no-page');

    var list = data.list;

    if (!(list instanceof Array)) {
        console.error('data.list is not array');
        return ;
    }

    var html = '';

    $.each(list, function(index, item) {
        // console.log(item);

        html +=
            '<div class="every-cell clear">' +
                '<div class="e-cell-l clear">' +
                    '<div class="e-cell-i">' +
                        '<img src="' + item.thumbnailUrl + '" width="166" height="120" />' +
                    '</div>' +
                    '<div class="e-cell-des">' +
                        '<div class="e-cell-t hoverTips hover_content">' + item.hotelName + '</div>' +
                        '<div class="e-cell-a">' + item.businessZoneName + '<span> | </span>' + item.districtName + '</div>' +
                        '<div class="e-cell-rank">' + item.starRateName + '</div>' +
                    '</div>' +
                    (item.type == 'sign' ? '<div class="float-left"><span class="xieyi-flag">协议</span></div>' : '') +
                '</div>' +
                '<div class="e-cell-r text-align-r">' +
                    '<div class="dianping">来自用户 <span class="color-purple font-size-14 font-600">' + item.reviewCount + '</span> 条点评</div>' +
                    '<div class="jiage color-purple">' +
                        item.currencyFlag + '<span class="font-size-16 font-600">' + item.lowRate + '</span>' +
                        '<span class="color-999">起</span>' +
                    '</div>' +
                    '<div>' +
                        '<div class="btn-detail go-detail" data-id="' + item.hotelId + '" data-name="' + item.hotelName + '">查看详情</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });

    if (html == '') {
        $('.no-data-wraper').css('display', 'table');
    }else {
        $('.no-data-wraper').css('display', 'none');
    }

    $('.hotel-list').html(html);
}


/**
 * update-查看大地图酒店数据解析
 * @param {Array} data 酒店数据
 * @param {Number} pageIndex 当前页码
 */
function parseMapList(data, pageIndex) {
    var haveNextPage = data.isHaveNextPage;
    var $pageWraper = $('.model-map').find('.page-wraper');
    $pageWraper.attr('data-page', pageIndex);

    var $pageUp = $pageWraper.find('.page-up');
    var $pageDown = $pageWraper.find('.page-down');

    pageIndex == 1 ?
        $pageUp.addClass('no-page') :
        $pageUp.removeClass('no-page');

    haveNextPage ?
        $pageDown.removeClass('no-page') :
        $pageDown.addClass('no-page');


    var list = data.list;

    if (!(list instanceof Array)) {
        console.error('data.list is not array');
        return ;
    }

    var html = '';

    $.each(list, function(index, item) {
        html +=
            '<div class="e-list-cell clear cursor go-detail" data-id="' + item.hotelId + '" data-name="' + item.hotelName + '">' +
                '<div class="float-left e-list-cell-t">' +
                    '<img src="' + item.thumbnailUrl + '" width="90" height="90" />' +
                '</div>' +
                '<div class="float-left e-list-cell-des">' +
                    '<div class="e-l-c-d-t hoverTips hover_content">' + item.hotelName + '</div>' +
                    '<div class="e-l-c-d-r color-999">' + item.starRateName + '</div>' +
                    '<div class="e-l-c-d-rate color-999">' + item.score + '</div>' +
                    '<div class="e-l-c-d-price color-purple text-align-r">' + item.currencyFlag + '<span class="font-size-16 font-600">' + item.lowRate + '</span><span class="color-999">起</span></div>' +
                '</div>' +
            '</div>';
    });

    $('.f-filter-list-content').html(html);
}


// 遮罩层-显示||隐藏
function toggleModal(status, param) {
    var $screenFull = $('.Screen-full');

    if (status) {
        $('.mask-arrive-date').text(param.arrivalDate);
        $('.mask-location').text(param.cityName);
        $('.mask-depart-date').text(param.departureDate);
        $screenFull.show();
    } else {
        $screenFull.hide();
    }
}

// 获取筛选条件
ajaxFilter();
function ajaxFilter() {
    getFilter($('.city-code').val(), parseFilterData);

    $('.hotel-query').attr('data-isfirst') == 0 && $('#remove-all-filter').trigger('click');
}

/**
 * ajax-城市的商圈，行政区，车站标志物
 * @param {String} cityid 城市id
 * @param {Function} callback 解析城市数据的回调函数
 */
function getFilter(cityid, callback) {
    $.ajax({
        url: '/hotel/query/filterdata',
        type: 'post',
        data: {cityid: cityid},
        success: function (data) {
            // console.log(data);

            if (data.status != 200) {
                layer.msg(data.msg + ' | ' + data.status);
                console.error(data);
                return ;
            }

            if (data.data == null) {
                console.log('data.data为undefined');
                return ;
            }

            var _data = JSON.parse(data.data);
            // console.log(_data);

            typeof callback == 'function' && callback(_data);

        },
        error: function (xhr, errorType, error) {
            console.error(xhr);
            console.error(errorType || error);
            layer.msg('获取筛选条件失败！ | ' + (errorType || error));
        }
    });
}

/**
 * 筛选数据解析
 * @param {Object} data
 */
function parseFilterData(data) {

    // for (var key in data) {
    // TODO:20171116-兼容ie
    $.each(data, function(key, val) {

        var html = '', _html = '', mapBrandsHtml = '';

        var flag = '';
        key == 'weizhi' && (flag = 'position');
        key == 'brands' && (flag = 'brands');
        key == 'aihao' && (flag = 'favourate');
        key == 'sheshifuwu' && (flag = 'facility');

        // 渲染-酒店类型||支付方式
        parsePayHotel (key, data);

        var isRadio = key == 'weizhi';

        html += '<ul class="clear f-p-tab-wraper">';
        _html += '<div class="f-p-c-w">';

        // 渲染品牌
        // flag == 'brands' && renderMapBrands(data[key]);
        flag == 'brands' && renderMapBrands(val);

        $.each(val, function (index, item) {
            // console.log(data[key]);

            // flag == 'brands' && console.log(item);

            html +=
                '<li class="float-left t-c-t" data-tab="' + item.type + '">' + item.typeName + '</li>';

            _html += '<div class="t-c-c clear" data-con="' + item.type + '">';

            $.each(item.positions, function (_index, _item) {
                    _html +=
                        '<div class="label label-' + (isRadio ? 'radio' : 'checkbox') + ' e-label" id="' + (isRadio ? 'position-' + _item.code : item.type + '-' + _item.code) + '">' +
                            '<span class="show_choice"></span>' +
                            '<input type="' + (isRadio ? 'radio' : 'checkbox') + '" name="' + (isRadio ? 'position' : item.type) + '" value="' + (isRadio ? _item.name : _item.code) + '" />' +
                            '<span class="hoverTips hover_content">' + _item.name + '</span>' +
                        '</div>';
            });
            _html += '</div>';
        });
        html += '</ul>';
        _html += '</div>';

        $('#' + flag).html(html + _html);
    // }
    });
}

/**
 * update-大地图页面-品牌数据渲染
 * @param {Array} data 品牌数据
 */
function renderMapBrands(data) {

    var html = '<span class="hotel-bg brands-close"></span>';
    $.each(data, function(index, item) {
       // console.log(item);
       html +=
           '<li>' +
               '<div class="title">' + item.typeName + '</div>' +
               '<div class="clear">';

               $.each(item.positions, function (_index, _item) {
                   // console.log(_item);
                   html +=
                       '<div class="label label-checkbox" id="map-' + item.type + '-' + _item.code +'">' +
                           '<span class="show_choice"></span>' +
                           '<span class="hoverTips hover_content">' + _item.name + '</span>' +
                           '<input type="checkbox" name="' + item.type + '" value="' + _item.code + '" />' +
                       '</div>';
               });
       html +=
               '</div>' +
           '</li>';

    });

    // console.log(html);
    $('.map-brands').html(html);
}

/**
 * update-酒店筛选条件-酒店类型||支付方式-数据解析
 * @param {String} key 偏好的标识
 * @param {Object} data 筛选的原始数据
 */
function parsePayHotel(key, data) {
    if (key == 'aihao') {
        var paytypeArr = data.aihao[1].positions;
        var hoteltypeArr = data.aihao[2].positions;

        var html = '';
        $.each(hoteltypeArr, function (index, item) {
            html +=
                '<div class="label label-checkbox float-left f-t-z">' +
				    '<span class="show_choice"></span>' +
                    '<input type="checkbox" name="hoteltype" value="' + item.code + '" class="hotel-type"  />' +
                    '<span>' + item.name + '</span>' +
                '</div>';
        });
        $('.hotel-type-wraper').html(html);

        var _html =
            '<select name="paytype" data-value="" class="_select_ pay-type" >' +
                '<option value="">不限</option>';

        $.each(paytypeArr, function (index, item) {
            _html +=
                '<option value="' + item.code + '">' + item.name + '</option>';
        });

        _html +=
            '</select>';

        $('.pay-type-wraper').each(function() {
            var $this = $(this);
            $this.html(_html);
            (new SelectMain()).creatSelect($this.find('._select_'));
        });
    }
}

// 容器计算
function autoHeight($dom, offVal){
    var _height = $(window).height();
    var _top = $dom.offset().top;
    $dom.css("height", (_height - _top - offVal) + "px");
}

function goMapAutoHeight() {
    autoHeight($('#big-map-container'), 0);
    autoHeight($('.map-list-container'), 40);
}
goMapAutoHeight ();



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

