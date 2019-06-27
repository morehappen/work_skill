'use strict';

Vue.prototype.$ = $;
Vue.prototype.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
};
var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            map: null,
            poiPicker: null,
            marker: null,
            // lng: "116.453134",//北京
            lng: "114.031040",//深圳
            // 北纬N22°32′43.86″, 东经E114°03′10.40″,
            // lat: "39.989286",//北京
            lat: "22.324386"//深圳
        };
    },

    watch: {},
    filters: {},
    methods: {
        pin_drag() {
            var this_ = this;
            AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker) {
                var map = new AMap.Map('main', {
                    zoom: 16,
                    scrollWheel: false
                });
                map.plugin(['AMap.Geolocation', 'AMap.ToolBar'], function () {

                    var toolbar = new AMap.ToolBar();
                    map.addControl(toolbar);
                    var geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
                        timeout: 5000,           // 超过5秒后停止定位，默认：无穷大
                        maximumAge: 0,            // 定位结果缓存0毫秒，默认：0
                        convert: true,            // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                        showButton: true,         // 显示定位按钮，默认：true
                        buttonPosition: 'LB',     // 定位按钮停靠位置，默认：'LB'，左下角
                        buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                        showMarker: true,         // 定位成功后在定位到的位置显示点标记，默认：true
                        showCircle: true,         // 定位成功后用圆圈表示定位精度范围，默认：true
                        panToLocation: true,      // 定位成功后将定位到的位置作为地图中心点，默认：true
                        zoomToAccuracy: true       // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    });
                    map.addControl(geolocation);
                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, 'complete', onComplete); // 返回定位信息
                    AMap.event.addListener(geolocation, 'error', onError);       // 返回定位出错信息
                });
                var positionPicker = new PositionPicker({
                    mode: 'dragMap',
                    map: map
                });

                function onComplete(obj) {
                    console.log("成功");
                }

                function onError(obj) {
                    console.log("失败");
                }

                positionPicker.on('success', function (positionResult) {
                    console.log(positionResult);
                    var sheng = positionResult.regeocode.addressComponent.province;
                    var shi = positionResult.regeocode.addressComponent.city;
                    var qx = positionResult.regeocode.addressComponent.district;
                    var jd = positionResult.regeocode.addressComponent.township +
                        positionResult.regeocode.addressComponent.street +
                        positionResult.regeocode.addressComponent.streetNumber;
                    // console.log(sheng+shi+qx+jd);
                    // console.log(positionResult.address);
                    // console.log(this_.city);
                    this_.boardingAdd = {
                        cityName: positionResult.regeocode.pois[0].name,
                        dataLng: positionResult.position.lng,//经度
                        dataLat: positionResult.position.lat,// 维度
                        adddistrict: positionResult.regeocode.addressComponent.district,
                        addaddress: positionResult.address
                    }

                    this_.current_position_data = {
                        dataFlag: "1",
                        dataLng: positionResult.position.lng,
                        dataLat: positionResult.position.lat,// 维度
                    }
                });
                positionPicker.on('fail', function (positionResult) {
                    // console.log(positionResult);
                });
                positionPicker.start();
                map.panBy(0, 1);
                map.addControl(new AMap.ToolBar({
                    liteStyle: true
                }))
            });
        },






        // 当前定位执行函数
        getLocation:function getLocation(){
            var this_ = this;
            AMap.plugin('AMap.Geolocation', function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野s内可见，默认：false
                });
                this_.map.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
            });
            function onComplete(data) {
                $('#address').val(data.formattedAddress)
                $('.address .info').text(data.formattedAddress)
            }
            //解析定位错误信息
            function onError(data) {
                $('.address .info').text('定位失败！');
            }
        },
        geocoder_CallBack: function geocoder_CallBack(data) {
            var address = data.regeocode.formattedAddress; //返回地址描述
        },
        // 反向地理编码执行函数
        sky_test() {
            var this_ = this;
            var lnglatXY = [this_.lng, this_.lat]; //已知点坐标
            this_.map.plugin(["AMap.Geocoder"], function () {
                var geocoder = new AMap.Geocoder({
                    radius: 1000,
                    extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
                });
                geocoder.getAddress(lnglatXY, function (status, result) {
                    console.log(status, result);
                    if (status === 'complete' && result.info === 'OK') {
                        this_.geocoder_CallBack(result);
                    }
                });
                if (!this_.marker) {
                    this_.marker = new AMap.Marker({
                        //加点
                        map: this_.map,
                        position: lnglatXY
                    });
                } else {
                    this_.marker.setPosition(lnglatXY);
                }
                this_.map.setFitView();
                // marker.setPosition(lnglatXY);
                // map.panTo([key_11, key_12]);
            })
        },
        init: function init() {
            var this_ = this;
            // var lat;
            // var lng;
            // var map;
            // var poiPicker;
            // var marker;
            AMapUI.loadUI(['misc/PositionPicker', 'misc/PoiPicker'], function (PositionPicker, PoiPicker) {
                debugger
                this_.map = new AMap.Map('container', {
                    zoom: 14,
                    scrollWheel: false
                });
                this_.poiPicker = new PoiPicker({
                    input: 'search',
                    placeSearchOptions: {
                        map: this_.map,
                        pageSize: 6 //关联搜索分页
                    }

                });

                // 加载定位插件，实现定位功能
                this_.getLocation();
                // AMap.plugin('AMap.Geolocation', function () {
                //     debugger
                //     geolocation = new AMap.Geolocation({
                //         enableHighAccuracy: true,//是否使用高精度定位，默认:true
                //         timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                //         maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                //         showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                //         showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                //         panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                //         zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野s内可见，默认：false
                //     });
                //     this_.map.addControl(geolocation);
                //     geolocation.getCurrentPosition();
                //     AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                //     AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
                // });

                // 搜索选址
                this_.poiPicker.on('poiPicked', function (poiResult) {
                    poiPicker.hideSearchResults();
                    this_.lat = poiResult.item.location.lat
                    this_.lng = poiResult.item.location.lng
                    $('.poi .nearpoi').text(poiResult.item.name)

                    $('.address .info').text(poiResult.item.address)

                    $('#address').val(poiResult.item.address)
                    map.panTo([this_.lng, this_.lat]);
                });

                function onComplete(data) {
                    $('#address').val(data.formattedAddress)
                    $('.address .info').text(data.formattedAddress)
                }

                //解析定位错误信息
                function onError(data) {
                    $('.address .info').text('定位失败！');
                }

                var positionPicker = new PositionPicker({
                    mode: 'dragMap',
                    map: this_.map,
                    iconStyle: {
                        // 此处自定义外观
                        url: "../map_Pin.png",
                        ancher: [24, 40],
                        size: [14, 30.1]
                    }
                });
                // 拖拽选址
                positionPicker.on('success', function (positionResult) {
                    $('.poi .nearpoi').text(positionResult.nearestPOI)
                    $('.address .info').text(positionResult.address)
                    $('#address').val(positionResult.address)
                });
                positionPicker.on('fail', function (positionResult) {
                    $('.poi .nearpoi').text('')
                    $('.address .info').text('')
                });
                var onModeChange = function (e) {
                    positionPicker.setMode(e.target.value)
                }
                positionPicker.start();
                this_.map.panBy(0, 1);
                // map.addControl(new AMap.ToolBar({
                //     liteStyle: true
                // }))
            });

            function sub() {
                // 提交地址相关操作
            }

            //逆地理编码
            // var map = new AMap.Map('container');
            // lnglatXY = [116.413134, 39.84122]; //已知点坐标
            function regeocoder() {
                //逆地理编码
                key_11 = document.getElementById("key_11").value;//lng
                key_12 = document.getElementById("key_12").value;//lat
                var lnglatXY = new AMap.LngLat(key_11, key_12);//【标记】这是一个经纬度类
                this_.map.plugin(["AMap.Geocoder"], function () {
                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
                    });
                    geocoder.getAddress(lnglatXY, function (status, result) {
                        console.log(status, result);
                        if (status === 'complete' && result.info === 'OK') {
                            geocoder_CallBack(result);
                        }
                    });
                    if (!this_.marker) {
                        this_.marker = new AMap.Marker({
                            //加点
                            map: map,
                            position: lnglatXY
                        });
                    } else {
                        this_.marker.setPosition(lnglatXY);
                    }
                    this_.map.setFitView();
                    // marker.setPosition(lnglatXY);
                    // map.panTo([key_11, key_12]);
                })

            }

            function geocoder_CallBack(data) {
                var address = data.regeocode.formattedAddress; //返回地址描述
            }
        }
    },
    mounted: function mounted() {
        var this_ = this;
        this_.init();
        // var lat;
        // var lng;
        // var map;
        // var poiPicker;
        // var marker;
        // AMapUI.loadUI(['misc/PositionPicker', 'misc/PoiPicker'], function (PositionPicker, PoiPicker) {
        //     map = new AMap.Map('container', {
        //         zoom: 14,
        //         scrollWheel: false
        //     });
        //     poiPicker = new PoiPicker({
        //         input: 'search',
        //         placeSearchOptions: {
        //             map: map,
        //             pageSize: 6 //关联搜索分页
        //         }
        //
        //     });
        //
        //     // 加载定位插件，实现定位功能
        //     AMap.plugin('AMap.Geolocation', function () {
        //         geolocation = new AMap.Geolocation({
        //             enableHighAccuracy: true,//是否使用高精度定位，默认:true
        //             timeout: 10000,          //超过10秒后停止定位，默认：无穷大
        //             maximumAge: 0,           //定位结果缓存0毫秒，默认：0
        //             showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
        //             showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
        //             panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
        //             zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野s内可见，默认：false
        //         });
        //         map.addControl(geolocation);
        //         geolocation.getCurrentPosition();
        //         AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
        //         AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
        //     });
        //
        //     // 搜索选址
        //     poiPicker.on('poiPicked', function (poiResult) {
        //         poiPicker.hideSearchResults();
        //         lat = poiResult.item.location.lat
        //         lng = poiResult.item.location.lng
        //         $('.poi .nearpoi').text(poiResult.item.name)
        //
        //         $('.address .info').text(poiResult.item.address)
        //
        //         $('#address').val(poiResult.item.address)
        //         map.panTo([lng, lat]);
        //     });
        //     function onComplete(data) {
        //         $('#address').val(data.formattedAddress)
        //         $('.address .info').text(data.formattedAddress)
        //     }
        //
        //     //解析定位错误信息
        //     function onError(data) {
        //         $('.address .info').text('定位失败！');
        //     }
        //     var positionPicker = new PositionPicker({
        //         mode: 'dragMap',
        //         map: map,
        //         iconStyle: {
        //             // 此处自定义外观
        //             url: "../map_Pin.png",
        //             ancher: [24, 40],
        //             size: [14, 30.1]
        //         }
        //     });
        //     // 拖拽选址
        //     positionPicker.on('success', function (positionResult) {
        //         $('.poi .nearpoi').text(positionResult.nearestPOI)
        //         $('.address .info').text(positionResult.address)
        //         $('#address').val(positionResult.address)
        //     });
        //     positionPicker.on('fail', function (positionResult) {
        //         $('.poi .nearpoi').text('')
        //         $('.address .info').text('')
        //     });
        //     var onModeChange = function (e) {
        //         positionPicker.setMode(e.target.value)
        //     }
        //     positionPicker.start();
        //     map.panBy(0, 1);
        //     // map.addControl(new AMap.ToolBar({
        //     //     liteStyle: true
        //     // }))
        // });
        // function sub() {
        //     // 提交地址相关操作
        // }
        //
        // //逆地理编码
        // // var map = new AMap.Map('container');
        // // lnglatXY = [116.413134, 39.84122]; //已知点坐标
        // function regeocoder() {
        //     //逆地理编码
        //     key_11 = document.getElementById("key_11").value;//lng
        //     key_12 = document.getElementById("key_12").value;//lat
        //     var lnglatXY = new AMap.LngLat(key_11,key_12);//【标记】这是一个经纬度类
        //     map.plugin(["AMap.Geocoder"],function () {
        //         var geocoder = new AMap.Geocoder({
        //             radius: 1000,
        //             extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
        //         });
        //         geocoder.getAddress(lnglatXY, function(status, result) {
        //             console.log(status,result);
        //             if (status === 'complete' && result.info === 'OK') {
        //                 geocoder_CallBack(result);
        //             }
        //         });
        //         if(!marker){
        //             marker = new AMap.Marker({
        //                 //加点
        //                 map: map,
        //                 position: lnglatXY
        //             });
        //         }else {
        //             marker.setPosition(lnglatXY);
        //         }
        //         map.setFitView();
        //         // marker.setPosition(lnglatXY);
        //         // map.panTo([key_11, key_12]);
        //     })
        //
        // }
        // function geocoder_CallBack(data) {
        //     var address = data.regeocode.formattedAddress; //返回地址描述
        // }
    }
});