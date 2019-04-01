package com.auvgo.web.face.hotel.book;

import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.business.hotel.custom.IHotelBookCustom;
import com.auvgo.business.hotel.custom.model.BookOperator;
import com.auvgo.business.hotel.query.IHotelQueryBusiness;
import com.auvgo.common.utils.ResultCode;
import com.auvgo.config.EnvironmentAddress;
import com.auvgo.constants.Language;
import com.auvgo.constants.common.Platform;
import com.auvgo.core.string.StringUtils;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.hotel.api.dto.req.RatePlanReq;
import com.auvgo.hotel.api.dto.req.SearchReq;
import com.auvgo.hotel.api.dto.res.GeoTierRes;
import com.auvgo.hotel.api.dto.res.HotelDetailRes;
import com.auvgo.hotel.api.dto.res.HotelListRes;
import com.auvgo.hotel.api.dto.res.LandmarkRes;
import com.auvgo.hotel.api.dto.res.RatePlanRes;
import com.auvgo.hotel.api.dto.statics.HotelDetailDTO;
import com.auvgo.hotel.api.ws.flow.IAuvgoHotelBimWSService;
import com.auvgo.hotel.api.ws.flow.IAuvgoHotelWSService;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.CasRoute;
import com.auvgo.web.model.caslog.CustomInfo;
import com.auvgo.web.model.caslog.TravelPassenger;

/**
 * 酒店查询
 * 
 * @author wangmi
 */
@Controller
@RequestMapping("/hotel")
public class HotelSearchController extends BaseController {
	public static String SYS_COMPANY = EnvironmentAddress.getConfig("sys_company");
	private static Logger logger = LogManager.getLogger(HotelSearchController.class);
	private IAuvgoHotelWSService auvgoHotelWSService;
	private IHotelQueryBusiness hotelQueryBusiness;
	/** 酒店基础信息 **/
	private IAuvgoHotelBimWSService auvgoHotelBimWSService;
	/** 酒店预订定制 **/
	private IHotelBookCustom hotelBookCustom;

