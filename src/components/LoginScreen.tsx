import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLogin, useRegister } from '../api/generated/auth-controller-impl/auth-controller-impl';
import { AuthResponse } from '../api/generated/eRPExperimentAPI.schemas';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Registration states
  const [regFullName, setRegFullName] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Inline field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Countdown timer for redirect after registration success
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Real-time field validation
  const validateField = useCallback((field: string, value: string) => {
    const errors = { ...fieldErrors };
    switch (field) {
      case 'regFullName':
        if (value.length > 0 && value.trim().length < 2) errors.regFullName = 'Họ tên phải có ít nhất 2 ký tự.';
        else delete errors.regFullName;
        break;
      case 'regName':
        if (value.length > 0 && value.length < 3) errors.regName = 'Tên người dùng phải có ít nhất 3 ký tự.';
        else if (value.length > 50) errors.regName = 'Tên người dùng tối đa 50 ký tự.';
        else delete errors.regName;
        break;
      case 'regEmail':
        if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.regEmail = 'Email không hợp lệ.';
        else delete errors.regEmail;
        break;
      case 'regPassword':
        if (value.length > 0 && value.length < 6) errors.regPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
        else delete errors.regPassword;
        // Also re-validate confirm password
        if (regConfirmPassword.length > 0 && value !== regConfirmPassword) errors.regConfirmPassword = 'Mật khẩu xác nhận không khớp.';
        else if (regConfirmPassword.length > 0) delete errors.regConfirmPassword;
        break;
      case 'regConfirmPassword':
        if (value.length > 0 && value !== regPassword) errors.regConfirmPassword = 'Mật khẩu xác nhận không khớp.';
        else delete errors.regConfirmPassword;
        break;
    }
    setFieldErrors(errors);
  }, [fieldErrors, regPassword, regConfirmPassword]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (countdown === 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setActiveTab('login');
      setRegSuccess(null);
      setCountdown(null);
    }
  }, [countdown]);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (response) => {
        const res = response as any;
        const statusCode = res?.status?.code;
        const authData = res?.data as AuthResponse;
        const message = res?.data?.message || res?.status?.message;

        // Backend returns HTTP 200 but inner status code may differ
        if (statusCode && statusCode !== 200) {
          setError(message || `Lỗi xác thực (mã: ${statusCode}). Vui lòng thử lại.`);
          return;
        }

        if (authData?.accessToken) {
          localStorage.setItem('access_token', authData.accessToken);
          localStorage.setItem('nexus_user_info', JSON.stringify(authData));
          onLogin();
        } else {
          setError(message || 'Không nhận được mã xác thực từ máy chủ.');
        }
      },
      onError: (err: any) => {
        const res = err.response?.data;
        const message = res?.data?.message || res?.status?.message;
        setError(message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (response) => {
        const data = (response as any).data;
        setRegSuccess(data?.message || 'Đăng ký thành công! Vui lòng kiểm tra email.');
        setRegError(null);
        setFieldErrors({});
        // Reset form
        setRegFullName('');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        // Start countdown (7 seconds)
        startCountdown(7);
      },
      onError: (err: any) => {
        setRegError(err.response?.data?.status?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setRegSuccess(null);
      }
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    // Full validation before submit
    const errors: Record<string, string> = {};
    if (!regFullName.trim()) errors.regFullName = 'Vui lòng nhập họ và tên.';
    if (regName.length < 3) errors.regName = 'Tên người dùng phải có ít nhất 3 ký tự.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errors.regEmail = 'Email không hợp lệ.';
    if (regPassword.length < 6) errors.regPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (regPassword !== regConfirmPassword) errors.regConfirmPassword = 'Mật khẩu xác nhận không khớp.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setRegError('Vui lòng kiểm tra lại các trường bên dưới.');
      return;
    }

    registerMutation.mutate({
      data: {
        fullName: regFullName,
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({
      data: {
        usernameOrEmail: username,
        password: password,
        deviceInfo: {
          deviceType: 'WEB',
          browserName: navigator.userAgent.match(/(?:chrome|firefox|safari|edge|opera|msie|trident)[\/\s][\d.]+/i)?.[0]?.split(/[\/\s]/)[0] || 'Unknown',
          browserVersion: navigator.userAgent.match(/(?:chrome|firefox|safari|edge|opera|msie|trident)[\/\s]([\d.]+)/i)?.[1] || 'Unknown',
          osName: navigator.platform || 'Unknown',
          osVersion: navigator.userAgent.match(/(?:Windows NT|Mac OS X|Linux)\s*([\d._]+)/)?.[1] || 'Unknown',
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          userAgent: navigator.userAgent,
          language: navigator.language,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceId: crypto.randomUUID(),
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark tech-grid transition-all duration-500 overflow-hidden relative">
      {/* Các khối phát sáng nền */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-5xl h-[85vh] lg:h-[750px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl rounded-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-800 relative z-10">

        {/* Phía trái: Giao diện Chiến thuật (Cố định) */}
        <div className="hidden md:flex md:w-5/12 bg-gray-900 relative flex-col justify-between p-10 text-white overflow-hidden border-r border-gray-800">
          <div className="scanner-line"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <span className="material-icons-round text-primary text-4xl">hub</span>
              <h1 className="text-2xl font-bold tracking-tighter">NEXUS<span className="font-thin text-gray-500 ml-1">CORE</span></h1>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-primary backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                    {activeTab === 'login' ? 'Giao thức Đăng nhập' : 'Giao thức Đăng ký'}
                  </span>
                  <span className="text-[10px] text-primary font-bold animate-pulse">CHỜ XÁC THỰC</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                  {activeTab === 'login'
                    ? 'Vui lòng cung cấp ID truy cập và khóa bảo mật để đồng bộ hóa quyền điều hành khu vực.'
                    : 'Thiết lập hồ sơ nhân sự mới trong hệ thống quản lý chuỗi cung ứng lượng tử Nexus.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-secondary backdrop-blur-md opacity-60 scale-95 origin-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Trạng thái Node</span>
                  <span className="text-[10px] text-secondary font-mono">BÌNH THƯỜNG</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full">
                  <div className="bg-secondary h-full rounded-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 font-mono text-[10px] text-gray-500 flex justify-between uppercase">
            <span>Phiên bản: 4.2.0-STABLE</span>
            <span>Vị trí: ASIA_PACIFIC</span>
          </div>

          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gray-600 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-dashed border-primary rounded-full animate-spin-slow"></div>
          </div>
        </div>

        {/* Phía phải: Form nội dung thay đổi tùy theo tab */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center dark:bg-surface-dark overflow-y-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit mx-auto mb-8 shadow-inner shrink-0 gap-1.5">
            <button
              className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'login' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md border-2 border-primary/20' : 'text-gray-500'}`}
              onClick={() => setActiveTab('login')}
            >
              ĐĂNG NHẬP
            </button>
            <button
              className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'register' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md border-2 border-primary/20' : 'text-gray-500'}`}
              onClick={() => setActiveTab('register')}
            >
              ĐĂNG KÝ
            </button>
          </div>

          <div className="max-w-md mx-auto w-full transition-all duration-300">
            {activeTab === 'login' ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Xác thực Quyền hạn</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Quét mã định danh để kích hoạt bàn điều khiển.</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-shake">
                      {error}
                    </div>
                  )}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">ID Truy cập</label>
                    <div className="relative">
                      <input
                        className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
                        placeholder="nexus_user_882"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      <span className="material-icons-round absolute left-4 top-4 text-gray-400 text-xl group-focus-within:text-primary">badge</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">Khóa bảo mật</label>
                    <div className="relative">
                      <input
                        className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-12 pr-12 py-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span className="material-icons-round absolute left-4 top-4 text-gray-400 text-xl group-focus-within:text-primary">fingerprint</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none border-none bg-transparent p-0 cursor-pointer"
                      >
                        <span className="material-icons-round text-xl">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-primary hover:bg-[#8FD325] text-black font-bold py-4 rounded-xl shadow-neon transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{loginMutation.isPending ? 'ĐANG XỬ LÝ...' : 'KÍCH HOẠT HỆ THỐNG'}</span>
                    {loginMutation.isPending ? (
                      <span className="material-icons-round animate-spin">sync</span>
                    ) : (
                      <span className="material-icons-round">vpn_key</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Tạo Hồ sơ Mới</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Thiết lập thông tin nhân sự và cấp độ bảo mật.</p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                  {regError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-shake">
                      {regError}
                    </div>
                  )}
                  {regSuccess && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
                      {regSuccess}
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Họ và Tên</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl border-none ring-1 ${fieldErrors.regFullName ? 'ring-red-500' : 'ring-gray-200 dark:ring-gray-800'} focus:ring-2 focus:ring-primary transition-all text-sm`}
                        placeholder="Nguyễn Văn A"
                        type="text"
                        value={regFullName}
                        onChange={(e) => { setRegFullName(e.target.value); validateField('regFullName', e.target.value); }}
                        required
                      />
                      <span className="material-icons-round absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-primary">person</span>
                    </div>
                    {fieldErrors.regFullName && <p className="text-red-500 text-[10px] mt-1 font-mono">{fieldErrors.regFullName}</p>}
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Tên người dùng</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl border-none ring-1 ${fieldErrors.regName ? 'ring-red-500' : 'ring-gray-200 dark:ring-gray-800'} focus:ring-2 focus:ring-primary transition-all font-mono text-sm`}
                        placeholder="nexus_user"
                        type="text"
                        value={regName}
                        onChange={(e) => { setRegName(e.target.value); validateField('regName', e.target.value); }}
                        required
                        minLength={3}
                        maxLength={50}
                      />
                      <span className="material-icons-round absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-primary">badge</span>
                    </div>
                    {fieldErrors.regName && <p className="text-red-500 text-[10px] mt-1 font-mono">{fieldErrors.regName}</p>}
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Email Hệ thống</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl border-none ring-1 ${fieldErrors.regEmail ? 'ring-red-500' : 'ring-gray-200 dark:ring-gray-800'} focus:ring-2 focus:ring-primary transition-all text-sm`}
                        placeholder="name@nexus.com"
                        type="email"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); validateField('regEmail', e.target.value); }}
                        required
                      />
                      <span className="material-icons-round absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-primary">alternate_email</span>
                    </div>
                    {fieldErrors.regEmail && <p className="text-red-500 text-[10px] mt-1 font-mono">{fieldErrors.regEmail}</p>}
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Mật khẩu</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-11 pr-12 py-3.5 rounded-xl border-none ring-1 ${fieldErrors.regPassword ? 'ring-red-500' : 'ring-gray-200 dark:ring-gray-800'} focus:ring-2 focus:ring-primary transition-all font-mono text-sm`}
                        placeholder="••••••••"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); validateField('regPassword', e.target.value); }}
                        required
                        minLength={6}
                      />
                      <span className="material-icons-round absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-primary">lock</span>
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none border-none bg-transparent p-0 cursor-pointer"
                      >
                        <span className="material-icons-round text-lg">
                          {showRegPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.regPassword && <p className="text-red-500 text-[10px] mt-1 font-mono">{fieldErrors.regPassword}</p>}
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white pl-11 pr-12 py-3.5 rounded-xl border-none ring-1 ${fieldErrors.regConfirmPassword ? 'ring-red-500' : 'ring-gray-200 dark:ring-gray-800'} focus:ring-2 focus:ring-primary transition-all font-mono text-sm`}
                        placeholder="••••••••"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => { setRegConfirmPassword(e.target.value); validateField('regConfirmPassword', e.target.value); }}
                        required
                        minLength={6}
                      />
                      <span className="material-icons-round absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-primary">fingerprint</span>
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none border-none bg-transparent p-0 cursor-pointer"
                      >
                        <span className="material-icons-round text-lg">
                          {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.regConfirmPassword && <p className="text-red-500 text-[10px] mt-1 font-mono">{fieldErrors.regConfirmPassword}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full bg-primary hover:bg-[#8FD325] text-black font-bold py-4 rounded-xl shadow-neon transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{registerMutation.isPending ? 'ĐANG XỬ LÝ...' : 'Khởi tạo tài khoản'}</span>
                    {registerMutation.isPending ? (
                      <span className="material-icons-round text-sm animate-spin">sync</span>
                    ) : (
                      <span className="material-icons-round text-sm">person_add</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 hidden md:flex items-center gap-2 bg-surface-dark/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-lg text-[10px] font-mono text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        GIAO THỨC NEXUS-V4 HOẠT ĐỘNG
      </div>

      {/* Countdown popup */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-gray-900/95 backdrop-blur-xl border border-primary/30 rounded-2xl px-5 py-4 shadow-2xl shadow-primary/10">
            <div className="relative">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#374151" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#A3E635"
                  strokeWidth="2"
                  strokeDasharray={`${(countdown / 7) * 94.2} 94.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-primary font-bold text-sm font-mono">{countdown}</span>
            </div>
            <div>
              <p className="text-white text-xs font-bold">Đăng ký thành công!</p>
              <p className="text-gray-400 text-[10px] font-mono">Chuyển sang Đăng nhập sau {countdown}s</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (countdownRef.current) clearInterval(countdownRef.current);
                setCountdown(null);
                setActiveTab('login');
                setRegSuccess(null);
              }}
              className="ml-2 text-gray-500 hover:text-primary transition-colors border-none bg-transparent p-0 cursor-pointer focus:outline-none"
            >
              <span className="material-icons-round text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
