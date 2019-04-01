"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***** author:zhanghao 2018-4-20 O(∩_∩)O~ *****/
// import resources from '/resources/js/common/My97DatePicker/WdatePicker.js';
var PassengerModel = function () {
	function PassengerModel() {
		_classCallCheck(this, PassengerModel);
	}

	// 初始化权限


	PassengerModel.prototype.initAuthority = function initAuthority() {
		var addempflag = $.trim($("#addempflage").val()),
		    // 是否可以添加员工
		addcustflag = $.trim($("#addcustflage").val()),
		    // 是否可以添加常用联系人
		isSearch = 1,
		    // 是否显示搜索框
		AuthArr = [];

		isSearch == 1 ? AuthArr.push("queryView") : "";
		addempflag == 1 ? AuthArr.push("addEmpView") : "";
		addcustflag == 1 ? AuthArr.push("addOffenView") : "";
		PassengerModel.prototype.tabData = AuthArr;

		this.viemMain(isSearch == 1 ? this.queryView() : addcustflag == 1 ? this.addEmpView() : addempflag == 1 ? this.addOffenView() : "", {
			addempflag: addempflag,
			addcustflag: addcustflag,
			isSearch: isSearch
		});
	};
	// 主视图函数
	/*
 * 	para:
 *		contentView: 初始化默认视图
 *		authority: 权限
 *					{
 *						addempflag, // 是否可添加员工 1|0
 *						addcustflag, // 是否可添加常用联系人 1|0
 *						isSearch	// 是否可搜索 1|0
 	*				}
 * */


	PassengerModel.prototype.viemMain = function viemMain(contentView, authority) {
		//${authority.addcustflag == 1 ? `<li ${authority.isSearch != 1 && authority.addempflag != 1 ? "class='layer-tab-target'" : ""}>新增常用联系人</li>` : ""}
		var html = $.trim("<div class=\"layer-container\">\n\t\t\t\t\t\t\t<div class=\"layer-cover\"></div>\n\t\t\t\t\t\t\t<div class=\"layer-content\">\n\t\t\t\t\t\t\t<div class=\"layer-title\">\n\t\t\t\t\t\t\t\t<span>\u9009\u62E9\u5165\u4F4F\u4EBA</span>\n\t\t\t\t\t\t\t\t<span class=\"layer-close\">\xD7</span>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"layer-main\">\n\t\t\t\t\t\t\t\t<div class=\"layer-select\">\n\t\t\t\t\t\t\t\t\t<ul>" + this.selectCusPerson() + "</ul>\n\t\t\t\t\t\t\t\t\t<button>\u786E\u5B9A</button>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<ul class=\"layer-tab\">\n\t\t\t\t\t\t\t\t\t" + (authority.isSearch == 1 ? "<li class=\"layer-tab-target\">\u4F01\u4E1A\u5458\u5DE5</li>" : "") + "\n\t\t\t\t\t\t\t\t\t" + (authority.addempflag == 1 ? "<li " + (authority.isSearch != 1 ? "class='layer-tab-target'" : "") + ">\u65B0\u589E\u5458\u5DE5</li>" : "") + "\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t<div class=\"layer-tab-content\">" + contentView + "</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>"),
		    select_ = new SelectMain();
		$("body").append(html);
		$("body").addClass('modal-open');
		$(".layer-tab-content select").each(function () {
			select_.creatSelect($(this));
		});
		// console.log(this,$('body .staffRank'));
		if ($('.staffRank').length > 0) {
			this.getEmpLevel($('.staffRank'), true);
		}
		return this;
	};

	// 已选中的常用联系人


	PassengerModel.prototype.selectCusPerson = function selectCusPerson() {
		var list = "";
		$(".passanger-model").each(function () {
			var this_ = $(this),
			    id = $.trim(this_.attr("data-id")),
			    name = $.trim(this_.attr("data-name"));
			list += "<li class=\"float-left hoverTips\" data-id=\"" + id + "\">" + name + "</li>";
		});
		return list;
	};

	// 查询视图


	PassengerModel.prototype.queryView = function queryView() {
		var cookies = new CookieMain().readCookie(),
		    list = "";
		// console.log(cookies);
		if ((typeof cookies === "undefined" ? "undefined" : _typeof(cookies)) == 'object' && cookies instanceof Array) {
			for (var i = 0; i < cookies.length; i++) {
				var item = cookies[i];
				list += "<span class=\"e-history-p float-left cursor\" data data-id=\"" + item.id + "\" data-name=\"" + item.name + "\">" + item.name + "</span>";
			}
		}

		return $.trim("<div class=\"clear font-size-12 history-container\" data-history=\"container\">\n\t\t\t\t\t\t\t\t<div class=\"color-cccccc float-left\">\u5386\u53F2\u8BB0\u5F55\uFF1A</div>\n\t\t\t\t\t\t\t\t<div class=\"float-left\">\n\t\t\t\t\t\t\t\t\t" + list + "\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"search-container position font-size-12 clear\" data-search=\"container\">\n\t\t\t\t\t\t\t\t<span class=\"search-icon position-ab\"></span>\n\t\t\t\t\t\t\t\t<input type=\"text\" class=\"input search-input\" data-search=\"input\" placeholder=\"\u5458\u5DE5\u59D3\u540D\">\n\t\t\t\t\t\t\t\t<ul class=\"search-passenger-list mCustomScrollbar\">\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t");
	};

	// 新增员工视图


	PassengerModel.prototype.addEmpView = function addEmpView() {
		var this_ = this;
		return $.trim("\n\t\t\t\t\t\t\t<form action=\"/component/save/update/employee\" method=\"post\" id=\"addForm\">\n\t\t\t\t\t\t\t\t<ul class=\"clear\">\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 padding-bottom-14\"style=\"width: 335px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u59D3\u540D\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input id=\"name_place\" type=\"text\" name=\"cert.username\" class=\"input float-left\" maxlength=\"20\" datatype=\"*2-20\" nullmsg=\"\u8BF7\u586B\u5199\u5458\u5DE5\u59D3\u540D\" errormsg=\"\u59D3\u540D\u5185\u5BB9\u8FC7\u77ED\uFF08\u5C0F\u4E8E2\u4E2A\u5B57\u7B26\uFF09/\u8FC7\u957F\uFF08\u5927\u4E8E20\u4E2A\u5B57\u7B26\uFF09\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t\t\t<span class=\"chinese\"><img  id=\"chinese\" src=\"/static/img/common/zhong.png\"width=\"40px\"height=\"20px\"></span>\n\t\t\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"cert.isChinese\" value=\"1\" id=\"is_chinese_i_\">\n\t\t\t\t\t\t\t\t\t</li>\n\t\t                              \n\t\t\t\t\t\t\t\t     <li class=\" float-left position font-size-12 padding-bottom-14\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u624B\u673A\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" name=\"phone\" class=\"input float-left\" maxlength=\"11\" datatype=\"/^1[0123456789]{10}$/\" nullmsg=\"\u624B\u673A\u53F7\u4E0D\u80FD\u4E3A\u7A7A\uFF01\" errormsg=\"\u624B\u673A\u53F7\u683C\u5F0F\u9519\u8BEF\uFF01\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 padding-bottom-14 card_type\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u7C7B\u578B\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<select class=\"_select_ cert_type_i\" name=\"cert.certtype\" data-value=\"1\" datatype=\"*1-10\" nullmsg=\"\u8BF7\u9009\u62E9\u8BC1\u4EF6\u7C7B\u578B\">\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"\">\u8BF7\u9009\u62E9</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"1\">\u8EAB\u4EFD\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"C\">\u6E2F\u6FB3\u901A\u884C\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"G\">\u53F0\u6E7E\u901A\u884C\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"B\">\u62A4\u7167</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"ID\">\u5176\u4ED6</option>\n\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao padding-bottom-14  \" style=\"margin-left: 60px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" id=\"certno\" name=\"cert.certificate\" class=\"input float-left\" maxlength=\"20\" datatype=\"*\"     nullmsg=\"\u8BF7\u8F93\u5165\u5408\u6CD5\u7684\u8BC1\u4EF6\u53F7\u7801\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"float-left position font-size-12 remove-fenxiao padding-bottom-14\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u5458\u5DE5\u90E8\u95E8\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" name=\"deptName\" id=\"citySel\"  data-value=\"#treeDemo_18_span\"   class=\"input float-left\" readonly datatype=\"*2-50\" nullmsg=\"\u8BF7\u9009\u62E9\u90E8\u95E8\">\n\t\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"depId\" id=\"deptpid\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao p_select_list padding-bottom-14\" style=\"margin-left: 60px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u5458\u5DE5\u804C\u7EA7\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<select class=\"_select_ p-select staffRank\" data-value=\"\" name=\"zhiwei\" value=\"\" datatype=\"*1-10\" nullmsg=\"\u8BF7\u9009\u62E9\u5458\u5DE5\u804C\u7EA7\">\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"\">\u8BF7\u9009\u62E9</option>\n\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<!--<li class=\"ul-item float-left position font-size-12 remove-fenxiao\">-->\n\t\t\t\t\t\t\t\t\t\t<!--<span class=\"ul-item-name float-left\">\u6743\u9650\u7EA7\u522B\uFF1A</span>-->\n\t\t\t\t\t\t\t\t\t\t<!--<select class=\"_select_\" name=\"depName\" data-value=\"geren\" datatype=\"*1-10\" nullmsg=\"\u8BF7\u9009\u62E9\u6743\u9650\u7EA7\u522B\">-->\n\t\t\t\t\t\t\t\t\t\t\t<!--<option value=\"geren\">\u4E2A\u4EBA</option>-->\n\t\t\t\t\t\t\t\t\t\t\t<!--<option value=\"geren\">\u4E2A\u4EBA</option>-->\n\t\t\t\t\t\t\t\t\t\t\t<!--<option value=\"all\">\u5168\u90E8</option>-->\n\t\t\t\t\t\t\t\t\t\t\t<!--<option value=\"dept\">\u672C\u90E8\u95E8\u53CA\u4E0B\u7EA7</option>-->\n\t\t\t\t\t\t\t\t\t\t<!--</select>-->\n\t\t\t\t\t\t\t\t\t\t<!--<span class=\"position-ab ul-item-select\">*</span>-->\n\t\t\t\t\t\t\t\t\t<!--</li>-->\n\t\t\t\t\t\t\t\t\t<!--<li class=\"ul-item float-left position font-size-12 remove-fenxiao\">-->\n\t\t\t\t\t\t\t\t\t\t<!--<span class=\"ul-item-name float-left\">\u5458\u5DE5\u5DE5\u53F7\uFF1A</span>-->\n\t\t\t\t\t\t\t\t\t\t<!--<input type=\"text\" id=\"pwd\" name=\"accno\" class=\"input float-left\" maxlength=\"20\" datatype=\"*1-20\" nullmsg=\"\u8BF7\u586B\u5199\u5458\u5DE5\u5DE5\u53F7\" errormsg=\"\u5458\u5DE5\u5DE5\u53F7\u8FC7\u957F\uFF08\u5927\u4E8E20\u4E2A\u5B57\u7B26\uFF09\">-->\n\t\t\t\t\t\t\t\t\t\t<!--<span class=\"position-ab ul-item-select\">*</span>-->\n\t\t\t\t\t\t\t\t\t<!--</li>-->\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao padding-bottom-14\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u5BA1\u6279\u89C4\u5219\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"approveId\" value=\"\">\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" id=\"shengpiguize\" autocomplete=\"off\" class=\"input float-left\" datatype=\"*\" >\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"float-left position font-size-12 remove-fenxiao show padding-bottom-14\" style=\"margin-left: 60px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u51FA\u751F\u65E5\u671F\uFF1A</span>\n\t\t\t\t\t\t\t\t<input type=\"yyymmdd\" id=\"bd\" name=\"cert.birthday\" maxlength=\"10\" class=\"input float-left\"  onfocus=\"WdatePicker({dateFmt:'yyyyMMdd ',maxDate:'%y-%M-%d'})\">\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao show maring-bottom-20\" >\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\" style=\"width: 75px;margin-left: -5px\">\u8BC1\u4EF6\u6709\u6548\u671F\uFF1A</span>\n\n\t\t\t\t\t\t\t\t\t   <input type=\"text\" name=\"cert.passportdate\" autocomplete=\"off\" class=\"input float-left\"  onfocus=\"WdatePicker({dateFmt:'yyyyMMdd ',minDate:'%y-%M-%d'})\" >\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"float-left position font-size-12 remove-fenxiao show padding-bottom-14\" style=\"margin-left: 60px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u7B7E\u53D1\u5730\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\"  name=\"cert.placeIssue\"  class=\"input nationality\"  nullmsg=\"\u8BF7\u8F93\u5165\" placeholder=\"\u5982\uFF1A\u4E2D\u56FD\"/>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao show maring-bottom-20\" style=\"width: 280px; height: 30px;\">\n\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u6027\u522B\uFF1A</span>\n\t\t\t\t\t\t\t\t\t <div class=\"label label-radio   clear vertical float-left\"style=\"margin-top: 8px;margin-left: 20px\" >\n\t\t\t\t\t\t\t\t\t\t<span class=\"show_choice\"></span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"radio\" name=\"cert.sex\" value=\"M\"/>\n\t\t\t\t\t\t\t\t\t\t<span>\u7537</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"label label-radio   clear vertical float-left\" style=\"margin-top: 8px;margin-left: 50px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"show_choice\"></span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"radio\" name=\"cert.sex\" value=\"F\" />\n\t\t\t\t\t\t\t\t\t\t<span>\u5973</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\" float-left position font-size-12 remove-fenxiao show padding-bottom-14\" style=\"margin-left: 57px\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u56FD\u7C4D\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t\t<input  type=\"text\"  name=\"cert.guoji\"  class=\"input nationality\"  nullmsg=\"\u8BF7\u8F93\u5165\" placeholder=\"\u5982\uFF1A\u4E2D\u56FD\"/>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t<div class=\"text-align\" style=\"margin-top:10px;\">\n\t\t\t\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-3E4EB2  btn-big\" id=\"save-addForm\">\u4FDD\u5B58</button>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t");
	};
	//<li class="ul-item float-left position font-size-12 remove-fenxiao">
	// <span class="ul-item-name float-left">审批规则：</span>
	// <input type="hidden" name="approveid" value="">
	// 	<input type="text" id="shengpiguize"  class="input float-left" datatype="*" >
	// 	<span class="position-ab ul-item-select">*</span>
	// 	</li>
	// 新增常用联系人视图


	PassengerModel.prototype.addOffenView = function addOffenView() {
		return $.trim("\n\t\t\t\t\t\t\t<form action=\"/component/save/update/employee\" method=\"post\" id=\"addForm\" data-type=\"cus\">\n\t\t\t\t\t\t\t\t<ul class=\"clear\">\n\t\t\t\t\t\t\t\t\t<li class=\"ul-item float-left position font-size-12\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u59D3\u540D\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" id=\"name_place\"  name=\"username\" class=\"input float-left\" maxlength=\"20\" datatype=\"*2-20\" nullmsg=\"\u8BF7\u586B\u5199\u8054\u7CFB\u4EBA\u59D3\u540D\" errormsg=\"\u59D3\u540D\u5185\u5BB9\u8FC7\u77ED\uFF08\u5C0F\u4E8E2\u4E2A\u5B57\u7B26\uFF09/\u8FC7\u957F\uFF08\u5927\u4E8E20\u4E2A\u5B57\u7B26\uFF09\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"ul-item float-left position font-size-12\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u624B\u673A\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" name=\"mobile\" class=\"input float-left\"  maxlength=\"11\" datatype=\"/^1[0123456789]{10,10}$/\" nullmsg=\"\u624B\u673A\u53F7\u4E0D\u80FD\u4E3A\u7A7A\uFF01\" errormsg=\"\u624B\u673A\u53F7\u683C\u5F0F\u9519\u8BEF\uFF01\" >\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"ul-item float-left position font-size-12\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u7C7B\u578B\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<select class=\"_select_\" name=\"certtype\" data-value=\"1\" nullmsg=\"\u8BF7\u9009\u62E9\u8BC1\u4EF6\u7C7B\u578B\" datatype=\"*1-10\" nullmsg=\"\u8BF7\u9009\u62E9\u8BC1\u4EF6\u7C7B\u578B\">\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"1\">\u8EAB\u4EFD\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"C\">\u6E2F\u6FB3\u901A\u884C\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"G\">\u53F0\u6E7E\u901A\u884C\u8BC1</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"B\">\u62A4\u7167</option>\n\t\t\t\t\t\t\t\t\t\t\t<option value=\"ID\">\u5176\u4ED6</option>\n\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"ul-item float-left position font-size-12\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\"  name=\"certno\"  maxlength=\"20\" class=\"input float-left\"  datatype=\"*0-20\" nullmsg=\"\u8BF7\u8F93\u5165\u5408\u6CD5\u7684\u8BC1\u4EF6\u53F7\u7801\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<li class=\"ul-item float-left position font-size-12\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u51FA\u751F\u65E5\u671F\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\"  name=\"birthday\"  maxlength=\"10\" class=\"input float-left\" id=\"born\"  onfocus=\"WdatePicker({readOnly:true,dateFmt:'yyyyMMdd ',maxDate:'%y-%M-%d'})\">\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t<div class=\"text-align\">\n\t\t\t\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-3E4EB2 btn-big\" id=\"save-addForm\">\u4FDD\u5B58</button>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t");
	};

	// 添加乘客


	PassengerModel.prototype.addPassenger = function addPassenger(name, id) {
		// console.log(name,id);
		if ($(".layer-select ul").find("li[data-id=" + id + "]").is("li")) {
			layer.msg("请不要重复添加");
			return;
		}
		$(".layer-select ul").append("<li class=\"float-left hoverTips\" data-id=\"" + id + "\">" + name + "</li>");
	};

	// 请求员工数据
	/*搜索员工
 * 	para:
 * 			keyword:键入的关键词
 *			callback:响应成功的回调函数
 * */


	PassengerModel.prototype.getEmpData = function getEmpData(keyword, callback) {
		$.ajax({
			type: 'POST',
			url: '/shopping/query/employee',
			data: {
				keyword: keyword,
				size: 50
			},
			success: function success(data) {
				// console.log(data);
				if (data.status === 200) {
					callback(data.data);
					return;
				}
				layer.msg(data.msg);
			},
			error: function error(_error) {
				layer.msg(_error.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
	};

	// 展示员工数据
	/*
 * 	para：
 * 		empData: 员工数据 array
 * 		this_: 当前搜索框
 * */


	PassengerModel.prototype.showEmpData = function showEmpData(empData, this_) {
		var emp = empData.items,
		    ele = this_,
		    ul = ele.next(),
		    length = emp != undefined ? emp.length : "",
		    list = "";
		if (emp == undefined || length <= 0) {
			ul.html("<li class=\"clear\">\u6682\u65E0\u7B26\u5408\u7684\u7ED3\u679C</li>");
			return;
		}
		for (var i = 0; i < length; i++) {
			var ePerson = emp[i];
			list += "\n\t\t\t\t\t<li class=\"clear\" style=\"position:relative;\">\n\t\t\t\t\t\t<input type=\"hidden\" value=\"" + ePerson.crmEmployee.id + "\" data-name=\"" + ePerson.crmEmployee.name + "\">\n\t\t\t\t\t\t" + (ePerson.linkEmpid == 1 ? "<span class=\"commonlyUsed\">\u5E38\u7528</span>" : "") + "\n\t\t\t\t\t\t<span class=\"s-p-l-name hoverTips\">" + ePerson.crmEmployee.name + "</span>\n\t\t\t\t\t\t<span class=\"s-p-l-certno\">" + ePerson.crmEmployee.certno + "</span>\n\t\t\t\t\t\t<span class=\"s-p-l-mobile\" >" + (ePerson.crmEmployee.mobile ? ePerson.crmEmployee.mobile : "") + "</span>\n\t\t\t\t\t\t<span class=\"s-p-l-certer hoverTips text-ellipsis\">" + ePerson.crmEmployee.deptname + "</span>\n\t\t\t\t\t</li>\n\t\t\t\t";
		}
		ul.html(list);
	};

	// 添加员工、常用联系人成功后回调
	/*
 * 	para:
 * 	data,保存成功后返回的数据
 * 	flag:true(常用联系人)|false(员工)
 * */


	PassengerModel.prototype.addPersonSuccess = function addPersonSuccess(data, flag) {
		var data_ = data.data,
		    empid = data_.id,
		    name = flag ? "" + data_.username : "" + data_.name;
		$(".layer-tab-content input[type='text']").val("");
		$(".layer-tab-content select").each(function () {
			var this_ = $(this),
			    option_select = this_.find("option:first"),
			    selectV = option_select.val(),
			    text = option_select.text(),
			    this_drop = this_.parents(".drop"),
			    drop_title = this_drop.find(".drop_title");
			this_.val(selectV);
			drop_title.html(text);
		});
		$(".layer-select ul").append("<li class=\"float-left hoverTips\" data-id=\"" + empid + "\">" + name + "</li>");
	};

	// 获取员工职级


	PassengerModel.prototype.getEmpLevel = function getEmpLevel($this, ls) {
		var _this = this;

		var staff = '';
		$.ajax({
			type: 'POST',
			url: '/shopping/baseData',
			data: {
				type: 'rank'
			},
			async: false,
			success: function success(data) {
				if (data.status === 200) {
					if (ls) {
						if (data.data != null && data.data != "") {
							staff = data.data;
						}
					} else {
						_this.showEmpLeve(data, $this);
					}
					return;
				}
				layer.msg(data.msg);
			},
			error: function error(_error2) {
				layer.msg(_error2.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
		if (staff != "") {
			return staff;
		}
	};
	// 展示员工职级


	PassengerModel.prototype.showEmpLeve = function showEmpLeve(data, $this) {
		var dataArr = data.data,
		    options = '',
		    lis = '',
		    ul = $this.next(),
		    select_ = $this.prev();
		if (!(dataArr instanceof Array && dataArr.length > 0)) {
			layer.alert("请维护员工职级");
			return;
		}
		$.each(dataArr, function (index, item) {
			options += "<option value=\"" + item.value + "\">" + item.name + "</option>";
			lis += "<li>" + item.name + "</li>";
		});
		select_.append(options);
		ul.append(lis);
	};
	// 展示员工职级 普通员工


	PassengerModel.prototype.showEmpLevestaff = function showEmpLevestaff($this, ls) {
		return this.getEmpLevel($this, ls)[0].value;
	};
	// 获取部门


	PassengerModel.prototype.getDept = function getDept($this) {
		var _this2 = this;

		$.ajax({
			type: 'POST',
			url: '/dept/0',
			success: function success(data) {
				if (data.status === 200) {
					_this2.showDept(data, $this);
					return;
				}
				layer.msg(data.msg);
			},
			error: function error(_error3) {
				layer.msg(_error3.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
	};

	//展示部门


	PassengerModel.prototype.showDept = function showDept(data, $this) {
		var data_ = JSON.parse(data.data);
		$(function () {
			var setting = {
				view: { dblClickExpand: false },
				data: { simpleData: { enable: true } },
				callback: { onClick: onClick }
			};
			var zNodes = data_;
			function onClick(e, treeId, treeNode) {
				$this.val(treeNode.name);
				$this.next('input[type="hidden"]').val(treeNode.id);
				$(".ztree").css("width", "160px;");
				$("#menuContent").hide();
			}
			$.fn.zTree.init($("#treeDemo"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
		});
		$(".ztree").css("width", "242px");
		showMenu();
	};

	// 添加相应事件


	PassengerModel.prototype.Events = function Events(global_obj) {
		var _this3 = this;

		// 打开乘客模块
		$("body").on("click", '[data-person="choice"]', function () {
			_this3.initAuthority();
		});
		//新增员工中英文切换
		var isCn = true;
		$("body").on("click", "#chinese", function () {
			isCn = !isCn;
			if (isCn) {
				$('#chinese').attr('src', '/static/img/common/zhong.png');
				$('#name_place').attr("placeholder", "如钱多多（必填）");
				$("#is_chinese_i_").val("1");
			} else {
				$('#chinese').attr('src', '/static/img/common/ying.png');
				$('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
				$("#is_chinese_i_").val("0");
			}
		});

		// 切换模块
		$("body").on("click", ".layer-tab li", function (event) {
			var targetEle = $(event.target),
			    tabData = _this3.tabData,
			    content = targetEle.parent('ul').next(),
			    select_ = new SelectMain();
			targetEle.is(".layer-tab-target") ? false : targetEle.addClass("layer-tab-target").siblings(".layer-tab-target").removeClass("layer-tab-target");
			content.html(_this3[tabData[targetEle.index()]]());
			$('.show').hide();
			$('#chinese').hide();
			if (targetEle.is(".layer-tab-target")) {
				if ($(".fanxian").val() == "true") {
					$('input[name="mobile"]').attr('ignore', "ignore");
					var cid = $(".cid").val(),
					    linshiId = $(".fanxian-linshi").val();
					var html = "<li class=\" clear float-left position font-size-12\" style=\"margin-left: 60px\" >\n\t\t\t\t\t\t\t\t\t\t<span class=\"ul-item-name float-left\">\u8BC1\u4EF6\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" id=\"certno\" name=\"certno\" class=\"input float-left\" maxlength=\"20\" datatype=\"*\"     nullmsg=\"\u8BF7\u8F93\u5165\u5408\u6CD5\u7684\u8BC1\u4EF6\u53F7\u7801\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"position-ab ul-item-select\">*</span>\n\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"accno\" value=\"\" id=\"emp-accno\">\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"username\" value=\"\" id=\"emp-username\">\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"name\" value=\"\" >\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"certtype\" value=\"\" >\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"companyid\" value=\"" + cid + "\" >\n\t\t\t\t\t\t\t\t\t<input type=\"hidden\" name=\"deptid\" value=\"" + linshiId + "\">";
					var htmls = "<span class=\"ul-item-name float-left\">\u624B\u673A\u53F7\u7801\uFF1A</span>\n\t\t\t\t\t\t\t\t\t\t<input type=\"text\" name=\"mobile\" class=\"input float-left\"><!--<input type=\"hidden\" name=\"certno\" value=\"\" >-->\n\t\t\t\t\t\t\t\t\t";

					if ($("#emp-accno").length <= 0) {
						$(".user_name_addform").html(htmls);
						$('#addForm ul').append(html);
					}
					$("#addForm").attr('action', '/crm/employee/save');

					$(".remove-fenxiao").remove();
				} else {
					$("#deptpid").val($("#defaultDeptId").val());
					$("[name='deptName']").val($("#defaultDeptName").val());
					var id = $.trim($(".approve_id").val());
					var name = $(".approve_name").val();
					$('input[name="approveId"]').val(id != "" ? id : "0");
					$('#shengpiguize').val(id != "" ? name : "无需审批");
				}
			}
			$(".layer-tab-content select").each(function () {
				select_.creatSelect($(this));
			});
		});

		$('body').on("blur", '#shengpiguize', function () {
			if ($.trim($("input[name='approveId']").val()) == "") {
				$("#shengpiguize").val("");
			}
		});

		//审批规则匹配
		$('body').on("click keyup", '#shengpiguize', function () {
			if ($.trim($('#shengpiguize').val()) == "") {
				$("input[name='approveId']").val("");
			};
			//初始化自动下拉数据模块
			var addrData = new DropAutoData({
				analyzerData: analyzerData,
				eventMain: eventMain,
				url: '/getApproveAll',
				this_: $(this),
				showField: "name",
				hideField: "id",
				model: 'paging',
				index: "120000",
				keyword: $(this).val()
				// departmentid
			});
			addrData.interceptor();
			/*****分析模块*用于得到[{},{}]结构的数组，然后传到volidate验证模块****/
			function analyzerData(data) {
				var data = JSON.parse(data.data);
				// console.log(data);
				$(".input-addr").addClass("_dataFull_");
				this.volidate(data.list);
			}
			/***********数据处理器*单击下拉项，向页面指定位置铺值************/
			function eventMain(this_, active) {
				//,this_被点击的列表项，active当前输入框
				$("input[name='approveId']").val(this_.attr("data-id"));
			}
		});

		// 关闭当前乘客模块
		$("body").on("click", ".layer-title span:last", function (event) {
			var this_ = $(event.target);
			this_.parent().parent().parent().remove();
			$("body").removeClass('modal-open');
		});

		// 添加乘客
		$("body").on("click", ".search-passenger-list li", function (event) {
			var e = event,
			    $ele = $(e.target);
			!$ele.is("li") ? $ele = $ele.parents("li") : "";
			var input_h = $ele.find("input[type='hidden']");
			_this3.addPassenger(input_h.attr('data-name'), input_h.val());
		});

		// 添加历史记录乘客
		$("body").on("click", "[data-history='container'] span", function (event) {
			var e = event,
			    $ele = $(e.target);
			_this3.addPassenger($ele.attr("data-name"), $ele.attr("data-id"));
		});

		// 悬浮显示选中乘客删除按钮
		$("body").on("mouseenter mouseleave", ".layer-select li", function (event) {
			var e = event,
			    type = e.type,
			    ele = $(e.target);
			if (type == 'mouseenter') {
				ele.attr("data-value", $.trim(ele.text())).addClass("remove-target-p").html("删除");
				return;
			}
			if (type == 'mouseleave') {
				ele.html(ele.attr("data-value")).removeClass("remove-target-p").removeAttr("data-value");
			}
		});

		// 删除当前乘客
		$("body").on("click", ".remove-target-p", function (event) {
			$(event.target).remove();
			$(".hoverTips_content").remove();
		});

		// 关闭乘客选择框
		$("body").on("click", ".layer-select button", function () {
			var this_ = $(this),
			    ul = this_.prev("ul"),
			    ids = "",
			    size = ul.find("li").size(),
			    $passangerModel = $(".passanger-model"),
			    idsArr = {
				addId: [],
				removeId: [],
				length: 0 // 要添加的员工数
			};
			if (size <= 0) {
				layer.msg("至少选择一位");
				return;
			}
			ul.find("li").each(function () {
				ids += $(this).attr("data-id") + ",";
			});
			if ($passangerModel.size() > 0) {
				$passangerModel.each(function () {
					var this_ = $(this),
					    id = this_.attr("data-id"),
					    reg = new RegExp(id, 'g');
					if (reg.test(ids)) {
						ids = ids.replace(id + ",", "");
					} else {
						idsArr.removeId.push(id);
					}
				});
				idsArr.addId = ids.split(",");
				idsArr.addId = idsArr.addId.slice(0, idsArr.addId.length - 1);
			} else {
				ids = ids.split(",");
				idsArr.addId = ids.slice(0, ids.length - 1);
			}
			idsArr.length = idsArr.addId.length;
			var empid = $(".contact_item:first").attr("id");
			if (idsArr.addId.length <= 5) {
				for (var i = 0; i < idsArr.addId.length; i++) {
					if (empid == idsArr.addId[i]) {
						$(".contact_item:first").addClass("active");
					}
				}
			}
			global_obj.contactCallback && global_obj.contactCallback(idsArr, this_); // 添加乘客回调
			if ($('[data-person="choice"]').attr("data-flag") != "1") {
				$(".layer-container").remove();
				$("body").removeClass('modal-open');
			}
		});

		//实时搜索乘客
		$("body").on("textchange", 'input', function (event) {
			var e = event,
			    ele = $(e.target),
			    val = $.trim(ele.val()),
			    callback = function callback(data) {
				// console.log(data);
				_this3.showEmpData(data, ele);
			};
			if (ele.parents('[data-search="container"]').is("div")) {
				ele.next().html("");
				_this3.getEmpData(val, callback);
			}
		});

		// 保存新增常用联系人，新增员工
		$("body").on("click", "#save-addForm", function (event) {
			var e = event,
			    ele = $(e.target),
			    this_ = _this3,
			    $form = ele.parents("form"),
			    flag = $form.is('[data-type="cus"]') ? true : false; // true 常用联系人
			$form.Validform({
				ajaxPost: true,
				tiptype: function tiptype(msg, o, cssctl) {
					// console.log(msg,o,cssctl);
					if (msg != "") {
						layer.msg(msg);
					}
				},
				beforeCheck: function beforeCheck() {
					if ($(".fanxian").val() == "true") {
						/*<input type="hidden" name="certtype" value="" >
       <input type="hidden" name="certno" value="" >*/
						$("#emp-accno").val($("input[name='phone']").val());
						$("#emp-username").val($("input[name='phone']").val());
						$("input[name='name']").val($("input[name='cert.username']").val());
						$("input[name='certtype']").val($('.cert_type_i').val());
						$("input[name='certno']").val($("input[name='phone']").val());
					}
				},
				beforeSubmit: function beforeSubmit() {
					//在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
					//这里明确return false的话表单将不会提交;
					if ($.trim($('input[name="approveId"]').val()) == "" && $(".fanxian").val() != "true") {
						layer.msg("请必须选择审批规则项");
						return false;
					}
				},

				callback: function callback(data) {
					if ($(".fanxian").val() == "true") {
						layer.msg(data.info);
						if (data.status == "y") {
							setTimeout(function () {
								$('#addForm').find('input[name="cert.username"]').val('');
								$('#addForm').find('input[name="phone"]').val("");
								$('#addForm').find('input[name="cert.certificate"]').val("");
							}, 3000);
						};
					} else {
						if (data.status === 200) {
							this_.addPersonSuccess(data, flag);
						}
						layer.msg(data.msg);
					}
				}
			});
		});

		// 获取员工职级
		$("body").on("click", ".drop_title", function (event) {
			var target = event.target,
			    $this = $(target),
			    $select = $this.prev();
			// console.log(target,$this);
			if ($select.is('[name="zhiwei"]') && $select.find("option").size() === 1) {
				_this3.getEmpLevel($this);
			}
		});

		// 获取部门
		$("body").on("click", '[name="deptName"]', function (event) {
			var target = event.target,
			    $this = $(target);
			_this3.getDept($this);
		});

		return this;
	};

	return PassengerModel;
}();

// 常用联系人模块


var Contact = function () {
	//参数：页面的全局对象
	function Contact() {
		_classCallCheck(this, Contact);
	}

	// 获取常用联系人数据
	/*
 *	para list
 *	type:air | train | hotel
 * */


	Contact.prototype.getData = function getData(type) {
		var _this4 = this;

		if ($('#bookFlag').val() == "2" || $('#bookFlag').val() == "3" || $('#bookFlag').val() == "4") return;
		$.ajax({
			type: 'POST',
			url: "/shopping/obtain/contact/" + type,
			dataType: 'json',
			success: function success(data) {
				if (data.status === 200) {
					_this4.viewContact(data);
					return;
				}
				layer.msg(data.msg);
			},
			error: function error(_error4) {
				layer.msg(_error4.status === 0 ? "确保您的网络畅通，请重试" : "服务器异常，请重试");
			}
		});
		return this;
	};
	//

	// 视图常用联系人
	/*
 *	para list
 *	data:常用联系人数据
  */


	Contact.prototype.viewContact = function viewContact(data) {
		var dataArr = void 0,
		    length = void 0,
		    user = data.data.user,
		    userId = data.data.user.id,
		    list = "";
		if (data.data.contacts != "" && data.data.contacts != null) {
			dataArr = data.data.contacts;
			length = dataArr.length;
		} else {
			dataArr = [];
			length = 1;
		}

		// console.log(dataArr);
		if (length <= 0) {
			$('[data-js="contact"]').hide();
			return this;
		}
		//生成当前登陆人 排在第一位
		list += "\n\t\t\t\t\t<span class=\"float-left contact_item border-radius text-ellipsis\" id=\"" + user.id + "\">\n\t\t\t\t\t\t" + user.name + "\n\t\t\t\t\t</span>\n\t\t\t\t";
		if (dataArr.length > 0) {
			for (var i = 0; i < length; i++) {
				if (userId != dataArr[i].id) {
					list += "\n\t\t\t\t\t<span class=\"float-left contact_item border-radius text-ellipsis\" id=\"" + dataArr[i].id + "\">\n\t\t\t\t\t\t" + dataArr[i].name + "\n\t\t\t\t\t</span>\n\t\t\t\t";
				}
			}
		}

		length <= 5 ? $('[data-js="contactshut"]').remove() : "";
		$('[data-js="contactcontent"]').html("" + list);
		$('[data-js="contact"]').show();
		this.global_obj.contactCallBack_ && this.global_obj.contactCallBack_(); // 添加常用联系人回调
		return this;
	};

	// 事件绑定
	/*
 *	para list
 *	global_obj:调用页面的全局对象
 * */


	Contact.prototype.Event = function Event(global_obj) {
		Contact.prototype.global_obj == undefined ? Contact.prototype.global_obj = global_obj : "";
		// 展开收起常用联系人
		$("body").on('click', '[data-js="contactshut"]', function (event) {
			var this_ = $(event.target),
			    this_c = this_.prev('[data-js="contact-container"]');
			if (this_c.height() > 45) {
				this_c.height(40);
				this_.html("展开");
				return;
			}
			this_.html("收起");
			this_c.css("height", "100%");
		});
		$("body").on("click", '[data-js="contactcontent"] span', function () {
			// 参数ids，逗号隔开
			var this_ = $(this),
			    $passangerModel = $(".passanger-model"),
			    id = $(this).attr("id"),
			    idsArr = {
				addId: [],
				removeId: [],
				length: 0 // 要添加的员工数
			},
			    flag = true;
			this_.toggleClass("active");

			if (this_.is(".active")) {
				if ($passangerModel.size() > 0) {
					$passangerModel.each(function () {
						var $thisM = $(this),
						    this_id = $thisM.attr("data-id");
						if (id == this_id) {
							flag = false;
							return false;
						}
					});
					if (!flag) {
						this_.toggleClass("active");
						layer.msg("请不要重复添加！");
						return;
					}
					idsArr.addId.push(id);
					idsArr.length = 1;
				} else {
					idsArr.addId.push(id);
					idsArr.length = 1;
				}
			} else {
				idsArr.removeId.push(id);
			}
			global_obj.contactCallback && global_obj.contactCallback(idsArr, $(this)); // 添加/移除乘客回调
		});
		return this;
	};

	return Contact;
}();

// 操作历史记录

var CookieMain = function () {
	function CookieMain() {
		_classCallCheck(this, CookieMain);
	}

	// 设置历史记录


	CookieMain.prototype.setCookie = function setCookie() {
		var persons = [],
		    historyPersons = $.cookie('historyPersons');

		// 遍历获取需要存cookie的name，id
		$("[data-model='passenger']").each(function () {
			var $this = $(this),
			    id = $this.attr("data-id"),
			    name = $this.attr("data-name");
			name != "" && name != undefined && name != null && id != "" && id != undefined && id != null ? persons.push({ name: name, id: id }) : "";
		});

		// 未选择人，不存cookie
		if (persons.length <= 0) {
			// 未选择任何乘客
			return;
		}
		// 判断cookie是否有值，没有直接存值
		if (historyPersons == "" || historyPersons == undefined || historyPersons == null) {
			historyPersons = persons.length <= 5 ? JSON.stringify(persons) : JSON.stringify(persons.slice(0, 5));
		} else {
			// 为cookie设置值
			historyPersons = JSON.stringify(this.removeRepeatArr(JSON.parse(historyPersons).concat(persons)));
		}

		// 更新cookie的有效期
		var date = new Date();
		date = date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);

		// 存储
		$.cookie('historyPersons', historyPersons, { expires: date, path: '/' });
		return this;
	};

	//读取历史记录


	CookieMain.prototype.readCookie = function readCookie() {
		return $.cookie('historyPersons') ? JSON.parse($.cookie('historyPersons')) : "";
	};

	// 数组去重 (应该归为公共方法) 返回去重后的数组


	CookieMain.prototype.removeRepeatArr = function removeRepeatArr(arr) {
		var i = 0,
		    len = arr.length,
		    arrObj = {},
		    newArr = [],
		    getId = function getId(obj) {
			return obj.id;
		};
		for (i; i < len; i++) {
			var id = getId(arr[i]);
			if (!arrObj[id]) {
				arrObj[id] = true;
				newArr.push(arr[i]);
			}
		}
		return newArr.length <= 5 ? newArr : newArr.slice(newArr.length - 5);
	};

	return CookieMain;
}();

// 出生日期


function getData() {
	var ido = document.getElementById('certno');
	var bd = document.getElementById('bd');
	if (!/^\d{6}((?:19|20)((?:\d{2}(?:0[13578]|1[02])(?:0[1-9]|[12]\d|3[01]))|(?:\d{2}(?:0[13456789]|1[012])(?:0[1-9]|[12]\d|30))|(?:\d{2}02(?:0[1-9]|1\d|2[0-8]))|(?:(?:0[48]|[2468][048]|[13579][26])0229)))\d{2}(\d)[xX\d]$/.test(ido.value)) {
		// alert('身份证号非法.');
		return;
	}
	bd.value = RegExp.$1.substr(0, 4) + '-' + RegExp.$1.substr(4, 2) + '-' + RegExp.$1.substr(6, 2);
}
//新增员工的信息的展示和隐藏
$('body').on('click', '.card_type li', function () {
	//如果点击的是身份证
	if (this.innerText === '身份证') {
		$('.show').hide();
		$('#chinese').hide();
		$('#name_place').attr("placeholder", "如钱多多（必填）");
		$("#is_chinese_i_").val("1");
	} else {
		$('.show').show();
		$('#chinese').show();
		$('#chinese').attr('src', '/static/img/common/ying.png');
		$('#name_place').attr("placeholder", "如QIAN/DUO（必填）");
		$("#is_chinese_i_").val("0");
	}
});