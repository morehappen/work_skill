package com.auvgo.web.model.caslog;

import java.io.Serializable;

/**
 * Created by realxxs on 2018/5/21.
 */
public class TravelPassenger implements Serializable {

	private static final long serialVersionUID = -2245412493778501927L;
	public String accno;//员工编号(必填)
	public String certType;//证件类型 1为身份证 B为护照
	public String certno;
	public String name;//员工姓名
	public String departName;//员工部门名称
	public String level;//员工职级,如果有差旅政策审批,请转换到在我司设置的对应的员工等级,如果没有差旅政策,传-1
	public String mobile;//出行人的手机号

	public String getAccno() {
		return accno;
	}

	public void setAccno(String accno) {
		this.accno = accno;
	}

	public String getCertType() {
		return certType;
	}

	public void setCertType(String certType) {
		this.certType = certType;
	}

	public String getCertno() {
		return certno;
	}

	public void setCertno(String certno) {
		this.certno = certno;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDepartName() {
		return departName;
	}

	public void setDepartName(String departName) {
		this.departName = departName;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}
}
