package org.example.EmployeeManagementCore;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class EmployeeManagementApplication {

    public static void main(String[] args) {

        AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class);

        BeanFactory factory = context;

        EmployeeService service =
                factory.getBean(EmployeeService.class);

        service.addEmployee(1, "Sunanda");
        service.addEmployee(2, "Rahul");

        service.displayEmployees();

        context.close();
    }
}