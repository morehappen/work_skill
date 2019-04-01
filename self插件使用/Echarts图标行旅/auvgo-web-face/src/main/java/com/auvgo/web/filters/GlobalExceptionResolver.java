package com.auvgo.web.filters;


import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by realxxs on 2018/4/11.
 */
public class GlobalExceptionResolver implements HandlerExceptionResolver {

	private static final Logger logger = LogManager.getLogger(GlobalExceptionResolver.class);


	@Override
	public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
		logger.error("GlobalExceptionResolver-->", ex);
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName("/common/error-500");
		return modelAndView;
	}
}
