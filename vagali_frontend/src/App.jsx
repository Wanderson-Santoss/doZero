// 📌 React & Router
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

// 📌 Estilos globais
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


// 📌 Layout principal (Header + Container + Footer)
import Layout from "./components/Layout";

// 📌 Auth Context (mantém login, token, user)
import { AuthProvider } from "./components/AuthContext";

// ==========================
//   PÁGINAS PRINCIPAIS
// ==========================
import Home from "./pages/Home"; // ⭐ Nova tela inicial moderna
import ProfessionalSearch from "./components/ProfessionalSearch";
import ProfessionalProfileView from "./components/ProfessionalProfileView";
import ProfessionalSchedule from "./components/ProfessionalSchedule";

// ==========================
//   AUTENTICAÇÃO
// ==========================
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import PasswordResetConfirm from "./components/PasswordResetConfirm";
import ChangePassword from "./components/ChangePassword";

// ==========================
//   ÁREA DO USUÁRIO LOGADO
// ==========================
import ProfileManagement from "./components/ProfileManagement";
import CreateDemand from "./components/CreateDemand";
import MainFeed from "./components/MainFeed";

// ==========================
//   CHAT
// ==========================
import ChatList from "./components/ChatList";
import ChatWrapper from "./components/ChatWrapper";


// ====================================================================
//                           A P P   C O N F I G
// ====================================================================

function App() {
    return (
        <BrowserRouter>
            {/* 🔑 O AuthProvider envolve toda a aplicação */}
            <AuthProvider>

                {/* 🧩 Layout contém o Header e a estrutura geral */}
                <Layout>

                    <Routes>

                        {/* =====================================================
                            🏠 TELA INICIAL
                        ====================================================== */}
                        <Route path="/" element={<Home />} />


                        {/* =====================================================
                            🔍 BUSCA DE PROFISSIONAIS
                        ====================================================== */}
                        <Route path="/buscar" element={<ProfessionalSearch />} />
                        <Route path="/perfil/:id" element={<ProfessionalProfileView />} />
                        <Route path="/professional/:id" element={<ProfessionalProfileView />} />
                        <Route path="/professional/:id/schedule" element={<ProfessionalSchedule />} />


                        {/* =====================================================
                            🔐 AUTENTICAÇÃO
                        ====================================================== */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
                        <Route path="/change-password" element={<ChangePassword />} />


                        {/* =====================================================
                            👤 ÁREA DO USUÁRIO LOGADO
                        ====================================================== */}
                        <Route path="/meu-perfil" element={<ProfileManagement />} />
                        <Route path="/criar-demanda" element={<CreateDemand />} />
                        <Route path="/editar-demanda/:id" element={<CreateDemand isEditing={true} />} />
                        <Route path="/feed" element={<MainFeed />} />


                        {/* =====================================================
                            💬 CHAT
                        ====================================================== */}
                        <Route path="/chats" element={<ChatList />} />
                        <Route path="/chat" element={<ChatWrapper />} />
                        <Route path="/chat/:id" element={<ChatWrapper />} />


                        {/* =====================================================
                            ❌ 404 - Página não encontrada
                        ====================================================== */}
                        <Route 
                            path="*" 
                            element={
                                <h1 
                                    style={{
                                        textAlign: "center",
                                        marginTop: "100px",
                                        color: "#1b1e28"
                                    }}
                                >
                                    404 - Página Não Encontrada
                                </h1>
                            } 
                        />

                    </Routes>

                </Layout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
