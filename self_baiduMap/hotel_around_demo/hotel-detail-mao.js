



var cpsAccount = new Array();
define(function(require, exports, module){
    require("moment");
    require("md5");
    require("store");
    //弹出层
    var velayer=new VeLayer();
    var hotelMap = require("/static/fcc/hotel/common/hotel-traffic");
    // 商圈控件
    var hotel = require("modules/hotel");
    hotel.initJdrmsq();
    var hotelDetail={};
    var catchKey="";
    var sqdXcList=[];
    var sqdxq={};
    window.searchHotelDetail = searchHotelDetail;
    function searchHotelDetail(){
        var url="/hotel-search/fcc/hotel/hotellist/searchHotelDetail";
        var jdid = $("#jdid").val();
        var data = {"jdid":jdid};
        $.ajax({
            type:'post',
            url: url,
            data: JSON.stringify(data),
            dataType:"json",
            contentType:"application/json",
            success: function (res) {
                if (res.result.status == 0) {
                    if(res.result && res.result.hotel){
                        hotelDetail=res.result.hotel;
                        initTemp(res);
                        getMinPrice();
                    }else {
                        // console.log(res.result.info);
                    }
                } else {
                    // velayer.alert("查询酒店详情失败！");
                    velayer.alert($.errorCodeHandle("HOTEL_0910",[]));
                }
            }
        });
        // console.log("searchHotelDetail")
    }

    /**
     * 加载轮播图控件
     * @type {initPri}
     */
    window.initPri = initPri;
    function initPri(){
        var url="/hotel-search/fcc/hotel/hotellist/searchHotelImages";
        var jdid = $("#jdid").val();
        var data = {"jdid":jdid};
        $.ajax({
            type:'post',
            url: url,
            data: JSON.stringify(data),
            dataType:"json",
            contentType:"application/json",
            success: function (res) {
                if (res.success) {
                    //初始化图片控件
                    hotel.initHotelDetailSlider();
                    $("#detailSlider").hotelDetailSlider({
                        ptlx: 'fcc',
                        // type: '2', // 数据来源。 默认为2， 此时需要传入typeValue<获取图片的服务。>  当type传1时， typeValue需要传入json数据
                        // typeValue: '/xxx/xxx/getHotel',
                        type: '1', // 数据来源。 默认为2， 此时需要传入typeValue<获取图片的服务。>  当type传1时， typeValue需要传入json数据
                        typeValue: res.result,
                        bigImg:{w:400,h:302},
                        smallImg:{w:400,h:302},
                        iMargin:6, // 小图片的间隔。
                        autoPlay: false, //是否自动播放
                        defer: 2000, // 间隔时间
                        smallNum: {
                            cross:2, //小的轮播图每排显示两个
                            vertical:2 //小的轮播图没列显示两个
                        },
                        showGroup: true,
                        isHaveLayer: true//是否有弹出层
                    });
                } else {
                    // velayer.alert("查询酒店图片失败！");
                    velayer.alert($.errorCodeHandle("HOTEL_0911",[]));
                }
            }
        });
        // console.log("initPri")
    }

    /**
     * 初始化酒店列表模板
     * @type {initListTemp}
     */
    window.initTemp = initTemp;
    function initTemp(res){
        var data = res.result;
        // console.log(data);
        //分开渲染酒店数据
        /**
         *  1.namePriceTemp   酒店头部详情
         *  2.hotelInfoTemp   酒店信息
         *  3.hotelPolicyTemp 酒店政策
         *  4.hotelServerTemp 设施服务
         *  5.topCommentTemp 点评头部信息
         *  6.downCommentTemp 点评底部信息
         */
        initPriceTemp(data);
        initHotelDetail2(data);
        initHotelInfoTemp(data);
        initHotelPolicyTemp(data);
        initHotelServerTemp(data);
        initTopCommentTemp(data);
        initDownCommentTemp(data);
        initHotelNone(data);
        //加载百度地图
        loadBaiduMap();
        // 位置交通
        initHotelTraffic(data);
        //初始化锚点定位选中样式
        // initTabs();
    }

    // window.initTabs = initTabs;
    // function initTabs(){
    //     $(".tabs").find("li").each(function (i,n) {
    //         $(n).on("click",function () {
    //             $(".tabs").find("li").each(function (n,j) {
    //                 //去掉全部的atta
    //                 $(j).removeClass("active");
    //                 $(this).removeClass("theme_bd_bottom");
    //                 $(j).find("a").removeClass("theme");
    //             })
    //             $(this).addClass("active");
    //             $(this).addClass("theme_bd_bottom");
    //             $(this).find("a").addClass("theme")
    //         })
    //     })
    // }

    window.initHotelDetail2 = initHotelDetail2;
    function initHotelDetail2(data){
        if(data) {
            if(data.hotel && $("#zdj").val()){data.hotel.zdj = $("#zdj").val()};

            var tpl = $("#hotelDetail2Temp").html();
            laytpl(tpl).render(data, function (html) {
                $("#hotelDetail2").html(html);
            });
        }else {

        }
    }
    window.initPriceTemp = initPriceTemp;
    function initPriceTemp(data){
        if(data) {
            if(data.hotel && $("#zdj").val()){data.hotel.zdj = $("#zdj").val()};
            var tpl = $("#namePriceTemp").html();
            laytpl(tpl).render(data, function (html) {
                $("#namePrice").html(html);
            });
        }else {

        }
    }
    window.initHotelInfoTemp = initHotelInfoTemp;
    function initHotelInfoTemp(data){
        if(data) {
            var tpl = $("#hotelInfoTemp").html();
            laytpl(tpl).render(data, function (html) {
                $("#hotelInfo").html(html);
            });
        }else {

        }

    }
    window.initHotelPolicyTemp = initHotelPolicyTemp;
    function initHotelPolicyTemp(data){
        if(data) {
            var tpl = $("#hotelPolicyTemp").html();
            laytpl(tpl).render(data, function (html) {
                $("#hotelPolicy").html(html);
            });
        }else {

        }
    }
    window.initHotelNone = initHotelNone;
    function initHotelNone(data){
        if(data) {
            var tpl = $("#HotelNone").html();
            laytpl(tpl).render(data, function (html) {
                $("#hotel_nav").html(html);
            });
        }else {

        }
    }
    window.initHotelServerTemp = initHotelServerTemp;
    function initHotelServerTemp(data){
        if(data) {
            var tpl = $("#hotelServerTemp").html();
            laytpl(tpl).render(data, function (html) {
                $("#hotelServer").html(html);
            });
        }else {

        }
    }
    window.initTopCommentTemp = initTopCommentTemp;
    function initTopCommentTemp(data){
        //if(data) {
        //    var tpl = $("#topCommentTemp").html();
        //    laytpl(tpl).render(data, function (html) {
        //        $("#topComment").html(html);
        //    });
        //}else {
        //
        //}
    }
    window.initDownCommentTemp = initDownCommentTemp;
    function initDownCommentTemp(data){
        getDpData();
    }
    /**
     * 初始化酒店的供应商集合
     * @type {searchGys}
     */

    var gksz = "";
    window.initGksz = initGksz;
    function initGksz(){
        //查询个控数据
        var url = "/hotel/fcc/hotel/hotelbook/getGksz";
        $.ajax({
            type: 'get',
            url: url,
            cache: false,
            async: false,
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            success: function (data) {
                //差旅服务返回参数
                if(data.result){
                    gksz = data.result;
                }
                sqdDetail();
            }
        });
        // console.log("initGksz")
    }

    /**
     * 初始化价格计划
     * @type {searchFxjgjh}
     */
    var reqNum = 30;//设置请求次数 如果超过请求次数，那么放弃请求
    window.searchFxjgjh = searchFxjgjh;
    function searchFxjgjh(){
        initUUID();
        // 获取入住时间 和 离店时间
        var rzrq = $("#rzrq").val();
        var ldrq = $("#jsrq").val();
        // var spdh_data = $("input[name='spdh_data']").val();
        // var cxridsJson = $("input[name='cxridsJson']").val();
        if (rzrq == '' || ldrq == '') {
            // velayer.alert("入住日期或离店日期不能为空.");
            velayer.alert($.errorCodeHandle("HOTEL_1502",[]));
            return;
        }
        if (rzrq == ldrq) {
            // velayer.alert("入住和离店日期不允许同一天");
            velayer.alert($.errorCodeHandle("HOTEL_0120",[]));
            return;
        }
        var day = DateDiff(ldrq, rzrq);
        if (day > 30) {
            // velayer.alert("预订30天以上请联系客服人员，我们将竭诚为您服务！");
            velayer.alert($.errorCodeHandle("HOTEL_0121",[]));
            $("#jsrq").val(getDateOfDayCount(rzrq, 28));
            $("#ldrqPage").val(getDateOfDayCount(rzrq, 28));
        }

        var param = {
            jdid: $("#jdid").val(),
            sqlx: $("#sqlx").val(),
            rzrq: $("#rzrq").val(),
            ldrq: $("#jsrq").val(),
            szcs: $("#szcs").val(),
            cxrids: $("#cxrids").val(),
            cxrbmids:$("#cxrbmids").val(),
            spdh: $("#ccsqdh").val(),
            hotelType: $("#hotelType").val(),
            xyid: $("#xyid").val(),
            xyh: $("#xyh").val(),
            ygys : $("#ygys").val(),
            // conditionZflx: $("#conditionZflx").val(),
            // conditionFplx: $("#conditionFplx").val(),
            // pfdata: $("#pfdata").val(),
            // spdh_data: spdh_data,
            // cxridsJson: cxridsJson,
            jdzdj: $("#zdj").val(),
            xzq: $("#xzq").val(),
            sfxy: $("#sfxy").val(),
            conditionFplx: $("#jdfp").val()
        };
        // 计算间夜数
        var days = DateDiff(param.rzrq, param.ldrq);
        $("#book_jys").html(days);

        param.sfxqq = "0";
        catchKey= md5(param.jdid + param.rzrq + param.ldrq + param.ygys + param.cxrids);
        param.catchKey=catchKey;
        param.uuidKey =  $("#uuid").val();
        initNoDataLoading();
        reqNum = 30;
        loadJgjh(param);
        //定时执行正在加载中的代码
        initDatalanding();


        // console.log("searchFxjgjh")
    }

    /**
     * 异步查询价格计划
     * @type {loadJgjh}
     */
    window.loadJgjh = loadJgjh;
    function loadJgjh(param) {
        var url = "/hotel/fcc/hotel/hotelbook/getHotelFxjgjhList";
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(param),
            contentType:"application/json",
            success: function (data) {
                reqNum--;
                // console.log(data)
                var firstQeq = param;//前端请求参数
                //渲染模板
                initFxJgjh(data.result);
                updateHotelMinPrice();//更新房型和酒店的最低价
                // data.result.tffxJson && renderTffx(data.result.tffxJson);//短租房型数据渲染
                // updateZflxCheck();//支付类型处理
                hideJgjh();//隐藏同一个房型下面的多个价格计划
                // velayer.close();
                if ((data.result && data.result.sfwc) || reqNum <= 0) {//cps调用完成  会返回是否完成  达到请求次数上限
                    stopRunTimer();
                    getMinPrice();//结束查询 更新最低价
                    return;
                } else {
                    //sfwc 和 version 已经在后台赋值
                    firstQeq.sfxqq = "1";//企业差旅0全新请求 1异步加载的请求还未结束
                    firstQeq.version = data.result.version;
                    setTimeout(function (){
                        loadJgjh(firstQeq)
                    },1000);
                }
            }
        });
    }
    /**
     * 加载价格计划模板数据
     */
    window.initFxJgjh = initFxJgjh;
    function initFxJgjh(fxjgjh){
        //整合map的数据
        var fxs = {};
        fxs.fxjgjhList = new Array();
        var fxmap = {};
        if(fxjgjh){
            if(fxjgjh.fxreq && !fxs.fxreq){
                fxs.fxreq = fxjgjh.fxreq;
            }
            if(fxjgjh.fxlb && fxjgjh.fxlb.length > 0){
                for(var i = 0; i < fxjgjh.fxlb.length ; i ++){
                    var fxjgjhobj = fxjgjh.fxlb[i];
                    if(fxmap[fxjgjhobj.fxmc]){
                        fxmap[fxjgjhobj.fxmc].jgjhlb.push.apply(fxmap[fxjgjhobj.fxmc].jgjhlb,fxjgjhobj.jgjhlb);
                    }else {
                        fxmap[fxjgjhobj.fxmc] = fxjgjhobj;
                    }
                }
            }
        }
        if(fxmap){
            for(fxobj in fxmap){
                fxs.fxjgjhList.push(fxmap[fxobj]);
            }
        }
        if(fxs.fxjgjhList.length <= 0){
            return;
        }
        //房型数据排序
        // sortjgjh(fxs);  排序逻辑拿到了 后台 不在前端处理
        var data = fxs;
        data.payment = $("#payment").val();
        data.gkszVO = fxjgjh.gkszVO;
        //data 是 fxjgjh 转换  来的数据
        var getTpl = $("#roomULTemp").html();
        laytpl(getTpl).render(data, function (html) {
            $("#roomUL").html(html);
        });
        initJgjhLoading();//单个房型进度条房型
    }
    /**
     * 去掉小数点
     */
    laytpl.formatNumber = function (jg) {
        if(jg){
            return Number(jg)
        }else {
            return jg;
        }
    }
    /**
     * 床型名称转换 方便头部窗型筛选
     * @param cx
     */
    laytpl.getcxmc = function(cx){
        if(cx){
            var cxs = new Array();
            for(var i = 0; i < cx.length; i ++){
                cxs.push(cx.substring(i,i+1));
            }
            var dc = 0;
            var sc = 0;
            for(var i = 0; i < cxs.length; i ++){
                if(cxs[i] == "大"){
                    dc++;
                }
                if(cxs[i] == "床"){
                    dc++;
                }
                if(cxs[i] == "双"){
                    sc++;
                }
                if(cxs[i] == "床"){
                    sc++;
                }
            }
            if(dc >= 2){
                return "大床"
            }else if(sc >=2){
                return "双床";
            }else {
                return "其他";
            }
        }else {
            return "其他";
        }
    }
    /**
     * 计算两天日期差
     * @param ldrq 入住日期
     * @param rzrq 离店日期
     */
    laytpl.getTwoDay = function(endDate,startDate){
        //
        var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();
        var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
        var dates = Math.abs((startTime - endTime))/(1000*60*60*24);
        return  dates;
    }

    window.ydxd = ydxd;

    /**
     * 预订
     */
    function ydxd(obj,zflx) {
        //如果是生清单跳转的话，不去预订页面
        if($("#ifsqd").val() && $("#ifsqd").val() == '1'){
            var md5Summary=$(obj).attr("md5Summary");
            var $submitForm = $("#bookForm"+md5Summary);
            // var data = setSqdParam(obj);
            var obj = new Object();
            obj.jtgj = '2';
            obj.szcs = $("#szcs").val();
            obj.szcsmc = $("#city").val();
            obj.rzrq = $("#rzrq").val();
            obj.ldrq = $("#jsrq").val();
            obj.hotelName = $("#jdzwmc").val();
            obj.hotelId = $("#jdid").val();
            obj.roomName = $submitForm.find("input[name='fxid']").val();
            obj.roomId = $submitForm.find("input[name='fxmc']").val();
            obj.srje = $submitForm.find("input[name='srfj']").val();;
            obj.sfwb = $submitForm.find("input[name='sfwb']").val();
            obj.cgly = $submitForm.find("input[name='cgly']").val();
            // obj.wbnr = wbnr;
            window.opener.hotel_ccsqd(obj);
            window.close();
            return;
        }
        if(sqdxq.limit15ry&&sqdxq.gt15days=='1'){
            velayer.alert("由于您是长期集团内出差，不可以在线申请宿舍客房和预定酒店，请线下联系报销地宿舍担当申请入住宿舍     宿舍担当："+sqdxq.ssddms);
            return;
        }
        var ygys = $("#ygys").val();
        var yxapssry=$("#yxapssry").val();
        var xddm=$("#xddm").val();
        //存在需要优先安排宿舍的人员 先检查宿舍库存
        if(xddm&&yxapssry){
            var ii=velayer.load("正在校验库存");
            var cxrygid = $("#cxrids").val();
            var cxrbmid = $("#cxrbmids").val();
            var spdh = $("#ccsqdh").val();
            var ydrzrq=$("#rzrq").val();
            var ydldrq=$("#jsrq").val();
            var param =new Object();
            param.jdcsid = $("#szcs").val();
            param.ydrzrq=ydrzrq;
            param.ydldrq=ydldrq;
            param.cxrygid=cxrygid;
            param.cxrbmid=cxrbmid;
            param.sqdh=spdh;
            param
            param.uuidKey = $("#uuid").val();
            $.ajax({
                url: "/hotel/fcc/hotel/dormitory/checkDormitory",
                type: "POST",
                async: false,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(param),
                success: function (data) {
                    velayer.close(ii);
                    if(data.success&&data.result){//有库存
                        layer.alert("员工"+yxapssry+"需要优先安排宿舍，点击确认进入申请界面",function () {
                            layer.open({
                                type: 2,
                                area: ['75%', '80%'],
                                title: "申请宿舍",
                                content: '/fcc/hotel/dormitory/apply.html?ssid='+data.result+"&cxrygid="+cxrygid+"&cxrbmid="+cxrbmid+"&spdh="+spdh+"&ygys="+ygys+"&czly=hotelDetail"
                            });
                        });
                    }else if(data.success){//无库存正常进入下单页面
                        toBook(obj,zflx);
                    }else{//出现异常 不允许进入下一步
                        velayer.alert(data.message);
                    }
                }
            });
        }else{
            toBook(obj,zflx)
        }
    }
    function toBook(obj,zflx) {
        var ygys = $("#ygys").val();
        if(ygys == 1 && zflx == 1){
            // velayer.confirm("请关注，预订支付成功后，取消/退订酒店若产生退房费用将由个人承担！",function (index) {
            velayer.confirm($.errorCodeHandle("HOTEL_1505",[]),function (index) {
                velayer.close(index);
                //==================预订前校验是否能够预订
                var md5Summary = $(obj).attr("md5Summary");
                var sfwb=$('#bookForm'+md5Summary+' input[name="sfwb"]').val();
                var invoiceMode=$('#bookForm'+md5Summary+' input[name="invoiceMode"]').val();
                var jdkpcp = $('#bookForm'+md5Summary+' input[name="jdkpcp"]').val();
                if(jdkpcp == "1" && sfwb == '1' && invoiceMode.indexOf("服务商") > -1){
                    // velayer.alert("超标只能预订酒店开票产品");
                    velayer.alert($.errorCodeHandle("HOTEL_1506",[]));
                    return false;
                }
                //==================校验结束
                var pageKey=setBookData(obj);
                window.location.href ="/fcc/hotel/book/book.html?pageKey="+pageKey;
            });
        }else{
            var md5Summary = $(obj).attr("md5Summary");
            var sfwb=$('#bookForm'+md5Summary+' input[name="sfwb"]').val();
            var invoiceMode=$('#bookForm'+md5Summary+' input[name="invoiceMode"]').val();
            var jdkpcp = $('#bookForm'+md5Summary+' input[name="jdkpcp"]').val();
            if(jdkpcp == "1" && sfwb == '1' && invoiceMode.indexOf("服务商") > -1){
                // velayer.alert("超标只能预订酒店开票产品");
                velayer.alert($.errorCodeHandle("HOTEL_1506",[]));
                return false;
            }
            //==================校验结束
            var pageKey=setBookData(obj);
            window.location.href ="/fcc/hotel/book/book.html?pageKey="+pageKey;
        }
    }
    // window.toconfirm = toconfirm;
    // function toconfirm(bjdid) {
    //     var url = "/fcc/hotel/enquiry/list/hotel_confirmOffer_fill.html?bjdid="+bjdid;
    //     layer.open({
    //         type: 2,
    //         area: ['80%', '90%'],
    //         title: "确认报价填写页面",
    //         content: url
    //     });
    // }

    function setBookData(obj){
        var md5Summary=$(obj).attr("md5Summary");
        var ydrzrq=$("#rzrq").val();
        var ydldrq=$("#jsrq").val();
        var jdid=$("#jdid").val();
        var clyy=$("#ygys").val();
        var cxrygid = $("#cxrids").val();
        var cxrbmid = $("#cxrbmids").val();
        var spdh = $("#ccsqdh").val();
        //计算当前酒店最低价
        var minPrice = getMinPrice();
        var param =new Object();
        param.md5Summary=md5Summary;
        param.jdcszwmc=$("#city").val();
        param.jdcsid=$("#szcs").val();
        param.jdid=jdid;
        param.ydrzrq=ydrzrq;
        param.ydldrq=ydldrq;
        param.clClyy=clyy;
        param.cxrygid=cxrygid;
        param.cxrbmid=cxrbmid;
        param.catchKey=catchKey;
        param.sqdh=spdh;
        param.minPrice=minPrice;
        param.fplx=$("#jdfp").val();
        param.jgjhid=$('#bookForm'+md5Summary+' input[name="jgjhid"]').val();
        param.fxid=$('#bookForm'+md5Summary+' input[name="fxid"]').val();
        param.gysPtlx=$('#bookForm'+md5Summary+' input[name="gysPtlx"]').val();
        param.cgly=$('#bookForm'+md5Summary+' input[name="cgly"]').val();
        param.tjrzrs=$('#bookForm'+md5Summary+' input[name="jgjhTjrs"]').val();
        param.uuidKey = $("#uuid").val();
        param.sqdxq =sqdxq;
        var pageKey=cxrygid+"-"+md5Summary;

        var ii = velayer.load($.errorCodeHandle("HOTEL_1504",[]));
        $.ajax({
            url: "/hotel/fcc/hotel/hotelbook/getCxrList",
            type: "POST",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(param),
            success: function (data) {
                velayer.close(ii);
                if(data.result){
                    var pageVo=data.result;
                    param.homeCxrList=pageVo.cxrList;
                    param.cxrInsqd=pageVo.cxrInsqd;
                    param.maxDate=pageVo.maxDate||"";
                    param.minDate=pageVo.minDate||"";
                    param.xcrykz=pageVo.xcrykz||"";
                    param.rzrsj=pageVo.rzrsj||"";
                    param.rzrsjEnc=pageVo.rzrsjEnc||"";
                    param.clClsx=pageVo.clClsx||"";
                    param.clCcsqdh=pageVo.clCcsqdh||"";
                    param.clXmid=pageVo.clXmid||"";
                    param.clXmmc=pageVo.clXmmc||"";
                    param.djzt=pageVo.djzt||"";
                }

            }
        });
        sessionStorage.setItem('hotel_toBookData'+pageKey, JSON.stringify(param));
        // store.set("hotel_toBookData"+pageKey,param,Date.now() + 1000*60*1);
        return pageKey;
    }

    function setSqdParam(obj){
        var md5Summary=$(obj).attr("md5Summary");
        var ydrzrq=$("#rzrq").val();
        var ydldrq=$("#jsrq").val();
        var jdid=$("#jdid").val();
        var clyy=$("#ygys").val();
        var cxrygid = $("#cxrids").val();
        var cxrbmid = $("#cxrbmids").val();
        var spdh = $("#ccsqdh").val();
        //计算当前酒店最低价
        var minPrice = getMinPrice();
        var param =new Object();
        param.md5Summary=md5Summary;
        param.jdcszwmc=$("#city").val();
        param.jdcsid=$("#szcs").val();
        param.jdid=jdid;
        param.ydrzrq=ydrzrq;
        param.ydldrq=ydldrq;
        param.clClyy=clyy;
        param.cxrygid=cxrygid;
        param.cxrbmid=cxrbmid;
        param.catchKey=catchKey;
        param.sqdh=spdh;
        param.minPrice=minPrice;
        param.fplx=$("#jdfp").val();
        param.jgjhid=$('#bookForm'+md5Summary+' input[name="jgjhid"]').val();
        param.fxid=$('#bookForm'+md5Summary+' input[name="fxid"]').val();
        param.gysPtlx=$('#bookForm'+md5Summary+' input[name="gysPtlx"]').val();
        param.cgly=$('#bookForm'+md5Summary+' input[name="cgly"]').val();
        param.tjrzrs=$('#bookForm'+md5Summary+' input[name="jgjhTjrs"]').val();
        param.uuidKey = $("#uuid").val();

        var ii = velayer.load($.errorCodeHandle("HOTEL_1504",[]));
        $.ajax({
            url: "/hotel/fcc/hotel/hotelbook/getCxrList",
            type: "POST",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(param),
            success: function (data) {
                velayer.close(ii);
                if(data.result){
                    var pageVo=data.result;
                    param.homeCxrList=pageVo.cxrList;
                    param.maxDate=pageVo.maxDate||"";
                    param.minDate=pageVo.minDate||"";
                    param.xcrykz=pageVo.xcrykz||"";
                    param.rzrsj=pageVo.rzrsj||"";
                    param.rzrsjEnc=pageVo.rzrsjEnc||"";
                    param.clClsx=pageVo.clClsx||"";
                    param.clCcsqdh=pageVo.clCcsqdh||"";
                    param.djzt=pageVo.djzt||"";
                }

            }
        });
        return param;
    }
    /**
     * 获取当前数据最低价
     */
    window.getMinPrice = getMinPrice;
    function getMinPrice() {
        var minPrice = -1;
        $.each($('.jgjhTr'), function (i, n) {
            var srft = $(n).attr('srft');
            if (!("2" === srft)) {
                var jg = parseInt($(n).attr('srfj'));
                if (minPrice == -1) {
                    minPrice = jg;
                } else {
                    if (jg < minPrice) {
                        minPrice = jg;
                    }
                }
            }
        })
        //更新 酒店头部的最低价
        if(minPrice != -1) {
            $("#szdj").text(laytpl.formatNumber(minPrice));
        }
        return minPrice;
    }

    // 加载百度地图
    window.loadBaiduMap = loadBaiduMap;
    function loadBaiduMap() {
        try {
            //百度地图
            _BaiduMap.initMapDetail("baiduMap");//初始化百度地图
            _BaiduMap.refresh();
        } catch (e) {
        }
    }

    var hotel = require("modules/hotel");
    /**
     * 初始化查询参数
     * @type {initParam}
     */
    window.initYggk = initYggk;
    function initYggk() {
        $("#rzrqPage").val($("#rzrq").val());
        $("#ldrqPage").val($("#jsrq").val());
        $("#ldrqPageH").val($("#jsrq").val());
        var xckzkg = $("#xckzkg").val();
        var xcsjkz = $("#xcsjkz").val();
        var gkrqs = $("#gkrqs").val();
        var gkrqz = $("#gkrqz").val();
        //时间管控
        if (xckzkg == "1" && xcsjkz == "1") {
            /**
             * 时间控件初始化
             */
            var ksrq2 = "";
            var now = moment();
            var ksrq = now.format("YYYY-MM-DD");
            //管控日期 小于 当天日期  取 当天日期做最小日期
            if(gkrqs < ksrq){
                ksrq2 = ksrq;
            }else {
                ksrq2 = gkrqs;
            }
            var option = {
                startInput: "rzrqPage",
                endInput: "ldrqPage",
                maxDate: gkrqz,
                minDate: ksrq2
            };
            hotel.initHotelChooseCalendar(option, function (data) {
                var rzrq = $("#rzrqPage").val();
                var ldrq = $("#ldrqPage").val();
                var day = DateDiff(ldrq, rzrq);
                if (day > 30) {
                    // velayer.alert("预订30天以上请联系客服人员，我们将竭诚为您服务！");
                    velayer.alert($.errorCodeHandle("HOTEL_0121",[]));
                    // $("#ldrqPage").val(getDateOfDayCount(rzrq, 28));
                    $("#ldrqPage").val($("#ldrqPageH").val());
                    return;
                }else {
                    $("#ldrqPageH").val(ldrq);
                }
                $("#rzrq").val(rzrq);
                $("#jsrq").val(ldrq);
                updateXddm();//严格管控日期需要重新更新现地代码
                searchFxjgjh();
                boeYdkz();
            });
        } else {
            initParam();
        }
    }
    window.initParam = initParam;
    function initParam(){
        $("#rzrqPage").val($("#rzrq").val());
        $("#ldrqPage").val($("#jsrq").val());
        $("#ldrqPageH").val($("#jsrq").val());
        //绑定日期控件
        /**
         * 时间控件初始化
         */
        var day1 = new Date();
        day1.setTime(day1.getTime());
        var s1 = day1.getFullYear()+"-" + (day1.getMonth()+1) + "-" + day1.getDate();
        var timer = day1.getHours();
        if(timer<6){
            var day2 = new Date();
            day2.setTime(day2.getTime()-24*60*60*1000);
            var s2 = day2.getFullYear()+"-" + (day2.getMonth()+1) + "-" + day2.getDate();
            s1 = s2;
        }
        var option = {
            startInput: "rzrqPage",
            endInput: "ldrqPage",
            minDate: s1,
            maxDay:90
        };
        hotel.initHotelChooseCalendar(option, function (data) {
            //点击结束日期后，回调 查询酒店价格计划列表
            var rzrq = $("#rzrqPage").val();
            var ldrq = $("#ldrqPage").val();
            var day = DateDiff(ldrq, rzrq);
            if (day > 30) {
                // velayer.alert("预订30天以上请联系客服人员，我们将竭诚为您服务！");
                velayer.alert($.errorCodeHandle("HOTEL_0121",[]));
                // $("#ldrqPage").val(getDateOfDayCount(rzrq, 28));
                $("#ldrqPage").val($("#ldrqPageH").val());
                return;
            }else {
                $("#ldrqPageH").val(ldrq);
            }
            $("#rzrq").val(rzrq);
            $("#jsrq").val(ldrq);
            boeYdkz();
            searchFxjgjh();
        });
    }

    /**
     * 京东方申请单预订管控 参考需求【20191018174018736594】【京东方开发，对于京东方员工长期出差，新增酒店宿舍管控需求
     */
    function boeYdkz() {
        if(!sqdxq||!sqdxq.limit15ry){//有申请单并且差旅管控设置了单次行程超过15天不能预定酒店预订酒店的职级
            return;
        }
        var gt15days=false;
        var rzrq = $("#rzrqPage").val();
        var ldrq = $("#ldrqPage").val();
        var sqdXcList=sqdxq.sqd_xcList;
        if(sqdXcList&&sqdXcList.length>0){
            for (var i=0;i<sqdXcList.length;i++){
                var xc=sqdXcList[i];
                //判断入住日期内是否有单次行程超过15天
                if(DateDiff(xc.rqz,xc.rqs)>=15&&(!moment(rzrq).isAfter(xc.rqz)&&!moment(xc.rqs).isAfter(ldrq))){
                    gt15days=true;
                    break;
                }
            }
        }
        sqdxq.gt15days=gt15days;
    }


    window.initJgjhFilter = initJgjhFilter;
    function initJgjhFilter() {
        $("#jgjhFilter").on("click", "span", function () {
            var _this = $(this);
            if (_this.data("selected") == "1") {
                _this.removeClass("active").addClass("filter_item");
                _this.data("selected", "0");
            } else {
                _this.removeClass("filter_item").addClass("active");
                _this.data("selected", "1");
            }
            var zflxData = "", cxData = "", zcData = "", qxgzData = "", qtData = "";
            var xyData = "", sfwbData = "";
            var isFilter = false;//记录是否有按过滤按钮
            $("#jgjhFilter").find("span.active").each(function (i, n) {
                var type = $(this).data("type");
                var val = $(this).data("val");
                if (type == "fil_zflx") {
                    zflxData += ",tr[" + type + "='" + val + "']"
                } else if (type == "fil_cx") {
                    cxData += ",tr[" + type + "='" + val + "']"
                } else if (type == "fil_zc") {
                    zcData += ",tr[" + type + "='" + val + "']"
                } else if (type == "fil_qxgz") {
                    qxgzData += ",tr[" + type + "='" + val + "']"
                } else if (type == "fil_xy") {
                    xyData += ",tr[" + type + "='" + val + "']"
                } else if (type == "fil_sfwb") {
                    sfwbData += ",tr[" + type + "='" + val + "']"
                }
                isFilter = true;
            });
            $(".content_detail").each(function () {
                var _tr = $(this).find("tr.jgjhTr");
                _tr.removeClass("hideJgjh");
                _tr.show();
                if (zflxData) {
                    _tr = _tr.filter(zflxData.substring(1))
                }
                if (cxData) {
                    _tr = _tr.filter(cxData.substring(1));
                }
                if (zcData) {
                    _tr = _tr.filter(zcData.substring(1))
                }
                if (qxgzData) {
                    _tr = _tr.filter(qxgzData.substring(1))
                }
                if (xyData) {
                    _tr = _tr.filter(xyData.substring(1))
                }
                if (sfwbData) {
                    _tr = _tr.filter(sfwbData.substring(1))
                }
                $(this).find("tr.jgjhTr").hide();
                _tr.removeClass("hideJgjh").show();
                _tr.closest(".content_detail").show();
                //如果有过滤规则，那么把收起展开按钮拿掉
                if(isFilter){
                    $(this).find("tr.toggleJgjh").remove();
                    $(this).find("tr.jgjhTbody").find(".sqJgjh").remove();
                }
                if ($(this).find(".second_con tr:visible").length == 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
                var new_fxMinPrice = 999999;
                $(this).find(".priceNum").text(_tr.size());//处理筛选后的数量
                _tr.each(function (i, n) {
                    // i > 5 && $(n).addClass("hideJgjh");
                    ($(n).attr("srft") != "2") && (new_fxMinPrice = parseFloat($(n).attr("srfj")) < parseFloat(new_fxMinPrice) ? $(n).attr("srfj") : new_fxMinPrice);
                });
                if (new_fxMinPrice != 999999) {
                    $(this).find(".fxMinPrice").text(parseInt(new_fxMinPrice, 10));//处理筛选后的最低价
                }
            })
            //如果没有过滤规则，展示展开收起按钮
            if(!isFilter) {
                hideJgjh();
            }
            // $(this).find("tr.sqJgjh").hide();
        })
        //根据传入的payment  定义当前页面筛选的支付类型
        var payment = $("#payment").val();
        if (payment != '') {
            $("#jgjhFilter").find("span[data-type=fil_zflx]").each(function (i,n) {
                if($(n).attr("data-val") == payment){
                    //触发点击事件
                    $(n).trigger("click");
                }
            })
        }
        // console.log("initJgjhFilter")
    }

    window.dpTab=dpTab;
    function dpTab(obj) {
        var idx = $('#downComment #dplx_tab_div').find('span').removeClass('active').index(obj);
        $(obj).addClass('active');
        $("ul[id^='pj_ul_']").addClass("hideJgjh");
        $('#pj_ul_'+idx).removeClass('hideJgjh');

    }

    //获取点评数据
    function getDpData(){
        var jdid=$("#jdid").val();
        $.ajax({
            type:'get',
            url: '/hotel/fcc/hotel/order/getDpData?jdid='+jdid,
            dataType:"json",
            success: function (res) {
                //更新详情页面图头部 点评数量
                if(res.result){
                    if(res.result.qbList){
                        var count = res.result.qbList.length;
                        if(count > 0){
                            $("#dpcount").html(count);
                        }else {
                            $("#dpLab").html("暂无点评");
                        }
                    }
                }
                laytpl($("#downCommentTemp").html()).render(res.result, function (html) {
                    $("#downComment").html(html);
                });
            }
        });
    }
    // function xqNone(){

    //     var xqList=$('.hotel-text-info');
    //     for(var i=5;i>-1;i--){
    //         console.log(1)
    //         if(xqList[i].offsetHeight<600){
    //             console.log(2)
    //             xqList[i].style.display='none'
    //             var btnLiat=$('#hotel_nav>li');
    //             btnLiat[i].style.display='none'
    //         }
    //     }
    // }

    /**
     * 初始化uuid 提供 查询价格计划记录日志使用
     */
    window.initUUID = initUUID;
    function initUUID(){
        $.ajax({
            type:'get',
            url: '/hotel/fcc/hotel/hotelbook/getUUID',
            cache: false,
            async: false,
            dataType:"json",
            success: function (res) {
                $("#uuid").val("hotel-" + res.result);
            }
        });
    }

    //======================================业务代码写上面 ↑ ==== 工具方法写下面 ↓ ===================================================================================================
    window.getPjxj=getPjxj;
    function getPjxj(pfList,pjlxcode){
        for(var i in pfList){
            if(pfList[i].pjlx==pjlxcode){
                var mc=getPjxjmc(pfList[i].pjxj);
                return mc;
            }
        }
    }

    function getPjxjmc(xjcode){
        var mc='  ';
        if(xjcode=='1'){
            mc='非常不满意';
        }else if(xjcode=='2'){
            mc='不满意';
        }else if(xjcode=='3'){
            mc='一般';
        }else if(xjcode=='4'){
            mc='满意';
        }else if(xjcode=='5'){
            mc='非常满意';
        }
        return mc;
    }

    window.showAllPriceFun = showAllPriceFun;
    function showAllPriceFun(obj,i) {
        var _this = $("tr[fxid='"+i+"']");//同一房型名称下面会出现不同的房型id  做房型合并的时候估计是根据房型名称合并的  这里不使用fxid区显示和隐藏
        if($(obj).attr("show")=="1"){
            $(obj).attr("show","0");
            $(obj).removeClass("icon-angle-up").addClass("icon-angle-down");
            // _this.addClass("hideAllPrice").removeClass("hideJgjh");
            $(obj).parents(".fxsmDiv").each(function(i,n){$(n).find(".fxmxTr").each(function(ii,nn){$(nn).addClass("hideAllPrice").removeClass("hideJgjh");});});
            $(obj).parents(".fxsmDiv").find(".fxHead").hide();
        }else{
            $(obj).attr("show","1");
            $(obj).removeClass("icon-angle-down").addClass("icon-angle-up");
            // _this.removeClass("hideAllPrice").removeClass("hideJgjh");
            $(obj).parents(".fxsmDiv").each(function(i,n){$(n).find(".fxmxTr").each(function(ii,nn){$(nn).removeClass("hideAllPrice").removeClass("hideJgjh");});});
            $(obj).parents(".fxsmDiv").find(".fxHead").show();
        }
        // _this.siblings("tr.toggleJgjh").hide();
    }

    /**房型信息显示*/
    window.fxxx_show = fxxx_show;
    function fxxx_show(obj) {
        var offset = $(obj).offset();
        var fxindex=$(obj).attr("fxindex");
        var images = $("#fxslider_"+fxindex).attr("imagelist");
        var stdz = $("#fxslider_"+fxindex).attr("stdz");
        if(typeof images != "undefined" && images != "" ){
            images=images.replace("[","");
            images=images.replace("]","");
        }
        var imagejson = [];
        $("#fxslider_" + fxindex).html("");
        if(images != "") {
            images = images.split(",");
            for (var index = 0; index < images.length; index++) {
                var obj = {
                    "id": "00" + index,
                    "bUrl": images[index],
                    "sUrl": images[index]
                };
                imagejson.push(obj);
            }
        }else{
            var obj = {
                "id": "001",
                "bUrl": stdz,
                "sUrl": stdz
            };
            imagejson.push(obj);
        }
        // $("#fxslider_" + fxindex).addSlider({
        //     autoPlay:true, //自动播放
        //     type: 1,
        //     bigImg: {w: 550, h: 240},
        //     smallImg: {w: 50, h: 40},
        //     isHaveLayer: true,
        //     typeValue: imagejson
        // }, function (data) {
        //
        // });

        hotel.initSwiperA();
        $("#fxslider_" + fxindex).swiperA({
            autoPlay:true, //自动播放
            type:1,
            smallImg:{w:60,h:30},
            bigImg:{w:600,h:300},
            typeValue:imagejson
        },function(data){
            // console.log(data);
        });


        velayer.open({
            type: 1,
            title: $.errorCodeHandle("HOTEL_1509",[]),
            area: ['620px','80%'],
            shade:0,
            content:$("#fxxx_"+fxindex),
            zIndex:99999999,
            offset: '133px'
        });

    }
    laytpl.replaceStr = function(str){
        return str.replace(";","</br>");
    }
    /**
     * 页面滚动事件
     */

    function initHtmlDom(){
        var hotel_nav_top = $('#hotel_nav').offset().top;
        $(window).scroll(function () {
            if ($(window).scrollTop() >= hotel_nav_top-82) {
                $("#hotel_nav").addClass("hotel_nav_fixed");

            } else {
                $("#hotel_nav").removeClass("hotel_nav_fixed");
            }
            $('#hotel_nav > a').each(function (i, n) {
                if ($("#" + $(n).attr("name")).offset().top - $(window).scrollTop() <= $('#hotel_nav').height()) {
                    $(n).addClass('current').addClass('theme').siblings("a").removeClass();
                }
            });
            //锚点定位
            //房型价格
            var fxjg = $("#roomUL").offset().top-160;
            var fxjgh = $("#roomUL").height() + fxjg;
            //酒店信息
            var jdxx = $("#hotel_detail_info_div").offset().top-160;
            var jdxxh = $("#hotel_detail_info_div").height() + jdxx;
            //酒店政策
            var jdzc = jdxx;
            var jdzch = jdxxh;
            if ($("#hotelPolicy_div").length > 0) {
                jdzc = $("#hotelPolicy_div").offset().top-160;
                jdzch = $("#hotelPolicy_div").height() + jdzc;
            }
            //设施服务
            var fwss = jdzc;
            var fwssh = jdzch;
            if ($("#hotelServer_div").length > 0) {
                fwss = $("#hotelServer_div").offset().top-160;
                fwssh = $("#hotelServer_div").height() + fwss;
            }
            //交通位置
            var jtwz = $("#traffic_div").offset().top-160;
            var jtwzh = ($("#traffic_div").height()/2 )+ jtwz;
            //住客点评
            var zkdp = $("#comment_div").offset().top-160-($("#traffic_div").height()/2);
            var zkdph = $("#comment_div").height() + zkdp;
            var wind = $(window).scrollTop();
            if(wind >= fxjg && wind < fxjgh){
                hideNov($(".tabs").find(".fxjgC"));
            }else if(wind >= jdxx && wind < jdxxh){
                hideNov($(".tabs").find(".jdxxC"));
            }else if(wind >= jdzc && wind < jdzch && jdzc != jdxx){
                hideNov($(".tabs").find(".jdzcC"));
            }else if(wind >= fwss && wind < fwssh && fwss != jdzc){
                hideNov($(".tabs").find(".fwssC"));
            }else if(wind >= jtwz && wind < jtwzh){
                hideNov($(".tabs").find(".jtwzC"));
            }else if(wind >= zkdp && wind < zkdph){
                hideNov($(".tabs").find(".zkdpC"));
            }
        });

    }

    window.hideNov = hideNov;
    function hideNov($this){
        $(".tabs").find("li").each(function (n,j) {
            //去掉全部的atta
            $(j).removeClass("active");
            $(this).removeClass("theme_bd_bottom");
            $(j).find("a").removeClass("theme");
        });
        $this.addClass("active");
        $this.addClass("theme_bd_bottom");
        $this.find("a").addClass("theme");
    }

    /**汇率显示*/
    window.hl_show = hl_show;
    function hl_show(obj) {
        var  wbje = $(obj).attr("wbje") ;
        wbje = parseFloat(wbje == '' || isNaN(wbje) ?  0 : wbje);
        var mrfjmxDiv=$(obj).parent().find("div.mrfj");
        // 复制价格明细节点
        var $fxjgjh_mx_container = $(mrfjmxDiv).clone();
        if(wbje <=  0){
            $("#mrjgshow_nohl").html($fxjgjh_mx_container.html());
            var offset = $(obj).offset()
            $("#mrjgshow_nohl").css("top", offset.top + 70);
            $("#mrjgshow_nohl").css("left", offset.left -170);
            $("#mrjgshow_nohl").css("display", "block");
        }else{
            var  hbhs = "¥  " + $(obj).attr("bwb")  +"  " + $(obj).attr("bwbje") ;
            hbhs = hbhs +"=  " +$(obj).attr("wb")  +"  " + $(obj).attr("wbje") ;
            $("#hbhs").text(hbhs);
            // $("#bwbje").text("¥  "+$(obj).attr("bwbje"));
            // $("#wbje").text( $(obj).attr("wb")  +"  " +wbje);

            $("#mrjgshow").html($fxjgjh_mx_container.html());
            var offset = $(obj).offset()
            $("#hlxs").css("top", offset.top + 70);
            $("#hlxs").css("left", offset.left -170);
            $("#hlxs").css("display", "block");
        }
    }
    /**汇率显示*/
    window.hl_hide = hl_hide;
    function hl_hide(obj) {
        $("#hlxs").hide();
        $("#mrjgshow").html("");
        $("#mrjgshow_nohl").hide();
        $("#mrjgshow_nohl").html("");
    }


    window.ydBtn=ydBtn;
    function ydBtn(){
        $('html,body').animate({
            scrollTop: ($("#roomUL").offset().top-150) - 10
        }, 10);
    }
    window.mapBtn=mapBtn;
    function mapBtn(){
        $('html,body').animate({
            scrollTop: ($("#traffic_div").offset().top-20) - 10
        }, 10);
    }

    window.showtittle = showtittle;
    function showtittle(obj) {
        $(obj).closest("td").find(".hideInfo").show();
    }
    window.hidetittle = hidetittle;
    function hidetittle(obj) {
        $(obj).closest("td").find(".hideInfo").hide();
    }
    window.sortSrfj = sortSrfj;
    function sortSrfj(a,b){
        return a.srfj - b.srfj;
    }

    /**
     * 根据价格支付类型和早餐排序
     * @param jgjhlb
     */
    window.sortByZflxAndZc = sortByZflxAndZc;
    function sortByZflxAndZc(jgjhlb){
        var mapjg = {};
        var jgjhList = new Array();
        $(jgjhlb).each(function (it,jgjh) {
            var zflx = jgjh.zflx;
            var sfhz = jgjh.sfhz == "无早" || jgjh.sfhz == "单早" || jgjh.sfhz == "双早" ?  jgjh.sfhz : "其他" ;
            var key = zflx + ":" +sfhz;
            if(mapjg[key]){
                //不为空，按照价格排序
                mapjg[key].push(jgjh);
                mapjg[key].sort(sortSrfj);
            }else {
                var jgjhs = new Array();
                jgjhs.push(jgjh)
                mapjg[key] = jgjhs;
            }
        });

        //排序完成，处理隐藏数据 0 现付 1 预付
        var sortByZflx = ["0","1"];
        var sortZc = ["无早","单早","双早","其他"];
        var xfwzList = new Array();
        var yfwzList = new Array();
        var xfdzList = new Array();
        var yfdzList = new Array();
        var xfszList = new Array();
        var yfszList = new Array();
        var xfqtList = new Array();
        var yfqtList = new Array();
        for(key in mapjg){
            var jgjhs = mapjg[key];
            var mfList = new Array();
            var fmfList = new Array();
            var jgjhListZong = new Array();
            //
            $(jgjhs).each(function (i,n) {
                if(n.srft == "2"){
                    mfList.push(n);
                }else {
                    fmfList.push(n);
                }
            })
            //先放非满房
            if(fmfList.length > 0){
                fmfList.sort(sortSrfj);
                jgjhListZong.push.apply(jgjhListZong,fmfList);
            }
            //再放满房
            if(mfList.length > 0){
                mfList.sort(sortSrfj);
                jgjhListZong.push.apply(jgjhListZong,mfList);
            }
            if(jgjhListZong.length > 0){
                for(var i = 0 ; i < jgjhListZong.length ; i++){
                    //把第一个设置为显示，其他设置为隐藏
                    if(i == 0){
                        jgjhListZong[i].sfyc = "0";
                    }else {
                        jgjhListZong[i].sfyc = "1";
                    }
                }
            }
            if(key == "0:无早"){
                xfwzList = jgjhListZong;
            }else if(key == "1:无早"){
                yfwzList = jgjhListZong;
            }else if(key == "0:单早"){
                xfdzList = jgjhListZong;
            }else if(key == "1:单早"){
                yfdzList = jgjhListZong;
            }else if(key == "0:双早"){
                xfszList = jgjhListZong;
            }else if(key == "1:双早"){
                yfszList = jgjhListZong;
            }else if(key == "0:其他"){
                xfqtList = jgjhListZong;
            }else if(key == "1:其他"){
                yfqtList = jgjhListZong;
            }
        }
        //根据预付（早餐） 现付（早餐）  顺序整合集合
        if(yfwzList.length>0) {
            jgjhList.push.apply(jgjhList, yfwzList);
        }
        if(xfwzList.length>0){
            jgjhList.push.apply(jgjhList,xfwzList);
        }
        if(yfdzList.length>0) {
            jgjhList.push.apply(jgjhList, yfdzList);
        }
        if(xfdzList.length>0) {
            jgjhList.push.apply(jgjhList, xfdzList);
        }
        if(yfszList.length>0) {
            jgjhList.push.apply(jgjhList, yfszList);
        }
        if(xfszList.length>0) {
            jgjhList.push.apply(jgjhList, xfszList);
        }
        if(yfqtList.length>0) {
            jgjhList.push.apply(jgjhList, yfqtList);
        }
        if(xfqtList.length>0) {
            jgjhList.push.apply(jgjhList, xfqtList);
        }

        return jgjhList;
    }

    /**
     * 价格计划排序
     */
    window.sortjgjh = sortjgjh;
    function sortjgjh(fxjgjh,sort){
        var jdjgpx = sort;
        if(jdjgpx == '00000' ||　!sort){
            //如果是0  按价格降序排序
            if (fxjgjh.fxjgjhList) {
                $(fxjgjh.fxjgjhList).each(function (i,fx) {
                    if(fx.jgjhlb.length > 0){
                        fx.jgjhlb = sortByZflxAndZc(fx.jgjhlb);
                    }
                })
            }
            return;
        }
        var xfindex = jdjgpx.indexOf("1");//现付
        var yfindex = jdjgpx.indexOf("2");//预付
        var xyindex = jdjgpx.indexOf("3");//协议
        var zqindex = jdjgpx.indexOf("4");//自签
        var wbindex = jdjgpx.indexOf("5");//外部
        var sortIndex = new Array();
        sortIndex.push(xyindex);
        sortIndex.push(zqindex);
        sortIndex.push(wbindex);
        sortIndex.sort(sortNumber);
        var jdjgpxMap = {};
        jdjgpxMap[xyindex] = "3";
        jdjgpxMap[zqindex] = "4";
        jdjgpxMap[wbindex] = "5";
        var pxxf = new Array();
        var pxyf = new Array();
        $(sortIndex).each(function (i,index) {
            pxxf.push(jdjgpxMap[index]);
            pxyf.push(jdjgpxMap[index]);
        })

        if (fxjgjh.fxjgjhList) {
            $(fxjgjh.fxjgjhList).each(function (i,fx) {
                var xfList = new Array();
                var yfList = new Array();
                var xyListXF = new Array();
                var zqListXF = new Array();
                var wbListXF = new Array();
                var xyListYF = new Array();
                var zqListYF = new Array();
                var wbListYF = new Array();
                var jgjhListZong = new Array();
                var jgjhlb = fx.jgjhlb;
                if (jgjhlb) {
                    $(jgjhlb).each(function (it,jgjh) {
                        if ("0" == jgjh.zflx) {
                            xfList.push(jgjh);
                        } else if ("1" ==  jgjh.zflx) {
                            yfList.push(jgjh);
                        }
                    });
                    $(xfList).each(function (it,xfjgjh) {
                        if (isXyjg(xfjgjh)) {
                            xyListXF.push(xfjgjh);
                        } else if (isZqjg(xfjgjh)) {
                            zqListXF.push(xfjgjh);
                        } else {
                            wbListXF.push(xfjgjh);
                        }
                    });
                    $(yfList).each(function (it,yfjgjh) {
                        if (isXyjg(yfjgjh)) {
                            xyListYF.push(yfjgjh);
                        } else if (isZqjg(yfjgjh)) {
                            zqListYF.push(yfjgjh);
                        } else {
                            wbListYF.push(yfjgjh);
                        }
                    });
                }
                //现付在前预付在后
                if (xfindex < yfindex) {
                    $(pxxf).each(function (it,pxLxXf) {
                        if ("3" ==  pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,xyListXF);
                        } else if ("4" ==  pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,zqListXF);
                        } else if ("5" == pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,wbListXF);
                        }
                    });
                    $(pxyf).each(function (it,pxlxYf) {
                        if ("3" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,xyListYF);
                        } else if ("4" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,zqListYF);
                        } else if ("5" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,wbListYF);
                        }
                    });
                } else {
                    $(pxyf).each(function (it,pxlxYf) {
                        if ("3" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,xyListYF);
                        } else if ("4" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,zqListYF);
                        } else if ("5" == pxlxYf) {
                            jgjhListZong.push.apply(jgjhListZong,wbListYF);
                        }
                    });
                    $(pxxf).each(function(it,pxLxXf){
                        if ("3" == pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,xyListXF);
                        } else if ("4" == pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,zqListXF);
                        } else if ("5" == pxLxXf) {
                            jgjhListZong.push.apply(jgjhListZong,wbListXF);
                        }
                    });
                }
                if (jgjhListZong) {
                    //如果不是默认排序 把超过6个的价格隐藏
                    for(var i = 0; i < jgjhListZong.length; i++){
                        if(i > 5){
                            jgjhListZong[i].sfyc = "1";
                        }
                    }
                    fx.jgjhlb = jgjhListZong;
                }
            });

        }

    }

    /**
     * 计算两个日期之间的天数
     */
    window.DateDiff = DateDiff;
    function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式
        var aDate, oDate1, oDate2, iDays;
        aDate = sDate1.split("-");
        oDate1 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);  //转换为yyyy-MM-dd格式
        aDate = sDate2.split("-");
        oDate2 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);
        iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
        return iDays;  //返回相差天数
    }

    /**
     *  计算传入日期相隔天数的日期
     *  正数获取后N天，负数获取前N天
     *  日期格式必须是 yyyy-MM-dd
     * @type {function(*, *): string}
     */
    window.getDateOfDayCount = getDateOfDayCount;
    function getDateOfDayCount(date, day) {
        var dateArr = date.split("-");
        var d_date = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);  //转换为date
        d_date.setDate(d_date.getDate() + day);
        var m = d_date.getMonth() + 1;
        if (m < 10) {
            m = "0" + m;
        }
        var d = d_date.getMonth() + 1;
        if (d < 10) {
            d = "0" + d;
        }
        return d_date.getFullYear() + "-" + m + "-" + d;
    }



    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [ o[this.name] ];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }

    /**
     * 隐藏房型下面多的价格计划
     * @type {initNoDataLoading}
     */
    window.hideJgjh = hideJgjh;
    function hideJgjh() {
        var $fxDomList = $(".content_detail", "#roomUL");
        $fxDomList.each(function (i, e) {
            var $jgjhTr = $(".jgjhTr", e);
            var number = $(".jgjhTr[sfyc='1']", e).size();
            if(number > 0){
                $(".jgjhTr[sfyc='1']", e).addClass("hideJgjh");
                $(".jgjhTr[sfyc='1']", e).css({
                    background : "#f2f2f2"
                });
                $(".jgjhTbody", e).find("tr.toggleJgjh").remove();
                $(".jgjhTbody", e).find("tr.sqJgjh").remove();
                $(".jgjhTbody", e).append('<tr class="toggleJgjh"><td colspan="6" style="text-align: right;padding-right:20px;"><p class="cursor"><span class="text">查看其他' + number + '个产品报价</span><i class="iconfont icon-angle-down"></i></p></td></tr>');
                $(".jgjhTbody", e).append('<tr class="sqJgjh" style="display: none;cursor: pointer;" ><td colspan="6" style="text-align: right;padding-right:20px;"><p class="cursor"><span class="text">收起</span><i class="iconfont icon-angle-up"></i></p></td></tr>');
            }
        })
        addToggleJgjhEvent("#roomUL");
        hidejgjhTr();

    }
    window.hidejgjhTr =hidejgjhTr;
    function hidejgjhTr() {
        $("#roomUL .sqJgjh").on("click", function (event) {
            var $jgjhTbody = $(event.target).closest(".jgjhTbody");
            $(".sqJgjh",$jgjhTbody).hide();
            $(".toggleJgjh",$jgjhTbody).show();
            var $jgjhTr = $(".jgjhTr", $jgjhTbody);
            var number = $(".jgjhTr[sfyc='1']", $jgjhTbody).size();
            if(number > 0){
                $(".jgjhTr[sfyc='1']", $jgjhTbody).addClass("hideJgjh");
            }
        })
    }

    window.addToggleJgjhEvent = addToggleJgjhEvent;
    function addToggleJgjhEvent(scope) {
        $(scope).off("click", ".toggleJgjh p").on("click", ".toggleJgjh p", function (event) {
            var $toggleJgjh = $(event.target).closest(".toggleJgjh");
            $toggleJgjh.hide();
            $(".hideJgjh", $(event.target).closest(".content_detail")).removeClass("hideJgjh");
            $(event.target).closest(".content_detail").find(".sqJgjh").show();
        })
    }



    /**
     * 正在加载中  无房型数据 进度条
     */
    window.initNoDataLoading = initNoDataLoading;
    function initNoDataLoading() {
        if ($(".loadContainer").size() > 0) {
            return;
        }
        var $loadContainer = bulidEmptyDom(null, null, "loadContainer");
        $loadContainer.css({
            width: "350px",
            height: "60px",
            //border: "1px solid #00A0E9",
            margin: "30px auto",
            padding: "20px 30px"
        })
        $loadContainer.addClass("theme theme_bd")
        var $loadText = $("<label>价格加载中...</label><img src='./images/load.gif' style='width:300px;height:10px;display:block;'/>")
        $loadContainer.append($loadText);
        $('#roomUL').html($loadContainer);
    }
    window.bulidEmptyDom = bulidEmptyDom;
    function bulidEmptyDom(root, html, clazz) {
        root = root || "div";
        html = html || "";
        clazz = clazz || "";
        return $("<" + root + " class='" + clazz + "'>" + html + "</" + root + ">");
    }
    /**
     * 超时自动关闭进度条功能
     * @type {initDatalanding}
     */
    window.initDatalanding = initDatalanding;
    function initDatalanding() {
        var time = setTimeout(function () {
            stopRunTimer();
        },20000);

    }

    /**
     * 关闭进度条
     */
    window.stopRunTimer = stopRunTimer;
    function stopRunTimer () {
// clearInterval(time);
        $(".loadContainer", '#roomUL').remove();
        $(".loadMoreContainer", '#roomUL').remove();
        //TODO 个控参数
        var jdxjcpkq = "";
        if ($(".jgjhTr").size() == 0) {
            if("0" == jdxjcpkq || "2" == jdxjcpkq){
                var html = '<div style="text-align: center"><img src="/static/fcc/hotel/images/hotelListImg/nodata.png" alt="" style="margin:5px 0px 5px 0px;width:80px;height:60px;"></div><span style="padding-bottom: 10px; font-size: 12px;">很抱歉，该酒店在此期间无法预订，建议您修改日期试试吧~</span><br/> '+'<p style="padding: 10px 0px 10px 20px;">' +
                    '<span style="font-size: 14px;color: #999999;">你还可以快速录入入住需求&nbsp;,&nbsp;向供应商发起酒店询价&nbsp;:&nbsp;<span style="font-size: 14px;color: #999;cursor: pointer;" onclick="sendXun()">点击去询价&nbsp;></span></span>' + '</p>' +
                    '<p ><img src="./images/jdxbj_gn.png" alt="" style=""></p>';
                $('#roomUL').html(html);
            }else {
                $('#roomUL').html('<div style="text-align: center"><img src="/static/fcc/hotel/images/hotelListImg/nodata.png" alt="" style="margin:5px 0px 5px 0px;width:80px;height:60px;"></div><span style="padding-bottom: 10px; font-size: 12px;color:#999;font-weight: bold;  text-align: center; display: block;">很抱歉，该酒店在此期间无法预订，建议您修改日期试试吧~</span>');
            }
        }
    }

    /**
     * 正在加载中  有房型数据 进度条
     */
    window.initJgjhLoading = initJgjhLoading;
    function initJgjhLoading () {
        if ($(".loadMoreContainer").size() > 0) {
            $(".loadMoreContainer").remove();
        }
        var $loadContainer = bulidEmptyDom(null, null, "loadMoreContainer");
        $loadContainer.css({
            height: "20px",
            margin: "10px auto",
            padding: "10px 10px 0px 350px"
        })
        $loadContainer.addClass("borderTop")
        var $loadText = $("<label>加载更多数据...</label><img src='./images/load.gif' style='width:300px;height:8px;'/>")
        $loadContainer.append($loadText);
        $('#roomUL').append($loadContainer);
    }

    /**
     * 更新房型和酒店的最低价
     */
    window.updateHotelMinPrice = updateHotelMinPrice;
    function updateHotelMinPrice() {

    }

    // 初始化位置交通地图
    function initHotelTraffic(jdInfo) {
        try {
            var bd = jdInfo.hotel.bd;
            if ($.isBlank(bd)) {
                return;
            }
            var bdArr = bd.split(",");
            // 初始化数据
            hotelMap.HotelTraffic(bdArr[1],bdArr[0],jdInfo.hotel.jdzwmc);
            // 初始化百度地图
            hotelMap.BaiduMap.initMap("baiduMap_traffic");
            // 创建地图,定位中心点
            hotelMap.BaiduMap.createMap();
            // 动态绑定POI控件
            dynamicPOI();
            // 初始化默认的周边信息
            hotelMap.BaiduMap.localSearch();
            // 绑定本地搜索事件
            bindLocalSearch();
            // 目的地默认为当前酒店
            $("#end-suggestId").val(jdInfo.hotel.jdzwmc);
            $("#end-searchResultPanel").val(bdArr[1]+","+bdArr[0]);
        } catch (e) {
            // console.log(e);
        }
    }

    // 位置交通搜索路线,搜索之前渲染页面
    window.beforeSearchTrip = beforeSearchTrip;
    function beforeSearchTrip() {
        var startzwmc = $("#start-suggestId").val();
        var endzwmc = $("#end-suggestId").val();
        if ($.isBlank(startzwmc) || $.isBlank(endzwmc)) {
            return;
        }
        // 做个简单的动态页面,免得页面写很多html
        var html = '<div style="padding: 7px;font-size: 12px;"><a href="javascript:comeBack()">< 返回</a> |<font style="font-weight: bold;"> 线路查询</font></div>';
        var searchType = $(".box-tab span[searchCurrent='1']").attr("searchType");
        if (searchType == '1') {
            html += '<div class="bus_sort">' +
                '<a class="selected" travelPolicy="0" href="javascript:;">速度最快</a>' +
                '<a travelPolicy="1" href="javascript:;">最少换乘</a>' +
                '<a travelPolicy="2" href="javascript:;">步行最少</a>' +
                '<a travelPolicy="3" href="javascript:;">不乘地铁</a> </div>';
            html += '<div id="map_result" class="p_result clear" style="height: 258px;margin-top: 37px;"></div>';
        }else if (searchType == '2') {
            html += '<div class="bus_sort">' +
                '<a class="selected" travelPolicy="0" href="javascript:;">速度最快</a>' +
                '<a travelPolicy="1" href="javascript:;">距离最短</a>' +
                '<a travelPolicy="2" href="javascript:;">避开高速</a></div>';
            html += '<div id="map_result" class="p_result clear" style="height: 258px;margin-top: 37px;"></div>';
        }else if (searchType == '3') {
            html += '<div id="map_result" class="p_result"></div>';
        }
        $("#p-result").html(html);
        // 出行策略切换按钮绑定事件
        bindPolicy();
        // 搜索
        searchTrip();
    }

    // 点击周边设施搜索路线
    window.localSearchTrip = function (jdzwmc,bd) {
        searchChange();
        $("#end-suggestId").val(jdzwmc);
        $("#end-searchResultPanel").val(bd);
        beforeSearchTrip();
    }

    window.hoverintheme = function (_this) {
        $(_this).addClass("theme");
    }

    window.hoverouttheme = function (_this) {
        $(_this).removeClass("theme")
    }

    // 位置交通搜索路线
    window.searchTrip = searchTrip;
    function searchTrip() {
        var startzwmc = $("#start-suggestId").val();
        var endzwmc = $("#end-suggestId").val();
        if ($.isBlank(startzwmc) || $.isBlank(endzwmc)) {
            return;
        }
        hotelMap.BaiduMap.searchTrip({
            startzwmc : startzwmc,
            start : $("#start-searchResultPanel").val(),
            endzwmc : endzwmc,
            end : $("#end-searchResultPanel").val(),
            searchType : $(".box-tab span[searchCurrent='1']").attr("searchType"),
            travelPolicy : $(".bus_sort a[class='selected']").attr("travelPolicy")
        });
    }

    // 返回
    window.comeBack = function () {
        // 创建地图,定位中心点
        var jdData = hotelMap.BaiduMap.comeBack();
        $("#start-suggestId").val("");
        $("#start-searchResultPanel").val("");
        $("#end-suggestId").val(jdData.jdzwmc);
        $("#end-searchResultPanel").val(jdData.lng+","+jdData.lat);
    }

    // 出行策略绑定事件(时间最短,距离最短,...)
    function bindPolicy() {
        if ($(".bus_sort a").length > 0) {
            $(".bus_sort a").click(function () {
                var _this = $(this);
                if (!_this.attr("class") || _this.attr("class").indexOf("selected") < 0) {
                    $(".bus_sort a").removeClass("selected");
                    _this.addClass("selected");
                    searchTrip();
                }
            });
        }
    }

    // 本地搜索绑定事件(酒店,机场车站,地铁)
    function bindLocalSearch() {
        if ($(".tab-list span").length > 0) {
            $(".tab-list span").click(function () {
                var _this = $(this);
                if (!_this.attr("class") || _this.attr("class").indexOf("current") < 0) {
                    $(".tab-list span").removeClass("current");
                    $(".tab-list span").removeClass("theme_bg");
                    _this.addClass("current");
                    _this.addClass("theme_bg");
                    var keyword = _this.attr("keyword");
                    hotelMap.BaiduMap.localSearch(keyword);
                }
            });
        }
    }

    // 出行类型绑定事件(公交,驾车,步行)
    $(".box-tab span").click(function () {
        debugger
        var _this = $(this);
        if (!_this.attr("class") || _this.attr("class").indexOf("current") < 0) {
            $(".box-tab span").removeClass("current");
            $(".box-tab span").removeClass("theme");
            $(".box-tab span").attr("searchCurrent","0");
            _this.addClass("current");
            _this.addClass("theme");
            _this.attr("searchCurrent","1");
            beforeSearchTrip();
        }
    });

    // 数据交换
    window.searchChange = searchChange;
    function searchChange() {
        var inp1 = $("#start-suggestId").val();
        var inp2 = $("#end-suggestId").val();
        $("#start-suggestId").val(inp2);
        $("#end-suggestId").val(inp1);
        var hid1 = $("#start-searchResultPanel").val();
        var hid2 = $("#end-searchResultPanel").val();
        $("#start-searchResultPanel").val(hid2);
        $("#end-searchResultPanel").val(hid1);
        // searchTrip();
    }

    // 动态绑定POI控件
    function dynamicPOI() {
        // 一个页面只能绑定一个POI控件,这只能搞一个动态绑定,点击的输入框时候绑定POI控件
        $(".map_route_box .input_txt").click(function () {
            var _this = $(this);
            _this.showXzqSqAddress({
                csbh:"szcs",//城市编号
                qybh:VEGLOBAL.FCCUSER.qybh,//企业编号
                compId:VEGLOBAL.FCCUSER.zgs,//总公司
                ygid:VEGLOBAL.FCCUSER.ygid,
                bmid:VEGLOBAL.FCCUSER.bmid,
                type:2,
                autoChoose: false,
                cbFn:function(data,$dom){
                    if (!$.isEmptyObject(data)) {
                        var bdjd = data.lon;
                        var bdwd = data.lat;
                        _this.val(data.poiName);
                        _this.next().val(bdjd+","+bdwd);
                    }
                }
            });
        });
    }

    /***
     * 下单页面无价格时强制刷新服务
     * @param flush 是否重刷价格
     */
    window.againSearch=againSearch;
    function againSearch(flush){
        layer.closeAll();
        if(flush){
            searchFxjgjh();
        }
    }

    //锚点函数
    window.possition=possition;
    function possition(ele){
        var height=document.getElementById(ele).offsetTop-150;
        $('html ,body').animate({scrollTop: height}, 300);
        return false;
    };



    window.seccion=seccion;
    function seccion() {
        if ($("#jdid").val()){
            var param={};
            param.jdid = $("#jdid").val();
            param.rzrq = $("#rzrq").val();
            param.jsrq = $("#jsrq").val();
            param.jdzwmc = $("#jdzwmc").val();
            param.zdj = $("#zdj").val();
            param.szcs = $("#szcs").val();
            param.jdpp = $("#jdpp").val();
            param.xj = $("#xj").val();
            param.xyid = $("#xyid").val();
            param.xyh = $("#xyh").val();
            param.hotelType = $("#hotelType").val();
            param.bdjd = $("#bdjd").val();
            param.bdwd = $("#bdwd").val();
            param.cxrids = $("#cxrids").val();
            param.cxrbmids = $("#cxrbmids").val();
            param.ccsqdh = $("#ccsqdh").val();
            param.ygys = $("#ygys").val();
            param.sfxy = $("#sfxy").val();
            param.payment = $("#payment").val();
            param.xzq = $("#xzq").val();
            param.xckzkg = $("#xckzkg").val();
            param.xcsjkz = $("#xcsjkz").val();
            param.xckzkg = $("#gkrqs").val();
            param.xcsjkz = $("#gkrqz").val();
            window.sessionStorage.setItem('jdid',JSON.stringify(param));
        }else {
            var param=JSON.parse( window.sessionStorage.getItem('jdid'));
            $("#jdid").val(param.jdid );
            $("#rzrq").val(param.rzrq);
            $("#jsrq").val(param.jsrq );
            $("#jdzwmc").val(param.jdzwmc );
            $("#zdj").val(param.zdj);
            $("#szcs").val(param.szcs);
            $("#jdpp").val( param.jdpp);
            $("#xj").val(param.xj);
            $("#xyid").val(param.xyid);
            $("#xyh").val(param.xyh);
            $("#hotelType").val(param.hotelType);
            $("#bdjd").val(param.bdjd);
            $("#bdwd").val(param.bdwd);
            $("#cxrids").val(param.cxrids);
            $("#cxrbmids").val(param.cxrbmids);
            $("#ccsqdh").val(param.ccsqdh );
            $("#ygys").val(param.ygys);
            $("#sfxy").val(param.sfxy);
            $("#payment").val(param.payment);
            $("#xzq").val(param.xzq);
            $("#xckzkg").val(param.xckzkg);
            $("#xcsjkz").val(param.xcsjkz);
            $("#gkrqs").val(param.xckzkg);
            $("#gkrqz").val(param.xcsjkz);
        }

    }
    /**
     * 查询申请单信息（行程信息等）
     */
    function sqdDetail() {
        if(!$("#ccsqdh").val()){
            return;
        }
        var param =new Object();
        param.clClyy=$("#ygys").val();
        param.jdcsid=$("#szcs").val();
        param.cxrygid=$("#cxrids").val();
        param.cxrbmid=$("#cxrbmids").val();
        param.ydrzrq= $("#rzrq").val();
        param.ydldrq= $("#jsrq").val();
        param.sqdh=$("#ccsqdh").val();
        param.uuidKey = $("#uuid").val();
        $.ajax({
            url: "/hotel/fcc/hotel/dormitory/getSqdDetail",
            type: "POST",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(param),
            success: function (data) {
                if(data.result){
                    sqdxq=data.result;
                    $("#xddm").val(sqdxq.xddm);
                    $("#yxapssry").val(sqdxq.yxapssry);
                    sqdXcList=sqdxq.sqd_xcList;
                }
            }
        });
    }
    /**
     * 更新现地代码
     */
    function updateXddm(){
        if(gksz.djssxt!="1"||!$("#yxapssry").val()){
            return;
        }
        var tmpXddm="";
        var rzrq = $("#rzrq").val();
        var ldrq = $("#jsrq").val();
        var xckzkg = $("#xckzkg").val();
        var xcsjkz = $("#xcsjkz").val();
        if(sqdXcList&&sqdXcList.length>0){
            for (var i=0;i<sqdXcList.length;i++){
                var xc=sqdXcList[i];
                if(xc.mdd==$("#szcs").val()&&(xckzkg!='1'||xcsjkz!='1'||!moment(rzrq).isAfter(xc.rqz)&&!moment(xc.rqs).isAfter(ldrq))){
                    tmpXddm=xc.mddw;
                    break;
                }
            }
        }
        if(tmpXddm!=$("#xddm").val()){
            var url = "/hotel/fcc/hotel/hotelbook/getSsdd?xddm=" + tmpXddm;
            $.ajax({
                type:"get",
                url:url,
                dataType:"json",
                success:function(data){
                    if(data.result){
                        sqdxq.ssddms=data.result;
                    }
                }
            });
        }
        $("#xddm").val(tmpXddm);

    }
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    } else {
        window.onunload = function () {
            setTimeout(function(){$(window).scrollTop(0)},10);
        };
    }
    /**
     * 页面初始化
     */
    $(function () {
        document.title =$("#jdzwmc").val();
        seccion()
        initGksz();//初始化个控数据
        initYggk();//初始化查询参数
        try{
            initPri();//加载轮播图
        }catch (e) {
            // console.log(e);
        }
        searchHotelDetail();//查询酒店详情
        searchFxjgjh();//查询和渲染价格计划,默认供应商数据查询完毕
        initHtmlDom();//tab栏页面滚动事件
        initJgjhFilter();//初始化过滤条件
    });

});