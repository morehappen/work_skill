package com.auvgo.web.face.air;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtilsBean2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.air.api.AirGaiQianService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.entity.AirGaiqian;
import com.auvgo.air.entity.AirGaiqianRoute;
import com.auvgo.air.entity.AirOrder;
import com.auvgo.air.entity.AirOrderPassenger;
import com.auvgo.air.entity.AirOrderRoute;
import com.auvgo.air.entity.AirOrderRoutePass;
import com.auvgo.airrate.api.bim.IAirrateDataAirlineProvider;
import com.auvgo.airrate.api.query.IAirrateQueryProvider;
import com.auvgo.airrate.ibe.av.AvFlight;
import com.auvgo.airrate.ibe.av.CangWei;
import com.auvgo.airrate.ibe.ff.FFModel;
import com.auvgo.airrate.ibe.ff.FFResponse;
import com.auvgo.airrate.orm.entity.AirrateDataAirline;
import com.auvgo.airrate.request.AirrateAvRequest;
import com.auvgo.airrate.response.AirrateAvResponse;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.data.api.DataCityService;
import com.auvgo.data.entity.DataCity;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.AirQuery;
import com.google.common.collect.Maps;

@Controller
@RequestMapping("/ticketChange")
public class AirGaiqianController extends BaseController {

	@Autowired
	private AirOrderService airOrderService;
	@Autowired
	private IAirrateQueryProvider airrateQueryProvider;
	@Autowired
	private CrmProductSetService crmProductSetService;
	@Autowired
	private AirGaiQianService airGaiQianService;
	@Autowired
	private SysOutpushDataService sysOutdataService;
	@Autowired
	private IAirrateDataAirlineProvider airrateDataAirlineProvider;
	@Autowired
	DataCityService dataCityService;

	@RequestMapping("/applyGQ/{orderno}")
	public String toDaiGaiPage(@PathVariable("orderno") String orderno) {
		log.info("/applyGQ -->request orderno:{}", orderno);
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		List<AirOrderRoute> routes = airOrder.getRoutes();
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		List<AirOrderPassenger> passengers = airOrder.getPassengers();
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
		setAttr("userlist", passengers);
		setAttr("routes", routes.get(0));
		setAttr("routepass", routePass);
		setAttr("airStauts", new AirStatusContant());
		setAttr("price", routePass.get(0));
		setAttr("airOrder", airOrder);
		return "crm/my-chailv/air-apply-endrose";
	}


