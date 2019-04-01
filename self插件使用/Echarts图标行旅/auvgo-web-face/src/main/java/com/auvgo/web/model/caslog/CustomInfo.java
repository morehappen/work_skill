package com.auvgo.web.model.caslog;

import java.io.Serializable;

/**
 * 单点登录公司信息
 *
 * @author realxxs
 * 2018年2月1日 下午3:37:09
 */
public class CustomInfo implements Serializable {


	private static final long serialVersionUID = 7529600132542117937L;
	public String backUrl;//需要推送的url
	public String isNeedPush;//是否需要推送数据;"0"需要,"1" 不需要
	public String cusCode;//公司卡号
	public String emCode;//
	public String outOrderno;//第三方公司的单号
	public String bookUserName;//预订人姓名
	public String bookMobile;//预订人手机号
	public String getBackUrl() {
		return backUrl;
	}
	public void setBackUrl(String backUrl) {
		this.backUrl = backUrl;
	}
	public String getIsNeedPush() {
		return isNeedPush;
	}
	public void setIsNeedPush(String isNeedPush) {
		this.isNeedPush = isNeedPush;
	}
	public String getCusCode() {
		return cusCode;
	}
	public void setCusCode(String cusCode) {
		this.cusCode = cusCode;
	}
	public String getEmCode() {
		return emCode;
	}
	public void setEmCode(String emCode) {
		this.emCode = emCode;
	}
	public String getOutOrderno() {
		return outOrderno;
	}
	public void setOutOrderno(String outOrderno) {
		this.outOrderno = outOrderno;
	}
	public String getBookUserName() {
		return bookUserName;
	}
	public void setBookUserName(String bookUserName) {
		this.bookUserName = bookUserName;
	}

	public String getBookMobile() {
		return bookMobile;
	}

	public void setBookMobile(String bookMobile) {
		this.bookMobile = bookMobile;
	}
}
