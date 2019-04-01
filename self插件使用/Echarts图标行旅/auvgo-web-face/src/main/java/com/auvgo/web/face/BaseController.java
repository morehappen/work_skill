package com.auvgo.web.face;

import com.auvgo.config.EnvironmentAddress;
import com.auvgo.core.contant.PushStatusContant;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.CustomInfo;
import com.google.common.collect.Lists;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.web.bind.ServletRequestDataBinder;
import org.springframework.web.bind.annotation.InitBinder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public abstract class BaseController {
	protected Logger log = LogManager.getLogger(getClass());

	@Autowired
	protected HttpServletRequest request;
	@Autowired
	protected HttpServletResponse response;
	public static JsonMapper jsonMapper = JsonMapper.nonNullMapper();

	protected static Integer PAGE_SIZE = 30;
	private CustomInfo customInfo;

	@InitBinder
	public void InitBinder(ServletRequestDataBinder bin) {
		bin.registerCustomEditor(Date.class, new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), true));
	}

	/**
	 * 得到当前登录用户
	 *
	 * @return
	 */
	public CrmEmployee getUser() {
		CrmEmployee adm = (CrmEmployee) SecurityUtils.getSubject().getPrincipal();
		return adm;
	}

	public void setAttr(String name, Object value) {
		request.setAttribute(name, value);
	}

	public Object getAttr(String name) {
		return request.getAttribute(name);
	}

	public void setSessionAttr(String name, Object value) {
		request.getSession().setAttribute(name, value);
	}

	public Object getSessionAttr(String name) {
		return request.getSession().getAttribute(name);
	}

	public void removeSession(String name) {
		request.getSession().removeAttribute(name);
	}

	public CrmCompany getCompany() {
		return (CrmCompany) request.getSession().getAttribute("company");
	}

	//获取是否为总公司的人登录
	public boolean isParentCompany() {
		CrmCompany company = (CrmCompany) request.getSession().getAttribute("company");
		String bianhao = EnvironmentAddress.getConfig("sys_company");
		if (bianhao.equals(company.getServerNo())) {
			return true;
		} else {
			return false;
		}
	}

	//判断是否为 预付款底下的公司
	public boolean isPrepayCompany() {
		CrmCompany company = (CrmCompany) request.getSession().getAttribute("company");
		String prePay_serverNo = EnvironmentAddress.getConfig("prePay_serverNo");
		List<String> prePay = Lists.newArrayList(prePay_serverNo);
		if (prePay.contains(company.getServerNo())) {
			return true;
		} else {
			return false;
		}
	}

	@SuppressWarnings("unchecked")
	public SysOutpushData dealCasloginMsg(Long companyid, String orderNO, String orderType, SysOutpushData push) {
		CasBookModel casBookModel = jsonMapper.fromJson(getSessionAttr("casModel") + "", CasBookModel.class);
		if (null == casBookModel || null == casBookModel.getCustinfo()) {
			return null;
		}

		CustomInfo customInfo = casBookModel.getCustinfo();
		SysOutpushData outPushData = new SysOutpushData();
		if (null != customInfo) {
			String outOrderno = customInfo.getOutOrderno();
			if (!"-1".equals(outOrderno)) {
				outPushData.setOutOrderNo("");
			} else {
				outPushData.setOutOrderNo(outOrderno);
			}
			outPushData.setBackUrl(customInfo.getBackUrl());
			outPushData.setCompanyid(companyid);
			outPushData.setKahao(customInfo.getCusCode());
			outPushData.setOrderNo(orderNO);
			outPushData.setOutOrderNo(outOrderno);// 第三方的公司id号
			outPushData.setOrderType(orderType);
			outPushData.setPushUsername(customInfo.getEmCode());// 用户名
			outPushData.setPushStatus(PushStatusContant.PUSH_WEITUI);
			outPushData.setCreatetime(new Date());
		}
		if (null != push) {
			outPushData.setId(push.getId());
		}
		removeSession("casModel");
		return outPushData;
	}

}
