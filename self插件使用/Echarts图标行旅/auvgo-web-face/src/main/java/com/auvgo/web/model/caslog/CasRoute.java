package com.auvgo.web.model.caslog;

import java.io.Serializable;

/**
 * 单点登录 传输过来的行程信息实体
 * @author realxxs
 * 2018年2月1日 下午2:46:01
 */
public class CasRoute implements Serializable{
	
	private static final long serialVersionUID = -6707905209674185760L;
	public String from; //出发城市名
	public String fromcode; //出发城市编码
	public String arrive;//到达城市
	public String arrivecode;//到达城市编码
	public String startdate;//出发日期
	public String arrivedate;//到达日期
	public String isCanModify;//是否可以修改,0 不可以修改,1 可以修改
	public String getFrom() {
		return from;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	public String getFromcode() {
		return fromcode;
	}
	public void setFromcode(String fromcode) {
		this.fromcode = fromcode;
	}
	public String getArrive() {
		return arrive;
	}
	public void setArrive(String arrive) {
		this.arrive = arrive;
	}
	public String getArrivecode() {
		return arrivecode;
	}
	public void setArrivecode(String arrivecode) {
		this.arrivecode = arrivecode;
	}
	public String getIsCanModify() {
		return isCanModify;
	}
	public void setIsCanModify(String isCanModify) {
		this.isCanModify = isCanModify;
	}
	public String getStartdate() {
		return startdate;
	}
	public void setStartdate(String startdate) {
		this.startdate = startdate;
	}
	public String getArrivedate() {
		return arrivedate;
	}
	public void setArrivedate(String arrivedate) {
		this.arrivedate = arrivedate;
	}

}
