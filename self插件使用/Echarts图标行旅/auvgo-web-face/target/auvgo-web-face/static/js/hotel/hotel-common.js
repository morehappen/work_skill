
/**
 * ajax-酒店差旅政策
 * @param {String} level 乘客职级，形如'2-1-3-'
 * @param {String} cityid 当前城市id
 *
 * @return {Object} policy 酒店差旅政策
 */
function getHotelPolicy(level, cityid) {
//	console.log(level);

    var policy = null;

    if (level == '') {
        layer.msg('获取员工职级失败！');
        return ;
    }

    $.ajax({
        url: '/hotel/query/policy',
        type: 'post',
        async: false,
        data: {level: level, cityid: cityid},
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
            layer.msg('获取酒店差旅政策失败！' + (errorType || error));
            return ;
        }
    });

    if (policy == null) return ;

    return policy;
}


/**
 * 匹配差旅政策
 * @param {Object} policy 差旅政策
 * @param {String} currCityPrice 车次类型-标识:C|G|D|T|Z...
 *
 * @return {Object} result
 */
function matchHotelPolicy (policy, currCityPrice) {
    // console.log(policy);

    /**
     * policy
     *
     * "{
     *      "price":"200",
     *      "policy":{
     *              "id":162,
     *              "companyid":61,
     *              "startlevel":1,
     *              "endlevel":1,
     *              "jdcitylevelid":"772/448/449/450/653/",
     *              "citylevelname":"其他城市/一线城市/二线城市/三线城市/特殊城市/",
     *              "price":"150/250/200/150/100/",
     *              "controllertype":"1/1/1/1/1/"
     *       },
     *       "controller":"1",
     *       "cityname":"二线城市"
     * }"
     *
     */

    var result = {
        flag: 0,                        // 是否超标- 0:不超标 1:超标
        controller: policy.controller,  // 超标- ctr 0:禁止预订  1:只作提醒
        cityName: policy.cityname,      // 城市名称- 一线城市、二线城市||北京市、河北省
        price: policy.price             // 差旅规则- 相应城市酒店差旅标准价格
    };

    // todo:20171127-wjx-差旅政策匹配兼顾临界值
	!(policy == 201 || policy == 202 || policy.price == -1 || policy.price >= currCityPrice) && (result.flag = 1);

    return result;
}

/**
 * ajax-酒店关键字-搜索
 * @param {String} cityid 城市id
 * @param {String} keyword 关键字
 * @param {Query} $target $dom
 */
function getSearchList (cityid, $this, $target) {

    var keyword = $this.val();

    if (keyword.length == 0) {
        $target.slideUp();
        return ;
    }

    var top = $this.offset().top + $this.outerHeight();

    $.ajax({
        url: '/hotel/query/keyword',
        type: 'post',
        data: {cityId: cityid, keyWord: keyword},
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

            parseSearchList(_data, $target, top);

        },
        error: function (xhr, errorType, error) {
            console.error(xhr);
            console.error(errorType || error);
            layer.msg('关键字模糊搜索失败！ | ' + (errorType || error));
        }
    });
}
/**
 * 关键字数据解析
 * @param data
 * @param $target
 */
function parseSearchList (data, $target, top) {
    // console.log(data);

    var html = '';

    $.each(data, function (index, item) {
        html += '<li class="e-search-l text-ellipsis" title="' + item.cityNameCn + '">' + item.cityNameCn + '</li>';
    });

    $target.html(html).css({'top': top});

    html == '' ? $target.slideUp() : $target.slideDown();

}