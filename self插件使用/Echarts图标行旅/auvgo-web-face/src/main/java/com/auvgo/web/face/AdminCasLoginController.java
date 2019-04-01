package com.auvgo.web.face;

import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.Md5Sign;
import com.auvgo.core.utils.ProConfUtil;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.data.api.DataCompanyAuthService;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysMenuService;
import com.auvgo.web.shiro.CustomUsernamePasswordToken;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/oa")
public class AdminCasLoginController extends BaseController {
	@Autowired
	DataCompanyAuthService authService;
	@Autowired
	CrmEmployeeService employeeService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private SysMenuService menuService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private CrmProductSetService crmProductSetService;

	@SuppressWarnings("unchecked")
	@RequestMapping("/casadminlogin/{appkey}/{data}/{sign}")
	public String caslogin(@PathVariable("appkey") String appkey, @PathVariable("data") String data, @PathVariable("sign") String sign) {
		log.info("caslogin request-->appkey:{},data:{},sign:{}", appkey, data, sign);
		String securet = "0e7b5bf73f558c3d4c9e988af87ad48b";
		if (StringUtils.isBlank(appkey) || StringUtils.isBlank(data) || StringUtils.isBlank(sign)) {
			setAttr("failMsg", "参数错误，请联系管理员");
			return "/common/error";
		}
		try {
			Map<String, String> map = JsonUtils.jsonToPojo(data, Map.class);
			String username = map.get("username");
			String companyid = map.get("companyid");
			String opUserName = map.get("opUserName");
			String opUserId = map.get("opUserId");// 代用
			String value = appkey + data + securet;
			if (!checkParams(value, sign, securet)) {
				setAttr("failMsg", "签名校验失败，请联系管理员");
				return "/common/error";
			}
			CrmEmployeeModel employee = employeeService.getCasLoginByUsername(Long.parseLong(companyid), username);
			if (null == employee) {
				setAttr("failMsg", "没有此员工的相关信息，请联系管理员");
				return "/common/error";
			}
			setSessionAttr("user", employee);
			CrmCompany company = companyService.getById(Long.parseLong(companyid));
			String password = "password".toUpperCase();
			if (StringUtils.isNotBlank(employee.getPassword())) {
				password = employee.getPassword();
			}
			CustomUsernamePasswordToken token = new CustomUsernamePasswordToken(username, company.getBianhao(), password.toUpperCase(), getIp(request), "");
			SecurityUtils.getSubject().login(token);
			if(username.equals(company.getUsername())){//超级管理员
				setSessionAttr("menus", menuService.findSuperpermissions(1));// 查看前台菜单
			}else{
				setSessionAttr("menus", menuService.findCrmpermissions(username, 1, company.getId()));// 查看前台菜单
			}
			setAttr("company1", company);
			if (company.getStatus() == 1) {
				return "/login";
			}
			List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
			for (DataZidianValue dataZidianValue : staffList) {
				if (employee.getZhiwei().toString().equals(dataZidianValue.getValue())) {
					setSessionAttr("zhiwei", dataZidianValue);
					break;
				}
			}
			setSessionAttr("company", company);
			setSessionAttr("user", employee);
			setSessionAttr("opusername", opUserName);
			setSessionAttr("opuserid", opUserId);
			setAttr("crmEmployee", employee);
			setCompanyConfig(company.getId());
			log.info("opUserName:{}", opUserName);
			return "/index";
		} catch (Exception e) {
			setAttr("failMsg", e.getMessage());
			return "/common/error";
		}
	}

	protected void setCompanyConfig(Long cid) {
		List<String> list = Lists.newArrayList();
		CrmProductSet proconf = crmProductSetService.getByCid(cid);
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqitrain"));
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqiair"));
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqihotel"));
		setSessionAttr("companybusiness", list);
	}

	public static void main(String[] args) {
		String appkey = "yow3mfhs95lobfarw0ogrs4dwo9n";
		String username = "15110297677";
		String securet = "9b6680362378d4e02c4b76c92b963795";
		String sign = Md5Sign.createSign(appkey + username.toUpperCase() + securet, securet);
		System.out.println(sign);
		System.out.println(Md5Sign.createSign("toFaceBook", securet));
		System.out.println("http://tmc.auvgo.com/oa/caslogin/" + appkey + "/" + username + "/" + sign);
	}

	/**
	 * 校验签名
	 * 
	 * @param dataJson
	 * @param sign
	 * @param md5sign
	 * @return
	 * @throws Exception
	 */
	private boolean checkParams(String dataJson, String sign, String md5sign) {
		String result = Md5Sign.createSign(dataJson, md5sign);
		if (result.equalsIgnoreCase(sign)) {
			return true;
		}
		return false;
	}

	/**
	 * 获取ip
	 * 
	 * @param request
	 * @return
	 */
	public static String getIp(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if (StringUtils.isNotEmpty(ip) && !"unKnown".equalsIgnoreCase(ip)) {
			// 多次反向代理后会有多个ip值，第一个ip才是真实ip
			int index = ip.indexOf(",");
			if (index != -1) {
				return ip.substring(0, index);
			} else {
				return ip;
			}
		}
		ip = request.getHeader("X-Real-IP");
		if (StringUtils.isNotEmpty(ip) && !"unKnown".equalsIgnoreCase(ip)) {
			return ip;
		}
		return request.getRemoteAddr();
	}

}
