
//ztree
function ztreeMain(data){
    $(function(){
        var setting = {
            view: {dblClickExpand: false},
            data: {simpleData: {enable: true}},
            callback: {onClick: onClick}
        };
        var zNodes =data.zNodes;
        function onClick(e, treeId, treeNode) {
            $("#citySel").val(treeNode.name);
            $("#deptpid").val(treeNode.id);
        }
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
    });
}
function onCheck(e,treeId,treeNode){
    var treeObj=$.fn.zTree.getZTreeObj("treeDemo"),
        nodes=treeObj.getCheckedNodes(true);
    var value="";
    for(var i=0;i<nodes.length;i++){
        if(null!=nodes[i].id){
            value+="/"+nodes[i].id;
        }
    }
    parent.$("#bookdept").val(value);
}

//开启选择乘机人窗口
$("body").on("click",".choice-cjr",function(){
    if($("#shengpiguize").length>0 &&$.trim( $("#shengpiguize").val())==""){
        $('input[name="approveId"]').val($(".approve_id_s").val());
        $("#shengpiguize").val($(".approve_id_name").val());
    };
    var relation = $(this).attr("data-relation");
    if(relation){
        updateSelected (relation );
        $(".Screen-full").show();
        $("body").addClass("scroll-hide");

        // getHistory(updateHistoryPass,relation);
    }else{
        updateSelected ();

        $(".Screen-full").show();
        $("body").addClass("scroll-hide");

        getHistory(updateHistoryPass);
    }
    if($(".fanxian").val()=="true"){
        var id = $(".fanxian-linshi").val();
        var cid = $(".cid").val();
        $(".remove-fenxiao").remove();
        if($('.list-phone').length<=0){
            var html = '<div class="float-left position input-c list-phone">'+
                '<span class="float-left">手机号码：</span>'+
                '<div class="float-left position">'+
                '<input type="text" name="mobile" class="input" />'+
                '</div>'+
                '<input type="hidden" name="deptid" value="'+id+'">'+
                '<input type="hidden" name="name" value="">'+
                '<input type="hidden" name="companyid" value="'+cid+'">'+
                '<input type="hidden" name="accno" value="" id="emp-accno">'+
                '<input type="hidden" name="username" value="" id="emp-username">'+
                '<input type="hidden" name="certtype" value="" >'+
                '<input type="hidden" name="certno" value="" >'+
                '</div>';
            $('.append-list').append(html);
        }
    }

});
// 拿到页面值
function updateSelected (relation) {
    var html = '';

    $('.e-p-model').each(function () {
        var $this = $(this);
        var data = {
            id: $this.attr('data-id'),
            level: $this.attr('data-level'),
            certtype: $this.attr('data-certtype'),
            certno: $this.attr('data-certno'),
            name: $this.attr('data-name'),
            deptname: $this.attr('data-deptname'),
            mobile: $.trim($this.find('.user_mobile').val()),
            email: $.trim($this.find('.user_email').val()),
            birthday: $this.attr('data-birthday'),
            passtype: $this.attr('data-passtype'),//旅客类型-1:员工||0:临客
            itemNumber:$this.attr('data-itemNumber'),
            itemNumberId:$this.attr('data-itemNumberId'),
            costId:$this.attr('data-costId'),
            costName:$this.attr('data-costName'),
            departmentid:$this.attr('data-departmentid')
        };

        html +=
            '<div class="s-c-show float-left" ' +
            'data-id="' + data.id + '" data-level="' + data.level + '" ' +
            'data-certtype="' + data.certtype + '" data-certno="' + data.certno + '" ' +
            'data-mobile="' + data.mobile + '" data-name="' + data.name + '"' +
            'data-deptname="' + data.deptname + '" data-departmentid="'+data.departmentid+'" data-email="' + data.email + '" data-passtype="' + data.passtype + '" " data-itemNumber="' + data.itemNumber + '"" data-itemNumberId="' + data.itemNumberId + '"" data-costId="' + data.costId + '"" data-costName="' + data.costName + '" data-birthday="' + data.birthday + '">' +
            '<div class="e-select-p font-size-12 position background-fff text-ellipsis">' +
            '<span class="userSelect cursor">' + data.name + '</span>' +
            '<span class="position-ab removeUserSelect cursor hide" title="' + data.name + '">删除</span>' +
            '</div>' +
            '</div>';
    });

    $(document).find('.selected-pass').html(html);
}


//关闭选择乘机人窗口
$("body").on("click",".close-person",function(){
    $(".Screen-full").hide();
    $("body").removeClass("scroll-hide");
});
//乘机人内部窗口切换
$("body").on("click",".tab-e",function(){
    var this_=$(this),
        this_data_value=this_.attr("data-tabShut");
    $(".tab-e-select").removeClass("tab-e-select");
    this_.addClass("tab-e-select");
    $("div[data-tabContent]").hide();
    $("div[data-tabContent='"+this_data_value+"']").show();
});
// 乘机人内部删除选中乘机人悬浮显示
$("body").on("mouseover mouseout",".e-select-p",function(e){
    var this_=$(this).find(".removeUserSelect");
    if(e.type==="mouseover"){
        this_.show();
    }else{
        this_.hide();
    }
});
// 乘机人内部删除选中乘机人
$("body").on("click",".removeUserSelect",function(){
    $(this).closest(".s-c-show").remove();
});


// action-input-员工-实时搜索-模糊查询
$('body').on('textchange', '#search-staff', function () {
    var $this = $(this);

    var keyword = $this.val();

    if (keyword == '')  {
        $('.staff-wraper').html('');
        return ;
    }

    ajaxEmp(keyword, updateEmp);

});

/**
 * ajax-搜索员工数据
 * @param {String} keyword 搜索关键词
 * @param {Function} callback 解析员工数据回调
 */
function ajaxEmp (keyword, callback) {
    $.ajax({
        url: '/getStaff',
        type: 'POST',
        data: { keyword: keyword },
        success: function(data) {
            if(data.status != 200){
                layer.msg(data.msg + '|' + data.status);
                console.error(data);
                return ;
            }

            var _data = JSON.parse(data.data);

            typeof callback == 'function' && callback(_data);
        },
        error: function(error){
            layer.msg(error.status == 0 ? "网络超时，请重试" : "服务器内部错误");
            console.error(error);
        }
    });
}
/**
 * callback-parse-解析-员工数据
 * @param {Array} data 员工数据
 */
function updateEmp (data) {
    var html = '';

    $.each(data, function (index, curr) {
        html +=
            '<li class="e-every-o clear" ' +
            'data-name="' + curr.name + '" ' +
            'data-id="' + curr.id + '" ' +
            'data-level="' + curr.zhiwei + '" ' +
            'data-mobile="' + curr.mobile + '"' +
            'data-certtype="' +  curr.certtype + '" ' +
            'data-certno="' + curr.certno + '" ' +
            'data-deptname="' + curr.deptname + '" ' +
            'data-email="' + curr.email + '" ' +
            'data-itemNumberId="' + curr.itemNumberId + '" ' +
            'data-itemNumber="'+curr.itemNumber+'" ' +
            'data-costName="'+curr.costName+'" ' +
            'data-costId="'+curr.costId+'" ' +
            'data-passtype="1" d' +
            'ata-linkEmpid="' + curr.linkEmpid + '" ' +
            'data-birthday="' + curr.birthday + '" ' +
            'data-departmentid="'+curr.deptid+'"' +
            'style="position:relative;">'  +
            (curr.linkEmpid!=0?'<span class="linkEmpid" style="position:absolute;left:0;border:1px solid #3e4eb2;width:30px;height:20px;color:#3e4eb2;text-align:center;font-size:12px;line-height:20px;top:7px;">常用</span>':"")+'<span class="p-name hoverTips hover_content " >' + curr.name + '</span>' +
            '<span class="p-certno">' + curr.certno + '</span>' +
            '<span class="p-tel">' + curr.mobile + '</span>' +
            '<span class="p-dept hoverTips hover_content">' + curr.deptname + '</span>' +
            '</li>';
    });

    $('.staff-wraper').html(html);
}
//当linkEmpid!=0是展示常用标识，并置灰不可点击
// 点击-乘客-选择
$('body').on('click', '.e-every-o', function() {
    var $this = $(this);
    if($(this).attr("data-linkEmpid")!=0&&$("#relevation-person").attr("data-relation")){

    }else if($(this).attr("data-linkEmpid")==0&&$("#relevation-person").attr("data-relation")){
        var data = {
            id: $this.attr('data-id'),
            name: $this.attr('data-name'),
            level: $this.attr('data-level'),
            certtype: $this.attr('data-certtype'),
            certno: $this.attr('data-certno'),
            deptname: $this.attr('data-deptname'),
            passtype: $this.attr('data-passtype'),//旅客类型-1:员工||0:临客
            mobile: $this.attr('data-mobile'),
            email: $this.attr('data-email'),
            birthday: $this.attr('data-birthday'),
            itemNumber: $this.attr('data-itemNumber'),
            itemNumberId: $this.attr('data-itemNumberId'),
            costId: $this.attr('data-costId'),
            costName: $this.attr('data-costName'),
            departmentid:$this.attr('data-departmentid')

        };

        updatePassSelect(data, false);

    }else{
        var data = {
            id: $this.attr('data-id'),
            name: $this.attr('data-name'),
            level: $this.attr('data-level'),
            certtype: $this.attr('data-certtype'),
            certno: $this.attr('data-certno'),
            deptname: $this.attr('data-deptname'),
            passtype: $this.attr('data-passtype'),//旅客类型-1:员工||0:临客
            mobile: $this.attr('data-mobile'),
            email: $this.attr('data-email'),
            birthday: $this.attr('data-birthday'),
            itemNumber: $this.attr('data-itemNumber'),
            itemNumberId: $this.attr('data-itemNumberId'),
            costId: $this.attr('data-costId'),
            costName: $this.attr('data-costName'),
            departmentid:$this.attr('data-departmentid')
        };

        updatePassSelect(data, false);
    }
});

