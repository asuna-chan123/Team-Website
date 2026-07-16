import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý logic đăng nhập ở đây
    console.log({ email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1e1e24] p-4">
      {/* Khung giao diện chính mô phỏng thiết kế */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 flex flex-col items-center font-sans shadow-xl">

        {/* Avatar Icon */}
        <div className="mb-10 mt-4">
          <svg width="70" height="70" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="20" r="10" stroke="black" strokeWidth="2.5" />
            <path d="M12 50C12 40.0589 20.0589 32 30 32H34C43.9411 32 52 40.0589 52 50" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Form Đăng Nhập */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

          {/* Input Email/SĐT */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Email hoặc số điện thoại:"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              required
            />
          </div>

          {/* Input Mật khẩu */}
          <div className="w-full relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu:"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] pr-12 focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              required
            />
            {/* Nút Ẩn/Hiện Mật Khẩu */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
            >
              {showPassword ? (
                // Icon Mắt Mở
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              ) : (
                // Icon Mắt Gạch Chéo (Giống trong ảnh thiết kế)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>

          {/* Quên mật khẩu */}
          <div className="w-full text-right -mt-2">
            <a href="#forgot" className="text-sm text-gray-700 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút Đăng Nhập */}
          <div className="w-full flex justify-center mt-4">
            <button
              type="submit"
              className="w-[65%] bg-[#333333] hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl text-xl transition-all tracking-wide"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        {/* Đường phân cách */}
        <div className="w-full flex items-center my-8">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-600 whitespace-nowrap">Hoặc đăng nhập bằng</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Các nút mạng xã hội */}
        <div className="flex justify-center gap-6 w-full mb-8">
          {/* Nút Google */}
          <button className="w-16 h-14 border border-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#000000" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.114 15.433 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24Z" />
            </svg>
          </button>

          {/* Nút Facebook */}
          <button className="w-16 h-14 border border-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#000000" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
            </svg>
          </button>

          {/* Nút X (Twitter cũ) */}
          <button className="w-16 h-14 border border-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>

        {/* Footer chuyển tab Đăng ký */}
        <div className="text-sm text-center text-gray-800">
          Chưa có tài khoản?{' '}
          <a href="#register" className="font-bold hover:underline">
            Đăng ký ngay!
          </a>
        </div>

      </div>
    </div>
  );
}
