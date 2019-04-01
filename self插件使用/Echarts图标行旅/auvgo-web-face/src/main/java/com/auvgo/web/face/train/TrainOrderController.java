package com.auvgo.web.face.train;

import com.auvgo.business.pay.order.PrepayOrderBusiness;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.ConvertUtils;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmProjectService;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.train.api.TrainOrderLogService;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.api.TrainTuipiaoService;
import com.auvgo.train.entity.TrainOrder;
import com.auvgo.train.entity.TrainOrderLog;
import com.auvgo.train.entity.TrainOrderUsers;
import com.auvgo.traincl.api.ws.CLTrainOrderService;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 火车票订单controller
 *
 * @author zxb
 */

@Controller
@RequestMapping("/train/order")
public class TrainOrderController extends BaseController {
	@Autowired
	private TrainOrderService orderService;
	@Autowired
	private TrainOrderLogService orderLogService;
	@Autowired
	private CLTrainOrderService cLTrainOrderService;
	@Autowired
	private TrainTuipiaoService tuipiaoService;
	@Autowired(required = false)
	PrepayOrderBusiness prepayOrderBusiness;
	@Autowired
	private CrmCostCenterService crmCostCenterService;
	@Autowired
	private CrmProjectService crmProjectService;

	/**
	 * 确认出票{"orderno:""}
	 *
	 * @param orderno
	 * @return
	 */
	@RequestMapping(value = "/confirm/{orderno}")
	public String confirm(@PathVariable("orderno") String orderno) {
		try {
			if (StringUtils.isBlank(orderno)) {
				setAttr("Msg", "订单不存在或订单错误！");
				return "/common/404";

			}
			CrmEmployee user = getUser();
			TrainOrder trainOrder = orderService.getOrderByorderNo(orderno);
			List<TrainOrderUsers> users = trainOrder.getUsers();
			setAttr("order", trainOrder);
			if (StringUtils.isNotBlank(trainOrder.getPayType()) && "2".equals(trainOrder.getPayType())) {
				setAttr("Msg", "暂不支持出票操作，请使用行旅管家APP处理");
				return "/common/404";
			}
			// 0: 未订座, 1: 已订座, 2: 已出票,3: 已取消 ,4: 订座失败,5:出票失败, 6: 出票中, 7:订座中
			// 待出票
			if (trainOrder.getShowStatus() == 3) {
				// 出票
				String result = orderService.confirmOutTicket(orderno);
				log.info("confirm response orderno:{},result:{}", orderno, result);

				@SuppressWarnings("unchecked")
				Map<String, Object> map = JsonUtils.jsonToPojo(result, Map.class);
				if (Integer.valueOf(String.valueOf(map.get("status"))).intValue() == 200) {
					setAttr("title", "出票中");
					setAttr("msg", "系统正在努力为您出票！");
				} else {
					setAttr("title", "出票失败");
					setAttr("title", map.get("msgInfo"));
				}
				// 出票成功
			} else if (trainOrder.getStatus() == 2) {
				setAttr("title", "出票成功");
				setAttr("msg", "您选择的车次出票成功，祝您旅途愉快!");
			} else if (trainOrder.getStatus() == 5) {
				setAttr("title", "出票失败");
				setAttr("msg", "由于\"" + trainOrder.getFailReason() + "\"原因，导致订座失败，请继续预订！");
			} else {
				AuvStatusContant auv = new AuvStatusContant();
				setAttr("title", auv.gettrainfaceStatus(trainOrder.getShowStatus()));
				setAttr("msg", trainOrder.getFailReason());
			}
			// 表示点击确认出票进的页面
			setAttr("flag", "1");
			setAttr("names", ConvertUtils.extractElementPropertyToString(users, "userName", ","));
			setAttr("route", trainOrder.getRoute());
			setAttr("ordernos", orderno);
			setAttr("orderNO", orderno);

			return "/train/train-book-success";
		} catch (Exception e) {
			log.warn("orderno:{},Exception:{}", orderno, e);
			setAttr("Msg", "出票失败！");
			return "/common/404";
		}
	}