// 更新-选中乘客
function updatePassSelect (currData, isAddEmp) {

    var size = $(document).find('.selected-pass').children().size();

    var limit = $('.choice-cjr').attr('data-limit');

    if (size >= limit) {
        layer.msg('最多选择 ' + limit + ' 人！');
        return ;
    }

    isAddEmp && (currData.level = currData.zhiwei);

    var defaultData = {
        id: '',
        name: '',//name 员工
        level: '',
        certtype: '',
        certno: '',
        deptname: '',
        mobile: '',
        email: '',
        birthday: '',
        passtype: '',//旅客类型-1:员工||0:临客
        username: '',//username 临客-常用联系人
        costId:'',
        costName:'',//成本中心,
        itemNumber:'',//项目中心
        itemNumberId:'',
        departmentid:''//部门id
    };

    var data = $.extend({}, defaultData, currData);

    // TODO:20171025-wxj-判断证件号码是否存在
    // TODO:20180518-zh-领导让去掉该验证
    // if (data.certno == '') {
    //     layer.msg('请添加乘客的证件信息！');
    //     return ;
    // }

    // 判断重复
    var $selectPass = $(document).find('.selected-pass');
    if ($selectPass.find('.s-c-show[data-certno="' + data.certno + '"]').length > 0) {
        layer.msg('相同证件号码人员已存在！');
        return ;
    }

    var html = '';
    html +=
        '<div class="s-c-show float-left" ' +
        'data-id="' + data.id + '" ' +
        'data-level="' + (data.level ? data.level : $('.loginZhiji').val()) + '" ' +
        'data-mobile="' + data.mobile + '"' +
        'data-certtype="' + data.certtype + '" ' +
        'data-certno="' + data.certno + '" ' +
        'data-name="' + (data.name ? data.name : data.username) + '"' +
        'data-deptname="' + (data.deptname ? data.deptname : '临时乘客') + '" ' +
        'data-email="' + data.email + '" ' +
        'data-itemNumberId="' + data.itemNumberId + '"' +
        'data-itemNumber="' + data.itemNumber + '" ' +
        'data-costId="' + data.costId + '"  ' +
        'data-costName="' + data.costName + '"' +
        'data-passtype="1" ' +
        'data-birthday="' + data.birthday + '"' +
        'data-departmentid="'+data.departmentid+'"' +
        '>' +

        '<div class="e-select-p font-size-12 position background-fff text-ellipsis">' +
        '<span class="userSelect cursor">' + (data.name ? data.name : data.username) + '</span>' +
        '<span class="position-ab removeUserSelect cursor hide" title="' + (data.name ? data.name : data.username) + '">删除</span>' +
        '</div>' +
        '</div>';

    $selectPass.append(html);

}


// action-点击-确定
$('body').on('click', '.select-true-p', function () {
    if($(".choice-cjr").attr("data-relation")){
        relation()
    }else{
        updatePassList($(document).find('.selected-pass').find('.s-c-show'), policyCallback, false);
        $('.e-c-y-lx').removeClass('active');

        // $(document).find('.passanger-model').find('.e-p-model[data-passtype="0"]').each(function () {
        // 常用联系人第一个元素为员工
        $(document).find('.passanger-model').find('.e-p-model').each(function () {
            var certno = $(this).attr('data-certno');

            $('.e-c-y-lx[data-certno="' + certno + '"]').addClass('active');

        });
        $("body").removeClass("scroll-hide");
    }
});


/**
 * 更新乘客列表
 * @param {jQuery} $dom 乘客列表dom
 * @param {Function} matchPolicyCallback 匹配差旅政策的回调函数
 * @param {Boolean} isAppend 更新乘客列表的方式  appen||html
 */
