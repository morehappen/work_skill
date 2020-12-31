/**
 * 酒店地图
 * @author pengwenlong
 */
;(function(w,$,unknown){

    var BaiduMap = {}, opts = {};
    var markList = [];//mark信息集合
    var geoc ;//得到地图上经纬度以及地理坐标
    var map ;


    //初始化map对象
    //divId:百度地图放置div
    BaiduMap.initMap = function(divId){
        // MapOptions,此类表示Map构造函数的可选参数。它没有构造函数，但可通过对象字面量形式表示。
        // minZoom:地图允许展示的最小级别,enableMapClick:是否开启底图可点功能，默认启用

        map = new BMap.Map(divId,{minZoom:8,enableMapClick: false});//在百度地图容器中创建一个地图
        setMapEvent();//创建和初始化地图 设置地图事件
        setMapTool();
    };

    //初始化map对象
    //divId:百度地图放置div
    //详情页面使用用的是一块小地图,去工具条,放大缩小
    BaiduMap.initMapDetail = function(divId){
        map = new BMap.Map(divId,{minZoom:16,enableMapClick: false});//在百度地图容器中创建一个地图
        map.disableDragging();// 禁止拖拽
    };

    //str：mark字符串信息 @{}@{}@{}@{}...
    //options={}  参考defaults
    //传入mark字符串信息，解析成mark对象
    BaiduMap.createMap = function(options){
        //alert(obj.toJSONString( options));
        options = options || {};
        opts = $.extend(defaults, options);
        markList = BaiduMap.createMarkList(opts.markListBoxId);//mark信息集合清空
        map.clearOverlays();//清空所有地图上覆盖物
        if(markList.length > 0){
            var point = new BMap.Point(markList[0].lon, markList[0].lat);
            map.centerAndZoom(point,15);
            var data_info = [];
            for(var i=0; i<markList.length; i++){
                data_info[i] = new BMap.Point(markList[i].lon, markList[i].lat);
                if(i==0){
                    var markerIcon = new BMap.Icon("/static/fcc/hotel/images/search/marker_blue_sprite1.png", new BMap.Size(19,25));
                }else{
                    if(i<20){
                        var markerIcon = new BMap.Icon("/static/fcc/hotel/images/search/marker_red_sprite"+markList[i].index+".png", new BMap.Size(19,25));
                    }else{
                        var markerIcon = new BMap.Icon("/static/fcc/hotel/images/search/marker_red_sprite_more.png", new BMap.Size(19,25));
                    }
                }
                var marker = new BMap.Marker(data_info[i],{icon:markerIcon});
                var label = new BMap.Label();
                label.setContent("index="+markList[i].index);//将marker的index放入标注中
                label.setStyle({display:"none"});
                label.enableMassClear();//允许label在map.clearOverlays方法中被清除
                marker.setLabel(label);
                marker.setTitle(markList[i].hotelName);
                marker.enableMassClear();//允许marker在map.clearOverlays方法中被清除
                map.addOverlay(marker);//将标注添加到地图中
                var content = {"Address":markList[i].address,"Img":markList[i].img,"HotelName":markList[i].hotelName,"HotelId":markList[i].hotelId
                    ,"szcs":markList[i].szcs,"jdpp":markList[i].jdpp,"xj":markList[i].xj,"lon":markList[i].lon,"lat":markList[i].lat,"hotelType":markList[i].hotelType
                    ,"pt":markList[i].pt,"xyid":markList[i].xyid,"xyh":markList[i].xyh,"jdzdj":markList[i].jdzdj};
                addEventHandler(content, marker,point);
                marker.closeInfoWindow();
            }
            map.setViewport(data_info);//将marker聚合到视野内
        }else{
            var jd = $("#jd").val();
            var wd = $("#wd").val();
            var jdzy = $("#jdzy").val();
            var jddz = $("#jddz").val();
            var jdzwmc = $("#jdzwmc").val();
            var jdid = $("#jdid").val();
            if(jd&&wd) {
                var data_info = new BMap.Point(jd, wd);
                var markerIcon = new BMap.Icon("/static/fcc/hotel/images/search/marker_red_sprite.png", new BMap.Size(19, 25));
                var marker = new BMap.Marker(data_info, {icon: markerIcon});
                map.centerAndZoom(data_info, 15);
                marker.setTitle(jdzwmc);
                map.addOverlay(marker);//将标注添加到地图中
                var dz = "";
                for (var i = 0; i < jddz.length; i++) {
                    dz = dz + jddz[i];
                    if (i % 10 == 9) {
                        dz = dz + "</br>"
                    }
                }
                var content = {"Address": dz, "Img": jdzy, "HotelName": jdzwmc, "HotelId": jdid};
                addEventHandler(content, marker);
                map.setViewport(data_info);//将marker聚合到视野内
            }
        }
    };

    centerMe = function(btn){
        var markList = [];
        var str = $(btn).closest('#hotelDetailDiv').find('input[name="markList"]').val();
        if( str != "" ){
            var arr = str.substring(1).split("@");
            for(var i=0; i<arr.length; i++){
                var mark = _toJSON(arr[i]);
                markList.push(mark);
            }
        }
        if(markList.length>0){
            var point = new BMap.Point(markList[0].lon, markList[0].lat);
            var data_info = [];
            map.centerAndZoom(point, 15);
            map.clearOverlays();
            for(var i=0; i<markList.length; i++){
                data_info[i] = new BMap.Point(markList[i].lon, markList[i].lat);
                //var markerIcon = new BMap.Icon("/static/hotel/images/search/marker_red_sprite_more.png", new BMap.Size(19,25));
                var marker = new BMap.Marker(data_info[i]/*,{icon:markerIcon}*/);
                var label = new BMap.Label();
                label.setContent("index="+markList[i].index);//将marker的index放入标注中
                label.setStyle({display:"none"});
                label.enableMassClear();//允许label在map.clearOverlays方法中被清除
                marker.setLabel(label);
                marker.setTitle(markList[i].hotelName);
                marker.enableMassClear();//允许marker在map.clearOverlays方法中被清除
                map.addOverlay(marker);//将标注添加到地图中
                var content = {"Address":markList[i].address,"Img":markList[i].img,"HotelName":markList[i].hotelName,"HotelId":markList[i].hotelId
                    ,"szcs":markList[i].szcs,"jdpp":markList[i].jdpp,"xj":markList[i].xj,"lon":markList[i].lon,"lat":markList[i].lat,"hotelType":markList[i].hotelType
                    ,"pt":markList[i].pt,"xyid":markList[i].xyid,"xyh":markList[i].xyh,"jdzdj":markList[i].jdzdj};
                addEventHandler(content, marker,point);
                marker.closeInfoWindow();
                var event = {type:"click",target: marker};
                marker.dispatchEvent('click',event);
            }

        }
    };

    //从隐藏div中获取mark信息
    BaiduMap.createMarkList = function(markListBoxId){
        var markLists = [];
        var markListBoxStr = $("#"+markListBoxId).html();
        var str = $.trim(markListBoxStr);
        if( str != "" ){
            var arr = markListBoxStr.substring(1).split("@");
            for(var i=0; i<arr.length; i++){
                var mark = _toJSON(arr[i]);
                markLists.push(mark);
            }
        }
        return markLists;
    };

    //地图中心点移动到该位置
    BaiduMap.moveMap = function(obj){
        var point = new BMap.Point(obj.lon,obj.lat);
        map.panTo(point);
        point = getPointByIndex(obj.index);
        mouseOneToMarker(point);
    };

    //点击上一页、下一页后，回调更新地图
    BaiduMap.refresh = function(options){
        //点击翻页后，map对象不一定会存在
        trydo(function(){
            BaiduMap.createMap(options);
        }, 10, 1000);
    };
    //设置地图事件
    BaiduMap.setEvent = function(options){
        var optz = $.extend({scrollWheelZoom:true,keyboard:true}, options);
        optz.scrollWheelZoom ? map.enableScrollWheelZoom() : map.disableScrollWheelZoom();//启用/关闭 地图滚轮放大缩小
        optz.keyboard ? map.enableKeyboard() : map.disableKeyboard();//启用/关闭 键盘上下左右键移动地图
    };

    //点击地图搜索
    BaiduMap.searched = function(options){
        var optz = $.extend({open:false,callback:noop}, options);
        if(optz.open){//开启
            opts.searchCallback = optz.callback;//点击地图搜索，回调函数
            map.setDefaultCursor("crosshair");//鼠标变成十字
            geoc = geoc || new BMap.Geocoder();//点击地图获得经纬度
            map.addEventListener("click", clickMap);//添加点击地图搜索
        }else{
            opts.searchCallback = noop;
            map.setDefaultCursor("pointer");//鼠标变成小手
            map.removeEventListener("click", clickMap);//移除点击事件
        }
    };

    //判断地图对象是否存在
    BaiduMap.mapExist = function(){
        return map!=null;
    };

    //尝试执行方法
    //fun 方法
    //count 尝试次数，默认为1
    //time 失败后延迟毫秒后，再次执行，默认为1000
    var trydo = function(fun, count, time){
        count = count || 1;
        time = time || 1000;
        var _do = function(){
            try{
                if(count >0){
                    fun();
                }
            }catch(e){
                count--;
                setTimeout(_do,time );
                // console.log(e);
            }
        };
        _do();
    };

    var setMapTool=function(){
        var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
        var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
        var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
        map.addControl(top_left_control);      // 测距离的
        map.addControl(top_left_navigation);   // 左导航默认
        //map.addControl(top_right_navigation);  // 右导航平移与缩放
    };
    //设置地图事件
    var setMapEvent = function(){
        map.enableInertialDragging();//开启惯性拖拽【意思是地图不会立即停止】
        map.enableScrollWheelZoom();//启用地图滚轮放大缩小
        var optz = {type: BMAP_NAVIGATION_CONTROL_ZOOM}
        //map.addControl(new BMap.NavigationControl(optz));
    };

    //marker上添加事件
    var addEventHandler = function(content,marker,point){
        marker.addEventListener("click",function(e){
            openInfo(content,point,marker);
        });
        marker.addEventListener("mouseover",function(e){
            mouseOverToMarker(marker);//鼠标移上跳动的动画
        });
        marker.addEventListener("mouseout",function(e){
            mouseOutToMarker(marker);//鼠标移开移除跳动动画
        });
    };

    //鼠标移上跳动的动画
    function mouseOverToMarker(marker){
        marker.setAnimation(BMAP_ANIMATION_BOUNCE);
    }
    //鼠标移开移除跳动动画
    function mouseOutToMarker(marker){
        marker.setAnimation(null);
    }
    function mouseOneToMarker(marker){
        marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        marker.setAnimation(null);
    }
    var noop = function(data){};

    //绑定 点击地图搜索事件
    var clickMap = function(e){
        var point = e.point;
        geoc.getLocation(point, function(rs){
            var addComp = rs.addressComponents;
            if(addComp){
                var poi = point.lat+","+point.lng+","+addComp.street;//poi坐标
                opts.searchCallback(poi);//点击地图搜索，回调函数
            }
        });
    };
    //打开信息窗口
    function openInfo(content,point,marker){
        var style = {width:300,height:160,enableMessage:false};
        var opts=createMsg(content);//打开信息窗口
        var infoWindow = new BMap.InfoWindow(opts,style);  // 创建信息窗口对象
        marker.openInfoWindow(infoWindow,point); //开启信息窗口
        setTimeout(function(){
            $("#openMyWin"+content.HotelId).click(function(){
                toSearchRoomPrcie(content);
            });
        },50);
    }
    //创建点击mark后显示的文本
    var createMsg=function(content){
        var html=[];
        html.push("<a href='javascript:void(0)' id='openMyWin"+content.HotelId+"'><h4 style='margin:0 0 5px 0;padding:0.2em 0'>"+content.HotelName+"</h4></a>");
        html.push("<img style='float:right;margin:4px' src='"+content.Img+"' width='124' height='108' title='"+content.HotelName+"'/>");
        html.push("<p style='margin:0;line-height:1.5;font-size:13px;'>"+content.Address+"</p>");
        return html.join("");
    };
    function toSearchRoomPrcie(content){
        if(content.pt=='b2g'){
            hotelDetail(content.HotelId,content.xj,content.jdpp,content.szcs,content.lon,content.lat,content.hotelType,content.jdzdj);
        }else if(content.pt=='sps'){
            hotelDetail(content.HotelId,content.xj,content.jdpp,content.szcs,content.lon,content.lat,content.hotelType,content.jdzdj);
        }else if(content.pt=='asms'){
            searchRoomPrcie(null,content.HotelId,content.szcs,content.jdpp,content.xj,content.lon,content.lat,content.hotelType);
        }else if(content.pt=='asms_zb'||content.pt=='b2g_zb'||content.pt=='sps_zb'){
            hotelDetail(content.HotelId,content.szcs,content.jdpp,content.xj,content.lon,content.lat,content.hotelType,content.jdzdj);
        }
    }

    //根据div上的index值，获取地图上的marker
    var getPointByIndex = function(index){
        var id = "index="+index;
        var allOverlay = map.getOverlays();
        for (var i = 0; i < allOverlay.length; i++){
            if(allOverlay[i].getLabel().content == id){
                return allOverlay[i];
            }
        }
        return null;
    };

    //字符串转json
    var _toJSON = function(str){
        return !!str ? eval("("+str+")") : {};
    };

    var defaults = {
        baiduMap : "baiduMap",//地图容器divid
        cityNameId : "city",//城市名称文本框id
        markListBoxId : "markListBox"//mark信息divid
    };

    w["_BaiduMap"] = BaiduMap;

})(window,jQuery);
