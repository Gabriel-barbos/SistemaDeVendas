// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // Se não houver usuário logado, redireciona para a tela de login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Se o papel do usuário não estiver entre os permitidos, redireciona para a página de acesso negado
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
