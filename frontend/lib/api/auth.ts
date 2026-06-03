import { apiClient } from "@/lib/api/client";
import type { AuthResponse, CurrentUserResponse, LoginInput, RegisterInput } from "@/types";

export const authApi = {
  register: (input: RegisterInput) => apiClient.post<AuthResponse>("/api/auth/register", input),
  login: (input: LoginInput) => apiClient.post<AuthResponse>("/api/auth/login", input),
  logout: () => apiClient.post<{ status: "success"; message: string }>("/api/auth/logout"),
  me: () => apiClient.get<CurrentUserResponse>("/api/auth/me")
};
