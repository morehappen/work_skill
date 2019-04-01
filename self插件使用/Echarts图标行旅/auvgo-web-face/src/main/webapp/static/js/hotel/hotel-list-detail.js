// action-点击-房型列表-head
$('body').on('click', '.e-room-t-head', function () {
    var $this = $(this);

    var $eRoomT = $this.closest('.e-room-t');

    var $eRoomTB = $eRoomT.find('.e-room-t-b');

    $eRoomTB.stop().slideToggle();
});

// action-点击-酒店图片tab切换
$('body').on('click', '.e-tab', function () {
    var activeStr = 'active';
    var $this = $(this);

    if ($this.hasClass(activeStr)) {
        return ;
    }

    $this.siblings().removeClass(activeStr);
    $this.addClass(activeStr);

    var $sMWraper = $('.slider-small-wraper')
    var tab = $this.attr('data-tab');
    var $aCon = $sMWraper.find('[data-con="' + tab + '"]');
    $aCon.addClass(activeStr).siblings().removeClass(activeStr);

    var src = $aCon.find('.' + activeStr + ' img').attr('src');
    // $('.slider-big').find('img').attr('src', src);
    $('.slider-big').css('background-image', 'url(' + src + ')');
});

// action-点击-酒店小图片
$('body').on('click', '.e-img', function () {
    var $this = $(this);
    var activeStr = 'active';

    if ($this.hasClass('activeStr')) return ;

    $this.addClass(activeStr).siblings().removeClass(activeStr);

    var src = $this.find('img').attr('src');
    // $('.slider-big').find('img').attr('src', src);
    $('.slider-big').css('background-image', 'url(' + src + ')');
});

// action-点击-左右箭头
$('body').on('click','.slider-arrow',function() {
    var $this = $(this);

    var isLeftArrow = $this.hasClass('left-arrow');
    var isRightArrow = $this.hasClass('right-arrow');

    var MOVEDISTANCE = 875;
    var IMGOCCUO = 125;

    var $eSlideCon = $this.closest('.slider-small').find('.e-slider-con.active');
    // console.log(currCount);
    var currLeft = parseInt($eSlideCon.css('left')) || 0;
    // console.log(currLeft);

    // 左侧按钮防止左侧溢出
    if (isLeftArrow && currLeft == 0) return ;

    // 右侧按钮防止右侧溢出
    if (isRightArrow && $eSlideCon.attr('data-ishavenext') == 'false') return ;

    var affterLeft = isLeftArrow ? (currLeft + MOVEDISTANCE) : (currLeft - MOVEDISTANCE);

    $eSlideCon.css('left', affterLeft);

    var currActiveIndex = Math.abs(Math.floor(affterLeft/IMGOCCUO));
    var $currActive = $eSlideCon.find('.e-img').eq(currActiveIndex);
    $currActive.addClass('active').trigger('click').siblings().removeClass('active');

    var isHaveNext = ($currActive.nextAll().length > 7);
    $eSlideCon.attr('data-ishavenext', isHaveNext);

});


// action-点击-查看更多酒店介绍
$('.intro-more').on('click', function () {
    var $this = $(this);

    var $introCon = $('.intro-con');
    $introCon.toggleClass('overflow-hidden');

    var text = $introCon.hasClass('overflow-hidden') ? '更多»' : '«收起';

    $this.text(text);
});

// action-经过-鼠标经过取消规则
$('body').on('mouseenter', '.cancel-title', function () {
    $(this).next().stop().slideDown();
});
// action-离开-鼠标离开取消规则
$('body').on('mouseleave', '.cancel-title', function () {
    $(this).next().stop().slideUp();
});

// action-点击-确定
$('body').on('click', '#query-room', function () {
    getRoomTypeList();
});


