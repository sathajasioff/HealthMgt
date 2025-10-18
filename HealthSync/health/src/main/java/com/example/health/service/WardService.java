package com.example.health.service;

import java.util.List;
import com.example.health.model.Ward;

public interface WardService {
  Ward save(Ward w);
  Ward update(String id, Ward w);
  void delete(String id);
  Ward findById(String id);
  List<Ward> findAll();
}
