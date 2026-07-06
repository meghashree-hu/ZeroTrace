import api from "./api";

import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth.types";

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);

  return response.data;
};