	/**
	 * 取消订单
	 *
	 * @param orderno
	 * @return
	 */
	@RequestMapping("/cancel")
	@ResponseBody
	public AuvgoResult cancelOrder(String orderno) {
		// 订单状态:0:已提交，未订座,1:订座成功,4订座失败,2:出票成功,3:已取消,5出票失败',
		try {
			TrainOrder trainOrder = orderService.getOrderByorderNo(orderno);
			if (trainOrder.getStatus() == 3) {
				return AuvgoResult.build(300, "该订单状态已操作取消,请勿重复提交");
			} else {
				if (trainOrder.getStatus() == 1 || trainOrder.getStatus() == 0) {
					orderService.cancelOrder(orderno);
					CrmEmployee user = getUser();
					TrainOrderLog orderLog = new TrainOrderLog(orderno, "取消订单", user.getId(), user.getName(),
							user.getDeptname(), new Date(), user.getName() + "操作了取消订单");
					orderLogService.saveOrUpdate(orderLog);
					return AuvgoResult.build(200, "取消请求已提交！");
				} else {
					return AuvgoResult.build(300, "订单取消失败");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "订单取消失败");
	}

	/**
	 * 历史乘车人
	 *
	 * @param size
	 * @return
	 */
	@RequestMapping("/ancients")
	@ResponseBody
	public AuvgoResult getHistoryTrainUsers(Integer size) {
		try {
			log.info("/ancients-->request size:{}", size);
			CrmEmployee user = getUser();
			if (null == user || null == user.getId()) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			size = null == size ? 5 : size;
			List<Map<String, Object>> list = orderService.getHistoryTrainUsers(user.getId(), size);
			if (null != list && !list.isEmpty()) {
				Iterator<Map<String, Object>> iterator = list.iterator();
				while (iterator.hasNext()) {
					Map<String, Object> next = iterator.next();
					String userid = String.valueOf(next.get("id"));
					String deptid = String.valueOf(next.get("deptid"));
					//查询成本中心和项目中心
					List<CrmCostCenter> costEmployeeOrDept = crmCostCenterService.getCostEmployeeOrDept(user.getCompanyid(), Long.valueOf(userid), Long.valueOf(deptid));
					if (null != costEmployeeOrDept && !costEmployeeOrDept.isEmpty()) {
						next.put("costId", costEmployeeOrDept.get(0).getId());
						next.put("costName", costEmployeeOrDept.get(0).getName());
					} else {
						next.put("costId", "");
						next.put("costName", "--");
					}
					List<CrmProject> crmProjects = crmProjectService.getprojectEmployeeOrDept(user.getCompanyid(), Long.valueOf(userid), Long.valueOf(deptid));
					if (null != crmProjects && !crmProjects.isEmpty()) {
						next.put("itemNumberId", crmProjects.get(0).getId());
						next.put("itemNumber", crmProjects.get(0).getName());
					} else {
						next.put("itemNumberId", "");
						next.put("itemNumber", "--");
					}
				}
			}
			log.info("/ancients-->reponse {}", JsonUtils.objectToJson(list));
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(list));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(300, "获取历史乘车人失败！！");
		}
	}

	/**
	 * 申请退票
	 *
	 * @param orderno
	 * @return
	 */
	@RequestMapping("/refund/{orderno}")
	public String refundOrder(@PathVariable("orderno") String orderno) {
		if (StringUtils.isBlank(orderno)) {
			setAttr("Msg", "参数为空!");
			return "/common/404";
		}
		try {
			TrainOrder order = orderService.getOrderByorderNo(orderno);
			String fei = tuipiaoService.getTuipiaoFei(order.getTicketprice(),
					order.getRoute().getTravelTime() + " " + order.getRoute().getFromTime());
			List<TrainOrderUsers> users = order.getUsers();
			List<TrainOrderUsers> newUserList = Lists.newArrayList();
			for (TrainOrderUsers user : users) {
				if (user.getTuipiaostatus() == 0 && user.getGaiqianstatus() == 0) {
					newUserList.add(user);
				}
			}
			setAttr("empList", newUserList);
			setAttr("tuiFei", fei.substring(fei.indexOf("/") + 1, fei.length()));
			setAttr("order", order);
			return "/crm/my-chailv/train/train-apply-refund";

		} catch (Exception e) {
			e.printStackTrace();
			log.info("refund -->eror:{}", e);
			return "/common/404";
		}
	}

	/**
	 * 申请改签
	 *
	 * @param orderno
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/endorse/{orderno}")
	public String endorseOrder(@PathVariable("orderno") String orderno) {
		log.info("/train/gaiqian/endorse -->request:{}", orderno);
		try {
			TrainOrder order = orderService.getOrderByorderNo(orderno);
			if (order == null) {
				setAttr("Msg", "该订单不存在!");
				return "/common/404";
			}
			List<TrainOrderUsers> users = order.getUsers();
			List<TrainOrderUsers> emps = Lists.newArrayList();
			for (int i = 0; i < users.size(); i++) {
				TrainOrderUsers u = users.get(i);
				// 校验是否可以改签
				String result = cLTrainOrderService.checkGaiqian(order.getOrderId(), u.getPassengerId(), "0");
				Map<String, Object> resultMap = JsonUtils.jsonToPojo(result, Map.class);
				if ("100".equals(resultMap.get("msgCode"))) {
					if (u.getTuipiaostatus() == 0) {
						if (u.getGaiqianstatus() == 0) {
							emps.add(u);// 直接从原订单中取人的信息
						}
					}
				}
			}
			setAttr("empList", emps);
			setAttr("order", order);
			return "/crm/my-chailv/train/train-apply-endorse";
		} catch (Exception e) {
			e.printStackTrace();
			log.error("/train/gaiqian/endorse -->error:{}", e);
			setAttr("Msg", "申请改签失败!");
			return "/common/404";
		}
	}

	/**
	 * 审批结果
	 * {"cid":"1","empid":"2","orderno":"MDW111841887430600","result":"Y通过N否决"
	 * ,"reason": "否决原因"}
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping("/approvesave")
	@ResponseBody
	public AuvgoResult approvesave(String orderno, String result, String reason) {
		try {
			CrmEmployee user = getUser();
			if (StringUtils.isBlank(orderno) || StringUtils.isBlank(result)) {
				return AuvgoResult.build(300, "数据异常");
			}
			Integer i = null;
			TrainOrder order = orderService.getSigleOrderByOrderNo(user.getCompanyid(), orderno);
			if (null == order) {
				return AuvgoResult.build(300, "没有获取到此订单信息");
			}
			// 修改订单审批信息
			if ("N".equalsIgnoreCase(result)) {
				// 取消订单
				order.setApprovestatus(AuvStatusContant.COM_APPROVE_STATUS_FAIL);
				orderService.saveOrUpdate(order);
				i = orderService.updateNewOrderApprove(orderno, String.valueOf(user.getId()),
						AuvStatusContant.COM_APPROVE_STATUS_FAIL, reason);
				return AuvgoResult.build(200, "审批否决成功");
			} else {
				i = orderService.updateNewOrderApprove(orderno, String.valueOf(user.getId()),
						AuvStatusContant.COM_APPROVE_STATUS_SUCCESS, "");
			}
			log.info("Trainapprovesave --->flag:{}", i);
			return AuvgoResult.build(200, "审批通过成功");
		} catch (Exception e) {
			log.warn("Exception--->e:{}", e.getCause());
			return AuvgoResult.build(301, "系统偶尔也会累，请重新提交或拨打客服电话4006060011", e.getMessage());
		}
	}
}
