package com.auvgo.web.model.caslog.air;

import com.auvgo.air.entity.AirOrderModel;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.google.common.collect.Lists;

import java.util.List;

/**
 * Created by realxxs on 2018/5/26.
 */
public class CasAirOrderModel extends AirOrderModel {
	private static final long serialVersionUID = -8005994475720461627L;
	List<ApproveShenpiRen> shenpi = Lists.newArrayList();

	public List<ApproveShenpiRen> getShenpi() {
		return shenpi;
	}

	public void setShenpi(List<ApproveShenpiRen> shenpi) {
		this.shenpi = shenpi;
	}
}
