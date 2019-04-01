package com.auvgo.web.face.hotel.order;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.business.hotel.model.BookModel;
import com.auvgo.business.hotel.order.IHotelOrderBusiness;
import com.auvgo.business.hotel.order.exception.OrderApprovalException;
import com.auvgo.business.hotel.order.model.QueryOrderModel;
import com.auvgo.common.utils.ResultCode;
import com.auvgo.constants.approve.ApprovalType;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmDepartment;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.hotel.order.api.dto.order.CancelOrderDTO;
import com.auvgo.hotel.order.api.dto.req.CancelOrderReq;
import com.auvgo.hotel.order.api.dto.res.OrderApproOperationRes;
import com.auvgo.hotel.order.api.dto.res.OrderPayRes;
import com.auvgo.hotel.orm.order.entity.OrderApproval;
import com.auvgo.hotel.orm.order.entity.OrderDetail;
import com.auvgo.web.face.BaseController;

/**
 * 酒店订单
 * 
 * @author liucongcong
 */
@Controller
@RequestMapping("/hotel/order")
public class HotelNewOrderController extends BaseController {
	private static final Logger log = LogManager.getLogger(HotelNewOrderController.class);
	/** 酒店订单 **/
	private IHotelOrderBusiness hotelOrderBusiness;
	/** 公司部门 **/
	private CrmDepartmentService crmDepartmentService;

	/**
	 * 查询个人订单列表
	 * 
	 * @param queryModel
	 * @return
	 */
	@RequestMapping(value = "/my/list", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView myList(QueryOrderModel queryModel) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmEmployee user = getUser();
			queryModel.setCreate(user.getId().toString()); // 预订人id
			map = hotelOrderBusiness.list(queryModel);
			CrmCompany company = getCompany();
			// 判断是否分销公司
			boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
			map.put("prePayCompany", prePayCompany);
			map.put("url", "/hotel/order/my/list");
			map.put("tag", "per");
		} catch (Exception e) {
			log.error("list fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-list", map);
	}

	/**
	 * 查询全部订单列表
	 * 
	 * @param queryModel
	 * @param queryType
	 * @return
	 */
	@RequestMapping(value = "/all/list", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView allList(QueryOrderModel queryModel) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			initSeqrchParam(queryModel);
			map = hotelOrderBusiness.list(queryModel);
			CrmCompany company = getCompany();
			boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
			map.put("prePayCompany", prePayCompany);
			map.put("url", "/hotel/order/all/list");
			map.put("tag", "all");
		} catch (Exception e) {
			log.error("list fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-list", map);
	}

	// 待支付订单列表
	@RequestMapping(value = "/wait/pay/list", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView waitPayList(QueryOrderModel queryModel) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmEmployee user = getUser();
			queryModel.setCreate(user.getId().toString());
			queryModel.setOrderType("face-wpay");
			map = hotelOrderBusiness.list(queryModel);
			CrmCompany company = getCompany();
			boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
			map.put("prePayCompany", prePayCompany);
			map.put("url", "/hotel/order/wait/pay/list");
			map.put("tag", "wpay");
		} catch (Exception e) {
			log.error("list fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-list", map);
	}

	/**
	 * 初始查询条件
	 * 
	 * @param queryModel
	 */
	private void initSeqrchParam(QueryOrderModel queryModel) {
		CrmEmployee user = getUser();
		String level = user.getLevel();// 级别权限 all:全部 dept:本部门 geren:个人
		if ("dept".equals(level)) {
			// 本部门
			List<CrmDepartment> departMents = crmDepartmentService.getDeptAndSubDeptById(user.getCompanyid(), user.getDeptid());
			if (departMents != null && !departMents.isEmpty()) {
				List<String> createDepIds = new ArrayList<String>();
				for (CrmDepartment dep : departMents) {
					createDepIds.add(dep.getId() + "");
				}
				queryModel.setCreateDetIds(createDepIds);
			}
		} else if ("geren".equals(level)) {
			// 个人
			queryModel.setCreate(user.getId().toString());
		} else {
			// 全公司
			queryModel.setCustomerNo(getCompany().getBianhao());
		}
	}

	/**
	 * 根据订单号查询订单详情 (来源全部订单)
	 * 
	 * @param orderNo
	 *            订单号
	 * @return
	 */
	@RequestMapping(value = "/all/input/{orderNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView allInput(@PathVariable("orderNo") String orderNo) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			map = hotelOrderBusiness.detail(orderNo);
		} catch (Exception e) {
			log.error("allInput fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-all", map);
	}

	/**
	 * 根据订单号查询订单详情 (来源个人订单)
	 * 
	 * @param orderNo
	 *            订单号
	 * @return
	 */
	@RequestMapping(value = "/per/input/{orderNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView perInput(@PathVariable("orderNo") String orderNo) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			map = hotelOrderBusiness.detail(orderNo);
		} catch (Exception e) {
			log.error("perInput fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-per", map);
	}

