/**
 * Created by dell on 2018/4/25.
 */
/*查询列表的方法*/
$(function(){
	//位置 房价 品牌 星级 设施 的筛选
	//直销和协议
	$('body').on("click",'.sort-model  .label',function(){
		hotelQuery(1);
	});
	
//	不限的清空条件
	$('body').on('click','.filter-wraper .btn-no-limit',function(){
		var $this = $(this);
		var flag = $this.attr('data-flag');
		var $modelMap = $('.model-map');
		$this.removeClass('unlimitedActive');
		if (flag == 'starRate') {
			$modelMap.find('#map-start .label').removeClass('label-select-checkbox');
			$modelMap.find('#map-start :input').prop('checked', false);
		}else if (flag == 'brands') {
			$modelMap.find('#map-brands .label').removeClass('label-select-checkbox');
			$modelMap.find('#map-brands :input').prop('checked', false);
		}else if (flag == 'price') {
			$("#rangePrice").val('');
			$modelMap.find('#map-price .label').removeClass('label-select-radio');
			$modelMap.find('#map-price :input').prop('checked', false);
			$modelMap.find('#map-price').find('#map-price-nolimit').addClass('label-select-radio').find('input').prop('checked', true);
		}
		var $flagParent = $('#' + flag);
		$flagParent.find('.label').removeClass('label-select-checkbox label-select-radio').find('input').prop('checked', false);
		
		$flagParent.find(':text').val('');
		
		$('#all-filter-wraper').find('.f-m-' + flag).remove();
		// console.log($("#searchForm").serialize())
		// console.log($('#all-filter-wraper .e-f-r-c').length)
		if($('#all-filter-wraper .e-f-r-c').length<=0){
			// console.log("dfhhfd")
			$(".all-con-wraper").hide();
		}
		hotelQuery(1);
	});
	
	
	
	
	
	
/* 位置 房价 品牌 星级 设施 的筛选 位置的筛选填充*/
	$("body").on('click','.filter-wraper  .label',function(){
		$(".all-con-wraper").show();
		var _this = $(this);
		// flag 当前最大父元素的id  _flag 当前的元素的id
		var flag = _this.context.id;
		var _flag = _this.parents('.e-filter-c').attr("id");
		var type =_this.children("input").attr("type");
		//改变不限 的样式
		_this.parents('.e-filter-area').find('.btn-no-limit').addClass('unlimitedActive');
		/*判断是否是*/
		if(type=='radio'&& (_flag=="position"||_flag=="price")&& _this.children('input').is(':checked')){
			if(_flag=="price"){$("#lowRate").val('');$("#highRate").val('');}
			var texts = _this.children('.hover_content').html();
			if(type=='radio' && _flag=="price"){
				if($('.f-m-price').length>=1){
					$('.f-m-price').html(texts+ '<span class="hotel-bg remove-filter"></span>');
					$(this).children("input").prop('checked',true);
					$('#rangePrice').val($(this).children("input").val());
				}else{
					$(this).children("input").prop('checked',true);
					$('#rangePrice').val($(this).children("input").val());
					updateFilterCon(texts, _flag, flag,type);
				}
			}else{
				//位置 hover_content
				if($('.f-m-position').length>=1){
					$('.f-m-position').html(texts+ '<span class="hotel-bg remove-filter"></span>');
				}else{
					updateFilterCon(texts, _flag, flag,type);
				}
			}
		}else  if((_flag =='brands'||_flag=='facility'||_flag == 'starRate') && _this.children('input').is(':checked')){
			var texts = _this.children('.hover_content').html();
			var $modelMap = $('.model-map');
			$modelMap.find('#map-price').find('#map-price-nolimit').addClass('label-select-radio').find('input').prop('checked', true);
			var texts = _this.children('.hover_content').html();
			updateFilterCon(texts, _flag, flag,type);
		}
	//	再次点击消失
		if(!(_this.children('input').is(':checked'))&& type=='checkbox'){
			$("#e-"+flag).remove();
			if($('.e-f-r-c').length<1){
				$(".all-con-wraper").hide();
			}
			$("#e-"+flag).removeClass("label-select-checkbox");
		}
		hotelQuery(1);
	});
//todo 价格的升降序的点击推荐
	$("body").on('click','.sort-model .order-model',function(){
		//PA降序 PD升序
		var _this = $(this);
		_this.siblings().css('color',"#333");
		$('#distance').css('color','#ccc');
		if(_this.text().replace(/\s/g,"")=="价格"){
			var $this = $(this);
			var upStr = 'stg-s-up';
			var downStr = 'stg-s-down';
			var upStatus = $this.hasClass(upStr);
			// console.log(upStatus);
			if (upStatus) {
				$('#sortOrder').attr('name','sort').val("PD");
				$this.find('.arrow').removeClass("arrow-down").addClass('arrow-up');
				$this.css('color',"#D44A9F");
				$this.removeClass(upStr).addClass(downStr).attr('data-flag', 0);
			}else {
				$('#sortOrder').attr('name','sort').val("PA");
				$this.find('.arrow').removeClass("arrow-up").addClass('arrow-down');
				$this.css('color',"#D44A9F");
				$this.removeClass(downStr).addClass(upStr).attr('data-flag', 1);
			}
			
		}else if(_this.text().replace(/\s/g,"")=="推荐"){
			$(".sort-model .label").removeClass('label-select-checkbox').find("input").prop("checked",false);
            _this.css('color',"#D44A9F");
			$('.stg-sort-price').removeClass('stg-s-up stg-s-down').attr('data-flag', '');
			$('#sortOrder').attr('name','sort').val("D");
		}else if(_this.text().replace(/\s/g,"")=="距离"){
			return ;
			// $('#sortOrder').attr('name','sort').val("DA");
		}
		hotelQuery(1);
	});

	// $('body').on('click', '.model-list .stg-sort', function() {
	// 	var $this = $(this);
	// 	var upStr = 'stg-s-up';
	// 	var downStr = 'stg-s-down';
	// 	var upStatus = $this.hasClass(upStr);
	// 	console.log(upStatus)
	// 	if (upStatus) {
	// 		$('#sortOrder').attr('name','sort').val("PD")
	// 		$this.removeClass(upStr).addClass(downStr).attr('data-flag', 0);
	// 	}else {
	// 		$('#sortOrder').attr('name','sort').val("PA")
	// 		$this.removeClass(downStr).addClass(upStr).attr('data-flag', 1);
	// 	}
	//
	// 	hotelQuery(1);
	// });





//todo 房价的单选
	$("body").on('click','#price .label',function(){
		$("#price").find('.label').removeClass('label-select-radio');
		$(this).addClass("label-select-radio").find("input").prop('checked',true);
	});



/*action 点击删除*/
	$('body').on('click','.e-f-r-c .remove-filter',function(){
		if($('.e-f-r-c').length<=1){
			$(".all-con-wraper").hide();
			
		}else{
			$(".all-con-wraper").show();
		}
		var _this = $(this);
		var id = _this.parent().attr("id").split('-')[1];
		var type = _this.parent().attr('data');
		if(type=="checkbox" ){
			if(id=="start"){
				var this_ = $("#"+id+"-"+_this.parent().attr("id").split('-')[2]);
				$("#"+id+"-"+_this.parent().attr("id").split('-')[2]).children('input').prop('checked',false);
				$("#"+id+"-"+_this.parent().attr("id").split('-')[2]).removeClass("label-select-checkbox");
				removeFilter(this_,"checkbox");
				
			}else if(id=="facility"){
				var this_ = $("#"+id+"-"+_this.parent().attr("id").split('-')[2]);
				$("#"+id+"-"+_this.parent().attr("id").split('-')[2]).children('input').prop('checked',false);
				$("#"+id+"-"+_this.parent().attr("id").split('-')[2]).removeClass("label-select-checkbox");
				removeFilter(this_,"checkbox");
				
			}else if(id=="brands"){
				var att = _this.parent().attr("id").split('-');
				var this_ = $("#"+id+"-"+att[2]+'-'+att[3]);
				$("#"+id+"-"+att[2]+'-'+att[3]).children('input').prop('checked',false);
				$("#"+id+"-"+att[2]+'-'+att[3]).removeClass("label-select-checkbox");
				removeFilter(this_,"checkbox");
				
			}
		}else if(type=="radio"&& id =="price"){
			$("#rangePrice").val('');
			$("#lowRate").val('');
			$("#highRate").val('');
			var plsg = _this.parent().attr("id").split('-')[3];
			var this_ =$("#"+id+"-"+_this.parent().attr("id").split('-')[2]+"-"+(plsg?plsg:""));
			$("#"+id+"-"+_this.parent().attr("id").split('-')[2]+"-"+(plsg?plsg:"")).children('input').prop("checkbox",false);
			$("#"+id+"-"+_this.parent().attr("id").split('-')[2]+"-"+(plsg?plsg:"")).removeClass("label-select-radio");
			removeFilter(this_,"checkbox");
			
		}else if(type=="radio" && (id=="position"||id=="price")){
			var this_ = $("#"+id).find('.label').removeClass('label-select-checkbox label-select-radio');
			$("#"+id).find('.label').removeClass('label-select-checkbox label-select-radio').find('input').prop('checked', false);
			$("#"+id+"-"+_this.parent().attr("id").split('-')[2]).removeClass("label-select-radio");
			removeFilter(this_,"radio");
		};
			_this.parent().remove();
		hotelQuery(1);
	});
//	封装不限的插件
	function removeFilter(obj,type){
		var $this = obj.parents('.e-filter-area');
		var list = false;
		var arry = '';
		if(type=="checkbox"){
			arry =$this.find('input[type="checkbox"]');
		
		}
		if(type=="radio"){
			arry =$this.find('input[type="radio"]');
			
		}
		arry.each(function(){
			if($(this).prop('checked')){
				list=true;
			};
		});
		if(!list){
			$this.find('.btn-no-limit').removeClass('unlimitedActive');
		}
		
	}

	
/*点击全部清空*/
	$('body').on('click','.all-con-wraper #remove-all-filter',function(){
		$('.filter-wraper').find(".btn-no-limit").removeClass('unlimitedActive');
		$('.e-f-r-c').remove();
		$(".filter-wraper .label").removeClass('label-select-radio label-select-checkbox').find('input').prop('checked',false);
		$(".all-con-wraper").hide();
		$("#rangePrice").val('');
		$("#lowRate").val('');
		$("#highRate").val('');
		hotelQuery(1);
		
	})
	//todo 点击button时查询价格
	$('body').on('click','.btn-price-confirm',function(){
		// console.log("1")
		var _this = $(this);
		var lowRates = $('#lowRate').val();
		var highRates = $('#highRate').val();
		var _flag = _this.parents('.e-filter-c').attr("id");
		var flag = _flag+"-name";
		var type = "radio";
		var texts;
		if((lowRates<0||highRates<=0)||(lowRates ==''&&highRates=='')){
			layer.msg("房间的价格不能小于0");
			return ;
		};
		// console.log(parseInt(lowRates),parseInt(highRates));
		if(parseInt(lowRates)>parseInt(highRates) && lowRates!="" && highRates!=''){
			layer.msg("最低房价不能大于最高房价");
			return ;
		}
		if((lowRates<0||lowRates=="")&& highRates>lowRates){
			$("#rangePrice").val("0-"+highRates);
			 texts = highRates+"元以下";
			$("#price").find('.label').removeClass('label-select-radio').find("input").prop('checked',false);
			// updateFilterCon(texts,_flag,flag,type)
			hotelQuery(1);
		}else
		if(parseInt(lowRates)<parseInt(highRates)){
			texts= lowRates+'-'+highRates+"元";
			$('#rangePrice').val(lowRates+"-"+highRates);
			$("#price").find('.label').removeClass('label-select-radio').find("input").prop('checked',false);
			hotelQuery(1);
		}
	//todo 增加小信息
		if(type=='radio' && _flag=="price"){
			// console.log($('.f-m-price').length);
			if($('.f-m-price').length>=1){
				$(".all-con-wraper").show();
				$('.f-m-price').html(texts+ '<span class="hotel-bg remove-filter"></span>');
			}else{
				// console.log($('#all-filter-wraper').children())
				if($('#all-filter-wraper').length<=1){
					$(".all-con-wraper").show();
				}
				updateFilterCon(texts, _flag, flag,type);
			}
		}
	});
//	距离的点击判断  距离的样式
// 	$('#distance').
	if($("#latitude").val()!=''||$("#longitude").val()!=''&&($("#latitude").val()!=undefined||$("#longitude").val()!=undefined)){
		$('#distance').css("color","#333333");
		
		// console.log("this")
		$("body").on("click","#distance",function(){
			var _this = $(this);
			if(_this.text().replace(/\s/g,"")=="距离"){
				$('#sortOrder').attr('name','sort').val("DA");
				hotelQuery(1);
			}
		})
	}else{
		// console.log(typeof $("#latitude").val())
		$('#distance').css("color","#cccccc");
	}
	
});

