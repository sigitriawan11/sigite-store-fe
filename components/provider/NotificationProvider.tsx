"use client";

import React, { createContext, useContext } from "react";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

const NotificationContext = createContext<NotificationInstance | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification({
    placement: 'top',
    duration: 3,
  });

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
