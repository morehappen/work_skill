/**
 * @作者:zhangcheng
 * @TIME: 20190618
 */
define(function(require, exports, module) {

    var Pulldown = require("js/Pulldown"),
        HotelHotCircle = require("js/HotelHotCircle"),
        //VetechTab = require("/static/components/js/common/VetechTab"),
        //VetechTab = require("js/VetechTab"),
        SelectPeople = require("js/SelectPeople"),
        HotelCalendar = require("js/hotelCalendar"),
        VeUtil = require("core/util/VeUtil.js"),
        HotelDetailSlider = require("/static/components/js/hotel/hotelDetailSlider"),
        HotelChooseCalendar = require("js/HotelChooseCalendar"),
        // HotelChooseCalendar = require("/static/components/js/hotel/HotelChooseCalendar"),
        Slider = require("js/swiperA"),
        SliderVer = require("js/swiperB"),
        VetechCityTab = require("js/VetechCityTab"),
        Common = require("js/Common");
    //HotelHotCircle = require("/static/components/js/hotel/HotelHotCircle");


    /**
     * 酒店热门商圈
     */
    function initJdrmsq() {
        if ($.fn.showXzqSqAddress) return;
        $.fn.showXzqSqAddress = function(options) {
            if (!this.length) Common.nodeError(this);
            if (this.data("componentPOI")) {
                this.data("componentPOI").destroy();
                this.off(".POI");
            }
            if (this.data("hotelHotCircle")) {
                this.data("hotelHotCircle").destroy();
            }
            var _this = this;
            var opts = $.extend(true, {
                type: 2,
                pageSize: 10,
                "_hasPage_": false,
                dataType: "dynamic",
                simpleData: {
                    keyword: "qStr"
                },
                qDatas: {
                    yycj: "jd",
                    zgs: options.compId
                },
                title: '可输入城市首字母、汉字、拼音',
                height: 500,
                width: 380,
                defer: 500,
                typeValue: "/commdata/fabc/city/getPoi",
                ifSelect: false,
                fn1: function(data) {
                    return VeUtil.POIRenderFn.call(_this, data);
                }
            }, options);
            var hotelCrtl = new HotelHotCircle(this.get(0), options);
            var pullDown = new Pulldown(this.get(0), opts),
                enterQuery = false;
            this.data("componentPOI", pullDown);
            this.on("click", function(ev) {
                pullDown.hide();
                hotelCrtl.load(function(data) {
                    var ret = data.result;
                    ret.xjsList = ret.xjsList || [];
                    this.data = ret;
                    this.render();
                    this.show();
                });
            });
            var $city = $("#" + opts.csbh);
            this.on("keyup.POI", function(ev) {
                hotelCrtl.hide();
                pullDown.opts.qDatas.cityid = $city.val() || "";
                pullDown.elemKeyUpHandler(ev, function(data) {
                    $.each(data, function(i, n) {
                        var wd = n.bd || "";
                        wd = wd.split(",");
                        n.bdjd = wd[1] || "";
                        n.bdwd = wd[0] || "";
                        n.name = n.nm || "";
                    });
                    this.render();
                    this.show();
                });
            }).on("keydown.POI", function(ev) {
                if (ev.keyCode === 13) {
                    if (!enterQuery) {
                        enterQuery = true;
                        return false;
                    } else {
                        enterQuery = false;
                    }
                }
            });
        };
    }


    /**
     * 酒店选择人数控件
     */
    function initSelectPeople() {
        if ($.fn.addSelectPeople) return;

        $.fn.addSelectPeople = function(options, cbfn) {
            if (!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if (this.data("component")) {
                this.data("component").destroy();
                this.off(".sp");
            }
            var selectpeople = new SelectPeople(this.get(0), options, cbfn);
            this.data("component", selectpeople);
            this.on("click.sp", function() {
                selectpeople.show();
            });
        };

    }

    /**
     * 酒店品牌控件
     */
    function initJdpp() {
        if ($.fn.addJdpp) return;

        $.fn.addJdpp = function(options) {
            if (!this.length) Common.nodeError(this);

            if (this.data("component")) {
                this.data("component").destroy();
                this.off(".jdpp");
            }

            var pt = options.pt || 'fcc';

            var url = '/hotel/' + pt + '/hotel/hotellist/searchHotelPp'
            var opts = $.extend(true, {
                dataType: "dynamic",
                type: 2,
                title: "可输入酒店名称检索",
                typeValue: url,
                qDatas: {
                    data: {
                        current: '',
                    },

                    pt: pt
                },
                simpleData: {
                    id: "id",
                    name: "ywmc",
                    keyword: "reqData"
                },
                ajaxOpts: { //配置ajax相关信息
                    type: "post",
                    contentType: 'application/json'
                },
                formatPostData: function(data) {
                    return JSON.stringify(data);
                },

                fn1: function(data) {
                    return "<span style='width:30%'>" + data.ywmc + "</span><span style='width:70%;' class='right' >" + data.mc + "</span>";
                },
            }, options);

            var pulldown = new Pulldown(this.get(0), opts),
                isLoaded = false,
                enterQuery = false;
            var _this = this;
            $(this).on("click.jdpp", function() {
                if (isLoaded) {
                    pulldown.show();
                } else {
                    pulldown.load(function() {
                        this.render();
                        this.show();
                        isLoaded = true;
                        $(_this).data("component", pulldown);
                    });

                }
            }).on("keyup", function(e) {
                pulldown.elemKeyUpHandler(e, function(data) {
                    this.render();
                    this.show();
                });
            }).on("keydown", function(ev) {
                if (ev.keyCode === 13) {
                    if (!enterQuery) {
                        enterQuery = true;
                        return false;
                    } else {
                        enterQuery = false;
                    }
                }
            });
        };

    }

    /**
     * 国际酒店城市控件
     */
    function initHotelGjCity() {
        if ($.fn.addHotelGjCity) return;

        function markKeyword(keyWord, name) {
            var raRegExp = new RegExp(keyWord, "ig");
            return name.replace(raRegExp, "<i style='color:#0099ff;font-style: normal;'>" + keyWord + "</i>");
        }
        $.fn.addHotelGjCity = function(opts1, opts2, cbn) {
            var oInput = this.get(0);
            var _this = this;
            var zgs = opts1.zgs || ''
            var tabOpts = {
                type: 2,
                itemWidth: 60,
                tabWidth: 80,
                rightWidth: 20,
                url: '/commdata/fabc/city/gjHotelCity?zgs=' + zgs,

            };
            var pulldownOpts = {
                dataType: "dynamic",
                type: 2,
                typeValue: "/commdata/fabc/city/getLikeCityNew",
                simpleData: {
                    id: "value",
                    name: "echo",
                    count: "pageSize",
                    keyword: "qStr"
                },
                pageSize: 10,
                width: 250,
                //   height:380,
                _hasPage_: false,
                qDatas: {
                    "gngj": '1'
                },
                fn1: function(data) {
                    var iscity = data.iscity;
                    var result = data.mc + data.searchKey;
                    var keyword = $.trim($(_this).val()).toUpperCase();
                    var spanHtml = '<span class="vetech-city-icon" title="' + result + '"><p style="margin-right:20px;overflow-x: hidden;text-overflow: ellipsis">' + markKeyword(keyword, result) + '</p></span>'; //靠前的显示
                    if (iscity && iscity === "0") {
                        if (data.pid) { //应需求只有有pid的机场才加拐弯
                            spanHtml = '<div class="ejDiv"><span class="vetech-jc-icon" title="' + result + '">' + markKeyword(keyword, result) + '</span></div>'; //靠前的显示
                        } else {
                            spanHtml = '<div class="ejDiv"><span style="width: 90%" title="' + result + '">' + markKeyword(keyword, result) + '</span></div>'; //靠前的显示
                        }
                    }
                    return spanHtml;
                }
            };
            var tab = $(this).data("tabComponent"),
                pulldown = $(this).data("pulldownComponent");
            var bindKj = { now: $(this) };
            bindKj.destroy = function() {
                if (this.kj1 && this.kj1.destroy) this.kj1.destroy();
                if (this.kj2 && this.kj2.destroy) this.kj2.destroy();
                this.now.off('.hotelgjcity');
            }
            $(this).off(".hotelgjcity");
            if (tab && pulldown) {
                tab && tab.destroy && tab.destroy();
                pulldown && pulldown.destroy && pulldown.destroy();
            }
            if (!this.length) Common.nodeError(this);
            var tabIsLoaded = false,
                pulldownIsLoaded = false,
                enterQuery = false;
            $(this).on("click.hotelgjcity", function() {
                if (tabIsLoaded) {
                    if ((tab && tab.isShow) || (pulldown && pulldown.isShow)) return;
                    pulldown && pulldown.hide();
                    tab.show();
                } else {
                    tab = new VetechCityTab(this, $.extend(true, {}, tabOpts, opts1), cbn);
                    bindKj.kj1 = tab;
                    if (!pulldownIsLoaded) {
                        pulldown = new Pulldown(this, $.extend(true, {}, pulldownOpts, opts2));
                        bindKj.kj2 = pulldown;
                        $(this).data("pulldownComponent", pulldown);
                        pulldownIsLoaded = true;
                    }
                }

                tabIsLoaded = true;
            }).on("keyup.hotelgjcity", function(ev) {

                //清空选中状态
                if (tab) {
                    tab.clearClickedItems();
                }

                if (!this.value) {
                    tab && tab.show();
                    pulldown && pulldown.hide();
                    if (opts1.cbFnKeyUp) opts1.cbFnKeyUp();
                } else {
                    pulldown.elemKeyUpHandler(ev, function(ev) {
                        this.render();
                        this.show();
                    });
                    tab.hide();

                }
                $(oInput).focus();
            }).on("keydown.hotelgjcity", function(ev) {
                if (ev.keyCode === 13) {
                    if (!enterQuery) {
                        enterQuery = true;
                        return false;
                    } else {
                        enterQuery = false;
                    }
                }
            });
            return bindKj;
        };
    }


    /**
     * 国内酒店城市控件
     */
    function initHotelGnCity() {
        if ($.fn.addHotelGnCity) return;

        function markKeyword(keyWord, name) {
            var raRegExp = new RegExp(keyWord, "ig");
            return name.replace(raRegExp, "<i style='color:#0099ff;font-style: normal;'>" + keyWord + "</i>");
        }
        $.fn.addHotelGnCity = function(opts1, opts2, cbn) {
            var oInput = this.get(0);
            var _this = this;
            var gngj = opts1.gngj || '1';
            var zgs = opts1.zgs || '';

            var tabOpts = {
                type: 2,
                itemWidth: 60,
                tabWidth: 80,
                rightWidth: 20,
                url: '/commdata/fabc/city/gnHotelCity?zgs=' + zgs,
            };
            var pulldownOpts = {
                dataType: "dynamic",
                type: 2,
                typeValue: "/commdata/fabc/city/getLikeCity",
                simpleData: {
                    id: "csbh",
                    name: "name",
                    count: "pageSize",
                    keyword: "qStr"
                },
                pageSize: 10,
                // height:380,
                _hasPage_: false,
                qDatas: {
                    "gngj": gngj
                },
                preWidth: "50%",
                subfixWidth: "50%",
                fn1: function(data) {
                    var value = _this.val();
                    var arr = [];
                    data.sjmc && arr.push(data.sjmc);
                    data.szmc && data.szmc != data.sjmc && arr.push(data.szmc);
                    var tempVal = data.name.replace(new RegExp(value, "g"), "<i style='color:#0066CC;font-style: normal;font-weight: bold'>" + value + "</i>");
                    var spanHtml = '<span style="width:' + pulldownOpts.preWidth + '">' + tempVal + '</span>'; //靠前的显示
                    spanHtml += '<span class="right" style="width:' + pulldownOpts.subfixWidth + '">' + arr.join("&nbsp;&nbsp;") + '</span>';
                    return spanHtml;
                }
            };
            var tab = $(this).data("tabComponent"),
                pulldown = $(this).data("pulldownComponent");
            var bindKj = { now: $(this) };
            bindKj.destroy = function() {
                if (this.kj1 && this.kj1.destroy) this.kj1.destroy();
                if (this.kj2 && this.kj2.destroy) this.kj2.destroy();
                this.now.off('.hotelgncity');
            }
            $(this).off(".hotelgncity");
            if (tab && pulldown) {
                tab && tab.destroy && tab.destroy();
                pulldown && pulldown.destroy && pulldown.destroy();
            }

            if (!this.length) Common.nodeError(this);
            var tabIsLoaded = false,
                pulldownIsLoaded = false,
                enterQuery = false;
            $(this).on("click.hotelgncity", function() {
                if (tabIsLoaded) {
                    if ((tab && tab.isShow) || (pulldown && pulldown.isShow)) return;
                    pulldown && pulldown.hide();
                    tab.show();
                } else {
                    tab = new VetechCityTab(this, $.extend(true, {}, tabOpts, opts1), cbn);
                    bindKj.kj1 = tab;
                    if (!pulldownIsLoaded) {
                        pulldown = new Pulldown(this, $.extend(true, {}, pulldownOpts, opts2));
                        bindKj.kj2 = pulldown;
                        $(this).data("pulldownComponent", pulldown);
                        pulldownIsLoaded = true;
                    }
                }

                tabIsLoaded = true;
            }).on("keyup.hotelgncity", function(ev) {

                //清空选中状态
                if (tab) {
                    tab.clearClickedItems();
                }

                if (!this.value) {
                    tab && tab.show();
                    pulldown && pulldown.hide();
                    if (opts1.cbFnKeyUp) opts1.cbFnKeyUp();
                } else {
                    pulldown.elemKeyUpHandler(ev, function(ev) {
                        this.render();
                        this.show();
                    });
                    tab.hide();

                }
                $(oInput).focus();
            }).on("keydown.hotelgjcity", function(ev) {
                if (ev.keyCode === 13) {
                    if (!enterQuery) {
                        enterQuery = true;
                        return false;
                    } else {
                        enterQuery = false;
                    }
                }
            });

            return bindKj
        };
    }
    /**
     * 酒店日历控件
     */
    function initHotelCalendar() {
        if ($.fn.addHotelCalendar) return;

        $.fn.addHotelCalendar = function(options) {
            if (!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if (this.data("component")) {
                this.data("component").destroy();
            }
            var hc = new HotelCalendar(this.get(0), options);
            this.data("component", hc);
            hc.load(function(data) {
                this.data = data;
                this.render();
            });
        };

    }

    /**
     * 酒店选择日历
     * @type {initJdrmsq}
     */
    function initHotelChooseCalendar(options, callback) {
        var cal = new HotelChooseCalendar(options, callback);

    }

    /**
     * 初始化poi控件
     */
    function initPoi() {
        if ($.fn.addPoi) return;

        $.fn.addPoi = function(options) {
            if (!this.length) Common.nodeError(this);

            if (this.data("componentPOI")) {
                this.data("componentPOI").destroy();
                this.off(".POI");
            }
            var _this = this;
            var opts = $.extend(true, {
                type: 2,
                pageSize: 10,
                "_hasPage_": false,
                dataType: "dynamic",
                simpleData: {
                    keyword: "qStr",
                    id: "id",
                    name: "showname"
                },
                qDatas: {
                    yycj: "jd",
                    zgs: options.compId,
                },
                title: '可输入城市首字母、汉字、拼音',
                height: 500,
                width: 380,
                defer: 500,
                typeValue: "/commdata/fabc/city/getPoi",
                fn1: function(data) {
                    return VeUtil.POIRenderFn.call(_this, data);
                }
            }, options);

            var poiPulldown = new Pulldown(this.get(0), opts);
            this.data("componentPOI", poiPulldown);

            //城市id
            var $city = $("#" + opts.qDatas.cityid),
                enterQuery = false;
            this.on("keyup.POI", function(ev) {
                poiPulldown.opts.qDatas.cityid = $city.val() || "";
                poiPulldown.elemKeyUpHandler(ev, function() {
                    this.render();
                    this.show();
                });
            }).on("keydown.POI", function(ev) {
                if (ev.keyCode === 13) {
                    if (!enterQuery) {
                        enterQuery = true;
                        return false;
                    } else {
                        enterQuery = false;
                    }
                }
            });
        };

    }

    /**
     * 初始化酒店详情中图片九宫格控件
     */
    function initHotelDetailSlider() {
        if ($.fn.hotelDetailSlider) return;
        var defaultOpts = {
            ptlx: 'fcc',
            type: '2', // 数据来源。 默认为2， 此时需要传入typeValue<获取图片的服务。>  当type传1时， typeValue需要传入json数据
            autoPlay: true, //是否自动播放
            defer: 2000, // 间隔时间
            bigImg: null, //大的轮播图的大小
            smallImg: null, //小的轮播图的大小
            crossNum: 2, //小的轮播图每排显示两个
            showGroup: true,
            isHaveLayer: true //是否有弹出层
        };

        $.fn.hotelDetailSlider = function(options) {
            var opts = $.extend(true, {}, defaultOpts, options);
            new HotelDetailSlider(this.get(0), opts);
        }
    }

    /**
     * 轮播图A版（见示例）
     */
    function initSwiperA() {
        if ($.fn.swiperA) return;
        $.fn.swiperA = function(opts, cbFn) {
            if (!this.length) throw new Error("DOM绑定错误!");
            var opts = $.extend(true, {
                smallImg: { w: 60, h: 30 }, //设置默认小图片的大小
                bigImg: { w: 600, h: 300 }, //设置默认大图片的大小
                type: 1, //设置图片加载类型（1：自己上传图片资料，2：后台ajax请求，默认为1）
                autoPlay: true, //是否自动播放（默认为true）
                typeValue: [], //当type为1的时候，typeValue为json数组，当type为2的时候，typeValue为ajax请求地址
                ajaxObj: {}, //配置ajax参数的对象
                defer: 2000, //配置轮播图的速度
            }, opts)
            new Slider(this.get(0), opts, cbFn);
        };
    }

    /**
     * 轮播图B版（见示例）
     */
    function initSwiperB() {
        if ($.fn.swiperA) return;
        $.fn.swiperB = function(opts, cbFn) {
            if (!this.length) throw new Error("DOM绑定错误!");
            var opts = $.extend(true, {
                smallImg: { w: 60, h: 30 }, //设置默认小图片的大小
                bigImg: { w: 600, h: 300 }, //设置默认大图片的大小
                type: 1, //设置图片加载类型（1：自己上传图片资料，2：后台ajax请求，默认为1）
                autoPlay: true, //是否自动播放（默认为true）
                typeValue: [], //当type为1的时候，typeValue为json数组，当type为2的时候，typeValue为ajax请求地址
                ajaxObj: {}, //配置ajax参数的对象
                defer: 2000, //配置轮播图的速度
            }, opts)
            new SliderVer(this.get(0), opts, cbFn);
        };
    }


    exports.initJdrmsq = initJdrmsq;

    exports.initSelectPeople = initSelectPeople;

    exports.initJdpp = initJdpp;

    exports.initHotelGjCity = initHotelGjCity;

    exports.initHotelGnCity = initHotelGnCity;

    exports.initHotelCalendar = initHotelCalendar;

    exports.initHotelChooseCalendar = initHotelChooseCalendar;

    exports.initPoi = initPoi;

    exports.initHotelDetailSlider = initHotelDetailSlider;

    exports.initSwiperA = initSwiperA;

    exports.initSwiperB = initSwiperB;

});