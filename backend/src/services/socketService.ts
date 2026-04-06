let socketManagerInstance: any = null;

export const setSocketManager = (manager: any) => {
  socketManagerInstance = manager;
};

export const getSocketManager = () => {
  return socketManagerInstance;
};

export const emitMessageToAppointment = (appointmentId: string, data: any) => {
  if (socketManagerInstance) {
    socketManagerInstance.sendMessageToAppointment(appointmentId, data);
  }
};

export const emitNotificationToUser = (userId: string, data: any) => {
  if (socketManagerInstance) {
    socketManagerInstance.sendNotificationToUser(userId, data);
  }
};
