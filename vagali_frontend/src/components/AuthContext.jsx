// src/components/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

// ➜ Endpoints do backend (EXATAMENTE como estão no urls.py)
const LOGIN_URL = "/api/v1/auth/login/";              // CustomAuthToken
const PROFILE_ME_URL = "/api/v1/accounts/perfil/me/"; // FullProfileSerializer

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --------------------------------------------------
  // 1) RESTAURA SESSÃO AO RECARREGAR A PÁGINA
  // --------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setAuthLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Token ${token}`;

    axios
      .get(PROFILE_ME_URL)
      .then((resp) => {
        const data = resp.data;
        const role = data.is_professional ? "Profissional" : "Cliente";

        const userData = {
          id: data.id,
          role,
          email: data.email,
          fullName: data.profile?.full_name || data.email,
        };

        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", data.email);

        setUser(userData);
      })
      .catch((err) => {
        console.error("Erro ao restaurar sessão:", err.response || err);
        clearSession();
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------
  const clearSession = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // --------------------------------------------------
  // 2) LOGIN REAL (usa email + password)
  // --------------------------------------------------
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      // ⚠️ BATE COM CustomAuthTokenSerializer (email + password)
      const resp = await axios.post(LOGIN_URL, {
        email,
        password,
      });

      // ObtainAuthToken padrão retorna {"token": "..."}
      const token =
        resp.data.token || resp.data.auth_token || resp.data.key || null;

      if (!token) {
        console.error("Resposta do login:", resp.data);
        throw new Error("Token de autenticação não retornado pela API.");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", email);

      axios.defaults.headers.common["Authorization"] = `Token ${token}`;

      // Agora buscamos os dados completos do usuário logado
      const profileResp = await axios.get(PROFILE_ME_URL);
      const data = profileResp.data;

      const role = data.is_professional ? "Profissional" : "Cliente";

      const userData = {
        id: data.id,
        role,
        email: data.email,
        fullName: data.profile?.full_name || data.email,
      };

      localStorage.setItem("userRole", role);
      setUser(userData);

      return true;
    } catch (err) {
      console.error("Erro no login:", err.response || err);
      // Deixar o componente Login decidir qual mensagem mostrar
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // --------------------------------------------------
  // 3) LOGOUT
  // --------------------------------------------------
  const logout = () => {
    clearSession();
    navigate("/login");
  };

  // --------------------------------------------------
  // 4) ALTERAR PAPEL (simulação no front)
  // --------------------------------------------------
  const setUserRole = (newRole) => {
    if (!user) return;
    setUser((prev) => ({
      ...prev,
      role: newRole,
    }));
    localStorage.setItem("userRole", newRole);
  };

  // --------------------------------------------------
  // VALOR EXPOSTO NO CONTEXTO
  // --------------------------------------------------
  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      userId: user?.id,
      userRole: user?.role,
      isUserProfessional: user?.role === "Profissional",
      authLoading,
      login,
      logout,
      setUserRole,
    }),
    [user, authLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
