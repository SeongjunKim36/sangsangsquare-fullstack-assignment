import { AxiosError } from "axios";
import { BaseApiClient } from "./base";
import { CurrentUser, LoginForm, LoginResponse, LogoutResponse } from "../types";

class AuthApiClient extends BaseApiClient {
  async login(body: LoginForm): Promise<LoginResponse> {
    const response = await this.api.post("/auth/login", body);
    return response.data;
  }

  async logout(): Promise<LogoutResponse> {
    const response = await this.api.post("/auth/logout");
    return response.data;
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      const response = await this.api.get("/auth/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  }
}

export const authApiClient = new AuthApiClient();
