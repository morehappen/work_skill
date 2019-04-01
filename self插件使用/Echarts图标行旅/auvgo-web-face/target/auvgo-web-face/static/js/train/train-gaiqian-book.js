
// form-表单提交
$("#train-gaiqian-book-form").Validform({
    btnSubmit: "#train-gaiqian-book",
    ajaxPost: true,
    beforeSubmit: function(curform){
        console.log('122121');

    },
    callback: function(data){

        $.Hidemsg();

        if (data.status != 200) {
            layer.msg(data.msg + ' | ' + data.status);
            return ;
        }
        top.location.href = data.data;
    }
});