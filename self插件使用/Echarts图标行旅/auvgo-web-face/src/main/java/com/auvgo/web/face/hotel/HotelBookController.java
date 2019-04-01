package com.auvgo.web.face.hotel;

import com.auvgo.core.contant.HotelStatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.ConvertUtils;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.hotel.api.HotelInfoService;
import com.auvgo.hotel.api.HotelOrderLogService;
import com.auvgo.hotel.api.HotelOrderService;
import com.auvgo.hotel.api.HotelSearchService;
import com.auvgo.hotel.entity.*;
import com.auvgo.hotel.model.HotelOrderRec;
import com.auvgo.hotel.model.OrderResultInfo;
import com.auvgo.hotel.model.common.ResultInfo;
import com.auvgo.hotel.model.hotel.HotelDetailViewModel;
import com.auvgo.hotel.model.hotel.HotelRoom;
import com.auvgo.hotel.model.hotel.RoomRatePlan;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 酒店下订单
 */
@Controller
@RequestMapping("/hotel/book")
public class HotelBookController extends BaseController {

	@Autowired
	private CrmEmployeeService employeeService;
	@Autowired
	private HotelOrderService hotelOrderService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private HotelSearchService searchService;
	@Autowired
	private HotelInfoService infoService;
	@Autowired
	private HotelOrderLogService hotelOrderLogService;
	@Autowired
	private CrmCompanyService crmCompanyService;
	@Autowired
	private CrmEmployeeCertService crmEmployeeCertService;
	@Autowired
	private CrmEmployeeLinshiService crmEmployeeLinshiService;
	@Autowired
	private CrmDepartmentService deptService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private SysOutpushDataService sysOutdataService;

