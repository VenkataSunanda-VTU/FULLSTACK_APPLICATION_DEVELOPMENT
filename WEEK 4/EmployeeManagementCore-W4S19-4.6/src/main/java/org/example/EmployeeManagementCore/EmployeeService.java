package org.example.EmployeeManagementCore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EmployeeService {

    @Autowired
    private EmployeeRepository repository;

    public void addEmployee(int id, String name) {
        repository.addEmployee(new Employee(id, name));
    }

    public void displayEmployees() {
        repository.getAllEmployees()
                  .forEach(System.out::println);
    }
}
