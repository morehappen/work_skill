package com.auvgo.web.face.air;

import java.util.Date;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.auvgo.air.api.AirInternationalXuqiudanService;
import com.auvgo.air.entity.AirInternationalXuqiudan;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.web.face.BaseController;


@Controller
@RequestMapping("/air/international")
public class AirInternationalXuqiudanController extends BaseController{
	@Autowired
	private AirInternationalXuqiudanService airInternationalXuqiudanService;
	
	
	@RequestMapping("/xuqiudan")
	public String toGuojixuqiu() {
		CrmEmployee user = getUser();
		setAttr("User", user);
		UUID randomUUID = UUID.randomUUID();
		setAttr("token", randomUUID.toString());
		setSessionAttr("tokens", randomUUID.toString());
		return "DemandSheet/guoji-demand";
	}
	@RequestMapping("/save")
	public String saveDingding(AirInternationalXuqiudan airInternationalXuqiudan,String travelOrderno) {
	try{
		String token = request.getParameter("token");
		String tokens = String.valueOf(getSessionAttr("tokens"));
		if (!token.equals(tokens)) {
			setAttr("failMsg", "请勿重复提交订单");
			return "/common/error";
		}else{
			removeSession("tokens");
		}
	    CrmEmployee user = getUser();
	    airInternationalXuqiudan.setOpuserid(user.getId());
	    airInternationalXuqiudan.setEmployeeid(Long.valueOf(user.getId()));
	    airInternationalXuqiudan.setCompanyid(user.getCompanyid());
	    airInternationalXuqiudan.setOpusername(user.getName());
	    airInternationalXuqiudan.setDotime(new Date());
	    airInternationalXuqiudan.setBookuserid(user.getId());
	    airInternationalXuqiudan.setBookusername(user.getName());
	    airInternationalXuqiudan.setBookdeptid(user.getDeptid().toString());
	    airInternationalXuqiudan.setBookdeptname(user.getDeptname());
	    airInternationalXuqiudan.setStatus(0);
	    if(StringUtils.isNotBlank(travelOrderno)){
	    	StringBuffer sb = new StringBuffer();
	    	sb.append(airInternationalXuqiudan.getRemark() +"出差申请单号: "+travelOrderno);
	    	airInternationalXuqiudan.setRemark(sb.toString());
	    }
	    airInternationalXuqiudan.setCreatetime(new Date());
	    airInternationalXuqiudan.setOrderFrom(1);
	    String orderno = airInternationalXuqiudanService.saveOrUpdateXqd(airInternationalXuqiudan);
    	setAttr("orderno", orderno);
    	setAttr("flag", "I");
    	removeSession("p");
		return "/DemandSheet/demand-success";
		} catch (Exception e) {
			log.warn("/air/international/save error --> {}", e);
			setAttr("failMsg", "保存异常!");
			return "/common/error";
		}
	}
	

}
