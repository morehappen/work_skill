package com.auvgo.web.filters;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import com.auvgo.core.string.StringUtils;

public final class RequestWrapper extends HttpServletRequestWrapper {

	public RequestWrapper(HttpServletRequest httpservletrequest) {
		super(httpservletrequest);
	}

	public String getQueryString() {
		String queryString = super.getQueryString();
		if (queryString == null) {
			return null;
		} else {
			return cleanXSS(queryString);
		}
	}
	

	@SuppressWarnings({ "unchecked","rawtypes"})
	@Override
	public Map getParameterMap() {
		Map<String,Object> map=new HashMap<String, Object>();
		Map<String, String[]> data=super.getParameterMap();
		for (Entry<String,String[]> entry : data.entrySet()) {
			if(entry.getValue()!=null && entry.getValue().getClass().isArray()){
				String[] value=entry.getValue();
				for (int i = 0; i < value.length; i++) {
					value[i]=cleanXSS(value[i]);
				}
				map.put(entry.getKey(),value);
			}else{
				map.put(entry.getKey(),cleanXSS(entry.getValue()+""));
			}
		}
		return map;
	}

	@Override
	public String[] getParameterValues(String s) {
		String str[] = super.getParameterValues(s);
		if (str == null) {
			return null;
		}
		int i = str.length;
		String as1[] = new String[i];
		for (int j = 0; j < i; j++) {
			as1[j] = cleanXSS(str[j]);
		}
		return as1;
	}
	
	@Override
	public String getParameter(String s) {
		String s1 = super.getParameter(s);
		if (s1 == null) {
			return null;
		} else {
			return cleanXSS(s1);
		}
	}


	public StringBuffer getRequestURL() {
		return super.getRequestURL();
	}


	public String getHeader(String s) {
		String s1 = super.getHeader(s);
		if (s1 == null) {
			return null;
		} else {
			return cleanXSS(s1);
		}
	}

	private String cleanXSS(String s) {
		if (StringUtils.isBlank(s)) {
			return s;
		}
//		s = s.replaceAll("/", "%2F");
//		s = s.replaceAll("&", "%26");
//		s = s.replaceAll("img", "");
//		s = s.replaceAll("\\|", "");
//		s = s.replaceAll("\\+", "%2B");
		s = s.replaceAll("\\?", "%3F");
		s = s.replaceAll("#", "%23");
		s = s.replaceAll("=", "%3D");
		s = s.replaceAll("%", "%25");
		s = s.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
		//s = s.replaceAll("\\(", "&#40;").replaceAll("\\)", "&#41;");
		s = s.replaceAll("'", "&#39;");
		s = s.replaceAll("eval\\((.*)\\)", "");
		s = s.replaceAll("[\\\"\\'][\\s]*javascript:(.*)[\\\"\\']", "\"\"");
		s = s.replaceAll("script", "");
		s=s.trim();
		return s;
	}
}
