package com.auvgo.web.face;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.constants.common.Platform;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.AESUtil;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.IdCardUtils;
import com.auvgo.core.utils.JsonMapper;
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
import com.auvgo.data.entity.DataCompanyAuth;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysMenuService;
import com.auvgo.sys.api.SysOperationNoteService;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOperationNote;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.CasRoute;
import com.auvgo.web.model.caslog.CustomInfo;
import com.auvgo.web.model.caslog.TravelPassenger;
import com.auvgo.web.shiro.CustomUsernamePasswordToken;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
@RequestMapping("/oa")
public class CasLoginController extends BaseController {
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
	private SysOperationNoteService noteService;
	@Autowired
	private CrmProductSetService crmProductSetService;
	@Autowired
	private SysOutpushDataService sysOutdataService;

	public static JsonMapper jsonMapper = JsonMapper.nonNullMapper();

	@SuppressWarnings("unchecked")
	@RequestMapping("/caslogin/{appkey}/{username}/{sign}")
	public String caslogin(@PathVariable("appkey") String appkey, @PathVariable("username") String username, @PathVariable("sign") String sign, HttpServletRequest request) {
		String data = request.getParameter("p");
		String type = request.getParameter("type");
		CasBookModel casBookModel = jsonMapper.fromJson(data, CasBookModel.class);
		Map<String, String> map = Maps.newHashMap();
		if (StringUtils.isNotBlank(data)) {
			map = JsonUtils.jsonToPojo(data, Map.class);
		}
		log.info("caslogin request-->appkey::{},username:{},sign:{},p:{}", appkey, username, sign, data);
		if (StringUtils.isBlank(appkey) || StringUtils.isBlank(username) || StringUtils.isBlank(sign)) {
			setAttr("failMsg", "参数错误，请联系管理员");
			return "/common/error";
		}
		try {
			Long cid = 0L;
			if (StringUtils.isNotBlank(type) && Platform.CC.toString().equals(type)) {
				// 客服单点登录预订
				String context = AESUtil.AESDncode(appkey, AESUtil.keyword);
				String[] split = context.split("_");// 公司cid_时间戳
				cid = Long.valueOf(split[0]);
				Long time2 = Long.valueOf(split[1]);
				Long time = DateUtils.getUpdateDate();
				if ((time - time2) > 1800) {
					setAttr("failMsg", "请求超时，请重新请求");
					return "/common/error";
				} else {
					// 签名验证
					String encryptData = username + appkey;
					if (!checkParams(encryptData, sign, username)) {
						setAttr("failMsg", "签名校验失败，请联系管理员");
						return "/common/error";
					}
				}
			} else {
				DataCompanyAuth auth = authService.getCompanyAuthByAppkey(appkey);
				AuvgoResult result = validCasAuth(auth);
				if (result.getStatus() == 200) {
					String value = appkey + username.toUpperCase() + auth.getSecurtkey();
					if (!checkParams(value, sign, auth.getSecurtkey())) {
						setAttr("failMsg", "签名校验失败，请联系管理员");
						return "/common/error";
					}
					cid = auth.getCompanyid();
				} else {
					setAttr("failMsg", result.getMsg());
					return "/common/error";
				}
			}
			CrmEmployeeModel employee = employeeService.getCasLoginByUsername(cid, username);
			if (null == employee) {
				setAttr("failMsg", "没有此员工的相关信息，请联系管理员");
				return "/common/error";
			}
			if (employee.getKaitong() != 1 || employee.getStatus() != 0 || employee.getOpened() != 1) {
				setAttr("failMsg", "该用户已被锁定或者无效");
				return "/common/error";
			}
			setSessionAttr("user", employee);
			CrmCompany company = companyService.getById(cid);
			String password = "password".toUpperCase();
			if (StringUtils.isNotBlank(employee.getPassword())) {
				password = employee.getPassword().toUpperCase();
			}
			CustomUsernamePasswordToken token = new CustomUsernamePasswordToken(username, company.getBianhao(), password, getIp(request), "");
			SecurityUtils.getSubject().login(token);
			if (username.equals(company.getUsername())) {
				setSessionAttr("menus", menuService.findSuperpermissions(1));
			} else {
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

			/// TODO: 5/23/18 校验出行人和审批人 start
			// 审批人
			List<ApproveShenpiRen> approveShenpiRens = casBookModel.getShenpi();
			// 出行人
			List<TravelPassenger> travelPassengers = casBookModel.getPassengers();
			// 行程
			CasRoute casRoute = casBookModel.getRoute();
			// 第N种情况
			int bookFlag = 0;
			// 出行人有编号的个数
			int accountNos = 0;
			// 审批人是否为空
			boolean approveEmpty = CollectionUtils.isEmpty(approveShenpiRens);
			if (null != travelPassengers) {
				for (TravelPassenger travelPassenger : travelPassengers) {
					String accno = travelPassenger.getAccno();
					if (StringUtils.isBlank(accno)) {
						// 校验身份证或者护照
						if (StringUtils.isBlank(travelPassenger.getCertno()) || StringUtils.isEmpty(travelPassenger.getCertType())) {
							log.error("travelPassenger certno or certType is empty {} ,{} ", travelPassenger.getCertno(), travelPassenger.getCertType());
							setAttr("failMsg", "员工" + travelPassenger.getCertno() + "的证件号为空");
							return "/common/error";
						}
						if ("1".equalsIgnoreCase(travelPassenger.getCertno()) && IdCardUtils.validateCard(travelPassenger.getCertno())) {
							log.error("travelPassenger certno error {}", travelPassenger.getCertno());
							setAttr("failMsg", "员工" + travelPassenger.getCertno() + "的证件号不正确");
							return "/common/error";
						}
					} else if (StringUtils.isNotBlank(accno)) {
						accountNos++;
						CrmEmployeeModel crmEmployee = employeeService.getCasLoginByUsername(cid, accno);
						if (crmEmployee == null) {
							setAttr("failMsg", "员工编号不存在");
							return "/common/error";
						}
					}
				}
			}
			// 校验审批人
			if (!approveEmpty) {
				for (ApproveShenpiRen approveShenpiRen : approveShenpiRens) {
					String shenpiName = approveShenpiRen.getName();
					String mobile = approveShenpiRen.getMobile();
					String email = approveShenpiRen.getEmail();
					if (StringUtils.isBlank(mobile) && StringUtils.isBlank(email)) {
						setAttr("failMsg", "审批人" + shenpiName + "手机号和邮箱不能同时为空");
						return "/common/error";
					}
					// 校验邮箱和手机号
					if (StringUtils.isNotBlank(mobile) && !RegExpValidator.isMobile(approveShenpiRen.getMobile())) {
						log.error("审批人手机号不正确{}", approveShenpiRen.getMobile());
						setAttr("failMsg", "审批人" + shenpiName + approveShenpiRen.getMobile() + "手机号不正确");
						return "/common/error";
					}
					if (StringUtils.isNotBlank(email) && !RegExpValidator.wrapperIsEmail(approveShenpiRen.getEmail())) {
						log.error("审批人邮箱不正确{}", approveShenpiRen.getEmail());
						setAttr("failMsg", "审批人" + shenpiName + approveShenpiRen.getEmail() + "邮箱不正确");
						return "/common/error";
					}
				}
			}
			// 判断几种情况
			if (accountNos == travelPassengers.size() && approveEmpty) {// 有编号,无审批人
				bookFlag = 1;
			} else if (accountNos == travelPassengers.size() && !approveEmpty && !travelPassengers.isEmpty()) {// 有编号,有审批节点,有出行人
				bookFlag = 2;
			} else if (accountNos == travelPassengers.size() && !approveEmpty && travelPassengers.isEmpty()) {// 有编号,有审批节点,有出行人
				bookFlag = 5;
			} else if (accountNos != travelPassengers.size() && !approveEmpty) {// 无编号,有审批节点
				bookFlag = 3;
			} else if (accountNos != travelPassengers.size() && approveEmpty) {// 无编号,无审批节点
				bookFlag = 4;
			}
			casBookModel.setBookFlag(bookFlag + "");
			setSessionAttr("casModel", jsonMapper.toJson(casBookModel));
			// TODO: 5/23/18 校验出行人和审批人 end
			setSessionAttr("company", company);
			setSessionAttr("hidenMenu", casBookModel.getHidenMenu());
			setSessionAttr("user", employee);
			setAttr("crmEmployee", employee);
			setCompanyConfig(company.getId());
			SysOperationNote sysOperationNote = new SysOperationNote(employee.getId(), employee.getName(), employee.getDeptname(), new Date(), "用户接口" + employee.getName() + "登录", company.getId(), company.getSimpname(), "用户登录");
			noteService.saveOrUpdate(sysOperationNote);
			// String ProductType = map.get("product") + "";
			String ProductType = casBookModel.getProduct();
			// 获取到单点登录的公司信息
			// CustomInfo customInfo =
			// jsonMapper.fromJson(jsonMapper.toJson(map.get("custinfo")),
			// CustomInfo.class);
			CustomInfo customInfo = casBookModel.getCustinfo();
			String outOrderNO = "";
			if (null != customInfo) {
				customInfo.getOutOrderno();
			}
			setSessionAttr("isoalogin", true);
			if (StringUtils.isNotBlank(outOrderNO)) {
				List<SysOutpushData> pushData = sysOutdataService.getPushDataByOutOrderNoAndCid(outOrderNO, cid);
				if (null != pushData) {
					String address = getRedicrtAddress(pushData, ProductType);
					return "redirect:" + address;
				}
			}
			if (StringUtils.isNotBlank(ProductType)) {
				if ("air".equalsIgnoreCase(ProductType)) {
					return "redirect:/index?flag=air";
				} else if ("hotel".equalsIgnoreCase(ProductType)) {
					return "redirect:/index?flag=hotel";
				} else if ("train".equalsIgnoreCase(ProductType)) {
					return "redirect:/index?flag=train";
				} else if ("center".equalsIgnoreCase(ProductType)) {
					return "redirect:/myChailv";
				} else if ("crm".equalsIgnoreCase(ProductType)) {
					return "redirect:/crm";
				} else if ("approve".equalsIgnoreCase(ProductType)) {
					return "redirect:/myApproval/getAllApproveOrder/0/all";
				} else {
					return "/index";
				}
			} else {
				return "redirect:/index";
			}

		} catch (Exception e) {
			setAttr("failMsg", e.getMessage());
			return "/common/error";
		}
	}

	// 判断信息组合跳转路径
	private String getRedicrtAddress(List<SysOutpushData> outPushData, String productType) {
		SysOutpushData pushData = null;
		for (SysOutpushData data : outPushData) {
			if (data.getOrderType().equals(productType)) {
				pushData = data;
				break;
			}
		}
		String ordernos = pushData.getOrderNo();
		String orderNo = null;
		if (StringUtils.isNotBlank(ordernos)) {
			String[] split = ordernos.split(",");
			orderNo = split[0];
		}
		String orderType = pushData.getOrderType();
		StringBuilder url = new StringBuilder("/myChailv/");
		switch (orderType) {
		case "air":
			url.append("toAirOrderDetail/" + orderNo);
			break;
		case "airgq":
			url.append("toAirEndroseDetail/" + orderNo);
			break;
		case "airtp":
			url.append("toAirRefundDetail/" + orderNo);
			break;
		case "train":
			url.append("toTrainOrderDetail/" + orderNo);
			break;
		case "traingq":
			url.append("toTrainEndroseDetail/" + orderNo);
			break;
		case "traintp":
			url.append("toTrainRefundDetail/" + orderNo);
			break;
		case "hotel":
			url.append("toHotelOrderDetail/" + orderNo);
			break;
		default:
			break;
		}
		return url.toString();
	}

	protected void setCompanyConfig(Long cid) {
		List<String> list = Lists.newArrayList();
		CrmProductSet proconf = crmProductSetService.getByCid(cid);
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqitrain"));
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqiair"));
		list.add(ProConfUtil.getValue(proconf.getProconfvalue(), "kaiqihotel"));
		setSessionAttr("companybusiness", list);
	}

	/**
	 * 四川商通 特殊接口
	 * 
	 * @return
	 */
	@RequestMapping("/getmenus/{appkey}/{data}/{sign}")
	@ResponseBody
	public AuvgoResult getFaceMenu(@PathVariable String appkey, @PathVariable String data, @PathVariable String sign) {
		log.info("oa getmeus {},{},{}", appkey, data, sign);
		DataCompanyAuth auth = authService.getCompanyAuthByAppkey(appkey);
		AuvgoResult result = validCasAuth(auth);
		if (result.getStatus() == 200) {
			String value = appkey + data + auth.getSecurtkey();
			if (!checkParams(value, sign, auth.getSecurtkey())) {
				return AuvgoResult.build(300, "签名校验失败，请联系管理员");
			}
		} else {
			return AuvgoResult.build(300, result.getMsg());
		}
		String menus = "[{\"name\":\"机票订单\",\"code\":\"air\",\"menus\":[{\"name\":\"机票正常单\",\"code\":\"zhengchang\",\"url\":\"/myChailv/toNewAirOrder/personal?tag=air\"},{\"name\":\"机票退票单\",\"code\":\"tuipiao\",\"url\":\"/myChailv/toNewAirTuiOrder/personal?tag=airRefund\"},{\"name\":\"机票改签单\",\"code\":\"gaiqian\",\"url\":\"/myChailv/toNewAirGaiOrder/personal?tag=airEndrose\"}]},{\"name\":\"火车票订单\",\"code\":\"train\",\"menus\":[{\"name\":\"火车票正常单\",\"code\":\"zhengchang\",\"url\":\"/myChailv/toNewTrainOrder/personal?tag=train\"},{\"name\":\"火车票退票单\",\"code\":\"tuipiao\",\"url\":\"/myChailv/toNewTrainTuiOrder/personal?tag=trainRefund\"},{\"name\":\"火车票改签单\",\"code\":\"gaiqqian\",\"url\":\"/myChailv/toNewTrainGaiOrder/personal?tag=trainEndrose\"}]},{\"name\":\"酒店订单\",\"code\":\"hotel\",\"menus\":[{\"name\":\"酒店正常单\",\"code\":\"zhengchang\",\"url\":\"/hotel/order/my/list?tag=hotel\"},{\"name\":\"待支付订单\",\"code\":\"daizhifu\",\"url\":\"/hotel/order/waitpaylist?tag=hotelPay\"}]},{\"name\":\"个人中心\",\"code\":\"pfofile\",\"menus\":[{\"name\":\"个人信息\",\"code\":\"geren\",\"url\":\"/personal/toInformation\"},{\"name\":\"修改密码\",\"code\":\"updatePass\",\"url\":\"/personal/toEditPwd\"},{\"name\":\"证件信息\",\"code\":\"updateCert\",\"url\":\"/employess/cert/list\"},{\"name\":\"常用出行人\",\"code\":\"commonUsed\",\"url\":\"/personal/toCommonPersons\"},{\"name\":\"12306绑定\",\"code\":\"bind12306\",\"url\":\"/personal/toBind\"}]},{\"name\":\"企业管理\",\"code\":\"company\",\"menus\":[{\"name\":\"企业信息\",\"code\":\"baseinfo\",\"url\":\"/crm\"},{\"name\":\"组织架构\",\"code\":\"department\",\"url\":\"/crm/depart\"},{\"name\":\"员工管理\",\"code\":\"employee\",\"url\":\"/crm/employee\"},{\"name\":\"角色管理\",\"code\":\"role\",\"url\":\"/crm/role\"}]},{\"name\":\"差旅管理\",\"code\":\"travel\",\"menus\":[{\"name\":\"成本中心\",\"code\":\"costcenter\",\"url\":\"/crm/cost\"},{\"name\":\"项目编号\",\"code\":\"project\",\"url\":\"/crm/project/\"},{\"name\":\"数据管理\",\"code\":\"data\",\"url\":\"/crm/data/tovaluelist/3\"},{\"name\":\"配送地址\",\"code\":\"peisong\",\"url\":\"/crm/psaddress/\"}]}]";
		return AuvgoResult.build(200, "success", menus);
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
	 * 校验接口权限
	 *
	 * @return
	 */
	private AuvgoResult validCasAuth(DataCompanyAuth auth) {
		if (null == auth) {
			return AuvgoResult.build(201, "没有开通访问授权，请联系管理员");
		}
		if (auth.getStatus() != 1) {
			return AuvgoResult.build(201, "您的账号被冻结了，请联系管理员");
		}
		String ip = getIp(request);
		if (!auth.getWhiteiplist().contains(ip) && !auth.getWhiteiplist().equalsIgnoreCase("all")) {
			return AuvgoResult.build(201, "ip[" + ip + "]没有授权，请联系管理员");
		}
		return AuvgoResult.ok();
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
