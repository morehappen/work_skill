$(function(){
    //写入查询条件到cookie
    function writeCookie(){
    	var queryObj={};
    	$("[data-ele]").each(function(){
    		var this_ = $(this),
    			this_ele = this_.attr("data-ele"),
    			this_val = this_.val();
    		queryObj[this_ele] = this_val;
    	});
    	document.cookie = "queryCondition=" + JSON.stringify(queryObj);
    }
    //从详情页返回列表页读取cookies
    function readCookie(){
    	var cookies = document.cookie.split(";"),
            cookiesLen = cookies.length,
            value = null,
            arrv = null;
	    for(var i=0;i<cookiesLen;i++){
	    	arrv = cookies[i].split("=");
	    	if(arrv[0] == "queryCondition"){
	    		value = JSON.parse(arrv[1]);
	    		break;
	    	}
	    }
	    console.log(value);
	    if(value != null){
	    	 $("[name='pageNum']").val(value.pagenum);
	 	    $("[name='pageSize']").val(value.pagesize);
	    }
	    return value;
    }
    //详情返回列表，条件回写，重新查询
    function repeatQuery(data){
    	var parents=null;
    	for(name in data){
    		var ele = $("[data-ele='" + name + "']");
    		if(ele.is("select")){
    			parents = ele.parents(".drop");
    			ele.val(data[name]);
    			parents.find(".drop_title").html(parents.find(".drop_option li:eq(" + ele.find("option[value='" + data[name] + "']").index() + ")").text());
    		}else{
    			ele.val(data[name]);
    		}
    	}
    	$("form[data-query='queryForm']").submit();
    }
    //判断是否由详情页跳回列表页，进行重新查询
    (function(){
    	var search = window.location.search.slice(1).split(";")[1];
    	if(search != undefined && search.split("=")[1] == "-1"){
    		repeatQuery(readCookie());
    	}else{
    		writeCookie();
    	}
    })();
});