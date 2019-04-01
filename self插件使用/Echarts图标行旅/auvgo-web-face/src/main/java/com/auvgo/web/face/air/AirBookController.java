package com.auvgo.web.face.air;

import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.*;
import com.auvgo.airrate.api.book.IAirrateBookProvider;
import com.auvgo.airrate.api.query.IAirrateQueryProvider;
import com.auvgo.airrate.ibe.av.AvFlight;
import com.auvgo.airrate.ibe.av.CangWei;
import com.auvgo.airrate.ibe.ff.FFModel;
import com.auvgo.airrate.ibe.ff.FFResponse;
import com.auvgo.airrate.ibe.pat.PatInfo;
import com.auvgo.airrate.ibe.pat.PatResult;
import com.auvgo.airrate.ibe.pnr.PNRBookOSI;
import com.auvgo.airrate.ibe.pnr.PNRIDInfo;
import com.auvgo.airrate.request.AirrateBookRequest;
import com.auvgo.airrate.request.AirratePATRequest;
import com.auvgo.airrate.request.dto.AirrateContact;
import com.auvgo.airrate.request.dto.AirratePassenger;
import com.auvgo.airrate.request.dto.AirrateSegment;
import com.auvgo.airrate.response.AirrateAvResponse;
import com.auvgo.airrate.response.AirrateBookResponse;
import com.auvgo.airrate.response.AirrateResponse;
import com.auvgo.business.common.IBaseBusiness;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.utils.*;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.data.api.DataBaoxianCompanyService;
import com.auvgo.data.api.DataCityService;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataBaoxianCompany;
import com.auvgo.data.entity.DataCity;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.AirQuery;
import com.auvgo.web.util.ModelSignature;
import com.auvgo.web.util.TokenUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.MDC;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/air")
public class AirBookController extends BaseController {

	private List<String> common_phone_list = Lists.newArrayList("13693628603", "13811298079", "18201069657",
			"18811539253", "13717760611", "15801091271", "15600384073", "18103241692", "13521418904");

	protected static JsonMapper jsonMapper = JsonMapper.nonNullMapper();
	@Autowired
	private IAirrateQueryProvider airrateQueryProvider;
	@Autowired
	protected IAirrateBookProvider airrateBookProvider;
	@Autowired
	protected DataZidianKeyService zidianKeyService;
	@Autowired
	protected CrmDepartmentService crmDepartmentService;
	@Autowired
	protected CrmCompanyService companyService;
	@Autowired
	protected CrmEmployeeService crmEmployeeService;
	@Autowired
	protected DataBaoxianCompanyService baoxianService;
	@Autowired
	protected CrmFuwufeiService fuwufeiService;
	@Autowired
	protected AirOrderService airOrderService;
	@Autowired
	protected CrmEmployeeLinshiService linshiService;
	@Autowired
	protected CrmEmployeeCertService certService;
	@Autowired
	protected DataBaoxianCompanyService dataBaoxianCompanyService;
	@Autowired
	protected CrmDepartmentService deptService;
	@Autowired
	protected CrmApproveService approveService;
	@Autowired
	protected SysOutpushDataService sysOutdataService;
	@Autowired
	private CrmProductSetService productSetService;
	@Autowired
	private CrmApproveService crmApproveService;
	@Autowired
	private CrmJiesuanService jiesuanService;
	@Autowired
	private CrmProductSetService crmProductSetService;
	@Autowired
	DataCityService dataCityService;
	/**
	 * 基础数据
	 **/
	@Autowired(required = false)
	private IBaseBusiness baseBusiness;

	@SuppressWarnings("unchecked")
	@RequestMapping("/book/{airline}/{cab}/{chooseprice}/{daylow}/{flightlow}")
	public String bookAir(@PathVariable("airline") String airline, @PathVariable("cab") String cab,
						  @PathVariable("chooseprice") double chooseprice, @PathVariable("daylow") String daylow,
						  @PathVariable("flightlow") String flightlow, HttpServletRequest request) {
		try {
			// session中的数据
			if (StringUtils.isBlank(airline) || StringUtils.isBlank(cab) || StringUtils.isBlank(daylow)
					|| StringUtils.isBlank(flightlow)) {
				setAttr("msg", "查询输入参数有误,请重新查询");
				return "/common/fail";
			}
			AirQuery query = (AirQuery) getSessionAttr("airquery");
			List<AirOrderRoute> bookRoutes = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
			if (null != query.getBackdate() && null != bookRoutes && airline.equals(bookRoutes.get(0).getAirline())) {
				bookRoutes = Lists.newArrayList();
			} else {
				if (null != bookRoutes && bookRoutes.size() >= 2) {
					bookRoutes.remove(1);
				}
			}
			// 添加员工职级信息
			CrmEmployee sessionUser = getUser();
			CrmEmployee user = crmEmployeeService.getById(sessionUser.getCompanyid(), sessionUser.getId());
			// 部门，员工等级
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			// 判断是否返程
			bookRoutes = null == bookRoutes ? bookRoutes = Lists.newArrayList() : bookRoutes;
			getmethod(bookRoutes, user, company);
			// 是否选择的是最低价 1是，0不是
			String isLow = request.getParameter("isLow");
			setAttr("isLow", isLow);

			setAttr("ceryTypes", baseBusiness.obtainCerttype()); // 证件类型
			if ("ow".equalsIgnoreCase(query.getType())) {// 单程的预订
				bookRoutes = Lists.newArrayList();
				AirrateAvResponse bookFlight = airrateQueryProvider.getBookFlight(query.getFrom(), query.getArrive(),
						query.getStartdate(), "ALL", airline, cab, chooseprice, user.getCompanyid());
				if (null == bookFlight || bookFlight.getFlights().size() == 0) {
					log.warn("ibeService.getBookFlight-->没查询到获取的航班信息 {}", bookFlight.getMsg());
					return "/index";
				}
				AirOrderRoute orderRoute = buildBookFlight(bookFlight.getFlights().get(0), query.getFrom(),
						query.getArrive(), query.getFromName(), query.getArriveName(), daylow, flightlow);
				bookRoutes.add(orderRoute);
				setSessionAttr("bookRoutes", bookRoutes);// 存入行程信息
				Map<String, String> map = Maps.newHashMap();
				for (AirOrderRoute route : bookRoutes) {
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					try {
						map.put(route.getDeptdate(), DateUtils.getWeeks(sdf.parse(route.getDeptdate())));
					} catch (ParseException e) {
						log.error("getWeeks error", e);
					}
				}
				setAttr("weekMap", map);
			} else if ("rt".equalsIgnoreCase(query.getType())) {// 预订往返程
				if (bookRoutes.size() < 2) {// 第一次进来
					AirrateAvResponse bookFlight = null;
					if (bookRoutes.size() == 0) {// 第一次进来
						bookFlight = airrateQueryProvider.getBookFlight(query.getFrom(), query.getArrive(),
								query.getStartdate(), "ALL", airline, cab, chooseprice, user.getCompanyid());
						if (null == bookFlight || bookFlight.getFlights().size() == 0) {
							log.warn("ibeService.getBookFlight--->没查询到获取的航班信息  bookFlightMsg:{}", bookFlight.getMsg());
							return "/index";
						}
					} else if (bookRoutes.size() == 1) {
						bookFlight = airrateQueryProvider.getBookFlight(query.getArrive(), query.getFrom(),
								query.getBackdate(), "ALL", airline, cab, chooseprice, user.getCompanyid());
					}
					AirOrderRoute orderRoute = buildBookFlight(bookFlight.getFlights().get(0), query.getFrom(),
							query.getArrive(), query.getFromName(), query.getArriveName(), daylow, flightlow);
					bookRoutes.add(orderRoute);
					setSessionAttr("bookRoutes", bookRoutes);// 存入行程信息
				}
				Map<String, String> map = Maps.newHashMap();
				for (AirOrderRoute route : bookRoutes) {
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					try {
						map.put(route.getDeptdate(), DateUtils.getWeeks(sdf.parse(route.getDeptdate())));
					} catch (ParseException e) {
						log.error("getWeeks error", e);
					}
				}
				setAttr("weekMap", map);
				if (bookRoutes.size() == 1) {// 预订的返程,调换出发城市等内容
					setAttr("backflag", 1);
					return "/air/air-query-list";
				} else if (bookRoutes.size() == 2) {
					return "/air/air-book";
				}
			}
			return "/air/air-book";
		} catch (Exception e) {
			log.error("bookAir is fail", e);
			return "/common/500";
		}
	}