// action-点击-预订
$('body').on('click', '.now-book', function () {
    var $this = $(this);

    var isConPolicy = $this.attr('data-conpolicy') == 'true';
    var ctrl = $this.attr('data-ctrl');
    var cityname = $this.attr('data-cityname');
    var price = $this.attr('data-price');

    // 不超标
    if (!isConPolicy) {
        validator($this);
    }

    // 超标
    else {
        var tipStr = '您已经超出：' + cityname + '预订酒店不得高于' + price + '元/间夜的差旅标准！';

        // 只做提醒
        if (ctrl) {
            new Confirm({
                text: tipStr + '是否继续预订酒店？',
                arr: ['继续', '取消'],
                confirmCallback: function () {
                    validator($this);
                }
            });
        }
        // 禁止预订
        else {
            new Confirm({
                text: tipStr + '禁止预订！',
                arr: ['知道了', '取消']
            });
        }
    }
});

// 入住||离店时间计算
function countInterval () {
    var arrivalDate = $('#beginDate').val();
    var departureDate = $('#endDate').val();
    var oneDay = 1 * 24 * 60 * 60  * 1000;
    var interval = (defineNewDate(departureDate) - defineNewDate(arrivalDate))/oneDay;
    $('#interval').text(interval);
}

/**
 * new Date(param) 方法ie7/8 bug修复
 * @param {String} str 日期字符串
 * @return {Date}
 */
function defineNewDate(str) {
    var _dateStr = str.split('-');
    var formatDate = _dateStr[1] + '/' + _dateStr[2] + '/' + _dateStr[0];
    return new Date(formatDate);
}


// 酒店差旅政策结果
var hotelPolicy = getHotelPolicy($('.loginZhiji').val(), $('#city-id').attr('data-cityid'));
console.log($('.loginZhiji').val(), $('#city-id').attr('data-cityid'))
// console.log(hotelPolicy);

/**
 * ajax-酒店房型列表数据
 * @param {Function} callback 解析房型列表数据函数
 */
getRoomTypeList();
function getRoomTypeList () {
    loadingCommon();

    $('.room-type-list').html('');
    console.log($('.room-type-list'))
    var defaultData = {
        arrivalDate: $('#beginDate').val(),
        departureDate: $('#endDate').val(),
        hotelId: $('#hotel-id').attr('data-hotelid'),
        paymentType: $('#pay-type').val()
    };

    var interval = (new Date(defaultData.departureDate) - new Date(defaultData.arrivalDate))/(1*24*60*60*1000);
    console.log(interval)
    if (interval > 19) {
        loadingCommon();
        hotelOver20DaysTips();
        return false;
    }

    $.ajax({
        url: '/hotel/query/gethoteldetailajax',
        type: 'post',
        async: false,
        data: defaultData,
        success: function(data){
            loadingCommon();
            // console.log(data);
            if (data.status != 200) {
                layer.msg(data.msg + ' | ' + data.status);
                console.error(data);
                return ;
            }

            var _data = JSON.parse(data.data);
            // console.log(_data);

            parseRoomTypeList(_data, defaultData);
        },
        error: function(xhr, errorType, error){
            loadingCommon();
            console.error(xhr);
            console.error(errorType || error);
            layer.msg('获取酒店差旅政策失败！' + (errorType || error));
        }
    });
}
/**
 * update-房型列表数据解析
 * @param {Array} data 房型列表数据
 * @param {Objec} defautlParam 获取酒店房型列表数据参数-酒店id||入住||离店日期||支付方式
 */