	/**
	 * 根据订单号查询订单详情 (来源审批列表)
	 * 
	 * @param orderNo
	 *            订单号
	 * @param type
	 *            审批订单传过来的参数 审批类型-模块 (例如:0-newhotel)
	 * @return
	 */
	@RequestMapping(value = "/approval/input/{orderNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView approvalInput(@PathVariable("orderNo") String orderNo, String type) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmEmployee user = getUser();
			map = hotelOrderBusiness.detail(orderNo);
			// 获取当前审批人详细
			OrderDetail OrderDetail = (OrderDetail) map.get("orderDetail");
			List<OrderApproval> approvals = OrderDetail.getApprovals();
			if (null != approvals && !approvals.isEmpty()) {
				OrderApproval approval = null;
				for (OrderApproval orderApproval : approvals) {
					if ((user.getId() + "").equals(orderApproval.getUserId())) {
						approval = orderApproval;
						break;
					}
				}
				map.put("approval", approval); // 当前审批人
			}
			map.put("type", type); // 当前审批人
		} catch (Exception e) {
			log.error("approvalInput fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-apro", map);
	}

	/**
	 * 根据订单号查询订单详情 (来源待支付订单)
	 * 
	 * @param orderNo
	 *            订单号
	 * @return
	 */
	@RequestMapping(value = "/wpay/input/{orderNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView waitPayInput(@PathVariable("orderNo") String orderNo) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			map = hotelOrderBusiness.detail(orderNo);
		} catch (Exception e) {
			log.error("waitPayInput fail", e);
		}
		return new ModelAndView("/hotel/order/hotel-order-wpay", map);
	}

	/**
	 * 取消订单
	 * 
	 * @param cancelOrder
	 * @return
	 */
	@RequestMapping(value = "/cancel/order", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody AuvgoResult cancelOrder(CancelOrderReq cancelOrder) {
		AuvgoResult result = null;
		try {
			CrmEmployee user = getUser();
			cancelOrder.setOperator(user.getId().toString());
			cancelOrder.setOperatorName(user.getName());
			cancelOrder.setCustomerNo(getCompany().getBianhao());
			CancelOrderDTO cancelOrderDTO = hotelOrderBusiness.cancelOrder(cancelOrder);
			result = AuvgoResult.build(200, "取消订单成功", cancelOrderDTO);
		} catch (Exception e) {
			log.error("cancelOrder fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(300, "网络超时,请刷新页面确认是否已经取消成功");
			} else {
				result = AuvgoResult.build(300, "取消订单失败：" + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * 审批订单
	 * 
	 * @param orderno
	 *            订单号
	 * @param result
	 *            Y-通过 N-否决
	 * @param reason
	 *            原因
	 * @return
	 */
	@RequestMapping(value = "/approval", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody AuvgoResult orderApproval(String orderno, String result, String reason) {
		AuvgoResult auvgResult = null;
		try {
			CrmEmployee user = getUser();
			String status = "Y".equals(result) ? BaseStatusContant.COM_APPROVE_STATUS_SUCCESS + "" : BaseStatusContant.COM_APPROVE_STATUS_FAIL + "";
			OrderApproOperationRes approvalResult = hotelOrderBusiness.hotelOrderApproval(orderno, user.getId() + "", status, reason, ApprovalType.WEB.toString());
			if (approvalResult.getData().getType() != 3) {
				auvgResult = AuvgoResult.build(200, "审批成功", approvalResult);
			} else {
				auvgResult = AuvgoResult.build(300, approvalResult.getData().getMsg());
			}
		} catch (OrderApprovalException e) {
			log.error("orderApproval fail", e);
			auvgResult = AuvgoResult.build(300, "审批失败" + e.getMessage());
		} catch (Exception e) {
			log.error("orderApproval fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgResult = AuvgoResult.build(300, "网络超时,请刷新页面确认是否已经审批成功");
			} else {
				auvgResult = AuvgoResult.build(300, "审批失败" + e.getMessage());
			}
		}
		return auvgResult;
	}

	@RequestMapping(value = "/pay/{orderNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView pay(@PathVariable("orderNo") String orderNo) {
		Map<String, Object> map = null;
		try {
			map = hotelOrderBusiness.paySkip(orderNo);
		} catch (Exception e) {
			log.error("pay fail", e);
		}
		return new ModelAndView(map.get("url") + "", map);
	}

	@RequestMapping(value = "/doPay", method = { RequestMethod.POST })
	public ModelAndView doPay(BookModel book) {
		Map<String, Object> map = new HashMap<String, Object>();
		String path = "";
		OrderPayRes res = null;
		try {
			res = hotelOrderBusiness.doPay(book, getUser());
			map.put("orderNo", book.getCustOrderNo());
			if (ResultCode.SUCESS.equals(res.getStatus())) {
				path = "/hotel/order/hotel-payment-success";
			} else {
				path = "/hotel/order/hotel-payment-fail";
				map.put("data", res);
			}
		} catch (Exception e) {
			log.error("doPay fail", e);
			String msg = "";
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				msg = "网络超时,请刷新页面确认是否已支付成功";
			} else {
				msg = "支付失败";
			}
			res.getData().setMsg(msg);
			map.put("data", res);
			path = "/hotel/order/hotel-payment-fail";
		}
		return new ModelAndView(path, map);
	}

	@Autowired(required = false)
	public void setHotelOrderBusiness(IHotelOrderBusiness hotelOrderBusiness) {
		this.hotelOrderBusiness = hotelOrderBusiness;
	}

	@Autowired(required = false)
	public void setCrmDepartmentService(CrmDepartmentService crmDepartmentService) {
		this.crmDepartmentService = crmDepartmentService;
	}

}
