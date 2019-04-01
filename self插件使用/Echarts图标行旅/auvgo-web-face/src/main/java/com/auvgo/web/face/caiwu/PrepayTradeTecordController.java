package com.auvgo.web.face.caiwu;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.common.page.Page;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.pay.api.IPrepayAccountWSService;
import com.auvgo.pay.api.IPrepayTradeRecordWSService;
import com.auvgo.pay.dto.req.PrepayTradeQueryReq;
import com.auvgo.pay.orm.crm.entity.PrepayAccount;
import com.auvgo.pay.orm.order.entity.PrepayTradeRecord;
import com.auvgo.web.face.BaseController;

/**
 * 预付款交易记录
 * 
 * @author liucongcong
 *
 */
@Controller
@RequestMapping("/prepay/trade/tecord")
public class PrepayTradeTecordController extends BaseController {

	/** 预付款账户 **/
	private IPrepayAccountWSService prepayAccountWSService;
	/** 交易流水 **/
	private IPrepayTradeRecordWSService prepayTradeRecordWSService;

	@RequestMapping("/list")
	public ModelAndView list(PrepayTradeQueryReq model, Integer index, Integer size) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmCompany company = getCompany();
			PrepayAccount pa = new PrepayAccount();
			pa.setCustomerNo(company.getBianhao());
			List<PrepayAccount> list = prepayAccountWSService.findBy(pa);
			if (list != null && !list.isEmpty()) {
				map.put("prepayAccount", list.get(0));
			}
			Page<PrepayTradeRecord> page = new Page<PrepayTradeRecord>();
			page.setIndex(index == null ? 1 : index);
			page.setSize(size == null ? 15 : size);
			if (StringUtils.isBlank(model.getStartTime()) || StringUtils.isBlank(model.getEndTime())) {
				model.setStartTime(DateUtils.toString(DateUtils.changeTime(new Date(), DateUtils.DAY, -90), "yyyy-MM-dd"));
				model.setEndTime(DateUtils.toString(DateUtils.changeTime(new Date(), DateUtils.DAY, 1), "yyyy-MM-dd"));
			}
			model.setCustomerNo(company.getBianhao());
			page = prepayTradeRecordWSService.findPageByModel(page, model);
			map.put("page", page);
			map.put("model", model);
		} catch (Exception e) {
			log.error("list fail", e);
		}
		return new ModelAndView("/caiwu/prepay-trade-tecord-list", map);
	}

	@Autowired(required = false)
	public void setPrepayAccountWSService(IPrepayAccountWSService prepayAccountWSService) {
		this.prepayAccountWSService = prepayAccountWSService;
	}

	@Autowired(required = false)
	public void setPrepayTradeRecordWSService(IPrepayTradeRecordWSService prepayTradeRecordWSService) {
		this.prepayTradeRecordWSService = prepayTradeRecordWSService;
	}

}
