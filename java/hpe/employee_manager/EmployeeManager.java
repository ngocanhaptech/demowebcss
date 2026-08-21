package com.example.restservice;

import org.springframework.stereotype.Repository;

@Repository
public class EmployeeManager {
    private static Employees list = new Employees();

    static {
        // Dữ liệu mẫu ban đầu
        list.getEmployeeList().add(new Employee("EMP001", "Alex", "Nguyen", "alex.nguyen@hpe.com", "Software Engineer"));
        list.getEmployeeList().add(new Employee("EMP002", "Stella", "Yun", "stella.yun@hpe.com", "Engineering Director"));
        list.getEmployeeList().add(new Employee("EMP003", "John", "Doe", "john.doe@hpe.com", "System Architect"));
    }

    public Employees getAllEmployees() {
        return list;
    }

    // Phương thức thêm nhân viên mới vào danh sách
    public void addEmployee(Employee employee) {
        list.getEmployeeList().add(employee);
    }
}