// parseRoomTypeList(new Array(5));
function parseRoomTypeList (data, defautlParam) {

    // console.log(data);
    // console.log(defautlParam);

    var html = '';
    // console.log(hotelPolicy);

    /**
     * hotelPolicy 酒店差旅政策
     * "{
     *      "price":"10",
     *      "policy":{
     *          "id":162,
     *          "companyid":61,
     *          "startlevel":1,
     *          "endlevel":1,
     *          "jdcitylevelid":"772/448/449/450/653/",
     *          "citylevelname":"其他城市/一线城市/二线城市/三线城市/特殊城市/",
     *          "price":"10/10/10/10/10/",
     *          "controllertype":"1/1/1/1/1/"
     *       },
     *      "controller":"1",
     *      "cityname":"一线城市"
     *  }"
     */

    $.each(data.roomList, function (index, item) {
        console.log(item);
        var listPolicyResult = matchHotelPolicy(hotelPolicy, item.lowRate);
        // console.log(listPolicyResult);

        html +=
            '<div class="e-room-t clear">' +
                '<div class="e-room-t-head clear">' +
                    '<div class="e-room-t-h-l w-640 clear">' +
                        '<div class="e-room-img float-left">' +
                            '<img src="' + item.imageUrl + '">' +
                        '</div>' +
                        '<div class="e-room-desc float-left">' +
                            '<div class="e-room-title margin-bottom-10">' +
                                '<span class="font-size-16">' + item.name + '</span>' +
                                (item.type == 'sign' ? '<span class="xieyi-flag">协议</span>' : '') +
                            '</div>' +
                            '<div class="e-room-f clear font-size-12 clear">' +

                                ( /无窗/.test(item.name) ?
                                '<div class="e-room-f-wraper">' +
                                    '<span class="e-f-bg icon-img e-f-01"></span>' +
                                    '<span class="e-f-text">有窗</span>' +
                                '</div>' : '' ) +

                                ( item.floor ?
                                '<div class="e-room-f-wraper">' +
                                    '<span class="e-f-bg icon-img e-f-02"></span>' +
                                    '<span class="e-f-text">' + item.floor + '层</span>' +
                                '</div>' : '' ) +

                                ( item.area ?
                                '<div class="e-room-f-wraper">' +
                                    '<span class="e-f-bg icon-img e-f-03"></span>' +
                                    '<span class="e-f-text">' + item.area + '平米</span>' +
                                '</div>' : '' ) +

                                ( item.bedType ?
                                '<div class="e-room-f-wraper">' +
                                    '<span class="e-f-bg icon-img e-f-04"></span>' +
                                    '<span class="e-f-text">' + item.bedType + '</span>' +
                                '</div>' : '' ) +

                                ( item.capacity ?
                                '<div class="e-room-f-wraper">' +
                                    '<span class="e-f-bg icon-img e-f-05"></span>' +
                                    '<span class="e-f-text">可住' + item.capacity + '人</span>' +
                                '</div>' : '' ) +

                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="e-room-t-h-r w-150 clear low-price-wraper clear">' +
                        (listPolicyResult.flag == 1 ? '<span class="exceed-flag animated rotateIn float-left">超标</span>' : '') +
                        '<div class="color-purple float-right">' +
                            '￥<span class="font-600 font-size-16">' + item.lowRate + '</span><span class="color-999 font-size-12">起</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="e-room-t-b clear font-size-12">' +
                    '<div class="e-r-title-wraper h-53 clear color-999">' +
                        '<div class="float-left w-190">产品名称</div>' +
                        '<div class="float-left w-113">早餐</div>' +
                        '<div class="float-left w-134">退订政策</div>' +
                        '<div class="float-left w-76">付款方式</div>' +
                    '</div>' +
                    '<div class="e-r-con-wraper">';

                    $.each(item.ratePlanList, function (_index, _item) {
                        // console.log(_item);

                        var isConPolicy = !(hotelPolicy.price == -1 || hotelPolicy.price > _item.averageRate);
						var roomPolicyResult = matchHotelPolicy(hotelPolicy, _item.averageRate);
						// console.log(roomPolicyResult);

                        html +=
                        '<div class="e-con-w h-53">' +
                            '<div class="float-left hoverTips hover_content w-190">' + _item.ratePlanName + '</div>' +
                            '<div class="float-left w-113">' + (/不含早/.test(_item.ratePlanName) ? '无' : '有') + '</div>' +
                            '<div class="float-left w-134 cancel-rules">' +
                                '<span class="cancel-title">' + (_item.cancelRule ? _item.cancelRule : '--') + '</span>' +
                                '<div class="cancel-desc">' + (_item.prepayRuleDesc[0] || _item.guaranteeRuleDesc[0] || '--') + '</div>' +
                            '</div>' +
                            '<div class="float-left w-76">'+ (_item.paymenTypeDesc + (_item.gurantee ? '<span class="color-purple">(担保)</span>' : '')) + '</div>' +
                            '<div class="float-left w-58 t-con-s-flag-w">' +
                                // ( isConPolicy ? '<span class="t-con-s-flag hotel-bg animated rotateIn"></span>' : ''  ) +
                                ( roomPolicyResult.flag == 1 ? '<span class="exceed-flag animated rotateIn">超标</span>' : ''  ) +
                            '</div>' +
                            '<div class="float-left w-127 color-purple">' +
                                _item.currencyFlag + '<span class="font-size-14 font-600">' + _item.averageRate + '</span>' +
                            '</div>' +
                            '<div class="float-left w-100 position">' +
                                '<button type="button" class="btn btn-default btn-big now-book" ' +
                                    'data-hotelid="' + defautlParam.hotelId + '"' +
                                    'data-roomid="' + item.roomId + '"' +
                                    'data-arrivaldate="' + defautlParam.arrivalDate + '"' +
                                    'data-departuredate="' + defautlParam.departureDate + '"' +

                                    'data-conpolicy="' + (roomPolicyResult.flag == 1) + '"' +
                                    'data-ctrl="' + roomPolicyResult.controller + '"' +
                                    'data-cityname="' + roomPolicyResult.cityName + '"' +
                                    'data-price="' + roomPolicyResult.price + '"' +

                                    'data-totalprice="' + _item.totalRate + '"' +
                                    'data-rateplanid="' + _item.ratePlanId + '"' +
                                    'data-roomtypeid="' + _item.roomTypeId + '"' +
                                    '>预订</button>' +
                                '<span class="border-radius position-ab room-count">' + (_item.currentAlloment > 0 && _item.currentAlloment < 5 ? '余' + _item.currentAlloment : '充足') +'</span>' +
                            '</div>' +
                        '</div>';
                    });

            html +=
                '</div>' +
            '</div>' +
        '</div>';
    });

    $('.room-type-list').html(html);

}


