import loginGIF from "../../assets/loginGIF.gif";
import "./login.css";
import { UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // credenciais locais
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin', username }));
      navigate('/admin/relatorios'); // redireciona para a rota do administrador
    } else if (username === 'operador' && password === '1234') {
      localStorage.setItem('user', JSON.stringify({ role: 'operador', username }));
      navigate('/caixa'); // redireciona para a rota do operador
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-left">
          <h1>Faça login <br /> e acesse seu sistema</h1>
          <img src={loginGIF} alt="Login" />
        </div>

        <div className="login-right">
          <div className="login-form">
            <h1>Login</h1>
            <p> admin / 1234 para adm e operador / 1234 para user</p>
            <form onSubmit={handleSubmit}>
              <Input
                prefix={<UserOutlined />}
                className="input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input.Password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit">Entrar</button>
              {error && <p>{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
