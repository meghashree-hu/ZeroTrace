import api from "./api";

export const generateShareLink = async (payload: any) => {
  return await api.post("/share/generate", payload);
};

export const fetchShareDetails = async (shareToken: string) => {
  return await api.get(`/share/${shareToken}`);
};

export const requestAccess = async (
  shareToken: string,
  deviceFingerprint?: string,
  deviceInfo?: any
) => {
  return await api.post(`/session/request`, { shareToken, deviceFingerprint, deviceInfo });
};

export const getSessionStatus = async (
  shareToken: string,
  sessionId?: string,
  deviceFingerprint?: string
) => {
  return await api.get(`/session/status/${shareToken}`, {
    params: { sessionId },
    headers: {
      ...(deviceFingerprint ? { "X-Device-Fingerprint": deviceFingerprint } : {}),
    },
  });
};

export const securePrint = async (shareToken: string, deviceFingerprint?: string, sessionId?: string) => {
  return await api.get(`/share/${shareToken}/view`, {
    responseType: "blob",
    headers: {
      ...(deviceFingerprint ? { "X-Device-Fingerprint": deviceFingerprint } : {}),
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    },
  });
};

export const getShareHistory = async () => {
  return await api.get("/share/history");
};

export const revokeShare = async (shareId: string) => {
  return await api.post(`/share/${shareId}/revoke`);
};

export const extendShareExpiry = async (shareId: string, expiryMinutes: number) => {
  return await api.post(`/share/${shareId}/extend`, { expiryMinutes });
};