	/**
	 * 预订
	 *
	 * @param hotelId
	 * @param arrivalDate
	 * @param departureDate
	 * @param roomId
	 * @param roomTypeId
	 * @param ratePlanId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/{hotelId}/{arrivalDate}/{departureDate}/{roomId}/{roomTypeId}/{ratePlanId}") //
	public String book(@PathVariable("hotelId") String hotelId, @PathVariable("arrivalDate") String arrivalDate,
					   @PathVariable("departureDate") String departureDate, @PathVariable("roomId") String roomId,
					   @PathVariable("roomTypeId") String roomTypeId, @PathVariable("ratePlanId") String ratePlanId) {
		log.info("/hotel/book request roomId:{} , roomTypeId:{} , ratePlanId:{}", roomId, roomTypeId, ratePlanId);
		if (StringUtils.isBlank(roomId) || StringUtils.isBlank(ratePlanId) || StringUtils.isBlank(roomTypeId)
				|| StringUtils.isBlank(hotelId) || StringUtils.isBlank(arrivalDate)
				|| StringUtils.isBlank(departureDate)) {
			setAttr("Msg", "查询输入参数有误,请重新查询");
			return "/hotel/hotel-query-list";
		}
		try {
			// 验证房型
			HotelDetailViewModel hotelDetail;
			RoomRatePlan rRatePlan;
			HotelRoom hRoom;
			ResultInfo<HotelDetailViewModel> hotelDetailRet = searchService.getHotelDetail(hotelId,
					DateUtil.getDateFormat(arrivalDate), DateUtil.getDateFormat(departureDate),
					Integer.valueOf(ratePlanId), roomTypeId);
			if (hotelDetailRet.getIsSuccess() && hotelDetailRet.getData() != null) {
				hotelDetail = hotelDetailRet.getData();
			} else {
				setAttr("Msg", "没有对应的房型！");
				return "/hotel/hotel-query-list";
			}
			if (hotelDetail.getRoomList() != null && hotelDetail.getRoomList().size() > 0
					&& hotelDetail.getRoomList().get(0).getRatePlanList() != null
					&& hotelDetail.getRoomList().get(0).getRatePlanList().get(0).getRoomTypeId().equals(roomTypeId)
					&& hotelDetail.getRoomList().get(0).getRatePlanList().get(0).getRatePlanId() == Integer.valueOf(ratePlanId)) {
				rRatePlan = hotelDetail.getRoomList().get(0).getRatePlanList().get(0);
				hRoom = hotelDetail.getRoomList().get(0);
			} else {
				setAttr("Msg", "没有对应的房型！");
				return "/hotel/hotel-query-list";
			}


			setSessionAttr("hotelDetailViewModel", hotelDetail);
			CrmEmployee sessionUser = getUser();
			CrmEmployee user = employeeService.getById(sessionUser.getCompanyid(), sessionUser.getId());
			// 服务费
			CrmFuwufei fuwufei = crmCompanyService.getComanyFuwufei(user.getCompanyid());
			setAttr("fuwufei", fuwufei);

			// ratePlan 信息
			setAttr("rRatePlan", rRatePlan);
			setSessionAttr("rRatePlanSession", rRatePlan);
			log.info("rRatePlan:{}", JsonUtils.objectToJson(rRatePlan));
			// 房型信息
			setAttr("hRoom", hRoom);
			// 酒店详情
			setAttr("hotelDetail", hotelDetail);
			//部门，员工等级
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			setAttr("depttree", deptService.getDeptZtree(company.getId(), null));
			List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
			setAttr("AllStaff", staffList);
			// 酒店验证返回数据
			Map<String, Object> map = JsonUtils.jsonToPojo(getSessionAttr("validatorData").toString(), Map.class);
			List<Map<String, String>> resutListMap = (List<Map<String, String>>) map.get("arrivalOptionTimes");
			setAttr("validator", resutListMap);
		} catch (Exception e) {
			log.error("/hotel/book  error:{}", e);
			setAttr("Msg", "没有对应的房型！");
			return "/common/404";
		}
		return "/hotel/hotel-book";
	}

	/**
	 * 创建酒店订单
	 *
	 * @param orderRec
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/createOrder")
	@ResponseBody
	public AuvgoResult createOrder(HotelOrderRec orderRec, HttpServletRequest request) {
		HotelOrder order = orderRec.getOrder();
		log.info("createOrder orderRec:{}", JsonUtils.objectToJson(orderRec));
		try {
			CrmEmployee users = getUser();
			CrmCompany company = getCompany();
			CrmFuwufei fuwuFei = companyService.getComanyFuwufei(users.getCompanyid());
			HotelDetailViewModel hotelDetailViewModel = (HotelDetailViewModel) getSessionAttr("hotelDetailViewModel");
			if (null == fuwuFei || null == users || null == company || null == hotelDetailViewModel) {
				return AuvgoResult.build(300, "登录超时请您重新登陆！");
			}
			//房间产品，用来计算价格
			RoomRatePlan rRatePlan = (RoomRatePlan) getSessionAttr("rRatePlanSession");
			if (null == rRatePlan) {
				return AuvgoResult.build(300, "查询超时，没有对应的房型了，请您重新查询提交订单！");
			}
			order.setLatestArrivalTime(DateUtil.getDateTimeFormat(order.getLatestArrivalTimeString()));

			//计算服务费
			if ("per".equals(fuwuFei.getGnhoteltype())) {
				//按订单百分比 收取
				orderRec.setFuwufee("1".equals(fuwuFei.getGnhotelpertype()) ? Double.valueOf(fuwuFei.getGnhotelper()) : 0d);
				orderRec.setFuwutype(fuwuFei.getGnhoteltype());
			} else {
				orderRec.setFuwufee(Double.valueOf(fuwuFei.getGnhoteldd()));
				orderRec.setFuwutype(fuwuFei.getGnhoteltype());
			}

			//预订人信息 
			order.setCompanyid(users.getCompanyid());
			order.setCompanyname(company.getName());
			order.setCompanycode(company.getBianhao());
			order.setBookuserid(users.getId());
			order.setBookusername(users.getName());
			//默认为企业月结
			order.setPayType("1");
			// 因公
			order.setChuchaitype(0);
			// 国内酒店
			order.setHoteltype(0);
			order.setRoomTypeId(rRatePlan.getRoomTypeId());
			order.setRatePlanId(rRatePlan.getRatePlanId());
			//坐席
			order.setOrderfrom(HotelStatusContant.COM_ORDER_FROM_VIP);
			order.setCustomerIPAddress(getIpAddr(request));
			//酒店信息
			order.setHotelId(hotelDetailViewModel.getHotelId());
			order.setHotelName(hotelDetailViewModel.getHotelName());
			order.setHotelAddress(hotelDetailViewModel.getAddress());
			order.setHotelPhone(hotelDetailViewModel.getPhone());
			//入住信息
			order.setArrivalDate(DateUtil.getDateFormat(hotelDetailViewModel.getArrivalDate()));
			order.setDepartureDate(DateUtil.getDateFormat(hotelDetailViewModel.getDepartureDate()));
			order.setCityId(hotelDetailViewModel.getCityId());
			order.setCityName(hotelDetailViewModel.getCityName());
			order.setStarRateName(hotelDetailViewModel.getStarRateName());
			order.setNumberOfCustomers(order.getNumberOfRooms());

			//判断是否为协议酒店产品，设置取消状态
			HotelRatePlan sRatePlan = searchService.getByHotelidAndRatePlanid(order.getHotelId(), String.valueOf(order.getRatePlanId()));
			if (null != sRatePlan) {
				HotelInfo hotelInfo = infoService.getHotelInfoByHotelId(sRatePlan.getHotelId());
				List<com.auvgo.hotel.entity.HotelRoom> rooms = hotelInfo.getRooms();
				com.auvgo.hotel.entity.HotelRoom room = new com.auvgo.hotel.entity.HotelRoom();
				for (com.auvgo.hotel.entity.HotelRoom hotelRoom : rooms) {
					if (hotelRoom.getHotelid().equals(hotelInfo.getHotelid())) {
						room = hotelRoom;
						break;
					}
				}
				buildSignOrder(order, sRatePlan, hotelInfo, room);
			} else {
				// 验证房型
				HotelDetailViewModel hotelDetail;
				ResultInfo<HotelDetailViewModel> hotelDetailRet = searchService.getHotelDetail(order.getHotelId(), order.getArrivalDate(),
						order.getDepartureDate(), order.getRatePlanId(), order.getRoomTypeId());
				if (hotelDetailRet.getIsSuccess() && hotelDetailRet.getData() != null) {
					hotelDetail = hotelDetailRet.getData();
				} else {
					return AuvgoResult.build(300, "酒店信息不存在");
				}
				if (hotelDetail.getRoomList() != null && hotelDetail.getRoomList().size() > 0
						&& hotelDetail.getRoomList().get(0).getRatePlanList() != null
						&& hotelDetail.getRoomList().get(0).getRatePlanList().get(0).getRoomTypeId().equals(order.getRoomTypeId())
						&& hotelDetail.getRoomList().get(0).getRatePlanList().get(0).getRatePlanId() == order.getRatePlanId()) {
					RoomRatePlan rate = hotelDetail.getRoomList().get(0).getRatePlanList().get(0);
					HotelRoom room = hotelDetail.getRoomList().get(0);
					//封装订单
					buildElongOrder(order, hotelDetail, rate, room);
				} else {
					log.info("createorder validate room hotelDetail:{}", JsonUtils.objectToJson(hotelDetail));
					return AuvgoResult.build(300, "酒店产品信息不匹配");
				}
			}
			if (order.getApproveid() == null || order.getApproveid() <= 0) {
				if ("1".equals(order.getIsNeedGuarantee()) && order.getGuaranteeAmount() > 0) {
					//待担保
					order.setPaystatus(HotelStatusContant.HOTEL_PAY_DAIDANBAO);
				} else {
					//待支付
					order.setPaystatus(HotelStatusContant.HOTEL_PAY__DAIZHIFU);
				}
				order.setApprovestatus(HotelStatusContant.COM_APPROVE_STATUS_NO);
			} else {
				order.setApprovestatus(HotelStatusContant.COM_APPROVE_STATUS);
				//未支付
				order.setPaystatus(HotelStatusContant.HOTEL_PAY_STATUS);
			}

			//封装入住人
			BuildUserRec(orderRec, users.getCompanyid());
			//默认预付
			orderRec.getOrder().setPayType("1");
			//判断是否填写了联系人的手机信息,没填写就填入预订人信息
			if (StringUtils.isBlank(order.getLinkPhone())) {
				order.setLinkPhone(users.getMobile());
				if (StringUtils.isBlank(order.getLinkName())) {
					order.setLinkPhone(users.getName());
				}
			}
			log.info("createOrder buildOrder:{}", JsonUtils.objectToJson(orderRec));
			OrderResultInfo<String> result = hotelOrderService.createOrder(orderRec);
			//创建酒店订单成功
			if (result.getIsSuccess()) {
				Map<String, Object> resultMap = Maps.newHashMap();
				resultMap.put("orderno", result.getData());
				if (order.getApprovestatus() == HotelStatusContant.COM_APPROVE_STATUS_NO) {
					resultMap.put("isapprove", false);
				} else {
					resultMap.put("isapprove", true);
				}
				String resultJson = JsonUtils.objectToJson(resultMap);
				log.info("hotel createOrder reponse success--> resultJson:{}", resultJson);
				HotelOrderLog hotelOrderLog = new HotelOrderLog(result.getData(), "创建订单", order.getBookuserid(), order.getBookusername(),
						order.getBookdept(), new Date(), "创建订单成功:" + result.getData());
				hotelOrderLogService.saveOrUpdate(hotelOrderLog);
				//删除session
				//产品信息
				removeSession("rRatePlanSession");
				//酒店信息
				removeSession("hotelDetailViewModel");
				//删除酒店验价信息
				removeSession("validatorData");
				SysOutpushData push = sysOutdataService.getPushDataByOrderno(result.getData());
				SysOutpushData sysOutpushData = dealCasloginMsg(company.getId(), result.getData() + "", "hotel", push);
				if (null != sysOutpushData) {
					sysOutdataService.saveOrUpdate(sysOutpushData);
				}
				return AuvgoResult.build(200, "您的订单已成功提交", "/hotel/book/success/" + result.getData());
			}
			//创建酒店订单成功
			log.info("hotel createOrder reponse error--> resultMsg:{}", result.getMsg());
			HotelOrderLog hotelOrderLog = new HotelOrderLog(result.getData(), "创建订单", order.getBookuserid(), order.getBookusername(),
					order.getBookdept(), new Date(), "创建订单失败:" + result.getMsg());
			hotelOrderLogService.saveOrUpdate(hotelOrderLog);
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, "订单提交失败：" + result.getMsg());
		} catch (Exception e) {
			e.printStackTrace();
			log.error("error--> data:{},Exception:{}", JsonUtils.objectToJson(order), e);
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, "提交订单出现异常", e.getMessage());
		}
	}

	@RequestMapping("/success/{orderno}")
	public String toSuccess(@PathVariable("orderno") String orderno) {
		HotelOrder hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
		setAttr("title", "预订成功");
		setAttr("msg", "您选择的酒店预订成功，系统以为您送审，请您耐心等待！");
		setAttr("hotelOrder", hotelOrder);
		setAttr("names", ConvertUtils.extractElementPropertyToString(hotelOrder.getUsers(), "name", "、"));
		return "/hotel/hotel-book-success";
	}

	/**
	 * 获取IP
	 *
	 * @param request
	 * @return
	 */
	public String getIpAddr(HttpServletRequest request) {
		String ipAddress = "";
		ipAddress = request.getRemoteAddr();
		try {
			ipAddress = request.getHeader("x-forwarded-for");
			if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
				ipAddress = request.getHeader("Proxy-Client-IP");
			}
			if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
				ipAddress = request.getHeader("WL-Proxy-Client-IP");
			}
			if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
				ipAddress = request.getRemoteAddr();
				if (ipAddress.equals("127.0.0.1")) {
					// 根据网卡取本机配置的IP
					InetAddress inet = null;
					inet = InetAddress.getLocalHost();
					ipAddress = inet.getHostAddress();
				}
			}
			// 对于通过多个代理的情况，第一个IP为客户端真实IP,多个IP按照','分割
			if (ipAddress != null && ipAddress.length() > 15) { // "***.***.***.***".length()
				// = 15
				if (ipAddress.indexOf(",") > 0) {
					ipAddress = ipAddress.substring(0, ipAddress.indexOf(","));
				}
			}
		} catch (UnknownHostException e) {
			log.error("getIpAddr fail", e);
		}
		return ipAddress;
	}

	/**
	 * 封装sign订单
	 *
	 * @param order
	 * @param sRatePlan
	 * @param hotelInfo
	 * @param room
	 */
	private void buildSignOrder(HotelOrder order, HotelRatePlan sRatePlan, HotelInfo hotelInfo,
								com.auvgo.hotel.entity.HotelRoom room) {
		order.setLatitude(hotelInfo.getBaiduLat());
		order.setLongitude(hotelInfo.getBaiduLon());
		order.setCustomerType(sRatePlan.getGuestType());
		order.setCurrencyCode(sRatePlan.getCurrencyCode());
		order.setPaymentType(sRatePlan.getPaymentType());
		order.setTotalPrice(BigDecimal.valueOf(sRatePlan.getSalePrice()).multiply(new BigDecimal(order.getNumberOfRooms())).doubleValue());
		order.setRoomName(room.getName());
		order.setHotelName(hotelInfo.getName());
		order.setRatePlanName(sRatePlan.getRatePlanName());
		order.setConfirmationType(sRatePlan.getInstantConfirmation().toString());
		order.setHotelfrom(sRatePlan.getType());
		order.setIsCancel(Integer.valueOf(sRatePlan.getIsCancel()));
		order.setHotelprice(sRatePlan.getSalePrice());
		order.setDayprice(sRatePlan.getSalePrice());
		Date arrivalDate = order.getArrivalDate();
		String startDate = DateUtil.getDateStrByParam("yyyy-MM-dd", arrivalDate);
		if (StringUtils.isNotBlank(sRatePlan.getCancelTime()) && sRatePlan.getIsCancel().equals("1")) {
			StringBuilder cancelTime = new StringBuilder();
			String time = sRatePlan.getCancelTime().replace("-", ":");
			cancelTime.append(startDate);
			cancelTime.append(" ");
			cancelTime.append(time);
			cancelTime.append(":00");
			order.setCancelTime(DateUtil.getDateTimeFormat(cancelTime.toString()));
		} else {
			order.setCancelTime(DateUtil.getDateTimeFormat("1900-01-01 00:00:00"));
		}
	}

	/**
	 * 封装elong订单
	 *
	 * @param order
	 * @param hotelDetail
	 * @param rate
	 * @param room
	 */
	private void buildElongOrder(HotelOrder order, HotelDetailViewModel hotelDetail, RoomRatePlan rate,
								 HotelRoom room) {
		if (rate.getGuaranteeRuleDesc() != null && rate.getGuaranteeRuleDesc().size() > 0) {
			order.setCancelRuleDesc(rate.getGuaranteeRuleDesc().get(0));
		}
		if (rate.getPrepayRuleDesc() != null && rate.getPrepayRuleDesc().size() > 0) {
			order.setCancelRuleDesc(rate.getPrepayRuleDesc().get(0));
		}
		order.setRoomName(room.getName());
		order.setRatePlanName(rate.getRatePlanName());
		order.setLatitude(hotelDetail.getLatitude());
		order.setLongitude(hotelDetail.getLongitude());
		order.setCustomerIPAddress(getIpAddr(request));
		order.setCustomerType(rate.getGuestType().value());
		order.setCurrencyCode(rate.getCurrencyCode().value());
		order.setPaymentType(rate.getPaymentType().value());
		order.setTotalPrice(rate.getTotalRate().multiply(new BigDecimal(order.getNumberOfRooms())).doubleValue());
		order.setConfirmationType(rate.getInstantConfirmation().toString());
		order.setHotelprice(rate.getAverageRate().doubleValue());
		order.setDayprice(rate.getAverageRate().doubleValue());
		//担保金额
		if (checkIsGuarantee(rate, order)) {
			order.setIsNeedGuarantee("1");
			Double guaranteeAmout = getGuaranteeAmout(order, rate);
			order.setGuaranteeAmount(guaranteeAmout);
		} else {
			order.setIsNeedGuarantee("0");
			order.setGuaranteeAmount((double) 0);
		}
	}

	/**
	 * 封装乘客信息
	 *
	 * @param orderRec
	 * @param cid
	 */
	private void BuildUserRec(HotelOrderRec orderRec, Long cid) {
		List<HotelOrderUsers> users = orderRec.getUsers();
		boolean flag = false;
		for (HotelOrderUsers user : users) {
			// 企业员工
			if (1 == user.getId()) {
				CrmEmployee emp = employeeService.getById(cid, user.getEmployeeid());
				CrmEmployeeCert cert = crmEmployeeCertService.getCertByEmpidAndCertType(user.getCerttype(),
						user.getEmployeeid());
				// companyid deptid deptid zhiwei name
				BeanUtils.copyProperties(emp, user);
				user.setCerttype(cert.getCerttype());
				user.setCertno(cert.getCertificate());
				if (null != emp.getIfvip() && 1 == emp.getIfvip().intValue()) {
					user.setIfvip(1);
					flag = true;
				} else {
					user.setIfvip(0);
				}
				// 临时
			} else {
				CrmEmployeeLinshi emplish = crmEmployeeLinshiService.getById(user.getEmployeeid());
				// companyid mobile certtype certno
				BeanUtils.copyProperties(emplish, user);
				user.setEmployeeid(0L);
				user.setName(emplish.getUsername());
				user.setIfvip(0);
			}
			user.setCaigouprice(orderRec.getOrder().getDayprice());
			user.setSaleprice(orderRec.getOrder().getDayprice());
			user.setCreatetime(new Date());
		}
		orderRec.getOrder().setIfvip(flag ? 1 : 0);
	}

	/**
	 * 计算担保金额
	 *
	 * @param order
	 * @param rRatePlan
	 * @return
	 */
	private Double getGuaranteeAmout(HotelOrder order, RoomRatePlan rRatePlan) {
		String firstNightCost = "FirstNightCost";
		String guaranteeType = rRatePlan.getGuaranteeType();
		if (guaranteeType == null) {
			return 0D;
		}
		if (firstNightCost.equals(guaranteeType)) {
			return rRatePlan.getAverageRate().doubleValue() * order.getNumberOfRooms();
		} else {
			return rRatePlan.getAverageRate().doubleValue() * order.getNumberOfRooms() * order.getNumberOfCustomers();
		}
	}

	/**
	 * 判断是否担保，修改isGuarantee的状态
	 */
	private boolean checkIsGuarantee(RoomRatePlan mRateBean, HotelOrder order) {
		boolean isGuarantee = mRateBean.isGurantee();
		boolean isTimeGuarantee = mRateBean.isTimeGuarantee();
		boolean isAmountGuarantee = mRateBean.isAmountGuarantee();

		/*如果不需要担保*/
		if (!isGuarantee) {
			isGuarantee = false;
			/*无条件担保*/
		} else if (!isTimeGuarantee && !isAmountGuarantee) {
			isGuarantee = true;
			/*根据数量判断*/
		} else if (isAmountGuarantee && !isTimeGuarantee) {
			isGuarantee = isAmount(mRateBean, order.getNumberOfRooms());
			/*根据时间判断*/
		} else if (!isAmountGuarantee && isTimeGuarantee) {
			isGuarantee = isTime(mRateBean, order.getLatestArrivalTimeString());
			/*两者取并集*/
		} else {
			isGuarantee = isTime(mRateBean, order.getLatestArrivalTimeString()) || isAmount(mRateBean, order.getNumberOfRooms());
		}

		return isGuarantee;
	}

	/*
	 当前所选时间是否需要担保
	 只需要比较当前时间跟限制时间
	 */
	private boolean isTime(RoomRatePlan mRateBean, String lastArriveTime) {
		String startTime = mRateBean.getStartTime();
		String endTime = mRateBean.getEndTime();
		boolean isTomorrow = mRateBean.isTomorrow();
		int minutesOfStartTimes = hhmm2minute(startTime);
		int minutesOfEndTimes = hhmm2minute(endTime);
		String s = lastArriveTime.trim();
		int minutesOfSelectedLastArriveTime = hhmm2minute(s.substring(s.length() - 8, s.length() - 3));
		int twelve = 60 * 12;
		/*如果范围是到跨夜的*/
		if (isTomorrow) {
	        /*
	        所选时间>=starttime或者<=06:00
	         */
			return minutesOfSelectedLastArriveTime >= minutesOfStartTimes
					|| minutesOfSelectedLastArriveTime <= twelve / 2;
			/*如果是在当天的*/
		} else {
	        /*
	        所选时间在start~end范围内
	         */
			return minutesOfSelectedLastArriveTime >= minutesOfStartTimes &&
					minutesOfSelectedLastArriveTime <= minutesOfEndTimes;
		}
	}

	/*
	   当前房间数量是否需要担保
	   只需要比较当前数量跟限制数量
	    */
	private boolean isAmount(RoomRatePlan mRateBean, int mRoomNum) {
		int amount = mRateBean.getAmount();//几间以上需要预订
		return mRoomNum >= amount;
	}

	private int hhmm2minute(String startTime) {
		String[] split = startTime.split(":");
		int minutes = 0;
		if (split.length == 2) {
			minutes = Integer.parseInt(split[0]) * 60 + Integer.parseInt(split[1]);
		}
		return minutes;
	}
}