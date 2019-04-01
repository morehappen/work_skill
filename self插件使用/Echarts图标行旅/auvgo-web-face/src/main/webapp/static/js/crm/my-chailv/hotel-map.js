var $location = parent.$('.map-location');
var longtitude = $location.data('longtitude');
var latitude = $location.data('latitude');
var map = new BMap.Map('map-container', {minZoom: 4, maxZoom: 18});          // 创建地图实例  
map.addControl(new BMap.NavigationControl());    
map.addControl(new BMap.ScaleControl());    
map.addControl(new BMap.OverviewMapControl());    
//map.addControl(new BMap.MapTypeControl()); 	  //地图||卫星||三维
map.enableScrollWheelZoom();					  //启用鼠标滚轮
var point = new BMap.Point(longtitude, latitude); // 创建点坐标

var markerOpts = {
		icon: new BMap.Icon('/static/img/common/location.png', new BMap.Size(26, 38), {}),
		shadow: new BMap.Icon('/static/img/common/location.png', new BMap.Size(26, 38), {}),
		raiseOnDrag: true,		//拖拽标注时，标注是否开启离开地图表面效果	
//		enableClicking: false,  //禁止鼠标单击事件
		title: $location.data('location') || '--'
};

var marker = new BMap.Marker(point, markerOpts);
map.addOverlay(marker);

// 支持marker拖动
//marker.enableDragging();    
marker.addEventListener("dragend", function(e){
	//console.log("当前位置：" + e.point.lng + ", " + e.point.lat);
	$baiduLon.val(e.point.lng);
	parent.$('#baiduLon').html(e.point.lng);
	$baiduLat.val(e.point.lat);
	parent.$('#baiduLat').html(e.point.lat); 
});

marker.addEventListener("rightclick", function(e){
	var inforOpts = {    
			 width : 250,     // 信息窗口宽度    
			 height: 60,     // 信息窗口高度    
//			 title : '酒店介绍'  // 信息窗口标题   
			};
	var str = 
			'<div>' +
				'<h5>' + $location.data('name') + '</h5>' +
				'<div>' + ($location.data('location') || '--') + '</div>' +
			'</div>';
	var infoWindow = new BMap.InfoWindow(str, inforOpts);  // 创建信息窗口对象    
	map.openInfoWindow(infoWindow, map.getCenter());      // 打开信息窗口

});

map.centerAndZoom(point, 15);                     // 初始化地图，设置中心点坐标和地图级别  