function updatePassList ($dom, matchPolicyCallback, isAppend) {
    if ($dom.size() == 0) {
        layer.msg('至少选择一位！');
        return ;
    }
    $(".Screen-full").hide();
    var cid = $('.cid').val();
    var html = ''/*, level = ''*/;
    var $modelFlag = $('#model-flag');
    var modelFlag = $modelFlag.attr('data-modelflag');
    var isHuiChuanFlag = $(".isHuiChuan").val();
    var assistFlag = $modelFlag.attr('data-assistflag');
    var costcenter = $('.costcenter_hidden').val(), //成本中心标志的判断 1 显示必填 2不显示 3显示不必填
        costcenterinput = $('.costcenterinput_hidden').val(), //成本中心标志的判断 是否可以输入
        projectinfo = $('.projectinfo_hidden').val(),//项目中心标志判断  1 显示必填 2不显示 3显示不必填
        projectinfoinput = $('.projectinfoinput_hidden').val();//项目中心标志判断 是否可以输入
    // 是否有编辑乘客人信息的权限
    // var canEdit = $('.person-model').attr('data-editctr') == 1;
    var canEdit = $('.addempflage').val();

    $dom.each(function (index) {

        var $this = $(this);
        var data = {
            id: $this.attr('data-id'),
            level: $this.attr('data-level'),
            certtype: $this.attr('data-certtype'),
            certno: $this.attr('data-certno'),
            name: $this.attr('data-name'),
            deptname: $this.attr('data-deptname'),
            mobile: $this.attr('data-mobile'),
            email: $this.attr('data-email'),
            birthday: $this.attr('data-birthday'),
            passtype: $this.attr('data-passtype'),//1:员工||0:临时乘客
            costId : $this.attr('data-costId'),//成本中心id
            costName : $this.attr('data-costName'),
            itemNumberId :$this.attr('data-itemNumberId'),
            itemNumber : $this.attr('data-itemNumber'),//项目中心
            departmentid : $this.attr('data-departmentid'),//部门id
        };
        var _index = (isAppend ? $('.passanger-model').find('.e-p-model').length : index);
        var addempflage = $('.getShowname').val();
        // 默认证件信息
        var defCert = certificates(cid,data.id);
        var empName = defCert.certUserName;
        html +=
            '<div class="e-p-model clear" ' +
            'data-id="' + data.id + '" ' +
            'data-level="' + data.level + '" ' +
            'data-certtype="' + defCert.certType + '" ' +
            'data-certno="' + defCert.certNo + '" ' +
            'data-name="' + empName + '" ' +
            'data-itemNumber="' + data.itemNumber + '"' +
            'data-itemNumberId="' + data.itemNumberId + '" ' +
            'data-costId="' + data.costId + '" ' +
            'data-costName="' + data.costName + '" ' +
            'data-itemNumber="' + data.itemNumber + '" ' +
            'data-deptname="' + data.deptname + '" ' +
            'data-passtype="' + data.passtype + '" ' +
            'data-birthday="' + data.birthday + '"' +
            'data-isCertificates="' + defCert.isCertificates + '"' +
            'data-departmentid="' + data.departmentid +'">'+
            '<div class="p-m-name clear">' +
				'<div class="loginName" >' +
					'<span>2</span>' +
            		(empName?empName:"")+
				'</div>' +
				'<div class="edit-del">' +
					(canEdit==1? '<span class="edit_p">编辑</span>' : '') +
					'<span class="remove_p">删除</span>' +
				'</div>' +
			'</div>' +
            '<div class="certificate">' +
				'<div class="certificate-row clear">' +
					'<div class="cert-left">' +
						'<span>证件类型：</span>' +
						'<div class="drop-centro">' +
							'<select class="_select_ certCard " data-isdefault="'+defCert.isdefault+'" data-value="' + defCert.isdefault + '" value="' + defCert.isdefault + '" datatype="*" nullmsg="请选择证件类型">' +
								defCert.html+
							'</select>' +
						'</div>' +
					'</div>' +
					'<div class="cert-right">' +
            			'<span></span>' +
            			'<span class="notice">发送通知</span>' +
						'<div class="cert-btn">' +
							'<div class="label label-checkbox cursor mobile_isSend #if($!airUser.isSend == true) label-select-checkbox #end #if(\'$!airUser.mobile\'==\'\')show_choice_default #end  send_sms_pass_d">' +
							'<span class="show_choice"></span>' +
							'<input type="hidden" name="airUser[$!{index}].isSend" data-is="isSend-isSendEmail" value="$!airUser.isSend">' +
							'<span>短信</span>' +
							'</div>' +
							'<div class="label label-checkbox cursor email_isSendEmail #if($!airUser.isSendEmail ==true) label-select-checkbox #end #if(\'$!airUser.email\'!=\' \')#else show_choice_default #end send_sms_pass_d" >' +
							'<span class="show_choice"></span>' +
							'<input type="hidden" name="airUser[$!{index}].isSendEmail" data-is="isSend-isSendEmail" value="$!airUser.isSendEmail">' +
							'<span>邮件</span>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>';
				html += '<div class="certificate-row clear">' +
					'<div class="cert-left" data-value="true">' +
						'<span>证件号码：</span>' +
						'<div class="input-centro">' +
							'<input type="text" class="input user_centro" name="" readonly value="">' +
						'</div>' +
					'</div>' +
					'<div class="cert-right">' +
						'<span>所属部门：</span>' +
						'<input type="text" class="input user_dept" readonly placeholder="请输入部门" value="">' +
					'</div>' +
					'</div>';
				html += '<div class="certificate-row clear">' +
					'<div class="cert-left" data-value="true">' +
					'<span>手机号码：</span>' +
					'<div class="input-centro">' +
					'<input type="text" class="input user_centro" name="" readonly value="">' +
					'</div>' +
					'</div>' +
					'<div class="cert-right">' +
					'<span>成本中心：</span>' +
					'<input type="text" nullmsg="请选择'+(costcenterinput==1?"或输入成本中心":"成本中心")+'" placeholder="请选择'+(costcenterinput==1?"或输入":"")+'" autocomplete="off"  class="input costCenter-input"  name="airUser[' + _index + '].costName" value="' + data.costName + '">' +
					'</div>' +
					'</div>';
				html += '<div class="certificate-row clear">' +
					'<div class="cert-left" data-value="true">' +
					'<span>邮箱：</span>' +
					'<div class="input-centro">' +
					'<input type="text" name="airUser[' + _index + '].email" value="' + data.email + '" readonly="true" class="input user_email" placeholder="">' +
					'</div>' +
					'</div>' +
					'<div class="cert-right">' +
					'<span>项目中心：</span>' +
					'<input  type="text" placeholder="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'"  nullmsg="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'"  autocomplete="off"    class="input showname_falge '+(addempflage=="0"?"":"project-input")+'"  name="airUser[' + _index + '].itemNumber" value="' + data.itemNumber + '">' +
					'</div>' +
					'</div>';
        if (modelFlag == 'airOrder') {//机票模块
            if(costcenter ==1||costcenter ==3) {
                html += '<div class="float-left p-w-160 input-new" style="height:30px;">' ;
                html += '<input type="text" nullmsg="请选择'+(costcenterinput==1?"或输入成本中心":"成本中心")+'" placeholder="请选择'+(costcenterinput==1?"或输入":"")+'" autocomplete="off"  class="input costCenter-input"  name="airUser[' + _index + '].costName" value="' + data.costName + '">';
                html += '<input   type="hidden"  name="airUser[' + _index + '].costId" value="' + data.costId + '" >';
                if(costcenter ==1){
                    html += '<b class="red star_weight">*</b>';
                }
                html += '</div>';
            }
            //'+(projectinfoinput==1?"或输入":"")+'
            if(projectinfo==1||projectinfo==3){
                html +='<div class="float-left p-w-160 input-new" style="height:30px;">' ;
                html += '<input  type="text" placeholder="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'"  nullmsg="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'"  autocomplete="off"    class="input showname_falge '+(addempflage=="0"?"":"project-input")+'"  name="airUser[' + _index + '].itemNumber" value="' + data.itemNumber + '">' ;
                html += '<input  type="hidden"  name="airUser[' + _index +'].itemNumberId" value="' + data.itemNumberId + '">' ;
                if(projectinfo ==1){
                    html += '<b class="red star_weight">*</b>';
                }
                html +='</div>' ;
            }
            html += '</div>' +
                '<div class="clear margin-bottom-10 p-t-999">' +
                (addempflage =="0"?'<div class="float-left p-w-160 showNameCode">SHOWCODE：</div>' :"")+
                '<div class="float-left p-w-160">手机号码</div>' +
                '<div class="float-left p-w-160">邮箱</div>' +
                '<div class="float-left p-w-160">所属部门</div>' +
                '</div>' +
                '<div class="clear margin-bottom-10">' ;
        }
        else if (modelFlag == 'order' && assistFlag !='hotel') {//火车票模块
            html +=
                '<div class="float-left p-w-160 input-centro input-new">' +
                '<input style="border: 0px" type="text" name="users['+_index+'].certno" value="' + (defCert.certNo?defCert.certNo:"") + '" class="input user_centro" readonly placeholder="" datatype="*" nullmsg="证件号不能为空">' +
                '</div>' ;
            if(costcenter ==1||costcenter ==3) {
                html+= '<div class="float-left p-w-160 input-new" style="height:30px;">' +
                    '<input   type="text" nullmsg="请选择'+(costcenterinput==1?"或输入成本中心":"成本中心")+'" placeholder="请选择'+(costcenterinput==1?"或输入":"")+'" autocomplete="off" class="input costCenter-input"  name="users[' + _index + '].costName" value="' + data.costName + '">' +
                    '<input   type="hidden"  name="users[' + _index + '].costId" value="' + data.costId + '" >' ;
                if(costcenter ==1){
                    html += '<b class="red  star_weight">*</b>';
                }
                html += '</div>' ;
            }
            if(projectinfo==1||projectinfo==3) {
                html+= '<div class="float-left p-w-160 input-new" style="height:30px;">' +
                    '<input  type="text" placeholder="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'" nullmsg="请'+(addempflage=="0"?"输入SHOWNAME：":(projectinfoinput==1?"选择或输入":"选择"))+'"  autocomplete="off" class="input showname_falge '+(addempflage=="0"?"":"project-input")+'"  name="users[' + _index + '].itemNumber" value="' + data.itemNumber + '">' +
                    '<input  type="hidden"  name="users[' + _index + '].itemNumberId" value="' + data.itemNumberId + '">';
                if(projectinfo ==1){
                    html += '<b class="red  star_weight">*</b>';
                }
                html += '</div>' ;
            }

            html+= '</div>' +
                '<div class="clear margin-bottom-10 p-t-999">' +
                (addempflage=="0"?'<div class="float-left p-w-160 showNameCode">SHOWCODE：</div>' :"")+
                '<div class="float-left p-w-160">手机号码</div>' +
                '<div class="float-left p-w-160">邮箱</div>' +
                '</div>' +
                '<div class="clear margin-bottom-10">' ;
        }
        if(costcenter ==1||costcenter ==3) {
            html += '<div class="float-left p-w-160">'+
                '成本中心' + '</div>' ;
        }

        if(projectinfo==1||projectinfo==3){
            html += '<div class="float-left p-w-160">'+  (addempflage=="0"?"SHOWNAME：":(isHuiChuanFlag==1?"项目编码":"项目中心"))+
                '</div>';

        }

        if (modelFlag == 'airOrder') {//机票模块
            if(addempflage=="0"){
                html += '<div class="float-left p-w-160 showNameCode input-new" style="height:36px;">';
                html += '<input   type="text" name="airUser[' + _index + '].showCode" class="input " placeholder="请输入SHOWCODE" >';
                html += '<b class="red  star_weight">*</b>';
                html += '</div>';
            }
            html += '<div class="float-left p-w-160 input-mobile input-new">';
            html += '<input style="border: 0px"  type="text" name="airUser[' + _index + '].mobile" value="' + data.mobile + '"  readonly="true"  class="input user_mobile" placeholder="">';
        }

        else if (modelFlag == 'order' && assistFlag !='hotel') {//火车票模块
            if(addempflage=="0"){
                html += '<div class="float-left p-w-160 showNameCode input-new" style="height:36px;">';
                html += '<input  type="text" name="users[' + _index + '].showCode"  class="input " placeholder="请输入SHOWCODE" >';
                html += '<b class="red  star_weight">*</b>';
                html += '</div>';
            }
            html += '<div class="float-left p-w-160 input-mobile input-new">';
            html += '<input style="border: 0px"  type="text" name="users[' + _index + '].userPhone" value="' + data.mobile + '"  readonly="true"   class="input user_mobile" placeholder="">';
        }
        html +=
            '</div>' +
            '<div class="float-left p-w-160 input-email input-new">';
        if (modelFlag == 'airOrder') {//机票模块
            html += '<input style="border: 0px" type="text" name="airUser[' + _index + '].email" value="' + data.email + '" readonly="true" class="input user_email" placeholder="">';
        }

        else if (modelFlag == 'order' && assistFlag !='hotel') {//火车票模块
            html += '<input style="border: 0px" type="text" name="users[' + _index + '].email" value="' + data.email + '" readonly="true" class="input user_email" placeholder="">';
        }
        html +=
            '</div>' +
            '<div class="input-centro">' +
            '<input style="border: 0px" type="text" value="' + data.deptname + '" class="input user_dept" readonly placeholder="">' +
            '</div>' +
            '</div>';

        if (modelFlag == 'airOrder') {//机票模块
            html +=
                '<input type="hidden" name="airUser[' + _index + '].employeeid" value="' + data.id + '" class="e-id" />' +
                '<input type="hidden" name="airUser[' + _index + '].certtype" value="' + data.certtype + '" class="e-certtype" />' +
                '<input type="hidden" name="airUser[' + _index + '].id" value="' + data.passtype + '" class="e-passtype" />';
        }

        else if (modelFlag == 'order' && assistFlag !='hotel') {//火车票模块
            html +=
                '<input type="hidden" name="users[' + _index + '].userId" value="' + data.id + '" class="e-id" />' +
                '<input type="hidden" name="users[' + _index + '].idsType" value="' + data.certtype + '" class="e-certtype" />' +
                '<input type="hidden" name="users[' + _index + '].id" value="' + data.passtype + '" class="e-passtype" />';
        }
        html +=
            '</div>';
    });


    if (!isAppend) {
        $(document).find('.passanger-model').html(html);
        $('.certCard').each(function() {
            (new SelectMain()).creatSelect($(this));
        });
    }

    else {
        $(document).find('.passanger-model').append(html);
        (new SelectMain()).creatSelect($(document).find('.passanger-model').find('.certCard:last'));
    }

    var level = changeName();
    matchPolicyCallback(level);

    autoCountPrice();
}
$.ajax({
    url:"/crm/jiesuan",
    type:"post",
    success:function(data){
        if(data.data.fukuankemu=="4"){
            $.ajax({
                url:"/crm/employee/getDefaultDept",
                type:"post",
                success:function(data){
                    if(data.data!=""&&data.data!=null){
                        $(".fanxian-linshi").val(data.data.id)
                    }
                }
            });
            $(".fanxian").val("true");
            $("#save-staff-form").attr('action','/crm/employee/save');
            $(".fanxian-hide").show();
        }

    }
});
// aciton-点击-新增员工-保存
$('#save-staff-form').Validform({
    btnSubmit: "#save-staff",
    ajaxPost: true,
    beforeCheck: function(curform){
        if($('#shengpiguize').val()==""){
            $('.approve_id').val('0');
            $('#shengpiguize').val('无需审批');
        }
        if($(".fanxian").val()=="true") {
            $("#emp-accno").val($("input[name='mobile']").val());
            $("#emp-username").val($("input[name='mobile']").val());
            $("input[name='name']").val($("input[name='cert.username']").val());
            $("input[name='certtype']").val($(".cert_type_i").val());
            $("input[name='certno']").val($("input[name='cert.certificate']").val());
        }
        var certtypeIsID = $('#save-staff-form').find('[name="cert.certtype"]').val() == 1;
        var $birthday = $('.birthday');

        certtypeIsID ? $birthday.removeAttr('ignore') : $birthday.attr('ignore', 'ignore');

    },
    beforeSubmit: function(curform){
        //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
        //这里明确return false的话表单将不会提交;
        if($.trim($('input[name="approveId"]').val())==""&& $(".fanxian").val()!="true"){
            layer.msg("请必须选择审批规则项");
            return false;
        }
        var result = checkCertificate($(curform));
        return result;

    },
    callback: function(data){
        $.Hidemsg();
        if($(".fanxian").val()=="true"){
            layer.msg(data.info);
            if (data.status!="y"){
                return ;
            }else{
                setTimeout(function(){
                    $('#save-staff-form').find('input[name="cert.username"]').val('');
                    $('#save-staff-form').find('input[name="mobile"]').val("");
                    $('#save-staff-form').find('input[name="cert.certificate"]').val("");
                },3000);
            }

        }else{
            if(data.status != 200){
                layer.msg(data.msg);
            }else{
                layer.msg("保存成功");
                var _data = data.data;
                var newData = $.extend({}, _data, {passtype: 1});
                updatePassSelect(newData, true);
                // 清空填写内容
                var $currForm = $('#save-staff-form');
                $currForm.find(':input').val('');
                $currForm.find('.drop').each(function(){
                    var $this = $(this);
                    var $dropTitle = $this.find('.drop_title');
                    var titleCon = $this.find('.drop_option>li:first').text();
                    $dropTitle.text(titleCon);
                });
                $('.show').hide();
                $('#chinese').hide();
                $('#name_place').attr("placeholder", "如钱多多（必填）");
                $("#is_chinese_i_").val("1");
            }
        }
    }
});


