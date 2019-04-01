package com.auvgo.web.face.approve;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.air.api.AirGaiQianService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.AirGaiqian;
import com.auvgo.air.entity.AirOrder;
import com.auvgo.air.entity.AirOrderApprove;
import com.auvgo.air.entity.AirOrderPassenger;
import com.auvgo.air.entity.AirOrderPayment;
import com.auvgo.air.entity.AirOrderRemark;
import com.auvgo.air.entity.AirOrderRoute;
import com.auvgo.air.entity.AirOrderRoutePass;
import com.auvgo.business.hotel.order.IHotelOrderBusiness;
import com.auvgo.common.page.Page;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.contant.HotelStatusContant;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmAppformService;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmProjectService;
import com.auvgo.crm.entity.CrmAppform;
import com.auvgo.crm.entity.CrmAppformApprove;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.hotel.api.HotelOrderService;
import com.auvgo.hotel.entity.HotelOrder;
import com.auvgo.hotel.entity.HotelOrderApprove;
import com.auvgo.hotel.order.api.dto.req.QueryOrderReq;
import com.auvgo.hotel.orm.order.entity.OrderApproval;
import com.auvgo.hotel.orm.order.entity.OrderAuxiliary;
import com.auvgo.hotel.orm.order.entity.OrderDetail;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.TrainOrder;
import com.auvgo.train.entity.TrainOrderApprove;
import com.auvgo.train.entity.TrainOrderUsers;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Created by realxxs on 2018/4/10.
 */
@Controller
@RequestMapping("/myApproval")
public class MyapproveController extends BaseController {

	@Autowired
	CrmAppformService appformService;
	@Autowired
	AirOrderService airOrderService;
	@Autowired
	HotelOrderService hotelOrderService;
	@Autowired
	AirGaiQianService airGaiQianService;
	@Autowired
	TrainOrderService trainOrderService;
	@Autowired
	CrmCostCenterService crmCostCenterService;
	@Autowired
	CrmProjectService crmProjectService;

	/** 酒店订单 **/
	private IHotelOrderBusiness hotelOrderBusiness;

