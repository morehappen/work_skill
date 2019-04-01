package com.auvgo.web.face.train;

import com.auvgo.business.common.IBaseBusiness;
import com.auvgo.business.pay.order.PrepayOrderBusiness;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.utils.*;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.data.api.DataBaoxianService;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataBaoxian;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.train.api.TrainOrderLogService;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.*;
import com.auvgo.traincl.api.dto.entity.CLResult;
import com.auvgo.traincl.api.dto.entity.seat.seatDTO;
import com.auvgo.traincl.api.dto.entity.trainsDTO;
import com.auvgo.traincl.api.ws.CLTrainOrderService;
import com.auvgo.traincl.api.ws.CLTrainQueryService;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.TrainQueryModel;
import com.auvgo.web.util.ModelSignature;
import com.auvgo.web.util.TokenUtils;
import com.google.common.collect.Lists;
import org.apache.commons.beanutils.BeanUtilsBean2;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 火车票预订controller
 *
 * @author zxb
 */
@Controller
@RequestMapping("/train")
public class TrainBookController extends BaseController {

	@Autowired
	protected TrainOrderLogService orderLogService;
	@Autowired
	protected CrmJiesuanService crmJiesuanService;
	@Autowired
	protected TrainOrderService trainOrderService;
	@Autowired
	private CrmApproveService approveService;
	@Autowired
	protected CrmEmployeeService employeeService;
	@Autowired
	protected CrmCompanyService crmCompanyService;
	@Autowired
	protected CrmEmpTraincountService crmEmpTraincountService;
	@Autowired
	protected CrmEmployeeLinshiService crmEmployeeLinshiService;
	@Autowired
	protected CrmEmployeeCertService crmEmployeeCertService;
	@Autowired
	private CrmDepartmentService deptService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private CLTrainQueryService clTrainQueryService;
	@Autowired
	private CLTrainOrderService cLTrainOrderService;
	@Autowired
	private SysOutpushDataService sysOutdataService;
	@Autowired
	private DataBaoxianService dataBaoxianService;
	@Autowired
	private CrmApproveService crmApproveService;
	@Autowired(required = false)
	private PrepayOrderBusiness prepayOrderBusiness;
	@Autowired
	private CrmProductSetService crmProductSetService;
	/** 基础数据 **/
	@Autowired(required=false)
	private IBaseBusiness baseBusiness;

	/**
	 * 跳转预订页面接口
	 *
	 * @param trainCode 车次码
	 * @param seatLevel 座位级别
	 * @return
	 */
	@RequestMapping("/book/{trainCode}/{seatLevel}")
	public String book(@PathVariable("trainCode") String trainCode, @PathVariable("seatLevel") String seatLevel) {
		try {
			if (StringUtils.isBlank(trainCode) || StringUtils.isBlank(seatLevel)) {
				setAttr("msg", "查询车次已过期，请重新查询!");
				return "/train/train-query-list";
			}
			// 获取查询车次的内容
			CLResult trains = (CLResult) getSessionAttr("trainList");
			if (null == trains) {
				setAttr("msg", "查询车次已过期，请重新查询!");
				return "/train/train-query-list";
			}
			trainsDTO train = trains.getChooseTrainNo(trains.getTrains(), trainCode);
			// 12306账号
			CrmEmployee sessionUser = getUser();
			CrmEmployee user;
			user = employeeService.getById(sessionUser.getCompanyid(), sessionUser.getId());
			if (null == user) {
				user = sessionUser;
			} else {
				Long cid = user.getCompanyid();
				Long empid = user.getId();
				CrmEmpTraincount byCidAndEmpid = crmEmpTraincountService.getByCidAndEmpids(cid, empid);
				setSessionAttr("account", byCidAndEmpid);
			}
			setSessionAttr("trainDto", train);
			String runtime = getHour(train.getRunTimeSpan());
			// 设置时间
			if (null != runtime) {
				train.setRunTime(runtime);
			}
			Map<String, Object> seatMap = trains.getCanBuySeat(train);
			Object choose = seatMap.get(seatLevel);
			if (null == choose) {
				if ("1".equals(seatLevel)) {
					choose = seatMap.get(AuvStatusContant.SEAT_P_NOSEAT);
				} else {
					choose = seatMap.get(AuvStatusContant.SEAT_G_NOSEAT);
				}
			}
			seatMap.put("chooseSeat", seatLevel);
			// 将选中的坐席数据缓存起来
			setSessionAttr("seatMap", choose);
			String seatClass = train.getSeatClass(choose);
			seatDTO seatdto = new seatDTO();
			BeanUtilsBean2.getInstance().copyProperties(seatdto, choose);
			// 设置座位类型
			seatdto.setSeatClass(seatClass);
			setSessionAttr("chooseRoute", seatdto);
			log.info("seatdto:{}", JsonUtils.objectToJson(seatdto));
			// 判断是否可以选择
			// 车次第一个字符
			String s = trainCode.substring(0, 1);
			if (StringUtils.isNotBlank(seatClass) && (s.equals("G") || s.equals("C") || s.equals("D"))) {
				int ifChooseSeat = chooseSeat(trainCode, seatClass);
				setAttr("ifChooseSeat", ifChooseSeat);
			}
			// if (seatLevel.equals("G"))
			// 部门，员工等级
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			getMethod(user,company);
			setAttr("ceryTypes", baseBusiness.obtainCerttype()); // 证件类型
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("type:{},Exception:{}", trainCode, e);
			setAttr("msg", "查询出现异常，请您重新查询预订!");
			return "/train/train-query-list";
		}
		return "/train/train-book";
	}