// aciton-点击-新增常用联系人-保存
$('#save-linshi-form').Validform({
    btnSubmit: "#save-linshi",
    ajaxPost: true,
    beforeCheck: function(curform){
        var certtypeIsID = $('#save-linshi-form').find('[name="certtype"]').val() == 1;
        var $birthday = $('.birthday');

        certtypeIsID ? $birthday.removeAttr('ignore') : $birthday.attr('ignore', 'ignore');

    },
    beforeSubmit: function(curform){
        //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
        //这里明确return false的话表单将不会提交;

        var result = checkCertificate($(curform));
        return result;

    },
    callback: function(data){
        $.Hidemsg();
        layer.msg(data.msg);
        if (data.status != 200) return ;
        var _data = JSON.parse(data.data);
        var newData = $.extend({}, _data, {passtype: 1});

        updatePassSelect(newData, false);

        // 清空填写内容
        var $currForm = $('#save-linshi-form');
        $currForm.find(':input').val('');

        $currForm.find('.drop').each(function(){
            var $this = $(this);

            var $dropTitle = $this.find('.drop_title');

            var titleCon = $this.find('.drop_option>li:first').text();

            $dropTitle.text(titleCon);

        });

        // 更新常用联系人页面部分
        getLin(updateCYPass);

    }
});


/**
 * ajax-获取-历史记录-员工
 * @param {Function} callback 更新获取-历史记录-员工回调
 */
function getHistory(callback) {
    var model = $('.choice-cjr').attr('data-model');
    var url = '';

    switch (model) {
        case 'air':
            url = '/getAirHistory';
            break;

        case 'train':
            url = '/train/order/ancients';
            break;

        case 'hotel':
            url = '/hotel/order/ancients';
            break;

        default:
            break;
    }
    $.ajax({
        url: url,
        type: 'post',
        data: {size: 10},
        success: function(data){
            if (data.status != 200) {
                layer.msg(data.msg + '(' + data.status + ')');
                // console.error(data);
                return ;
            }

            var _data = JSON.parse(data.data);

            if (_data == null || (_data instanceof Array && _data.length == 0)) {
                return ;
            }

            typeof callback == 'function' && callback(_data);

        },
        error: function(xhr, errorType, error){
            layer.msg('获取历史记录人失败！');
            console.error(xhr);
            console.error(errorType || error);
        }
    });
}

/**
 * callback-更新获取-历史记录-员工回调
 * @param {Array} data 历史记录员工数据
 */
function updateHistoryPass (data) {
    var html = '';
    $.each(data, function (index, curr) {
        if(typeof curr == "object" && curr != null){
            html +=
                '<span class="e-h-pass" ' +
                'data-name="' + curr.name + '" ' +
                'data-id="' + curr.id + '" ' +
                'data-level="' + curr.zhiwei + '" ' +
                'data-mobile="' + curr.mobile + '"' +
                'data-certtype="' + curr.certtype + '" ' +
                'data-certno="' + curr.certno + '" ' +
                'data-deptname="' + curr.deptname + '" ' +
                'data-email="' + curr.email + '" ' +
                'data-passtype="1" ' +
                'data-birthday="' + curr.birthday + '"' +
                ' data-itemNumber="' + curr.itemNumber + '" ' +
                'data-itemNumberId="' + curr.itemNumberId + '" ' +
                'data-costId="' + curr.costId + '" ' +
                'data-costName="' + curr.costName + '"' +
                'data-departmentid="'+curr.deptid+'"' +
                '>' +
                curr.name +
                '</span>';
        }
    });

    $('.histoty-pass').html(html);

}

