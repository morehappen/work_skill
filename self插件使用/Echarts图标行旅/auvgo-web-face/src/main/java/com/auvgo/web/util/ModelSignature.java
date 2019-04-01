package com.auvgo.web.util;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.auvgo.air.entity.AirOrderModel;
import com.auvgo.core.utils.AESUtil;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.train.entity.TrainOrderModel;

public class ModelSignature {
	private static Logger logger = LogManager.getLogger(ModelSignature.class);
	private static JsonMapper json = JsonMapper.nonNullMapper();

	/**
	 * 解密
	 * 
	 * @param sign
	 * @param clazz
	 * @return
	 * @throws Exception
	 */
	public static <T> T decryptSign(String sign, Class<T> clazz) {
		try {
			sign = AESUtil.AESDncode(sign, AESUtil.keyword);
		} catch (Exception e) {
			logger.error("decryptSign fail", e);
		}
		return json.fromJson(sign, clazz);
	}

	/**
	 * 机票加密
	 * 
	 * @param model
	 * @return
	 * @throws Exception
	 */
	public  static String AirencryptSign(AirOrderModel model) {
		String context = json.toJson(model);
		try {
			context = AESUtil.AESEncode(context, AESUtil.keyword);
		} catch (Exception e) {
			logger.error("AirencryptSign fail", e);
		}
		return context;
	}
	
	/**
	 * 火车票加密
	 * 
	 * @param model
	 * @return
	 * @throws Exception
	 */
	public  static String TrainencryptSign(TrainOrderModel model) {
		String context = json.toJson(model);
		try {
			context = AESUtil.AESEncode(context, AESUtil.keyword);
		} catch (Exception e) {
			logger.error("AirencryptSign fail", e);
		}
		return context;
	}

}
