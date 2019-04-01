package com.auvgo.web.face.hotel.book;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.business.hotel.book.IHotelBookingBusiness;
import com.auvgo.business.hotel.custom.IHotelBookCustom;
import com.auvgo.business.hotel.model.BookModel;
import com.auvgo.business.hotel.order.exception.OrderCreateException;
import com.auvgo.common.utils.ResultCode;
import com.auvgo.constants.EnCoding;
import com.auvgo.constants.Language;
import com.auvgo.constants.common.Platform;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.string.StringUtils;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.MD5Util;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.hotel.api.dto.res.CreditcardValidationRes;
import com.auvgo.hotel.api.dto.res.ValidateRes;
import com.auvgo.hotel.order.api.dto.res.OrderCreateRes;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.filters.ClientIPUtils;
import com.auvgo.web.interceptors.TokenUtils;

@Controller
@RequestMapping("/hotel")
public class HotelBookingController extends BaseController {
	private IHotelBookingBusiness hotelBookingBusiness;
	/** 酒店预订定制 **/
	private IHotelBookCustom hotelBookCustom;

	/**
	 * 详情选择
	 * 
	 * @param book
	 * @return
	 */
	@RequestMapping(value = "/book/select", method = RequestMethod.POST)
	public ModelAndView select(BookModel book, HttpServletRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		if (book != null) {
			// 初始化酒店、房型、担保信息 常用联系 必填项 最低原因
			try {
				// 订单来源
				book.setOrderSource(BaseStatusContant.COM_ORDER_FROM_VIP + "");
				// 应用平台
				book.setSource(Platform.PC.toString());
				// 语言
				book.setLanguage(Language.CN.toLowerCase());
				hotelBookCustom.bookBefor(book, getSessionAttr("casModel") + "");
				map = hotelBookingBusiness.select(book, getParameterMap(request), getCompany(), getUser(), Platform.PC.toString());
				CrmEmployee employee = getUser();
				// 是否是可以为他人预订
				map.put("modifyCustomer", employee.getIfallowbook() + "");
				// 是否允许添加员工:1 允许,0不允许
				map.put("addempflageCustomer", employee.getAddempflage() + "");
				hotelBookCustom.bookAfter(map, getSessionAttr("casModel") + "");
			} catch (Exception e) {
				log.error("select fail", e);
			}
		} else {
			// 404
		}
		return new ModelAndView("/hotel/book/hotel-book", map);
	}

