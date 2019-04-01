package com.auvgo.web.face.hotel;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.contant.HotelStatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmProjectService;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.hotel.api.HotelOrderLogService;
import com.auvgo.hotel.api.HotelOrderService;
import com.auvgo.hotel.entity.HotelOrder;
import com.auvgo.hotel.entity.HotelOrderApprove;
import com.auvgo.hotel.entity.HotelOrderLog;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
@RequestMapping("/hotel/order")
@Controller
public class HotelOrderController extends BaseController {
	private String status_str="";
	@Autowired
	private HotelOrderService hotelOrderService;
	@Autowired
	private CrmCostCenterService crmCostCenterService;
	@Autowired
	private CrmProjectService crmProjectService;
	@Autowired
	private HotelOrderLogService hotelOrderLogService;
	/**
	 * 获取酒店 历史入住人
	 * @param size 入住人size
	 * @return
	 */
	@RequestMapping("/ancients")
	@ResponseBody
	public AuvgoResult getHistoryHotelUsers(Integer size){
		try {
			log.info("/ancients-->request size:{}", size);
			CrmEmployee user = getUser();
			if(null==user|| null == user.getId()){
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS,ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			size = null == size?5:size;
			List<Map<String,Object>> list = hotelOrderService.getHistoryHotelUsers(user.getId(), size);
			log.info("/ancients-->reponse {}", JsonUtils.objectToJson(list));
			return AuvgoResult.build(ErrorCode.SUCCESS,"success",JsonUtils.objectToJson(list));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(300,"获取历史乘车人失败！！");
		}
	}
	
	/**
	 * 条状订单详情页
	 * 
	 * @param orderno
	 * @return
	 */
	@RequestMapping("/detail/{orderno}")
	public String toOrderDetail(@PathVariable("orderno") String orderno) {
		HotelOrder hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
		Long cid = hotelOrder.getCompanyid();	
		//审批人
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
		
		// 成本中心列表
		List<CrmCostCenter> costList = crmCostCenterService.getListBycid(cid);
		// 获取项目
		List<CrmProject> projectlist = crmProjectService.getListBycid(cid);		
		
		setAttr("costList", JsonUtils.objectToJson(costList));			
		setAttr("projectlist", JsonUtils.objectToJson(projectlist));	
		setAttr("hotelOrder", hotelOrder);								
		boolean selfPay = hotelOrder.getPaymentType().equals("SelfPay")? true : false; 
		getStateString(hotelOrder.getStatus(), hotelOrder.getApprovestatus(), hotelOrder.getPaystatus(), selfPay );
		setAttr("status_str", status_str);

		setAttr("approveMap", maps);								
		setAttr("approvestatus", hotelOrder.getApprovestatus());
		return "/hotel/hotel-order-detail";
	}
	
	/**
	 * 取消订单{"orderno:"""}
	 * 
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/cancel", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult cancel(String orderNo) {
		try {
			if (StringUtils.isBlank(orderNo)) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			HotelOrder hotelOrder = hotelOrderService.getOrderByOrderNo(orderNo);
			if(null !=hotelOrder && hotelOrder.getOrderfrom()== BaseStatusContant.COM_ORDER_FROM_ZUOXI_SG){
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, "如需操作取消此订单，请拨打客服电话4006060011");
			}
			HotelOrderLog logs= new HotelOrderLog(orderNo, "web-api酒店订单取消", hotelOrder.getBookuserid(), hotelOrder.getBookusername(), "", new Date(), "客户发起取消订单请求");
			hotelOrderLogService.saveOrUpdate(logs);
			hotelOrderService.cancelOrder(orderNo);
			//return AuvgoResult.build(ErrorCode.SUCCESS, "success", "取消成功");
			log.debug("cancel request:{} ", orderNo);
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", "取消中");
		} catch (Exception e) {
			e.printStackTrace();
			log.error("orderNo:{}, error:{}", orderNo, e);
			return AuvgoResult.build(ErrorCode.ERROR, "发生异常", e.getMessage());
		}
	}
	
	
	
	
	/**
	 * 判断酒店订单状态
	 * @param status
	 * @param approvestatus
	 * @param paystatus
	 * @param selfPay
	 * @return
	 */
	private Map<String,String> getStateString(int status, int approvestatus, int paystatus, boolean selfPay) {
		Map<String,String> mapStatus = Maps.newHashMap();
		status_str = "";
		if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {// 6
			status_str = "已取消";
		}
		//如果是  已提交，待审批/无需审批，未支付 （没有调用艺龙接口之前的初始状态）
		else if(status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT && 
				(approvestatus == HotelStatusContant.COM_APPROVE_STATUS || approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO)
				&& (paystatus==HotelStatusContant.HOTEL_PAY_STATUS || paystatus == HotelStatusContant.HOTEL_PAY_WEIDANBAN)){
			status_str = "已提交";
			//mapStatus.put("cancel", "取消");
		}
		//如果无需审批、或者审批通过
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO || // 3
				approvestatus == HotelStatusContant.COM_APPROVE_STATUS_SUCCESS) {// 1
			//审批步骤结束，进行订单状态的判断
			if (selfPay) {// 现付 到店付
				checkOrderState(status, paystatus,mapStatus);
			} else {// 预付
				checkOrderState4PrePay(status, paystatus,mapStatus);
			}
		}
		//如果审批否决
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_FAIL) {// 2
			status_str = "审批否决";
			mapStatus.put("cancel", "取消");
			//vm.setButtonState("", "", false, false);
		}
		// 如果是待审批（已经闭合）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_WAIT) {// 5
			status_str = "待审批";
			mapStatus.put("cancel", "取消");
			//vm.setButtonState("", "", false, true);

		} else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_ING) {// 4
			//vm.setButtonState("", "", false, true);
			status_str = "审批中";
			mapStatus.put("cancel", "取消");
		}
		mapStatus.put("status_str", status_str);
		return mapStatus;
	}
	
	/**
     * 判断订单的状态、包括了担保状态
     */
    private void checkOrderState(int status, int paystatus,Map<String,String> mapStatus) {
      //  现付，担保
    if (paystatus == HotelStatusContant.HOTEL_PAY_DAIDANBAO) {//等待担保4
        status_str = "等待担保";
        mapStatus.put("danbao", "担保");
        mapStatus.put("cancel", "取消");
        //vm.setButtonState("担保", "取消", true, true);
        /*
		        现付不担保
		        现付担保成功
		        预付支付成功以后
         */
        //现付不担保
      //已确认
	   }else if(status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN){//已确认 4
	 	   status_str = "已确认";
	 	   mapStatus.put("cancel", "取消");
       }else if(paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS){ //支付成功  1
    	   status_str = "支付成功";
           mapStatus.put("cancel", "取消");
       }else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_ING) {//6
            status_str = "担保中";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "", false, true);
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN) {//等待确认 2
            status_str = "等待确认";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //  现付担保失败
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_FAIL) {//担保失败 7
            status_str = "担保失败";
            mapStatus.put("danbao", "重新担保");
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //   确认中
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) { //3
            status_str = "确认中";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //确认失败
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {//5
            status_str = "确认失败";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //确认成功
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {//8
            status_str = "等待入住";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        }
    }

    /**
     * 判断订单的状态、不包括担保状态，其实可以跟上面合并
     */
    private void checkOrderState4PrePay(int status, int paystatus,Map<String,String> mapStatus) {
        //确认中
        if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) {//3
            status_str = "确认中";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //确认失败
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {//5
            status_str = "确认失败";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        //确认成功
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {//8
            status_str = "等待入住";
            mapStatus.put("cancel", "取消");
            //vm.setButtonState("", "取消", false, true);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DAITUIKUAN) {//8
            status_str = "待退款";
           // vm.setButtonState("", "", false, false);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_SUCCESS) {//9;
            status_str = "退款成功";
            //vm.setButtonState("", "", false, false);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_FAIL) {// 10
            status_str = "退款失败";
           // vm.setButtonState("", "", false, false);
        //订单已提交、待支付
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {//6
            status_str = "已取消";
            //vm.setButtonState("", "", false, false);
        } else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT) {//7
            checkPayStatus(paystatus,mapStatus);
        }
    }
    /**
     * 支付状态的判断
     */
    private void checkPayStatus(int paystatus,Map<String,String> mapStatus) {
        if (paystatus == HotelStatusContant.HOTEL_PAY__DAIZHIFU) {//待支付3
            status_str = "待支付";
            mapStatus.put("zhifu", "支付");
            mapStatus.put("cancel", "取消");
            //vm.setButtonState(getPayStr(), "取消", true, true);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_FAIL) {//支付失败8192
            //status_str = "支付失败";
            status_str = "支付中";
            mapStatus.put("zhifu", "支付");
            mapStatus.put("cancel", "取消");
            //vm.setButtonState(getPayStr(), "取消", true, true);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_ZHIFU_ING) {//支付中4096
            status_str = "支付中";
            mapStatus.put("cancel", "取消");
           // vm.setButtonState("", "取消", false, true);
        } else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS) {//支付成功1
            status_str = "支付成功";
            mapStatus.put("cancel", "取消");
           // vm.setButtonState("", "取消", false, true);
        }else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS) {//未支付 0
            status_str = "未支付";
            mapStatus.put("cancel", "取消");
           // vm.setButtonState("", "取消", false, true);
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
	public AuvgoResult approvesave(String orderno,String result,String reason) {
		try {
			CrmEmployee user = getUser();
			if ( StringUtils.isBlank(orderno) || StringUtils.isBlank(result)) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			HotelOrder order = hotelOrderService.getOrderByOrderNo(orderno);
			if (null == order) {
				return AuvgoResult.build(ErrorCode.ERROR, "没有获取到此订单信息");
			}
			Integer i=null ;
			// 修改订单审批信息
			if ("N".equalsIgnoreCase(result)) {
				order.setStatus(HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL);
				// 订单的审批状态为审批否决
				order.setApprovestatus(HotelStatusContant.COM_APPROVE_STATUS_FAIL);
				// 前端的显示状态为订单已取消
				order.setShowstatus(String.valueOf(AirStatusContant.AIR_FACE_STATUS_CANCLE));
				 i = hotelOrderService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), HotelStatusContant.COM_APPROVE_STATUS_FAIL, reason);
				return AuvgoResult.build(200, "审批否决成功");
			} else {
				// 更新订单审批表,发送mq
				i = hotelOrderService.updateNewOrderApprove(orderno, String.valueOf(user.getId()), HotelStatusContant.COM_APPROVE_STATUS_SUCCESS, "");
			}
			log.info("Hotelapprovesave --->flag:{}",i);
			return AuvgoResult.build(200, "审批通过成功");
		} catch (Exception e) {
			log.warn("Exception--->e:{}",e.getCause());
			return AuvgoResult.build(300, "系统偶尔也会累，请重新提交或拨打客服电话4006060011", e.getMessage());
		}
	}
}
