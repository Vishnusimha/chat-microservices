package com.vishnu.discussion.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;

@RestController
public class SampleController {
    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
//        connectToDb();
        System.out.println("Hello........");
        return String.format("Hello %s!", name);
    }

    public void connectToDb() {
        try {
            Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root", "MySQL@123");

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
