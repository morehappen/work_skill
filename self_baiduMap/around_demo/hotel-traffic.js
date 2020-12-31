/**
 * 酒店详情位置交通地图JS
 * @author meiqiangbo
 * Created by vetech on 2019/7/9.
 */
var BaiduMap = {},
    opts = {};
var map;
var jdData = {
    // lng:116.404,
    // lat:39.915
};

//初始化map对象
//divId:百度地图放置div
BaiduMap.initMap = function(divId) {
    map = new BMap.Map(divId, { minZoom: 8, enableMapClick: false }); //在百度地图容器中创建一个地图
    setMapEvent(); //创建和初始化地图 设置地图事件
    setMapTool();
};

// 创建地图
BaiduMap.createMap = function() {
    // 创建地图
    var point = new BMap.Point(jdData.lng, jdData.lat);
    map.centerAndZoom(point, 15);
    // 创建地图标注(自定义标注)
    customOverLay();
}

// 搜索路线
BaiduMap.searchTrip = function(searchObj) {
    // 百度地图API功能
    var p1, p2 = "";
    var start = searchObj.start;
    var end = searchObj.end;
    // 要么起点终点全都有经纬度,如果一个没有,就两个都使用中文查询
    if (!$.isBlank(start) && !$.isBlank(end)) {
        var startArr = searchObj.start.split(",");
        p1 = new BMap.Point(startArr[0], startArr[1]);
        var endArr = searchObj.end.split(",");
        p2 = new BMap.Point(endArr[0], endArr[1]);
    } else {
        p1 = searchObj.startzwmc;
        p2 = searchObj.endzwmc;
    }
    //清除地图上所有覆盖物
    map.clearOverlays();
    // 查询类型,1公交,2驾车,3步行
    var searchType = searchObj.searchType;
    if (searchType == '1') {
        // 出行策略
        var i = searchObj.travelPolicy;
        //四种公交策略：最少时间，最少换乘，最少步行，不乘地铁
        var routePolicy = [BMAP_TRANSIT_POLICY_LEAST_TIME, BMAP_TRANSIT_POLICY_LEAST_TRANSFER, BMAP_TRANSIT_POLICY_LEAST_WALKING, BMAP_TRANSIT_POLICY_AVOID_SUBWAYS];
        var transit = new BMap.TransitRoute(map, {
            renderOptions: { map: map, panel: "map_result" },
            policy: 0
        });
        transit.search(p1, p2);
        transit.setPolicy(routePolicy[i]);
    } else if (searchType == '2') {
        // 出行策略
        var i = searchObj.travelPolicy;
        //三种驾车策略：最少时间，最短距离，避开高速
        var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME, BMAP_DRIVING_POLICY_LEAST_DISTANCE, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
        var driving = new BMap.DrivingRoute(map, { renderOptions: { map: map, panel: "map_result", autoViewport: true }, policy: routePolicy[i] });
        driving.search(p1, p2);
    } else if (searchType == '3') {
        var walking = new BMap.WalkingRoute(map, {
            renderOptions: { map: map, panel: "map_result", autoViewport: true }
        });
        walking.search(p1, p2);
    }
    // 页面元素切换
    G("r-result").style.display = "none";
    G("p-result").style.display = "block";
}

// 返回主图
BaiduMap.comeBack = function() {
    //清除地图上所有覆盖物
    map.clearOverlays();
    // 创建新地图,重新定义中心点
    var point = new BMap.Point(jdData.lng, jdData.lat);
    map.centerAndZoom(point, 15);
    // 创建地图标注(自定义覆盖物)
    customOverLay();
    G("p-result").style.display = "none";
    G("r-result").style.display = "block";
    return jdData;
}

