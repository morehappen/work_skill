package com.auvgo.web.face.air;

import com.auvgo.air.api.AirGaiQianService;
import com.auvgo.air.api.AirOrderLogService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.*;
import com.auvgo.airrate.api.book.IAirrateBookProvider;
import com.auvgo.airrate.ibe.pat.PatResult;
import com.auvgo.airrate.request.AirratePATRequest;
import com.auvgo.business.pay.order.PrepayOrderBusiness;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Date;
import java.util.HashMap;

@Controller
@RequestMapping("/air")
public class AirOrderController extends BaseController {

	@Autowired
	AirOrderService airOrderService;
	@Autowired
	AirOrderLogService airOrderLogService;
	@Autowired
	private IAirrateBookProvider airrateBookProvider;
	@Autowired
	AirGaiQianService gaiQianService;
	@Autowired(required = false)
	PrepayOrderBusiness prepayOrderBusiness;

	@RequestMapping("/confirm")
	@ResponseBody
	public AuvgoResult confirm(String orderno, String price) {
		log.info("/air/confirm ---> request orderno:{}", orderno);
		CrmEmployee user = getUser();
		try {
			if (StringUtils.isBlank(orderno) || null == user) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			AirOrder order = airOrderService.getOrderByorderNo(orderno);
			if (FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
				AuvgoResult auvgoResult = prepayOrderBusiness.checkPrePayAccount(getCompany().getBianhao(), order.getTotalprice());
				if (200 != auvgoResult.getStatus()) {
					AirOrderLog orderLog = new AirOrderLog(orderno, "预存款用户确认失败", user.getId(), "系统自动", "--", new Date(), "预存款账户" + auvgoResult.getMsg());
					airOrderLogService.saveOrUpdate(orderLog);
					return AuvgoResult.build(ErrorCode.WRONG_PARAMS, auvgoResult.getMsg());
				}
			}
			PatResult doPat = null;
			AirOrderRoutePass routePass = order.getRoutePass().get(0);
			AirOrderRoute route = order.getRoutes().get(0);
			if (null != order && "tespnr".equalsIgnoreCase(order.getPnr())) {
				String result = airOrderService.confirmOutTicket(orderno, user.getName(), "系统自动");
				log.info("/confirm --->response result:{}", result);
				return JsonUtils.jsonToPojo(result, AuvgoResult.class);
			}
			if (StringUtils.isNotBlank(order.getPayType()) && "2".equals(order.getPayType())) {
				return AuvgoResult.build(300, "暂不支持出票操作，请使用行旅管家APP处理");
			}
			if (null != order && !"tespnr".equalsIgnoreCase(order.getPnr())) {//之前过滤了官网的pat 现在加上
				AirratePATRequest patRequest = new AirratePATRequest();
				Double validPrice = getValidPrice(routePass, price);
				if (validPrice.doubleValue() == 0.0) {
					return AuvgoResult.build(300, "请勿输入非法参数" + price);
				}
				patRequest.setBookPirce(validPrice);
				patRequest.setFlightNo(route.getAirline());
				patRequest.setClientcode(route.getDkhCode());
				patRequest.setPlatform(route.getPricefrom());
				patRequest.setThirdNo(order.getPnr());
				patRequest.setAirlineCode(route.getCarriecode());
				patRequest.setCabin(route.getCode());
				patRequest.setClientcode(route.getDkhCode());
				patRequest.setDepAirport(route.getOrgcode());
				patRequest.setDepDate(route.getDeptdate());
				patRequest.setArrAirport(route.getArricode());
				patRequest.setTokenId(MDC.get("TraceId"));
				log.info("patRequest request:{}", jsonMapper.toJson(patRequest));
				doPat = airrateBookProvider.doPat(patRequest);
				log.info("patresult : result:{}", jsonMapper.toJson(doPat));
				if (!doPat.getIsSuccess()) {
					AirOrderLog orderLog = new AirOrderLog(orderno, "客服确认出票", user.getId(), "系统自动", "--", new Date(), user.getName() + "操作出票,验证价格溢价,系统等待客户确认该订单价格" + jsonMapper.toJson(doPat));
					airOrderLogService.saveOrUpdate(orderLog);
					HashMap<String, String> map = Maps.newHashMap();
					map.put("desc", "face确认出票，验证价格不通过");
					map.put("orderno", order.getOrderno());
					//airOrderService.sendCheckprice(map);
					return AuvgoResult.build(301, "当前舱位价格发生变动，最新价格", doPat.getData().get(0).getFarePirce());
				}
				if (routePass.getPrice().doubleValue() != validPrice.doubleValue()) {//说明 用户同意变价操作
					routePass.setPrice(validPrice);//更新最新价格
					routePass.setSalePrice(validPrice);
					routePass.setCaigouPrice(validPrice);
					airOrderService.updateRoutePass(order.getRoutePass());
				}
				String result = airOrderService.confirmOutTicket(orderno, user.getName(), "系统自动");
				log.info("/confirm --->response result:{}", result);
				return JsonUtils.jsonToPojo(result, AuvgoResult.class);
			}
		} catch (Exception e) {
			log.error("/confirm", e);
		}
		return AuvgoResult.build(ErrorCode.ERROR, "出票操作出现异常");
	}

