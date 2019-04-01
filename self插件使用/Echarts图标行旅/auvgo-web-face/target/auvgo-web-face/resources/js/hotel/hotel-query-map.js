/**
 * Created by dell on 2018/4/8.
 */
$(function(){
	
	
	//百度地图的显隐
	// var btn = $('#hotel-list .baidu-btn');
	$('body #hotel-list ').on("click",'.baidu-btn',function(){
		// console.log($(this))
		//获取当前父元素    id   进行拼接
		var allmapBox = $(this).parents('.every-cell').children('.allmap-box')
		allmapBox.toggle();
		var detail = allmapBox.parent().attr('data');
		var allmap = '<div  class="allmap" id="allmap'+detail+'"></div>';
		
		allmapBox.html(allmap);
		var id = "allmap"+detail;
		var baidulat = allmapBox.parent().attr("baidulat");
		var baidulon = allmapBox.parent().attr("baidulon");
		var price =  allmapBox.parent().attr("price");
		// console.log(price)
		if(allmapBox.css("display")=="block"){
			$("#allmap"+detail).height("100%");
			introduceMap(id,baidulat,baidulon,detail,price);
		}else{
			// console.log("lll")
			return
		}
		
	});

//引入百度地图

	
});
function introduceMap(id,lat,lon,data,price){
	// console.log(id)
	var map = new BMap.Map(id);          // 创建地图实例
	map.addControl(new BMap.NavigationControl());
	map.addControl(new BMap.ScaleControl());
	map.addControl(new BMap.OverviewMapControl());
	map.enableScrollWheelZoom(); //滚轮放大
	var $mapContainer = $(id);
	var point = new BMap.Point(lon,lat);        // 创建点坐标
	// function ls(clity) {
	// 	var clity = clity?clity:"北京"
	// 	return map.centerAndZoom(clity,11);
	//
	// };
	map.centerAndZoom(point, 15);

// 点击显示自定义窗口
	function addInfoWindow(map, point, htmlStr,links) {
		var markerOpts = {
			icon: new BMap.Icon('../../resources/images/common/baidu-location.png', new BMap.Size(32, 32), {})
		};
		var marker = new BMap.Marker(point, markerOpts);
		map.addOverlay(marker);
		
		var infoWindowOpts = {
			width: 350,
			height: 170
		};
		var infoWindow = new BMap.InfoWindow(htmlStr, infoWindowOpts);  // 创建信息窗口对象
		// console.log(marker,"sssss");
		if(links){
			marker.setAnimation(BMAP_ANIMATION_BOUNCE);//跳动的动画
			return ;
		};
		// marker.setAnimation(BMAP_ANIMATION_BOUNCE);//跳动的动画
		marker.addEventListener('click', function () {
			// console.log(this.parentNode)
			this.openInfoWindow(infoWindow);
		});
	};
	/************/
	// var hotelOrign = [{"hotelId":"91244534","hotelName":"飘HOME连锁酒店(北京建国门店)","thumbnailUrl":"http://pavo.elongstatic.com/i/Hotel120_120/0004l51U.jpg","lowRate":198,"currencyFlag":"￥","cityId":"0101","cityName":"北京","districtName":"朝阳区","businessZoneName":"建国门","reviewCount":1656,"starRateName":"经济型","score":"好评率90%","scoreDes":"","distance":0,"type":"elong","tags":[],"arrivalDate":null,"departureDate":null,"intervalDay":null,"address":"建国门外大街16号东方瑞景3号楼(近赛特购物中心南侧),近地铁建国门站","traffic":null,"latitude":"39.905656","longitude":"116.442561","hotelImageList":[],"phone":"010-59877388","roomList":[],"review":null,"facilities":"1,15,16"}]
	hotelAjax(price)
	function hotelAjax(price){
		var hotelOrign ={};
		var url = '/hotel/detial/'+data+'.json';
		$.ajax({
			url:url,
			type:'get',
			success: function(data){
				// console.log(data)
				hotelOrign=data.hotel;
				// console.log(price,"cccc")
				hotelOrig(hotelOrign,price)
			}
		});
	};
	
	function hotelOrig(hotelOrign,aPrice){
		// console.log(price,"aaaa")
		var ls;
		if(hotelOrign.category==5){
			ls = '豪华型';
		}else if(hotelOrign.category==4){
			ls = '高档型';
		}else if(hotelOrign.category==3){
			ls = '舒适型';
		}else{
			ls = '经济型';
		};
		var point = new BMap.Point(hotelOrign.longitude, hotelOrign.latitude);
		// console.log(hotelOrign);
		var htmlstr =  '<div class="bmap-wraper">' +
			'<div class="bmap-title font-size-16">' + hotelOrign.nameCn + '</div>' +
			'<div class="bmap-line"></div>' +
			'<div class="bmap-content font-size-12 clear">' +
			'<div class="float-left bmap-img">' +
			'<img src="' + hotelOrign.coverImage +'" />' +
			'</div>' +
			'<div class="float-left bmap-desc color-666">' +
			'<div>' +ls + '</div>' +
			'<div class="bmap-address" title="' + hotelOrign.addressCn + '">' + hotelOrign.addressCn + '</div>' +
			'<div class="bmap-line"></div>' +
			'<div class="clear">' +
			'<div class="low-price float-left">' +
			'<span class="color-D44A9F">￥</span>' +
			'<span class=" font-size-18 color-D44A9F font-600">' + aPrice+ '</span>' +
			'<span class="color-999">起</span>' +
			'</div>' +
			'<div class="float-right">' +
			'<button type="button" class="btn btn-default-new btn-big go-detail" onclick="bmapClick(this);" data-id="' + hotelOrign.hotelNo + '" data-name="' + hotelOrign.addressCn + '" >查看</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>';
		addInfoWindow(map,point,htmlstr);
	};
};


function bmapClick(_this){
	var data= new Date();
	var id = _this.getAttribute("data-id");
	location.href= '/hotel/detial/'+id+'?checkIn='+$('#checkIn').val()+'&checkOut='+$('#checkOut').val();
};