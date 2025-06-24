import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };

  return (
    <div>
      {/* 更新导航链接 */}
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/dashboard" style={{ marginRight: '10px' }}>仪表板</Link>
        <Link to="/admin" style={{ marginRight: '10px' }}>管理员</Link>
        <button onClick={handleLogout} style={{ float: 'right' }}>退出登录</button>
      </nav>
      
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;