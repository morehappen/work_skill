$(function() {
    // 处理视频播放
    moon("video_box1");
    moon("video_box2");
    moon("video_box3");
    moon("video_box4");
    //视频函数封装
    function moon(param) {
        var video = document.getElementById(param); //变量1
        var click_dom = $("#" + param).parents(".video_box").find(".play_ctr");
        //变量2
        click_dom.on("click", function() {
            // 分割标记
            var parents_dom = $(this).parents(".video_box");
            var video_dom = parents_dom.find(".video-self");
            var current = video_dom.attr("data-current");
            var mask_dom = parents_dom.find(".mask");
            var play_ctr_dom = parents_dom.find(".play_ctr");
            if (current == 1) {
                //暂停状态下逻辑：
                video.play();
                //变量3
                mask_dom.hide();
                play_ctr_dom.removeClass("play_btn").addClass("pause_btn");
                // 正在播放的时候，将状态设置为false
                video_dom.attr("data-current", "0");
            } else {
                mask_dom.show();
                play_ctr_dom.removeClass("pause_btn").addClass("play_btn");
                video.pause();
                // current = true;
                video_dom.attr("data-current", "1");
            }
        });
        //变量4
        $("body").on("mouseenter mouseleave", ".video_box", function(event) {
            var e = event,
                type = e.type;
            var parents_dom = $(this);
            var current = parents_dom.find("video").attr("data-current");
            if (current == 0) {
                if (type == 'mouseenter') {
                    parents_dom.find(".play_ctr").show();
                    return;
                }
                if (type == 'mouseleave') {
                    parents_dom.find(".play_ctr").hide();
                    return;
                }
            }
        });
    };
    //地图函数启动
    var dataMap = [{
        name: '北京',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 1
    }, {
        name: '天津',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 2
    }, {
        name: '上海',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 3
    }, {
        name: '重庆',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 4
    }, {
        name: '河北',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 5
    }, {
        name: '河南',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 6
    }, {
        name: '云南',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 7
    }, {
        name: '辽宁',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 8
    }, {
        name: '黑龙江',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 9
    }, {
        name: '湖南',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 10
    }, {
        name: '安徽',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 11
    }, {
        name: '山东',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 12
    }, {
        name: '新疆',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 13
    }, {
        name: '江苏',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 14
    }, {
        name: '浙江',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 15
    }, {
        name: '江西',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 16
    }, {
        name: '湖北',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 17
    }, {
        name: '广西',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 18
    }, {
        name: '甘肃',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 19
    }, {
        name: '山西',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 20
    }, {
        name: '内蒙古',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 21
    }, {
        name: '陕西',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 22
    }, {
        name: '吉林',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 23
    }, {
        name: '福建',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 24
    }, {
        name: '贵州',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 25
    }, {
        name: '广东',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 26
    }, {
        name: '青海',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 27
    }, {
        name: '西藏',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 28
    }, {
        name: '四川',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '1',
        value: 29
    }, {
        name: '宁夏',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 30
    }, {
        name: '海南',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 31
    }, {
        name: '台湾',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 32
    }, {
        name: '香港',
        sign: '0',
        selected: false,
        txt: '0537-4111606<br>',
        sign: '0',
        value: 33
    }, {
        name: '澳门',
        selected: false,
        sign: '0',
        txt: '0537-4111606<br>',
        value: 34
    }]; //各省地图颜色数据依赖value
    // 基于准备好的dom，初始化echarts实例
    var mapBoxEchart = echarts.init(document.getElementById('mapBox'));

    // 指定相关的配置项和数据
    var mapBoxOption = {
        // tooltip: {
        //     formatter: function(params) {
        //         if (params.data.sign == "0") {
        //             var info = '<p style="font-size:14px;color: #ceccd6"> ' + '暂缺加盟合作联系电话' + '</p>'
        //             return info;
        //         } else {
        //             var info = '<p style="font-size:18px">' + params.name + '</p><p style="font-size:14px"> ' + params.data.txt + '</p>'
        //             var info = '<p style="font-size:18px"> ' + params.data.txt + '</p><p style="font-size:14px;color: #ceccd6"> ' + params.name + '地区联系方式</p>'
        //             return info;
        //         }
        //     },
        //     backgroundColor: "#4a4567", //提示标签背景颜色 【弹出层的背景色】
        //     textStyle: {
        //         color: "#fff" //【弹出层的字体颜色】
        //     } //提示标签字体颜色 
        // },
        series: [{
            type: 'map',
            mapType: 'china',
            label: {
                normal: {
                    show: true, //显示省份标签
                    textStyle: {
                        color: "333"
                    } //省份标签字体颜色
                },
                emphasis: { //对应的鼠标悬浮效果
                    show: true,
                    textStyle: {
                        color: "#fff"
                    }
                }
            },
            aspectScale: 0.75,
            zoom: 1.2,
            itemStyle: {
                normal: {
                    borderWidth: .5, //区域边框宽度
                    borderColor: '#009fe8', //区域边框颜色
                    areaColor: "#ffefd5", //区域颜色
                },
                emphasis: {
                    borderWidth: .5,
                    borderColor: '#fff',
                    areaColor: "#44a1fa"
                        // areaColor: "rgba(68,161,250,1)",
                }
            },
            data: dataMap
        }],
        dataRange: {
            x: '-1000 px', //图例横轴位置
            y: '-1000 px', //图例纵轴位置
            splitList: [{
                start: 1,
                end: 1,
                label: '北京',
                color: '#acd7fe'
            }, {
                start: 2,
                end: 2,
                label: '天津',
                color: '#acd7fe'
            }, {
                start: 3,
                end: 3,
                label: '上海',
                color: '#acd7fe'
            }, {
                start: 4,
                end: 4,
                label: '重庆',
                color: '#acd7fe'
            }, {
                start: 5,
                end: 5,
                label: '河北',
                color: '#acd7fe'
            }, {
                start: 6,
                end: 6,
                label: '河南',
                color: '#acd7fe'
            }, {
                start: 7,
                end: 7,
                label: '云南',
                color: '#acd7fe'
            }, {
                start: 8,
                end: 8,
                label: '辽宁',
                color: '#acd7fe'
            }, {
                start: 9,
                end: 9,
                label: '黑龙江',
                color: '#acd7fe'
            }, {
                start: 10,
                end: 10,
                label: '湖南',
                color: '#acd7fe'
            }, {
                start: 11,
                end: 11,
                label: '安徽',
                color: '#acd7fe'
            }, {
                start: 12,
                end: 12,
                label: '山东',
                color: '#acd7fe'
            }, {
                start: 13,
                end: 13,
                label: '新疆',
                color: '#acd7fe'
            }, {
                start: 14,
                end: 14,
                label: '江苏',
                color: '#acd7fe'
            }, {
                start: 15,
                end: 15,
                label: '浙江',
                color: '#acd7fe'
            }, {
                start: 16,
                end: 16,
                label: '江西',
                color: '#acd7fe'
            }, {
                start: 17,
                end: 17,
                label: '湖北',
                color: '#acd7fe'
            }, {
                start: 18,
                end: 18,
                label: '广西',
                color: '#acd7fe'
            }, {
                start: 19,
                end: 19,
                label: '甘肃',
                color: '#acd7fe'
            }, {
                start: 20,
                end: 20,
                label: '山西',
                color: '#acd7fe'
            }, {
                start: 21,
                end: 21,
                label: '内蒙古',
                color: '#acd7fe'
            }, {
                start: 22,
                end: 22,
                label: '陕西',
                color: '#acd7fe'
            }, {
                start: 23,
                end: 23,
                label: '吉林',
                color: '#acd7fe'
            }, {
                start: 24,
                end: 24,
                label: '福建',
                color: '#acd7fe'
            }, {
                start: 25,
                end: 25,
                label: '贵州',
                color: '#acd7fe'
            }, {
                start: 26,
                end: 26,
                label: '广东',
                color: '#acd7fe'
            }, {
                start: 27,
                end: 27,
                label: '青海',
                color: '#deeffe'
            }, {
                start: 28,
                end: 28,
                label: '西藏',
                color: '#deeffe'
            }, {
                start: 29,
                end: 29,
                label: '四川',
                color: '#acd7fe'
            }, {
                start: 30,
                end: 30,
                label: '宁夏',
                color: '#acd7fe'
            }, {
                start: 31,
                end: 31,
                label: '海南',
                color: '#acd7fe'
            }, {
                start: 32,
                end: 32,
                label: '台湾',
                color: '#acd7fe'
            }, {
                start: 33,
                end: 33,
                label: '香港',
                color: '#acd7fe'
            }, {
                start: 34,
                end: 34,
                label: '澳门',
                color: '#acd7fe'
            }]
        }, //各省地图颜色；start：值域开始值；end：值域结束值；label：图例名称；color：自定义颜色值；
    };
    // 使用制定的配置项和数据显示图表
    mapBoxEchart.setOption(mapBoxOption);
    // echart图表自适应
    window.addEventListener("resize", function() {
        mapBoxEchart.resize();
    });
})