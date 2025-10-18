package com.example.health.service;

import java.util.List;

import com.example.health.model.SupportServiceItem;

public interface SupportServiceService {
  SupportServiceItem save(SupportServiceItem s);
  SupportServiceItem update(String id, SupportServiceItem s);
  void delete(String id);
  SupportServiceItem findById(String id);
  List<SupportServiceItem> findAll();
}