	/**
	 * 审批订单列表
	 * 
	 * @param pageNum
	 * @param pageSize
	 * @param type
	 *            0待审1已审
	 * @param flag
	 *            all air train hotel appform
	 * @param request
	 * @return
	 */
	@RequestMapping("/getAllApproveOrder/{type}/{flag}")
	public String toWaitApprovePage(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, @PathVariable("flag") String flag,
			HttpServletRequest request) {
		pageSize = null == pageSize ? 50 : pageSize;
		CrmEmployee user = getUser();
		QueryFilter filter = new QueryFilter();
		PageInfo<Map<String, Object>> page = new PageInfo<Map<String, Object>>();
		page.setList(new ArrayList<Map<String, Object>>());

		Map<String, Object> sqlParam = Maps.newHashMap();
		sqlParam.put("q_EQ_orders.companyid", user.getCompanyid());
		sqlParam.put("q_EQ_approve.employeeid", user.getId());
		Integer hasApprove = 1;
		String approveStart = request.getParameter("q_GTE_approve.approvetime");
		String approveEnd = request.getParameter("q_LTE_approve.approvetime");
		String approveOpstatus = request.getParameter("q_EQ_approve.opstatus");
		String bookusername = request.getParameter("q_LIKE_orders.bookusername");
		if ("0".equals(type)) {
			sqlParam.put("q_NOEQ_orders.status", "3");
			sqlParam.put("q_EQ_orders.approvestatus", AuvStatusContant.COM_APPROVE_STATUS_ING);
			sqlParam.put("q_EQ_approve.status", AuvStatusContant.COM_APPROVE_STATUS);
			sqlParam.put("q_EQ_approve.opstatus", AuvStatusContant.COM_APPROVE_STATUS_WAIT);
			hasApprove = 0;
		} else {
			sqlParam.put("q_NOEQ_orders.approvestatus", AuvStatusContant.COM_APPROVE_STATUS);
			hasApprove = 1;
			// 数据回显
			if (StringUtils.isNotBlank(approveStart)) {
				sqlParam.put("q_GTE_approve.approvetime", approveStart);
				setAttr("GTE_date", approveStart);
			}
			if (StringUtils.isNotBlank(approveEnd)) {
				sqlParam.put("q_LTE_approve.approvetime", approveEnd);
				setAttr("LTE_date", approveEnd);
			}
			if (StringUtils.isNotBlank(approveOpstatus)) {
				sqlParam.put("q_EQ_approve.opstatus", approveOpstatus);// 根据条件查询
				setAttr("approve_opstatus", approveOpstatus);
			} else {
				sqlParam.put("q_IN_approve.opstatus", "1,2");
			}
			if (StringUtils.isNotBlank(bookusername)) {
				sqlParam.put("q_LIKE_orders.bookusername", bookusername);// 根据条件查询
				setAttr("bookusername", bookusername);
			}
		}
		HashMap<String, Integer> tickets = Tickets(pageNum, pageSize, filter, hasApprove, sqlParam);
		if ("all".equals(flag) || "approve".equals(flag)) {
			// 出差申请单
			List<Map<String, Object>> appFormlist = appformService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList(); // hasApprove代表待审批的
			log.info("CrmApproveOrder -->response{}", JsonUtils.objectToJson(appFormlist));
			sortList(page.getList(), appFormlist, hasApprove);
		}
		if ("all".equals(flag) || "air".equals(flag)) {
			// 机票
			List<Map<String, Object>> airOrderlist = airOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
			log.info("AirApproveOrder -->response{}", JsonUtils.objectToJson(airOrderlist));
			sortList(page.getList(), airOrderlist, hasApprove);
			// 机票改签
			List<Map<String, Object>> airGqlist = airGaiQianService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
			log.info("AirGaiqianApproveOrder -->response{}", JsonUtils.objectToJson(airGqlist));
			sortList(page.getList(), airGqlist, hasApprove);
		}
		if ("all".equals(flag) || "hotel".equals(flag)) {
			// 酒店
			List<Map<String, Object>> hotelList = hotelOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
			log.info("HotelApproveOrder -->response{}", JsonUtils.objectToJson(hotelList));
			sortList(page.getList(), hotelList, hasApprove);
		}
		if ("all".equals(flag) || "train".equals(flag)) {
			// 火车票
			 List<Map<String, Object>> traiLlist = trainOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
			log.info("TrainApproveOrder -->response{}", JsonUtils.objectToJson(traiLlist));
			sortList(page.getList(), traiLlist, hasApprove);
		}
		if ("all".equals(flag) || "newhotel".equals(flag)) {
			List<Map<String, Object>> newHotelList = newHotelOrder(type, pageNum, pageSize, user, tickets, approveStart, approveEnd, approveOpstatus, bookusername);
			if (newHotelList != null && !newHotelList.isEmpty()) {
				sortList(page.getList(), newHotelList, hasApprove);
			}
		}
		if (tickets.get("newhotel") == null || tickets.get("newhotel") == 0) {
			newHotelOrder(type, pageNum, pageSize, user, tickets, approveStart, approveEnd, approveOpstatus, bookusername);
		}
		setAttr("page", page);
		setAttr("pageSize", pageSize);
		setAttr("tickets", tickets);
		setAttr("types", type);
		return "/my-approve/approve-wait";
	}

