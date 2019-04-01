package com.auvgo.web.face.train;

import com.auvgo.business.pay.order.PrepayOrderBusiness;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.number.Numbers;
import com.auvgo.core.utils.*;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.train.api.TrainGaiqianOrderService;
import com.auvgo.train.api.TrainOrderLogService;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.*;
import com.auvgo.traincl.api.dto.entity.CLResult;
import com.auvgo.traincl.api.dto.entity.seat.seatDTO;
import com.auvgo.traincl.api.dto.entity.trainsDTO;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.TrainGqQueryModel;
import com.google.common.collect.Lists;
import org.apache.commons.beanutils.BeanUtilsBean2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/train/gaiqian")
public class TrainGaiqianController extends BaseController {
	@Autowired
	private TrainOrderService orderService;
	@Autowired
	private TrainOrderLogService orderLogService;
	@Autowired
	private CrmEmployeeService employeeService;
	@Autowired
	private TrainGaiqianOrderService gaiqianOrderService;
	@Autowired
	private SysOutpushDataService sysOutdataService;
	@Autowired(required = false)
	private PrepayOrderBusiness prepayOrderBusiness;


	/**
	 * 改签查询车次
	 *
	 * @param orderno   本地订单号
	 * @param empIds    员工id
	 * @param queryDate 改签时间
	 * @return
	 */
	@RequestMapping("/query")
	public String gaiQianQuery(String orderno, String empIds, String queryDate, String id) {
		TrainGqQueryModel query = new TrainGqQueryModel();
		if (StringUtils.isBlank(orderno) || StringUtils.isBlank(empIds) || StringUtils.isBlank(queryDate)) {
			setAttr("Msg", "查询参数不能为空！");
			return "/common/404";
		}
		try {
			TrainOrder order = orderService.getOrderByorderNo(orderno);
			TrainOrderRoute route = order.getRoute();
			query.setFrom(route.getFromStationCode());
			query.setFromName(route.getFromStation());
			query.setArrive(route.getArriveStationCode());
			query.setArriveName(route.getArriveStation());
			query.setStartDate(queryDate);
			query.setId(id);//对临客进行处理
			String levels = "";
			String[] ids = StringUtils.removeEnd(empIds, "-").split("-");
			for (String empid : ids) {
				CrmEmployee employee = employeeService.getById(order.getCompanyid(), Long.valueOf(empid));
				if (null == employee) {
					CrmEmployee user = getUser();
					CrmEmployee crmEmployee = employeeService.getById(user.getCompanyid(), user.getId());
					levels += crmEmployee.getZhiwei() + "/";
				} else {
					levels += employee.getZhiwei() + "/";
				}
			}

			query.setEmpIds(empIds);
			query.setLevels(levels);
			setAttr("train_gaiqian_query", query);// 保存查询条件
			setAttr("zOrderno", orderno);// 主订单号
			return "crm/my-chailv/train/train-apply-query-list";
		} catch (Exception e) {
			e.printStackTrace();
			log.info("/train/gaiqian/query-->error:{}", e);
			setAttr("Msg", "查询改签出现失败!");
			return "/common/404";
		}

	}


