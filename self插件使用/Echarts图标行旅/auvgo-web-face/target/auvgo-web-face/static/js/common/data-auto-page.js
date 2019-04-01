


function DropAutoData(mainPara){   //参数：回调分析模块，由于各分析模块不一样，所以为实例方法
	this.url=mainPara.url;  //请求地址
	this.this_=mainPara.this_; //当前触发元素
	this.analyzerData=mainPara.analyzerData, //分析器 
	this.eventMain=mainPara.eventMain; //单击列表的主函数
	this.showField=mainPara.showField; //要展示在当前触发元素里的字段
	this.data=null; //用于后期存储可解析的数据
	this.html=null; //用于存储下拉部分的最外层div
	this.hideField=mainPara.hideField; //要展示在其他位置的字段
	this.tips=mainPara.tips; //当返回的数据不是此格式[{},{}]时的错误提示语
	this.model=mainPara.model; //判断是否为分页模式。paging代表分页模式
	this.pageThis=null; //单击的当前分页按钮
	this.time=mainPara.time; //出差单时间
	this.pageFlag=0; //初始化一次翻页事件
	this.keyword = mainPara.keyword;
	this.employeeid=mainPara.employeeid;//员工id
	this.departmentid=mainPara.departmentid;//部门id
	this.index = mainPara.index;
	if(typeof this.interceptor!="function"){
		/********数据拦截模块**********/
		DropAutoData.prototype.interceptor=function (){  //用于分页，首页没上一页，尾页没下一页，不请求
			if(!($("._dataFull_").is(this.this_))){
				$("._dataFull_").removeClass("_dataFull_");
				$("#data-view").remove();
			}
			//关闭下拉
			if(this.pageThis==null){
				if($("#data-view").is("div")){
					$("#data-view").remove();
					this.this_.removeClass("_dataFull_");
					return;
				}else{
					this.this_.addClass("_dataFull_");
				}
			}
			if(this.model==="paging" && this.pageFlag===0){
				this.pageFlag=1;
				/*this.pageEvent();*/
			}
			this.ajaxAutoData();
		};
		
		/********数据请求模块**********/
		DropAutoData.prototype.ajaxAutoData=function (){ 
			var this_=this,Obj={};
			if(this.model==="paging"){
				Obj={
						pagenum:DropAutoData.prototype.pageNum===undefined ? "" : DropAutoData.prototype.pageNum,
					    pagesize:DropAutoData.prototype.pageNum===undefined ? "" : DropAutoData.prototype.pageSize,
					    keyword:this_.keyword?this_.keyword:"",
					    ordertime:this.time,
						employeeid:this.employeeid,
						departmentid:this.departmentid
					};
			}
			$.ajax({
		        type: "POST",
		        url:this.url,
		        data:Obj,
		        success: function(data) {
		        	if(data.status===200){ //数据请求成功
		        		this_.analyzerData(data);  //进行分析，返回数组套对象的格式; 
		        	}else{
		        		zh.alerts({
		    				title:"提示",
		    				text: data.msg+"("+data.status+")!"
		    			});
		        	}
		        },
		        error:function(XMLHttpRequest){
		        	zh.alerts({
						title:"提示",
						text: XMLHttpRequest
					});
		        	console.log(XMLHttpRequest);
		        }
		    });
		};
		/********验证数据是否可解析模块**********/
		DropAutoData.prototype.volidate=function(data){
			if(data instanceof Array && data.length>0){
				this.data=data;
				if(this.pageThis==undefined){
					this.dataView();
				}else{
					$(".paging-ul").html(this.creatList());
				}
				return;
			}
			// if($("._dataFull_").attr("ignore")!="ignore"){
			// 	// zh.alerts({
			// 	// 	title:"提示",
			// 	// 	text:this.tips
			// 	// });
			// 	$("._dataFull_").removeClass("_dataFull_");
			// 	return;
			// }
			// zh.alerts({
			// 	title:"提示",
			// 	text:this.tips
			// });
			$("._dataFull_").removeClass("_dataFull_");
		};
		
		/******************view模块**********************/
		DropAutoData.prototype.dataView=function(){
			var div=$("<div id='data-view' style='position:absolute;font-size:12px;background:#fff;border:1px solid #ccc;z-index:"+(this.index?this.index:1)+"'></div>"),
				paging=$("<div class='pageGroup clear' style='padding:0 10px'><span class='float-left cursor pagebtn color-6461e2' style='display:none' id='prevPage'><<</span><span class='float-right cursor pagebtn color-6461e2'  style='display:none' id='nextPage'>>></span><div>"),
				ul=$("<ul class='paging-ul'></ul>"), //数据列表
				list="";
			//创建列表项
			list=this.creatList();
			ul.html(list);
			div.append(ul);
			if(this.model==="paging"){
				div.append(paging);
				if(this.hasNextPage){
					div.find("#nextPage").show();
				}else{
					div.find("#nextPage").hide();
				}
				if(this.hasPreviousPage){
					div.find("#prevPage").show();
				}else{
					div.find("#prevPage").hide();
				}
			}
			this.html=div;
			this.position();//定位到页面展示
			//div.append(ul).append(paging);
			//ajaxCanshu.dataAuto.dataPosition(div,ajaxCanshu.this_);
		};
		
		/**************创建列表项模块**************/
		DropAutoData.prototype.creatList=function(){
			var list="",
				showList="",
				hideList="",
				data=this.data,
				showField=this.showField.split(","),
				hideField=this.hideField.split(",");
			if(showField.length!=1 && showField[showField.length-1]==""){
				showField.length=showField.length-1;
			}
			if(hideField.length!=1 && hideField[hideField.length-1]==""){
				hideField.length=hideField.length-1;
			}
			$.each(data,function(index,item){
				showList="";
				hideList="";
				$.each(showField,function(index,itemS){
					showList+=item[itemS]+" ";
				});
				$.each(hideField,function(index,itemH){
					var eH=item[itemH];
					hideList+="data-"+itemH+"="+eH+" ";
				});
				list+="<li class='data-auto-li' "+hideList+" style='padding:4px;cursor:pointer'>"+showList+"</li>";
			});
			return list;
			/*if(flag!=="1"){
				return list; //首次进来初始化
			}else{  //分页进来更新
				$(".paging-ul").html(list);
			}*/
		};
		
		/**************定位下拉模块的页面位置**************/
		DropAutoData.prototype.position=function(){
			var html=this.html,
				this_=this.this_,
				offset=this_.offset(),
				x=offset.left,
				y=offset.top+this_.height(),
				pleft=parseFloat(this_.css("padding-left").split("px")[0]),
				pright=parseFloat(this_.css("padding-right").split("px")[0]),
				bleft=parseFloat(this_.css("border-left-width").split("px")[0]),
				bright=parseFloat(this_.css("border-right-width").split("px")[0]),
				width=this_.width()+pleft+pright+bleft+bright;
			html.css({"width":width+"px","top":y,"left":x});
			$("body").append(html);
			
			//初始化事件
		};
		/*************关闭赋值模块*************/
		DropAutoData.prototype.closeEvent=(function(){
			$("body").on("click",".paging-ul li",function(e){
				e.stopPropagation();
				var this_=$(this);
				$("._dataFull_").val(this_.text());
				DropAutoData.prototype.eventMain(this_,$("._dataFull_"));
				$("#data-view").remove();
				$("._dataFull_").removeClass("_dataFull_");
				DropAutoData.prototype._nowshili_=null;
				DropAutoData.prototype.clear();
			});
			$("body").on("click",function(){
				$("#data-view").remove();
				$("._dataFull_").removeClass("_dataFull_");
				DropAutoData.prototype._nowshili_=null;
				DropAutoData.prototype.clear();
			});
			$("body").on("click",".pageGroup",function(e){
				e.stopPropagation();
				return;
			});
		})();
		/*******************分页事件********************/
		DropAutoData.prototype.pageEvent=(function(){
			$("body").on("click",".pagebtn",function(e){
				e.stopPropagation();
				var this_=$(this);
				DropAutoData.prototype._nowshili_.pageThis=this_;
				if(this_.is("#prevPage")){
					if(DropAutoData.prototype.hasPreviousPage){
						DropAutoData.prototype.pageNum=parseFloat(DropAutoData.prototype.pageNum)-1;
						DropAutoData.prototype._nowshili_.interceptor();
					}
				}else{
					if(DropAutoData.prototype.hasNextPage){
						DropAutoData.prototype.pageNum=parseFloat(DropAutoData.prototype.pageNum)+1;
						DropAutoData.prototype._nowshili_.interceptor();
					}
				}
			});
		})();
		/************初始化分页参数**************/
		DropAutoData.prototype.pagingIn=function(data){ //分页参数初始化
			if(data.pageNum){
				DropAutoData.prototype.pageNum=data.pageNum;
				DropAutoData.prototype.pageSize=data.pageSize;
				DropAutoData.prototype.pages=data.pages;
				DropAutoData.prototype.hasNextPage=data.hasNextPage;
				DropAutoData.prototype.hasPreviousPage=data.hasPreviousPage;
				this.hasNextPage===true ? $("#nextPage").show() : $("#nextPage").hide();
				this.hasPreviousPage===true ? $("#prevPage").show() : $("#prevPage").hide();
			}
			if(data.totalPage!=""){
				DropAutoData.prototype.pageNum=data.index;// 当前页数
				DropAutoData.prototype.pageSize=data.size; // 每页数据
				DropAutoData.prototype.pages=data.totalPage; //总页数
				DropAutoData.prototype.hasNextPage=data.hasNext; // 是否有下一页
				DropAutoData.prototype.hasPreviousPage=data.index>1?true:false;// 是否有上一页
				this.hasNextPage===true ? $("#nextPage").show() : $("#nextPage").hide();
				this.hasPreviousPage===true ? $("#prevPage").show() : $("#prevPage").hide();
			}
			
		};
		/************恢复到默认初始值状态**************/
		DropAutoData.prototype.clear=function(){
			DropAutoData.prototype.pageNum=undefined;
			DropAutoData.prototype.pageSize=undefined;
			DropAutoData.prototype.pages=undefined;
			DropAutoData.prototype.hasNextPage=undefined;
			DropAutoData.prototype.hasPreviousPage=undefined;
		};
	}
	/***********分析模块**回调函数********/
	this.analyzerData=mainPara.analyzerData; 
	/***/
	DropAutoData.prototype.eventMain=mainPara.eventMain; //单击列表的主函数
	DropAutoData.prototype._nowshili_=this; //单击列表的主函数
}




























