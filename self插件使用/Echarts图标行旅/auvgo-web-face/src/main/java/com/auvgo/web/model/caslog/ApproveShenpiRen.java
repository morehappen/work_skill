package com.auvgo.web.model.caslog;

import java.io.Serializable;

public class ApproveShenpiRen implements Serializable {

	private static final long serialVersionUID = -2245412493778501927L;
	public String username;//审批人登录名
	public String mobile;//手机
	public String email;//邮箱
	public String name;//审批人姓名
	public String level;//审批等级
	public String isDefaultApprove;//1是,2否 如果超出标准追加一级审批

	public String getIsDefaultApprove() {
		return isDefaultApprove;
	}
	public void setIsDefaultApprove(String isDefaultApprove) {
		this.isDefaultApprove = isDefaultApprove;
	}
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

}