	public void getMethod(CrmEmployee user,CrmCompany company){
		// 服务费
		CrmFuwufei fuwufei = crmCompanyService.getComanyFuwufei(user.getCompanyid());
		if ("order".equals(fuwufei.getTraintype())) {
			// 坐席待定费
			setAttr("trainWeb",Double.valueOf(fuwufei.getTrainweb()));
		} else if ("per".equals(fuwufei.getTraintype())) {
			// 按订单百分比 收取
			if ("1".equals(fuwufei.getTrainpertype())) {
				setAttr("trainPer1",fuwufei.getTrainper()+"%");
			} else {
				setAttr("trainPer2","0%(协议)");
			}
		}
		setAttr("fuwufei", fuwufei);
		CrmProductSet crmproduct = crmProductSetService.getByCid(user.getCompanyid());
		setAttr("costcenter", ProConfUtil.getValue(crmproduct.getProconfvalue(), "costcenter"));
		setAttr("projectinfo", ProConfUtil.getValue(crmproduct.getProconfvalue(), "projectinfo"));
		setAttr("projectinfoinput", ProConfUtil.getValue(crmproduct.getProconfvalue(), "projectinfoinput"));
		setAttr("costcenterinput", ProConfUtil.getValue(crmproduct.getProconfvalue(), "costcenterinput"));
		setAttr("depttree", deptService.getDeptZtree(company.getId(), null));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(),"stafflevels");
		setAttr("AllStaff", staffList);
		CrmDepartment deptment = deptService.getDepartMentByBianhaoAndCompanyId(company.getBianhao() + "-LSBM", company.getId());
		setAttr("dept", deptment);
		try {
			CrmApprove crmapp = crmApproveService.getApproveByEmployeeId(user.getCompanyid(), user.getId(), user.getDeptid());
			setAttr("approve", crmapp);
		} catch (Exception e) {
		}
	}
	/**
	 * 是否可以选座
	 *
	 * @param trainNo
	 * @param seatClass
	 * @return 1:可以,0:不可以
	 */
	private int chooseSeat(String trainNo, String seatClass) {
		try {
			Map<String, String> seats = clTrainQueryService.getChooseInfo(trainNo);
			log.info("seats-->{}", seats);
			if (null != seats && !seats.isEmpty() && seats.containsKey(seatClass)) {
				return 1;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return 0;
	}

	/**
	 * 车次验证
	 *
	 * @param trainCode 车次码
	 * @param seatLevel 座位级别
	 * @return
	 */
	@RequestMapping("/checktrain/{trainCode}/{seatLevel}")
	@ResponseBody
	public AuvgoResult checkTrain(@PathVariable("trainCode") String trainCode,
								  @PathVariable("seatLevel") String seatLevel) {
		try {
			if (StringUtils.isBlank(trainCode) || StringUtils.isBlank(seatLevel)) {
				return AuvgoResult.build(300, "车次信息有误，请重新查询!");
			}
			// 获取查询车次的内容
			CLResult clResult = (CLResult) getSessionAttr("trainList");
			if (null == clResult) {
				return AuvgoResult.build(300, "查询车次已过期，请重新查询!");
			}
			List<trainsDTO> trains = clResult.getTrains();
			trainsDTO trainDto = null;
			for (trainsDTO train : trains) {
				if (trainCode.equals(train.getTrainNo())) {
					trainDto = train;
					break;
				}
			}
			// 获取查询条件
			TrainQueryModel param = (TrainQueryModel) getSessionAttr("train_query_con");
			String startDate = param.getStartDate();

			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			long facheTime = sdf.parse(startDate + " " + trainDto.getFromTime()).getTime();
			long currentTime = System.currentTimeMillis();
			long halfHour = 30 * 60 * 1000L;
			long oneHourHalf = 120 * 60 * 1000L;
			long firstTime = facheTime - oneHourHalf;
			long secondTime = facheTime - halfHour;
			// 开车前30分钟
			if (currentTime >= secondTime && currentTime <= facheTime) {
				return AuvgoResult.build(300, "距离该车次发车时间较近，已停止网络预订。如急需购票，可持有效证件去车站售票窗口办理!");
			}
			// 2小时-30分钟的车次
			if (currentTime >= firstTime && currentTime <= secondTime) {
				return AuvgoResult.build(200, "您选择的车次距开车时间很近了，请确保有足够的时间抵达车站，并办理换取纸质车票、安全检查、实名制验证及检票等手续，以免耽误您的旅行!",
						"/train/book/" + trainCode + "/" + seatLevel);
			}
			return AuvgoResult.build(200, "", "/train/book/" + trainCode + "/" + seatLevel);

		} catch (Exception e) {
			log.warn("trainCode:{},seatLevel:{},Exception:{}", trainCode, seatLevel, e);
			return AuvgoResult.build(300, "查询出现异常，请您重新查询预订!");
		}

	}

	// 获取运行时间
	public String getHour(String time) {
		// String runTimeSpan = traindTo.getRunTimeSpan();
		if (IsNumberUtils.isNumeric(time)) {
			int Spanminus = Integer.parseInt(time);
			int minu = Spanminus % 60;// 分钟
			int hour = Spanminus / 60;
			return hour + "时" + minu + "分";
		}
		return null;
	}

	/**
	 * 上一步下一步
	 *
	 * @param orderModel
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/checkOrder")
	public String checkOrder(TrainOrderModel orderModel) {
		try {
			CrmEmployee user = getUser();
			if (null == user || null == user.getCompanyid()) {
				setAttr("failMsg", "登陆人信息有误,请重新登陆");
				return "/common/error";
			}
			// 获取选择的行程
			CLResult cLResult = (CLResult) getSessionAttr("trainList");
			if (null == cLResult) {
				setAttr("failMsg", "数据已过期，请重新查询航班数据");
				return "/common/error";
			}
			String signature = orderModel.getSignature();
			boolean flag = StringUtils.isBlank(signature) ? false : true;
			if (flag) {
				setAttr("pre", flag);
				orderModel = ModelSignature.decryptSign(signature, TrainOrderModel.class);
			}
			trainsDTO train = (trainsDTO) getSessionAttr("trainDto");
			getMethod(user,getCompany());
			setAttr("seatmaps", getSessionAttr("seatMap"));
			setAttr("train_query", getSessionAttr("train_query_con"));
			CrmCompany crmCompany = getCompany();
			TrainOrder trainOrder = buildOrder(orderModel, crmCompany, train);
			// 封装出行人
			orderModel = buildTrainUsers(orderModel, train, user);
			TrainOrderRoute orderroute = buildOrderRoute(cLResult.getQueryKey(), train, crmCompany.getId(),
					trainOrder.getTravelTime());
			//星期
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			setAttr("travelTime", DateUtils.getWeek(sdf.parse(orderroute.getTravelTime())));
			seatDTO chooseRoute = (seatDTO)getSessionAttr("chooseRoute");
			String s = orderroute.getTrainCode().substring(0,1);
			if (StringUtils.isNotBlank(chooseRoute.getSeatClass()) && (s.equals("G") || s.equals("C") || s.equals("D"))) {
				int ifChooseSeat = chooseSeat(orderroute.getTrainCode(), chooseRoute.getSeatClass());
				setAttr("ifChooseSeat", ifChooseSeat);
			}
			orderModel.setRoute(orderroute);
			List<TrainOrderApprove> approveList = buildTrainApproves(orderModel, crmCompany.getId());
			orderModel.setApproves(approveList);
			feiyong(orderModel);
			if (flag) {
				setAttr("model", orderModel);
				setAttr("flag", "trainOrder");
				return "/train/train-book";
			}
			String trainsign = ModelSignature.TrainencryptSign(orderModel);
			orderModel.setSignature(trainsign);
			setAttr("model", orderModel);
			setAttr("approvename", request.getParameter("approvename"));
			//存入令牌
			TokenUtils.setToken(request);
			setAttr("auvUtil", AuvStatusContant.idsTypeMap);
		} catch (Exception e) {
			log.error("checkConfirm error", e);
		}
		return "/train/train-book-check";
	}

	private void feiyong(TrainOrderModel orderModel) {
		Double ticketprice = 0.0;
		Double totalprice = 0.0;
		List<TrainOrderUsers> users = orderModel.getUsers();
		for (TrainOrderUsers user : users) {
			ticketprice += user.getAmount();
			totalprice += user.getTotalprice();
		}
		orderModel.getOrder().setTicketprice(ticketprice);
		orderModel.getOrder().setTotalprice(totalprice);
	}

	/**
	 * 创建火车票订单
	 *
	 * @param orderModel
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/createorder")
	@ResponseBody
	public AuvgoResult createOrder(TrainOrderModel orderModel) {
		try {
			if (!DateUtils.isBlongRange()) {
				return AuvgoResult.build(301, "每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
			}
			//验证重复提交
			if (!TokenUtils.validToken(request)) {
				return AuvgoResult.build(301, "请勿重复提交订单!");
			}
			orderModel = ModelSignature.decryptSign(orderModel.getSignature(), TrainOrderModel.class);
			// 查询的缓存
			CLResult cLResult = (CLResult) getSessionAttr("trainList");
			// 选中车次的缓存
			trainsDTO train = (trainsDTO) getSessionAttr("trainDto");
			CrmCompany crmCompany = getCompany();
			CrmEmployee loginUser = getUser();
			if (!("G".equals(train.getTrainNo().substring(0, 1)) || "C".equals(train.getTrainNo()))) {
				orderModel.getOrder().setChooseSeat("");
			}
			CrmJiesuan jiesuan = crmJiesuanService.getByCid(crmCompany.getId());
			orderModel.getOrder().setPayType(jiesuan.getFukuankemu());
			// 封装订单主表
			TrainOrder trainorder = buildOrder(orderModel, crmCompany, train);
			// 封装行程
			TrainOrderRoute orderroute = buildOrderRoute(cLResult.getQueryKey(), train, crmCompany.getId(),
					trainorder.getTravelTime());
			// 封装出行人
			orderModel = buildTrainUsers(orderModel, train, loginUser);

			//判断预存款余额
			if (FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
				List<TrainOrderUsers> users = orderModel.getUsers();
				AuvgoResult auvgoResult = prepayOrderBusiness.checkPrePayAccount(getCompany().getBianhao(), users.get(0).getTotalprice() * users.size());
				if (200 != auvgoResult.getStatus()) {
					return AuvgoResult.build(301, auvgoResult.getMsg());
				}
			}
			// 封装审批信息
			List<TrainOrderApprove> approveList = buildTrainApproves(orderModel, crmCompany.getId());
			orderModel.setOrder(trainorder);
			orderModel.setRoute(orderroute);
			// rderModel.setUsers(userList);
			orderModel.setApproves(approveList);
			// 判断票数是否小于人数
			// face设置默认为预付
			Map<String, Object> orderMap = trainOrderService.createTrainOrder(orderModel);
			List<String> orderNumbr = (List<String>) orderMap.get("orderNo");
			SysOutpushData push = sysOutdataService.getPushDataByOrderno(orderNumbr.get(0));
			SysOutpushData sysOutpushData = dealCasloginMsg(loginUser.getCompanyid(), orderNumbr.get(0), "train", push);
			if (null != sysOutpushData) {
				sysOutdataService.saveOrUpdate(sysOutpushData);
			}
			// 清空session数据
			// 清空车次
			removeSession("trainDto");
			// removeSession("train_query_con");// 清空查询条件
			// 清空查询车次列表
			removeSession("trainList");
			// 清空运行时间
			removeSession("chooseRoute");
			// 清空是否可以预定标示
			removeSession("booKFlag");
			// 清除 选择的车次信息
			removeSession("seatMap");
			CrmEmployee user = getUser();
			if (orderNumbr.size() == 1) {
				for (String orderno : orderNumbr) {
					TrainOrderLog orderLog = new TrainOrderLog(orderno, "创建订单", user.getId(), user.getName(),
							user.getDeptname(), new Date(), "创建订单成功" + orderno);
					orderLogService.saveOrUpdate(orderLog);
				}
				// return AuvgoResult.build(200, "您的订单提交成功" + orderNumbr.size()
				// + "个订单",orderNumbr);
				return AuvgoResult.build(200, "您的订单提交成功" + orderNumbr.size() + "个订单",
						"/train/success/" + orderNumbr.toString().substring(1, orderNumbr.toString().length() - 1));
			} else {
				TrainOrderLog orderLog = new TrainOrderLog(orderNumbr.get(0), "创建订单", user.getId(), user.getName(),
						user.getDeptname(), new Date(), "订单被拆分");
				orderLogService.saveOrUpdate(orderLog);
				return AuvgoResult.build(200, "您的订单被拆分成!",
						"/train/success/" + orderNumbr.toString().substring(1, orderNumbr.toString().length() - 1));
			}

		} catch (Exception e) {
			e.printStackTrace();
			log.error("createOrder fail data:{},error:{}", orderModel, e);
			return AuvgoResult.build(500, "创建订单失败!");
		}
	}

	@SuppressWarnings("unchecked")
	@RequestMapping("/saveaccount")
	@ResponseBody
	public AuvgoResult saveOrUpdateAccount(CrmEmpTraincount crmEmpTraincount) {
		try {
			String account = crmEmpTraincount.getAccount();
			String pass = crmEmpTraincount.getPass();
			CrmEmployee user = getUser();
			if (null == crmEmpTraincount || StringUtils.isBlank(account) || StringUtils.isBlank(pass))
				return AuvgoResult.build(300, "输入参数有误，请重新输入后提交");

			if (null == crmEmpTraincount.getId()) {
				crmEmpTraincount.setCompanyid(user.getCompanyid());
				crmEmpTraincount.setEmpid(user.getId());
				crmEmpTraincount.setCreatetime(new Date());
			}
			String result = cLTrainOrderService.check12306(account, pass, "0");
			Map<String, String> map = JsonUtils.jsonToPojo(result, Map.class);
			String msgCode = map.get("msgCode");
			if ("100".equals(msgCode)) {
				// 验证通过
				crmEmpTraincountService.saveOrUpdate(crmEmpTraincount);
				return AuvgoResult.build(200, "保存成功！", "保存成功！");
			} else {
				// 验证失败
				return AuvgoResult.build(300, map.get("msgInfo"));
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.error("/train/saveaccount --> error:{}", e);
			return AuvgoResult.build(300, "保存失败!");
		}
	}


	/**
	 * 解绑12306账号
	 *
	 * @return
	 */
	@RequestMapping("/removeaccount")
	@ResponseBody
	public AuvgoResult removeAccount() {
		CrmEmployee user = getUser();
		CrmEmpTraincount byCidAndEmpid = crmEmpTraincountService.getByCidAndEmpid(user.getCompanyid(), user.getId());
		if (null == byCidAndEmpid || null == byCidAndEmpid.getId()) {
			return AuvgoResult.build(300, "解绑失败！");
		}
		Integer i = crmEmpTraincountService.deleteById(byCidAndEmpid.getId());
		if (i > 0) {
			removeSession("account");
			return AuvgoResult.build(200, "解绑成功！");
		}
		return AuvgoResult.build(300, "解绑失败！");
	}

	/**
	 * 检验12306账号
	 *
	 * @param account 12306 账号
	 * @param pass    密码
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/check12306")
	@ResponseBody
	public AuvgoResult check12306(String account, String pass) {
		if (StringUtils.isBlank(account) || StringUtils.isBlank(pass)) {
			log.info("check12306 params have null --> account:{}, pass:{}", account, pass);
			return AuvgoResult.build(300, "用户名或密码为空!");
		}
		try {
			String check12306 = cLTrainOrderService.check12306(account, pass, "0");
			Map<String, String> maps = JsonUtils.jsonToPojo(check12306, Map.class);
			String msgCode = maps.get("msgCode");
			if ("100".equals(msgCode)) {
				return AuvgoResult.ok();
			} else {
				return AuvgoResult.build(300, "校验失败!");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(300, "校验异常!");
		}
	}

	@RequestMapping("/success/{orderno}")
	public String createSuccess(@PathVariable("orderno") String orderno) {
		String[] ordernos = orderno.split(",");
		List<TrainOrder> orderList = Lists.newArrayList();
		for (int i = 0; i < ordernos.length; i++) {
			TrainOrder trainOrder = trainOrderService.getOrderByorderNo(ordernos[i]);
			if (null == trainOrder) {
				setAttr("Msg", ordernos[i] + "：此订单不存在或错误！");
				return "/common/404";
			}
			orderList.add(trainOrder);
		}

		String name = "";
		for (TrainOrder trainOrder : orderList) {
			for (TrainOrderUsers user : trainOrder.getUsers()) {
				name += user.getUserName() + ",";
			}
		}
		TrainOrder trainOrder = orderList.get(0);
		setAttr("order", trainOrder);
		// 订单状态:0:已提交，未订座,1:订座成功,4订座失败,2:出票成功,3:已取消,5出票失败',
		if (trainOrder.getShowStatus() == AuvStatusContant.TRAIN_FACE_STATUS_HANDING) {
			setAttr("title", "订座中");
			setAttr("msg", "正在努力为您订座，请耐心等待");
		} else if (trainOrder.getStatus() == 1) {
			setAttr("title", "预订成功");
			List<TrainOrderUsers> users = trainOrder.getUsers();
			boolean flag = true;
			for (TrainOrderUsers trainOrderUsers : users) {
				if (trainOrderUsers.getSeatNo().equals("无座") && !trainOrderUsers.getSeatType().equals("无座")) {
					setAttr("msg", "您所预订的车次席别已售完，系统自动为您分配了无座!");
					flag = false;
					break;
				}
			}
			if (trainOrder.getApprovestatus() == 3) {
				if (flag) {
					setAttr("msg", "您选择的车次预订成功，系统正在为您订座，订座成功后请尽快完成支付！");
				}
			} else {
				if (flag) {
					setAttr("msg", "您选择的车次预订成功，系统已为您送审，请耐心等待！");
				}
			}
		} else if (trainOrder.getStatus() == 2) {
			setAttr("title", "出票成功");
		} else if (trainOrder.getStatus() == 3) {
			setAttr("title", "预订失败");
			if (null != trainOrder.getFailReason()) {
				setAttr("msg", "由于\"" + trainOrder.getFailReason() + "\"原因，导致订座失败，请继续预订！");
			}

		} else {
			AuvStatusContant auv = new AuvStatusContant();
			setAttr("title", auv.gettrainfaceStatus(trainOrder.getShowStatus()));
			setAttr("msg", trainOrder.getFailReason());
		}

		setAttr("names", StringUtils.removeEnd(name, ","));
		setAttr("route", orderList.get(0).getRoute());
		setAttr("ordernos", orderno);
		setAttr("orderNO", ordernos[0]);
		return "/train/train-book-success";
	}

	@SuppressWarnings({"unchecked"})
	protected List<TrainOrderApprove> buildTrainApproves(TrainOrderModel orderModel, Long companyId) throws Exception {
		Long approveId = orderModel.getOrder().getApproveid();
		List<TrainOrderUsers> users = orderModel.getUsers();
		TrainOrder trainOrder = orderModel.getOrder();
		if (null != approveId) {
			List<String> deptIdL = ConvertUtils.extractElementPropertyToList(users, "deptid");
			List<String> depths = Lists.newArrayList();
			for (int i = 0; i < deptIdL.size(); i++) {
				depths.add(String.valueOf(deptIdL.get(i)));
			}
			List<CrmApproveShenpiren> shenpirenList = approveService.getShenpirenAndSpecialByApproveId(
					trainOrder.getCompanyid(), approveId, trainOrder.getWeibeiflag().toString(), null, depths);
			List<TrainOrderApprove> approves = Lists.newArrayList();
			if (null != shenpirenList && shenpirenList.size() > 0) {
				for (CrmApproveShenpiren spr : shenpirenList) {
					CrmEmployee emp = employeeService.getById(companyId, spr.getEmployeeid());
					if (null != emp) {
						int i = 0;
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
						TrainOrderApprove approve = new TrainOrderApprove();
						approve.setDeptname(emp.getDeptname());
						BeanUtils.copyProperties(spr, approve);
						approve.setEmail(emp.getEmail());
						approve.setMobile(emp.getMobile());
						approve.setIsinert(spr.getIsinert());
						approve.setOpenid(String.valueOf(i));// 保存该审批人的审批习惯
						approve.setOpstatus(AuvStatusContant.COM_APPROVE_STATUS);
						approve.setStatus(AuvStatusContant.COM_APPROVE_STATUS);
						approve.setCreatetime(new Date());
						approves.add(approve);
					}
				}
			}
			orderModel.getOrder().setApprovestatus(AuvStatusContant.COM_APPROVE_STATUS);
			return approves;
		} else {
			orderModel.getOrder().setApproveid(0L);
			orderModel.getOrder().setApprovestatus(AuvStatusContant.COM_APPROVE_STATUS_NO);
		}
		return null;
	}


	protected TrainOrderModel buildTrainUsers(TrainOrderModel orderModel, trainsDTO train, CrmEmployee loginUser) {
		Long companyid = loginUser.getCompanyid();
		CrmFuwufei fuwuFei = crmCompanyService.getComanyFuwufei(loginUser.getCompanyid());
		List<TrainOrderUsers> list = orderModel.getUsers();
		// 12306账号
		CrmEmpTraincount account = (CrmEmpTraincount) getSessionAttr("account");
		// 拿到缓存的选中数据
		seatDTO seatDto = (seatDTO) getSessionAttr("chooseRoute");
		double price = seatDto.getPrice();// 拿到价格
		int index = 1;
		// 区分常用联系人和企业员工
		// 1企业员工，0临时联系人
		boolean flag = false;
		for (TrainOrderUsers user : list) {
			String email = user.getEmail();
			CrmEmployee emp = employeeService.getById(companyid, user.getUserId());
			CrmEmployeeCert cert = crmEmployeeCertService.getCertByEmpidAndCertType(user.getIdsType(),user.getUserId());
			BeanUtils.copyProperties(emp, user);
			// 是否是vip
			user.setIfvip(null != emp.getIfvip() && 1 == emp.getIfvip().intValue() ? 1 : 0);
			if (null != emp.getIfvip() && 1 == emp.getIfvip().intValue()) {
				flag = true;
			}
			user.setUserPhone(emp.getMobile());
			user.setUserName(cert.getUsername());
			user.setUserId(emp.getId());
			user.setShowCode(orderModel.getOrder().getShowCode());
			user.setIdsType(cert.getCerttype());
			user.setUserIds(cert.getCertificate());
			if (StringUtils.isNotBlank(email)) {
				user.setEmail(email);
			}
			// 获取到座位席别
			user.setSeatCode(seatDto.getSeatType());
			// 1成人票 2儿童票
			user.setTicketType(1);
			user.setSeatClass(seatDto.getSeatClass());// 座位类型
			// 设置12306账号
			if (null != account) {
				user.setAccountName(account.getAccount());
				user.setAccountPwd(account.getPass());
			}
			// 设置特殊席别
			user.setSeatType(seatDto.getSeatName());
			user.setStatus(0);
			user.setCreatetime(new Date());
			// 设置保险费用
			String baoxian = orderModel.getBaoxian();
			if (StringUtils.isNotBlank(baoxian)) {
				DataBaoxian dataBaoxian = dataBaoxianService.getByCode(baoxian);
				if (null != dataBaoxian) {
					user.setBxCode(dataBaoxian.getCode());
					user.setBxName(dataBaoxian.getName());
					user.setBxPayMoney(dataBaoxian.getSalePrice());
				}
			} else {
				user.setBxPayMoney(0.0);
			}
			// 采购票服务费,暂1元
			user.setTicketCharges(AuvStatusContant.Interface_fei);
			user.setSort(index);
			// 计算服务费
			if ("order".equals(fuwuFei.getTraintype())) {
				// 坐席待定费
				user.setFuwufei(Double.valueOf(fuwuFei.getTrainweb()));
			} else if ("per".equals(fuwuFei.getTraintype())) {
				// 按订单百分比 收取
				if ("1".equals(fuwuFei.getTrainpertype())) {
					DecimalFormat df = new DecimalFormat("#.0");
					user.setFuwufei(Double.valueOf(df.format((price + user.getBxPayMoney()) * Double.valueOf("".equals(fuwuFei.getTrainper()) ? "0" : fuwuFei.getTrainper()) / 100D)));
				} else {
					user.setFuwufei(0d);
				}
			}
			// 乘客所需要付钱:票价+保险+服务费
			user.setTotalprice(user.getFuwufei() + price + user.getBxPayMoney());
			// 票价
			user.setAmount(price);
			index++;
		}
		orderModel.getOrder().setIfvip(flag ? 1 : 0);
		return orderModel;
	}

	/**
	 * 封装火车票行程信息
	 *
	 * @return
	 * @throws ParseException
	 */
	protected TrainOrderRoute buildOrderRoute(String queryKey, trainsDTO train, Long companyId, String travalTime)
			throws ParseException {
		log.info("拿到缓存的数据-->trainsDTO:{}", JsonUtils.objectToJson(train));
		TrainOrderRoute orderRoute = new TrainOrderRoute();
		orderRoute.setCompanyid(companyId);
		orderRoute.setFromStation(train.getFromStation());
		orderRoute.setQueryKey(queryKey);
		// 列车出发时间
		orderRoute.setFromTime(train.getFromTime());
		// 列车到达站点名称
		orderRoute.setArriveStation(train.getToStation());
		// 到达时间
		orderRoute.setArriveTime(train.getToTime());
		// 列车运行耗时
		orderRoute.setCosttime(Integer.valueOf(train.getRunTimeSpan()));
		orderRoute.setTrainCode(train.getTrainNo());
		orderRoute.setArriveStationCode(train.getToStationCode());
		orderRoute.setFromStationCode(train.getFromStationCode());
		orderRoute.setCreatetime(new Date());
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
		SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
		// 列车出发日期
		orderRoute.setTravelTime(travalTime);
		String time = travalTime + " " + train.getFromTime();
		Date parse = sdf.parse(time);// 出发日期
		Date arriveDay = DateUtils.changeTime(parse, "MINUTE", Integer.parseInt(train.getRunTimeSpan()));
		String arrive = DateUtil.getDateStrByParam("yyyy-MM-dd", arriveDay);
		// long arriveday =
		// DateUtil.getDifferenceBetweenDay(sdf1.parse(travalTime),sdf1.parse(arrive));
		orderRoute.setArriveDays(DateUtil.getDifferenceBetweenDay(sdf1.parse(time), sdf1.parse(arrive)) + "");
		orderRoute.setArrivalTime(sdf.format(arriveDay));
		orderRoute.setRunTime(getHour(train.getRunTimeSpan()));// 将分钟转换为时间
		// yyyy-MM-dd
		// HH:mm
		return orderRoute;
	}

	/**
	 * 封装订单数据
	 *
	 * @param orderModel
	 * @param company
	 * @param train
	 * @return
	 */
	protected TrainOrder buildOrder(TrainOrderModel orderModel, CrmCompany company, trainsDTO train) {
		TrainOrder trainOrder = orderModel.getOrder();
		trainOrder.setCompanyid(company.getId());
		trainOrder.setCompanyname(company.getName());
		trainOrder.setCompanycode(company.getBianhao());
		// 获取到当前登录的用户
		CrmEmployee account = getUser();
		trainOrder.setBookUserId(account.getId());
		trainOrder.setBookUserName(account.getName());
		// 保存查询条件
		TrainQueryModel param = (TrainQueryModel) getSessionAttr("train_query_con");
		trainOrder.setFromcitycode(param.getFrom());
		trainOrder.setFromcityname(param.getFromName());
		trainOrder.setArrivecitycode(param.getArrive());
		trainOrder.setArrivecityname(param.getArriveName());
		trainOrder.setOrderType("ow");
		trainOrder.setSupplier(AuvStatusContant.SUPPLIERS_CL);// 加入新的标识
		String baoxian = String.valueOf(orderModel.getBaoxian());
		// 表示购买保险了
		if (StringUtils.isNotBlank(baoxian) && !"0".equals(baoxian)) {
			trainOrder.setOrderLevel("1");
		} else {
			trainOrder.setOrderLevel("0");
		}
		// '0 坐席订单,1 前台白屏订单,2ios 3 安卓'wqq
		trainOrder.setOrderFrom(1);
		trainOrder.setStatus(0);
		trainOrder.setCreatetime(new Date());
		trainOrder.setTravelTime(
				param.getStartDate());// 2018-01-04
		// 10:11 wqq
		return trainOrder;
	}

	//火车票重复订单

	/**
	 * 火车票重复订单
	 * 接口：/train/checksimple
	 *
	 * @param ids         1939-1949
	 * @param fromTime    03:22  出发时间
	 * @param travelTime  20180809 出发日期
	 * @param arriveTime  03:33 到达时间
	 * @param runTimeSpan 357  运行时长
	 * @return
	 */
	@RequestMapping("/checksimple")
	@ResponseBody
	public AuvgoResult checkSimple(String ids, String fromTime, String travelTime, String arriveTime, String runTimeSpan) {
		if (StringUtils.isBlank(ids) || StringUtils.isBlank(fromTime) || StringUtils.isBlank(travelTime) || StringUtils.isBlank(arriveTime) || StringUtils.isBlank(runTimeSpan)) {
			return AuvgoResult.build(200, "数据发生异常");
		}
		String[] empids = StringUtils.removeEnd(ids, "-").split("-");
		StringBuffer sb = new StringBuffer();
		String travelDate = sb.append(travelTime.substring(0, 4)).append("-").append(travelTime.substring(4, 6)).append("-").append(travelTime.substring(6)).toString();
		String arrivalTime = CountArrivalTime(fromTime, travelDate, arriveTime, runTimeSpan);
		String result = trainOrderService.checkSimilarOrder(empids, travelDate, fromTime,arrivalTime, arriveTime);
		if (StringUtils.isBlank(result)) {
			return AuvgoResult.build(200, "success");
		} else {
			return AuvgoResult.build(201, "存在相似订单", result);
		}
	}


	private String CountArrivalTime(String fromTime, String travelDate, String arriveTime, String runTimeSpan) {
		//开车时间分钟数
		String[] fromtime = fromTime.split(":");
		if (fromtime.length >= 2) {
			int fromMinute = Integer.valueOf(fromtime[0]) * 60 + Integer.valueOf(fromtime[1]);
			int day = (fromMinute + Integer.valueOf(runTimeSpan)) / (24 * 60);
			String arriveDate = (day > 0 ? DateUtil.convertLongToString(DateUtil.addDate(DateUtil.getDateFormat(travelDate), day).getTime() / 1000, "yyyy-MM-dd") : travelDate);
			return arriveDate;
		}
		return "";
	}


	//填写页面跳列表页面
	@RequestMapping("/Returnlist")
	public String ReturnList(){
		TrainQueryModel query = (TrainQueryModel)getSessionAttr("train_query_con");
		setAttr("query", JsonUtils.objectToJson(query));
		return "/train/train-query-list";
	}
}