// action-点击-历史记录员工乘客
$('body').on('click', '.e-h-pass', function () {
    var $this = $(this);
    var data = {
        id: $this.attr('data-id'),
        name: $this.attr('data-name'),
        level: $this.attr('data-level'),
        certtype: $this.attr('data-certtype'),
        certno: $this.attr('data-certno'),
        deptname: $this.attr('data-deptname'),
        passtype: $this.attr('data-passtype'),//1:员工||0:临时乘客
        mobile: $this.attr('data-mobile'),
        email: $this.attr('data-email'),
        costId : $this.attr('data-costId'),//成本中心id
        costName : $this.attr('data-costName'),
        itemNumberId :$this.attr('data-itemNumberId'),
        itemNumber : $this.attr('data-itemNumber'),//项目中心
        departmentid :$this.attr('data-departmentid')//部门id

    };

    updatePassSelect(data, false);
});


// init-初始化页面前做的一些处理
(function() {
    var $modelFlag = $('#model-flag');
    var isBookPerson = $modelFlag.attr('data-isBookPerson') == 'true';
    var isBookSelf = $modelFlag.attr('data-isBookSelf') == 'true';
    var canAddCust = $modelFlag.attr('data-canAddCust') == 'true';
    var $airCommonP = $('.air-common-p');

    if (isBookPerson) {
        // (isBookSelf || canAddCust) ? getLin(updateCYPass) : $airCommonP.remove();
        //todo 2018-07-12 wsm 全部展示员工；
        getLin(updateCYPass);
    }
    else {
        /*canAddCust ? getLin(updateCYPass) : */$airCommonP.remove();
    }
}());
/**
 * ajax-获取-常用联系人
 * @param {Function} callback 更新常用联系人回调
 */
function getLin(callback) {

    $.ajax({
        url: '/get/newLinshi',
        type: 'post',
        success: function(data){

            // if (data.status != 200) {
            // 	// layer.msg(data.msg + '|' + data.status);
            // 	// console.error(data);
            // 	// return ;
            // }

            var _data = JSON.parse(data.data);

            if (_data == null || (_data instanceof Array && _data.length == 0)) {
                return ;
            }

            typeof callback == 'function' && callback(_data);

        },
        error: function(xhr, errorType, error){
            layer.msg('获取常用出行人失败！');
            console.error(xhr);
            console.error(errorType || error);
        }
    });
}

/**
 * callback-更新常用联系人回调
 * @param {Array} data 常用联系人数据
 */
function updateCYPass (data) {
    // 常用联系人不存在时
    if (data.length == 0) {
        $('.air-common-p').remove();
        return ;
    }

    var $passengerModel = $('.passanger-model');
    var leve = $passengerModel.attr('data-loginlevel');
    var _deptmame = $passengerModel.attr('data-logindept');
    var deptname = '临时乘客';

    var html = '';
    $.each(data, function (index, curr) {
        // todo:wxj-20171219-判断是否为当前登陆人
        var isLoginUser = curr.id == 0;
        html +=
            '<span class="float-left border-radius text-ellipsis e-c-y-lx ' + (isLoginUser ? 'isLoginUser' : '') + '" title="' + curr.name + '"' +
            'data-name="' + curr.name + '" ' +
            'data-id="' + (isLoginUser ? curr.empid : curr.id) + '" ' +
            'data-mobile="' + curr.mobile + '"' +
            'data-level="' + curr.zhiwei + '" ' +
            'data-certtype="' + curr.certtype + '"' +
            'data-certno="' + curr.certno + '" ' +
            'data-deptname="' +curr.deptname + '" ' +
            'data-email="' + curr.email + '" ' +
            'data-costId="' + curr.costId + '" ' +
            'data-costName="' + curr.costName + '"  ' +
            'data-itemNumberId="' + curr.itemNumberId + '"' +
            'data-itemNumber="' + curr.itemNumber + '" ' +
            'data-passtype="1" ' +
            'data-birthday="' + curr.birthday + '"' +
            'data-departmentid="'+curr.deptid+'"' +
            '>' +
            curr.name +
            '</span>';
    });

    $('.a-c-p-c').html(html).find('.e-c-y-lx:gt(4)').slideUp();
    /**************************新增初始化选中***********************************/
    $(".e-p-model").each(function(index,item){
        var id = $(this).data("id");
        $(".e-c-y-lx").each(function(){
            if(id==$(this).data("id")){
                $(this).addClass("active");
            }
        });

    });
    // 常用联系人少于 5 个时
    if (data.length < 6) {
        $('.cy-lxr').hide();
    }else {
        $('.cy-lxr').show();
        $('.changyong-person').text('更多').attr('data-status', 0);
    }
}

// action-点击-常用联系人
$('body').on('click', '.e-c-y-lx', function () {
    var $this = $(this);
    $this.toggleClass('active');

    if ($this.hasClass('active')) {

        var size = $(document).find('.passanger-model').children().size();

        var limit = $('.choice-cjr').attr('data-limit');

        if (size >= limit) {
            $this.removeClass('active');
            layer.msg('最多选择 ' + limit + ' 人！');
            return ;
        }

        updatePassList($this, policyCallback,true);
    }
    else {

        var certno = $this.attr('data-id');

        $(document).find('.passanger-model').find('.e-p-model[data-id="' + certno + '"]').remove();

        autoCountPrice();//价格计算

        var level = changeName();

        policyCallback(level);

    }

});

/**
 * 更新-name-属性值
 * 获取 level 值
 * @return {string}
 */
function changeName() {
    var level = '';

    // TODO:20171123-wxj-level字段修正
    // TODO:是否存在员工-存在员工 level只取值员工level||不存在员工 level为所有常用联系人（登录人）职级
    var isEixstEmp = $('.e-p-model[data-passtype="1"]').length > 0;

    $('.e-p-model').each(function(index) {

        var $this = $(this);
        var isEmp = ($this.attr('data-passtype') == 1);

        if (!isEixstEmp) {
            level += $this.attr('data-level') + '/';
        } else {
            if (isEmp) {
                level += $this.attr('data-level') + '/';
            }
        }

        // level += $this.attr('data-level') + '/';

        // 更改 乘客列表 name 属性值
        $this.find('[name]').each(function () {
            var _$this = $(this);

            var orginName = _$this.prop('name');

            var newName = orginName.replace(/\d{1,2}/, index);
            _$this.prop('name', newName);

        });
    });
    return level;
}


// action-点击-删除-乘客
$('body').on('click', '.remove_p ', function () {
    var $this = $(this);
    var $ePModel = $this.closest('.e-p-model');

    $ePModel.remove();

    var certno = $ePModel.attr('data-certno');
    $(document).find('.a-c-p-c').find('.e-c-y-lx[data-certno="' + certno + '"]').removeClass('active');

    autoCountPrice();//价格计算

    var level = changeName();

    policyCallback(level);

});



// action-点击-常用联系人
$('body').on('click', '.cy-lxr', function () {
    var $this = $(this).find('.changyong-person');

    var status = parseInt($this.attr('data-status'));

    var descStr = '常用出行人';

    // 开启状态
    if (status) {
        $this.text('展开').attr('data-status', 0);
        $('.a-c-p-c').find('.e-c-y-lx:gt(4)').slideUp();
    }
    // 关闭状态
    else {
        $this.text('收起').attr('data-status', 1);
        $('.a-c-p-c').find('.e-c-y-lx:gt(4)').slideDown();
    }

});
//出生日期维护
var Global = {
    flag: true,
    index: 0,
};

// action-证件类型-切换
$('body').on('click', '.drop-centro .drop_option li', function() {
    var val = $(this).parents('.drop-centro').attr('data-value');
    if(val=="false"){
        switching($(this), $(this).closest('.e-p-model'))
    }else{
        getCertNo($(this), $(this).closest('.e-p-model'),val);
    }
});
// // action-证件类型-切换
// $('body').on('click', '.drop-centro_isdefault .drop_option li', function() {
// 	getCertNo($(this), $(this).closest('.e-p-model'),true);
//
// });

