//批量修改员工
function editListEmp(url){
    openIframe({'url':url,'title':'批量修改员工'});//批量修改员工
}
// 点击-批量修改员工
$('body').on('click', '.batch-modify', function(){
    // 选中员工判断
    if ($('.label-select-checkbox').length == 0) {
        zh.alerts({
            title: '提示',
            text: '请选择需要修改的员工!'
        });
        return false;
    }

    editListEmp('/crm/employee/editlist');

});

//员工导入
function editDaoru(url){
    openIframe({'url':url,'title':'员工导入','height':"425px",'color':"1"});//批量修改员工
}

//删除部门
function removeEmp(empid){
    zh.confirms({
        title:"提示",
        text:"确定删除该员工么？"
    });
    $("body").on("click",".confirm_sure",function(){
        $.ajax({
            type: "POST",
            url: "/crm/employee/removeEmp/"+empid,
            success: function(data){
                if (data.status == 200) {
                    zh.alerts({
                        title:"提示",
                        text:"删除成功"
                    });
                    $("body").on("click",".alert_event",function(){
                        top.location.href='/crm/employee';
                    });
                } else {
                    zh.alerts({
                        title:"提示",
                        text:"删除失败"
                    });
                }
            }
        });
    });
}
// 点击关联员工出现组织架构
$('#relevation-person').click(function(){
    if($(this).text() == '收起')
    {$(this).text('组织架构').css({"background":'white',"color":'#6461e2'})}
    else
    {$(this).text('收起').css({"background":'#6461e2',"color":'white'})}

// });
$('#relevation-person').click(function(){
    if($(this).text() == '收起')
    {$(this).text('组织架构').css({"background":'white',"color":'#6461e2'})}
    else
    {$(this).text('收起').css({"background":'#6461e2',"color":'white'})}
})

});
    $('#relevation-person').click(function () {
        if ($(this).text() == '收起') {
            $(this).text('组织架构').css({"background": 'white', "color": '#6461e2'})
        }
        else {
            $(this).text('收起').css({"background": '#6461e2', "color": 'white'})
        }
    })


