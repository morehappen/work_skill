package com.auvgo.web.model;

import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

/**
 * Created by 小四 on 2018/3/20.
 */
public class PersonFind implements Serializable {

	public Long companyid;
	public Long empid;//
	List<FindType> list = Lists.newArrayList();

	public Long getCompanyid() {
		return companyid;
	}

	public void setCompanyid(Long companyid) {
		this.companyid = companyid;
	}

	public Long getEmpid() {
		return empid;
	}

	public void setEmpid(Long empid) {
		this.empid = empid;
	}

	public List<FindType> getList() {
		return list;
	}

	public void setList(List<FindType> list) {
		this.list = list;
	}
}