	@RequestMapping("/toGaiPage")
	public String toGaiQuery(String orderNo, String passid, String queryDate, String gqreason) {
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderNo);
		AirOrderRoute routes = airOrder.getRoutes().get(0);
		setAttr("routes", routes);
		setAttr("passid", passid);
		setAttr("gqReason", gqreason);
		setAttr("querydate", queryDate);
		return "crm/my-chailv/air-endrose-query-list";
	}


	@RequestMapping("/gaiQuery")
	@ResponseBody
	public AuvgoResult gaiQianQuery(String query, String companyid) throws Exception {
		try {
			AirQuery querys = JsonUtils.jsonToPojo(query, AirQuery.class);
			removeSession("airquery");
			querys.setType("0");
			setSessionAttr("airquery", querys);
			CrmProductSet productSet = crmProductSetService.getByCid(Long.parseLong(companyid));

			AirrateAvRequest request = new AirrateAvRequest();
			request.setProConfStr(productSet.getProconfvalue());
			request.setCompanyid(companyid);
			request.setCarrierCode(querys.getAirline());
			request.setQuerydate(querys.getStartdate());
			request.setDstcode(querys.getArrive());
			request.setOrgcode(querys.getFrom());
			AirrateAvResponse av = airrateQueryProvider.getAV(request);
			return AuvgoResult.build(200, "success", JsonUtils.objectToJson(av));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "查询出现异常");
	}

	@RequestMapping("/book/gaiqian")
	public String createGaiqian(HttpServletRequest request) {
		Map<String, String[]> maps = request.getParameterMap();
		String orderNo = maps.get("orderno")[0];
		String[] routeid = maps.get("routeid");
		String code = maps.get("code")[0];
		String weibeiflag = maps.get("weibeiflag")[0];
		String passid = maps.get("passid")[0];
		String wbreason = maps.get("wbreason")[0];
		String airline = maps.get("airline")[0];
		String bookPrice = maps.get("bookPrice")[0];
		String dayprice = maps.get("dayprice")[0];
		String gqreason = maps.get("gqreason")[0];
		try {
			if (StringUtils.isBlank(orderNo) || null == routeid || StringUtils.isBlank(code) || StringUtils.isBlank(passid) ||
					StringUtils.isBlank(airline) || StringUtils.isBlank(weibeiflag) || StringUtils.isBlank(bookPrice)) {
				setAttr("failMsg", "查询参数不能为空");
				return "/common/500";
			}
			CrmEmployee user = getUser();//拿到登录人信息
			AirOrder airOrder = airOrderService.getOrderByorderNo(orderNo);
			AirQuery query = (AirQuery) getSessionAttr("airquery");
			if (null == airOrder || null == query || null == user) {
				setAttr("failMsg", "该订单数据异常");
				return "/common/500";
			}
			AirrateAvResponse bookFlight = airrateQueryProvider.getBookFlight(query.getFrom(), query.getArrive(), query.getStartdate(), airline.substring(0, 2), airline, code, Double.parseDouble(bookPrice), airOrder.getCompanyid());
			if (null == bookFlight || bookFlight.getFlights().size() == 0) {
				setAttr("failMsg", "当前页面长时间未操作，航班价格可能变动，请重新查询航班");
				return "/common/500";
			}
			AirGaiqianRoute gaiRoute = buildGaiqianRoute(bookFlight, query);
			setAttr("gqRoute", gaiRoute);
			List<AirOrderPassenger> passengers = airOrder.getPassengers();
			String[] passids = StringUtils.removeEnd(passid, "-").split("-");
			StringBuffer sb = new StringBuffer();
			StringBuffer sb1=new StringBuffer();
			for (String pass : passids) {
				for (AirOrderPassenger users : passengers) {
					if (users.getId().longValue() == Long.parseLong(pass)) {
						sb.append(users.getName() + ",");
						sb1.append(users.getEmployeeid() +"-");
					}
				}
			}
			setAttr("guser", StringUtils.removeEnd(sb.toString(), ","));
			setAttr("guserId", StringUtils.removeEnd(sb1.toString(), "-"));
			AirGaiqian gaiqian = new AirGaiqian();
			gaiqian.setApproveid(airOrder.getApproveid());
			gaiqian.setOldorderno(orderNo);
			gaiqian.setWeibeiflag(Integer.parseInt(weibeiflag));
			gaiqian.setTjuserid(user.getId());
			gaiqian.setTjusername(user.getName());
			gaiqian.setGqreason(gqreason);
			gaiqian.setOrderfrom(AuvStatusContant.COM_ORDER_FROM_VIP);
			gaiqian.setApprovestatus(AuvStatusContant.COM_APPROVE_STATUS);
			gaiqian.setWbreason(wbreason);
			gaiqian.setCompanyid(airOrder.getCompanyid());
			//添加改签是否添加审批人的标识
//			CrmApproveRule approveRule = approveRuleService.getByCid(airOrder.getCompanyid());
//			String[] yewutype = StringUtils.removeEnd(approveRule.getYewutype(), "/").split("/");
//			String[] kaiqi = StringUtils.removeEnd(approveRule.getIskaiqi(), "/").split("/");
//			String[] isneed = StringUtils.removeEnd(approveRule.getIsneed(), "/").split("/");
//			String jgneed="0";//违背不需要审批
//			String jgkai = "0";
//			for (int i = 0; i < yewutype.length; i++) {
//				if ("jpgq".equalsIgnoreCase(yewutype[i])) {
//					jgkai = kaiqi[i];
//				}
//				if ("jpgq".equalsIgnoreCase(yewutype[i])) {
//					jgneed = isneed[i];
//				}
//			}
//			setAttr("jgkai", jgkai);
//			setAttr("jgneed", jgneed);
			///缓存数据
			Map<String, Object> gaidata = Maps.newHashMap();
			gaidata.put("gaiqian", JsonUtils.objectToJson(gaiqian));
			gaidata.put("gairoute", JsonUtils.objectToJson(gaiRoute));
			gaidata.put("passids", passids);
			gaidata.put("routeid", routeid);
			setSessionAttr("gaidata", gaidata);
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "crm/my-chailv/air-endrose-submit";
	}

	@SuppressWarnings("unchecked")
	@RequestMapping("/createGaiqian")
	public String createGaiqian() {
		try {
			Map<String, Object> maps = (Map<String, Object>) getSessionAttr("gaidata");
			AirGaiqian gaiqian = JsonUtils.jsonToPojo(maps.get("gaiqian") + "", AirGaiqian.class);
			String[] passids = (String[]) maps.get("passids");
			String[] routeid = (String[]) maps.get("routeid");
			AirGaiqianRoute gaiRoute = JsonUtils.jsonToPojo(maps.get("gairoute") + "", AirGaiqianRoute.class);
			String gaiResult = airGaiQianService.createGaiQianOrder(gaiqian, passids, routeid, gaiRoute);
			AuvgoResult auvgoresult = JsonUtils.jsonToPojo(gaiResult, AuvgoResult.class);
			Map<String, String> result = Maps.newHashMap();
			if (200 == auvgoresult.getStatus()) {
				result.put("code", "200");
				String gqOrderno = auvgoresult.getData() + "";
				result.put("orderNo", gqOrderno);
				SysOutpushData push = sysOutdataService.getPushDataByOrderno(gqOrderno);
				SysOutpushData sysOutpushData = dealCasloginMsg(gaiqian.getCompanyid(), gqOrderno, "airgq", push);
				sysOutdataService.saveOrUpdate(sysOutpushData);
				setAttr("gaiResult", result);
				return "crm/my-chailv/air-apply-endrose-success";
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			removeSession("gaidata");
			removeSession("airquery");
		}
		setAttr("failMsg", "该订单提交改签出现异常");
		return "/common/500";
	}

	private AirGaiqianRoute buildGaiqianRoute(AirrateAvResponse bookFlight, AirQuery query) throws Exception {
		AirGaiqianRoute gaiqianRoute = new AirGaiqianRoute();
		AvFlight flights = bookFlight.getFlights().get(0);
		BeanUtilsBean2.getInstance().copyProperties(gaiqianRoute, flights);
		CangWei bkcangwei = flights.getCangweis().get(0);
		BeanUtilsBean2.getInstance().copyProperties(gaiqianRoute, bkcangwei);
		gaiqianRoute.setCode(bkcangwei.getCode());
		if (null != bkcangwei.getTpafterfee()) {
			gaiqianRoute.setTpafterfee(Double.parseDouble(String.valueOf(bkcangwei.getTpafterfee())));
		} else {
			gaiqianRoute.setRefundrule("以航司规定为准");
		}
		if (null != bkcangwei.getTpbeforefee()) {
			gaiqianRoute.setTpbeforefee(Double.parseDouble(String.valueOf(bkcangwei.getTpbeforefee())));
		}
		if (null != bkcangwei.getGqafterfee()) {
			gaiqianRoute.setGqafterfee(Double.parseDouble(String.valueOf(bkcangwei.getGqafterfee())));
		} else {
			gaiqianRoute.setChangerule("以航司规定为准");
			gaiqianRoute.setSignrule("不得转签");
		}
		if (null != bkcangwei.getGqbeforefee()) {
			gaiqianRoute.setGqbeforefee(Double.parseDouble(String.valueOf(bkcangwei.getGqbeforefee())));
		}
		gaiqianRoute.setYprice(flights.getYprice());
		gaiqianRoute.setDistance(flights.getFlydistance());// 设置飞行里程
		if(query!=null&&StringUtils.isNotBlank(query.getAirline())){
			AirrateDataAirline line = airrateDataAirlineProvider.getByCode(query.getAirline().substring(0,2));
			if(line!=null){
				gaiqianRoute.setIscheap((line.getIscheap()!=null&&line.getIscheap()==1)?"1":"0");//设置廉航
			}
		}
		gaiqianRoute.setYprice(flights.getYprice());
		try{
		if("1".equals(gaiqianRoute.getStopnumber())&&StringUtils.isEmpty(gaiqianRoute.getStopCity())&&StringUtils.isNotEmpty(gaiqianRoute.getAirline())&&StringUtils.isNotEmpty(gaiqianRoute.getDeptdate())){
			//查询经停城市
			FFResponse ffRes = airrateQueryProvider.flightTime(gaiqianRoute.getAirline(), gaiqianRoute.getDeptdate());
			if (null != ffRes) {
				List<FFModel> list = ffRes.getModels();
				if(list!=null&&list.size()>1){
					FFModel ffModel2 = list.get(1);
					List<DataCity> citylist = dataCityService.findByCode(ffModel2.getOrgcode());
					if (null != citylist && citylist.size() > 0) {
						gaiqianRoute.setStopCity(citylist.get(0).getName());//经停城市
					} 
				}
			}
		}
		}catch(Exception e){
			log.error("查询封装flight查询经停异常", e);
		}
		return gaiqianRoute;
	}

}
