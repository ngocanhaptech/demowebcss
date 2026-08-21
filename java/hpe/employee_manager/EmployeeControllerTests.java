package com.example.restservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EmployeeController.class)
public class EmployeeControllerTests {

    @Autowired
    private MockMvc mockMvc;

    // Giả lập (Mock) lớp EmployeeManager để không can thiệp vào dữ liệu thật
    @MockBean
    private EmployeeManager employeeManager;

    @Test
    public void testGetAllEmployees() throws Exception {
        // Prepare: Tạo danh sách nhân viên giả lập
        Employees mockEmployees = new Employees();
        mockEmployees.getEmployeeList().add(new Employee("EMP001", "Alex", "Nguyen", "alex.nguyen@hpe.com", "Software Engineer"));
        mockEmployees.getEmployeeList().add(new Employee("EMP002", "Stella", "Yun", "stella.yun@hpe.com", "Director"));

        // Define Mock Behavior
        when(employeeManager.getAllEmployees()).thenReturn(mockEmployees);

        // Execute & Assert HTTP GET /employees
        mockMvc.perform(get("/employees")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeList[0].employee_id").value("EMP001"))
                .andExpect(jsonPath("$.employeeList[0].first_name").value("Alex"))
                .andExpect(jsonPath("$.employeeList[1].employee_id").value("EMP002"));
    }

    @Test
    public void testAddEmployee() throws Exception {
        // Prepare: Chuỗi JSON đại diện cho nhân viên mới cần thêm
        String newEmployeeJson = "{"
                + "\"employee_id\": \"EMP004\","
                + "\"first_name\": \"Michael\","
                + "\"last_name\": \"Scott\","
                + "\"email\": \"michael.scott@hpe.com\","
                + "\"title\": \"Regional Manager\""
                + "}";

        // Define Mock Behavior
        doNothing().when(employeeManager).addEmployee(any(Employee.class));

        // Execute & Assert HTTP POST /employees
        mockMvc.perform(post("/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newEmployeeJson))
                .andExpect(status().isCreated())
                .andExpect(content().string("Employee added successfully!"));
    }
}