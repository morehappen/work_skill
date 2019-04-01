/************7天日历动态生成 start****************/

//************************
//dates_main(date_zhuanhua(new Date()),"1");// 初始化7天日历

//主函数执行初始化
/*
 * 主函数para:
 * 	nowDate："2017-1-4",当前日期，随便输入哪一天，这个日期默认选中状态，如果为今天，放在1的位置，否则放在4的位置
 * 	minDate:"2017-3-4",日历的最小日期
 * 	maxDate:"2017-2-5",日历的最大日期
 * 	pastFlag:true/false,是否开启今天之前置灰，不能点击
 */
//七天切换日历主函数入口
function DateSeventMain(datePara){
	this.nowDate=datePara.nowDate;  //初始化日期
	this.flag=datePara.flag;
	this.lock=datePara.lock;
	//this.minDate=datePara.minDate;  //最小日期
	this.startDate=null; //起始日期（操作初始化日期之后的结果）
	//this.pastFlag=datePara.pastFlag;//今天之前日期是否置灰
	this.dateSevenArr=[];
	this.dateWeekArr=[];
	this.now=(function(){
		var now=new Date();
		return (new Date(now.getFullYear(),now.getMonth(),now.getDate()));
	})(); //获取当前日期
	DateSeventMain.prototype.maxDate=datePara.maxDate=="-1" ? this.maxDate : (function(this_){
		 return (new Date(this_.now.getTime()+datePara.maxDate*24*60*60*1000));
	})(this);  //最大日期
	//格式化成计算的日期
	DateSeventMain.prototype.inputVolidate=function(){
		if(!(this.nowDate instanceof Date)){
			this.nowDate=Timechange(this.nowDate);
		}else{
			this.nowDate=new Date(this.nowDate.getFullYear(),this.nowDate.getMonth(),this.nowDate.getDate());
		}
		//this.minDate=Timechange(this.minDate);
		//this.maxDate=Timechange(this.maxDate);
		function Timechange(date){
			var dateArr=date.split("-"),
				year=parseFloat(dateArr[0]),
				month=parseFloat(dateArr[1]),
				day=parseFloat(dateArr[2]);
			return new Date(year,month-1,day);
		}
		this.getSevenDate(); //验证通过，开始提取七天
	};
	//返回值：
	//获取七天日期和星期
	DateSeventMain.prototype.getSevenDate=function(){
		var	nowDate=this.nowDate, //当前输入日期
			now=this.now, //现在系统时间
		 	apartdays=Math.ceil((nowDate.getTime()-now.getTime())/1000/60/60/24), //与今天相隔的时间
			sevenDateArr=[],
			weekArr=[];
		if(this.flag!="1" || this.lock=="1"){
			if(apartdays>=3){
				this.startDate=new Date(nowDate.getTime()-3*24*60*60*1000);
			}else{
				this.startDate=now;
			}
		}else{
			this.startDate=nowDate;
		}
		for(var i=0;i<7;i++){
			sevenDateArr.push(new Date(this.startDate.getTime()+i*24*60*60*1000));
			weekArr.push(this.xingqi_change(sevenDateArr[i].getDay()));
		}
		this.dateSevenArr=sevenDateArr;
		DateSeventMain.prototype.sevenData_ = sevenDateArr;
		this.dateWeekArr=weekArr;
		this.fullDate();
	};
	//向页面填充日期
	DateSeventMain.prototype.fullDate=function(){
		var nowDate=this.nowDate.getTime(),
			list="",
			target="",
			history="",
			dateSevenArr=this.dateSevenArr,
			dateWeekArr=this.dateWeekArr,
			this_now=this,
			maxDate=this.maxDate.getTime();
		if(dateSevenArr[0].getTime() <= this.now.getTime()){
			$(".prev_date").addClass("prev_date_t");
		}else{
			$(".prev_date").removeClass("prev_date_t");
		}
		if(dateSevenArr[6].getTime()>=DateSeventMain.prototype.maxDate.getTime()){
			$(".next_date").addClass("next_date_t");
		}else{
			$(".next_date").removeClass("next_date_t");
		}
		$.each(dateSevenArr,function(index,item){
			if(item.getTime()>maxDate || item.getTime()<this_now.now){
				history="history";
			}else{
				history="";
			}
			if(item.getTime()===nowDate && (this_now.flag!="1" || this_now.lock=="1")){
				target="seven_date_target";
			}else{
				target="";
			}
			list+= "<li data-date='"+(item.getFullYear()+"-"+this_now.date_zhuanhua(item))+"' class='border-5-radius "+target+" "+history+"'>" + this_now.date_zhuanhua(item) + "("+dateWeekArr[index] + ")" + "</li>";
		});
		$("#date_train_tab").attr("data-year",dateSevenArr[0].getFullYear()).html("").append(list);
	};
	DateSeventMain.prototype.xingqi_change=function(week){
		switch (week) {
			case 0:
				return "星期日";
			case 1:
				return "星期一";
			case 2:
				return "星期二";
			case 3:
				return "星期三";
			case 4:
				return "星期四";
			case 5:
				return "星期五";
			case 6:
				return "星期六";
			default:
				break;
		}
	};
	DateSeventMain.prototype.date_zhuanhua=function(Date){
		// var year = parseInt(Date.getFullYear());
		var month = parseInt((Date.getMonth() + 1)),
			dates = parseInt(Date.getDate());
		/*if (year < 10) {
			year = "0" + year;
		}*/
		if (month < 10) {
			month = "0" + month;
		}
		if (dates < 10) {
			dates = "0" + dates;
		}
		return month + "-" + dates;
	};
	
}
//切换日期
$("body").on("click","#date_train_tab li",function(){
	if($(this).is(".history")){
		return;
	}
	$(".seven_date_target").removeClass("seven_date_target");
	$(this).addClass("seven_date_target");
});

$("body").on("click",".next_date",function(){
	if(!($(this).is(".next_date_t"))){
		moveDate("add");
	}
});
$("body").on("click",".prev_date",function(){
	if(!($(this).is(".prev_date_t"))){
		moveDate("odd");
	}
});
function moveDate(flag){
	var seven=7*24*60*60*1000, //七天
		ones_=1*24*60*60*1000,
		firstDate=($("#date_train_tab").attr("data-year")+"-"+$("#date_train_tab li:first").text().split("(")[0]).split("-"),
		newDate=null,
		dateIns=null,
		nowDate=new Date(),
		nowDate=new Date(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate());
		if(flag==="add"){
			newDate=new Date((new Date(firstDate[0],firstDate[1]-1,firstDate[2])).getTime()+seven);
			if((DateSeventMain.prototype.maxDate-newDate)<seven){
				newDate=new Date(DateSeventMain.prototype.maxDate.getTime()-(seven-ones_));
			}
		}else{
			newDate=new Date((new Date(firstDate[0],firstDate[1]-1,firstDate[2])).getTime()-seven);
			if(nowDate>newDate){
				newDate=nowDate;
			}
		}
		dateIns = new DateSeventMain({
				nowDate:newDate.getFullYear()+"-"+(newDate.getMonth()+1)+"-"+newDate.getDate(), //要显示的当前日期，可以不是今天，任意输入你想显示的日期段
				maxDate:"-1",
				flag:"1"
			});
		dateIns.inputVolidate();
}

function date_lock(dp){
	dateIns = new DateSeventMain({
		nowDate:dp, //要显示的当前日期，可以不是今天，任意输入你想显示的日期段
		maxDate:"-1",
		flag:"1",
		lock:"1"
	});
	dateIns.inputVolidate();
}



/************7天日历动态生成 end****************/