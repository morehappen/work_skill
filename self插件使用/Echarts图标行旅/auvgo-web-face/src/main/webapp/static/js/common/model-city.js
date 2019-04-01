/**
 * Created by wangxinjun on 2017/07/18.
 * this is a bug! ^_^
      _
     | |__  _   _  ___
     |  _ \| | | |/ _  |
     | |_) | |_| | (_| |
     |_ __/ \__ _|\__, |
                  |___/
 
  _
 | |_ _
 */

/**
 * 页面依赖
 * @param class show-city 显示城市列表触发器
 * @param class city-name 选中城市时-展示城市名称
 * @param class city-code 选中城市时-存放城市三字码
 *
 */
//<input type="text" class="show-city city-name" />
//<input type="hidden" class="city-code" />
// 经过整合后的数据-热门||A||B||C...
var hotData = null;//热门城市
var orignData = null;//普通城市分类排序完成

var searchData = null;//搜索的城市数据-最原始的普通城市数据

/**
 * 页面增加城市列表框-初始化
 */
function cityModal() {
    var html = '';

    html +=
        '<div class="city-plugin-model">' +
            '<div class="c-p-title">热门城市（可直接输入城市或城市拼音）</div>' +
            '<div class="c-p-content">' +
                '<div class="c-p-tab">' +
                    '<ul class="tab-ul-wraper clear"></ul>' +
                '</div>' +
                '<div class="c-p-t-content"></div>' +
                '<div class="page clear hide" data-pagenum="1">' +
                    '<span class="page-btn page-disabled" data-page="0">« 上一页 </span>' +
                    '<span class="page-btn" data-page="1">下一页 »</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    $('body').append(html);
}


/**
 * ajax-获取城市数据
 * @param {String} flag {"type":"train/hotel/domair/interair"}
 */
var BUSINESSLINECITYFLAG = '';//业务线城市标识
function getCitys(flag) {
    $(document).find('.city-plugin-model').remove();
    $(document).find('.city-search-model').remove();
	BUSINESSLINECITYFLAG = flag;

//	console.log(flag);

    cityModal();
    searchModal();
    if(flag != "hotel"){
	    $.ajax({
	        url: '/city',
	        type: 'post',
	        data: {type: flag},
	        success: function(data){
	    		if (data.status != 200) {
	                layer.msg(data.msg + '(' + data.status + ')');
	                return ;
	            }
	
	            if (data.data == null) {
	                layer.msg('获取城市数据失败！');
	                return ;
	            }
	
	            var _data = JSON.parse(data.data);
	//    			console.log(_data);
	
	            // 热门城市
	            var hotCity = {hot: _data.hotcity};
	
	            hotData = hotCity;
	
	            updateHotCitys(hotCity);
	
	
	            // 普通城市
	            var allCity = _data.allcity;
	
	            searchData = allCity;//搜索城市-原始数据
	
	            var newData = classifyData(allCity);
	
	            orignData = newData;
	
	            $.each(newData, function (k, v) {
	                updateCommonCitys(k, v);
	            });
	        },
	        error: function(xhr, errorType, error){
	            console.error(xhr);
	            console.error(errorType || error);
	            layer.msg('获取城市数据失败！' + (errorType || error));
	        }
	    });
    }
}


/**
 * 普通城市-数据排序分类
 * @param {Object} allCity 城市数据
 *
 * @return {Object} 排序分类完成的城市数据
 */