//编辑信息切换
function switching($this,$ePModel){
    var type = $this.attr('data-values');
    $ePModel.find('.drop-centro [name="certtype"] option').each(function () {
        if(type==$(this).attr('value')){
            var data={
                certificate:$(this).attr('data-certificate'),
                username:$(this).attr('data-username'),
                certtype:type,
                certtypeName:$(this).text()

            };
            if($.trim($(this).attr('data-certificate'))==""){
                $ePModel.find('.edit-name-input').attr('readonly',false).removeClass('cursor_drop');
                // $ePModel.find('.edit-name-input').removeClass('cursor_drop');
            }else{
                $ePModel.find('.edit-name-input').attr('readonly',true).addClass('cursor_drop');
                // $ePModel.find('.edit-name-input').addClass('cursor_drop');
            }
            $ePModel.attr({'data-certno': data.certificate, 'data-name': data.username});
            $ePModel.find('.p-every-passes').text(data.username).attr('title', data.username);
            $ePModel.find('.edit-name-input').val(data.username);
            $ePModel.find('.user_centro').val(data.certificate);
            $ePModel.find('._select_').val(data.certtype);
            $ePModel.find('._select_').siblings('.drop_title').html(data.certtypeName);
        }
    })
}
/**
 * ajax-获取-证件号-并更新dom
 * @param {jQuery} $this 切换的当前dom元素
 */
function getCertNo($this, $ePModel,ls) {
    // 当前选择的证件
    var seltype = $this.attr("data-values");
    var empid = $ePModel.attr('data-id');
    var cid = $(".cid").val();
    var certs = maintainCertificates(cid, empid);
    if(certs == null || certs.length == 0){

        if(ls!="false"){
            zh.awares({
                newStyle: true,
                title: '温馨提示',
                text: '暂未维护证件信息，请联系您的差旅负责人'
            });
        }

    }else{
        var isExit = false;
        var defCert;
        $.each(certs, function(i, d){
            if(d.certtype == seltype){
                isExit = true;
                defCert = d;
            }
        });
        if(!isExit){
            $.each(certs, function(i, d){
                if(i == 0){
                    defCert = d;
                }
                if(d.isdefault == 1){
                    defCert = d;
                }
            });
            if(ls!="false"){
                zh.awares({
                    newStyle: true,
                    title: '温馨提示',
                    text: '暂未维护证件信息，请联系您的差旅负责人'
                });
                $('body').on('click','#knows',function(){
                    selectCert(defCert, $ePModel);
                });
            }

        }else{
            selectCert(defCert, $ePModel);
        }
    }
}

function selectCert(cert, $ePModel){
    $ePModel.attr({'data-certno': cert.certificate, 'data-name': cert.username});
    $ePModel.find('.p-every-passes').text(cert.username).attr('title', cert.username);
    $ePModel.find('.edit-name-input').val(cert.username);
    $ePModel.find('.user_centro').val(cert.certificate);
    $ePModel.attr('data-certtype',cert.certtype);
    $ePModel.find('._select_').val(cert.certtype);
    $ePModel.find('._select_').siblings('.drop_title').html(cert.certtypeName);
    $ePModel.find("input[name$='idsType']").val(cert.certtype);
    $ePModel.find("input[name$='certtype']").val(cert.certtype);
}


// action-点击-编辑
$('body').on('click', '.edit_p', function () {
    // 是否有编辑乘客信息权限
    var canEdit = $('.person-model').attr('data-editctr') == 1;
    if (!canEdit) return ;
    var $this = $(this).closest('.e-p-model');
    $this.addClass('editing');
    new editPass({
        id: $this.attr('data-id'),
        name: $this.attr('data-name'),
        mobile: $.trim($this.find('.user_mobile').val()),
        email: $.trim($this.find('.user_email').val()),
        certtype: $this.attr('data-certtype'),
        certno: $this.attr('data-certno'),
        passtype: $this.attr('data-passtype'),
        deptname:$this.attr('data-deptname'),
        birthday:$this.attr('data-birthday')
    });
    //身份证时不显示出生日期
    Global.flag = false;
    $('.drop_title')[0].innerText === '二代身份证' ? $('.identity').hide() : $('.identity').show();

});

/**
 * 编辑乘客
 * @param {Object} data 修改乘客必要的数据
 */
function editPass (data) {
    //公司id
    var cid = $('.cid').val();
    var dateFmt="'yyyyMMdd'";
    if(data.birthday==='null'){
        data.birthday===""
    }
    (function(){
        var titleName = (function(){
            if($("#model-flag").attr("data-modelflag") == "airOrder"){
                return "乘机人";
            }else if(($("#model-flag").attr("data-modelflag") == "order") && ($("#model-flag").attr("data-assistflag") == "hotel")){
                return "";
            }else{
                return "乘客";
            }
        })();
        var str =
            '<div class="modal-model">' +
            '<div class="modal-mask"></div>' +
            '<div class="modal-content edit-passenger animated bounceInDown">' +
            '<div class="p-s-title position clear">' +
            '<span class="float-left font-size-16">更换' + titleName + '信息</span>' +
            '<span class="position-ab close-person edit-pass-close cursor">×</span>' +
            '</div>' +
            '<div class="p-s-tContent">' +
            '<div class="tab-new-message">' +
            '<form action="/updatepass" method="post" id="save-pass-edit-form">' +
            '<div class="e-p-model" ' +
            'data-id="' + data.id + '" data-passtype="' + data.passtype + '" ' +
            'data-name="' + data.name + '" data-certno="' + data.certno + '"' +
            'data-deptname="' + data.deptname + '">' +
            '<div class="clear font-size-12 padding-bottom-14">' +
            '<div class="float-left position input-c position">' +
            '<span class="float-left amend">证件姓名：</span>' +
            '<input style="border: 0px;" type="text" id="IDname" '+(data.certno?"readonly":"")+'  name="name"  value="' + data.name + '"  class="input edit-name-input '+(data.certno?"cursor_drop":"")+' " placeholder="请输入姓名" datatype="*2-30" nullmsg="请填写姓名" errormsg="姓名内容过短（小于2个字符）/过长（大于30个字符）">'+
            '</div>' +
            '<div class="float-left position input-c">' +
            '<span class="float-left  amend">所属部门：</span>' +
            '<input style="border: 0px" type="text" value="' + data.deptname + '" class="input user_dept" readonly placeholder="请输入部门">' +
            '</div>' +
            '</div>' +
            '<div class="clear margin-bottom-10 p-t-999 amend" style="margin-top: 10px">' +
            '<div class="float-left p-w-160 ">证件类型</div>' +
            '<div class="float-left p-w-160 margin-left-30" >证件号码</div>' +
            '<div class="float-left p-w-160 margin-left-30">手机号码</div>' +
            '</div>' +
            '<div class="clear margin-bottom-10">' +
            '<div class="float-left drop-centro p-w-160" data-value="false">' +
            '<select class="_select_ " name="certtype" ' +
            ' data-value="' + data.certtype + '" ' +
            'value="' + data.certtype + '"' +
            'data-isdefault=""'+
            ' datatype="*1-10" ' +
            'nullmsg="请选择证件类型" >' +
            (certificates(cid,data.id).html)+
            '</select>' +
            '</div>' +
            '<div class="float-left p-w-160 input-centro margin-left-30">' +
            '<input  type="text" name="certno" value="' + data.certno + '"id="sfz" onblur="fillInfo()" class="input user_centro" placeholder="请输入证件号码">' +
            '</div>' +
            '<div class="float-left p-w-160 margin-left-30 ">' +
            '<input  type="text" name="mobile" value="' + data.mobile + '" class="input user_mobile" placeholder="请输入联系方式"  datatype="/^1[0123456789]{10}$/" error="手机号格式错误！" placeholder="请输入联系方式">' +
            '</div>' +
            '</div>' +
            '<div class="clear margin-bottom-10 p-t-999 amend">' +
            '<div class="float-left p-w-160">邮箱</div>' +
            '<div class="float-left p-w-160 margin-left-30 identity">出生日期</div>' +
            /*'<div class="float-left p-w-160 margin-left-30 identity" >性别</div>' +*/
            '</div>' +
            '<div class="float-left p-w-160 ">' +
            '<input  type="text" name="email" value="' + data.email + '" class="input user_email" placeholder="请输入邮箱" ignore="ignore" datatype="e" errormsg="邮箱格式错误！">' +
            '</div>' +
            '<div class="float-left p-w-160 margin-left-30 identity">' +
            '<input type="text"id="year" name="birthday" nullmsg="出生日期" onfocus="WdatePicker({readOnly:true,dateFmt:'+dateFmt+'})" autocomplete="off" class="input "   value="'+((data.birthday!=null && data.birthday!=undefined && data.birthday!="null"&&  data.birthday !="undefined" )?data.birthday:"")+'">'+
            '<div class="hite_year"id="diffet_birenr_d">'+
            '</div>'+
            '</div>' +

            '<div class="float-left p-w-160 margin-left-30 identity">' +
            /* '<div class="radio_div">'+/updatepass
             '<input type="radio" name="gender" id="man" value="0">'+
            ' <label for="male">男</label>'+
             '<input type="radio" name="gender" id="woman" value="1" >'+
            '<label for="female">女</label>'+
            ' </div>'+*/
            '</div>' +
            '</div>' +
            '<br>'+
            /* '<div class="clear margin-bottom-10 p-t-999 amend identity">' +
             '<div class="float-left p-w-160" >国籍</div>' +
             '</div>' +
             '<div class="float-left p-w-160 identity ">' +
             '<input  autocomplete="off"   id = "address" type="text" name="email" value="" class="input  " placeholder="请输入国籍" ignore="ignore" >' +

             '</div>'+

             '<input type="hidden" name="passtype" value="' + data.passtype + '">' +*/
            '<input type="hidden" name="eid" value="' + data.id + '">' +
            '<br>'+
            '<div class="text-align">' +
            '<button type="button" class="btn btn-default btn-big save" id="save-pass-edit"  >保存</button>' +
            ' <button class="btn btn-default btn-big bx_model_close cancel" type="button">取消</button>'+
            '</div>' +
            '</form>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        $('body').addClass('modal-open').append(str);
        (new SelectMain()).creatSelect($('.edit-passenger').find('._select_'));
    }());

//点击取消回到上一个页面

    // 点击-保存-编辑乘客
    $("#save-pass-edit-form").Validform({
        btnSubmit: "#save-pass-edit",
        ajaxPost: true,
        beforeSubmit: function(curform){
            var result = checkCertificate($(curform));
            return result;
        },
        callback: function(data){
            var certName = $("#IDname").val();
            var certno = $("#sfz").val();
            $.Hidemsg();
            layer.msg(data.msg);
            if (data.status != 200) return ;
            var _data = JSON.parse(data.data);
            var certDate = {certName:certName, certno:certno};
            updateEditPass(_data, certDate);
            removeEditModal();
        }

    });
    // 更新页面-视图层
    function updateEditPass (data, certDate) {
        var $editing = $('.editing');
        $editing
            .attr('data-name', certDate.certName || data.username)
            .attr('data-certtype', data.certtype)
            .attr('data-certno', certDate.certno || data.certno)

        $editing.find('.p-every-passes').text(certDate.certName || data.username).attr('title', certDate.certName || data.username);
        $editing.find('.user_mobile').val(data.mobile);
        $editing.find('.user_email').val(data.email);
        $editing.find('._select_').val(data.certtype).attr('data-value', data.certtype);
        $editing.find('.e-certtype').val(data.certtype);
        var text = $editing.find('._select_ option:selected').text();
        $editing.find('.drop_title').text(text);
        $editing.find('.user_centro').val(certDate.certno || data.certno);
        // 如果修改的是常用联系人
        if (data.username) {
            var $ecylx = $('.e-c-y-lx[data-id="' + data.id + '"]');
            $ecylx
                .attr('data-name', data.username)
                .attr('data-certtype', data.certtype)
                .attr('data-certno', certDate.certno || data.certno)
                .attr('data-mobile', data.mobile)
                .attr('data-email', data.email)
                .attr('title', certDate.certName || data.username)
                .text(data.username);
        }

        var mb =  data.mobile;
        var em =  data.email;
        if(mb == "" || !isPhoneSimp(mb)){
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").removeClass("label-select-checkbox");
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").addClass("show_choice_default");
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").find("input").val("0");
        }else{
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").addClass("label-select-checkbox");
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").removeClass("show_choice_default");
            $("body").find(".send_sms_pass_d[data-id='"+data.id+"']").find("input").val("1");
        }

        if(em == "" || !isEmail(em)){
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").removeClass("label-select-checkbox");
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").addClass("show_choice_default");
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").find("input").val("0");
        }else{
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").addClass("label-select-checkbox");
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").removeClass("show_choice_default");
            $("body").find(".send_eml_pass_d[data-id='"+data.id+"']").find("input").val("1");
        }
        removeEditModal();
    }
    // 点击关闭
    $('.edit-pass-close').on('click', function () {
        removeEditModal();
    });

    //点击取消
    $('.cancel').click(function () {
        removeEditModal();
        Global.flag = true;
    });

    // 清除编辑乘客模态框
    function removeEditModal() {

        $('.editing').removeClass('editing');

        $('.edit-passenger').removeClass('bounceInDown').addClass('bounceOutUp');
        setTimeout(function() {
            $('.modal-model').remove();
            $('body').removeClass('modal-open');
        }, 1000);
    }
}