	//获取价格
	public Double getValidPrice(AirOrderRoutePass routePass, String price) {
		if (StringUtils.isBlank(price)) {
			return routePass.getPrice();
		} else {
			if (!RegExpValidator.isNumber(price)) {
				return 0.0;//非法参数
			} else {
				return Double.parseDouble(price);
			}
		}
	}


	//取消订单
	@RequestMapping("/cancle")
	@ResponseBody
	public AuvgoResult cancle(String orderno) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "登录人信息有误,请重新登录后再操作");
		}
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		if (airOrder.getStatus() == AirStatusContant.AIR_ORDER_STATUS_CANCEL || airOrder.getStatus() == AirStatusContant.AIR_ORDER_STATUS_CHUPIAO
				|| airOrder.getStatus() == AirStatusContant.AIR_ORDER_STATUS_CHUPIAO_ING) {
			return AuvgoResult.build(300, "此订单在此状态下不能取消");
		}
		airOrderService.cancelOrder(orderno);
		AirOrderLog orderLog = new AirOrderLog(orderno, "取消订单", user.getId(), user.getName(), user.getDeptname(), new Date(), user.getName() + "申请取消了该订单");
		airOrderLogService.saveOrUpdate(orderLog);
		return AuvgoResult.build(200, "取消订单成功");
	}

	/**
	 * 审批结果
	 * {"cid":"1","empid":"2","orderno":"MDW111841887430600","result":"Y通过N否决"
	 * ,"reason": "否决原因"}
	 *
	 * @param orderno
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
			Integer i = null;
			if (orderno.startsWith("AG")) {
				AirGaiqian order = gaiQianService.getGaiqianByGqOrderNo(orderno);
				if (null == order) {
					return AuvgoResult.build(300, "没有获取到此订单信息");
				}
				// 修改订单审批信息
				if ("N".equalsIgnoreCase(result)) {
					// 取消订单
					i = gaiQianService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_FAIL, reason);
					// 如果改签失败,则将回滚到之前的状态
					airOrderService.rollbackOldOrderPassengersStatus(order, 0, null);
					return AuvgoResult.build(200, "审批否决成功");
				} else {
					// 更新订单审批表,发送mq
					i = gaiQianService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_SUCCESS, "");
				}
			} else {
				AirOrder order = airOrderService.getOrderByorderNo(orderno);
				if (null == order) {
					return AuvgoResult.build(300, "没有获取到此订单信息");
				}
				// 修改订单审批信息
				if ("N".equalsIgnoreCase(result)) {
					// 取消订单
					i = airOrderService.NewupdateOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_FAIL, reason);
					return AuvgoResult.build(200, "审批否决成功");
				} else {
					// 更新订单审批表,发送mq
					i = airOrderService.NewupdateOrderApprove(orderno, String.valueOf(user.getId()), AirStatusContant.COM_APPROVE_STATUS_SUCCESS, "");
				}
			}
			log.info("Airapprovesave--->flag:{}", i);
			return AuvgoResult.build(200, "审批通过成功");
		} catch (Exception e) {
			log.warn("Exception--->{}", e.getCause());
			return AuvgoResult.build(301, "系统偶尔也会累，请重新提交或拨打客服电话4006060011");
		}
	}

}