function classifyData(allCity) {

    if (allCity && allCity.length == 0) return ;

    var newData = {
        'A': [],
        'B': [],
        'C': [],
        'D': [],
        'E': [],
        'F': [],
        'G': [],
        'H': [],
        'J': [],
        'K': [],
        'L': [],
        'M': [],
        'N': [],
        'P': [],
        'Q': [],
        'R': [],
        'S': [],
        'T': [],
        'W': [],
        'X': [],
        'Y': [],
        'Z': []
        //,'oth': []
    };

    // 数据分组
    $.each(allCity, function(index, item) {
        //console.log(item);
        switch (item.h) {
            case 'A': newData.A.push(item); break;
            case 'B': newData.B.push(item); break;
            case 'C': newData.C.push(item); break;
            case 'D': newData.D.push(item); break;
            case 'E': newData.E.push(item); break;
            case 'F': newData.F.push(item); break;
            case 'G': newData.G.push(item); break;

            case 'H': newData.H.push(item); break;
            case 'J': newData.J.push(item); break;
            case 'K': newData.K.push(item); break;
            case 'L': newData.L.push(item); break;
            case 'M': newData.M.push(item); break;
            case 'N': newData.N.push(item); break;

            case 'P': newData.P.push(item); break;
            case 'Q': newData.Q.push(item); break;

            case 'R': newData.R.push(item); break;
            case 'S': newData.S.push(item); break;
            case 'T': newData.T.push(item); break;

            case 'W': newData.W.push(item); break;
            case 'X': newData.X.push(item); break;
            case 'Y': newData.Y.push(item); break;

            case 'Z': newData.Z.push(item); break;

            default: /*newData.oth.push(item);*/ break;
        }
    });
    // console.log(newData);

    // 数据排序
    // for (_item in newData) {
    $.each(newData, function (k, v) {
        // console.log(k);
		// console.log(v);

//		if (_item == 'hot') continue;

        v.sort(compare('fullp'));

        // newData[_item] = newData[_item].sort(compare('fullp'));
        // }
    });
    // console.log(newData);


    // 数据整合
    var _newData = {
        ABC: {A: newData.A, B: newData.B, C: newData.C},
        DEF: {D: newData.D, E: newData.E, F: newData.F},
        GHJ: {G: newData.G, H: newData.H, J: newData.J},
        KLM: {K: newData.K, L: newData.L, M: newData.M},
        NPQ: {N: newData.N, P: newData.P, Q: newData.Q},
        RST: {R: newData.R, S: newData.S, T: newData.T},
        WXY: {W: newData.W, X: newData.X, Y: newData.Y},
        Z:   {Z: newData.Z/*, oth: newData.oth*/}
    };
    //console.log(_newData);

    return _newData;
}


/**
 * 排序工具-默认升序
 * @param {String} property 排序时参考的字段属性
 */
function compare(property){

    return function(a, b){

        var value1 = a[property];
        var value2 = b[property];

        if (value1 < value2) {
            return -1;
        }

        else if (value1 > value2) {
            return 1;
        }

        else {
            return 0;
        }
    };
}


/**
 * 热门-城市数据渲染
 * @param {Object} data 热门城市数据
 * @param {Object} currConfig 当前渲染的配置：0-默认渲染||1-点击触发渲染
 */
function updateHotCitys(data, currConfig) {
//	console.log(data);

    var defaultConfig = {
        isAction: 0//是否第一次渲染，0-第一次||1-非第一次/点击触发
    };

    var config = $.extend({}, defaultConfig, currConfig);
//	console.log(config);

    if (data && data.length == 0) return ;

    var tabHtml = '', tConHtml = '';

    // for (item in data) {
    $.each(data, function (k, v) {

        tabHtml += '<li class="every-tab tab-active" data-flag="' + k + '">热门</li>';

        tConHtml += '<ul class="every-content clear content-active" data-flag="' + k + '">';

//		console.log(data[item]);
        $.each(v, function(index, _item) {
            tConHtml += '<li class="every-city" title="' + _item.name + '" data-name="' + _item.name + '" data-code="' + (BUSINESSLINECITYFLAG == 'train' ? _item.fullp : _item.code) + '">' + _item.name + '</li>';
        });

        tConHtml += '</ul>';
        // }
    });

//	console.log(tabHtml);

    if (!config.isAction) {
        $(document).find('.tab-ul-wraper').html(tabHtml);
    }

    $(document).find('.c-p-t-content').html(tConHtml);

}


/**
 * 普通-城市数据渲染
 * @param {String} flag 数据整合后的key值 如'ABC','DEF'等
 * @param {Object} data 具体的数据，如 {A:[],B:[],C:[]}
 */
