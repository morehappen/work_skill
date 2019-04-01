//上传公共方法
$("body").on("change","#file_upload_js",function(){
    uploadMain_($(this));
});
function uploadMain_(this_) {
    var form = this_.parents("form"),
        url = form.attr("data-action_"),
        options = {
            url: url, //上传文件的路径
            type:'post',
            success:function(data){
                if(data.status === 200){
                    layer.msg(data.msg, {icon: 6});
                    setTimeout(function () {
                        top.location.reload();
                    },2000);
                    return;
                }else{
                    layer.msg(data.msg, {icon: 6});
                    setTimeout(function () {
                        location.reload();
                    },2000);
                    return;
                }
            }
        };
    form.ajaxSubmit(options);
}