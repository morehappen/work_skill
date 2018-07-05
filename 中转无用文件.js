var localHtttp = getBaseUrl('lh');
var _editSign = +$.getUrlParam("editSign");//编辑还是增加，编辑是1，增加是0
//拉取品牌地址
var brand_Url = localHtttp + '/goods/brand/showBrandLeafClass';
//添加菜单地址url
var roleMenuAdd_Url = localHtttp + '/user/menu/addMenu';
//品牌关联三级
var categoriesUrl = localHtttp + '/goods/brand/findLeafClassByBrandId';

var _isLeaf = +$.getUrlParam("isLeaf");//是否是叶子节点
var _selfId = +$.getUrlParam("selfId");//本行数据id
$(function () {
    nav_Common_fun("型号列表","添加型号");
    brand_pullFun();//顶部品牌下拉渲染
    // categoriesAll();//三级联动数据源头
    // filterCategories();//三级联动
    $("#selectbox1").selectBox("removeAll");
    $("#selectbox2").selectBox("removeAll");
    $("#selectbox3").selectBox("removeAll");
    $("#selectbox1").css("background-color", "#eaecf2");
    $("#selectbox2").css("background-color", "#eaecf2");
    $("#selectbox3").css("background-color", "#eaecf2");
    $(".send").change(function () {
        brandSelect_has = $(".send").val();
        $("#selectbox1").selectBox("removeAll");
        $("#selectbox2").selectBox("removeAll");
        $("#selectbox3").selectBox("removeAll");
        $("#selectbox1").css("background-color", "#eaecf2");
        $("#selectbox2").css("background-color", "#eaecf2");
        $("#selectbox3").css("background-color", "#eaecf2");
        if(brandSelect_has != undefined){
            categoriesAll();
            filterCategories();
        }
    });
    debugger;
    var addDom = $(".attr_manag_con_right .sure_xsBtn");
    //属性名称输入失焦事件
    $(".roleMenu_Add_input").blur(function () {
        debugger;
        var _name = $.trim($(".roleMenu_Add_input").val());
        if (regex_reName.test(_name)) {
            $('.model_name_tip').hide();
            nameflag = true;
        } else {
            $('.model_name_tip').html('不可空置/支持中英文，最多32个字符').show();
            nameflag = false;
        }
    });
    //提交按钮
    addDom.on('click', function () {
        var _brandId = $(".send").val();
        debugger;
        if (categoriesId3.length < 1) {
            $(".cate_check_tip").show();
            return false;
        } else {
            $(".cate_check_tip").hide();
        }
        ;
        debugger;
        if($(".roleMenu_Add_input").val().length>0){
            var _name = $.trim($(".roleMenu_Add_input").val());
            flag = regex_reName.test(_name);
        }else {
            flag = false;
        }
        debugger;
        if (!flag) {
            $(".model_name_tip").show();
            return false;
        } else {
            $(".cate_check_tip").hide();
        }
        var param = {
            brandId: brandSelect_has,
            model: _name,
            leafClassId: categoriesId3
        };
        roleMenuAdd_fun(param);
    });
});

/*三级联动勾选逻辑*/
function filterCategories() {
    dataOrigin = dataJson.options;
    var str = "";
    debugger
    $.each(dataOrigin, function (index, item) {
        str += '<li data-id="' + item.id + '">' + item.name + '</li>'
    });
    $("#selectbox1 ul").html(str);
    $("#selectbox2").css("background-color", "#eaecf2");
    $("#selectbox3").css("background-color", "#eaecf2");
    $("#selectbox1 ul li").click(function () {
        $("#selectbox2").selectBox("removeAll");
        $("#selectbox3").selectBox("removeAll");
        var $this = $(this);
        categoriesId1 = $this.attr('data-id');//一级id抓取
        var str2 = "";
        $.each(dataOrigin, function (index, item) {
            if (item.id == categoriesId1) {
                $.each(item.child, function (index2, item2) {//匹配二级数据并渲染
                    str2 += '<li data-id="' + item2.id + '">' + item2.name + '</li>'
                })
            }
        });
        $("#selectbox2 ul").html(str2);
        $("#selectbox2").css("background-color", "#fff");
        $("#selectbox3").css("background-color", "#eaecf2");
        $("#selectbox2 ul li").click(function () {
            $("#selectbox3").selectBox("removeAll");
            var $this = $(this);
            categoriesId2 = $this.attr('data-id');
            var str3 = "";
            $.each(dataOrigin, function (index, item) {
                //一级遍历
                if (item.id == categoriesId1) {//抓取一级
                    $.each(item.child, function (index2, item2) {//遍历二级
                        if (item2.id == categoriesId2) {//抓取已选择二级
                            $.each(item2.child, function (index3, item3) {//三级遍历
                                str3 += '<li data-id="' + item3.id + '">' + item3.name + '</li>'
                            });
                        }
                    })
                }
            });
            $("#selectbox3 ul").html(str3);
            $("#selectbox3").css("background-color", "#fff");
            $("#selectbox3 ul li").click(function () {
                $(".model_name_con").html("");
                var _brandId = $(".send").val();
                var $this = $(this);
                categoriesId3 = $this.attr('data-id');
                debugger;
                var model_param = {
                    leafClassId: categoriesId3,
                    brandId: _brandId
                };
                $.ajax({
                    type: "post",
                    url: mode_AllUrl,
                    catch: false,
                    async: false,
                    data: model_param,
                    dataType: "json",
                    success: function (data) {
                        debugger;
                        if (data.success == true) {//判断返回参数中某个数据，不是这个
                            var str = "";
                            if(data.data.length>0){
                                $(data.data).each(function (i, v) {
                                    str += "<li class='model_name fl' data-id='" + v.spuId + "'>" + v.model + "</li>";
                                })
                                $(".model_name_con").html(str);
                                $(".model_name_box").show();
                            }else {
                                $(".model_name_box").hide();
                            }
                        } else {
                            alert(data.message);
                        }
                    },
                    error: function () {
                    }
                });
            })
        });
    });
}

//添加菜单交互函数【目前还不全】
function roleMenuAdd_fun(param) {
    $.ajax({
        type: "post",
        url: roleMenuAdd_Url,
        dataType: "json",
        data: param,
        success: function (data) {
            debugger;
            if (data.success == true) {//判断返回参数中某个数据，不是这个
                var html = template('ajax_alert', {});
                $.popwin(html, {
                    title: '提示',
                    fixed: true,
                    drag: false, //是否可拖拽
                });
                $("#popwin_Out").addClass("attr_manag_add");
                $.popwin.setPosition(410, 460);
                $(".attr_manag_add .mask_tip").html(data.message);

                $("#popwin_Close").on("click",function () {
                    self.location = document.referrer;
                })
            } else {
                var html = template('ajax_alert', {});
                $.popwin(html, {
                    title: '提示',
                    fixed: true,
                    drag: false, //是否可拖拽
                });
                $("#popwin_Out").addClass("attr_manag_add");
                $.popwin.setPosition(410, 460);
                $(".attr_manag_add .mask_tip").html(data.message);
                // alert('该分类名已经存在')
            }
        },
        error: function () {
        }
    });
}



