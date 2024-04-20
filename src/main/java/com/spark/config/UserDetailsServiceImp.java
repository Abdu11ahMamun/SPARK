package com.spark.config;

import com.spark.dto.UserRepository;
import com.spark.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

//@Component
//public class UserDetailsServiceImp implements UserDetailsService {
//    @Autowired
//    private UserRepository userRepository;
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        //Fetching user from database
//        User user=userRepository.getUserByUsername(username);
//
//        if(user==null){
//            throw new UsernameNotFoundException("Could not found user");
//        }
//        CustomUserDetails customUserDetails= new CustomUserDetails(user);
//
//        return customUserDetails;
//    }
//}
@Component
public class UserDetailsServiceImp {
    @Autowired
    private UserRepository userRepository;

    public User getUserByUsername(String username) {
        // Fetching user from database
        User user = userRepository.getUserByUsername(username);

        if (user == null) {
            throw new RuntimeException("Could not found user");
        }

        return user;
    }
}