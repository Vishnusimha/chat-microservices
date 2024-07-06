//package com.example.apigateway.config;
//
//import com.example.apigateway.data.UserDao;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.core.userdetails.UserDetailsService;
//
//@Configuration
//public class DI {
//    @Autowired
//    private UserDao userDao;
//    @Bean
//    public AuthenticationConfiguration authenticationConfiguration() {
//        return new AuthenticationConfiguration();
//    }
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
//        return configuration.getAuthenticationManager();
//    }
//
//    @Bean
//    public UserDetailsService userDetailsService() {
//        return email -> userDao.findUserByEmail(email);
//    }
//
//}