/**
 * 证件类型匹配证件号校验
 * @param {jQuery} $form 需要验证的当前form表单jQ对象
 *
 * @return {Boolean} 返回验证结果 true-通过||false-不通过
 */
function checkCertificate($form) {
    var $currForm = $form;

    var certtype = $currForm.find('[name="certtype"]').val();

    if (certtype == '') {
        layer.msg('请选择证件类型');
        return false;
    }

    var centno = $currForm.find('[name="certno"]').val();

    // 证件号 为空
    if(centno == ''){
        layer.msg('证件号不能为空');
        return false;
    }

    var centnoRegE = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
    var passportnoRegE = new RegExp(/^[a-zA-Z0-9]{5,15}$/);

    // 证件号非空
    if(certtype == '1'){//身份证
        if(!centnoRegE.test(centno)){
            layer.msg('请输入正确的身份证号！');
            return false;
        }
    }else{//非身份证
        if(!passportnoRegE.test(centno)){
            layer.msg('请输入正确的证件号！');
            return false;
        }
    }

    return true;
}

//判断出生日期
$("body").on("click",".drop_option",function(){
    var val = $(".select-type").val();
    $(".dis-play").addClass("display-none");

    if(val=="C"||val=="G"||val=="B"||val=="ID"){
        $(".dis-play").removeClass("display-none");
    }
});
$('body').on("blur",'#shengpiguize',function(){
    if($.trim($("input[name='approveId']").val())==""){
        $("#shengpiguize").val("");
    }
});
//审批规则匹配
$('body').on("click keyup",'#shengpiguize',function(){
    if($.trim($('#shengpiguize').val())==""){
        $("input[name='approveId']").val("");
    }
    //初始化自动下拉数据模块
    var addrData=new DropAutoData({
        analyzerData:analyzerData,
        eventMain:eventMain,
        url:'/getApproveAll',
        this_:$(this),
        showField:"name",
        hideField:"id",
        model:'paging',
        index:"120",
        keyword:$(this).val(),
        // departmentid
    });
    addrData.interceptor();
    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data){
        var data=JSON.parse(data.data);
        this.volidate(data.list);
    }
    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
        $(".approve_id").val(this_.attr("data-id"));

    }
});

