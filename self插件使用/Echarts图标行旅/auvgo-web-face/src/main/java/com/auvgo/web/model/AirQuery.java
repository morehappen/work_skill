package com.auvgo.web.model;

public class AirQuery {

	private String type;// 单程或往返        
	private String from;// 出发地代码     
	private String fromName;// 始发城市
	private String arrive;// 到达地代码     
	private String arriveName;// 到达城市
	private String startdate;// 出发时间
	private String backdate;//返回时间
	private String airline;// 航空公司
	private String cab;// 舱位
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
	public String getStartdate() {
		return startdate;
	}
	public void setStartdate(String startdate) {
		this.startdate = startdate;
	}
	public String getBackdate() {
		return backdate;
	}
	public void setBackdate(String backdate) {
		this.backdate = backdate;
	}
	public String getAirline() {
		return airline;
	}
	public void setAirline(String airline) {
		this.airline = airline;
	}
	public String getCab() {
		return cab;
	}
	public void setCab(String cab) {
		this.cab = cab;
	}
	@Override
	public String toString() {
		return "AirQuery [type=" + type + ", from=" + from + ", fromName=" + fromName + ", arrive=" + arrive + ", arriveName=" + arriveName + ", startdate=" + startdate
				+ ", backdate=" + backdate + ", airline=" + airline + ", cab=" + cab + "]";
	}
}