function updateCommonCitys(flag, data, currConfig) {
//	console.log(flag);
//	console.log(data);

	/**
	 * 默认的显示-配置
	 * @param {Number} pageNum 当前第几页-默认：1
	 * @param {Number} pageSize 每页显示条数-默认：15
	 * @param {Boolean} isAction 每页显示条数-默认：15
	 */
    var defaultConfig = {
        pageNum: 1,
        pageSize: 15,

        isAction: 0//是否第一次渲染，0-第一次||1-非第一次/点击触发
    };

    var config = $.extend({}, defaultConfig, currConfig);
//	console.log(config);


    // 初始化- tab的html tabContent的html
    var tabHtml = '', tConHtml = '';

    tabHtml += '<li class="every-tab" data-flag="' + flag + '">' + flag + '</li>';

    // 点击时触发渲染-tabContent
    if (config.isAction) {
        tConHtml +=
            '<div class="every-content content-active" data-flag="' + flag + '">';

        // 记录当前 如：{A:[],B:[],C:[]}数据ABC数量
        var count = 0;

        // 记录每个如ABC是否还有下一页
        // 用于判断 下一页 按钮 的状态
        var eHNpage = {};

        // for (item in data) {
        $.each(data, function (k, v) {

            count ++;

            tConHtml +=
                '<div class="c-e-cell clear">' +
                    '<div class="c-e-title">' + k + '</div>' +
                        '<ul class="c-e-ul clear">';

            //.every-city的数量
            var _count = 0;

            $.each(v, function(index, curr) {

                _count = index;

                // 渲染当前数据的第一个				// 当前数据				// 渲染当前数据的最后一个+1
                if (((config.pageNum - 1) * config.pageSize) <= index && index < (config.pageNum * config.pageSize)) {
                    tConHtml +=
                            '<li class="every-city" title="' + curr.name + '" data-name="' + curr.name + '" data-code="' + (BUSINESSLINECITYFLAG == 'train' ? curr.fullp : curr.code) + '">' + curr.name + '</li>';
                }
            });

            // 是否还有下一页
            var hasNextPage = _count >= config.pageNum * config.pageSize;
            //console.log(hasNextPage);
            eHNpage['e' + count] = hasNextPage;

            tConHtml +=
                        '</ul>' +
                    '</div>';
            // }
        });

//		console.log(eHNpage);

        tConHtml +=
                '</div>';

        //console.log(eHNpage);

        // 下一页 按钮-状态
        var $pageBtnLast = $(document).find('.page .page-btn:last-child');

        // 按钮状态-只要模块内有一个有下一页就可以点击跳转
        var status = false;
        for (var ePage in eHNpage) {
            if (eHNpage[ePage]) {
                status = true;
                break;
            }
        }
//		console.log(status);

        !status ? $pageBtnLast.addClass('page-disabled') : $pageBtnLast.removeClass('page-disabled');
    }

    // tab-初始化
    if (!config.isAction) {
        $(document).find('.tab-ul-wraper').append(tabHtml);
    }

    // tab-点击-渲染dom
    else {
        $(document).find('.c-p-t-content').html(tConHtml);
    }

}


// action-点击-tab
$('body').on('click', '.every-tab', function() {

    var $this = $(this);

    $this.closest('body').addClass('no-hide');

    var flag = $this.attr('data-flag');

    $this.addClass('tab-active').siblings().removeClass('tab-active');

    var $tar = $('.c-p-t-content').find('.every-content[data-flag="' + $this.attr('data-flag') + '"]');

    $tar.addClass('content-active').siblings().removeClass('content-active');

    var $page = $(document).find('.page');

    $page.attr('data-pagenum', 1);
    $page.find('.page-btn:first-child').addClass('page-disabled');

    // 点击-非热门
    if (flag != 'hot') {
        $page.show();

        updateCommonCitys(flag, orignData[flag], {isAction: 1});
    }

    // 点击-热门
    else {
        $page.hide();

        updateHotCitys(hotData, {isAction: 1});
    }

});


// action-城市弹窗-点击-分页按钮
$('body').on('click', '.page .page-btn', function() {
    var $this = $(this);

    // 判断按钮状态
    if ($this.is('.page-disabled')) return ;

    var $page = $this.closest('.page');

    var pageNum = parseInt($page.attr('data-pagenum'));

//	console.log('pageNum before:' + pageNum);

    // 根据按钮 判断 pageNum 操作   --||++
    $this.attr('data-page') == 0 ? pageNum-- : pageNum ++ ;

    if (pageNum == 0) return ;

//	console.log('pageNum after:' + pageNum);
    $page.attr('data-pagenum', pageNum);


    $this.closest('body').addClass('no-hide');

    // 上一页按钮-状态
    var $pageBtnFirst = $(document).find('.page .page-btn:first-child');
    if (pageNum > 1) {
        $pageBtnFirst.removeClass('page-disabled');
    }
    else {
        $pageBtnFirst.addClass('page-disabled');
    }

    // 获取 flag 值
    var $contentActive = $('body').find('.content-active');
    var flag = $contentActive.attr('data-flag');

    updateCommonCitys(flag, orignData[flag], {pageNum: pageNum, isAction: 1});

    $(document).find('.c-e-ul:empty').closest('.c-e-cell').remove();

});


// action-点击-城市选中
$('body').on('click', '.every-city', function() {
    var $this = $(this);

    var $nowInput = $('body').find('.now-input');
    $nowInput.val($this.attr('data-name'));
    $nowInput.next('.city-code').val($this.attr('data-code'));

    $nowInput.removeClass('now-input');

    $('body').removeClass('no-hide').find('.city-plugin-model').slideUp(100);

});