//	每次添加时增加属性
function updateFilterCon(text, _flag, flag,type) {
	var html =
		'<span data='+type+' class="e-f-r-c f-m-' + _flag + '" id="e-' + flag + '">' +
		text + '<span class="hotel-bg remove-filter"></span>' +
		'</span>';
	$('#all-filter-wraper').append(html);
};

//价格输入框的验证
	CodeCompatibility("lowRate",/^[0-9]{1,}$/,/\D/g);
	CodeCompatibility("highRate",/^[0-9]{1,}$/,/\D/g);
	function CodeCompatibility(id,test,ls){
		var obj = document.getElementById(id);
		var listValue = test;
		if(obj.addEventListener){
			$("body ").on("input propertychange","#"+id,function(){
				var _this = $(this);
				// console.log($(this).val())
				listValue.test($(this).val());
				if(listValue.test($(this).val())){
					_this.val(_this.val());
				}else{
					$(this).val($(this).val().replace(ls,""));
				}
			});
		}else if(obj.attachEvent){
			obj.attachEvent("onfocus", pchange);
			obj.attachEvent("onblur", function(){
				obj.onpropertychange = null;
			});
		}
		function pchange(){
			obj.onpropertychange = function(){
				if(window.event.propertyName == "value"){
					var _this = window.event.srcElement;
					_this.blur();
					_this.focus();
					if(listValue.test(_this.value)){
						_this.value = _this.value;
					}else{
						_this.value = _this.value.replace(ls,'');
					}
				}
			};
		}
	}