	private List<Map<String, Object>> newHotelOrder(String type, Integer pageNum, Integer pageSize, CrmEmployee user, HashMap<String, Integer> tickets, String approveStart,
			String approveEnd, String approveOpstatus, String bookusername) {
		List<Map<String, Object>> newHotelList = null;
		if ("0".equals(type)) {
			// 待审批
			try {
				Page<OrderDetail> orderList = hotelOrderBusiness.getPendApprovalOrder(pageNum, pageSize, user.getId() + "");
				newHotelList = newHotelApproval(orderList, user, tickets, type);
			} catch (Exception e) {
				log.error("toWaitApprovePage getPendApprovalOrder fail", e);
			}
		} else {
			// 已审批
			try {
				QueryOrderReq queryOrderReq = new QueryOrderReq();
				queryOrderReq.setApprovalStatus(9);
				queryOrderReq.setApprovalUserId(user.getId() + "");
				// 时间
				if (StringUtils.isNotBlank(approveStart) && StringUtils.isNotBlank(approveEnd)) {
					queryOrderReq.setDataType("approval");
					queryOrderReq.setStartTime(approveStart);
					queryOrderReq.setEndTime(approveEnd);
				}
				// 审批状态
				if (StringUtils.isNotBlank(approveOpstatus)) {
					queryOrderReq.setApprovalStatus(Integer.valueOf(approveOpstatus));
				}
				// 申请人
				if (StringUtils.isNotBlank(bookusername)) {
					OrderAuxiliary auxiliary = new OrderAuxiliary();
					auxiliary.setCreater(bookusername);
					queryOrderReq.setAuxiliary(auxiliary);
				}
				Page<OrderDetail> orderList = hotelOrderBusiness.getAlreadyApprovalOrder(pageNum, pageSize, queryOrderReq);
				newHotelList = newHotelApproval(orderList, user, tickets, type);
			} catch (Exception e) {
				log.error("toWaitApprovePage getAlreadyApprovalOrder fail", e);
			}
		}
		return newHotelList;
	}

	// 查询票数
	private HashMap<String, Integer> Tickets(Integer pageNum, Integer pageSize, QueryFilter filter, Integer hasApprove, Map<String, Object> sqlParam) {
		HashMap<String, Integer> map = Maps.newHashMap();
		PageInfo<Map<String, Object>> page = new PageInfo<Map<String, Object>>();
		page.setList(new ArrayList<Map<String, Object>>());
		List<Map<String, Object>> appFormlist = appformService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
		sortList(page.getList(), appFormlist, hasApprove);
		map.put("appform", null == appFormlist ? 0 : appFormlist.size());
		List<Map<String, Object>> airOrderlist = airOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
		sortList(page.getList(), airOrderlist, hasApprove);
		List<Map<String, Object>> airGqlist = airGaiQianService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
		sortList(page.getList(), airGqlist, hasApprove);
		int size = null == airOrderlist ? 0 : airOrderlist.size() + (null == airGqlist ? 0 : airGqlist.size());
		map.put("air", size);
		List<Map<String, Object>> hotelList = hotelOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
		sortList(page.getList(), hotelList, hasApprove);
		map.put("hotel", null == hotelList ? 0 : hotelList.size());
		List<Map<String, Object>> traiLlist = trainOrderService.findApproveOrderPageForMobileBy(pageNum, pageSize, filter.buildSQL(sqlParam), hasApprove).getList();
		sortList(page.getList(), traiLlist, hasApprove);
		map.put("train", null == traiLlist ? 0 : traiLlist.size());
		map.put("all", null == page.getList() ? 0 : page.getList().size());
		map.put("newhotel", 0);
		return map;
	}

	private void sortList(List<Map<String, Object>> list, List<Map<String, Object>> add, Integer hasApprove) {
		String orderby = null;
		if (hasApprove == 1) { // 已审批,按照审批时间倒序排序
			orderby = "approvetimesort";
		} else if (hasApprove == 0) { // 未审批,按照订单创建时间正需排序
			orderby = "createtimesort";
		}
		for (Map<String, Object> map : add) {
			Date date = (Date) map.get(orderby);
			if (null == date) {// 如果审批时间为空,直接加入列表中.可能部分排序异常
				list.add(map);
				continue;
			}
			if (list.size() > 0) {
				for (int i = 0; i < list.size(); i++) {
					Map<String, Object> m = list.get(i);
					Date d = (Date) m.get(orderby);
					if (hasApprove == 0 && date.after(d)) {
						list.add(i, map);
						break;
					} else if (hasApprove == 1 && date.after(d)) {
						list.add(i, map);
						break;
					} else if (i == list.size() - 1) {
						list.add(map);
						break;
					}
				}
			} else {
				list.add(map);
			}
		}
	}

