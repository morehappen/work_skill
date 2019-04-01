package com.auvgo.web.interceptors;

import java.lang.reflect.Method;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

public class TokenInterceptor extends HandlerInterceptorAdapter{
    @Override    
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {    
        if (handler instanceof HandlerMethod) {    
            HandlerMethod handlerMethod = (HandlerMethod) handler;    
            Method method = handlerMethod.getMethod();    
            Token annotation = method.getAnnotation(Token.class);//判断是否有标注  
            if (annotation != null) {    
                boolean save = annotation.save();//saveentity方法触发
                if (save) {    
                	TokenUtils.setToken(request);
                }  
                boolean remove = annotation.remove();  
                if (remove) {  
                    if (!TokenUtils.validToken(request)) {  
                        response.setContentType("text/html;charset=utf-8");  
                        response.getWriter().write("请不要重复提交！");  
                        return false;    
                    }    
                }    
            }    
            return true;    
        } else {    
            return super.preHandle(request, response, handler);    
        }    
    }
}
