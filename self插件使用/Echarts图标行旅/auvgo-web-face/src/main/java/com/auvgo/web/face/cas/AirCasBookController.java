package com.auvgo.web.face.cas;

import com.auvgo.air.entity.*;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmEmployeeCert;
import com.auvgo.crm.entity.CrmFuwufei;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.data.entity.DataBaoxianCompany;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.web.face.air.AirBookController;
import com.auvgo.web.model.AirQuery;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.TravelPassenger;
import com.auvgo.web.model.caslog.air.CasAirOrderModel;
import com.google.common.collect.Lists;
import org.apache.commons.beanutils.BeanUtilsBean2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/air/cas")
public class AirCasBookController extends AirBookController {
	@Autowired
	protected CrmEmployeeService employeeService;

	// 创建机票订单
	@SuppressWarnings("unchecked")
	@RequestMapping("/createAirOrder")
	public String createAirOrder(CasAirOrderModel casAirOrderModel) throws Exception {
		CrmEmployee user = getUser();
		if (null == user || null == user.getCompanyid()) {
			setAttr("failMsg", "登陆人信息有误,请重新登陆");
			return "/common/error";
		}
		try {
			List<DataBaoxianCompany> list = null;
			AirOrderModel orderModel = BuildOrderRec(casAirOrderModel, user);
			if (StringUtils.isNotBlank(orderModel.getBaoxian())) {
				list = getBaoxian(orderModel.getBaoxian());
				orderModel.setBxNum(list.size());
			}
			CasBookModel casBookModel = jsonMapper.fromJson(getSessionAttr("casModel") + "", CasBookModel.class);
			// 封装出行人
			orderModel = buildOrderUser(orderModel, user, list, casBookModel);
			// 获取选择的行程
			List<AirOrderRoute> orderRoute = (List<AirOrderRoute>) getSessionAttr("bookRoutes");
			orderModel.setOrderRoutes(orderRoute);
			CrmFuwufei fuwufei = fuwufeiService.getByCid(user.getCompanyid());
			// 保存审批信息 但此时保存不上订单号,需要到service中生成订单号后保存
			if (Lists.newArrayList("2", "3", "5").contains(casBookModel.getBookFlag())) {
				List<AirOrderApprove> approvelist = saveAirApprove(casAirOrderModel, orderModel);
				if (!approvelist.isEmpty()) {
					orderModel.setApproves(approvelist);
					orderModel.getAirOrder().setApproveid(1L);//防止误判为无需审批
				}
			} else if (Lists.newArrayList("1").contains(casBookModel.getBookFlag())) {
				saveAirApprove(orderModel);
			}
			List<String> orderNo = null;
			if ("order".equals(fuwufei.getGntype())) {
				Double gnweb = Double.valueOf(fuwufei.getGnweb() + "");
				orderNo = airOrderService.createOrder(orderModel, gnweb, fuwufei.getGntype());
			} else if ("per".equals(fuwufei.getGntype())) {
				if ("1".equals(fuwufei.getGnpertype())) {// 按订单百分比 收取
					orderNo = airOrderService.createOrder(orderModel, Double.valueOf(fuwufei.getGnper()), fuwufei.getGntype());// 返回的是订单号
				} else {
					orderNo = airOrderService.createOrder(orderModel, 0d, fuwufei.getGntype());// 返回的是订单号
				}
			}

			SysOutpushData push = sysOutdataService.getPushDataByOrderno(orderNo.get(0));
			SysOutpushData pushData = dealCasloginMsg(user.getCompanyid(), orderNo.get(0), "air", push);
			if (null != pushData) {
				sysOutdataService.saveOrUpdate(pushData);
			}
			if (null != orderNo && orderNo.size() > 0) {
				if (orderNo.size() > 1) {
					return "redirect:/air/order/Tosuccess?orderno1=" + orderNo.get(0) + "&&orderno2=" + orderNo.get(1);
				} else {
					return "redirect:/air/order/Tosuccess?orderno1=" + orderNo.get(0) + "&&orderno2= ";
				}
			}
			setAttr("failMsg", "订单提交出现异常");
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} finally {
			removeSession("bookRoutes");// 清楚缓存
		}
		return "common/error";
	}


