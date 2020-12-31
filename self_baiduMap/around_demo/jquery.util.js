/**
 * Created by sing on 2018/9/14.
 * zhangcheng
 */
;
(function($, window, document) {
    /**
     * 重写ajax方法
     */
    reWriteAjax();

    /**
     * 添加tip方法
     */
    addTipsAndPlaceHolder();

    /**
     * ie8兼容性问题：1、foreach 无法使用问题
     */
    if (!(Array.forEach || Array.prototype.forEach)) {
        Array.prototype.forEach = function(callback /*, thisArg*/ ) {
            var T, k;
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            if (arguments.length > 1) {
                T = arguments[1];
            }

            k = 0;

            while (k < len) {
                var kValue;

                if (k in O) {

                    kValue = O[k];

                    callback.call(T, kValue, k, O);
                }

                k++;
            }

        };
    }


    //解决低版本IE中使用console报错问题
    window.console = window.console || (function() {
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
        return c;
    })();

    /**
     * 判断是否为空
     * @param {any} str
     * @returns {Boolean}
     */
    $.isBlank = function(str) {
        return (str == null) ? true : ($.trim(str) === "");
    };



    /**
     * 身份证号验证
     * @param {String} str
     * @returns {Boolean}
     */
    $.checkCard = function(str) {

        var card, provice, birthDay, isCardReg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;

        if ((typeof str !== "string") || (str === "")) {
            return false;
        }
        if (str.indexOf('*') > -1) {
            if (str.length != 18) {
                return false;
            } else {
                return true;
            }
        }


        card = str.toUpperCase();
        if (!isCardReg.test(card)) {
            return false;
        }
        provice = $.getProvinceByCard(card), birthDay = $.getBirthday(card);
        if ($.isBlank(provice) || $.isBlank(birthDay) || !$.checkParity(card)) {
            return false;
        }
        return true;
    };

    /**
     * 根据身份证号获取所属省份
     * @param {String} idCard
     * @returns {String}
     */
    $.getProvinceByCard = function(idCard) {
        var chinaProvice = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外"
        };
        return chinaProvice[idCard.substr(0, 2)];
    };

    /**
     * 根据身份证号获取出生日期
     * @param {String} card
     * @returns {String}
     */
    $.getBirthday = function(card) {
        var len, re_fifteen, arr_data, year, month, day, birthday, re_eighteen;
        card = (card || "").toUpperCase();
        switch (card.length) {
            case 15:
                //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
                re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
                arr_data = card.match(re_fifteen);
                year = arr_data[2], month = arr_data[3], day = arr_data[4];
                birthday = new Date('19' + year + '/' + month + '/' + day);
                if ($.verifyBirthday('19' + year, month, day, birthday)) {
                    return year + "-" + month + "-" + day;
                }
                return null;
            case 18:
                re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;;
                arr_data = card.match(re_eighteen);
                year = arr_data[2], month = arr_data[3], day = arr_data[4];
                birthday = new Date(year + '/' + month + '/' + day);
                if ($.verifyBirthday(year, month, day, birthday)) {
                    return year + "-" + month + "-" + day;
                }
                return null;
            default:
                return null;
        }
    };

    /**
     * 校验出生日期
     * @param {String} year
     * @param {String} month
     * @param {String}day
     * @param {Date} birthday
     * @returns {boolean}
     */
    $.verifyBirthday = function(year, month, day, birthday) {
        var time, now = new Date(),
            now_year = now.getFullYear();
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            time = now_year - year;
            if (time >= 0 && time <= 100) {
                return true;
            }
            return false;
        }
        return false;
    };

    /**
     * 身份证校验位的检测
     * @param {String} card
     * @returns {Boolean}
     */
    $.checkParity = function(card) {
        var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
            arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
            cardTemp = 0,
            i, valnum, len;
        card = $.changeFivteenToEighteen(card);
        len = card.length;
        if (len === 18) {
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }
            valnum = arrCh[cardTemp % 11];
            if (valnum == card.substr(17, 1)) {
                return true;
            }
        }
        return false;
    };

    /**
     * 身份证号15位转18位
     * @param {String}card
     * @returns {String}
     */
    $.changeFivteenToEighteen = function(card) {
        var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
            arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
            cardTemp = 0,
            i;
        if (card.length === 15) {
            card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }
            card += arrCh[cardTemp % 11];
        }
        return card;
    };
    /**
     * 添加tips提示和placehoder效果
     */
    function addTipsAndPlaceHolder() {
        $(document).on("mouseenter", "[vetitle]", function(event) {
            var dom = this;
            var title = $(dom).attr("vetitle");
            if (title) {
                var index = layer.tips(title, $(dom), {
                    tips: [1, '#1ec1ae'],
                    time: 0
                });
                $(dom).on("mouseleave", function() {
                    layer.close(index);
                });
            }
        });
        //for IE8+ and webkit mis
        $(document).on("DOMNodeRemoved", function(event) {
            clearLayer($(event.target));
        });

        //清除
        function clearLayer($dom) {
            var layerIndex = $dom.attr("layerIndex");
            if (layerIndex) layer.close(layerIndex);

            var childs = $dom.find("*");
            for (var i = 0; i < childs.length; i++) {
                var $domItem = childs.eq(i);
                var layerIndex = $domItem && $domItem.attr("layerIndex");
                if (layerIndex) layer.close(layerIndex);
            }
        }
    }
    /**
     * 重写ajax
     */
    var winIndex = null;

    function reWriteAjax() {
        /**重写ajax*/
        $.ajaxProp = $.ajax;
        $.ajax = function(url, options) {
            if (typeof url === "object") {
                options = url;
                url = undefined;
            }

            //备份options中error和success方法
            var fn = {
                error: function(XMLHttpRequest, textStatus, errorThrown) {},
                success: function(data, textStatus) {}
            }
            if (options.error) {
                fn.error = options.error;
            }
            if (options.success) {
                fn.success = options.success;
            }
            var sfpccw = options.sfpccw || '1'; //1为需要抛错，0为不需要抛错
            //扩展增强处理
            var_opt = $.extend(options, {
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    var status = XMLHttpRequest.status;
                    var result = XMLHttpRequest.responseText;
                    if (result && sfpccw == '1') {
                        result = JSON.parse(result);
                        var status = encodeURIComponent(status);
                        var message = encodeURIComponent(result.message);
                        var tips = encodeURIComponent(result.tips);
                        var ERRORLAYER = new VeLayer();
                        if (!winIndex) {
                            winIndex = ERRORLAYER.open({
                                type: 2,
                                title: "异常信息",
                                content: "/error/page/500?status=" + status + "&message=" + message + "&tips=" + tips,
                                area: ["700px", "400px"],
                                end: function() {
                                    ERRORLAYER.close(winIndex);
                                    winIndex = null;
                                }
                            });
                        }
                    }

                    if (XMLHttpRequest.responseText && status == 500) {
                        var res = $.parseJSON(XMLHttpRequest.responseText);
                    }
                    //错误方法增强处理
                    fn.error(XMLHttpRequest, textStatus, errorThrown);
                },
                success: function(data, textStatus) {
                    //成功回调方法增强处理
                    fn.success(data, textStatus);
                },
                beforeSend: function(XHR) {
                    //提交前回调方法
                }
            });
            //
            if (options.dataType !== "script" && options.dataType !== "jsonp" /*&& options.dataType !== "html"*/ && options.cache !== true) {
                options.cache = false;
            } //如果不是请求script和jsonp时，都禁止使用缓存的结果

            return $.ajaxProp(url, options);
        }
    };


    /**
     * 重写load方法,在url上拼接notitle=1
     * @param url
     * @param params
     * @param callback
     * @returns {*}
     */
    jQuery.fn.load = function(url, params, callback) {
        if (typeof url !== "string" && _load) {
            return _load.apply(this, arguments);
        }

        var selector, response, type,
            self = this,
            off = url.indexOf(" ");

        if (off >= 0) {
            selector = url.slice(off, url.length);
            url = url.slice(0, off);
        }

        // If it's a function
        if (jQuery.isFunction(params)) {

            // We assume that it's the callback
            callback = params;
            params = undefined;

            // Otherwise, build a param string
        } else if (params && typeof params === "object") {
            type = "POST";
        }

        // If we have elements to modify, make the request
        if (self.length > 0) {
            if (url.indexOf("notitle=1") === -1) {
                if (url.indexOf("?") !== -1) url += "&notitle=1";
                else url += "?notitle=1";
            }

            if (url.indexOf("submitType") > -1) {
                url = decodeURIComponent(url);
                var ret = parseQueryString(url) || {};
                if ((ret.submitType || "").toUpperCase() === "POST") {
                    params = ret;
                    delete params.notitle;
                    type = "POST";
                    url = url.split("?")[0] + "?notitle=1";
                }
            }

            jQuery.ajax({
                url: url,

                // if "type" variable is undefined, then "GET" method will be used
                type: type,
                dataType: "html",
                data: params
            }).done(function(responseText) {
                var defaultLayer = layer //解决load时候重新渲染layer的问题
                    // Save response for use in complete callback
                response = arguments;

                self.html(selector ?

                    // If a selector was specified, locate the right elements in a dummy div
                    // Exclude scripts to avoid IE 'Permission Denied' errors
                    jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

                    // Otherwise use the full result
                    responseText);
                window.layer = defaultLayer //解决load时候重新渲染layer的问题

            }).complete(callback && function(jqXHR, status) {
                self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
            });
        }

        return this;
    }

    /**
     * 前端提示代码转换
     * @param code，错误代码
     * @param str，替换符号
     */

    function stringFormat(text, strArr) {
        if (Object.prototype.toString.call(strArr) === '[object Array]' && strArr.length > 0) {
            for (var i = 0; i < strArr.length; i++) {
                if (text.indexOf('%s') > -1) {
                    var itemV = strArr[i];
                    text = text.replace("%s", itemV);
                }
            }
        }
        return text;
    }


    /**
     * 前端错误代码转译
     * @param code
     * @param str
     * @returns {string}
     */


    $.errorCodeHandle = function(code, strArr) {

        var eCode = '';
        var codeData = errorCode;

        if (codeData) {
            if (codeData[code]) {
                var cwdm = codeData[code].cwzwmsPc;
                if (cwdm) {
                    eCode = cwdm
                }
            }

        }
        if (Object.prototype.toString.call(strArr) === '[object Array]' && strArr.length > 0 && eCode.indexOf('%s') > -1) {
            eCode = stringFormat(eCode, strArr);
        }

        if (!eCode || '' == eCode) { //费控云新增默认公共错误提示语
            eCode = codeData['VETECH_0000'].cwzwmsPc;
        }

        return eCode;


    };



})(jQuery, window, document);