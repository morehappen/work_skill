package com.auvgo.web.face.common;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.air.api.AirGaiQianService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.AirGaiqian;
import com.auvgo.air.entity.AirGaiqianPassenger;
import com.auvgo.air.entity.AirGaiqianRoute;
import com.auvgo.air.entity.AirOrder;
import com.auvgo.air.entity.AirOrderRoute;
import com.auvgo.air.entity.AirOrderRoutePass;
import com.auvgo.business.hotel.order.IHotelOrderBusiness;
import com.auvgo.constants.approve.ApprovalMsgModule;
import com.auvgo.constants.approve.ApprovalType;
import com.auvgo.core.contant.TaxiAirPortStatusContant;
import com.auvgo.core.number.Numbers;
import com.auvgo.core.utils.AESUtil;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.ConvertUtils;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.ProConfUtil;
import com.auvgo.crm.api.CrmAppformService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmAppform;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.hotel.api.HotelOrderService;
import com.auvgo.hotel.entity.HotelOrder;
import com.auvgo.hotel.entity.HotelOrderUsers;
import com.auvgo.hotel.order.api.dto.res.OrderApproOperationRes;
import com.auvgo.taxi.api.dto.entity.Airport;
import com.auvgo.taxi.api.dto.entity.TaxiOrderModel;
import com.auvgo.taxi.api.ws.ITaxiApproveWSService;
import com.auvgo.taxi.api.ws.ITaxiOrderWSService;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.TrainOrder;
import com.auvgo.train.entity.TrainOrderRoute;
import com.auvgo.web.face.BaseController;

@RequestMapping("/common")
@Controller
public class CommonControler extends BaseController {

	@Autowired
	AirOrderService airOrderService;
	@Autowired
	TrainOrderService trainOrderService;
	@Autowired
	HotelOrderService hotelOrderService;
	@Autowired
	CrmAppformService appformService;
	@Autowired
	AirGaiQianService airGaiQianService;
	@Autowired(required=false)
	private ITaxiOrderWSService taxiOrderWSService;
	@Autowired(required=false)
	private ITaxiApproveWSService taxiApproveWSService;
	/** 酒店订单 **/
	@Autowired(required=false)
	private IHotelOrderBusiness hotelOrderBusiness;
	@Autowired
	private CrmProductSetService productSetService;
	/**
	 * 查询首页
	 * 
	 * @return
	 */
	@RequestMapping("/index/{flag}")
	public String toTrainIndex(@PathVariable("flag") String flag) {
		if ("air".equals(flag)) {
			CrmEmployee user = getUser();
			if(null == user){
				setAttr("Msg","登录人 数据异常 ");
			}
			CrmProductSet productSet = productSetService.getByCid(user.getCompanyid());
			String proconfvalue = productSet.getProconfvalue();
			setAttr("flags",ProConfUtil.getValue(proconfvalue, "gwprice"));
			return "/common/index-air";
		}
		if ("train".equals(flag)) {
			Date date = DateUtil.addOrMinusMin(new Date(), 40);
			Calendar cal = Calendar.getInstance();
			cal.setTime(date);
			setAttr("yudingTime", cal.get(Calendar.HOUR_OF_DAY) + "点" + cal.get(Calendar.MINUTE) + "分");
			return "/common/index-train";
		}
		if("hotel".equals(flag)){
			return "/common/index-hotel";
		}

		setAttr("Msg", "没有您查询的页面！");
		return "/common/404";
	}

