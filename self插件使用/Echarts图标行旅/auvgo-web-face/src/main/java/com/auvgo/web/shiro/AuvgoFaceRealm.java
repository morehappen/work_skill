package com.auvgo.web.shiro;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmRoleService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmRoleAcc;
import com.auvgo.crm.pojo.CrmEmployeeModel;

public class AuvgoFaceRealm extends AuthorizingRealm {

	@Autowired
	CrmEmployeeService employeeService;
	@Autowired
	CrmCompanyService companyService;
	@Autowired
	CrmRoleService crmroleservice;

	/**
	 * 验证当前登录的Subject
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authcToken) throws AuthenticationException {
		CustomUsernamePasswordToken token = (CustomUsernamePasswordToken) authcToken;
		String username = token.getUsername();

		if (StringUtils.isBlank(username)) {
			throw new AuthenticationException("用户名不可以为空");
		}
		CrmEmployeeModel account = null;
		String password = null;
		CrmCompany company = companyService.findByKaHao(token.getKahao().trim());
		if (null == company) {
			throw new AuthenticationException("公司卡号输入错误或者不存在,0");
		}
		if (username.equals(company.getUsername())) {
			account = new CrmEmployeeModel();
			account.setStatus(0);
			account.setId(0l);
			account.setDeptid(0L);
			account.setDeptname(company.getSimpname());
			account.setName("系统管理员");
			account.setUsername("username");
			account.setPassword(company.getPassword());
			password = company.getPassword().toUpperCase();
			account.setCompanyid(1L);
			if (!token.getLoginPassword().equalsIgnoreCase(company.getPassword())) {
				throw new AuthenticationException("用户名或者密码错误,1");
			}
		} else {
			account = employeeService.getCasLoginByUsername(company.getId(), username);
			if (null == account) {
				throw new AuthenticationException("用户名或者密码错误,1");
			}
			if (account.getKaitong() != 1 || account.getStatus() != 0 || account.getOpened() != 1) {
				throw new AuthenticationException("该用户已被锁定或者无效,1");
			}
			password = account.getPassword();
			List<CrmRoleAcc> rolelist = crmroleservice.findRolesByCidAndEmpid(company.getId(), account.getId());
			if (null == rolelist || rolelist.size() == 0) {
				// throw new AuthenticationException("你没有分配系统的使用权限，请联系系统管理员");
			}
		}
		//System.out.println("验证当前Subject时获取到token为" + ReflectionToStringBuilder.toString(token, ToStringStyle.MULTI_LINE_STYLE));
		// 为共享登录做的特殊处理
		if (StringUtils.isBlank(password)) {
			password = "password";
		}
		return new SimpleAuthenticationInfo(account, password.toUpperCase(), account.getName());
	}

	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
		SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
		// 加载权限

		return info;
	}

	@Override
	public void clearCachedAuthorizationInfo(PrincipalCollection principals) {
		super.clearCachedAuthorizationInfo(principals);
	}

	@Override
	public void clearCachedAuthenticationInfo(PrincipalCollection principals) {
		super.clearCachedAuthenticationInfo(principals);
	}

	@Override
	public void clearCache(PrincipalCollection principals) {
		super.clearCache(principals);
	}

	public void clearAllCachedAuthorizationInfo() {
		getAuthorizationCache().clear();
	}

	public void clearAllCachedAuthenticationInfo() {
		getAuthenticationCache().clear();
	}

	public void clearAllCache() {
		clearAllCachedAuthenticationInfo();
		clearAllCachedAuthorizationInfo();
	}

}