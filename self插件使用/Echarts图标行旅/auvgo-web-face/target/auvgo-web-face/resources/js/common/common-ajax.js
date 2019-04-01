/**
 * Created by dell on 2018/10/23.
 */
//项目中心改为项目编码配置
$.ajax({
	url:"/isHuiChuan",
	type:"POST",
	success:function (data) {
		if(data.status==200){
			$('.isHuiChuan').val(1);
			$('.isHuiChuan_text').html(data.msg);
		}
	},
	error:function(err){
		console.error(err);
	}
	
});