// 初始化周边信息
BaiduMap.localSearch = function(keyword) {
    var pointA = new BMap.Point(jdData.lng, jdData.lat); // 创建点坐标A
    var options = {
        onSearchComplete: function(results) {
            // 判断状态是否正确
            if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                var zbArr = [];
                if (keyword == '2') {
                    // 机场车站不同的解析方式
                    for (var inx in results) {
                        var result = results[inx];
                        for (var i = 0; i < result.getCurrentNumPois(); i++) {
                            if (result.getPoi(i).isAccurate) { // 精准匹配
                                var point = result.getPoi(i).point;
                                var pointB = new BMap.Point(point.lng, point.lat); // 创建点坐标B
                                zbArr.push({
                                    mc: result.getPoi(i).title,
                                    point: point,
                                    jl: ((map.getDistance(pointA, pointB)) / 1000).toFixed(2) // 计算两点间距离
                                });
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < results.getCurrentNumPois(); i++) {
                        var point = results.getPoi(i).point;
                        var pointB = new BMap.Point(point.lng, point.lat); // 创建点坐标B
                        zbArr.push({
                            mc: results.getPoi(i).title,
                            point: point,
                            jl: ((map.getDistance(pointA, pointB)) / 1000).toFixed(2) // 计算两点间距离
                        });
                    }
                }
                if (zbArr.length > 0) {
                    // 按距离排序
                    sortArr(zbArr);
                    // 渲染页面
                    var html = '<table width="100%" class="pro-list-table train-table local-search-tab">';
                    for (var i = 0; i < zbArr.length; i++) {
                        var zbobj = zbArr[i];
                        var bd = zbobj.point.lng + ',' + zbobj.point.lat;
                        html += '<tr onclick="localSearchTrip(\'' + zbobj.mc + '\',\'' + bd + '\')" onmouseenter="hoverintheme(this)" onmouseleave="hoverouttheme(this)"><td width="7%" >' + (i + 1) + '</td><td>' + zbobj.mc + '</td>';
                        var jl = '';
                        if (zbobj.jl < 1) {
                            jl = '直线' + (zbobj.jl * 1000) + 'M';
                        } else {
                            jl = '直线' + zbobj.jl + 'KM';
                        }
                        html += '<td width="38%" align="left" >' + jl + '</td></tr>';
                    }
                    html += '</table>';
                    G("zb_result").innerHTML = html;
                } else {
                    G("zb_result").innerHTML = "暂无数据";
                }
            }
        }
    };
    var local = new BMap.LocalSearch(map, options);
    if (keyword == '3') {
        local.searchNearby("地铁", pointA, 3000); // 搜索周围3公里
    } else if (keyword == '2') {
        local.search(['机场', '火车站']);
    } else {
        local.searchNearby("酒店", pointA, 3000);
    }
}

// 冒泡排序,按照距离由近到远
function sortArr(zbArr) {
    if (zbArr && zbArr.length > 0) {
        for (var i = 0; i < zbArr.length; i++) {
            for (var j = 0; j < zbArr.length - 1 - i; j++) {
                if (parseFloat(zbArr[j].jl) > parseFloat(zbArr[j + 1].jl)) {
                    var temp = zbArr[j];
                    zbArr[j] = zbArr[j + 1];
                    zbArr[j + 1] = temp;
                }
            }
        }
    }
}

// 搜索框绑定搜索事件
BaiduMap.bindSearch = function(inpId, divId) {
    //建立一个自动完成的对象
    var ac = new BMap.Autocomplete({
        "input": inpId,
        "location": map
    });
    //鼠标点击下拉列表后的事件
    ac.addEventListener("onconfirm", function(e) {
        var _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
        setPlace(divId);
    });
}
var myValue;

function setPlace(divId) {
    function myFun() {
        var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
        G(divId).value = pp.lng + "," + pp.lat
    }
    var local = new BMap.LocalSearch(map, { //智能搜索
        onSearchComplete: myFun
    });
    local.search(myValue);
}

function G(id) {
    return document.getElementById(id);
}

// 自定义覆盖物
var customOverLay = function() {
    // 继承API的BMap.Overlay
    SquareOverlay.prototype = new BMap.Overlay();
    // 实现初始化方法
    SquareOverlay.prototype.initialize = function(map) {
            // 保存map对象实例
            this._map = map;
            // 创建div元素，作为自定义覆盖物的容器
            // var div = document.createElement("div");
            var html = "<div class='detail_map_mark'><span class='ico_mark'></span><div class='map_mark_inner'><span class='map_mark_name'>" + jdData.jdzwmc + "</span></div></div>";
            var div = $(html).get(0);
            // 可以根据参数设置元素外观
            div.style.position = "absolute";
            // 将div添加到覆盖物容器中
            map.getPanes().markerPane.appendChild(div);
            // 保存div实例
            this._div = div;
            // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
            // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
            return div;
        }
        // 实现绘制方法
    SquareOverlay.prototype.draw = function() {
            // 根据地理坐标转换为像素坐标，并设置给容器
            var position = this._map.pointToOverlayPixel(this._center);
            this._div.style.left = position.x - this._length / 2 + "px";
            this._div.style.top = position.y - this._length / 2 + "px";
        }
        // 实现显示方法
    SquareOverlay.prototype.show = function() {
            if (this._div) {
                this._div.style.display = "";
            }
        }
        // 实现隐藏方法
    SquareOverlay.prototype.hide = function() {
            if (this._div) {
                this._div.style.display = "none";
            }
        }
        // 添加自定义方法
    SquareOverlay.prototype.toggle = function() {
            if (this._div) {
                if (this._div.style.display == "") {
                    this.hide();
                } else {
                    this.show();
                }
            }
        }
        // 添加自定义覆盖物
    var mySquare = new SquareOverlay(map.getCenter(), 100, "");
    map.addOverlay(mySquare);
}

function SquareOverlay(center, length, color) {
    this._center = center;
    this._length = length;
    this._color = color;
}

var setMapTool = function() {
    var top_left_control = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_TOP_LEFT }); // 左上角，添加比例尺
    var top_left_navigation = new BMap.NavigationControl(); //左上角，添加默认缩放平移控件
    var top_right_navigation = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL });
    map.addControl(top_left_control); // 测距离的
    map.addControl(top_left_navigation); // 左导航默认
    //map.addControl(top_right_navigation);  // 右导航平移与缩放
};
//设置地图事件
var setMapEvent = function() {
    map.enableInertialDragging(); //开启惯性拖拽
    map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
    var optz = { type: BMAP_NAVIGATION_CONTROL_ZOOM }
        //map.addControl(new BMap.NavigationControl(optz));
};

// 初始化数据
function HotelTraffic(lng, lat, jdzwmc) {
    jdData.lng = lng;
    jdData.lat = lat;
    jdData.jdzwmc = jdzwmc;
}