	/**
	 * 改签预定
	 *
	 * @param empIds    员工id（100/101/102）
	 * @param trainCode
	 * @param seatCode
	 * @param orderno
	 * @return
	 */
	@RequestMapping("/book/{empIds}/{trainCode}/{seatCode}/{queryDate}/{orderno}/{Ids}")
	public String book(@PathVariable("empIds") String empIds, @PathVariable("trainCode") String trainCode,
					   @PathVariable("seatCode") String seatCode, @PathVariable("queryDate") String queryDate, @PathVariable("orderno") String orderno, @PathVariable("Ids") String Ids) {
		try {
			CrmEmployee user = getUser();
			if (null == user || StringUtils.isBlank(empIds) || StringUtils.isBlank(trainCode)
					|| StringUtils.isBlank(orderno) || StringUtils.isBlank(seatCode)
					|| StringUtils.isBlank(queryDate)) {
				setAttr("Msg", "参数不能为空！");
				return "/common/404";
			}
//			TrainOrderUsers userByorderNoAndUserId = orderService.getUserByorderNoAndUserId(orderno, id);
//			String[] empArray = StringUtils.removeEnd(empIds, "-").split("-");
			List<TrainOrderUsers> empList = Lists.newArrayList();
			String[] IdsArray = StringUtils.removeEnd(Ids, "-").split("-");
//			for (String empid : empArray) {
//				empList.add(employeeService.getById(user.getCompanyid(), Long.valueOf(empid)));
//			}
			//直接从原单中获取改签乘客
			for (String id : IdsArray) {
				empList.add(orderService.getUserByordernoAndId(id));
			}
			setAttr("name", ConvertUtils.extractElementPropertyToString(empList, "userName", "、"));

			CLResult query = (CLResult) getSessionAttr("trainList");// 查询的缓存
			if (null == query) {
				setAttr("Msg", "查询已过期，请您重新改签查询！");
				return "/train/train-query-list";
			}
			trainsDTO train = query.getChooseTrainNo(query.trains, trainCode);
			Map<String, Object> seatMap = query.getCanBuySeat(train);
			Object choose = seatMap.get(seatCode);
			if (null == choose) {
				if ("1".equals(seatCode)) {
					choose = seatMap.get("12");//硬座无座
				} else if ("O".equalsIgnoreCase(seatCode)) {
					choose = seatMap.get("10");//高铁无座
				}
			}
			seatDTO seatdto = new seatDTO();
			BeanUtilsBean2.getInstance().copyProperties(seatdto, choose);
			Double charges = Numbers.round(orderService.getOrderByorderNo(orderno).getTotalprice() - (seatdto.getPrice() * empList.size()), 2);
			setAttr("seatName", seatdto.getSeatName());
			setAttr("charges", charges);
			setAttr("train", train);
			setAttr("gseatCode", seatCode);
			setAttr("gqueryDate", queryDate);
			setAttr("gempIds", empIds);
			setAttr("zorderno", orderno);
			setAttr("arrivateDate", DateUtils.changeTime(DateUtils.parseDate(queryDate, "yyy-MM-dd"), "DAY", train.getArrivalDays()));
			return "/crm/my-chailv/train/train-endorse-submit";
		} catch (Exception e) {
			e.printStackTrace();
			setAttr("Msg", "改签出现异常！");
			return "/common/404";
		}
	}

