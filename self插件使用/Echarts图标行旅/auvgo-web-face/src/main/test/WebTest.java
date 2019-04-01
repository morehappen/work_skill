import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath*:spring-*.xml")
@WebAppConfiguration
public class WebTest {

	protected MockMvc mockMvc;
	@Autowired
	protected WebApplicationContext webApplicationContext;

	HttpServletRequest	request;	
	 HttpServletResponse   response;
	
	@Before
	public void setUp() throws Exception {
		mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
		request = new MockHttpServletRequest();    
        request.setCharacterEncoding("UTF-8");    
        response = new MockHttpServletResponse();
	}

	@Test
	public void teset1(){
		System.out.println(request);
	
	}
	

}