// action-点击 input框-显示城市插件
$('body').on('click', '.show-city', function(){
    this.select();

    var $this = $(this);

    // 防止二次触发
    if ($this.is('.now-input')) {
        return ;
    }

    var $cityModal = $(document).find('.city-plugin-model');
    var $searchModal = $(document).find('.city-search-model');
    var $oldNowInput = $(document).find('.now-input');

    // 防止筛选展示时触发另外一个 input
    if (!$searchModal.is(':hidden')) {
        var $active = $searchModal.find('.ul-e-c.active');

        $oldNowInput.val($active.attr('data-name'));
        $oldNowInput.next('.city-code').val($active.attr('data-code'));

        $searchModal.hide();
    }

    var selfHeight = $this.outerHeight();

    var offset = $this.offset();

    $cityModal.css({top: (offset.top + selfHeight),left: offset.left}).slideDown();

    // 手动触发选中某个tab
    $(document).find('.every-tab[data-flag="hot"]').trigger('click');

    // 防止页面有多个 .now-input 元素
    if ($oldNowInput.length > 0) {
        $oldNowInput.removeClass('now-input');
    }

    $this.addClass('now-input');

});


/**
 * 搜索城市列表框
 */
function searchModal() {
    var html = '';

    html +=
        '<div class="city-search-model">' +
            '<div class="c-p-title"><span class="input-val"></span><span class="input-val-tips">，按拼音排序</span></div>' +
            '<div class="c-s-content">' +
                '<ul class="c-s-ul"></ul>' +
        
                '<div class="ul-page text-align clear" data-pagenum="1">' +
                    '<span class="page-btn page-disabled" data-page="0">« 上一页 </span>' +
                    '<span class="page-btn" data-page="1">下一页 »</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    $('body').append(html);
}


// action-输入 input框-显示城市插件
$('body').on('textchange', '.show-city', function(event){
    var $this = $(this);

    $(document).find('.city-plugin-model').hide();

    var selfHeight = $this.outerHeight();

    var offset = $this.offset();

    triggerSear({});

    $(document).find('.city-search-model').css({top: (offset.top + selfHeight),left: offset.left}).slideDown();

});


/**
 * 触发查询-筛选数据-更新dom
 * @param {Object} config 两个参数-pageNum||pageSize
 */
function triggerSear(config) {
    var $nowInput = $(document).find('.now-input');

    var kewword = $.trim($nowInput.val());
    $(document).find('.input-val').text(kewword);

    var newData = searchFilData(kewword);

    updateSearchData(newData, config);

}


/**
 * 根据输入框内容-筛选城市数据 并且按照拼音排序
 * @param {String} keyword 输入框内容
 *
 * @return {Object} 筛选整理后的数据
 */
function searchFilData(keyword) {
    keyword = '^' + keyword;

    // 筛选数据
    var filterData = $.grep(searchData, function(item, index) {
//		console.log(item);

        // 正则表达式
        var reg = new RegExp(keyword, 'i');

                // 汉字						简拼						全拼                  三字码
        if (reg.test(item.name) || reg.test(item.jianp) || reg.test(item.fullp) || reg.test(item.code)) {
            return true;
        }
        else {
            return false;
        }

    });
//	console.log(filterData);

    // 按照拼音排序
    var newData = filterData.sort(compare('fullp'));
//	console.log(newData);

    return newData;
}


/**
 * 城市查询数据-渲染
 * @param {Object} data 数据
 * @param {Object} currConfig 显示第pageNum页，每页显示pageSize个
 */
