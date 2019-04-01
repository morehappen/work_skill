package com.auvgo.web.face;

import com.auvgo.airrate.api.bim.IAirrateDataCityProvider;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.ProConfUtil;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.data.api.DataTrainCityService;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.hotel.api.HotelSearchService;
import com.auvgo.sys.api.SysMenuService;
import com.auvgo.sys.api.SysOperationNoteService;
import com.auvgo.sys.entity.SysMenu;
import com.auvgo.sys.entity.SysOperationNote;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.shiro.CustomUsernamePasswordToken;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.fileupload.util.Streams;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Controller
@RequestMapping("/")
public class IndexController extends BaseController {

	@Autowired
	private CrmEmployeeService crmEmployeeService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private CrmProductSetService crmProductSetService;
	@Autowired
	private SysMenuService menuService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private SysOperationNoteService noteService;

	@Autowired
	private DataTrainCityService dataTrainCityService;
	@Autowired
	private IAirrateDataCityProvider dataCityProvider;
	@Autowired
	private HotelSearchService hotelSearchService;

	@RequestMapping("")
	public String index() {
		// 判断session是否过期
		if (null != getSessionAttr("user")) {
			return "index";
		} else {
			if (null == request.getParameter("f")) {
				setAttr("timeout", "true");
			}
		}
		return "/login";
	}

	@RequestMapping(value = "/index")
	public String tohome() {
		return "/index";
	}

	@RequestMapping(value = "/tologin")
	public String tologin() {
		return "login";
	}


	@RequestMapping(value = "/login")
	public String login(String username, String kahao, String password, Integer autologin, String validcode, HttpServletRequest request) throws IncorrectCredentialsException {

		String LoginReg = "[\u2E80-\u9FFF]";//汉字判断
		Pattern pat = Pattern.compile(LoginReg);
		boolean loginFlag = pat.matcher(username).find() || pat.matcher(password).find();
		if (loginFlag) {
			setAttr("error", "用户名或密码不支持汉字");
			setAttr("errortype", "1");
			return "/login";
		}
		request.setAttribute("username", username);
		Cookie cookie = new Cookie("username", username);
		cookie.setMaxAge(60 * 60);//1个小时
		response.addCookie(cookie);
		String remb = null;
		if (null != autologin && 1 == autologin) {
			Cookie[] cookies = request.getCookies();
			for (Cookie cookie2 : cookies) {
				if (null != cookie2) {
					if ("loginParam".equals(cookie2.getName())) {
						remb = cookie2.getValue();
					}
				}
			}
		}
		if (null != remb && !StringUtils.isBlank(remb)) {
			@SuppressWarnings("unchecked")
			Map<String, Object> maps = JsonUtils.jsonToPojo(remb, Map.class);
			if (null != maps.get("username") && "".equals(maps.get("username").toString())) {
				String loginname = maps.get("username").toString();
				if (username.equals(loginname)) {
					password = maps.get("password").toString();
				}
			}
		}
		try {
			saveLoginName(username, kahao, password, autologin);
			// 构造登陆令牌环
			String host = request.getRemoteHost();// 获得客户端的主机名。
			CustomUsernamePasswordToken token = new CustomUsernamePasswordToken(username, kahao, password, host, validcode);
			// 发出登陆请求
			SecurityUtils.getSubject().login(token);
			CrmCompany company = companyService.findByKaHao(token.getKahao());
			List<SysMenu> menus;
			if (username.equals(company.getUsername())) {
				menus = menuService.findSuperpermissions(1);
			} else {
				menus = menuService.findCrmpermissions(username, 1, company.getId());
			}
			setAttr("company1", company);
			if (company.getStatus() == 1) {
				setAttr("error", "该卡号已经被冻结");
				setAttr("errortype", "0");
				return "/login";
			}
			CrmEmployeeModel crmEmployee;
			List<DataZidianValue> staffList = zidianKeyService
					.getzidianValueBYzidianKey(company.getId(),
							"stafflevels");
			if (!username.equals(company.getUsername())) {
				crmEmployee = crmEmployeeService.getCasLoginByUsername(company.getId(), username);

			} else {
				crmEmployee = new CrmEmployeeModel();
				crmEmployee.setCompanyid(company.getId());
				crmEmployee.setName("系统管理员");
				crmEmployee.setZhiwei(staffList.get(staffList.size() - 1).getValue());
				/***********************公司管理员 暂时删除'我的差旅'菜单************************/
				Iterator<SysMenu> iterator = menus.iterator();
				while (iterator.hasNext()) {
					SysMenu menu = iterator.next();
					if ("我的差旅".equals(menu.getName())) {
						iterator.remove();
					}
				}
				/*************************************************************************/
			}
			setSessionAttr("menus", menus);// 查看前台菜单
			for (DataZidianValue dataZidianValue : staffList) {
				if (String.valueOf(crmEmployee.getZhiwei())
						.equals(dataZidianValue.getValue())) {
					setSessionAttr("zhiwei", dataZidianValue);
					break;
				}
			}
			setSessionAttr("user", crmEmployee);

			setSessionAttr("company", company);
			setAttr("crmEmployee", crmEmployee);
			setCompanyConfig(company.getId());//获取该公司开启几条业务线
			SysOperationNote sysOperationNote = new SysOperationNote(crmEmployee.getId(), crmEmployee.getName(), crmEmployee.getDeptname(), new Date(), "用户"
					+ crmEmployee.getName() + "登录", company.getId(), company.getSimpname(), "用户登录");
			noteService.saveOrUpdate(sysOperationNote);
			return "redirect:/index";
		}catch(IncorrectCredentialsException e){
			setAttr("error","用户名或密码错误");
			setAttr("errortype", "1");
		}catch(AuthenticationException e){
			String aumsg = e.getMessage();
			String[] msg = aumsg.split(",");
			setAttr("error",msg[0]);
			setAttr("errortype", msg[1]);
			
		}catch (Exception e) {
			e.printStackTrace();
			setAttr("error", "网络异常,请联系管理员");
			setAttr("errortype", "2");
		}

		return "/login";
	}

