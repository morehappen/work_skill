package com.auvgo.web.face.train;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmPolicyTrainService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.train19.api.KTTrainSearchService;
import com.auvgo.train19.result.KTQueryResult;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.TrainQueryModel;
import com.google.common.collect.Maps;

/**
 * 火车票查询controller
 * 
 * @author zxb
 *
 */
@Controller
@RequestMapping("/train/query")
public class TrainQueryController extends BaseController {
	private static JsonMapper jsonMapper = JsonMapper.nonNullMapper();
	@Autowired
	private KTTrainSearchService trainSearchService;
	@Autowired
	private CrmPolicyTrainService policyTrainService;
	
	
	@RequestMapping("")
	public String query(TrainQueryModel query){
		log.info("TrainQuery:{} ", JsonUtils.objectToJson(query));
		//setAttr("query", query);
		setSessionAttr("train_query_con", query);// 保存查询条件
		return "/train/train-query-list";
	}

	
	/**
	 * 
	 * 查询余票信息
	 *
	 * @param param 
	 * 			查询参数
	 * @return
	 */
	@RequestMapping("/list")
	@ResponseBody
	public AuvgoResult queryTrain(TrainQueryModel param) {
		try {
			log.info("/train/query-->request {}", jsonMapper.toJson(param));
			if(StringUtils.isBlank(param.getFrom()) || StringUtils.isBlank(param.getArrive()) || StringUtils.isBlank(param.getStartDate())) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS,ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			KTQueryResult query = trainSearchService.query(param.getFrom(), param.getArrive(), param.getStartDate(), "ADULT");
			//setAttr("TrainResult", query);
			setSessionAttr("train_query_con", param);// 保存查询条件
			setSessionAttr("trainList", query);//查询结果保存到session中
			//log.info("/train/query/list-->response {}", jsonMapper.toJson(query));
			return AuvgoResult.build(ErrorCode.SUCCESS, String.valueOf(getBooKFlag()),JsonUtils.objectToJson(query));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.ERROR,"查询繁忙，请您重新查询！");
	}


	private int getBooKFlag() {
		Calendar cal = Calendar.getInstance();
		return cal.get(Calendar.HOUR_OF_DAY) >= 23 || cal.get(Calendar.HOUR_OF_DAY) <= 6 ? 0 : 1;
	}
	
	/**
	 * 
	 * 查询经停站点
	 * 
	 * @param querydate 出发日期
	 * @param fromcode  出发城市code
	 * @param tocode    到达车市code
	 * @param train_no  列车内部编码( 查询结果里有 )
	 * @return
	 */
	@RequestMapping("/stopover/{querydate}/{fromcode}/{tocode}/{train_no}")
	@ResponseBody
	public AuvgoResult queryStopover(@PathVariable("querydate") String querydate, @PathVariable("fromcode") String fromcode,
			@PathVariable("tocode") String tocode, @PathVariable("train_no") String train_no) {
		try {
			Map<String,Object> map = Maps.newHashMap();
			map.put("querydate", querydate);
			map.put("fromcode", fromcode);
			map.put("tocode", tocode);
			map.put("train_no", train_no);
			log.info("/stopover-->request {}", jsonMapper.toJson(map));
			String station = trainSearchService.station(querydate, fromcode, tocode, train_no);
			log.info("/stopover-->reponse{}", station);
			return JsonUtils.jsonToPojo(station, AuvgoResult.class);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.ERROR, "查询失败!");
	}
	
	/**
	 * 火车票 获取差旅政策 输入参数{"level":1/2/3}
	 * 
	 * @param level
	 * @return
	 */
	@RequestMapping(value = "/policy", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult getTrainPolicy(@RequestParam("level") String level) {
		try {
			log.info("/train/query/policy-->request level:{}", level);
			CrmCompany crmCompany = getCompany();
			if (null == crmCompany || null == crmCompany.getId() && StringUtils.isBlank(level) ) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS,ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			List<String> asList = Arrays.asList(StringUtils.removeEnd(level, "/").split("/"));
			String resultJson = policyTrainService.getCompanyPolicyByEmployeeLevel(crmCompany.getId().toString(), asList);
			log.info("reponse--> resultJson:{}", resultJson);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS),resultJson);
		} catch (Exception e) {
			log.warn("/train/query/policy error--> level:{},Exception:{}", level, e);
			return AuvgoResult.build(ErrorCode.ERROR, "获取差旅政策失败！");
		}
	}
	
}
