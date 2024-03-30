package com.spark.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class MyConfig {
    @Bean
    public UserDetailsService getUserDetailsService() {
        return new UserDetailsServiceImp();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider= new DaoAuthenticationProvider();

        daoAuthenticationProvider.setUserDetailsService(this.getUserDetailsService());
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/css/*").permitAll()
                        .requestMatchers("/img/*").permitAll()
                        .requestMatchers("/js/*").permitAll()
                        .requestMatchers("/continue/*").permitAll()
                        .requestMatchers("/vendor/*").permitAll()
                        .requestMatchers("/testing").hasAnyRole("DEVELOPER")
                              //  .requestMatchers("/").hasAnyRole("DEVELOPER")
                                .anyRequest().authenticated()
                       // .requestMatchers("/**").permitAll()
                ).formLogin(form -> form
                .defaultSuccessUrl("/user/index")
                .permitAll())
                .logout(logout -> logout
                        .logoutSuccessUrl("/"))
                .build();
    }

    }
