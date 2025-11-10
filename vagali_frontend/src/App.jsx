import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom"; 

// 🎯 CORREÇÃO CRÍTICA: Importa os estilos principais do Bootstrap PRIMEIRO.
import 'bootstrap/dist/css/bootstrap.min.css';

// IMPORTAÇÕES DA FASE 1:
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import ProfileUser from './components/ProfileUser';
import MainFeed from './components/MainFeed';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import ForgotPassword from './components/ForgotPassword';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ProfessionalSearch from './components/ProfessionalSearch';
import ProfessionalProfileView from './components/ProfessionalProfileView';
import ProfessionalSchedule from './components/ProfessionalSchedule'; 

// 🎯 Seu estilo customizado (vem DEPOIS do Bootstrap para sobrescrever)
import "./App.css";

function App() {
  return (
    <BrowserRouter> 
      <Layout>
        <Routes>
          
          {/* ROTA RAIZ: Busca de profissionais */}
          <Route path="/" element={<ProfessionalSearch />} />

            {/* ROTA DEDICADA AO PERFIL DO PROFISSIONAL */}
            <Route path="/professional/:id" element={<ProfessionalProfileView />} />
          
          {/* ROTAS DE AUTENTICAÇÃO E CONTA */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
            {/* ROTAS DO PAINEL DO USUÁRIO LOGADO */}
            <Route path="/me" element={<ProfileUser />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />


            {/* Rota da Agenda (com o componente atualizado) */}
            <Route path="/professional/:id/schedule" element={<ProfessionalSchedule />} />
            
            {/* ROTA MAIN FEED */}
            <Route path="/feed" element={<MainFeed />} />
          
          {/* Rota 404/Not Found */}
          <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: '100px', color: 'white'}}>404 - Página Não Encontrada</h1>} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;