/**
 * ajax-预订酒店前的实时校验
 * @param {$dom} $nowBook 预订按钮
 */
function validator ($nowBook) {

    /**
     * {
     *      arrivalDate:"",
     *      departureDate:"",
     *      hotelId:"",
     *      roomTypeId:"",
     *      ratePlanId:"",
     *      totalPrice:""
     *  }
     */

    var defaultdata = {
        arrivalDate: $nowBook.attr('data-arrivaldate'),
        departureDate: $nowBook.attr('data-departuredate'),
        hotelId: $nowBook.attr('data-hotelid'),
        roomTypeId: $nowBook.attr('data-roomtypeid'),//0003
        ratePlanId: $nowBook.attr('data-rateplanid'),//8702903
        totalPrice: $nowBook.attr('data-totalprice')//288
    };
	// console.log(defaultdata);

    $.ajax({
        url: "/hotel/query/validator",
        type: "post",
        data: defaultdata,//
        success: function(data){
			console.log(data);

            if(data.status != 200){
                layer.msg(data.msg + ' | ' + data.status);
                console.error(data);
                return ;
            }

            location.href = '/hotel/book/' + defaultdata.hotelId + '/'+ defaultdata.arrivalDate + '/'+ defaultdata.departureDate + '/'+ $nowBook.attr('data-roomid') + '/' + defaultdata.roomTypeId + '/' + defaultdata.ratePlanId;
        },
        error:function(xhr, errorType, error){
            console.error(xhr);
            console.error(errorType || error);
            layer.msg('预订失败！ | ' + (errorType || error));
        }
    });
}




// 引入百度地图
var map = new BMap.Map('map-container');          // 创建地图实例
map.addControl(new BMap.NavigationControl());
map.addControl(new BMap.ScaleControl());
map.addControl(new BMap.OverviewMapControl());
// map.addControl(new BMap.MapTypeControl()); 	        // 地图||卫星||三维
map.enableScrollWheelZoom();					    // 启用鼠标滚轮
var $mapContainer = $('#map-container');
var point = new BMap.Point($mapContainer.attr('data-longtitude'), $mapContainer.attr('data-latitude'));        // 创建点坐标

var markerOpts = {
    icon: new BMap.Icon('/static/img/common/baidu-location.png', new BMap.Size(32, 32), {}),
    title: $('#hotel-id').text()
};
var marker = new BMap.Marker(point, markerOpts);
map.addOverlay(marker);
marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画

map.centerAndZoom(point, 15);                        // 初始化地图，设置中心点坐标和地图级别