	// 机票审批详情
	@RequestMapping("/toApproveDetail/{orderno}")
	public String toAirOrderDetail(@PathVariable("orderno") String orderno) {
		CrmEmployee user = getUser();
		setAttr("baseUtil", new BaseStatusContant());
		if (orderno.startsWith("AG")) {// 改签详情
			airEndrose(orderno);
			setAttr("mark", "air");
			return "/my-approve/approve-detail-airgq";
		}
		if (orderno.startsWith("H")) {// 酒店审批详情
			toOrderDetail(orderno);
			setAttr("mark", "hotel");
			return "/my-approve/approve-detail-hotel";
		}
		if (orderno.startsWith("T") || orderno.startsWith("EWYT")) {// 火车票审批详情
			toTrainOrderDetail(orderno);
			setAttr("mark", "train");
			return "/my-approve/approve-detail-train";
		}
		if (orderno.startsWith("ATO")) {// 出差申请单
			appformDetail(user.getCompanyid(), orderno);
			setAttr("mark", "myApproval");
			return "/my-approve/approve-detail-appform";
		}
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		List<AirOrderRoute> routelist = airOrder.getRoutes();
		Map<String,AirOrderRoutePass> distinkRp=new HashMap<>();
		List<AirOrderPassenger> passengers = airOrder.getPassengers();
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		if(routePass!=null&&routePass.size()>0){
			//国际票
			if(airOrder.getTickettype()==1){
				List<AirOrderRoutePass> rps=new ArrayList<>();
			for(AirOrderRoutePass rp :routePass){
				if(distinkRp.get(rp.getPiaohao())==null){
					distinkRp.put(rp.getPiaohao(),rp);
					rps.add(rp);
				}
			}
			routePass=rps;
			}
		}
		List<AirOrderApprove> approves = airOrder.getApproves();
		AirOrderPayment payment = airOrderService.getPayment(orderno);
		AirOrderRemark orderremark = new AirOrderRemark();
		orderremark.setOrderno(orderno);
		for (int i = 0; i < passengers.size(); i++) {
			passengers.get(i).setBxCode(routePass.get(i).getBxCode());
			passengers.get(i).setBxName(routePass.get(i).getBxName());
		}
		setAttr("routePass", routePass);
		setAttr("userlist", passengers);
		setAttr("routelist", routelist);
		setAttr("airOrder", airOrder);
		int size = routePass.size();
		Double total = routePass.get(0).getTotalprice() * size;// 总价
		Double price = routePass.get(0).getPrice() * size;// 总票价
		Double airporttax = routePass.get(0).getAirporttax() * size;
		Double bxPayMoney = routePass.get(0).getBxPayMoney() * size;
		Double fuwufei = routePass.get(0).getFuwufee() * size;
		DecimalFormat df = new DecimalFormat("#.00");
		String totalformat = null;
		String priceformat = null;
		String airporttaxformat = null;
		String bxPayMoneyformat = null;
		String fuwufeiformat = null;
		if (total != 0.0) {
			totalformat = df.format(total);
		} else {
			totalformat = "0.0";
		}
		if (price != 0.0) {
			priceformat = df.format(price);
		} else {
			priceformat = "0.0";
		}
		if (airporttax != 0.0) {
			airporttaxformat = df.format(airporttax);
		} else {
			airporttaxformat = "0.0";
		}
		if (bxPayMoney != 0.0) {
			bxPayMoneyformat = df.format(bxPayMoney);
		} else {
			bxPayMoneyformat = "0.0";
		}
		if (fuwufei != 0.0) {
			fuwufeiformat = df.format(fuwufei);
		} else {
			fuwufeiformat = "0.0";
		}
		setAttr("YinPaytotal", totalformat);
		setAttr("priceformat", priceformat);
		setAttr("airporttaxformat", airporttaxformat);
		setAttr("bxPayMoneyformat", bxPayMoneyformat);
		setAttr("fuwufeiformat", fuwufeiformat);
		setAttr("payment", payment);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtil", new AirStatusContant());
		setAttr("approveMap", getAirShenpiMap(approves));
		setAttr("approvestatus", airOrder.getApprovestatus());
		setAttr("mark", "air");
		return "/my-approve/approve-detail-air";
	}

