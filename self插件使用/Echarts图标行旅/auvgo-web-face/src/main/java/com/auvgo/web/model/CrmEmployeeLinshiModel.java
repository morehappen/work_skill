package com.auvgo.web.model;

import com.auvgo.crm.entity.CrmEmployeeLinshi;

public class CrmEmployeeLinshiModel extends CrmEmployeeLinshi {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
