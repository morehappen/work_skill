package com.auvgo.web.face.fenxiao;

import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.AirOrder;
import com.auvgo.air.entity.AirOrderModel;
import com.auvgo.business.pay.order.PrepayOrderBusiness;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.TrainOrder;
import com.auvgo.train.entity.TrainOrderModel;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.util.ModelSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by realxxs on 2018/8/1.
 */
@Controller
@RequestMapping("/shareAcc")
public class FenxiaoAccountController extends BaseController {

	@Autowired(required = false)
	private PrepayOrderBusiness prepayOrderBusiness;
	@Autowired
	private AirOrderService airOrderService;
	@Autowired
	private TrainOrderService trainOrderService;


	@RequestMapping("/check")
	@ResponseBody
	public AuvgoResult checkPreyAccount(String signature, String type) {
		if (!FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
			return AuvgoResult.build(200, "success");
		}
		Double totalprice = 0.0;
		switch (type) {
			case "air":
				AirOrderModel orderModel = ModelSignature.decryptSign(signature, AirOrderModel.class);
				totalprice = orderModel.getAirOrder().getTotalprice();
				break;
			case "train":
				TrainOrderModel trainOrderModel = ModelSignature.decryptSign(signature, TrainOrderModel.class);
				totalprice = trainOrderModel.getOrder().getTotalprice();
				break;
		}
		if (totalprice == 0.0) {
			return AuvgoResult.build(300, "非法请求");
		}

		//需要校验账户金额
		AuvgoResult auvgoResult = prepayOrderBusiness.checkPrePayAccount(getCompany().getBianhao(), totalprice);
		if (200 == auvgoResult.getStatus()) {
			return AuvgoResult.build(200, "success");
		} else {
			return AuvgoResult.build(300, "预存款账户余额不足或者冻结");
		}
	}

	@RequestMapping("/beforeCofirm")
	@ResponseBody
	public AuvgoResult beforeChupiaoCheckAccount(String orderno, String type) {
		if (!FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
			return AuvgoResult.build(200, "success");
		}
		Double totalprice = 0.0;
		switch (type) {
			case "air":
				AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
				totalprice = airOrder.getTotalprice();
				break;
			case "train":
				TrainOrder trainOrder = trainOrderService.getOrderByorderNo(orderno);
				totalprice = trainOrder.getTotalprice();
				break;
		}
		//需要校验账户金额
		AuvgoResult auvgoResult = prepayOrderBusiness.checkPrePayAccount(getCompany().getBianhao(), totalprice);
		if (200 == auvgoResult.getStatus()) {
			return AuvgoResult.build(200, "success");
		} else {
			return AuvgoResult.build(300, "预存款账户余额不足或者冻结");
		}
	}

}
