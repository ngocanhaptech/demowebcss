package com.example.restservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeManager employeeDao;

    // HTTP GET: Lấy toàn bộ danh sách nhân viên
    @GetMapping(path = "/employees", produces = "application/json")
    public Employees getEmployees() {
        return employeeDao.getAllEmployees();
    }

    // HTTP POST: Thêm nhân viên mới từ dữ liệu JSON gửi lên
    @PostMapping(path = "/employees", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Object> addEmployee(@RequestBody Employee employee) {
        
        // Thêm nhân viên mới vào hệ thống
        employeeDao.addEmployee(employee);

        // Trả về HTTP Status 201 Created cùng với thông báo thành công
        return new ResponseEntity<>("Employee added successfully!", HttpStatus.CREATED);
    }
}