	private Map<Integer, List<AirOrderApprove>> getAirShenpiMap(List<AirOrderApprove> approveList) {
		Map<Integer, List<AirOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (AirOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<AirOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<AirOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}

	private void airEndrose(String gaiOrderId) {
		AirGaiqian gaiqianOrder = airGaiQianService.getGaiqianByGqOrderNo(gaiOrderId);
		String orderno = gaiqianOrder.getOldorderno();
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		setAttr("routePass", routePass);
		for (AirOrderRoutePass airOrderRoutePass : routePass) {
			if (StringUtils.isNotBlank(airOrderRoutePass.getBxName())) {
				setAttr("bxFlag", 1);
				break;
			}
		}
		List<AirOrderRoute> routes = airOrder.getRoutes();
		setAttr("orgcityname", routes.get(0).getOrgcityname());
		setAttr("dstcityname", routes.get(0).getDstcityname());
		setAttr("gaiqianOrder", gaiqianOrder);
		setAttr("airOrder", airOrder);
		setAttr("airUtil", new AirStatusContant());
		setAttr("approveMap", getAirShenpiMap(gaiqianOrder.getApproves()));
		setAttr("approvestatus", gaiqianOrder.getApprovestatus());
	}

	// 酒店审批详情
	public void toOrderDetail(String orderno) {
		HotelOrder hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
		Long cid = hotelOrder.getCompanyid();
		// 审批人
		List<HotelOrderApprove> approveList = hotelOrder.getApproves();
		Map<Integer, List<HotelOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (HotelOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<HotelOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<HotelOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		boolean selfPay = hotelOrder.getPaymentType().equals("SelfPay") ? true : false;
		String status_str = "";
		Map<String, String> mapStatus = getStateString(hotelOrder.getStatus(), hotelOrder.getApprovestatus(), hotelOrder.getPaystatus(), selfPay, status_str);
		setAttr("status_str", mapStatus.get("status_str"));
		// 成本中心列表
		List<CrmCostCenter> costList = crmCostCenterService.getListBycid(cid);
		// 获取项目
		List<CrmProject> projectlist = crmProjectService.getListBycid(cid);

		setAttr("costList", JsonUtils.objectToJson(costList));
		setAttr("projectlist", JsonUtils.objectToJson(projectlist));
		setAttr("hotelOrder", hotelOrder);
		setAttr("approveMap", maps);
		setAttr("approvestatus", hotelOrder.getApprovestatus());
	}

	/**
	 * 判断酒店订单状态
	 * 
	 * @param status
	 * @param approvestatus
	 * @param paystatus
	 * @param selfPay
	 * @param status_str
	 * @return
	 */
	private Map<String, String> getStateString(int status, int approvestatus, int paystatus, boolean selfPay, String status_str) {
		Map<String, String> mapStatus = Maps.newHashMap();
		// 已取消（6）
		if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {
			status_str = "已取消";
		}
		// 如果是 已提交，待审批/无需审批，未支付 （没有调用艺龙接口之前的初始状态）
		else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT
				&& (approvestatus == HotelStatusContant.COM_APPROVE_STATUS || approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO)
				&& (paystatus == HotelStatusContant.HOTEL_PAY_STATUS || paystatus == HotelStatusContant.HOTEL_PAY_WEIDANBAN)) {
			status_str = "处理中";
		}
		// 如果无需审批（3）、或者审批通过（1）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO || approvestatus == HotelStatusContant.COM_APPROVE_STATUS_SUCCESS) {
			// 审批步骤结束，进行订单状态的判断
			// 现付 到店付
			if (selfPay) {
				status_str = checkOrderState(status, paystatus, mapStatus, status_str);
			} else {
				// 预付
				status_str = checkOrderState4PrePay(status, paystatus, status_str);
			}
		}
		// 如果审批否决（2）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_FAIL) {
			status_str = "审批否决";
		}
		// 如果是待审批（已经闭合）（5）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_WAIT) {
			status_str = "待审批";
		} else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_ING) {
			// 4
			status_str = "审批中";
		}
		mapStatus.put("status_str", status_str);
		return mapStatus;
	}

	/**
	 * 判断订单的状态、包括了担保状态
	 * 
	 * @param status_str
	 */
	private String checkOrderState(int status, int paystatus, Map<String, String> mapStatus, String status_str) {
		// 现付，担保
		// 等待担保4
		if (paystatus == HotelStatusContant.HOTEL_PAY_DAIDANBAO) {
			status_str = "等待担保";
			/*
			 * 现付不担保 现付担保成功 预付支付成功以后
			 */
			// 现付不担保
			// 已确认 4
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			status_str = "等待入住";
			// 确认成功 8
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {
			status_str = "已完成";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS) {
			// 支付成功 1
			status_str = "支付成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_ING) {
			// 6
			status_str = "担保中";
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN) {
			// 等待确认 2
			status_str = "等待确认";
			// 现付担保失败
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_FAIL) {
			// 担保失败 7
			status_str = "担保失败";
			// 确认中
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) {
			// 3
			status_str = "确认中";
			mapStatus.put("cancel", "取消");
			// 确认失败
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {
			// 3
			status_str = "确认失败";
		}
		return status_str;

	}

	/**
	 * 判断订单的状态、不包括担保状态，其实可以跟上面合并
	 * 
	 * @param status_str
	 */
	private String checkOrderState4PrePay(int status, int paystatus, String status_str) {
		// 确认中
		if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) {
			// 3
			status_str = "确认中";
			// 确认失败
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {
			// 5
			status_str = "确认失败";

			// 已确认
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			// 4 已确认
			status_str = "等待入住";
			// 确认成功
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {
			// 8 已完成
			status_str = "已完成";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DAITUIKUAN) {
			// 8
			status_str = "待退款";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_SUCCESS) {
			// 9;
			status_str = "退款成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_FAIL) {
			// 10
			status_str = "退款失败";
			// 订单已提交、待支付
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {
			// 6
			status_str = "已取消";
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT) {
			// 7
			status_str = checkPayStatus(paystatus, status_str);
			// 已确认
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			// 4
			status_str = "等待入住";
		}
		return status_str;
	}

	/**
	 * 支付状态的判断
	 * 
	 * @param status_str
	 */
	private String checkPayStatus(int paystatus, String status_str) {
		if (paystatus == HotelStatusContant.HOTEL_PAY__DAIZHIFU) {
			// 待支付 3
			status_str = "待支付";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_FAIL) {
			// 支付失败 8192
			status_str = "支付中";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_ZHIFU_ING) {
			// 支付中 4096
			status_str = "支付中";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS) {
			// 支付成功 1
			status_str = "支付成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS) {
			// 未支付 0
			status_str = "未支付";
		}
		return status_str;
	}

	// 火车票审批详情
	public void toTrainOrderDetail(String orderno) {
		TrainOrder trainOrder = trainOrderService.getOrderByorderNo(orderno);
		setAttr("trainOrder", trainOrder);
		List<TrainOrderUsers> users = trainOrder.getUsers();
		int flag = 0;
		if (null != users && users.size() > 1) {
			for (int i = 0; i < users.size() - 1; i++) {
				Double amount = users.get(i).getAmount();
				Double amount2 = users.get(i + 1).getAmount();
				if (amount.doubleValue() != amount2.doubleValue()) {
					flag = 1;
					break;
				}
			}
		}
		double totalPrice = 0.0;
		if (null != users && !users.isEmpty()) {
			for (int i = 0; i < users.size(); i++) {
				totalPrice += users.get(i).getTotalprice();
			}
		}
		setAttr("totalPrice", totalPrice);
		setAttr("Amountflag", flag);
		setAttr("trainUtil", new AuvStatusContant());
		List<TrainOrderApprove> approves = trainOrder.getApproves();
		setAttr("approveMap", getTrainShenpiMap(approves));
		setAttr("approvestatus", trainOrder.getApprovestatus());
	}

	private Map<Integer, List<TrainOrderApprove>> getTrainShenpiMap(List<TrainOrderApprove> approveList) {
		Map<Integer, List<TrainOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (TrainOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<TrainOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<TrainOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}

	// 出差申请单详情
	private void appformDetail(Long companyid, String applyno) {
		CrmAppform crmAppform = appformService.findByApprovalNo(companyid, applyno);
		setAttr("appForm", crmAppform);
		setAttr("approveMap", getAppformShenpiMap(crmAppform.getApproves()));
	}

	private Map<Integer, List<CrmAppformApprove>> getAppformShenpiMap(List<CrmAppformApprove> approveList) {
		Map<Integer, List<CrmAppformApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (CrmAppformApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<CrmAppformApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<CrmAppformApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}

	/**
	 * 出差申请单审批结果
	 * {"cid":"1","empid":"2","orderno":"MDW111841887430600","result":"Y通过N否决"
	 * ,"reason": "否决原因"}
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping("/order/approvesave")
	@ResponseBody
	public AuvgoResult approvesave(String orderno, String result, String reason) {
		try {
			CrmEmployee user = getUser();
			if (StringUtils.isBlank(orderno) || StringUtils.isBlank(result)) {
				return AuvgoResult.build(300, "数据异常");
			}
			CrmAppform order = appformService.findByApprovalNo(user.getCompanyid(), orderno);
			if (null == order) {
				return AuvgoResult.build(300, "没有获取到此订单信息");
			}
			Integer i = null;
			if ("N".equalsIgnoreCase(result)) {
				i = appformService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_FAIL, reason);
				return AuvgoResult.build(200, "审批否决成功");
			} else {
				i = appformService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_SUCCESS, "");
			}
			log.info("approvesave--->flag:{}", i);
			return AuvgoResult.build(200, "审批通过成功");
		} catch (Exception e) {
			log.warn("Exception--->e:{}", e.getCause());
			return AuvgoResult.build(301, "系统偶尔也会累，请重新提交或拨打客服电话4006060011", e.getMessage());
		}
	}

	@Autowired(required = false)
	public void setHotelOrderBusiness(IHotelOrderBusiness hotelOrderBusiness) {
		this.hotelOrderBusiness = hotelOrderBusiness;
	}

	/**
	 * 整合新酒店订单审批信息
	 * 
	 * @param data
	 * @param user
	 * @param tickets
	 * @return
	 */
	private List<Map<String, Object>> newHotelApproval(Page<OrderDetail> data, CrmEmployee user, HashMap<String, Integer> tickets, String type) {
		List<Map<String, Object>> hotelList = null;
		List<OrderDetail> items = data.getItems();
		hotelList = new ArrayList<Map<String, Object>>(items.size());
		for (OrderDetail orderDetail : items) {
			Map<String, Object> map = new HashMap<String, Object>();
			List<OrderApproval> approvals = orderDetail.getApprovals();
			if (approvals != null && !approvals.isEmpty()) {
				OrderApproval approval = null;
				for (OrderApproval oap : approvals) {
					if ("0".equals(type)) {// 待审批
						if ((user.getId() + "").equals(oap.getUserId()) && oap.getStatus() == BaseStatusContant.COM_APPROVE_STATUS) {
							approval = oap;
							break;
						}
					} else {
						if ((user.getId() + "").equals(oap.getUserId()) && oap.getStatus() != BaseStatusContant.COM_APPROVE_STATUS) {
							approval = oap;
							break;
						}
					}
				}
				map.put("approvetimesort", approval.getTime()); // 审批人审批时间
				map.put("opstatus", approval.getStatus()); // 审批人审批状态
			} else {
				continue;
			}
			OrderAuxiliary auxiliary = orderDetail.getAuxiliary();
			if (auxiliary != null) {
				map.put("bookname", auxiliary.getCreater()); // 预订人姓名
			} else {
				map.put("bookname", user.getName()); // 预订人姓名
			}
			map.put("createtimesort", DateUtils.parseDate(orderDetail.getCreateTime() + "", "yyyyMMddHHmmss")); // 订单创建时间
			map.put("orderno", orderDetail.getOrderNo()); // 订单号
			map.put("hotelName", orderDetail.getHotelName()); // 酒店名称
			map.put("chencheRen", orderDetail.getGuests()); // 出行人
			map.put("arrivalDate", DateUtils.parseDate(orderDetail.getCheckIn(), "yyyy-MM-dd")); // 入住日期
			map.put("departureDate", DateUtils.parseDate(orderDetail.getCheckOut(), "yyyy-MM-dd")); // 离店日期
			map.put("type", "newhotel"); // 离店日期
			hotelList.add(map);
		}
		Integer oldAll = tickets.get("all");
		tickets.put("newhotel", data.getTotal());
		tickets.put("all", oldAll + data.getTotal());
		return hotelList;
	}

}
