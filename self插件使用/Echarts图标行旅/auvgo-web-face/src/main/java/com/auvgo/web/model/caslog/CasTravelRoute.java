package com.auvgo.web.model.caslog;

import java.io.Serializable;

/**
 * Created by realxxs on 2018/7/19.
 */
public class CasTravelRoute implements Serializable {

	private static final long serialVersionUID = -6707905209674142760L;

	public String from; //出发城市名
	public String fromcode; //出发城市编码
	public String arrive;//到达城市
	public String arrivecode;//到达城市编码
	public String startdate;//出发日期
	public String arrivedate;//到达日期
	public String isCanModify;//是否可以修改,0 不可以修改,1 可以修改
	public int sort;//第一程 去程 为1 返程为第二程 为2

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

	public String getIsCanModify() {
		return isCanModify;
	}

	public int getSort() {
		return sort;
	}

	public void setSort(int sort) {
		this.sort = sort;
	}

	public void setIsCanModify(String isCanModify) {
		this.isCanModify = isCanModify;
	}
}
