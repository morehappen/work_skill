package com.auvgo.web.contant;

import java.util.Map;

import com.google.common.collect.Maps;

/**
 * 接口code
 * 
 */
public class ErrorCode {
	/**
	 * 成功
	 */
	public static Integer SUCCESS = 200;
	/**
	 * 错误
	 */
	public static Integer ERROR = 500;
	/**
	 * 安全验证错误，不符合安全校验规则
	 */
	public static Integer SIGN_ERROR = 201;
	/**
	 * 输入参数为空或错误
	 */
	public static Integer WRONG_PARAMS = 202;
	/**
	 * 该员工没有差旅政策
	 */
	public static Integer NO_CHAILV = 2021;
	/**
	 * 非授权合作商户
	 */
	public static Integer NO_SHOUQUAN = 203;

	public static Integer WRONG_TYPE = 301;

	public static Integer WRONG_LENGTH = 302;

	public static Integer WRONG_EXIST = 303;

	public static Integer WRONG_EXIST_CERT = 304;

	public static Integer WRONG_TYPE_DEPT = 401;

	public static Integer WRONG_LENGTH_DEPT = 402;

	public static Integer WRONG_EXIST_DEPT = 403;

	public static Integer WRONG_EXIST_APFORM = 404;

	public static Integer WRONG_LENGTH_APFORM = 405;

	public static Integer WRONG_TYPE_APFORM = 406;

	public static Integer ERROR_NONE = 499;

	public static Map<Integer, String> msgMap = Maps.newHashMap();

	static {
		msgMap.put(SUCCESS, "success");
		msgMap.put(SIGN_ERROR, "安全验证错误，不符合安全校验规则");
		msgMap.put(WRONG_PARAMS, "输入参数为空或错误");
		msgMap.put(NO_SHOUQUAN, "非授权合作商户");
		msgMap.put(WRONG_TYPE, "err:提交参数类型不正确");
		msgMap.put(WRONG_LENGTH, "err:提交参数长度不正确");
		msgMap.put(WRONG_EXIST, "提交的职工id已存在");
		msgMap.put(WRONG_EXIST_CERT, "提交的证件号码已存在");
		msgMap.put(WRONG_TYPE_DEPT, "err:提交参数类型不正确");
		msgMap.put(WRONG_LENGTH_DEPT, "err:提交参数长度不正确");
		msgMap.put(WRONG_EXIST_DEPT, "部门id已存在");
		msgMap.put(WRONG_EXIST_APFORM, "订单号已存在");
		msgMap.put(WRONG_LENGTH_APFORM, "提交订单的参数长度不正确");
		msgMap.put(WRONG_TYPE_APFORM, "提交订单的参数类型不正确");
		msgMap.put(ERROR_NONE, "未知错误！");
	}

	/**
	 * 获取msg信息
	 * 
	 * @param status
	 * @return
	 */
	public static String getMsg(Integer status) {
		return msgMap.get(status);
	}
	
}
