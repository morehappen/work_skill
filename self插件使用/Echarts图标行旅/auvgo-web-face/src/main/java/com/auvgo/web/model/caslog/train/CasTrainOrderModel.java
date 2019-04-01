package com.auvgo.web.model.caslog.train;

import com.auvgo.train.entity.TrainOrderModel;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.google.common.collect.Lists;

import java.util.List;

/**
 * Created by realxxs on 2018/5/28.
 */
public class CasTrainOrderModel extends TrainOrderModel {
	public List<ApproveShenpiRen> shenpi = Lists.newArrayList();

	public List<ApproveShenpiRen> getShenpi() {
		return shenpi;
	}

	public void setShenpi(List<ApproveShenpiRen> shenpi) {
		this.shenpi = shenpi;
	}
}