	private List<AirOrderApprove> saveAirApprove(CasAirOrderModel casAirOrderModel, AirOrderModel orderModel) throws Exception {
		AirOrder airOrder = orderModel.getAirOrder();
		List<ApproveShenpiRen> shenpi = casAirOrderModel.getShenpi();
		List<AirOrderApprove> orderApproveList = Lists.newArrayList();
		if (!shenpi.isEmpty()) {
			for (ApproveShenpiRen approve : shenpi) {
				AirOrderApprove orderApprove = new AirOrderApprove();
				CrmEmployeeModel emp = null;
				if (StringUtils.isNotBlank(approve.getUsername())) {
					emp = employeeService.getCasLoginByUsername(airOrder.getCompanyid(), approve.getUsername());
				}
				if (null != emp) {
					orderApprove.setDeptname(emp.getDeptname());
					orderApprove.setEmployeeid(emp.getId());
				} else {
					orderApprove.setDeptname("");
					orderApprove.setEmployeeid(0L);
				}
				orderApprove.setName(approve.getName());
				orderApprove.setEmail(approve.getEmail());
				orderApprove.setMobile(approve.getMobile());
				if (StringUtils.isNotBlank(approve.getMobile())) {
					if (StringUtils.isNotBlank(approve.getEmail())) {
						orderApprove.setOpenid("3");
					} else {
						orderApprove.setOpenid("1");
					}
				} else if (StringUtils.isNotBlank(approve.getEmail())) {
					orderApprove.setOpenid("2");
				}
				orderApprove.setLevel(Integer.parseInt(approve.getLevel()));
				orderApprove.setCreatetime(new Date());
				orderApprove.setOpstatus(AirStatusContant.COM_APPROVE_STATUS);
				orderApprove.setCompanyid(airOrder.getCompanyid());
				if ("0".equals(airOrder.getWeibeiflag())) {
					if ("1".equals(approve.getIsDefaultApprove())) {
						orderApprove.setIsinert(0);
					}
				} else {
					if ("0".equals(approve.getIsDefaultApprove())) {
						orderApprove.setIsinert(1);
					}
				}
				orderApprove.setStatus(AuvStatusContant.COM_APPROVE_STATUS);
				orderApproveList.add(orderApprove);
			}
		}
		return orderApproveList;
	}


