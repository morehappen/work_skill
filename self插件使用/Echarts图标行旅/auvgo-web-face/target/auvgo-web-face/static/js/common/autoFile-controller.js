var _autoFile_={data:null,shilihua:null,ziduan:"",url:"",reg:"",arr:null,value:""};
_autoFile_.runMain=function(control){
	_autoFile_.closeWindow();
	_autoFile_.url=control.url;
	_autoFile_.reg=control.reg;
	_autoFile_.ziduan=control.ziduan;
	_autoFile_.arr=control.arr instanceof Array ? control.arr : null;
	_autoFile_.value=control.value;
	control.this_.addClass("_auto_active_");
	_autoFile_.shilihua=new _autoFile_.AutoFileMain();
	_autoFile_.shilihua.getDate(control.this_); //执行填充数据主函数
};
//开启、关闭下拉数据框
_autoFile_.controllerAutoFile=function(){
	
	/***n关闭模块 start***/

	
	//监听body的子元素关闭
	$("body").on("click","._auto_active_",function(event){ 
		if($("#_autoContent_").is(":visible")){
			if(!($(this).is("#_autoContent_ li")) && !($(this).is("._auto_active_"))){
				_autoFile_.closeWindow();
			}
		}
	});
	//监听 autoFile选项关闭
	$("body").on("click","#_autoContent_ li",function(event){ 
		event.stopPropagation();
		var autoVal=String($(this).html()).split(" ");
		$("._auto_active_").val(autoVal[0]).next("._autoFileCode_").val($(this).data("value"));
		_autoFile_.closeWindow();
	});
	$("body").on("click",".auto_cover_",function(){
		_autoFile_.closeWindow();
	});
	//监听body关闭
	// $("body").click(function(event){_autoFile_.closeWindow()});

	/***关闭模块 end***/	
	/*悬浮下拉选项，改变背景颜色*/
	$("body").on("mouseover mouseout","#_autoContent_ li",function(event){
		var this_=$(this);
		if(event.type==="mouseover"){
			this_.css("background","#eef3fe");
		}else{
			this_.css("background","#fff");
		}
	});
};

/* removeClass,close autoWindow */
_autoFile_.closeWindow=function (){
	$("#_autoContent_").parents("._autoContainer_").remove();
	$("._auto_active_").removeClass("_auto_active_");
	$(".auto_cover_").remove();
	_autoFile_.shilihua=null;
	_autoFile_.data=null;
	_autoFile_.jiexiMethod=null;
	_autoFile_.ziduan="";
};
/*file datas*/
_autoFile_.AutoFileMain=function (){
	this.getDate=function(this_){ //get dates from library
		if(_autoFile_.url===""&& _autoFile_.arr==null){
			alert("请配置url!或输入默认数据");
			return;
		}
		if(_autoFile_.arr!=null){
			successData(this_,_autoFile_.arr);
			return;
		}
		$.ajax({
			type: "POST",
			url:_autoFile_.url,
			success: function(autoFile){
		 		successData(this_,autoFile);
			}
		});
		function successData(this_,autoFile){
			_autoFile_.datas=autoFile; //存储请求的填充数据
		 	_autoFile_.shilihua.analysis(); //在页面填充数据
		 	_autoFile_.shilihua.autoPosition(this_); //确定自动填充框位置
		}
	};
	this.analysis=function(){   //create list and full page
		var datas=_autoFile_.datas,
			autoLen=datas.length, //datas of length
			dataing=null,
			ziduan=[],
			autoContent=$("<ul id='_autoContent_' class='mCustomScrollbar' style='width:100%;background:transparent;'></ul>"),
			listStr="",
			zhezhao=$("<div class='auto_cover_' style='width:100%;height:100%;background:transparent;position:absolute;margin:auto;top:0;left:0;right:0;bottom:0;z-index:5'></div>"),
			listModel="";
		if(_autoFile_.ziduan===""){
			alert("请配置要显示的字段！");
			return; 
		}else{
			ziduan=_autoFile_.ziduan.split(",");
		}
		for(var i=0;i<autoLen;i++){
			dataing=datas[i];
			listModel="";
			// ziduan.forEach(function(item,index,array){
			// 	listModel+=dataing[item]+" ";
			// });
			for(var j = 0;j<ziduan.length;j++){
				listModel+=dataing[ziduan[j]]+" ";
			}


			listStr+="<li data-value='"+dataing[_autoFile_.value]+"' style='font-size:14px;height:40px;line-height:40px;float: none;color:#333;list-style-type: none;cursor:pointer;padding:0 0 0 4px;box-sizing: border-box;'>"+
			listModel+"</li>";
		}
		autoContent.append(listStr);
		$("body").append($("<div class='_autoContainer_' style='border:1px solid #efebf7;position:absolute;width:227px;max-height:320px;background:#fff;z-index:8'></div>").append(autoContent)).append(zhezhao);
		var lis=$("#_autoContent_ li");
		if(lis.size()<6){
			$("._autoContainer_").css("height",(lis.height())*(lis.size())+"px");
		}else{
			$("._autoContainer_").css("height","320px");
		}
		$("._autoContainer_").mCustomScrollbar();
	};
	this.autoPosition=function(this_){ //position list on page
		var ele=this_,
			dropc=$("._autoContainer_"),
			windowH=$(window).height(),
			offset=ele.offset(),
			widths=ele.width()+parseFloat(ele.css("padding-left").toString().split("px")[0])+parseFloat(ele.css("padding-right").toString().split("px")[0])+parseFloat(ele.css("border-left-width").toString().split("px")[0]),
			top=0,
			left=0;
		if(windowH-offset.top<350){ //右侧显示
			top=offset.top-dropc.height()/2;
			left=offset.left+ele.width()+parseFloat(ele.css("padding-left").split("px")[0])+parseFloat(ele.css("padding-right").split("px")[0])+20;
			dropc.css({"-moz-border-radius":"5px","-webkit-border-radius":"5px","border-radius":"5px"});
			$("._autoContainer_").append("<img src='../../static/img/common/left_jt.png' class='jt_img_' style='position:absolute;left:-8px;top:"+(dropc.height()/2)+"px;z-index:1000'>");
		}else{ //下方显示
			top=offset.top+ele.height()+2;
			left=offset.left;
			dropc.width(widths);
		}
		$("._autoContainer_").css({"top":top,"left":left});
	};
};
_autoFile_.controllerAutoFile(); //初始化事件监听






/*var _input_ = document.createElement('input');      
if('oninput' in _input_){  
   $("body").on("input","._autoFile_:focus",function(){
   		var vals=$(this).val();
   		if(vals==""){
   			(new AutoFileMain()).getDate($(this));
   		}else{  
			var strdata=(new AutoFileMain()).datas;
			console.log(AutoFileMain.prototype.datas);
			datasearch(strdata,vals,$(this));
   		}
   });
}else{  
	alert("请用IE9以上浏览器浏览！");
} 

function datasearch(strdata,vals,this_){ //str：返回的数据;vals：输入框的值
	var strdata=strdata;
	var vals=""+vals+"+";
	var len=strdata.length;
	console.log(len+"sss");
	for(var i=0;i<len;i++){
		var reg=new RegExp(vals,"g");
		var strevery=""+strdata[i].code;
		var flag=reg.test(strevery);
		if(!flag){
			strdata.splice(i,1);
			len=strdata.length;
			--i;
		}
	}
	(new AutoFileMain()).analysis(); //在页面填充数据
	(new AutoFileMain()).autoPosition(this_); //确定自动填充框位置


	
}*/