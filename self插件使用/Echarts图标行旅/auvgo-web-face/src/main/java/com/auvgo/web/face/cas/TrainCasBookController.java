package com.auvgo.web.face.cas;

import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.crm.entity.*;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.train.entity.*;
import com.auvgo.traincl.api.dto.entity.CLResult;
import com.auvgo.traincl.api.dto.entity.seat.seatDTO;
import com.auvgo.traincl.api.dto.entity.trainsDTO;
import com.auvgo.web.face.train.TrainBookController;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.TravelPassenger;
import com.auvgo.web.model.caslog.train.CasTrainOrderModel;
import com.google.common.collect.Lists;
import org.apache.commons.beanutils.BeanUtilsBean2;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.DecimalFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Created by realxxs on 2018/5/28.
 */
@Controller
@RequestMapping("/train/cas")
public class TrainCasBookController extends TrainBookController {

	@Autowired
	private SysOutpushDataService sysOutdataService;


	/**
	 * 创建火车票订单
	 *
	 * @param orderModel
	 * @return
	 */
	@RequestMapping("/createTrainorder")
	@ResponseBody
	public AuvgoResult createTrainOrder(CasTrainOrderModel orderModel) {
		try {
			if (!DateUtils.isBlongRange()) {
				return AuvgoResult.build(300, "系统11点后不接受此类业务操作");
			}
			CasBookModel casBookModel = jsonMapper.fromJson(getSessionAttr("casModel") + "", CasBookModel.class);
			String bookFlag = "";
			if (null != casBookModel) {
				bookFlag = casBookModel.getBookFlag();
			}
			// 查询的缓存
			CLResult cLResult = (CLResult) getSessionAttr("trainList");
			// 选中车次的缓存
			trainsDTO train = (trainsDTO) getSessionAttr("trainDto");
			CrmCompany crmCompany = getCompany();
			CrmEmployee loginUser = getUser();
			if (!("G".equals(train.getTrainNo().substring(0, 1)) || "C".equals(train.getTrainNo()))) {
				orderModel.getOrder().setChooseSeat("");
			}
			CrmJiesuan jiesuan = null;
			if (null == orderModel.getOrder().getPayType()) {
				// 获取支付方式
				jiesuan = crmJiesuanService.getByCid(crmCompany.getId());
				orderModel.getOrder().setPayType(jiesuan.getFukuankemu());
			} else {
				String payType = orderModel.getOrder().getPayType();
				orderModel.getOrder().setPayType(payType);
			}
			// 封装订单主表
			TrainOrder trainorder = buildOrder(orderModel, crmCompany, train);
			// 封装行程
			TrainOrderRoute orderroute = buildOrderRoute(cLResult.getQueryKey(), train, crmCompany.getId(),
					trainorder.getTravelTime());
			// 封装出行人
			TrainOrderModel orderModels = buildTrainUsers(orderModel, train, loginUser, casBookModel, bookFlag);
			List<TrainOrderApprove> approveList = Lists.newArrayList();
			// 封装审批信息
			if (Lists.newArrayList("2", "3", "5").contains(bookFlag)) {
				approveList = buildTrainApproveList(orderModels, casBookModel);
				if (!approveList.isEmpty()) {
					orderModels.getOrder().setApproveid(1L);
				}

			} else {
				approveList = buildTrainApproves(orderModel, crmCompany.getId());
			}
			orderModels.setOrder(trainorder);
			orderModels.setRoute(orderroute);
			orderModels.setApproves(approveList);
			// 判断票数是否小于人数
			// face设置默认为预付
			orderModels.getOrder().setPayType("1");
			Map<String, Object> orderMap = trainOrderService.createTrainOrder(orderModels);
			List<String> orderNumbr = (List<String>) orderMap.get("orderNo");
			SysOutpushData push = sysOutdataService.getPushDataByOrderno(orderNumbr.get(0));
			SysOutpushData sysOutpushData = dealCasloginMsg(loginUser.getCompanyid(), orderNumbr.get(0), "train", push);
			if (null != sysOutpushData) {
				sysOutdataService.saveOrUpdate(sysOutpushData);
			}
			// 清空session数据
			// 清空车次
			removeSession("trainDto");
			// 清空查询车次列表
			removeSession("trainList");
			// 清空运行时间
			removeSession("chooseRoute");
			// 清空是否可以预定标示
			removeSession("booKFlag");
			// 清除 选择的车次信息
			removeSession("seatMap");
			CrmEmployee user = getUser();
			if (orderNumbr.size() == 1) {
				for (String orderno : orderNumbr) {
					TrainOrderLog orderLog = new TrainOrderLog(orderno, "创建订单", user.getId(), user.getName(),
							user.getDeptname(), new Date(), "创建订单成功" + orderno);
					orderLogService.saveOrUpdate(orderLog);
				}
				return AuvgoResult.build(200, "您的订单提交成功" + orderNumbr.size() + "个订单",
						"/train/success/" + orderNumbr.toString().substring(1, orderNumbr.toString().length() - 1));
			} else {
				TrainOrderLog orderLog = new TrainOrderLog(orderNumbr.get(0), "创建订单", user.getId(), user.getName(),
						user.getDeptname(), new Date(), "订单被拆分");
				orderLogService.saveOrUpdate(orderLog);
				return AuvgoResult.build(200, "您的订单被拆分成!",
						"/train/success/" + orderNumbr.toString().substring(1, orderNumbr.toString().length() - 1));
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.error("createOrder fail data:{},error:{}", orderModel, e);
			return AuvgoResult.build(500, "创建订单失败!");
		}
	}

	private List<TrainOrderApprove> buildTrainApproveList(TrainOrderModel orderModels, CasBookModel casBookModel) {
		TrainOrder trainOrder = orderModels.getOrder();
		List<TrainOrderApprove> approveList = Lists.newArrayList();
		List<ApproveShenpiRen> shenpi = casBookModel.getShenpi();
		for (ApproveShenpiRen shenpiRen : shenpi) {
			TrainOrderApprove orderApprove = new TrainOrderApprove();
			CrmEmployeeModel emp = null;
			if (StringUtils.isNotBlank(shenpiRen.getUsername())) {
				emp = employeeService.getCasLoginByUsername(trainOrder.getCompanyid(), shenpiRen.getUsername());
			}
			if (null != emp) {
				orderApprove.setDeptname(emp.getDeptname());
				orderApprove.setEmployeeid(emp.getId());
			} else {
				orderApprove.setDeptname("");
				orderApprove.setEmployeeid(0L);
			}
			orderApprove.setName(shenpiRen.getName());
			orderApprove.setEmail(shenpiRen.getEmail());
			if (StringUtils.isNotBlank(shenpiRen.getMobile())) {
				if (StringUtils.isNotBlank(shenpiRen.getEmail())) {
					orderApprove.setOpenid("3");
				} else {
					orderApprove.setOpenid("1");
				}
			} else if (StringUtils.isNotBlank(shenpiRen.getEmail())) {
				orderApprove.setOpenid("2");
			}
			orderApprove.setLevel(Integer.parseInt(shenpiRen.getLevel()));
			orderApprove.setCreatetime(new Date());
			orderApprove.setOpstatus(AirStatusContant.COM_APPROVE_STATUS);
			orderApprove.setCompanyid(trainOrder.getCompanyid());
			if ("0".equals(trainOrder.getWeibeiflag())) {
				if ("1".equals(shenpiRen.getIsDefaultApprove())) {
					orderApprove.setIsinert(0);
				}
			} else {
				if ("0".equals(shenpiRen.getIsDefaultApprove())) {
					orderApprove.setIsinert(1);
				}
			}
			orderApprove.setStatus(AuvStatusContant.COM_APPROVE_STATUS);
			approveList.add(orderApprove);
		}
		return approveList;
	}

	TrainOrderModel buildTrainUsers(CasTrainOrderModel orderModel, trainsDTO train, CrmEmployee loginUser, CasBookModel casBookModel, String bookFlag) throws Exception {
		TrainOrderModel trainOrderModel = new TrainOrderModel();
		BeanUtilsBean2.getInstance().copyProperties(trainOrderModel, orderModel);
		CrmFuwufei fuwuFei = crmCompanyService.getComanyFuwufei(loginUser.getCompanyid());
		seatDTO seatDto = (seatDTO) getSessionAttr("chooseRoute");
		// 12306账号
		CrmEmpTraincount account = (CrmEmpTraincount) getSessionAttr("account");
		Long companyid = getCompany().getId();
		double price = seatDto.getPrice();// 拿到价格
		boolean flag = false;
		Double baoxian = 0.0;
		int index = 1;
		List<TrainOrderUsers> userlist = Lists.newArrayList();
		if (Lists.newArrayList("2", "1").contains(bookFlag)) { //存在员工编号
			// 区分常用联系人和企业员工
			// 1企业员工，0临时联系人
			for (TrainOrderUsers user : trainOrderModel.getUsers()) {
				String email = user.getEmail();
				if (1 == user.getId()) {
					CrmEmployee emp = employeeService.getById(companyid, user.getUserId());
					CrmEmployeeCert cert = crmEmployeeCertService.getCertByEmpidAndCertType(user.getIdsType(),
							user.getUserId());
					BeanUtilsBean2.getInstance().copyProperties(user, emp);
					// 是否是vip
					user.setIfvip(null != emp.getIfvip() && 1 == emp.getIfvip().intValue() ? 1 : 0);
					if (null != emp.getIfvip() && 1 == emp.getIfvip().intValue()) {
						flag = true;
					}
					user.setUserPhone(emp.getMobile());
					user.setUserName(emp.getName());
					user.setUserId(emp.getId());
					user.setIdsType(cert.getCerttype());
					user.setUserIds(cert.getCertificate());
					if (StringUtils.isNotBlank(email)) {
						user.setEmail(email);
					}
				} else if (0 == user.getId()) {// 临时乘客
					CrmEmployeeLinshi emplish = crmEmployeeLinshiService.getById(user.getUserId());
					user.setUserId(0L);
					user.setUserIds(emplish.getCertno());
					user.setIdsType(emplish.getCerttype());
					user.setUserName(emplish.getUsername());
					user.setUserPhone(emplish.getMobile());
					user.setCompanyid(companyid);
					user.setIfvip(0);
					if (StringUtils.isNotBlank(email)) {
						user.setEmail(email);
					}
				}
				// 获取到座位席别
				user.setSeatCode(seatDto.getSeatType());
				// 1成人票 2儿童票
				user.setTicketType(1);
				user.setSeatClass(seatDto.getSeatClass());// 座位类型
				// 设置12306账号
				if (null != account) {
					user.setAccountName(account.getAccount());
					user.setAccountPwd(account.getPass());
				}
				userlist.add(user);
			}
		} else if (Lists.newArrayList("3", "4").contains(bookFlag)) {
			List<TravelPassenger> passengers = casBookModel.getPassengers();
			for (TravelPassenger pa : passengers) {
				TrainOrderUsers orderUsers = new TrainOrderUsers();
				orderUsers.setUserName(pa.getName());
				orderUsers.setUserIds(pa.getCertno());
				orderUsers.setUserId(0L);
				orderUsers.setUserIds(pa.getCertno());
				orderUsers.setIdsType(pa.getCertType());
				orderUsers.setUserPhone(pa.getMobile());
				orderUsers.setCompanyid(companyid);
				orderUsers.setIfvip(0);
				orderUsers.setEmail("");
				orderUsers.setAccountName("");
				orderUsers.setAccountPwd("");
				orderUsers.setSeatCode(seatDto.getSeatType());
				// 1成人票 2儿童票
				orderUsers.setTicketType(1);
				orderUsers.setSeatClass(seatDto.getSeatClass());// 座位类型
				userlist.add(orderUsers);
			}
		}

		for (TrainOrderUsers user : userlist) {
			// 设置特殊席别
			user.setSeatType(seatDto.getSeatName());
			user.setStatus(0);
			user.setCreatetime(new Date());
			// 设置保险费用
			user.setBxPayMoney(baoxian);
			// 采购票服务费,暂1元
			user.setTicketCharges(AuvStatusContant.Interface_fei);
			user.setSort(index);
			// 计算服务费
			if ("order".equals(fuwuFei.getTraintype())) {
				// 坐席待定费
				user.setFuwufei(Double.valueOf(fuwuFei.getTrainweb()));
			} else if ("per".equals(fuwuFei.getTraintype())) {
				// 按订单百分比 收取
				if ("1".equals(fuwuFei.getTrainpertype())) {
					DecimalFormat df = new DecimalFormat("#.0");
					user.setFuwufei(Double.valueOf(df.format((price + baoxian) * Double.valueOf(fuwuFei.getTrainper()) / 100D)));
				} else {
					user.setFuwufei(0d);
				}
			}
			// 乘客所需要付钱:票价+保险+服务费
			user.setTotalprice(user.getFuwufei() + price + baoxian);
			// 票价
			user.setAmount(price);
			index++;
		}
		orderModel.getOrder().setIfvip(flag ? 1 : 0);
		orderModel.setUsers(userlist);
		return orderModel;
	}
}


