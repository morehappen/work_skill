// 点击-添加项目
$('body').on('click', '.add-project', function(){
	zh.iframes({
		url: '/crm/project/add/',
		title: $(this).html(),
		width: '600px',
		height: '520px'
	});
});

// 点击-编辑
$('body').on('click', '.edit', function(){
	zh.iframes({
		url: '/crm/project/edit/' + $(this).data('pid'),
		title: $(this).html(),
		width: '600px',
		height: '520px'
	});
});

//点击-删除
$('body').on('click', '.table .btn-danger', function(){
	var $this = $(this);
	deleteitem($this.data('pid'));
});


//删除
function deleteitem(pid){
	zh.confirms({
		title:"提示",
		text:"确定删除该项目么？"
	});
	
	$("body").on("click",".confirm_sure",function(){
		$.ajax({
			url: '/crm/project/remove/' + pid,
			type: 'post',
			success: function(data){
				if(data.status != 200){
					console.log(data);
					return ;
				}
				location.reload();
			},
			error:function(xhr, errorType, error){
				console.log(xhr);
				console.log(errorType || error);
			}
		});
	});
}
function daysLimit(dates){
	var bookDate=(new Date(dates)).getTime();
	var nowDate=(new Date()).getTime();
	var intervalTime=bookDate-nowDate-20*24*60*60*1000;
	(new loadDateMain()).isDate(dates,$("#afterDate")); //判断开始时间是否大于结束时间
}
//operation date mainFuction
function loadDateMain(){
	//Determine whether the former date is less than the latter date
	this.isDate=function(nowDate,after){
		var beforeTime=(new Date(nowDate)).getTime();
		var afterTime=(new Date(after.val())).getTime();
		if(!(beforeTime<afterTime)){
			var afterTime=new Date(beforeTime+1000*60*60*24*1);
			var month=(afterTime.getMonth()+1)<10 ? "0"+((afterTime.getMonth())+1) : (afterTime.getMonth()+1);
			var date=afterTime.getDate()<10 ? "0"+afterTime.getDate() : afterTime.getDate();
			after.val(afterTime.getFullYear()+"-"+month+"-"+date);
		}
	};
}


