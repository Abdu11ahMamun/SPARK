package com.mislbd.spark.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateMembershipException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateMembership(DuplicateMembershipException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("error", "Duplicate Membership");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(MembershipNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleMembershipNotFound(MembershipNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("error", "Membership Not Found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex){
        Map<String,Object> body = base(HttpStatus.BAD_REQUEST, "Validation failed");
        body.put("errors", ex.getBindingResult().getFieldErrors().stream().map(f->f.getField()+": "+f.getDefaultMessage()).toList());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String,Object>> handleData(DataAccessException ex){
        log.error("Data access error", ex);
        Map<String,Object> body = base(HttpStatus.INTERNAL_SERVER_ERROR, "Database error");
        body.put("detail", root(ex));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String,Object>> handleGeneric(RuntimeException ex){
        log.error("Unhandled runtime exception", ex);
        Map<String,Object> body = base(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()!=null?ex.getMessage():"Internal Server Error");
        body.put("detail", root(ex));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private Map<String,Object> base(HttpStatus status, String message){
        Map<String,Object> m = new HashMap<>();
        m.put("status", status.value());
        m.put("error", status.getReasonPhrase());
        m.put("message", message);
        return m;
    }

    private String root(Throwable t){
        Throwable r=t; while(r.getCause()!=null) r=r.getCause(); return r.getMessage();
    }
}
