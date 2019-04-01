package com.auvgo.web.face.hotel;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.ProConfUtil;
import com.auvgo.crm.api.CrmPolicyHotelService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.hotel.api.HotelDataSearchService;
import com.auvgo.hotel.api.HotelElongValidateService;
import com.auvgo.hotel.api.HotelSearchService;
import com.auvgo.hotel.entity.HotelRatePlan;
import com.auvgo.hotel.model.common.PagerDateResult;
import com.auvgo.hotel.model.common.ResultInfo;
import com.auvgo.hotel.model.hotel.HotelDetailForListPager;
import com.auvgo.hotel.model.hotel.HotelDetailRequest;
import com.auvgo.hotel.model.hotel.HotelDetailViewModel;
import com.auvgo.hotel.model.hotel.HotelFilter;
import com.auvgo.hotel.model.hotel.HotelImage;
import com.auvgo.hotel.model.hotel.HotelInfoDetail;
import com.auvgo.hotel.model.hotel.HotelKeyWord;
import com.auvgo.hotel.model.hotel.HotelValidatorModel;
import com.auvgo.hotel.model.hotel.ListPagerRequest;
import com.auvgo.hotel.model.order.CreateOrderRequest;
import com.auvgo.hotel.model.order.LastArrivalOptionTime;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.HotelQueryParamModel;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 酒店查询
 * 
 */
@Controller
@RequestMapping("/hotel/query")
public class HotelQueryController extends BaseController {
	@Autowired
	private HotelSearchService searchService;
	@Autowired
	private HotelDataSearchService dataSearchService;
	@Autowired
	private CrmProductSetService productSetService;
	@Autowired
	private HotelElongValidateService elongValidateService;
	@Autowired
	private CrmPolicyHotelService crmPolicyHotelService;

	// 查询跳转
	@RequestMapping("")
	public String query(HotelQueryParamModel pagerReq) {
		setSessionAttr("hotelQueryParam", pagerReq);
		return "/hotel/hotel-query-list";
	}

	@RequestMapping("/list")
	@ResponseBody
	public AuvgoResult queryHotel(HotelQueryParamModel pagerReq) {
		// 参数验证与处理
		if (pagerReq == null) {
			pagerReq = new HotelQueryParamModel();
		}
		if (pagerReq.getArrivalDate() == null) {
			pagerReq.setArrivalDate(new Date());
		}
		if (pagerReq.getDepartureDate() == null) {
			pagerReq.setDepartureDate(new DateTime().plusDays(1).toDate());
		}
		if (StringUtils.isBlank(pagerReq.getCityId())) {
			// 默认设置为北京
			pagerReq.setCityId("0101");
		}
		if (pagerReq.getPageIndex() == null || pagerReq.getPageIndex() <= 0) {
			// 默认设置为第一页
			pagerReq.setPageIndex(1);
		}
		if (pagerReq.getLowRate() != null && pagerReq.getHighRate() !=null && pagerReq.getLowRate()>pagerReq.getHighRate()) {
			return AuvgoResult.build(300, "最近价格不能高于最高价格！");
		}
		setSessionAttr("hotelQueryParam", pagerReq);
		try {
			// 根据公司 配置，预付和到店付设置
			CrmEmployee user = getUser();
			if (null != user && null != user.getCompanyid()) {
				pagerReq.setPaymentType(cpmpanyProduct(getUser().getCompanyid()));
			}
			log.info("/list request:{}", JsonUtils.objectToJson(pagerReq));

			setSessionAttr("hotelQueryParam", pagerReq);// 保存查询条件
			ListPagerRequest req = new ListPagerRequest();
			BeanUtils.copyProperties(pagerReq, req);
			ResultInfo<PagerDateResult<HotelDetailForListPager>> result = searchService.getHotelList(req);
			if (result.getIsSuccess()) {
				log.info("/list response:{}", JsonUtils.objectToJson(result.getData()));
				return AuvgoResult.build(200, "success", JsonUtils.objectToJson(result.getData()));
			} else {
				result.setMsg("获取数据失败：" + result.getMsg());
				log.error("getHotelList response error:{}", result.getMsg());
				return AuvgoResult.build(500, result.getMsg());
			}
		} catch (Exception e) {
			log.error("list error:{}", JsonUtils.objectToJson(pagerReq), e);
			return AuvgoResult.build(300, "查询异常！");
		}
	}

