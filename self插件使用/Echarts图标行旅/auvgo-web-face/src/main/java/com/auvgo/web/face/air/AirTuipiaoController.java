package com.auvgo.web.face.air;

import com.auvgo.air.api.AirOrderLogService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.api.AirTuiPiaoService;
import com.auvgo.air.entity.*;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.face.BaseController;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/air/tuipiao")
public class AirTuipiaoController extends BaseController {
	@Autowired
	private AirOrderService airOrderService;
	@Autowired
	private DataZidianKeyService dataZidianKeyService;
	@Autowired
	private AirTuiPiaoService airTuiPiaoService;
	@Autowired
	private AirOrderLogService airOrderLogService;
	@Autowired
	private SysOutpushDataService sysOutdataService;


	@RequestMapping("/toPage/{orderno}")
	public String toApplyTui(@PathVariable("orderno") String orderNo) {
		if (null == orderNo) {
			setAttr("failMsg", "该订单数据异常");
			return "/common/500";
		}
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderNo);
		if (null == airOrder) {
			setAttr("failMsg", "该订单数据异常");
			return "/common/500";
		}
		List<DataZidianValue> jpTuiReason = dataZidianKeyService.getzidianValueBYzidianKey(airOrder.getCompanyid(), "jprefusereason");
		AirOrderRoute routes = airOrder.getRoutes().get(0);
		List<AirOrderPassenger> passengers = airOrder.getPassengers();
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		for (int m = 0; m < routePass.size(); m++) {
			AirOrderRoutePass Routepass = routePass.get(m);
			for (int j = 0; j < passengers.size(); j++) {
				AirOrderPassenger orderPassenger = passengers.get(j);
				if (Routepass.getPassid().toString().equals(orderPassenger.getId() + "")) {
					if (Routepass.getTuipiaostatus() == 1 || Routepass.getGaiqianstatus() == 6) {
						passengers.remove(j);
					}
					if (Routepass.getTuipiaostatus() == 2 || Routepass.getGaiqianstatus() == 2) {
						passengers.remove(j);
					}
					break;
				}
			}
		}
		if (null != passengers && !passengers.isEmpty()) {
			setAttr("routes", routes);
			setAttr("userlist", passengers);
			setAttr("jpReasonList", jpTuiReason);
			return "/crm/my-chailv/air-apply-refund";
		}else{
			setAttr("failMsg", "您的订单已操作过退票/改签，如需再次操作请拨打客服电话4006060011");
			return "/common/500";
		}
			
	}

	@SuppressWarnings("unchecked")
	@RequestMapping("/createTuipiao")
	public String shenqingTuipiao(HttpServletRequest request) {
		Map<String, String[]> maps = request.getParameterMap();
		String orderNo = maps.get("orderNo")[0];
		String passid = maps.get("passid")[0];
		String routeids = maps.get("routeids")[0];
		String tpReason = maps.get("tpReason")[0];
		String ziyuantp = maps.get("ziyuantp")[0];

		Object[] passids = StringUtils.removeEnd(passid, "-").split("-");
		Object[] routeid = StringUtils.removeEnd(routeids, "-").split("-");
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderNo);
		if (null == airOrder) {
			setAttr("failMsg", "该订单数据异常");
			return "/common/500";
		}
		CrmEmployee user = getUser();
		AirTuipiao tuipiao = new AirTuipiao();
		tuipiao.setOpuserid(user.getId());
		tuipiao.setOpusername(user.getName());
		tuipiao.setTjuserid(airOrder.getBookuserid());
		tuipiao.setTjusername(airOrder.getBookusername());
		tuipiao.setOldorderno(orderNo);
		tuipiao.setZiyuantp(Integer.parseInt(ziyuantp));
		tuipiao.setTpreason(tpReason);
		String tuiMsg = null;
		try {
			tuiMsg = airTuiPiaoService.createTuipiaoOrder(tuipiao, routeid, passids);
		} catch (Exception e) {
			e.printStackTrace();
			log.error("Exception", e);
		}
		Map<Integer, String> result = JsonUtils.jsonToPojo(tuiMsg, Map.class);
		if (null != user) {
			AirOrderLog orderLog = new AirOrderLog(orderNo, "申请退票", user.getId(), user.getName(), user.getDeptname(), new Date(), user.getName() + "进行了退票操作");
			airOrderLogService.saveOrUpdate(orderLog);
		}
		setAttr("tuiResult", result);
		SysOutpushData push = sysOutdataService.getPushDataByOrderno(result.get("data"));
		SysOutpushData sysOutpushData = dealCasloginMsg(airOrder.getCompanyid(), result.get("data"), "airtp", push);
		sysOutdataService.saveOrUpdate(sysOutpushData);
		return "/crm/my-chailv/air-apply-refund-success";
	}
}
