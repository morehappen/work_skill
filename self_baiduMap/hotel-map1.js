var BaiduMap = {}, opts = {};
var markList = [];//mark信息集合
var geoc ;//得到地图上经纬度以及地理坐标
var map ;

//初始化map对象
//divId:百度地图放置div
BaiduMap.initMap = function(divId){
    map = new BMap.Map(divId,{minZoom:8,enableMapClick: false});//在百度地图容器中创建一个地图
    // setMapEvent();//创建和初始化地图 设置地图事件
    // setMapTool();
};

//设置地图事件
var setMapEvent = function(){
    map.enableInertialDragging();//开启惯性拖拽
    map.enableScrollWheelZoom();//启用地图滚轮放大缩小
    var optz = {type: BMAP_NAVIGATION_CONTROL_ZOOM}
    //map.addControl(new BMap.NavigationControl(optz));
};

var setMapTool=function(){
    var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
    var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
    var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
    map.addControl(top_left_control);      // 测距离的
    map.addControl(top_left_navigation);   // 左导航默认
    //map.addControl(top_right_navigation);  // 右导航平移与缩放
};