	@RequestMapping("/check/{empIds}/{trainCode}/{seatCode}/{queryDate}/{orderno}/{Ids}")
	@ResponseBody
	public AuvgoResult checkGaiqian(@PathVariable("empIds") String empIds, @PathVariable("trainCode") String trainCode,
									@PathVariable("seatCode") String seatCode, @PathVariable("queryDate") String queryDate, @PathVariable("orderno") String orderno, @PathVariable("Ids") String Ids) {
		try {
			if (StringUtils.isBlank(trainCode) || StringUtils.isBlank(seatCode)) {
				return AuvgoResult.build(300, "车次信息有误，请重新查询!");
			}
			// 获取查询车次的内容
			CLResult trains = (CLResult) getSessionAttr("trainList");
			if (null == trains) {
				setAttr("msg", "查询车次已过期，请重新查询!");
				return AuvgoResult.build(300, "查询条件过期!");
			}
			trainsDTO train = trains.getChooseTrainNo(trains.getTrains(), trainCode);

			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			long facheTime = sdf.parse(queryDate + " " + train.getFromTime()).getTime();
			long currentTime = System.currentTimeMillis();
			long hour = facheTime - currentTime;
			long halfHour = 36 * 60 * 1000l;
			long oneHourHalf = 120 * 60 * 1000l;
			// 开车前30分钟
			if (0 < hour && halfHour > hour) {
				return AuvgoResult.build(300,
						"每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
			}
			//过了发车时间
			if (0 > hour) {
				return AuvgoResult.build(300,
						"该车次已发车，已停止网络预订。如急需购票，可持有效证件去车站售票窗口办理!");
			}
			// 2小时-30分钟的车次
			if (hour >= halfHour && hour <= oneHourHalf) {
				return AuvgoResult
						.build(200,
								"您选择的车次距开车时间很近了，请确保有足够的时间抵达车站，并办理换取纸质车票、安全检查、实名制验证及检票等手续，以免耽误您的旅行!",
								"/train/gaiqian/book/" + empIds + "/" + trainCode + "/" + seatCode + "/" + queryDate + "/" + orderno + "/" + Ids);
			}
			return AuvgoResult.build(200, "", "/train/gaiqian/book/" + empIds + "/" + trainCode + "/" + seatCode + "/" + queryDate + "/" + orderno + "/" + Ids);

		} catch (Exception e) {
			e.printStackTrace();
			log.warn("trainCode:{},seatCode:{},Exception:{}", trainCode, seatCode, e);
			return AuvgoResult.build(300, "查询出现异常，请您重新查询预订!");
		}
	}

	/**
	 * 创建改签订单
	 *
	 * @param orderno       原订单号
	 * @param usersId       改签人ids
	 * @param trainCode     车次
	 * @param gaiqianTime   改签时间
	 * @param gaiqianReason 改签原因
	 * @param seatCode      席别
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/shenqing/{orderno}")
	@ResponseBody
	public AuvgoResult createGaiQianOrder(@PathVariable("orderno") String orderno, String usersId, String trainCode, String gaiqianTime,
										  String gaiqianReason, String seatCode) {
		try {
			if (!DateUtils.isBlongRange()) {
				return AuvgoResult.build(300, "温馨提示：每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
			}
			if (StringUtils.isBlank(usersId)) {
				return AuvgoResult.build(200, "请选择要申请改签的乘车人");
			}
			CLResult query = (CLResult) getSessionAttr("trainList");//查询的缓存
			trainsDTO train = query.getChooseTrainNo(query.trains, trainCode);
			if (null == train) {
				return AuvgoResult.build(200, "查询数据过期，请重新查询");
			}
			Map<String, Object> seatMap = query.getCanBuySeat(train);
			Object choose = seatMap.get(seatCode);
			if (null == choose) {
				if ("1".equals(seatCode)) {
					choose = seatMap.get("12");//硬座无座
				} else if ("O".equalsIgnoreCase(seatCode)) {
					choose = seatMap.get("10");//高铁无座
				}
			}
			String seatClass = train.getSeatClass(choose);
			seatDTO seatdto = new seatDTO();
			BeanUtilsBean2.getInstance().copyProperties(seatdto, choose);
			seatdto.setSeatClass(seatClass);//设置座位类型
			//让张浩不要拼接无座状态码
			String[] usersIds = StringUtils.removeEnd(usersId, "-").split("-");
			if (usersIds.length > 1) {//多人批量改签
				for (String userid : usersIds) {
					TrainOrderUsers orderUser = orderService.getUserByorderNoAndUserId(orderno, userid);
					if (Lists.newArrayList("6", "4", "3").contains(orderUser.getSeatCode())) {
						return AuvgoResult.build(300, "您不能多人同时改签卧铺车票，请一次改签一人的卧铺车票。");
					}
					if (Lists.newArrayList("6", "4", "3").contains(seatCode)) {
						return AuvgoResult.build(300, "您选择的车票不能和其他卧铺车票同时改签，请一次改签一张卧铺车票。");
					}
				}
			}
			// 封装改签的行程信息
			TrainGaiqianRoute gaiQianRoute = buildGaiQianRoute(orderno, train, gaiqianTime, query.getQueryKey());
			CrmEmployee user = getUser();
			Integer orderForm = 1;// 表示来自电脑白屏
			List<TrainGaiqianUsers> userList = Lists.newArrayList();
			for (String empid : usersIds) {
				if (StringUtils.isNotBlank(empid)) {
					TrainOrder order = orderService.getOrderByorderNo(orderno);
					List<TrainOrderUsers> users = order.getUsers();
					for (TrainOrderUsers orderUser : users) {
						if (orderUser.getUserId().longValue() == Long.valueOf(empid).longValue()) {
							if (orderUser.getGaiqianstatus() == 1) {
								return AuvgoResult.build(300, orderUser.getUserName() + "已经申请改签中,请勿重复提交!");
							}
							if (orderUser.getGaiqianstatus() == 3) {
								return AuvgoResult.build(300, orderUser.getUserName() + "用户改签成功,请勿提交!");
							}
							TrainGaiqianUsers gaiqianUser = buildGaiQianUser(orderUser, seatCode, seatdto);
							userList.add(gaiqianUser);
							break;
						}
					}
				}
			}
			String str = gaiqianOrderService.buildNewGaiQianOrder(userList, gaiQianRoute, gaiqianReason, user.getName(), user.getId(),
					orderForm);
			Map<String, Object> map = JsonUtils.jsonToPojo(str, Map.class);
			log.info("crateGaiqianOrder response-->{}", str);
			TrainOrderLog orderLog = new TrainOrderLog(orderno, "申请改签", user.getId(), user.getName(), user.getDeptname(), new Date(), user.getName()
					+ "申请了改签业务");
			orderLogService.saveOrUpdate(orderLog);
			String ordernos = String.valueOf(map.get("data"));
			SysOutpushData push = sysOutdataService.getPushDataByOrderno(orderno);
			SysOutpushData sysOutpushData = dealCasloginMsg(user.getCompanyid(), ordernos.split(",")[0], "traingq", push);
			if (null != sysOutpushData) {
				sysOutdataService.saveOrUpdate(sysOutpushData);
			}
			return AuvgoResult.build(ErrorCode.SUCCESS, "提交改签成功", "/train/gaiqian/success/" + ordernos.split(",")[0]);
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(300, "申请改签失败!!");
		}
	}

	private TrainGaiqianUsers buildGaiQianUser(TrainOrderUsers orderuser, String seatcode, seatDTO seatdto) {
		TrainGaiqianUsers gaiUser = new TrainGaiqianUsers();
		gaiUser.setCompanyid(orderuser.getCompanyid());
		gaiUser.setUserName(orderuser.getUserName());
		gaiUser.setUserPhone(orderuser.getUserPhone());
		gaiUser.setUserIds(orderuser.getUserIds());
		gaiUser.setFuwufei(0);// 改签不收取客户服务费用
		if (0L == orderuser.getUserId()) {
			gaiUser.setDeptid("");
		} else {
			gaiUser.setDeptid(orderuser.getDeptid().toString());
		}
		gaiUser.setDeptname(orderuser.getDeptname());
		gaiUser.setSeatCode(seatcode);//设置选择的座位代码
		gaiUser.setAccountName(orderuser.getAccountName());
		gaiUser.setOdAmount(orderuser.getAmount());//改签前的票价
		gaiUser.setAccountPwd(orderuser.getAccountPwd());
		gaiUser.setTicketCharges(AuvStatusContant.Interface_fei);// 订票信息费,仅作成本计算
		gaiUser.setOldPiaohao(orderuser.getPiaohao());// 设置原来的票号
		gaiUser.setSeatType(seatdto.getSeatName());
		gaiUser.setSeatClass(seatdto.getSeatClass());
		gaiUser.setAmount(seatdto.getPrice());
		gaiUser.setUsersId(orderuser.getUserId());//员工id
		gaiUser.setTicketType(orderuser.getTicketType());
		gaiUser.setBxPayMoney(orderuser.getBxPayMoney());//原订单有保险,改签默认续上保险
		gaiUser.setPassengerId(orderuser.getPassengerId());//封装参数
		gaiUser.setIdsType(orderuser.getIdsType());
		gaiUser.setEmail(orderuser.getEmail());//邮箱
		gaiUser.setTotalprice(orderuser.getBxPayMoney() + gaiUser.getAmount() + gaiUser.getFuwufei());// 改签的时候暂定不收取服务费
		return gaiUser;
	}

	private TrainGaiqianRoute buildGaiQianRoute(String orderno, trainsDTO train, String gaiqianTime, String queryKey) {
		try {
			TrainGaiqianRoute gaiqianRoute = new TrainGaiqianRoute();
			gaiqianRoute.setOldOrderno(orderno);
			SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			String time = gaiqianTime + " " + train.getFromTime();
			Date parse = sdf.parse(time);//出发日期
			Date arriveDay = DateUtils.changeTime(parse, "MINUTE", Integer.parseInt(train.getRunTimeSpan()));
			String arrive = DateUtil.getDateStrByParam("yyyy-MM-dd", arriveDay);
			gaiqianRoute.setArriveDays(DateUtil.getDifferenceBetweenDay(sdf1.parse(time), sdf1.parse(arrive)) + "");
			gaiqianRoute.setArriveStation(train.getToStation());
			gaiqianRoute.setArriveStationCode(train.getToStationCode());
			gaiqianRoute.setFromStation(train.getFromStation());
			gaiqianRoute.setFromStationCode(train.getFromStationCode());
			gaiqianRoute.setCosttime(train.getRunTimeSpan());
			gaiqianRoute.setFromTime(train.getFromTime());
			gaiqianRoute.setArriveTime(train.getToTime());
			gaiqianRoute.setTrainCode(train.getTrainNo());
//			gaiqianRoute.setTrainNo(train.getTrain_no());
			gaiqianRoute.setTravelTime(gaiqianTime);// 列车出发时间
			gaiqianRoute.setRunTime(getHour(train.getRunTimeSpan()));
			gaiqianRoute.setCreatetime(new Date());
			gaiqianRoute.setQueryKey(queryKey);//加入查询的key
			return gaiqianRoute;
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("改签保存行程信息异常----->{}", e.toString());
		}
		return null;
	}

	//获取运行时间
	private String getHour(String time) {
		if (IsNumberUtils.isNumeric(time)) {
			int Spanminus = Integer.parseInt(time);
			int minu = Spanminus % 60;//分钟
			int hour = Spanminus / 60;
			return hour + "时" + minu + "分";
		}
		return null;
	}

	/**
	 * 取消改签
	 *
	 * @param gqOrderno
	 * @return
	 */
	@RequestMapping("/cancel/{gqOrderno}")
	@ResponseBody
	public AuvgoResult cancleGaiqian(@PathVariable("gqOrderno") String gqOrderno) {
		gaiqianOrderService.cancleGaiqian(gqOrderno);
		return AuvgoResult.ok();
	}

	/**
	 * 提交订单成功提示
	 *
	 * @return
	 */
	@RequestMapping("/success/{ordernos}")
	public String createSuccess(@PathVariable("ordernos") String ordernos) {
		setAttr("orderno", ordernos);
		setAttr("title", "火车票-申请改签-成功");
		setAttr("titleFlag", "订座中");
		setAttr("contentFlag", "改签已提交，请耐心等待改签处理；实际改签结果以12306为准");
		return "/crm/my-chailv/train/train-apply-success";
	}


	/**
	 * 确认改签
	 *
	 * @param gqorderno
	 * @return
	 */
	@RequestMapping("/confirmGaiqian")
	@ResponseBody
	public AuvgoResult confirmGaiqian(String gqorderno) {
		try {
			if (StringUtils.isBlank(gqorderno)) {
				return AuvgoResult.build(300, " 订单号不能为空！");
			}
			TrainGaiqianOrder gaiqianOrder = gaiqianOrderService.getOrderByorderNo(gqorderno);
			if (FenxiaostatusContant.isPrePayCompany(gaiqianOrder.getServerNo())) {
				AuvgoResult auvgoResult = prepayOrderBusiness.checkPrePayAccount(gaiqianOrder.getCompanycode(), gaiqianOrder.getGaiBumoney());
				if (200 != auvgoResult.getStatus()) {
					return auvgoResult;
				}
			}
			Integer status = gaiqianOrder.getStatus();
			if (AuvStatusContant.TRAIN_GAIQIAN_GAISHIBAI == status || AuvStatusContant.TRAIN_GAIQIAN_QUXIAO == status || AuvStatusContant.TRAIN_GAIQIAN_YIGAIQIAN == status) {
				return AuvgoResult.build(300, " 此订单改签失败，不能确认改签！");
			}
			String oOrderno = gaiqianOrder.getOOrderno();
			if (StringUtils.isBlank(oOrderno)) {
				return AuvgoResult.build(300, " 原订单不存在了，请异常取消吧！");
			}
			gaiqianOrderService.confirmGaiqian(gqorderno);
			return AuvgoResult.build(200, "确认改签已提交,请等待");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "改签提交失败,请稍后重试");
	}

}