	/**
	 * {"cityid":"0101"} 列表位置筛选数据： 城市的商圈，行政区，车站标志物
	 *
	 * @param cityid
	 * @return
	 */
	@RequestMapping(value = "/filterdata", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult filterdata(String cityid) {
		log.info("cityId:{}", cityid);
		if (StringUtils.isBlank(cityid)) {
			return AuvgoResult.build(300, "酒店城市id为空！");
		}
		try {
			List<HotelFilter> result = dataSearchService.getPostionFilterData(cityid);
			Map<String, List<HotelFilter>> resultMap = dataSearchService.getBrandFacilitiesFilterData(cityid);
			resultMap.put("weizhi", result);
			if (null != result) {
				return AuvgoResult.build(200, "success", JsonUtils.objectToJson(resultMap));
			}
			return AuvgoResult.build(300, "返回数据为空！");
		} catch (Exception e) {
			log.error("filterdata cityid:{}, error:{}", cityid, e);
			return AuvgoResult.build(500, "查询异常！", e.getMessage());
		}
	}

	/**
	 * {"keyword":"关键字/位置/品牌/酒店名"} 酒店关键字搜索
	 * 
	 * @param keyWord
	 * @param cityId
	 * @return
	 */
	@RequestMapping(value = "/keyword", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult keyword(String keyWord, String cityId) {
		if (StringUtils.isBlank(keyWord) || StringUtils.isBlank(cityId)) {
			return AuvgoResult.build(300, "参数为空！");
		}
		List<HotelKeyWord> result = searchService.searchByKeyword(cityId, keyWord);
		try {
			if (null != result) {
				String resultJson = JsonUtils.objectToJson(result);
				return AuvgoResult.build(200, "success", resultJson);
			}
			return AuvgoResult.build(300, "返回数据为空！");
		} catch (Exception e) {
			log.error("keyword cityId:{}, keyword:{} ,error:{}", cityId, keyWord, e);
			return AuvgoResult.build(500, "查询异常！", e.getMessage());
		}
	}

	/**
	 * 获取酒店详情
	 *
	 * @param arrivalDate
	 *            2017-05-15
	 * @param departureDate
	 * @param hotelId
	 * @param paymentType
	 * @return
	 */
	@RequestMapping("/gethoteldetail/{arrivalDate}/{departureDate}/{hotelId}/{paymentType}")
	public String getHotelDeatil(@PathVariable("arrivalDate") String arrivalDate,
			@PathVariable("departureDate") String departureDate, @PathVariable("hotelId") String hotelId,
			@PathVariable("paymentType") String paymentType) {
		log.info("arrivalDate:{}, departureDate:{} ,hotelId:{} ,paymentType:{} ", arrivalDate, departureDate, hotelId,
				paymentType);
		// 参数判断
		if (StringUtils.isBlank(arrivalDate) || StringUtils.isBlank(hotelId) || StringUtils.isBlank(departureDate)
				|| DateUtil.getDateFormat(arrivalDate).getTime() > DateUtil.getDateFormat(departureDate).getTime()) {
			setAttr("Msg", "暂无数据，请您重新查询！");
			return "/common/404";
		}
		HotelDetailRequest detailReq = new HotelDetailRequest();
		detailReq.setArrivalDate(DateUtil.getDateFormat(arrivalDate));
		detailReq.setDepartureDate(DateUtil.getDateFormat(departureDate));
		detailReq.setHotelId(hotelId);
		paymentType = paymentType.equals("default")? "All" : paymentType;
		// 根据公司配置判断酒店支付方式
		if (StringUtils.isBlank(cpmpanyProduct(getUser().getCompanyid()))) {
			if (StringUtils.isNotBlank(paymentType)) {
				detailReq.setPaymentType(paymentType);
			}
		} else {
			detailReq.setPaymentType(cpmpanyProduct(getUser().getCompanyid()));
		}

		if (StringUtils.isBlank(detailReq.getPaymentType())) {
			detailReq.setPaymentType("All");
		}
		try {
			ResultInfo<HotelDetailViewModel> detailRet = searchService.getHotelDetail(detailReq);
			if (detailRet.getIsSuccess()) {
				HotelDetailViewModel dataResult = detailRet.getData();
				removeSession("hotelDetailViewModel");
				setSessionAttr("hotelDetailViewModel", dataResult);
				setAttr("hotelView", dataResult);
				String result = JsonUtils.objectToJson(dataResult);
				log.info("getHotelDetail() hotelinfo:{}",result); 
				// setSessionAttr("hotelDetailViewModel", hotelDetailViewModel);
				//酒店信息
				HotelInfoDetail hotelInfoDetail = searchService.getHotelInfoDetail(hotelId);
			
				//封装图片信息
				List<HotelImage> imageList = dataResult.getHotelImageList();
				Map<String, List<HotelImage>> imageMap = Maps.newHashMap();
				//外观
				List<HotelImage> outerImageList = Lists.newArrayList();
				//大堂
				List<HotelImage> lobbyImageList = Lists.newArrayList();
				for (HotelImage hotelImage : imageList) {
					if(hotelImage.getImageTitle().contains("外观")) {
						outerImageList.add(hotelImage);
					}
					if(hotelImage.getImageTitle().contains("大堂")) {
						lobbyImageList.add(hotelImage);
					}
				}
				imageMap.put("all", imageList);
				imageMap.put("outer", outerImageList);
				imageMap.put("lobby", lobbyImageList);
				
				setAttr("imageMap", imageMap);
				setAttr("hotelInfoDetail", hotelInfoDetail);
				return "/hotel/hotel-list-detail";
			} else {
				setAttr("Msg", detailRet.getMsg());
				return "/common/404";
			}
		} catch (Exception e) {
			log.error("gethoteldetail:{}, error:{}", JsonUtils.objectToJson(detailReq), e);
			setAttr("Msg", "暂无数据，请您重新查询");
			return "/common/404";
		}
	}

	/**
	 * 获取酒店详情
	 * 
	 * @param arrivalDate
	 *            2017-05-15
	 * @param departureDate
	 * @param hotelId
	 * @return
	 */
	@RequestMapping(value = "/gethoteldetailajax")
	@ResponseBody
	public AuvgoResult getHotelDeatilAjax(@RequestParam("arrivalDate") String arrivalDate,
			@RequestParam("departureDate") String departureDate, @RequestParam("hotelId") String hotelId,
			@RequestParam("paymentType") String paymentType) {

		log.info("arrivalDate:{}, departureDate:{} ,hotelId:{} ,paymentType:{} ", arrivalDate, departureDate, hotelId,
				paymentType);
		// 参数判断
		if (StringUtils.isBlank(arrivalDate) || StringUtils.isBlank(hotelId) || StringUtils.isBlank(departureDate)
				|| DateUtil.getDateFormat(arrivalDate).getTime() > DateUtil.getDateFormat(departureDate).getTime()) {
			return AuvgoResult.build(300, "暂无数据，请您重新查询！");
		}
		
		HotelDetailRequest detailReq = new HotelDetailRequest();
		detailReq.setArrivalDate(DateUtil.getDateFormat(arrivalDate));
		detailReq.setDepartureDate(DateUtil.getDateFormat(departureDate));
		detailReq.setHotelId(hotelId);
		// 根据公司配置判断酒店支付方式
		if (StringUtils.isBlank(cpmpanyProduct(getUser().getCompanyid()))) {
			if (StringUtils.isNotBlank(paymentType)) {
				detailReq.setPaymentType(paymentType);
			}else {
				detailReq.setPaymentType("All");
			}
		} else {
			detailReq.setPaymentType(cpmpanyProduct(getUser().getCompanyid()));
		}

		try {
			ResultInfo<HotelDetailViewModel> detailRet = searchService.getHotelDetail(detailReq);
			if (detailRet.getIsSuccess()) {
				HotelDetailViewModel dataResult = detailRet.getData();
				String result = JsonUtils.objectToJson(dataResult);
				return AuvgoResult.build(200, "success", result);
			} else {
				return AuvgoResult.build(300, detailRet.getMsg());
			}
		} catch (Exception e) {
			log.error("gethoteldetail:{}, error:{}", JsonUtils.objectToJson(detailReq), e);
			return AuvgoResult.build(300, "暂无数据，请您重新查询");
		}
	}
	/**
	 * 酒店信息详情
	 * 
	 * @param data  酒店id
	 * @return
	 */
	@RequestMapping(value = "/info")
	@ResponseBody
	public AuvgoResult hotelinfo(String hotelId) {
		//获取酒店详情信息
		try {
			if (StringUtils.isBlank(hotelId)) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			HotelInfoDetail result = searchService.getHotelInfoDetail(hotelId);
			if (null != result) {
				String resultJson = JsonUtils.objectToJson(result);
				log.info("hotel hotelinfo reponse-->resultJson:{}",resultJson);
				return AuvgoResult.build(ErrorCode.SUCCESS, "success", resultJson);
			}
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", null);
		} catch (Exception e) {
			log.warn("error-->hotelId:{},Exception:{}",hotelId,e);
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS), "查询出现异常！");
		}
		
	}

	
	/**
	 * 该验证包含了产品的可用性验证、库存验证以及价格验证
	 * {arrivalDate:"",departureDate:"",hotelId:"",roomTypeId
	 * :"",ratePlanId:"",totalPrice:""}
	 *
	 * @param orderRequest
	 * @return
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@RequestMapping(value = "/validator", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult validator(CreateOrderRequest orderRequest) {
		log.debug("validator request:{}", JsonUtils.objectToJson(orderRequest));
		if (orderRequest == null || StringUtils.isBlank(orderRequest.getHotelId())
				|| StringUtils.isBlank(orderRequest.getRoomTypeId()) || orderRequest.getRatePlanId() <= 0
				|| null == orderRequest.getArrivalDate() || null == orderRequest.getDepartureDate()
				|| orderRequest.getArrivalDate().getTime() > orderRequest.getDepartureDate().getTime()) {
			return AuvgoResult.build(300, "参数为空！");
		}
		try {
			// 验证协议酒店
			HotelRatePlan sRatePlan = searchService.getByHotelidAndRatePlanid(orderRequest.getHotelId(),
					String.valueOf(orderRequest.getRatePlanId()));
			ResultInfo<HotelValidatorModel> result = new ResultInfo();
			String resultJson = "";
			if (null != sRatePlan) {
				HotelValidatorModel builderValidator = builderValidator(sRatePlan, orderRequest);
				result.setIsSuccess(true);
				result.setMsg("验证成功");
				result.setData(builderValidator);
				resultJson = JsonUtils.objectToJson(result.getData());
				log.info("validator sign response:{}", resultJson);
			} else {
				// 验证库存和房型
				result = elongValidateService.validateData(orderRequest);
				resultJson = JsonUtils.objectToJson(result.getData());
				log.debug("validator elong response:{}", resultJson);
			}
			setSessionAttr("validatorData", resultJson);

			if (result.getIsSuccess()) {
				return AuvgoResult.build(200, result.getMsg(), resultJson);
			}
			return AuvgoResult.build(500, result.getMsg());
		} catch (Exception e) {
			log.error("validator error:{},e:{}", JsonUtils.objectToJson(orderRequest), e);
			return AuvgoResult.build(500, "发生异常！", e.getMessage());
		}
	}

	/**
	 * 酒店 获取差旅政策 输入参数{"level":1/2/3,"cityid":0101}
	 * 
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/policy", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult getHotelPolicy(@RequestParam("cityid") String cityid, @RequestParam("level") String level) {
		CrmCompany crmCompany = getCompany();
		String companyid = crmCompany.getId().toString();
		try {
			if (StringUtils.isBlank("cityid") || StringUtils.isBlank("level")) {
				return AuvgoResult.build(300, "参数错误！");
			}
			List<String> asList = Arrays.asList(StringUtils.removeEnd(level, "/").split("/"));
			String resultJson = crmPolicyHotelService.getCompanyPolicyByEmployeeLevel(companyid, asList, cityid);
			log.info("reponse-->resultJson:{}", resultJson);
			return AuvgoResult.build(200, "success", resultJson);
		} catch (Exception e) {
			return AuvgoResult.build(300, e.toString());
		}
	}

	private HotelValidatorModel builderValidator(HotelRatePlan sRatePlan, CreateOrderRequest orderRequest) {
		HotelValidatorModel validator = new HotelValidatorModel();
		// 担保金额
		validator.setGuaranteeRate("true".equals(sRatePlan.getGurantee()) ? BigDecimal.valueOf(sRatePlan.getSalePrice())
				: BigDecimal.valueOf(0.0));
		// 货币类型
		validator.setCurrencyCode(sRatePlan.getCurrencyCode());
		// 最晚取消时间
		Date arrivalDate = orderRequest.getArrivalDate();
		Date tomorrow = DateUtil.addDate(arrivalDate, 1);
		String startDate = DateUtil.getDateStrByParam("yyyy-MM-dd", arrivalDate);
		String tomorrowDate = DateUtil.getDateStrByParam("yyyy-MM-dd", tomorrow);
		if (StringUtils.isNotBlank(sRatePlan.getCancelTime()) && "1".equals(sRatePlan.getIsCancel())) {
			StringBuilder cancelTime = new StringBuilder();
			String time = sRatePlan.getCancelTime().replace("-", ":");
			cancelTime.append(startDate);
			cancelTime.append(" ");
			cancelTime.append(time);
			cancelTime.append(":00");
			validator.setCancelTime(DateUtil.getDateTimeFormat(cancelTime.toString()));
		} else {
			validator.setCancelTime(DateUtil.getDateTimeFormat("1900-01-01 00:00:00"));
		}

		// 获取可选的最晚到店时间
		List<LastArrivalOptionTime> arrivalOptionTimes = Lists.newArrayList();
		LastArrivalOptionTime lastArriveal = null;
		int h = 18;
		int j = 13;
		for (int i = 0; i < j; i++) {
			if (h >= 18 || h <= 23) {
				lastArriveal = new LastArrivalOptionTime();
				lastArriveal.setShowTime(h + ":00");
				lastArriveal.setValue(startDate + " " + 18 + ":00:00");
				arrivalOptionTimes.add(lastArriveal);
				h++;
			} else if (h == 24) {
				lastArriveal = new LastArrivalOptionTime();
				lastArriveal.setShowTime("23:59");
				lastArriveal.setValue(startDate + " 23:59:00:00");
				arrivalOptionTimes.add(lastArriveal);
				h = 0;
			} else {
				lastArriveal = new LastArrivalOptionTime();
				lastArriveal.setShowTime("凌晨0" + h + ":00");
				lastArriveal.setValue(tomorrowDate + " 0" + h + ":00:00");
				arrivalOptionTimes.add(lastArriveal);
				h++;
			}
			if (h == 7) {
				break;
			}
		}

		validator.setArrivalOptionTimes(arrivalOptionTimes);
		return validator;
	}

	/**
	 * 判断是否开启无需确认就出票
	 * 
	 * @param cid
	 * @return
	 */
	private String cpmpanyProduct(Long cid) {
		// 关闭
		String i = "0";
		// 开启
		String j = "1";
		CrmProductSet productSet = productSetService.getByCid(cid);
		String xianFu = ProConfUtil.getValue(productSet.getProconfvalue(), "xianfu");
		String yuFu = ProConfUtil.getValue(productSet.getProconfvalue(), "yufu");
		if (xianFu.equals(j) && yuFu.equals(i)) {
			return "SelfPay";
		}
		if (xianFu.equals(i) && yuFu.equals(j)) {
			return "Prepay";
		}
		return "";
	}
}
