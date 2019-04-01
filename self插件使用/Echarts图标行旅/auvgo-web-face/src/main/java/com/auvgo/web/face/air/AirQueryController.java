package com.auvgo.web.face.air;

import com.auvgo.airrate.api.query.IAirrateQueryProvider;
import com.auvgo.airrate.ibe.av.AvFlight;
import com.auvgo.airrate.ibe.ff.FFModel;
import com.auvgo.airrate.ibe.ff.FFResponse;
import com.auvgo.airrate.request.AirrateAvRequest;
import com.auvgo.airrate.response.AirrateAvResponse;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmPolicyAirContentService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmPolicyAir;
import com.auvgo.crm.entity.CrmPolicyAirContent;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.data.api.DataAirlineService;
import com.auvgo.data.api.DataCityService;
import com.auvgo.data.entity.DataCity;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.AirQuery;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/air")
public class AirQueryController extends BaseController {

	@Autowired
	private IAirrateQueryProvider airrateQueryProvider;
	@Autowired
	private DataAirlineService airlineService;
	@Autowired
	private CrmProductSetService productSetService;
	@Autowired
	DataCityService dataCityService;
	@Autowired
	CrmPolicyAirContentService crmPolicyAirContentService;

	@RequestMapping("/query")
	public String toSearch(AirQuery query) {
		removeSession("bookRoutes");// 清空已经换成的航班数据,重新查询
		removeSession("airquery");
		log.info("/air/query --->request:{}", JsonUtils.objectToJson(query));
		setAttr("query", JsonUtils.objectToJson(query));
		setSessionAttr("airquery", query);
		return "/air/air-query-list";
	}