	private AirOrderModel buildOrderUser(AirOrderModel orderModel, CrmEmployee user, List<DataBaoxianCompany> list, CasBookModel casBookModel) throws Exception {
		double baoMoney = 0.0;
		double baoCaiMoney = 0.0;
		StringBuffer bname = new StringBuffer();
		StringBuffer bcode = new StringBuffer();
		if (null != list && list.size() > 0) {
			for (DataBaoxianCompany baoxian : list) {
				baoMoney += baoxian.getSalePrice();
				baoCaiMoney += baoxian.getCaigouPrice();
				bname.append(baoxian.getName() + ",");
				bcode.append(baoxian.getCode() + ",");
			}
		}
		boolean flag = false;
		String bookFlag = "";
		if (null != casBookModel) {
			bookFlag = casBookModel.getBookFlag();
		}
		List<TravelPassenger> passengers = casBookModel.getPassengers();
		List<AirOrderPassenger> passengerList = Lists.newArrayList();
		List<AirOrderPassenger> airUser = orderModel.getAirUser();
		if (Lists.newArrayList("1", "2", "5").contains(bookFlag)) {//2 有编号
			for (int i = 0; i < airUser.size(); i++) {
				AirOrderPassenger Passenger = airUser.get(i);
				CrmEmployee emp = crmEmployeeService.getById(user.getCompanyid(), Passenger.getEmployeeid());
				List<CrmEmployeeCert> certlist = certService.findByCidAndEmpid(user.getCompanyid(), Passenger.getEmployeeid());
				CrmEmployeeCert empcerts = null;
				if (null != certlist && !certlist.isEmpty()) {
					// 遍历拿到对应的证件
					for (CrmEmployeeCert empcert : certlist) {
						if (Passenger.getCerttype().equals(empcert.getCerttype()) && StringUtils.isNotBlank(empcert.getCertificate())) {
							if (StringUtils.isNotBlank(empcert.getUsername())) {
								empcerts = empcert;
								break;
							}
						}
					}
				}
				BeanUtilsBean2.getInstance().copyProperties(Passenger, emp);
				if (null == empcerts) {
					Passenger.setCerttype(emp.getCerttype());
					Passenger.setCertno(emp.getCertno());
				} else {
					Passenger.setCerttype(empcerts.getCerttype());
					Passenger.setCertno(empcerts.getCertificate());
					Passenger.setName(empcerts.getUsername());
				}
				Passenger.setBxPayMoney(baoMoney);
				Passenger.setBxCaigouMoney(baoCaiMoney);
				Passenger.setBxCode(String.valueOf(bcode));
				Passenger.setBxName(String.valueOf(bname));
				Passenger.setEmployeeid(emp.getId());
				Passenger.setZhiwei(Integer.parseInt(emp.getZhiwei()));
				Passenger.setDeptid(emp.getDeptid() + "");
				Passenger.setDepname(emp.getDeptname());
				Passenger.setPasstype("AD");
				Integer ifvip = emp.getIfvip();
				if (null != ifvip && 1 == ifvip) {
					flag = true;
					Passenger.setIfvip(ifvip);
				} else {
					Passenger.setIfvip(0);
				}
				passengerList.add(Passenger);
			}
		} else if (Lists.newArrayList("3", "4").contains(bookFlag)) {//没有编号
			for (int i = 0; i < passengers.size(); i++) {
				TravelPassenger trap = passengers.get(i);
				AirOrderPassenger orderp = new AirOrderPassenger();
				orderp.setBxPayMoney(baoMoney);
				orderp.setBxCaigouMoney(baoCaiMoney);
				orderp.setBxCode(String.valueOf(bcode));
				orderp.setBxName(String.valueOf(bname));
				orderp.setName(trap.getName());
				orderp.setCerttype(trap.getCertType());
				orderp.setCertno(trap.getCertno());
				orderp.setZhiwei(Integer.parseInt(trap.getLevel()));
				orderp.setDeptid("0");
				orderp.setIfvip(0);
				orderp.setDepname("");
				orderp.setEmployeeid(0L);
				orderp.setEmail("");
				orderp.setMobile(trap.getMobile());
				orderp.setCreatetime(new Date());
				passengerList.add(orderp);
			}
		}
		orderModel.getAirOrder().setIfvip(flag ? 1 : 0);
		orderModel.setAirUser(passengerList);
		return orderModel;
	}

	private AirOrderModel BuildOrderRec(CasAirOrderModel casAirOrderModel, CrmEmployee user) throws Exception {
		AirOrderModel orderModel = new AirOrderModel();
		BeanUtilsBean2.getInstance().copyProperties(orderModel, casAirOrderModel);
		AirQuery query = (AirQuery) getSessionAttr("airquery");
		AirOrder airorder = orderModel.getAirOrder();
		CrmCompany company = companyService.getById(user.getCompanyid());
		airorder.setCompanyid(company.getId());
		airorder.setCompanycode(company.getBianhao());
		airorder.setCompanyname(company.getName());
		airorder.setTickettype(0);// 国内机票
		airorder.setOrderFrom(BaseStatusContant.COM_ORDER_FROM_VIP);// 前台白屏
		airorder.setChuchaitype(0);// 默认因公
		airorder.setOrdertype(query.getType());// 订单类型是单还是往返
		airorder.setPayType(BaseStatusContant.PAY_TYPE_XYQK + "");// 默认是协议欠款
		airorder.setBookusername(user.getName());
		airorder.setBookuserid(user.getId());
		if (StringUtils.isBlank(airorder.getLinkPhone())) {// 如果联系人手机号没填写,自动填入预订人的手机号
			airorder.setLinkPhone(user.getMobile());
		}
		if (StringUtils.isBlank(airorder.getLinkName())) {
			airorder.setLinkName(user.getName());
		}
		airorder.setBookdepth(user.getDepth());
		airorder.setBookdept(user.getDeptname());
		airorder.setCreatetime(new Date());
		orderModel.setAirOrder(airorder);
		return orderModel;
	}
}
