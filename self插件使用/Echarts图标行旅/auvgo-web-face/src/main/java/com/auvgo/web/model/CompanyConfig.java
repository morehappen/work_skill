package com.auvgo.web.model;

import java.io.Serializable;
import java.util.List;

import com.auvgo.crm.entity.CrmFuwufei;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.data.entity.DataBaoxianCompany;
import com.google.common.collect.Lists;

public class CompanyConfig implements Serializable{

	
	private static final long serialVersionUID = 6718477656741264184L;
	CrmProductSet productSet;
	CrmFuwufei fuwufei;
	List<DataBaoxianCompany> list =Lists.newArrayList();
	public CrmProductSet getProductSet() {
		return productSet;
	}
	public void setProductSet(CrmProductSet productSet) {
		this.productSet = productSet;
	}
	public CrmFuwufei getFuwufei() {
		return fuwufei;
	}
	public void setFuwufei(CrmFuwufei fuwufei) {
		this.fuwufei = fuwufei;
	}
	public List<DataBaoxianCompany> getList() {
		return list;
	}
	public void setList(List<DataBaoxianCompany> list) {
		this.list = list;
	}
	
	
}