	/**
	 * 初始化 酒店城市JS
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/initGeoData", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody String initGeoData(HttpServletRequest request) {
		try {
			Map<String, String> data = hotelQueryBusiness.initGeo();
			OutputStreamWriter pw = null;
			String spi = getOsPath();
			pw = new OutputStreamWriter(new FileOutputStream(request.getServletContext().getRealPath("/") + spi + "resources" + spi + "js" + spi + "geo" + spi + "geo-data.js"),
					"UTF-8");
			pw.write(data.get("allCity"));
			pw.write("\n\n");
			pw.write(data.get("hotData"));
			pw.flush();
			pw.close();// 关闭流
		} catch (Exception e) {
			logger.error("initGeoData fail", e);
			return "No";
		}
		return "OK";
	}

	private String getOsPath() {
		String separator = System.getProperty("file.separator");
		if (separator.equals("\\")) {
			return "\\\\";
		}
		if (separator.equals("/")) {
			return "/";
		}
		return "/";
	}

	@RequestMapping(value = "", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView home(HttpServletRequest request) {
		return new ModelAndView("redirect:/hotel/");
	}

	/**
	 * 酒店首页
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView page() {
		Map<String, Object> param = hotelQueryBusiness.initQueryDate();
		try {
			// setSessionAttr("casModel", getOAdata());
			hotelBookCustom.query(param, getSessionAttr("casModel") + "");
		} catch (Exception e) {
			logger.warn("page fail", e);
		}
		// return new ModelAndView("/hotel/book/hotel-home", param);
		return new ModelAndView("/common/index-hotel", param);
	}

	/**
	 * 查询自动补全
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/autoComplete", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult autoComplete(HttpServletRequest request) {
		AuvgoResult item = AuvgoResult.ok();
		String geo = request.getParameter("geo");
		String keyValue = request.getParameter("q");
		if (StringUtils.isNotBlank(keyValue)) {
			LandmarkRes res = auvgoHotelWSService.autoComplete(geo, keyValue, "PC", "cn");
			if (res != null && ResultCode.SUCESS.equals(res.getStatus())) {
				item.setData(res.getData());
			} else {
				logger.warn("geo:{}  not found:{}", geo, keyValue);
			}
		}
		return item;
	}

	/**
	 * 酒店列表页
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping("/list")
	public ModelAndView list(SearchReq search) {
		Map<String, Object> param = hotelQueryBusiness.initBanner(search);
		try {
			hotelBookCustom.list(param, getSessionAttr("casModel") + "");
		} catch (Exception e) {
			logger.warn("list fail", e);
		}
		return new ModelAndView("hotel/book/hotel-query-list", param);
	}

	/**
	 * 酒店查询
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/search", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody AuvgoResult search(SearchReq search) {
		search.setCustomerNo(getCompany().getBianhao());
		search.setSupply(SYS_COMPANY);
		search.setSource(Platform.PC.toString());
		HotelListRes res = hotelQueryBusiness.query(search);
		AuvgoResult result = null;
		if (ResultCode.SUCESS.equals(res.getStatus())) {
			if (res.getData() != null && !res.getData().isEmpty()) {
				result = AuvgoResult.build(200, "OK", res);
			} else {
				result = AuvgoResult.build(201, "很抱歉，没有找到符合您条件的酒店");
			}
		} else {
			result = AuvgoResult.build(300, res.getMsg());
		}
		return result;
	}

	/**
	 * 酒店详情（静态详情）
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/detial/{hotelNo}", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView detial(@PathVariable("hotelNo") String hotelNo, HttpServletRequest request) {
		Map<String, Object> data = new HashMap<String, Object>();
		String checkIn = request.getParameter("checkIn");
		String checkOut = request.getParameter("checkOut");
		HotelDetailRes detail = null;
		if (StringUtils.isNotBlank(hotelNo)) {
			detail = auvgoHotelWSService.detail(hotelNo, "PC", "cn");
			HotelDetailDTO detailDTO = detail.getData();
			data.put("hotel", detailDTO);
			GeoTierRes geoTier = auvgoHotelBimWSService.findLevel(getCompany().getBianhao().toString(), detailDTO.getGeoId());
			if (geoTier != null && geoTier.getData() != null) {
				data.put("cityLevel", geoTier.getData());
			}
		}
		// 初始化日期
		hotelQueryBusiness.initDetailParam(data, checkIn, checkOut);
		try {
			hotelBookCustom.detail(data, getSessionAttr("casModel") + "");
		} catch (Exception e) {
			logger.warn("detial fail", e);
		}
		return new ModelAndView("/hotel/book/hotel-query-detail", data);
	}

	/**
	 * 酒店价格
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/room", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody AuvgoResult rate(RatePlanReq req) {
		req.setCustomerNo(getCompany().getBianhao());
		req.setLanguage(Language.CN.toLowerCase());
		req.setSource(Platform.PC.toString());
		req.setSupply(SYS_COMPANY);
		RatePlanRes rres = hotelQueryBusiness.roomRate(req);
		AuvgoResult result = AuvgoResult.build(200, "OK", rres);
		return result;
	}

	@Autowired(required = false)
	public void setAuvgoHotelWSService(IAuvgoHotelWSService auvgoHotelWSService) {
		this.auvgoHotelWSService = auvgoHotelWSService;
	}

	@Autowired
	public void setHotelQueryBusiness(IHotelQueryBusiness hotelQueryBusiness) {
		this.hotelQueryBusiness = hotelQueryBusiness;
	}

	@Autowired(required = false)
	public void setAuvgoHotelBimWSService(IAuvgoHotelBimWSService auvgoHotelBimWSService) {
		this.auvgoHotelBimWSService = auvgoHotelBimWSService;
	}

	@Autowired(required = false)
	public void setHotelBookCustom(IHotelBookCustom hotelBookCustom) {
		this.hotelBookCustom = hotelBookCustom;
	}

	// 模拟单点登录
	public String getOAdata() {
		CasBookModel c = new CasBookModel();
		// c.setTraverorderno("5643135453");// 出差申请单号
		// c.setProduct("hotel");// 产品类型
		// c.setCostname("测试成本中心");// 成本中心
		// c.setProname("测试项目中心");// 项目中心
		// c.setApproveRuleName("测试审批规则名称");// 审批规则名称
		// c.setBookFlag("5");// 预订形式:1有员工编号,2有编号,有审批节点,3无编号,有审批节点,4无编号,无审批节点

		CasRoute cr = new CasRoute();// 行程
		cr.setFrom("北京");// 出发城市名
		cr.setFromcode("100000");// 出发城市编码
		cr.setArrive("");// 到达城市
		cr.setArrivecode("");// 到达城市编码
		cr.setStartdate("2018-06-05");// 出发日期
		cr.setArrivedate("2018-06-07");// 到达日期
		cr.setIsCanModify("1");// 是否可以修改,0 不可以修改,1 可以修改
		// c.setRoute(cr);

		CustomInfo ci = new CustomInfo();// 预订人信息
		ci.setBackUrl("");// 需要推送的url
		ci.setIsNeedPush("");// 是否需要推送数据;"0"需要,"1" 不需要
		ci.setCusCode("HYCS");// 公司卡号
		ci.setEmCode("liucong");//
		ci.setOutOrderno("");// 第三方公司的单号
		ci.setBookUserName("刘聪从");// 预订人姓名
		ci.setBookMobile("15053131324");// 预订人手机号
		c.setCustinfo(ci);

		List<TravelPassenger> ts = new ArrayList<TravelPassenger>();
		TravelPassenger t = new TravelPassenger();// 出行人信息
		t.setAccno("liucong");// 员工编号(必填)
		t.setCertType("");// 证件类型 1为身份证 B为护照
		t.setCertno("");// 证件号码
		t.setName("刘聪从");// 员工姓名
		t.setDepartName("郝耀测试公司");// 员工部门名称
		t.setLevel("1");// 员工职级,如果有差旅政策审批,请转换到在我司设置的对应的员工等级,如果没有差旅政策,传-1
		t.setMobile("15350605081");// 出行人的手机号
		ts.add(t);

		TravelPassenger t1 = new TravelPassenger();// 出行人信息
		t1.setAccno("haoyao");// 员工编号(必填)
		t1.setCertType("");// 证件类型 1为身份证 B为护照
		t1.setCertno("");// 证件号码
		t1.setName("郝耀");// 员工姓名
		t1.setDepartName("测试");// 员工部门名称
		t1.setLevel("2");// 员工职级,如果有差旅政策审批,请转换到在我司设置的对应的员工等级,如果没有差旅政策,传-1
		t1.setMobile("13671016194");// 出行人的手机号
		ts.add(t1);
		// c.setPassengers(ts);

		List<ApproveShenpiRen> as = new ArrayList<ApproveShenpiRen>();
		ApproveShenpiRen a = new ApproveShenpiRen();// 审批人
		a.setUsername("liucong");// 审批人登录名
		a.setMobile("15350605081");// 手机
		a.setEmail("liucongcong@auvgo.com");// 邮箱
		a.setName("刘聪从");// 审批人姓名
		a.setLevel("1");// 审批等级
		a.setIsDefaultApprove("1");// 1是,2否 如果超出标准追加一级审批
		as.add(a);

		ApproveShenpiRen a1 = new ApproveShenpiRen();// 审批人
		a1.setUsername("haoyao");// 审批人登录名
		a1.setMobile("13671016194");// 手机
		a1.setEmail("haoyao@auvgo.com");// 邮箱
		a1.setName("郝耀");// 审批人姓名
		a1.setLevel("2");// 审批等级
		a1.setIsDefaultApprove("1");// 1是,2否 如果超出标准追加一级审批
		as.add(a1);

		ApproveShenpiRen a2 = new ApproveShenpiRen();// 审批人
		a2.setUsername("csjd");// 审批人登录名
		a2.setMobile("15350605082");// 手机
		a2.setEmail("");// 邮箱
		a2.setName("测试审批人2");// 审批人姓名
		a2.setLevel("2");// 审批等级
		a2.setIsDefaultApprove("1");// 1是,2否 如果超出标准追加一级审批
		as.add(a2);
		// c.setShenpi(as);

		BookOperator b = new BookOperator();
		b.setOperatorId("16530");
		b.setOperatorName("郝耀");
		b.setOperatorDepId("3675");
		b.setOperatorDepName("测试");
		c.setBookOperator(b);

		String json = jsonMapper.toJson(c);
		System.out.println("OA json数据：" + json);
		return json;
	}

}