// 出生日期
function getData(){
    var ido=document.getElementById('certno');
    var bd=document.getElementById('bd');
    if(!/^\d{6}((?:19|20)((?:\d{2}(?:0[13578]|1[02])(?:0[1-9]|[12]\d|3[01]))|(?:\d{2}(?:0[13456789]|1[012])(?:0[1-9]|[12]\d|30))|(?:\d{2}02(?:0[1-9]|1\d|2[0-8]))|(?:(?:0[48]|[2468][048]|[13579][26])0229)))\d{2}(\d)[xX\d]$/.test(ido.value)){
        // alert('身份证号非法.');
        return;
    }
    bd.value=(RegExp.$1).substr(0,4)+'-'+(RegExp.$1).substr(4,2)+'-'+(RegExp.$1).substr(6,2);

}
//成本中心
$("body").on("click keyup",'.costCenter-input',function(e){
    e.stopPropagation();
    var _this = $(this);
    var keyword = $(this).val(); // 关键字
    var departmentid=$(this).parents('.e-p-model').attr('data-departmentid');
    var employeeid = $(this).parents('.e-p-model').attr('data-id');
    if(keyword==""){
        _this.siblings('input[name$="costId"]').val("");
    }
    //初始化自动下拉数据模块
    var addrData=new DropAutoData({
        analyzerData:analyzerData, 	// 分析器
        eventMain:eventMain, 		// 单击列表的主函数
        url:'/shopping/cost/center',// 请求url
        this_:$(this), 				// 当前元素
        showField:"name",			// 要展示在当前触发元素里的字段
        hideField:"id",				// 要展示在其他位置的字段
        model:"paging", 			// 判断是否为分页模式。paging代表分页模式
        departmentid:departmentid,			// 部门id
        employeeid:employeeid,			// 员工id
        keyword:keyword	,			// 关键字
        index:300
    });
    addrData.interceptor();
    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data){
        var data=data.data;
        this.pagingIn(data); //初始化分页参数
        this.volidate(data.items); //执行
    }
    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
        _this.val(this_.text());
        _this.siblings('input[name$="costId"]').val(this_.attr('data-id'));
    }
});
//项目中心
$("body").on("click keyup",'.project-input',function(e){
    e.stopPropagation();
    var _this = $(this);
    var departmentid=$(this).parent('.e-p-model').data('departmentid');
    var employeeid = $(this).parent('.e-p-model').data('id');
    var keyword = $(this).val(); // 关键字
    if(keyword==""){
        _this.siblings('input[name$="itemNumberId"]').val("");
    }
    //初始化自动下拉数据模块
    var addrData=new DropAutoData({
        analyzerData:analyzerData, 	// 分析器
        eventMain:eventMain, 		// 单击列表的主函数
        url:'/shopping/project',   // 请求url
        this_:$(this), 				// 当前元素
        showField:"name",			// 要展示在当前触发元素里的字段
        hideField:"id",				// 要展示在其他位置的字段
        model:"paging", 			// 判断是否为分页模式。paging代表分页模式
        departmentid:departmentid,			// 部门id
        employeeid:employeeid,			// 员工id
        keyword:keyword,				// 关键字
        index:300
    });
    addrData.interceptor();
    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data){
        var data=data.data;
        this.pagingIn(data); //初始化分页参数
        this.volidate(data.items); //执行
    }
    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
        _this.val(this_.text());
        _this.siblings('input[name$="itemNumberId"]').val(this_.attr('data-id'));
    }
});
//项目中心失焦事件
$("body").on("blur",'.project-input',function(){
    var projectinfoinput = $('.projectinfoinput_hidden').val();//项目中心标志判断 是否可以输入
    var _this = $(this);
    var val = _this.siblings('input[name$="itemNumberId"]').val();
    if(projectinfoinput!=1){
        if($.trim(val)==""||val=="0"){
            _this.val("");
        }
    }

});
//成本中心失焦事件
$("body").on("blur",'.costCenter-input',function(){
    var costcenterinput = $('.costcenterinput_hidden').val();//成本中心标志的判断 是否可以输入
    var _this = $(this);
    var val = _this.siblings('input[name$="costId"]').val();
    if(costcenterinput!=1){
        if($.trim(val)==""||val=="0"){
            _this.val("");
        }
    }
});

//当显示新增员工框是显示编辑按钮，反之不显示编辑按钮
$('#save-staff-form').click(function() {
    if (('data-tabshut') == 1) {
        $('.edit_p').hide();
    } else {
        $('.edit_p').show();
    }
});
$('body').on('click', '.drop_option li', function () {
    //如果点击的是身份证
    $('.identity').hide();
    if (this.innerText === '二代身份证') {
        //将带identity的class类全部隐藏
        $('.identity').hide();
    } else {

        $('.identity').show();
    }
});

// //新增员工

$('.show').hide();
$('#chinese').hide();
//通过body委托到要绑定事件目标
//第一个参数事件类型
//第二个参数委托事件的目标元素

$('body').on('click', '.card_type li', function () {
    //如果点击的是身份证
    if ($(this).attr('data-values')=== '1') {
        //将带show，English的class类全部隐藏
        $('.show').hide();
        $('#chinese').hide();
        $('#name_place').attr("placeholder", "如钱多多（必填）");
        $("#is_chinese_i_").val("1");
    } else { //不是点击身份证的
        //将带show，English的class类全部显示
        $('.show').show();
        $('#chinese').show();
        $('#chinese').attr('src', '/static/img/common/ying.png');
        $('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
        $("#is_chinese_i_").val("0");
    }
});

//新增员工中英文切换
var isCn = true;
$("#chinese").click(function () {
    isCn = !isCn;
    if (isCn) {
        $('#chinese').attr('src', '/static/img/common/zhong.png');
        $('#name_place').attr("placeholder", "如钱多多（必填）");
        $("#is_chinese_i_").val("1");

    }
    else {
        $('#chinese').attr('src', '/static/img/common/ying.png');
        $('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
        $("#is_chinese_i_").val("0");
    }
});
// 点击close关闭
$('.modal-close').click(function () {
    $('.hite_marked').fadeOut();
});

$("body").on("click keyup", '.nationality', function (e) {
    e.stopPropagation();
    var _this = $(this);
    var keyword = $(this).val(); // 关键字
    //初始化自动下拉数据模块
    var addrData = new DropAutoData({
        analyzerData: analyzerData, 	// 分析器
        eventMain: eventMain, 		// 单击列表的主函数
        url: '/component/country',   // 请求url
        this_: $(this), 				// 当前元素
        showField: "countryNameCn",			// 要展示在当前触发元素里的字段
        hideField: "id",				// 要展示在其他位置的字段
        model: "paging", 			// 判断是否为分页模式。paging代表分页模式
        keyword: keyword,				// 关键字
    });
    addrData.interceptor();

    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data) {
        var data = data.data;
        this.pagingIn(data); //初始化分页参数
        this.volidate(data.items); //执行
    }

    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_, active) { //,this_被点击的列表项，active当前输入框
        _this.val(this_.text());
//				_this.siblings('input[name$="itemNumberId"]').val(this_.attr('data-id'))
    }
});

//获取员工维护的证件信息
function maintainCertificates(cid, empid) {
    var certs;
    $.ajax({
        url: "/component/obtain/certificate",
        type: "post",
        async: false,
        data: {cid: cid, empid: empid},
        success: function (data) {
            certs = data.data;
        }
    });
    return certs;
}

//获取证件后台维护证件信息方法

//获取证件后台维护证件信息方法
function certificates(cid, empid) {
    var arr = [];
    var html = '';
    var isdefault = ""; // 是否默认
    var certType = ""; // 证件号
    var certNo = ""; // 证件号
    var certName = ""; // 证件类型名称
    var certUserName = "";
    var hasDefault = 0;
    var isCertificates = false;
    $.ajax({
        url: "/component/getEmpAllCert",
        type: "post",
        async: false,
        data: {cid: cid, empid: empid},
        success: function (data) {
            if (data.status == 200 && data.data != null && data.data.certModelList != null) {
                arr = data.data.certModelList;
            }
        }
    });
    if (arr.length > 0) {
        $.each(arr,function(index,item){
            if(item.isdefault==1){
                isdefault=item.certtype;
                certNo = item.certificate;
                certName = item.certtypeName;
                certType = item.certtype;
                certUserName = item.username;
                hasDefault = 1;
            }
            if(item.name){
                isCertificates=true;
            }
            html+='<option value="'+item.certtype+'" data-username="'+(item.username?item.username:"")+'" data-certificate="'+(item.certificate?item.certificate:"")+'">'+item.certtypeName+'</option>';
        });
        if (hasDefault == 0) {
            html = "";
            $.each(arr, function (index, item) {
                if(index==0){
                    isdefault=item.certtype || "";
                    certNo = item.certificate || "";
                    certName = item.certtypeName || "";
                    certType = item.certtype || "";
                    certUserName = item.username || "";
                }
                html += '<option value="' + item.certtype + '" data-username="'+(item.username?item.username:"")+'" data-certificate="'+(item.certificate?item.certificate:"")+'">' + item.certtypeName + '</option>';
            });
        }
    }
    return {
        html: html,
        isdefault: isdefault,
        certType: certType,
        certNo: certNo,
        certName: certName,
        certUserName: certUserName,
        isCertificates:isCertificates
    };
}


$(function(){
    $("body").on("click", ".send_sms_pass_d", function(){
        if($(this).hasClass("label-select-checkbox")){
            $(this).find("input").val("1");
        }else{
            $(this).find("input").val("0");
        }
    });
})


// 国籍and签发地
$("body").on("click keyup",'.nationality',function (e) {
    e.stopPropagation();
    var _this = $(this);
    var keyword = $(this).val(); // 关键字
    //初始化自动下拉数据模块
    var addrData=new DropAutoData({
        analyzerData:analyzerData, 	// 分析器
        eventMain:eventMain, 		// 单击列表的主函数
        url:'/component/country',   // 请求url
        this_:$(this), 				// 当前元素
        showField:"countryNameCn",			// 要展示在当前触发元素里的字段
        hideField:"id",				// 要展示在其他位置的字段
        model:"paging", 			// 判断是否为分页模式。paging代表分页模式
        keyword:keyword,// 关键字
        index:300
    });
    addrData.interceptor();
    /*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
    function analyzerData(data){
        var data=data.data;
        this.pagingIn(data); //初始化分页参数
        this.volidate(data.items); //执行
    }
    /***********数据处理器*单击下拉项，向页面指定位置铺值************/
    function eventMain(this_,active){ //,this_被点击的列表项，active当前输入框
        _this.val(this_.text());
//				_this.siblings('input[name$="itemNumberId"]').val(this_.attr('data-id'))
    }
});