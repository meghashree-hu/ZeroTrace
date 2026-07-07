import api from "./api";

export const getAuditLogs = async () => {
  return await api.get(`/audit/logs`);
};

export default { getAuditLogs };
