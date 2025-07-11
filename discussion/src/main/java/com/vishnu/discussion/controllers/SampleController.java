package com.vishnu.discussion.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;

// Registration/Login Use Flow:
// 1. POST /auth/register {email, password, userName, profileName} via API Gateway
// 2. POST /auth/login {email, password} via API Gateway
// 3. Use returned user info/JWT for further requests
//
// Example curl:
// curl -X POST http://localhost:8080/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"pass123","userName":"testuser","profileName":"Test User"}'
// curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"pass123"}'
@RestController
public class SampleController {
    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        // connectToDb();
        System.out.println("Hello........");
        return String.format("Hello %s!", name);
    }

    public void connectToDb() {
        try {
            Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root",
                    "MySQL@123");

            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM POSTS");

            while (resultSet.next()) {
                System.out.println("HELLO HERE >>>>>>>>>>>>>>>>>>>>>>>>>>");
                System.out.println(resultSet.getString("id"));
                System.out.println(resultSet.getString("content"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
