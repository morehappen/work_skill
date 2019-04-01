package com.auvgo.web.filters;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.MDC;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import com.auvgo.core.string.StringUtils;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.crm.entity.CrmEmployee;

public class RequestFilter implements Filter {
	private static final Logger LOG = LogManager.getLogger(RequestFilter.class);
	private FilterConfig config = null;
	private final String[] NULL_STRING_ARRAY = new String[0];
	private final String URL_SPLIT_PATTERN = "[, ;\r\n]";// 逗号 空格 分号 换行
	private final PathMatcher pathMatcher = new AntPathMatcher();
	private static final JsonMapper JSON = JsonMapper.nonNullMapper();
 
	private String[] whiteListURLs = null;
	private Set<String> whiteExtension = null;

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException,
			ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		String currentURL = httpRequest.getServletPath();
		int last = currentURL.lastIndexOf(".");
		String requestxtension = "";
		if (last > -1) {
			requestxtension = currentURL.substring(last+1);
		}
		String referer = httpRequest.getHeader("referer");
		if(LOG.isDebugEnabled()){
			LOG.debug("url filter : current url : [{}]", currentURL + "  " + referer);
		}
		if (isWhiteURL(currentURL, requestxtension)) {
			chain.doFilter(httpRequest, httpResponse);
			return;
		}
		isLogin(httpRequest);
		chain.doFilter(new RequestWrapper(httpRequest), httpResponse);
	}


	@SuppressWarnings("rawtypes")
	private boolean isLogin(HttpServletRequest httpRequest){
		Object ac = SecurityUtils.getSubject().getPrincipal();
		if (ac ==null) {
			return false;
		}
		CrmEmployee emp = (CrmEmployee)ac;
		Map param = httpRequest.getParameterMap();
//		if (param != null && !param.isEmpty() && param.containsKey("bigdata")) {
//			Map p = new HashMap();
//			p.putAll(param);
//			p.put("modelSign", "");
//			param = p;
//			p = null;
//		}
		MDC.put("TraceId",emp.getId()+emp.getUsername());
		LOG.info("用户:{},公司:{},时间:{},访问IP:{},访问地址:{},paramter:{}", emp.getName(),emp.getCompanyid(),
				DateUtil.getCurrentDateStr("yyyy-MM-dd HH:mm:ss"),ClientIPUtils.getsClientIPAddress(httpRequest),httpRequest.getServletPath(),
				JSON.toJson(param));
		param = null;
		return true;
	}

	private boolean isWhiteURL(String currentURL, String requestxtension) {
		if (whiteExtension != null && whiteExtension.contains(requestxtension)) {
			return true;
		}
		for (String whiteURL : whiteListURLs) {
			if (pathMatcher.match(whiteURL, currentURL)) {
				LOG.debug("url filter : white url list matches : [{}] match [{}] continue", whiteURL, currentURL);
				return true;
			}
			LOG.debug("url filter : white url list not matches : [{}] match [{}]", whiteURL, currentURL);
		}
		return false;
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		this.config = config;
		this.initConfig();
		this.init();
	}

	/**
	 * 子类覆盖
	 * 
	 * @throws ServletException
	 */
	public void init() throws ServletException {

	}

	private void initConfig() {
		String whiteListURLStr = this.config.getInitParameter("whiteListURL");
		whiteListURLs = strToArray(whiteListURLStr);
		String whiteExt = this.config.getInitParameter("whiteExtension");
		whiteExtension = new HashSet<String>();
		String[] urlArray = whiteExt.split(URL_SPLIT_PATTERN);
		for (String url : urlArray) {
			url = url.trim();
			if (url.length() == 0) {
				continue;
			}
			whiteExtension.add(url);
		}
	}

	private String[] strToArray(String urlStr) {
		if (StringUtils.isBlank(urlStr)) {
			return NULL_STRING_ARRAY;
		}
		String[] urlArray = urlStr.split(URL_SPLIT_PATTERN);
		List<String> urlList = new ArrayList<String>();
		for (String url : urlArray) {
			url = url.trim();
			if (url.length() == 0) {
				continue;
			}
			urlList.add(url);
		}
		return urlList.toArray(NULL_STRING_ARRAY);
	}

}
