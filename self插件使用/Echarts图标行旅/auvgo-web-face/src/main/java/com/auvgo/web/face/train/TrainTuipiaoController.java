package com.auvgo.web.face.train;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.sys.api.SysOutpushDataService;
import com.auvgo.sys.entity.SysOutpushData;
import com.auvgo.train.api.TrainOrderLogService;
import com.auvgo.train.api.TrainTuipiaoService;
import com.auvgo.train.entity.TrainOrderLog;
import com.auvgo.web.face.BaseController;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Date;

@RequestMapping("/train/tuipiao")
@Controller
public class TrainTuipiaoController extends BaseController {
	@Autowired
	private TrainTuipiaoService tuipiaoService;
	@Autowired
	private TrainOrderLogService orderLogService;
	@Autowired
	private SysOutpushDataService sysOutdataService;

    @RequestMapping("/shenqing")
    public String shenQingTuipiao( String orderno, String ids) {
        String[] id = StringUtils.removeEnd(ids, "-").split("-");
        Integer orderFrom = 1;
        try {
        	if (!DateUtils.isBlongRange()) {
        		setAttr("Msg","温馨提示：每日06:00-22:55提供服务，购票、改签和退票须不晚于开车前36分钟");
				return "/common/404";
			}
			CrmEmployee user = getUser();
			String str = tuipiaoService.createTuipiaoOrder(orderno, id, user.getName(), user.getId(), orderFrom);
			AuvgoResult result = JsonUtils.jsonToPojo(str, AuvgoResult.class);
			if (result.getStatus() == 200) {
				TrainOrderLog orderLog = new TrainOrderLog(orderno, "申请退票", user.getId(), user.getName(), user.getDeptname(), new Date(), user.getName()
						+ "申请了退票业务");
				orderLogService.saveOrUpdate(orderLog);
				String tporderNO = result.getData() + "";
				setAttr("orderno", tporderNO);
				setAttr("flag", 1);
				setAttr("title", "火车票-申请退票-成功");
				setAttr("titleFlag", "退票中");
				setAttr("contentFlag", "退票已提交，请耐心等待退票处理；实际退款结果以12306为准");
				SysOutpushData push = sysOutdataService.getPushDataByOrderno(tporderNO);
				SysOutpushData sysOutpushData = dealCasloginMsg(user.getCompanyid(), result.getData() + "", "traintp", push);
				if (null != sysOutpushData) {
					sysOutdataService.saveOrUpdate(sysOutpushData);
				}
			}else{
				setAttr("failMsg",result.getMsg());
				setAttr("returnFlag","/myChailv/toTrainOrderDetail/"+orderno+"?flag=personal");
				return "/crm/my-chailv/train/train-fail";
			}
			return "/crm/my-chailv/train/train-apply-success";

		} catch (Exception e) {
			e.printStackTrace();
			setAttr("Msg", "申请退票失败!");
			return "/common/404";
		}
	}
}