	@RequestMapping("/mailApprove")
	public String mailApproveSave(@RequestParam("code") String code) {
		if (StringUtils.isBlank(code)) {
			setAttr("failMsg", "没有找到该订单的信息");
			return "/common/500";
		}
		AirOrder airOrder = null;
		TrainOrder trainOrder = null;
		HotelOrder hotelOrder = null;
		CrmAppform appformOrder = null;
		AirGaiqian airGaiqian = null;
		TaxiOrderModel taxiOrder = null;
		try {
			String str = AESUtil.AESDncode(code, AESUtil.keyword);// AES密钥对称解密
			String[] split = str.split("/");
			String type = split[0];// 业务类型
			String orderno = split[1];// 订单号;
			String empid = split[2];// 审批人id
			String companyid = split[3];// 公司id
			String times = split[4];// 时间戳
			Boolean flag = getDatePoor(times);
			// Boolean flag = true;
			String token = UUID.randomUUID().toString();
			setAttr("token", token);
			setSessionAttr("tokenkey", token);
			setAttr("empid", empid);
			setAttr("cid", companyid);
			setAttr("orderno", orderno);
			// TODO 为了测试,此处做了修改
			if (!flag) {
				setAttr("failMsg", "审批已过时,请联系客服,或者通过app登录审批");
				return "/common/500";
			}
			switch (type) {
			case "air":
				airOrder = airOrderService.getOrderByorderNo(orderno);
				break;
			case "train":
				trainOrder = trainOrderService.getOrderByorderNo(orderno);
				break;
			case "appform":
				appformOrder = appformService.findByApprovalNo(Long.valueOf(companyid), orderno);
				break;
			case "hotel":
				hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
				break;
			case "airgq":
				airGaiqian = airGaiQianService.getGaiqianByGqOrderNo(orderno);
				break;
			case "taxi":
				taxiOrder = taxiOrderWSService.getByOrderno(orderno);
				break;
			default:
				break;
			}
			if (null != airOrder) {
				if (airOrder.getApprovestatus() == 1 || airOrder.getApprovestatus() == 3) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				AirOrderRoute airOrderRoute = airOrder.getRoutes().get(0);
				List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
				String passengernames = ConvertUtils.extractElementPropertyToString(airOrder.getPassengers(), "name", "、");
				AirOrderRoute route = airOrder.getRoutes().get(0);
				String fromDate = DateUtil.getDateStrByParam("yyyy-MM-dd", DateUtil.getDateTimeFormat(route.getDeptdate(), "yyyy-MM-dd")) + " " + route.getDepttime();
				String arriveDate = DateUtil.getDateStrByParam("yyyy-MM-dd", DateUtil.getDateTimeFormat(route.getArridate(), "yyyy-MM-dd")) + " " + route.getArritime();
				setAttr("fromDate", fromDate);
				setAttr("arriveDate", arriveDate);
				setAttr("type", "air");
				setAttr("username", passengernames);
				setAttr("orderRoute", airOrderRoute);
				setAttr("routePass", routePass);
				setAttr("airOrder", airOrder);
				Date createtime = airOrder.getCreatetime();
				long time = 30*60*1000;//30分钟
				Date afterDate = new Date(createtime.getTime() + time);//30分钟后的时间
				setAttr("book", DateUtils.toString(afterDate, "yyyy-MM-dd HH:mm"));
				Double lowprice = airOrderRoute.getLowprice();
				Double price = routePass.get(0).getPrice();
				setAttr("tpb", 0.0 == airOrderRoute.getTpbeforefee()?0.0:Numbers.round(price/airOrderRoute.getTpbeforefee()/100, 2));
				setAttr("tpa", 0.0 == airOrderRoute.getTpafterfee()?0.0:Numbers.round(price/airOrderRoute.getTpafterfee()/100, 2));
				setAttr("gqb", 0.0 == airOrderRoute.getGqbeforefee()? 0.0:Numbers.round(price/airOrderRoute.getGqbeforefee()/100, 2));
				setAttr("gqa", 0.0 == airOrderRoute.getGqafterfee()?0.0:Numbers.round(price/airOrderRoute.getGqafterfee()/100, 2));
				if (null != lowprice) {
					setAttr("lowtpb", Numbers.round(lowprice/airOrderRoute.getTpbeforefee()/100, 2));
					setAttr("lowtpa", Numbers.round(lowprice/airOrderRoute.getTpafterfee()/100, 2));
					setAttr("lowgqb", Numbers.round(lowprice/airOrderRoute.getGqbeforefee()/100, 2));
					setAttr("lowgqa", Numbers.round(lowprice/airOrderRoute.getGqafterfee()/100, 2));
				}else{
					setAttr("flag", "1");
				}
				return "/crm/email/approve/air-approve-email";
			} else if (null != airGaiqian) {
				if (airGaiqian.getApprovestatus() == 1 || airGaiqian.getApprovestatus() == 3) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				AirGaiqianRoute airGaiqianRoute = airGaiqian.getRoutes().get(0);
				AirGaiqianPassenger airGaiqianPassenger = airGaiqian.getPassengers().get(0);
				AirOrder  airOrders = airOrderService.getOrderByorderNo(airGaiqian.getOldorderno());
				log.info("airOrder:{}", JsonUtils.objectToJson(airOrder));
				String passengernames = ConvertUtils.extractElementPropertyToString(airGaiqian.getPassengers(), "name", "、");
				setAttr("type", "airgq");
				setAttr("username", passengernames);
				setAttr("orderRoute", airGaiqianRoute);
				setAttr("routePass", airGaiqianPassenger);
				setAttr("airOrder", airOrders);
				setAttr("KhYinshou", airGaiqianPassenger.getKhYinshou() * airGaiqian.getPassengers().size());
				return "/crm/approve-spa";
			} else if (null != trainOrder) {
				if (trainOrder.getApprovestatus() == 1 || trainOrder.getApprovestatus() == 3) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				TrainOrderRoute route = trainOrder.getRoute();

				String fromDate = DateUtil.getDateStrByParam("yyyy-MM-dd", DateUtil.getDateTimeFormat(route.getTravelTime(), "yyyy-MM-dd")) + " " + route.getFromTime();
				Date addDate = DateUtil.addDate(DateUtil.getDateTimeFormat(route.getTravelTime(), "yyyy-MM-dd"), Integer.valueOf(route.getArriveDays()));
				String arriveDate = DateUtil.getDateStrByParam("yyyy-MM-dd", addDate) + " " + route.getArriveTime();

				setAttr("type", "train");
				setAttr("seatType", ConvertUtils.extractElementPropertyToString(trainOrder.getUsers(), "seatType", "、"));
				String trainBox = ConvertUtils.extractElementPropertyToString(trainOrder.getUsers(), "trainBox", "、");
				String seatNo = ConvertUtils.extractElementPropertyToString(trainOrder.getUsers(), "seatNo", "、");
				setAttr("trainbox", trainBox + seatNo);
				setAttr("orderno", trainOrder.getOrderNo());
				setAttr("userList", trainOrder.getUsers());
				String passengernames = ConvertUtils.extractElementPropertyToString(trainOrder.getUsers(), "userName", "、");
				setAttr("username", passengernames);

				setAttr("fromDate", fromDate);
				setAttr("arriveDate", arriveDate);
				setAttr("trainRoute", route);
				setAttr("trainOrder", trainOrder);
				return "/crm/email/approve/train-approve-email";
			} else if (null != hotelOrder) {
				//======================================
				if (hotelOrder.getApprovestatus() == 1 || hotelOrder.getApprovestatus() == 3) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				Date createtime = hotelOrder.getCreatetime();
				Date enDate = DateUtil.addOrMinusMin(createtime, 30);
				setAttr("orderLastTime", DateUtil.getDateStrByParam("yyyy-MM-dd HH:mm", enDate));
				String passengernames = ConvertUtils.extractElementPropertyToString(hotelOrder.getUsers(), "name", "、");
				String start = new DateTime(hotelOrder.getArrivalDate()).toString("MM月dd日");
				List<HotelOrderUsers> users = hotelOrder.getUsers();
				setAttr("type", "hotel");
				setAttr("start", start);
				setAttr("username", passengernames);
				setAttr("hotelUser", users);
				setAttr("hotelOrder", hotelOrder);
				return "crm/email/approve/hotel-approve-email";
			} else if (null != appformOrder) {
				if (appformOrder.getApprovestatus() == 1 || appformOrder.getApprovestatus() == 3) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				setAttr("type", "appform");
				setAttr("appformOrder", appformOrder);
				if (appformOrder.getAppformTravels().size() == 0 && appformOrder.getAppformHotels().size() == 0) {
					setAttr("travelflag", 0);
				} else {
					setAttr("travelflag", 1);
				}
				return "/crm/approve-spa";
			} else if (null != taxiOrder) {
				Airport airport = taxiOrder.getOrder();
				if (airport.getApprovestatus() == TaxiAirPortStatusContant.COM_APPROVE_STATUS_SUCCESS || airport.getApprovestatus() == TaxiAirPortStatusContant.COM_APPROVE_STATUS_NO) {
					setAttr("failMsg", "该订单审批通过,无需再次审批");
					return "/common/500";
				}
				setAttr("type", "taxi");
				Date useDate = null;
				Date settime = airport.getSettime();
				Date addTime = DateUtil.addOrMinusMin(new Date(), 30);
				if (settime.after(addTime)) {
					useDate = addTime;
				} else {
					useDate = settime;
				}
				setAttr("tjusername", airport.getTjusername());
				setAttr("setTime", DateUtil.getDateStrByParam("yyyy-MM-dd HH:mm", settime));	// 上车时间
				setAttr("setPlace", airport.getSetplace());	// 上车地点
				setAttr("arrivePlace", airport.getArriveplace());	// 下车地点
				setAttr("carType", TaxiAirPortStatusContant.getTaxiCarType(taxiOrder.getRoute().getCarGroupId()));	// 车型
				setAttr("ePrice", taxiOrder.getRoute().getEprice());	// 费用金额
				setAttr("lastApproveTime", DateUtil.getDateStrByParam("yyyy-MM-dd HH:mm", useDate));	// 上车时间
				return "/crm/approve-spa";
			}
			setAttr("failMsg", "没有找到该订单的信息");
			return "/common/500";
		} catch (Exception e) {
			e.printStackTrace();
		}
		setAttr("failMsg", "没有找到该订单的信息");
		return "/common/500";
	}