	@RequestMapping("/getFlight")
	@ResponseBody
	public AuvgoResult getFlight(String from, String fromName, String arrive, String arriveName, String startdate, String backdate, String voyage) {
		removeSession("bookRoutes");// 清空已经换成的航班数据,重新查询
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(301, "由于您长时间为操作登录信息过期,请重新登陆");
		}
		try {
			if (StringUtils.isBlank(from) || StringUtils.isBlank(arrive) || StringUtils.isBlank(startdate) || StringUtils.isBlank(voyage)) {
				return AuvgoResult.build(ErrorCode.ERROR, "查询参数不能为空");
			}
			AirQuery query = new AirQuery();
			// 重新封装查询参数
			query.setFrom(from);
			query.setFromName(fromName);
			query.setArrive(arrive);
			query.setArriveName(arriveName);
			query.setStartdate(startdate);
			if ("rt".equals(voyage)) {// 查询是否为往返
				query.setType(voyage);
				query.setBackdate(backdate);
			} else {
				query.setType("ow");
			}
			setSessionAttr("airquery", query);
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			if (null == company) {
				return AuvgoResult.build(ErrorCode.ERROR, "登录信息有误");
			}
			CrmProductSet proconf = productSetService.getByCid(company.getId());
			AirrateAvRequest request = new AirrateAvRequest();
			request.setOrgcode(from);
			request.setDstcode(arrive);
			request.setQuerydate(startdate);
			request.setCarrierCode("ALL");
			request.setDirect(false);
			request.setProConfStr(proconf.getProconfvalue());
			request.setCompanyid(company.getId().toString());
			request.setTokenId(MDC.get("TraceId"));
			AirrateAvResponse av = airrateQueryProvider.getAV(request);
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(av));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(ErrorCode.ERROR, "查询出现异常");
		}
	}

	// 获取返程的航班接口
	@RequestMapping("/getBackFlight")
	@ResponseBody
	public AuvgoResult getBackFlight() {
		try {
			CrmEmployee user = getUser();
			if (null == user) {
				return AuvgoResult.build(300, "由于您长时间为操作登录信息过期,请重新登陆");
			}
			AirQuery query = (AirQuery) getSessionAttr("airquery");
			if (null == query || StringUtils.isBlank(query.getBackdate())) {
				return AuvgoResult.build(300, "参数异常,请重新查询");
			}
			CrmProductSet proconf = productSetService.getByCid(user.getCompanyid());
			AirrateAvRequest request = new AirrateAvRequest();
			request.setOrgcode(query.getArrive());
			request.setDstcode(query.getFrom());
			request.setQuerydate(query.getBackdate());
			request.setCarrierCode("ALL");
			request.setDirect(false);
			request.setProConfStr(proconf.getProconfvalue());
			request.setCompanyid(getCompany().getId().toString());
			AirrateAvResponse av = airrateQueryProvider.getAV(request);
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(av));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "查询出现异常,请稍后再试");

	}

	@RequestMapping("/changeAirLine")
	public AuvgoResult changeAirline() {
		removeSession("bookRoutes");// 清空已经换成的航班数据,重新查询
		AirQuery query = (AirQuery) getSessionAttr("airquery");
		return AuvgoResult.build(200, "清除成功", JsonUtils.objectToJson(query));
	}

	// 航班经停接口
	@RequestMapping("/getAirStop")
	@ResponseBody
	public AuvgoResult getAirlineStop(String airline, String date) throws Exception {
		if (StringUtils.isBlank(airline) || StringUtils.isBlank(date)) {
			return AuvgoResult.build(300, "查询参数不能为空");
		}
		FFResponse ffRes = airrateQueryProvider.flightTime(airline, date);
//		String str="{\"airline\":\"MF8061\",\"status\":200,\"msg\":\"success\",\"models\":[{\"orgcode\":\"FOC\",\"dstcode\":\"NKG\",\"arritime\":\"2017-09-07 02:10\",\"depttime\":\"2017-09-07 12:45\",\"planestyle\":\"738\"},{\"orgcode\":\"NKG\",\"dstcode\":\"SHE\",\"arritime\":\"2017-09-07 05:30\",\"depttime\":\"2017-09-07 03:10\",\"planestyle\":\"738\"}]}";
//		FFRes ffRes = JsonUtils.jsonToPojo(str,FFRes.class);
		Map<String, String> map = Maps.newHashMap();
		if (null != ffRes) {
			List<FFModel> list = ffRes.getModels();
			FFModel ffModel1 = list.get(0);
			FFModel ffModel2 = list.get(1);
			List<DataCity> citylist = dataCityService.findByCode(ffModel2.getOrgcode());
			if (null != citylist && citylist.size() > 0) {
				map.put("airstop", citylist.get(0).getName());//经停城市
			} else {
				map.put("airstop", "未匹配");//经停城市
			}
			map.put("arrivetime", ffModel1.getArritime());//到达时间
			map.put("flighttime", ffModel2.getDepttime());//再次起飞时间
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(map));
		}
		return AuvgoResult.build(300, "查询数据为空");
	}

	@RequestMapping("/getAirline")
	@ResponseBody
	public AuvgoResult getAirline() throws Exception {
		String allAircode = airlineService.getAllAircode();
		return AuvgoResult.build(ErrorCode.SUCCESS, "success", allAircode);
	}


	// 获取前后N小时航班信息
	@RequestMapping("/getHourFlight")
	@ResponseBody
	public AuvgoResult getFlightLow(String bookairline, Integer hour, Double price, int type,String mile) {
		try {
			CrmEmployee user = getUser();
			if (null == user) {
				return AuvgoResult.build(300, "登录人信息获取失败");
			}
			AirQuery query = (AirQuery) getSessionAttr("airquery");
			log.info("getFlightLow --> getSession-->{}", JsonUtils.objectToJson(query));
			AirrateAvResponse houreAV = new AirrateAvResponse();
			if (null != query) {
				if (0 == type) {
					if (null == query.getAirline() || StringUtils.isBlank(query.getAirline())) {
						houreAV = airrateQueryProvider.getHoureAV(query.getFrom(), query.getArrive(), query.getStartdate(), "ALL", bookairline, hour, price, user.getCompanyid());
					} else {
						houreAV = airrateQueryProvider.getHoureAV(query.getFrom(), query.getArrive(), query.getStartdate(), query.getAirline(), bookairline, hour, price, user.getCompanyid());
					}
				} else if (1 == type) {
					houreAV = airrateQueryProvider.getHoureAV(query.getArrive(), query.getFrom(), query.getBackdate(), "ALL", bookairline, hour, price, user.getCompanyid());

				}

				//查询匹配政策
				String policeJson = crmPolicyAirContentService.getNewCompanyPolicyByEmployeeLevel(user.getCompanyid()+"",Lists.newArrayList(user.getZhiwei()));
				if(StringUtils.isNotEmpty(policeJson)){
					CrmPolicyAirContent content = jsonMapper.fromJson(policeJson, CrmPolicyAirContent.class);
	                if(content!=null&&StringUtils.isNotEmpty(mile)){
	                	String chailvcontent = content.getChailvcontent();
	                	if(StringUtils.isNotEmpty(chailvcontent)){
	                		List<CrmPolicyAir> policyAir = (List<CrmPolicyAir>) JsonUtils.jsonToList(chailvcontent, CrmPolicyAir.class);
	                		if(policyAir!=null&&policyAir.size()>0){
	 	                       for(CrmPolicyAir  pa:policyAir){
	 	                    	   if(pa.getStartmile()!=null&&pa.getEndmile()!=null){
	 	                    		   if(pa.getStartmile()<=Integer.valueOf(mile)&&Integer.valueOf(mile)<=pa.getEndmile()){
	 	                    			   Integer isfilterStop = pa.getIsfilterStop();
	 	                    			   if(isfilterStop!=null&&isfilterStop==1){
	 	                    					// 过滤经停航司
	 	                    					if(houreAV!=null&&houreAV.getFlights()!=null&&houreAV.getFlights().size()>0){
	 	                    						Iterator<AvFlight> iterator = houreAV.getFlights().iterator();
	 	                    						while (iterator.hasNext()) {
	 	                    							AvFlight avFlight = iterator.next();
	 	                    							int stopNum = Integer.parseInt(avFlight.getStopnumber());
	 	                    							if (stopNum > 0) {// 标识有经停航班,过滤掉
	 	                    								iterator.remove();
	 	                    							}
	 	                    						}
	 	                    					}
	 	                    			   }
	 	                    		   }
	 	                    	   }
	 	                       }
	 	                	}
	                	}
	                }				
				}
				return AuvgoResult.build(200, "success", JsonUtils.objectToJson(houreAV));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "查询出现异常");
	}

	@RequestMapping("/againQuery")
	public String queryMore() {
		AirQuery query = (AirQuery) getSessionAttr("airquery");
		setAttr("queryagain", JsonUtils.objectToJson(query));
		return "/air/air-query-list";
	}


}
