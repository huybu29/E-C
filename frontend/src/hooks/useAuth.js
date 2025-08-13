import { useState, useEffect, useCallback } from "react";
import { getAccessToken, decodeToken, setTokens, clearTokens } from "../services/token";
import { loginRequest } from "../features/auth/authAPI";

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Init: kiểm tra token có sẵn
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        setUser(payload);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    // Gọi login endpoint, lưu token nếu thành công, set user
    const data = await loginRequest(username, password);
    if (data?.access) {
      setTokens(data.access, data.refresh);
      const payload = decodeToken(data.access);
      setUser(payload);
      setIsLoggedIn(true);
      return { ok: true };
    }
    return { ok: false };
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return { isLoggedIn, user, loading, login, logout };
}