	/**
	 * 房量价格验证
	 * 
	 * @return
	 */
	@RequestMapping("/book/verify")
	public @ResponseBody AuvgoResult verify(HttpServletRequest request) {
		AuvgoResult result = null;
		try {
			ValidateRes res = hotelBookingBusiness.verify(getParameterMap(request), getCompany().getBianhao());
			if (ResultCode.SUCESS.equals(res.getStatus())) {
				if ("OK".equals(res.getData().getCode())) {
					result = AuvgoResult.build(200, "OK", res.getData());
				} else {
					result = AuvgoResult.build(300, res.getData().getMsg());
				}
			} else {
				result = AuvgoResult.build(300, res.getStatus() + "|" + res.getMsg());
			}
		} catch (Exception e) {
			log.error("verify fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(300, "请求超时，请重新再试。");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
		}
		return result;
	}

	/**
	 * 下一步 核对页
	 * 
	 * @param book
	 * @return
	 */
	@RequestMapping(value = "/book/confirm", method = { RequestMethod.POST })
	public ModelAndView confirm(BookModel book, HttpServletRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		if (book != null) { // 乘客 联系人
			try {
				// 表单信息 联系人 乘客 审批人 规则追加 {房间数量 乘客 联系人 审批 订单价格 规则（担保、预付、预订）}
				map = hotelBookingBusiness.confirm(book, getParameterMap(request), getCompany(), Platform.PC.toString());
			} catch (Exception e) {
				log.error("confirm fail", e);
			}
		} else {

		}
		TokenUtils.setToken(request);
		return new ModelAndView("/hotel/book/hotel-book-confirm", map);
	}

	/**
	 * 返回上一步
	 * 
	 * @param 上一步
	 * @return
	 */
	@RequestMapping("/book/backFill")
	public ModelAndView backFill(BookModel book) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			map = hotelBookingBusiness.goBackFill(book, getParameterMap(request), getCompany(), getUser(), Platform.PC.toString());
			hotelBookCustom.backBook(map, getSessionAttr("casModel") + "");
			CrmEmployee employee = getUser();
			// 是否是可以为他人预订
			map.put("modifyCustomer", employee.getIfallowbook() + "");
			// 是否允许添加员工:1 允许,0不允许
			map.put("addempflageCustomer", employee.getAddempflage() + "");
		} catch (Exception e) {
			log.error("select fail", e);
		}
		return new ModelAndView("/hotel/book/hotel-book", map);
	}

	/**
	 * 担保页面
	 * 
	 * @return
	 */
	@RequestMapping(value = "/book/guarantee", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView guarantee(BookModel book, HttpServletRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		String hotelName = request.getParameter("hotelName");
		String roomName = request.getParameter("roomName");
		if (book == null || StringUtils.isBlank(book.getSignature())) {

		}
		try {
			map = hotelBookingBusiness.decodeModel(book.getSignature());
			map.put("hotelName", hotelName);
			map.put("roomName", roomName);
			map.put("auvgo_token", request.getParameter("auvgo_token"));
		} catch (Exception e) {
			log.error("select fail", e);
		}
		return new ModelAndView("/hotel/book/hotel-book-guarantee", map);
	}

	/**
	 * 信用卡CVV验证
	 * 
	 * @return
	 */
	@RequestMapping(value = "/book/creditcard/{card}", method = { RequestMethod.GET, RequestMethod.POST })
	public @ResponseBody AuvgoResult creditCard(@PathVariable("card") String card) {
		AuvgoResult result = null;
		try {
			CreditcardValidationRes res = hotelBookingBusiness.verifyCreditCard(card, getCompany().getBianhao());
			if (ResultCode.SUCESS.equals(res.getStatus())) {
				result = AuvgoResult.build(200, "OK", res.getData());
			} else {
				result = AuvgoResult.build(300, res.getStatus() + "" + res.getMsg());
			}
		} catch (Exception e) {
			log.error("creditCard fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "请求超时，请重新再试。");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
		}
		return result;
	}

	/**
	 * 创建订单
	 * 
	 * @return
	 */
	@RequestMapping("/book/create")
	public void create(BookModel book, HttpServletResponse response) {
		OrderCreateRes res = new OrderCreateRes();
		Map<String, Object> map = new HashMap<String, Object>();
		String url = "/hotel/book/complete?data=";
		try {
			if (!TokenUtils.validToken(request)) {// 重复提交
				res.setStatus("execute");
				res.setMsg("请勿重复提交");
			} else {
				map.putAll(getParameterMap(request));
				res = hotelBookingBusiness.createOrder(map, book, getUser(), getCompany());
			}
		} catch (OrderCreateException e) {
			res.setStatus("illegal");
			res.setMsg(e.getMessage());
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				res.setStatus("timeout");
				res.setMsg("网络超时，请查看我的订单列表确认订单是否已经提交成功。");
			}
			log.error("create fail", e);
		}
		try {
			try {
				map.put("orderRes", res);
				hotelBookCustom.createAfter(map, getSessionAttr("casModel") + "");
				String json = jsonMapper.toJson(res);
				url += java.net.URLEncoder.encode(json, EnCoding.EN_UTF8);
				String sign = MD5Util.md5Hex("v9}V$sTQ" + json, EnCoding.EN_UTF8);
				url += "&signature=" + sign;
			} finally {
				response.sendRedirect(url);
			}
		} catch (Exception e) {
			log.error("encode fail", e);
		}
	}

	/**
	 * 完成
	 * 
	 * @return
	 */
	@RequestMapping(value = "/book/complete", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView complete(HttpServletRequest request, HttpServletResponse response) {
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP
																					// 1.1.
		response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
		response.setDateHeader("Expires", 0); // Proxies.
		String data = request.getParameter("data");
		String signature = request.getParameter("signature");
		Map<String, Object> map = new HashMap<String, Object>();
		if (StringUtils.isBlank(signature) || StringUtils.isBlank(data)) {
			map.put("code", "error");
			map.put("error", "请求有误，请重新操作");
			return new ModelAndView("/hotel/book/hotel-book-fail", map);
		}
		try {
			data = java.net.URLDecoder.decode(data, EnCoding.EN_UTF8);
		} catch (Exception e) {
			log.error("decode fail", e);
		}
		String sign = MD5Util.md5Hex("v9}V$sTQ" + data, EnCoding.EN_UTF8);
		if (!sign.equals(signature)) {
			map.put("code", "illegal");
			map.put("error", "非法请求");
			return new ModelAndView("/hotel/book/hotel-book-fail", map);
		} else {
			OrderCreateRes res = jsonMapper.fromJson(data, OrderCreateRes.class);
			if (ResultCode.SUCESS.equals(res.getStatus())) {
				map.put("book", res.getData());
			} else {
				map.put("code", res.getStatus());
				map.put("error", res.getMsg());
				return new ModelAndView("/hotel/book/hotel-book-fail", map);
			}
		}
		return new ModelAndView("/hotel/book/hotel-book-success", map);
	}

	/**
	 * 判断是否需要审批
	 * 
	 * @param empidLenvel
	 *            员工id-员工职级 多个用,逗号隔开
	 * @param geolevel
	 *            当前城市级别
	 * @param price
	 *            每日价格
	 * @return
	 */
	@RequestMapping(value = "/approveRule", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult project(String empidLenvel, String geolevel, String price) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			Map<String, Object> approveRule = hotelBookingBusiness.approvePolicy(empidLenvel, geolevel, price, user);
			auvgoResult = AuvgoResult.build(200, "OK", approveRule);
		} catch (Exception e) {
			log.error("contactDetail fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 相似订单验证
	 * 
	 * @return
	 */
	@RequestMapping("/book/verify/similarity/order")
	public @ResponseBody AuvgoResult verifySimilarityOrder(String empids, String checkIn, String checkOut) {
		AuvgoResult result = null;
		try {
			Map<String, Object> map = hotelBookingBusiness.checkSimilarityOrder(empids, checkIn, checkOut);
			if (ResultCode.SUCESS.equals(map.get("status")) && map.get("ordetList") != null) {
				// 相似订单
				result = AuvgoResult.build(601, "相似订单", map.get("ordetList"));
			} else if (ResultCode.SUCESS.equals(map.get("status"))) {
				result = AuvgoResult.build(200, "OK");
			} else {
				result = AuvgoResult.build(300, (String) map.get("msg"));
			}
		} catch (Exception e) {
			log.error("verifySimilarityOrder fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(300, "请求超时，请重新再试。");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
		}
		return result;
	}

	// 请求参数
	private Map<String, Object> getParameterMap(HttpServletRequest request) {
		Map<String, Object> paramter = new HashMap<String, Object>();
		Enumeration<String> enumeration = request.getParameterNames();
		while (enumeration.hasMoreElements()) {
			String type = enumeration.nextElement();
			paramter.put(type, request.getParameter(type));
		}
		// 客户端信息
		paramter.put("sessionId", request.getSession().getId());
		paramter.put("clientIp", ClientIPUtils.getsClientIPAddress(request));
		paramter.put("orderSource", BaseStatusContant.COM_ORDER_FROM_VIP);
		return paramter;
	}

	@Autowired
	public void setHotelBookingBusiness(IHotelBookingBusiness hotelBookingBusiness) {
		this.hotelBookingBusiness = hotelBookingBusiness;
	}

	@Autowired
	public void setHotelBookCustom(IHotelBookCustom hotelBookCustom) {
		this.hotelBookCustom = hotelBookCustom;
	}

}
