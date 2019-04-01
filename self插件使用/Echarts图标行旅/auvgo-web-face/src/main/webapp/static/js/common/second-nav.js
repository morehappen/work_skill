$(function(){

	//二级导航展开收起
	$("body").on("click",".ss-every-model",function(){
		var this_ = $(this),
			this_p = this_.parents("dl");
		this_p.parents(".second-side-nav").find("dl").not(this_p).find("dd").slideUp("fast").end().end().end().end().find("dd").slideToggle("fast");
	});


});


