package com.auvgo.web.model.caslog;

import com.auvgo.business.hotel.custom.model.BookOperator;
import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

/**
 * Created by realxxs on 2018/5/22.
 */
public class CasBookModel implements Serializable {
	private static final long serialVersionUID = -5988028245948451691L;

	private String traverorderno; // 出差申请单号
	private String product; // 产品类型
	private String costname;// 成本中心
	private String proname;// 项目中心
	private CasRoute route;// 行程
	private List<CasTravelRoute> routes;// 预订行程节点
	private String routetype;// 默认为空单程,返程为rt;
	private CustomInfo custinfo;// 预订人信息
	private String approveRuleName;// 审批规则名
	private String hidenMenu;// 是否隐藏头部，左侧菜单 all全部隐藏|head头部菜单|left左侧菜单
	private List<TravelPassenger> passengers = Lists.newArrayList(); // 出行人信息
	private List<ApproveShenpiRen> shenpi = Lists.newArrayList(); // 审批人信息
	private String bookFlag;// 预订形式:1有员工编号,无审批节点，2有编号,有审批节点,有出行人，3无编号,有审批节点，4无编号,无审批节点，5有编号,有审批节点,无出行人
	/**
	 * 客服预订人信息
	 **/
	private BookOperator bookOperator;

	public String getHidenMenu() {
		return hidenMenu;
	}

	public void setHidenMenu(String hidenMenu) {
		this.hidenMenu = hidenMenu;
	}

	public String getTraverorderno() {
		return traverorderno;
	}

	public void setTraverorderno(String traverorderno) {
		this.traverorderno = traverorderno;
	}

	public String getProduct() {
		return product;
	}

	public void setProduct(String product) {
		this.product = product;
	}

	public String getCostname() {
		return costname;
	}

	public void setCostname(String costname) {
		this.costname = costname;
	}

	public String getProname() {
		return proname;
	}

	public void setProname(String proname) {
		this.proname = proname;
	}

	public CasRoute getRoute() {
		return route;
	}

	public void setRoute(CasRoute route) {
		this.route = route;
	}

	public CustomInfo getCustinfo() {
		return custinfo;
	}

	public void setCustinfo(CustomInfo custinfo) {
		this.custinfo = custinfo;
	}

	public List<TravelPassenger> getPassengers() {
		return passengers;
	}

	public void setPassengers(List<TravelPassenger> passengers) {
		this.passengers = passengers;
	}

	public List<ApproveShenpiRen> getShenpi() {
		return shenpi;
	}

	public void setShenpi(List<ApproveShenpiRen> shenpi) {
		this.shenpi = shenpi;
	}

	public String getBookFlag() {
		return bookFlag;
	}

	public void setBookFlag(String bookFlag) {
		this.bookFlag = bookFlag;
	}

	public String getApproveRuleName() {
		return approveRuleName;
	}

	public void setApproveRuleName(String approveRuleName) {
		this.approveRuleName = approveRuleName;
	}

	public BookOperator getBookOperator() {
		return bookOperator;
	}

	public void setBookOperator(BookOperator bookOperator) {
		this.bookOperator = bookOperator;
	}

	public String getRoutetype() {
		return routetype;
	}

	public void setRoutetype(String routetype) {
		this.routetype = routetype;
	}

	public List<CasTravelRoute> getRoutes() {
		return routes;
	}

	public void setRoutes(List<CasTravelRoute> routes) {
		this.routes = routes;
	}

	@Override
	public String toString() {
		return "CasBookModel{" + "traverorderno='" + traverorderno + '\'' + ", product='" + product + '\'' + ", costname='" + costname + '\'' + ", proname='" + proname + '\''
				+ ", route=" + route + ", routes=" + routes + ", routetype='" + routetype + '\'' + ", custinfo=" + custinfo + ", approveRuleName='" + approveRuleName + '\''
				+ ", passengers=" + passengers + ", shenpi=" + shenpi + ", bookFlag='" + bookFlag + '\'' + ", bookOperator=" + bookOperator + '}';
	}
}
