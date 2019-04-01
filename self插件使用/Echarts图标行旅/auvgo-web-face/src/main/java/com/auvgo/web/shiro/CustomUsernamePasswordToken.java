package com.auvgo.web.shiro;

import org.apache.shiro.authc.UsernamePasswordToken;

public class CustomUsernamePasswordToken extends UsernamePasswordToken {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7440872598392177623L;
	// 用于存储用户输入的校验码
	private String validCode;
	private String kahao;
	private String loginPassword;

	public CustomUsernamePasswordToken(String username,String kahao, String password, String host, String validCode) {
		// 调用父类的构造函数
		super(username, password, host);
		this.validCode = validCode;
		this.kahao = kahao;
		this.loginPassword=password;
	}

	public String getValidCode() {
		return validCode;
	}

	public void setValidCode(String validCode) {
		this.validCode = validCode;
	}

	public String getKahao() {
		return kahao;
	}

	public void setKahao(String kahao) {
		this.kahao = kahao;
	}

	public String getLoginPassword() {
		return loginPassword;
	}

	public void setLoginPassword(String loginPassword) {
		this.loginPassword = loginPassword;
	}

}