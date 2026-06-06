import React from 'react';
// 1. Nhập component LoginForm từ file SignIn.jsx bạn vừa tạo
import LoginForm from './component/SignIn'; 

function App() {
  return (
    <>
      {/* 2. Gọi component để giao diện đăng nhập hiển thị lên màn hình */}
      <LoginForm />
    </>
  );
}

export default App;