function updateSearchData(data, currConfig){
//	console.log(data);

	/**
	 * 默认显示配置
	 * 当前页为第1页  每页显示10个
	 */
    var defaultConfig = {
        pageNum: 1,
        pageSize: 10

        //isAction: 0//是否第一次渲染，0-第一次||1-非第一次/点击触发
    };

    var config = $.extend({}, defaultConfig, currConfig);


    var html = '';
    var count = 0;//计数器

    var $inputValTips = $(document).find('.input-val-tips');


    $.each(data, function(index, curr) {

        count = index;

        if (((config.pageNum - 1) * config.pageSize) <= index && index < (config.pageNum * config.pageSize)) {
            html +=
                '<li class="ul-e-c clear' + (((config.pageNum - 1) * config.pageSize) == index ? ' active': '') + '" title="' + curr.name + '" data-name="' + curr.name + '" data-code="' + (BUSINESSLINECITYFLAG == 'train' ? curr.fullp : curr.code) + '">' +
                    '<span class="e-c-n">' + curr.name + '</span>' +
                    '<span class="e-c-c">' + curr.code + '</span>' +
                '</li>';
        }

    });


    var hasNextPage = count >= (config.pageNum * config.pageSize);
//	console.log(hasNextPage);

    // 下一页 按钮-状态
    var $pageBtnLast = $(document).find('.ul-page .page-btn:last-child');
    hasNextPage ? $pageBtnLast.removeClass('page-disabled') : $pageBtnLast.addClass('page-disabled');

    if (data && data.length == 0) {

        $inputValTips.text('对不起，找不到！').closest('div').addClass('search-error-tips');
        $(document).find('.input-val').text('');
        return;
    }

    $inputValTips.text('，按拼音排序').closest('div').removeClass('search-error-tips');

    $(document).find('.c-s-ul').html(html);

}

// action-城市弹窗-点击-分页按钮
$('body').on('click', '.ul-page .page-btn', function() {
    var $this = $(this);

    // 判断按钮状态
    if ($this.is('.page-disabled')) return ;

    var $page = $this.closest('.ul-page');

    var pageNum = parseInt($page.attr('data-pagenum'));

//	console.log('pageNum before:' + pageNum);

    // 根据按钮 判断 pageNum 操作   --||++
    $this.attr('data-page') == 0 ? pageNum-- : pageNum ++ ;

    if (pageNum == 0) return ;

//	console.log('pageNum after:' + pageNum);
    $page.attr('data-pagenum', pageNum);

    $this.closest('body').addClass('no-hide');

    // 上一页按钮-状态
    var $pageBtnFirst = $(document).find('.ul-page .page-btn:first-child');
    pageNum > 1 ? $pageBtnFirst.removeClass('page-disabled') : $pageBtnFirst.addClass('page-disabled');

    triggerSear({pageNum: pageNum});
});


// action-搜索框 点击-城市选中
$('body').on('click', '.ul-e-c', function() {
    var $this = $(this);

    $this.addClass('active').siblings().removeClass('active');

    var $nowInput = $('body').find('.now-input');
    $nowInput.val($this.attr('data-name'));
    $nowInput.next('.city-code').val($this.attr('data-code'));

    $nowInput.removeClass('now-input');

    $('body').removeClass('no-hide').find('.city-search-model').slideUp(100);

});


// action-当前选框 .now-input 失去焦点时
$('body').on('blur', '.now-input', function(e) {
    var $this = $(this);

    var $cityModal = $(document).find('.city-plugin-model');
    var $searchModal = $(document).find('.city-search-model');

    setTimeout(function() {

        if ($this.closest('body').is('.no-hide')) {
            $this.trigger('focus');
            return false;
        }

        // 筛选框显示
        if (!$searchModal.is(':hidden')) {
            var $active = $searchModal.find('.ul-e-c.active');

            $this.val($active.attr('data-name'));
            $this.next('.city-code').val($active.attr('data-code'));
        }

        $this.removeClass('now-input');

        $cityModal.slideUp(100);
        $searchModal.slideUp(100);

    }, 300);

});


// action-点击-关闭
//$('body').on('click', '.colse-city-model', function() {
//	var $this = $(this);
//	$this.closest('body').removeClass('no-hide');
//});


/***
 * 隐藏城市插件
 */
function hideCityPluginModel(){

    var $cityModal = $(document).find('.city-plugin-model');
    var $searchModal = $(document).find('.city-search-model');

    if (!$searchModal.is(':hidden')) {
        var $active = $searchModal.find('.ul-e-c.active');

        var $nowInput = $(document).find('.now-input');

        $nowInput.val($active.attr('data-name'));
        $nowInput.next('.city-code').val($active.attr('data-code'));
    }

    $(document).find('.now-input').removeClass('now-input');
    $(document).find('body').removeClass('no-hide');

    $cityModal.hide();
    $searchModal.find('.city-search-model').hide();
}


// action-点击-非城市插件元素
$('body').on('click', function(event){
//	console.log(event);
    var target = event.target || event.srcElement;

    if ($(target).is('.show-city')) return ;

    var $plu = $(target).closest('.city-plugin-model');
    var $sear = $(target).closest('.city-search-model');

    // 点击位置判断
    if ($plu.length == 0 && $sear.length == 0) {
        hideCityPluginModel();
    }
});

//
// $("body").on("blur","input",function () {
//
// });