package com.auvgo.web.model;

import org.apache.commons.lang.builder.ToStringBuilder;

public class TrainQueryModel {
	private String type;// 单程或往返        
	private String from;// 出发地代码     
	private String fromName;// 始发城市
	private String arrive;// 到达地代码     
	private String arriveName;// 到达城市
	private String startDate;// 出发时间
	private String backDate;//返回时间
	private String trainType;//车次
	private String orderno;//
	
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getFrom() {
		return from;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	public String getFromName() {
		return fromName;
	}
	public void setFromName(String fromName) {
		this.fromName = fromName;
	}
	public String getArrive() {
		return arrive;
	}
	public void setArrive(String arrive) {
		this.arrive = arrive;
	}
	public String getArriveName() {
		return arriveName;
	}
	public void setArriveName(String arriveName) {
		this.arriveName = arriveName;
	}
	public String getStartDate() {
		return startDate;
	}
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}
	public String getBackDate() {
		return backDate;
	}
	public void setBackDate(String backDate) {
		this.backDate = backDate;
	}
	public String getTrainType() {
		return trainType;
	}
	public void setTrainType(String trainType) {
		this.trainType = trainType;
	}
	public String getOrderno() {
		return orderno;
	}
	public void setOrderno(String orderno) {
		this.orderno = orderno;
	}
	
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	
}
