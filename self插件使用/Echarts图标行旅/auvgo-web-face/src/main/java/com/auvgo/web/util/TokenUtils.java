package com.auvgo.web.util;

import com.auvgo.core.string.StringUtils;
import com.auvgo.redis.common.KeysDefaultOperations;
import com.auvgo.redis.common.KeysOperations;
import com.auvgo.redis.common.StringDefaultOperations;
import com.auvgo.redis.common.StringOperations;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpServletRequest;
import java.math.BigInteger;
import java.util.Map;
import java.util.Random;

public class TokenUtils {
	private static final Logger LOG = LogManager.getLogger(TokenUtils.class);
	private static StringOperations stringOperations = new StringDefaultOperations();
	private static KeysOperations keysOperations = new KeysDefaultOperations();

	/**
	 * 保存token值的默认命名空间
	 */
	public static final String REDIS_NAMESPACE = "auvgo.tokens";
	/**
	 * 持有token名称的字段名
	 */
	public static final String TOKEN_NAME_FIELD = "auvgo_token";
	
	private static final Random RANDOM = new Random();

	/**
	 * 使用随机字串作为token名字保存token
	 * 
	 * @param request
	 * @return token
	 */
	public static String setToken(HttpServletRequest request) {
		return setToken(request, generateGUID());
	}

	/**
	 * 使用给定的字串作为token名字保存token
	 * 
	 * @param request
	 * @param tokenName
	 * @return token
	 */
	private static String setToken(HttpServletRequest request, String tokenName) {
		String token = generateGUID();
		setCacheToken(request, tokenName, token);
		return token;
	}

	/**
	 * 保存一个给定名字和值的token
	 * 
	 * @param request
	 * @param tokenName
	 * @param token
	 */
	private static void setCacheToken(HttpServletRequest request, String tokenName, String token) {
		try {
			String tokenName0 = buildTokenCacheAttributeName(tokenName);
			stringOperations.setex(tokenName0,60*10,token);
            request.setAttribute(TOKEN_NAME_FIELD,tokenName+"_"+token);
			LOG.info("tokenName:{} , tokenValue:{}",tokenName ,token);
		} catch (IllegalStateException e) {
			String msg = "Error creating HttpSession due response is commited to client. You can use the CreateSessionInterceptor or create the HttpSession from your action before the result is rendered to the client: "
					+ e.getMessage();
			LOG.error(msg, e);
			throw new IllegalArgumentException(msg);
		}
	}

	/**
	 * 构建一个基于token名字的带有命名空间为前缀的token名字
	 * 
	 * @param tokenName
	 * @return the name space prefixed session token name
	 */
	public static String buildTokenCacheAttributeName(String tokenName) {
		return REDIS_NAMESPACE + "." + tokenName;
	}

//	/**
//	 * 从请求域中获取给定token名字的token值
//	 * 
//	 * @param tokenName
//	 * @return the token String or null, if the token could not be found
//	 */
//	@SuppressWarnings("rawtypes")
//	private static String getToken(HttpServletRequest request, String tokenName) {
//		if (tokenName == null) {
//			return null;
//		}
//		Map params = request.getParameterMap();
//		String[] tokens = (String[])(String[])params.get(tokenName);
//		String token;
//		if ((tokens == null) || (tokens.length < 1)) {
//			LOG.warn("Could not find token mapped to token name " + tokenName);
//			return null;
//		}
//		token = tokens[0];
//		return token;
//	}

	/**
	 * 从请求参数中获取token名字
	 * 
	 * @return the token name found in the params, or null if it could not be
	 *         found
	 */
	@SuppressWarnings("rawtypes")
	private static String getTokenName(HttpServletRequest request) {
		Map params = request.getParameterMap();
		if (!params.containsKey(TOKEN_NAME_FIELD)) {
			LOG.warn("Could not find token name in params.");
			return null;
		}
		String[] tokenNames = (String[]) params.get(TOKEN_NAME_FIELD);
		String tokenName;
		if ((tokenNames == null) || (tokenNames.length < 1)) {
			LOG.warn("Got a null or empty token name.");
			return null;
		}
		tokenName = tokenNames[0];
		return tokenName;
	}

	/**
	 * 验证当前请求参数中的token是否合法，如果合法的token出现就会删除它，它不会再次成功合法的token
	 * 
	 * @return 验证结果
	 */
	public static boolean validToken(HttpServletRequest request) {
		boolean rs=true;
		String tokenName = getTokenName(request);
		if (tokenName == null) {
			LOG.debug("no token name found -> Invalid token ");
			rs=false;
		}
		String[] tokens=tokenName.split("_");
		if (tokens == null || tokens.length!=2) {
			if (LOG.isDebugEnabled()) {
				LOG.debug("no token found for token name " + tokenName + " -> Invalid token ");
			}
			rs=false;
		}
		try {
			String tokenCacheName = buildTokenCacheAttributeName(tokens[0]);
			String cacheToken =stringOperations.get(tokenCacheName);
			LOG.info("tokenCacheName:{} , cacheToken:{}" , tokenCacheName , tokenName);
			if (StringUtils.isBlank(cacheToken) || !tokens[1].equals(cacheToken)) {
				LOG.warn("xxx.internal.invalid.token Form token " + tokens + " does not match the session token " + cacheToken + ".");
				rs=false;
			}
			// remove the token so it won't be used again
			keysOperations.del(tokenCacheName);
		} catch (Exception e) {
			LOG.error("validToken fail",e);
		}
		return rs;
	}

	public static String generateGUID() {
		return new BigInteger(165, RANDOM).toString(36).toUpperCase();
	}

}