	//公共方法
	public void getmethod(List<AirOrderRoute> bookRoutes, CrmEmployee user, CrmCompany company) {
		try {
			CrmApprove crmapp = crmApproveService.getApproveByEmployeeId(user.getCompanyid(), user.getId(), user.getDeptid());
			if (null != crmapp) {
				setAttr("approve", crmapp);
			}
		} catch (Exception e) {
		}
		CrmDepartment deptment = crmDepartmentService.getDepartMentByBianhaoAndCompanyId(company.getBianhao() + "-LSBM", company.getId());
		setAttr("dept", deptment);
		setAttr("depttree", deptService.getDeptZtree(company.getId(), null));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		setAttr("AllStaff", staffList);
		// 添加保险信息
		String airType = "air";
		List<DataBaoxianCompany> baoxian = dataBaoxianCompanyService.getBaoxianByCidAndType(user.getCompanyid(),
				airType);
		setAttr("baoxian", baoxian);
		//展示week
		Map<String, String> map = Maps.newHashMap();
		for (AirOrderRoute route : bookRoutes) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			try {
				map.put(route.getDeptdate(), DateUtils.getWeeks(sdf.parse(route.getDeptdate())));
			} catch (ParseException e) {
				log.error("getWeeks error", e);
			}
		}
		setAttr("weekMap", map);
		//成本中心和项目中心标识
		CrmProductSet crmproduct = crmProductSetService.getByCid(user.getCompanyid());
		setAttr("costcenter", ProConfUtil.getValue(crmproduct.getProconfvalue(), "costcenter"));
		setAttr("projectinfo", ProConfUtil.getValue(crmproduct.getProconfvalue(), "projectinfo"));
		setAttr("projectinfoinput", ProConfUtil.getValue(crmproduct.getProconfvalue(), "projectinfoinput"));
		setAttr("costcenterinput", ProConfUtil.getValue(crmproduct.getProconfvalue(), "costcenterinput"));
	}

	public static Set<String> TONGGONG = Sets.newHashSet();

	static {
		TONGGONG.add("A6");
		TONGGONG.add("EU");
		TONGGONG.add("FU");
		TONGGONG.add("G5");
		TONGGONG.add("GT");
		TONGGONG.add("GY");
		TONGGONG.add("PN");
		TONGGONG.add("GX");
		TONGGONG.add("LQ");
		TONGGONG.add("LT");
		TONGGONG.add("RY");
		TONGGONG.add("UQ");
		TONGGONG.add("VD");
		TONGGONG.add("Y8");
		TONGGONG.add("YI");
		TONGGONG.add("8C");
		TONGGONG.add("8L");
		TONGGONG.add("9H");
		TONGGONG.add("KY");
	}

	// 验证行程是否存在重复订单
	@SuppressWarnings("unchecked")
	@RequestMapping("/getRepatRoute")
	@ResponseBody
	public AuvgoResult getRepatRoute(String empids, String linshi) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "登录人信息有误");
		}
		List<AirOrderRoute> bookRoutes = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
		if (null == bookRoutes || bookRoutes.size() == 0) {
			return AuvgoResult.build(300, "订单已提交，不能重复提交订单");
		}
		if (StringUtils.isBlank(empids) && StringUtils.isBlank(linshi)) {
			return AuvgoResult.build(300, "乘机人数据不能为空");
		}
		List<AirOrderPassenger> users = Lists.newArrayList();
		String[] emps = StringUtils.removeEnd(empids, "-").split("-");
		if (emps.length > 0) {
			List<CrmEmployee> emplist = crmEmployeeService.getEmpListById(user.getCompanyid(), emps);
			for (CrmEmployee crmEmployee : emplist) {
				AirOrderPassenger ap = new AirOrderPassenger();
				ap.setCertno(crmEmployee.getCertno());
				ap.setCerttype(crmEmployee.getCerttype());
				ap.setName(crmEmployee.getName());
				ap.setMobile(crmEmployee.getMobile());
				users.add(ap);
			}
		}
		String[] linshiids = StringUtils.removeEnd(linshi, "-").split("-");
		Set<String> sets = Sets.newHashSet(Arrays.asList(linshiids));
		List<CrmEmployeeLinshi> linshilist = linshiService.getLinshi(user.getCompanyid(), user.getId());
		for (CrmEmployeeLinshi clinshi : linshilist) {
			if (sets.contains(String.valueOf(clinshi.getId()))) {
				AirOrderPassenger ap = new AirOrderPassenger();
				ap.setCertno(clinshi.getCertno());
				ap.setCerttype(clinshi.getCerttype());
				ap.setName(clinshi.getUsername());
				ap.setMobile(clinshi.getMobile());
				users.add(ap);
			}
		}
		try {
			// 验价开始
			Map<String, String> maps = Maps.newHashMap();
			for (AirOrderRoute route : bookRoutes) {
				boolean gwFlag = false;
				if ("W".equalsIgnoreCase(route.getPricefrom())) {
					gwFlag = true;
				}
				AirrateBookResponse airrateBookResponse = null;
				if (!gwFlag) {
					airrateBookResponse = createOrder(route, users);
				}
				// 生成pnr成功
				if ((null != airrateBookResponse && airrateBookResponse.getIsSuccess()) || gwFlag) {
					String pnr = "";
					if (gwFlag) {
						pnr = "W88888";
					} else {
						pnr = airrateBookResponse.getThirdOrderNo();
					}
					if (!pnr.equalsIgnoreCase("tespnr")) {
						PatResult patResult = null;
						try {
							patResult = docheckPat(route, pnr, MDC.get("TraceId"));
						} finally {
							// xepnr
							AirrateResponse airrateResponse = airrateBookProvider.cancelOrder(pnr,
									route.getPricefrom());
							log.info("/air/checkprice xepnr-->{}", jsonMapper.toJson(airrateResponse));
						}
						String content = "";
						if (gwFlag && patResult.getIsSuccess()) {
							content = "官网pat验价成功...";
							log.info("官网单验证价格成功...");
						} else if (patResult.getIsSuccess() && null != patResult.getData() && patResult.getData().size() > 0) {
							content = "pat验价成功...";
							log.info("/air/checkprice -->{}", content);
						} else {
							if (null != patResult.getData() && patResult.getData().size() > 0) {
								PatInfo patInfo = patResult.getData().get(0);
								if (route.getPrice().doubleValue() != patInfo.getFarePirce().doubleValue()) {// 验价失败
									if (0 == route.getXuhao()) {
										maps.put("ow", String.valueOf(patInfo.getFarePirce()));
										String des = bookRoutes.size() > 1 ? "去程" : "";
										maps.put("owm", des + "舱位价格发生变动,当前舱位价格为" + patInfo.getFarePirce() + "元");
									} else {
										maps.put("rt", String.valueOf(patInfo.getFarePirce()));
										maps.put("rtm", "返程舱位价格发生变动,当前舱位价格为" + patInfo.getFarePirce() + "元");
									}
								}
								content = "pat发现变价..." + patResult.getMsg();
								log.info("/air/checkprice -->{}", content);
							} else {
								String noseatDes = getNoSeatDes(route.getXuhao(), bookRoutes.size());
								log.warn("/air/checkprice -->{}", noseatDes);
								return AuvgoResult.build(409, noseatDes);
							}
						}
					}
				} else {
					String noseatDes = getNoSeatDes(route.getXuhao(), bookRoutes.size());
					log.info("/air/checkprice -->:{}", noseatDes);
					return AuvgoResult.build(409, noseatDes);
				}
			}
			if (maps.size() > 0) {
				log.info("maps:{}", jsonMapper.toJson(maps));
				return AuvgoResult.build(408, "success", JsonUtils.objectToJson(maps));
			}
			//去掉重复订单的校验
			/*List<String> checkRepeatOrder = airOrderService.checkRepeatOrder(bookRoutes, users);
			if (checkRepeatOrder.size() > 0) {
				return AuvgoResult.build(407, "success", JsonUtils.objectToJson(checkRepeatOrder));
			}*/
		} catch (Exception e) {
			log.error("/air/getRepatRoute", e);
			return AuvgoResult.build(500, "因航司白名单限制，您暂时无法预订该航司协议价，请购买该航班非协议标签价格。白名单下月更新，下月10号后即可预订该航司协议价。");
		}
		return AuvgoResult.build(200, "success");
	}

	public PatResult docheckPat(AirOrderRoute route, String pnr, String loginuserid) throws Exception {
		PatResult patResult = new PatResult();
		AirratePATRequest patRequest = new AirratePATRequest();
		//判断是否为小航司,小航司不请求航信,直接过滤
		if ("W88888".equalsIgnoreCase(pnr) && !"W".equalsIgnoreCase(route.getPricefrom())) {
			log.info("验证未开牌的航司验价....." + route.getAirline());
			return getWeiKaiPaiPat(route);
		}
		patRequest.setFlightNo(route.getAirline());
		patRequest.setThirdNo(pnr);
		patRequest.setAirlineCode(route.getCarriecode());
		patRequest.setDepAirport(route.getOrgcode());
		patRequest.setPlatform(route.getPricefrom());
		patRequest.setArrAirport(route.getArricode());
		patRequest.setBookPirce(route.getPrice());
		patRequest.setCabin(route.getCode());
		patRequest.setFlightNo(route.getAirline());
		patRequest.setTokenId(MDC.get("TraceId"));
		patRequest.setDepDate(route.getDeptdate());
		patRequest.setClientcode(route.getDkhCode());
		patResult = airrateBookProvider.doPat(patRequest);
		return patResult;

	}

	public PatResult getWeiKaiPaiPat(AirOrderRoute route) {
		PatResult patResult = new PatResult();
		patResult.setIsSuccess(true);
		patResult.setMsg("success");
		List<PatInfo> info = Lists.newArrayList();
		info.add(new PatInfo(50.0, 0.0, route.getPrice()));
		patResult.setData(info);
		return patResult;
	}


	// 保险说明
	@RequestMapping("/baoxian/describe")
	@ResponseBody
	public AuvgoResult BaoxianDesc(Long companyid, Long baoxianid) {
		if (null == baoxianid) {
			return AuvgoResult.build(300, "请选择保险");
		}
		try {
			DataBaoxianCompany baoxian = dataBaoxianCompanyService.getDesc(companyid, baoxianid);
			return AuvgoResult.build(200, "success", JsonUtils.objectToJson(baoxian));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "公司下不存在此保险信息");
	}

	/**
	 * 得到公司下的员工级别
	 *
	 * @param cid
	 * @return
	 */
	public Map<String, String> getLevel(Long cid) {
		TreeMap<String, String> params = new TreeMap<String, String>();
		List<DataZidianValue> list = zidianKeyService.getzidianValueBYzidianKey(cid, "stafflevels");
		for (DataZidianValue dataZidianValue : list) {
			params.put(String.valueOf(dataZidianValue.getValue()), dataZidianValue.getName());
		}
		return params;
	}

	// 封装行程
	private AirOrderRoute buildBookFlight(AvFlight bkflight, String orgcode, String dstcode, String fromcityName,
										  String arrcityName, String daylow, String flightlow) {
		AirOrderRoute orderRoute = new AirOrderRoute();
		BeanUtils.copyProperties(bkflight, orderRoute);
		CangWei bkcangwei = bkflight.getCangweis().get(0);
		BeanUtils.copyProperties(bkcangwei, orderRoute);
		orderRoute.setCode(bkcangwei.getCode());
		orderRoute.setAirporttax(bkflight.getAirporttax());
		orderRoute.setFueltax(bkflight.getFueltax());
		orderRoute.setSeatNum(bkcangwei.getSeatNum());
		if(StringUtils.isEmpty(orderRoute.getLuggageDetail())||StringUtils.isEmpty(orderRoute.getLuggageDetail().trim())){
			orderRoute.setLuggageDetail(null);
		}
		if (!FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
			orderRoute.setCustomprice(0.0);
		}
		if (null != bkcangwei.getTpafterfee()) {
			orderRoute.setTpafterfee(Double.parseDouble(String.valueOf(bkcangwei.getTpafterfee())));
		} else {
			orderRoute.setRefundrule("以航司规定为准");
		}
		if (null != bkcangwei.getTpbeforefee()) {
			orderRoute.setTpbeforefee(Double.parseDouble(String.valueOf(bkcangwei.getTpbeforefee())));
		}
		if (null != bkcangwei.getGqafterfee()) {
			orderRoute.setGqafterfee(Double.parseDouble(String.valueOf(bkcangwei.getGqafterfee())));
		} else {
			orderRoute.setChangerule("以航司规定为准");
			orderRoute.setSignrule("不得转签");
		}
		if (null != bkcangwei.getGqbeforefee()) {
			orderRoute.setGqbeforefee(Double.parseDouble(String.valueOf(bkcangwei.getGqbeforefee())));
		}
		int flag = bkflight.getCodeShare() == true ? 1 : 0;
		orderRoute.setCodeShare(flag);
		if (bkflight.getCodeShare()) {// 如果是共享
			orderRoute.setSharecarrier(bkflight.getSharecarrier());
		}
		orderRoute.setDayprice(Double.parseDouble(daylow));// 全天最低价
		orderRoute.setLowprice(Double.parseDouble(flightlow));// 航班最低价
		orderRoute.setYprice(bkflight.getYprice());
		orderRoute.setFarebase(bkcangwei.getFarebase());
		if(bkflight.getFlydistance()!=null&&bkflight.getFlydistance()>=0){
			orderRoute.setDistance(bkflight.getFlydistance());// 设置飞行里程
		}else{
			orderRoute.setDistance(null);// 设置飞行里程
		}
		orderRoute.setPricefrom(bkcangwei.getPfrom());
		orderRoute.setSeatNum(bkcangwei.getSeatNum());// 票数
		orderRoute.setYprice(bkflight.getYprice());
		if (null == getSessionAttr("bookRoutes")) {
			orderRoute.setXuhao(0);// 去程的标识
			orderRoute.setOrgcityname(fromcityName);//
			orderRoute.setDstcityname(arrcityName);
			orderRoute.setOrgcitycode(orgcode);//
			orderRoute.setDstcitycode(dstcode);
		} else {
			orderRoute.setXuhao(1);// 返程的标识
			orderRoute.setOrgcityname(arrcityName);//
			orderRoute.setDstcityname(fromcityName);
			orderRoute.setOrgcitycode(dstcode);//
			orderRoute.setDstcitycode(orgcode);
		}
		try{
		if("1".equals(orderRoute.getStopnumber())&&StringUtils.isEmpty(orderRoute.getStopCity())&&StringUtils.isNotEmpty(orderRoute.getAirline())&&StringUtils.isNotEmpty(orderRoute.getDeptdate())){
			//查询经停城市
			FFResponse ffRes = airrateQueryProvider.flightTime(orderRoute.getAirline(), orderRoute.getDeptdate());
			if (null != ffRes) {
				List<FFModel> list = ffRes.getModels();
				if(list!=null&&list.size()>1){
					FFModel ffModel2 = list.get(1);
					List<DataCity> citylist = dataCityService.findByCode(ffModel2.getOrgcode());
					if (null != citylist && citylist.size() > 0) {
						orderRoute.setStopCity(citylist.get(0).getName());//经停城市
					} 
				}
			}
		}
		}catch(Exception e){
			log.error("查询封装flight查询经停异常", e);
		}
		return orderRoute;
	}

	//下一步  上一步
	@SuppressWarnings("unchecked")
	@RequestMapping("/checkOrder")
	public String checkOrder(AirOrderModel orderModel) {
		try {
			CrmEmployee user = getUser();
			if (null == user || null == user.getCompanyid()) {
				setAttr("failMsg", "登陆人信息有误,请重新登陆");
				return "/common/error";
			}
			// 获取选择的行程
			List<AirOrderRoute> orderRoute = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
			if (null == orderRoute || orderRoute.size() == 0) {
				setAttr("failMsg", "数据已过期，请重新查询航班数据");
				return "/common/error";
			}
			getmethod(orderRoute, user, getCompany());
			String signature = orderModel.getSignature();
			boolean flag = StringUtils.isBlank(signature) ? false : true;
			if (flag) {
				setAttr("pre", flag);
				orderModel = ModelSignature.decryptSign(signature, AirOrderModel.class);
			}
			List<DataBaoxianCompany> list = null;
			orderModel = BuildOrderRec(orderModel, user);
			if (StringUtils.isNotBlank(orderModel.getBaoxian())) {
				list = getBaoxian(orderModel.getBaoxian());
				orderModel.setBxNum(list.size());
			}
			// 封装出行人
			orderModel = buildOrderUser(orderModel, user, list);
			orderModel.setOrderRoutes(orderRoute);
			saveAirApprove(orderModel);
			feiyong(orderModel);
			getmethod(orderRoute, user, getCompany());
			setAttr("peisongName", request.getParameter("peisongName"));
			setAttr("peisongphone", request.getParameter("peisongphone"));
			setAttr("approvename", request.getParameter("approvename"));
			if (flag) {
				setAttr("model", orderModel);
				setAttr("flag", "airOrder");
				return "/air/air-book";
			}
			String airsign = ModelSignature.AirencryptSign(orderModel);
			orderModel.setSignature(airsign);
			setAttr("bookRoute", orderRoute);
			setAttr("model", orderModel);
			//存入令牌
			TokenUtils.setToken(request);
		} catch (Exception e) {
			log.error("checkConfirm error", e);
		}
		return "/air/air-book-check";
	}

	// 创建机票订单
	@RequestMapping("/createOrder")
	public String createOrder(AirOrderModel orderModel) throws Exception {
		CrmEmployee user = getUser();
		if (null == user || null == user.getCompanyid()) {
			setAttr("failMsg", "登陆人信息有误,请重新登陆");
			return "/common/error";
		}
		//验证重复提交
		if (!TokenUtils.validToken(request)) {
			setAttr("failMsg", "请勿重复提交订单");
			return "/common/error";
		}
		try {
			String signature = orderModel.getSignature();
			if (StringUtils.isBlank(signature)) {
				setAttr("failMsg", "缺少订单数据");
				return "/common/error";
			}
			orderModel = ModelSignature.decryptSign(signature, AirOrderModel.class);
			List<DataBaoxianCompany> list = null;
			orderModel = BuildOrderRec(orderModel, user);
			if (StringUtils.isNotBlank(orderModel.getBaoxian())) {
				list = getBaoxian(orderModel.getBaoxian());
				orderModel.setBxNum(list.size());
			}
			// 封装出行人
			orderModel = buildOrderUser(orderModel, user, list);
			// 获取选择的行程
			List<AirOrderRoute> orderRoute = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
			orderModel.setOrderRoutes(orderRoute);
			CrmFuwufei fuwufei = fuwufeiService.getByCid(user.getCompanyid());
			// 保存审批信息 但此时保存不上订单号,需要到service中生成订单号后保存
			saveAirApprove(orderModel);
			List<String> orderNo = null;
			if ("order".equals(fuwufei.getGntype())) {
				Double gnweb = Double.valueOf(fuwufei.getGnweb() + "");
				orderNo = airOrderService.createOrder(orderModel, gnweb, fuwufei.getGntype());
			} else if ("per".equals(fuwufei.getGntype())) {
				if ("1".equals(fuwufei.getGnpertype())) {// 按订单百分比 收取
					orderNo = airOrderService.createOrder(orderModel, Double.valueOf(fuwufei.getGnper()),
							fuwufei.getGntype());// 返回的是订单号
				} else {
					orderNo = airOrderService.createOrder(orderModel, 0d, fuwufei.getGntype());// 返回的是订单号
				}
			}
			if (null != orderNo && orderNo.size() > 0) {
				if (orderNo.size() > 1) {
					return "redirect:/air/order/Tosuccess?orderno1=" + orderNo.get(0) + "&&orderno2=" + orderNo.get(1);
				} else {
					return "redirect:/air/order/Tosuccess?orderno1=" + orderNo.get(0) + "&&orderno2= ";
				}
			}
			setAttr("failMsg", "订单提交出现异常");
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} finally {
			removeSession("bookRoutes");// 清楚缓存
		}
		return "common/error";
	}


	@SuppressWarnings("unchecked")
	protected void saveAirApprove(AirOrderModel orderModel) throws Exception {
		AirOrder airOrder = orderModel.getAirOrder();
		List<AirOrderPassenger> users = orderModel.getAirUser();
		Long approveid = airOrder.getApproveid();
		if (null != approveid) {
			List<String> deptIdL = ConvertUtils.extractElementPropertyToList(users, "deptid");
			List<CrmApproveShenpiren> shenpirenList = approveService.getShenpirenAndSpecialByApproveId(
					airOrder.getCompanyid(), approveid, airOrder.getWeibeiflag().toString(), null, deptIdL);
			List<AirOrderApprove> approves = Lists.newArrayList();
			if (null != shenpirenList && shenpirenList.size() > 0) {
				for (CrmApproveShenpiren spr : shenpirenList) {
					int i = 0;
					CrmEmployee emp = crmEmployeeService.getById(airOrder.getCompanyid(), spr.getEmployeeid());
					if (null == emp) {
						continue;
					}
					if (StringUtils.isNotBlank(emp.getApprovesms()) && "1".equalsIgnoreCase(emp.getApprovesms())) {// 短信审批
						if (StringUtils.isNotBlank(emp.getApproveemail())
								&& "1".equalsIgnoreCase(emp.getApproveemail())) {// 邮件审批审批
							i = 3;// sms and email approve
						} else {
							i = 1;// only sms approve
						}
					} else if (StringUtils.isNotBlank(emp.getApproveemail())
							&& "1".equalsIgnoreCase(emp.getApproveemail())) {// 邮件审批审批
						i = 2;// only email approve
					}
					AirOrderApprove approve = new AirOrderApprove();
					BeanUtils.copyProperties(spr, approve);
					approve.setDeptname(emp.getDeptname());
					approve.setOrderno(airOrder.getOrderno());
					approve.setEmail(emp.getEmail());
					approve.setMobile(emp.getMobile());
					approve.setIsinert(spr.getIsinert());
					approve.setOpenid(String.valueOf(i));// 保存该审批人的审批习惯
					approve.setStatus(AirStatusContant.COM_APPROVE_STATUS);
					approve.setCreatetime(new Date());
					approve.setOpstatus(AirStatusContant.COM_APPROVE_STATUS);
					approve.setOrderno(airOrder.getOrderno());
					approve.setId(null);
					approves.add(approve);
				}
				orderModel.setApproves(approves);
				log.info("saveAirApprove", approves);
			}
		}
	}

	public List<DataBaoxianCompany> getBaoxian(String baoxian) {
		List<DataBaoxianCompany> list = Lists.newArrayList();
		String[] split = StringUtils.removeEnd(baoxian, "-").split("-");
		for (int i = 0; i < split.length; i++) {
			DataBaoxianCompany baoXian = dataBaoxianCompanyService.getById(Long.parseLong(split[i]));
			list.add(baoXian);
		}
		return list;
	}

	private AirOrderModel buildOrderUser(AirOrderModel orderModel, CrmEmployee user, List<DataBaoxianCompany> list) {
		double baoMoney = 0.0;
		double baoCaiMoney = 0.0;
		StringBuffer bname = new StringBuffer();
		StringBuffer bcode = new StringBuffer();
		if (null != list && list.size() > 0) {
			for (DataBaoxianCompany baoxian : list) {
				baoMoney += baoxian.getSalePrice();
				baoCaiMoney += baoxian.getCaigouPrice();
				bname.append(baoxian.getName() + ",");
				bcode.append(baoxian.getCode() + ",");
			}
		}
		List<AirOrderPassenger> airUser = orderModel.getAirUser();
		boolean flag = false;
		for (int i = 0; i < airUser.size(); i++) {
			AirOrderPassenger Passenger = airUser.get(i);
			List<CrmEmployeeCert> certlist = certService.findByCidAndEmpid(user.getCompanyid(),
					Passenger.getEmployeeid());
			CrmEmployeeCert empcerts = null;
			if (null != certlist && !certlist.isEmpty()) {
				// 遍历拿到对应的证件
				for (CrmEmployeeCert empcert : certlist) {
					if (Passenger.getCerttype().equals(empcert.getCerttype())
							&& StringUtils.isNotBlank(empcert.getCertificate())) {
						if (StringUtils.isNotBlank(empcert.getUsername())) {
							empcerts = empcert;
							break;
						}
					}
				}
			}
			CrmEmployee emp = crmEmployeeService.getById(user.getCompanyid(), Passenger.getEmployeeid());
			if (null != emp) {
				Passenger.setIfvip(emp.getIfvip());
				if (1 == emp.getIfvip().intValue()) {
					flag = true;
				}
			} else {
				Passenger.setIfvip(0);
			}
			BeanUtils.copyProperties(emp, Passenger);
			if (null == empcerts) {
				Passenger.setCerttype(emp.getCerttype());
				Passenger.setCertno(emp.getCertno());
			} else {
				Passenger.setCerttype(empcerts.getCerttype());
				Passenger.setCertno(empcerts.getCertificate());
				Passenger.setName(empcerts.getUsername());
			}
			Passenger.setBxPayMoney(baoMoney);
			Passenger.setBxCaigouMoney(baoCaiMoney);
			Passenger.setBxCode(String.valueOf(bcode));
			Passenger.setBxName(String.valueOf(bname));
			Passenger.setEmployeeid(emp.getId());
			Passenger.setZhiwei(Integer.parseInt(emp.getZhiwei()));
			Passenger.setDeptid(emp.getDeptid() + "");
			Passenger.setDepname(emp.getDeptname());
			Passenger.setPasstype("AD");
		}
		orderModel.getAirOrder().setIfvip(flag ? 1 : 0);
		return orderModel;
	}

	private AirOrderModel BuildOrderRec(AirOrderModel orderModel, CrmEmployee user) {
		AirQuery query = (AirQuery) getSessionAttr("airquery");
		AirOrder airorder = orderModel.getAirOrder();
		CrmCompany company = companyService.getById(user.getCompanyid());
		airorder.setCompanyid(company.getId());
		airorder.setCompanycode(company.getBianhao());
		airorder.setCompanyname(company.getName());
		airorder.setTickettype(0);// 国内机票
		airorder.setOrderFrom(BaseStatusContant.COM_ORDER_FROM_VIP);// 前台白屏
		airorder.setChuchaitype(0);// 默认因公
		airorder.setOrdertype(query.getType());// 订单类型是单还是往返
		CrmJiesuan crmJiesuan = jiesuanService.getByCid(user.getCompanyid());
		airorder.setPayType(crmJiesuan.getFukuankemu());// 默认是获取该公司的支付类型
		airorder.setBookusername(user.getName());
		airorder.setBookuserid(user.getId());
		if (StringUtils.isBlank(airorder.getLinkPhone())) {// 如果联系人手机号没填写,自动填入预订人的手机号
			airorder.setLinkPhone(user.getMobile());
		}
		if (StringUtils.isBlank(airorder.getLinkName())) {
			airorder.setLinkName(user.getName());
		}
		airorder.setBookdepth(user.getDepth());
		airorder.setBookdept(user.getDeptname());
		airorder.setCreatetime(new Date());
		orderModel.setAirOrder(airorder);
		return orderModel;
	}

	// 跳转成功订单
	@RequestMapping("/order/Tosuccess")
	public String toSuccess(@RequestParam("orderno1") String orderno1, @RequestParam("orderno2") String orderno2) {
		if (StringUtils.isNotBlank(orderno1)) {
			int flag = 1;
			AirOrder airOrder1 = airOrderService.getOrderByorderNo(orderno1);
			if (StringUtils.isNotBlank(orderno2)) {
				AirOrder airOrder = airOrderService.getOrderByorderNo(orderno2);
				if (!airOrder.getRoutes().get(0).getPricefrom().equalsIgnoreCase("W")) {
					flag = 0;
				}
			}
			if (null == airOrder1) {
				setAttr("Msg", "该订单出现异常,系统正在努力查找原因");
				return "/common/404";
			}
			if (!airOrder1.getRoutes().get(0).getPricefrom().equalsIgnoreCase("W")) {
				flag = 0;
			}
			setAttr("route1", airOrder1.getRoutes().get(0));
			setAttr("airorder1", airOrder1);
			setAttr("flag", flag);
			StringBuilder sb = new StringBuilder();
			for (AirOrderPassenger users : airOrder1.getPassengers()) {
				sb.append(users.getName() + " ");
			}
			setAttr("passengerName", sb.toString());
			CrmProductSet productSet = productSetService.getByCid(airOrder1.getCompanyid());
			if (null != airOrder1 && (null == airOrder1.getApproveid() || airOrder1.getApproveid() <= 0)) {// 无需审批
				//1，确认出票     2.自动出票
				String ticket = ProConfUtil.getValue(productSet.getProconfvalue(), "jpautoticket");
				setAttr("jpautoflag", ticket); //1:是
				if ("1".equals(ticket)) {
					return "redirect:/myChailv/toAirOrderDetail/" + airOrder1.getOrderno() + "?flag=personal";
				}
			} else {
				setAttr("orderMsg", "订单已送审，为了避免价格发生变化，请提醒审批人尽快完成审批。");
				setAttr("jpspautoflag", ProConfUtil.getValue(productSet.getProconfvalue(), "jpspautoticket")); //需审自动出票 1
			}
			if (StringUtils.isNotBlank(orderno2)) {
				setAttr("single", 1);
				AirOrder airOrder2 = airOrderService.getOrderByorderNo(orderno2);
				if (null == airOrder2) {
					setAttr("Msg", orderno2 + "订单出现异常,系统正在努力查找原因");
					return "/common/404";
				}
				setAttr("route2", airOrder2.getRoutes().get(0));
			}
		}
		return "/air/air-book-success";
	}

	@SuppressWarnings("unchecked")
	@RequestMapping("/confirmPrice")
	@ResponseBody
	public AuvgoResult confirmPrice(String owprice, String rtprice) {
		try {
			if (StringUtils.isNotBlank(owprice)) {
				List<AirOrderRoute> bookRoutes = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
				if (null == bookRoutes || bookRoutes.size() == 0) {
					return AuvgoResult.build(300, "行程数据异常,请重新查询航班信息");
				}
				for (AirOrderRoute airOrderRoute : bookRoutes) {
					if (0 == airOrderRoute.getXuhao()) {
						airOrderRoute.setPrice(Double.parseDouble(owprice));
					}
				}
				if (bookRoutes.size() > 1 && StringUtils.isNotBlank(rtprice) && IsNumberUtils.isNumeric(rtprice)) {
					for (AirOrderRoute airOrderRoute : bookRoutes) {
						if (1 == airOrderRoute.getXuhao()) {
							airOrderRoute.setPrice(Double.parseDouble(owprice));
						}
					}
				}
				setSessionAttr("bookRoutes", bookRoutes);
			}
			return AuvgoResult.build(200, "success");
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "操作出现异常,请重新查询预订");
	}

	private String getNoSeatDes(int xuhao, int routeSize) {
		// 生成pnr失败
		StringBuffer sb = new StringBuffer();
		if (0 == xuhao) {
			String des = routeSize > 1 ? "去程" : "此";
			sb.append(des + "舱位已售完,请重新查询其他舱位");
		} else {
			sb.append("返程的舱位已售完,请重新查询其他舱位");
		}
		return sb.toString();
	}

	/**
	 * 创建PNR订座记录
	 *
	 * @param
	 * @return
	 * @throws ParseException
	 * @throws java.text.ParseException
	 */
	private AirrateBookResponse createOrder(AirOrderRoute route, List<AirOrderPassenger> passengerList) {
		String random = String.valueOf(System.currentTimeMillis());
		Set<String> passNames = Sets.newHashSet();
		List<PNRIDInfo> pnridInfos = Lists.newArrayList();
		List<AirrateSegment> segments = Lists.newArrayList();
		List<PNRBookOSI> bookOSIs = Lists.newArrayList();
		List<AirratePassenger> passengers = Lists.newArrayList();
		Long outTime = null;
		AirrateBookResponse bookResponse = null;
		try {
			outTime = DateUtil.getDateParseStr(route.getDeptdate() + " " + route.getDepttime(), "yyyy-MM-dd HH:mm");
			AirrateSegment segment = new AirrateSegment();
			segment.setAirline(route.getAirline());
			segment.setCode(route.getCode());
			segment.setOrgcode(route.getOrgcode());
			segment.setArricode(route.getArricode());
			segment.setCarriecode(route.getCarriecode());
			segment.setDepttime(route.getDepttime());
			segment.setDeptdate(route.getDeptdate());
			segment.setSegmentId(random);
			segments.add(segment);
			segment.setDkhCode(route.getDkhCode());
			int index = 1;
			AirratePassenger passenger = null;
			for (AirOrderPassenger pg : passengerList) {
				passenger = new AirratePassenger();
				BeanUtils.copyProperties(pg, passenger);
				passenger.setPasstype(pg.getPasstype());
				passNames.add(pg.getName());
				passengers.add(passenger);
				passenger.setPasstype("AD");
				pnridInfos.add(new PNRIDInfo(route.getCarriecode(), "NI", pg.getCertno(), pg.getName()));
				bookOSIs.add(new PNRBookOSI(route.getCarriecode(),
						"CTCM" + common_phone_list.get(index - 1) + "/p" + index));
				index++;
			}
			bookOSIs.add(new PNRBookOSI(route.getCarriecode(), "CTCT18600311788"));
			List<AirrateContact> contacts = Lists.newArrayList();
			AirrateContact airrateContact = new AirrateContact();
			// 公司小黑
			airrateContact.setPhone("18600311788");
			airrateContact.setName("小黑");
			contacts.add(airrateContact);
			// 设置最晚出票时限为航班起飞时间的前2小时
			String outTicketTime = new DateTime(outTime).minusHours(2).toString("yyyy-MM-dd HH:mm:ss");
			log.info(
					"checkPrice request--> passNames:{},pnridInfos:{},segments:{},contacts:{},bookOSIs:{},outTicketTime:{}",
					passNames, pnridInfos, segments, contacts, bookOSIs, outTicketTime);
			AirrateBookRequest request;
			request = new AirrateBookRequest();
			request.setPassengers(passengers);
			request.setBookOSIs(bookOSIs);
			request.setContacts(contacts);
			request.setSegments(segments);
			request.setCompanyCode("Auvgo");
			request.setPlatform(route.getPricefrom());
			request.setOrderno(random);
			request.setUserName(getUser().getUsername());
			request.setTotalPrice(route.getPrice());
			request.setWirtePnrPrice(false);
			bookResponse = airrateBookProvider.createOrder(request);
			log.info("checkPrice response-->{}", JsonUtils.objectToJson(bookResponse));
		} catch (Exception e) {
			log.error("/air/checkPrice error", e);
		}
		return bookResponse;
	}

	/**
	 * 预订机票前校验姓名
	 *
	 * @param cid      公司id
	 * @param ids      乘客id{12-23-34-}
	 * @param types    证件类型{C-B-ID-}
	 * @param passType 乘客类型{1:公司员工,0:临时乘客}
	 * @return
	 */

	@RequestMapping("/validForm")
	@ResponseBody
	public AuvgoResult validForm(@RequestParam("cid") String cid, @RequestParam("ids") String ids,
								 @RequestParam("types") String types, @RequestParam("passType") String passType) {
		String[] idsArray = StringUtils.removeEnd(ids, "-").split("-");
		String[] typesArray = StringUtils.removeEnd(types, "-").split("-");
		String[] passTypeArray = StringUtils.removeEnd(passType, "-").split("-");
		Long companyid = Long.valueOf(cid);
		// 对乘客姓名做校验,如果是英文姓名,那么保证有且仅有一个斜杠,并且斜杠前后只能是英文
		String regex = "[a-zA-z]+";
		String result = "不正确，请参照以下格式：钱多多、qian/duoduo、钱/duoduo";
		for (int index = 0; index < idsArray.length; index++) {
			String id = idsArray[index];
			log.info("第{}个人的id为:{}", index + 1, id);
			String name = null;
			// 判断是公司员工还是常用联系人
			if ("1".equals(passTypeArray[index])) {
				// 如果是公司员工
				List<CrmEmployeeCert> certs = certService.findByCidAndEmpid(companyid, Long.valueOf(id));
				for (CrmEmployeeCert cert : certs) {
					if (cert.getCerttype().equals(typesArray[index])) {
						name = cert.getUsername();
					}
				}
			} else {
				// 如果是常用联系人
				CrmEmployeeLinshi linshi = linshiService.getById(Long.valueOf(id));
				name = linshi.getUsername();
			}
			if (StringUtils.isBlank(name)) {
				// 此处可能是有的员工信息和证件信息维护的不统一,才导致的name没有赋值
				return AuvgoResult.build(300, "乘客证件名称有误,请核查!");
			} else if (name.contains("/")) {
				String[] split = name.split("/");
				if (split.length > 2) {
					return AuvgoResult.build(300, name + result);
				}
				for (int i = 0; i < split.length; i++) {
					if (i == 0) {
						continue;
					}
					if (split[i].matches(regex)) {
						continue;
					}
					return AuvgoResult.build(300, name + result);
				}
			} else if (name.matches(".*[a-zA-Z]+.*")) {
				return AuvgoResult.build(300, name + result);
			}
		}
		return AuvgoResult.ok();
	}

	//费用的计算
	public void feiyong(AirOrderModel orderModel) {
		List<AirOrderRoute> routes = orderModel.getOrderRoutes();
		AirOrder order = orderModel.getAirOrder();
		CrmFuwufei fuwufei = fuwufeiService.getByCid(order.getCompanyid());
		List<AirOrderPassenger> userlist = orderModel.getAirUser();
		List<AirOrderRoutePass> pass = Lists.newArrayList();
		Double totalprice = 0.0;
		for (AirOrderRoute route : routes) {
			Double totalTicketPrice = 0.0;
			if ("order".equals(fuwufei.getGntype())) {
				for (AirOrderPassenger user : userlist) {
					totalprice += fuwufei.getGnweb() + user.getBxPayMoney() + route.getAirporttax() + route.getFueltax() - route.getCustomprice();
					totalTicketPrice += route.getPrice();// 票价总和
				}
				fwf(orderModel, userlist.get(0), pass, Double.valueOf(fuwufei.getGnweb()));
				totalprice = totalprice + totalTicketPrice; // 总票价+其他费用
			} else if ("per".equals(fuwufei.getGntype())) {
				for (AirOrderPassenger user : userlist) {
					totalprice += user.getBxPayMoney() + route.getAirporttax() + route.getFueltax() - route.getCustomprice();
					totalTicketPrice += route.getPrice();// 票价总和
				}
				DecimalFormat df = new DecimalFormat("#.0");
				AirOrderPassenger ap = userlist.get(0);
				Double fuwufei1 = Double.valueOf(df.format((ap.getBxPayMoney() + route.getAirporttax() + route.getFueltax() + route.getPrice()) * (Double.valueOf(fuwufei.getGnper()) / 100D)));
				totalprice += totalTicketPrice + Double.valueOf(fuwufei1) * userlist.size();
				fwf(orderModel, userlist.get(0), pass, fuwufei1);
			}
			orderModel.getAirOrder().setTotalprice(totalprice);
			orderModel.getAirOrder().setTotalticketprice(totalTicketPrice);
		}
	}

	public void fwf(AirOrderModel orderModel, AirOrderPassenger user, List<AirOrderRoutePass> pass, Double fuwufei) {
		AirOrderRoutePass routePass = new AirOrderRoutePass();
		routePass.setFuwufee(fuwufei.doubleValue());
		routePass.setPassid(user.getId());
		pass.add(routePass);
		orderModel.setRoutePass(pass);
	}


	/**
	 * 相似订单
	 * /air/checksimple
	 *
	 * @param ids              1939-1994
	 * @param firstFromDate    第一程 出发时间
	 * @param firstArriveDate  第一程到达时间
	 * @param secondFromDate   第二程 出发时间
	 * @param secondArriveDate 第二程 到达时间
	 * @return
	 */
	@RequestMapping("/checksimple")
	@ResponseBody
	public AuvgoResult airCheckSimple(String ids, String firstFromDate, String firstArriveDate, String secondFromDate, String secondArriveDate) {
		log.info("/air/checkSimilar --> ids:{},firsFromDate:{},firstArriveDate:{},secondFromDate:{},secondArriveDate:{}", ids, firstFromDate, firstArriveDate, secondFromDate, secondArriveDate);
		try {
			List<AirOrderRoute> routeList = Lists.newArrayList();
			if (StringUtils.isNotBlank(firstFromDate) && StringUtils.isNotBlank(firstArriveDate)) {
				AirOrderRoute route = new AirOrderRoute();
				route.setArridate(firstArriveDate);
				route.setDeptdate(firstFromDate);
				routeList.add(route);
			}
			if (StringUtils.isNotBlank(secondFromDate) && StringUtils.isNotBlank(secondArriveDate)) {
				AirOrderRoute route = new AirOrderRoute();
				route.setArridate(secondArriveDate);
				route.setDeptdate(secondFromDate);
				routeList.add(route);
			}
			String[] empids = StringUtils.removeEnd(ids, "-").split("-");
			Map<Integer, String> maps = Maps.newHashMap();
			StringBuilder sb = new StringBuilder();
			for (int i = 0; i < routeList.size(); i++) {
				String result = airOrderService.checkSimilarAirOrder(empids, routeList.get(i).getDeptdate(), routeList.get(i).getArridate());
				if (StringUtils.isNotBlank(result)) {
					maps.put(i, result);
				}
			}
			if (maps.size() == 0) {//没有相似订单
				return AuvgoResult.build(200, "success");
			} else {
				String strings0 = maps.get(0);
				String strings1 = maps.get(1);
				if (StringUtils.isNotBlank(strings0)) {
					if (StringUtils.isNotBlank(strings1)) {
						sb.append("去程 :" + strings0);
					} else {
						sb.append(strings0 + "是否继续提交?");
					}
				}
				if (StringUtils.isNotBlank(strings1)) {
					sb.append("返程 :" + strings1 + "是否继续提交?");
				}
			}
			return AuvgoResult.build(201, "success", sb.toString());
		} catch (Exception e) {
			log.error("checkSimilarOrder", e);
			return AuvgoResult.build(200, "success");
		}

	}


	//填写页面跳列表页面
	@RequestMapping("/Returnlist")
	public String ReturnList() {
		AirQuery airQuery = (AirQuery) getSessionAttr("airquery");
		airQuery.setCab(airQuery.getCab() == null ? "" : airQuery.getCab());
		airQuery.setAirline(airQuery.getAirline() == null ? "" : airQuery.getAirline());
		setAttr("query", JsonUtils.objectToJson(airQuery));
		return "/air/air-query-list";
	}
}