	// 保存用户名和密码
	private void saveLoginName(String username, String kahao, String password, Integer autologin) {
		Map<String, Object> maps = Maps.newHashMap();
		if (null != autologin && 1 == autologin) {// 保存卡号 用户名和密码
			maps.put("username", username);
			maps.put("kahao", kahao);
			maps.put("password", password);
			maps.put("autologin", autologin);
		} else {// 保存卡号和用户名
			maps.put("kahao", kahao);
		}
		Cookie cookie = new Cookie("loginParam", JsonUtils.objectToJson(maps));
		response.addCookie(cookie);
	}


	@RequestMapping(value = "/logout")
	public String logout() {
		Subject currentUser = SecurityUtils.getSubject();
		if (SecurityUtils.getSubject().getSession() != null) {
			currentUser.logout();
		}
		removeSession("company");
		removeSession("user");
		removeSession("companybusiness");
		return "login";
	}

	@RequestMapping("/toMyChailv")
	public String toMyChailv() {

		return "my-chailv";
	}

	@RequestMapping(value = "/timeout", produces = "text/html; charset=UTF-8")
	@ResponseBody
	public String timeout() throws Exception {
		return "<script>parent.location.href='/';</script>";
	}

	@RequestMapping(value = "/photoUpload", method = RequestMethod.POST)
	public String photoUpload(@RequestParam("myPhoto") CommonsMultipartFile file, HttpServletRequest request) {
		if (!file.isEmpty()) {
			String suffix = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."), file.getOriginalFilename().length());
			String path = "/static/img/upload/" + getCompany().getBianhao() + suffix;
			String fileName = request.getSession().getServletContext().getRealPath("/") + path;
			try {
				// 执行文件上传操作.
				Streams.copy(file.getInputStream(), new FileOutputStream(new File(fileName)), true);
				// 将数据库中的对应位置写入路径.
				CrmCompany company = getCompany();
				company.setLogopic(path);
				companyService.saveOrUpdate(company);
			} catch (FileNotFoundException e) {
				System.out.println("没有找见文件");
				e.printStackTrace();
			} catch (IOException e) {
				System.out.println("文件上传失败");
				e.printStackTrace();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return "redirect:/crm";
	}


	/**
	 * 获取城市数据{"type":"train/hotel/domair/interair"}
	 *
	 * @param
	 * @return
	 */
	@RequestMapping(value = "/city", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult getAllCity(String type) {
		try {
			if (StringUtils.isBlank(type)) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			// 火车 type=train
			if (type.equalsIgnoreCase("train")) {
				Map<String, Object> map = dataTrainCityService.getAllTrainCity();
				String resultJson = JsonUtils.objectToJson(map);
				//log.debug("reponse-->" + resultJson);
				return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
			} else if (type.equalsIgnoreCase("domair")) {
				// 机票 type=air
				Map<String, Object> map = dataCityProvider.getBaseAirCity();
				String resultJson = JsonUtils.objectToJson(map);
				//log.debug("reponse-->" + resultJson);
				return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
			} else if (type.equalsIgnoreCase("hotel")) {
				Map<String, Object> allcityMap = hotelSearchService.getAllHotelCity();
				String resultJson = JsonUtils.objectToJson(allcityMap);
				//log.debug("reponse-->" + resultJson);
				return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
			}
		} catch (Exception e) {
			log.warn("type:{},Exception:{}", type, e);
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
	}

	@RequestMapping("/toBook")
	public String toBook() {

		return "/index";
	}

	protected void setCompanyConfig(Long cid) {


		List<String> list = Lists.newArrayList();
		CrmProductSet proconf = crmProductSetService.getByCid(cid);
		if (null != proconf) {
			list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqitrain"));
			list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqiair"));
			list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqihotel"));
			setSessionAttr("companybusiness", list);
		}
	}

}