	private Boolean getDatePoor(String nowDate) {
		long l = new Date().getTime() - Long.parseLong(nowDate);// 获取毫秒差值
		Long bannel = (long) (30 * 60 * 1000);
		if (l - bannel >= 0) {// 超过30分钟;
			return false;
		} else if (l - bannel < 0) {
			return true;
		}
		return false;
	}
	@SuppressWarnings("unchecked")
	@RequestMapping("/confirmApprove")
	@ResponseBody
	public AuvgoResult EmailApprove(String data) throws Exception {
		AirOrder airOrder = null;
		TrainOrder trainOrder = null;
		HotelOrder hotelOrder = null;
		CrmAppform crmAppform = null;
		AirGaiqian gaiqian = null;
		TaxiOrderModel taxiOrder = null;
		if (StringUtils.isBlank(data)) {
			return AuvgoResult.build(300, "请求参数异常");
		}
		//data = data.replaceAll("%3D", "=");
		Map<String, String> maps = JsonUtils.jsonToPojo(data, Map.class);
		String token = maps.get("token");
		String key = String.valueOf(getSessionAttr("tokenkey"));
		if (StringUtils.isBlank(key) || !token.equals(key)) {
			return AuvgoResult.build(300, "请勿重复提交此审批");
		}
		String orderno = maps.get("orderno");
		String empid = maps.get("empid");
		String type = maps.get("type");
		String cid = maps.get("cid");
		int opstatus = Integer.parseInt(maps.get("opstatus"));// 获取审批意见
		if (!"air".equals(type) && !"train".equals(type) && !"hotel".equals(type) && !"appform".equals(type) && !"airgq".equals(type) && !"taxi".equals(type)) {
			return AuvgoResult.build(300, "没有匹配到对应的审批类型");
		}
		switch (type) {
		case "air":
			airOrder = airOrderService.getOrderByorderNo(orderno);
			break;
		case "train":
			trainOrder = trainOrderService.getOrderByorderNo(orderno);
			break;
		case "appform":
			crmAppform = appformService.findByApprovalNo(Long.parseLong(cid), orderno);
			break;
		case "hotel":
			hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
			break;
		case "airgq":
			gaiqian = airGaiQianService.getGaiqianByGqOrderNo(orderno);
			break;
		case "taxi":
			taxiOrder = taxiOrderWSService.getByOrderno(orderno); 
			break;
		default:
			break;
		}
		Integer flag = null;//

		if (null != airOrder) {
			flag = airOrderService.NewupdateOrderApprove(orderno, empid, opstatus, null);
		} else if (null != trainOrder) {
			flag = trainOrderService.updateNewOrderApprove(orderno, empid, opstatus, null);
		} else if (null != hotelOrder) {
			flag = hotelOrderService.updateNewOrderApprove(orderno, empid, opstatus, null);
		} else if (null != crmAppform) {
			flag = appformService.updateNewOrderApprove(orderno, empid, opstatus, null);
		} else if (null != gaiqian) {
			flag = airGaiQianService.updateNewOrderApprove(orderno, empid, opstatus, null);
		} else if (null != taxiOrder) {
			flag = taxiApproveWSService.updateOrderApprove(orderno, empid, opstatus, null);
		}
		// 判断审批结果
		if (null == flag || 3 == flag) {
			return AuvgoResult.build(200, "该订单您或其他人已经审批操作过,不能再进行审批操作,如有疑问,请联系客服!");
		} else if (1 == flag) {
			return AuvgoResult.build(200, "同意审批操作成功");
		} else if (2 == flag) {
			return AuvgoResult.build(200, "否决操作成功");
		} else if (0 == flag) {
			return AuvgoResult.build(200, "该订单您或者同级别其他人已经审批操作过,不能再进行其他审批操作");
		}
		return AuvgoResult.build(300, "系统偶尔也会累，请重新提交或拨打客服电话4006060011");
	}
	@RequestMapping("/sendconfirmApprove")
	public String sendEmailApprove(@RequestParam("code")String code){
		try {
			AirOrder airOrder = null;
			TrainOrder trainOrder = null;
			HotelOrder hotelOrder = null;
			CrmAppform crmAppform = null;
			AirGaiqian gaiqian = null;
			TaxiOrderModel taxiOrder = null;
			String str = AESUtil.AESDncode(code, AESUtil.keyword);// AES密钥对称解密
			String[] split = str.split("/");
			String type = split[0];// 业务类型
			String orderno = split[1];// 订单号;
			String empid = split[2];// 审批人id
			String companyid = split[3];// 公司id
			String opstatus = split[4];// 操作状态
			int opstatu = Integer.parseInt(opstatus);// 获取审批意见
			if (!"air".equals(type) && !"train".equals(type) && !"hotel".equals(type) && !"appform".equals(type) && !"airgq".equals(type) && !"taxi".equals(type) && !(ApprovalMsgModule.NEWHOTEL.toString()).equals(type)) {
				setAttr("failMsg", "没有匹配到对应的审批类型");
				return "/common/500";
			}
			switch (type) {
			case "air":
				airOrder = airOrderService.getOrderByorderNo(orderno);
				break;
			case "train":
				trainOrder = trainOrderService.getOrderByorderNo(orderno);
				break;
			case "appform":
				crmAppform = appformService.findByApprovalNo(Long.parseLong(companyid), orderno);
				break;
			case "hotel":
				hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
				break;
			case "airgq":
				gaiqian = airGaiQianService.getGaiqianByGqOrderNo(orderno);
				break;
			case "taxi":
				taxiOrder = taxiOrderWSService.getByOrderno(orderno); 
				break;
			default:
				break;
			}
			Integer flag = null;//

			if (null != airOrder) {
				flag = airOrderService.NewupdateOrderApprove(orderno, empid, opstatu, null);
			} else if (null != trainOrder) {
				flag = trainOrderService.updateNewOrderApprove(orderno, empid, opstatu, null);
			} else if (null != hotelOrder) {
				flag = hotelOrderService.updateNewOrderApprove(orderno, empid, opstatu, null);
			} else if (null != crmAppform) {
				flag = appformService.updateNewOrderApprove(orderno, empid, opstatu, null);
			} else if (null != gaiqian) {
				flag = airGaiQianService.updateNewOrderApprove(orderno, empid, opstatu, null);
			} else if (null != taxiOrder) {
				flag = taxiApproveWSService.updateOrderApprove(orderno, empid, opstatu, null);
			} else if((ApprovalMsgModule.NEWHOTEL.toString()).equals(type)){
				// 新酒店
				OrderApproOperationRes approvalResult = hotelOrderBusiness.hotelOrderApproval(orderno, empid+"", opstatu+"", null, ApprovalType.EMAIL.toString());
				flag = approvalResult.getData().getType();
			}
			log.info("返回数据值:{}",flag);
			// 判断审批结果
			if (null == flag || 3 == flag) {
				setAttr("failMsg", "您已操作过审批!");
				return "/common/500";
			} else if (1 == flag) {
				setAttr("failMsg", "您已审批通过申请");
				return "/common/500";
			} else if (2 == flag) {
				setAttr("failMsg", "您已审批否决申请");
				return "/common/500";
			} else if (0 == flag) {
				setAttr("failMsg", "您已操作过审批!");
				return "/common/500";
			}
			setAttr("failMsg", "确保您的网络畅通,请重新审批~");
			return "/common/500";
		}catch (Exception e) {
			e.printStackTrace();
			setAttr("failMsg", "系统偶尔也会累,请重新提交或拨打客服电话4006060011");
			return "/common/500";
		}
	}
	//时间校验
	@RequestMapping("/checktime")
	@ResponseBody
	public AuvgoResult checktime() throws Exception{
		if (DateUtils.isBlongRange()) {
			return AuvgoResult.ok();
		}
		return AuvgoResult.build(300, "温馨提示：每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
		}
}