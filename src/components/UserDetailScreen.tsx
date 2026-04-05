import React, { useEffect, useState } from 'react';
import { AuthResponse } from '../api/generated/eRPExperimentAPI.schemas';

const UserDetailScreen: React.FC = () => {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user_info');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Lỗi load user info', e);
      }
    }
  }, []);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-gray-500">
            <span className="material-icons-round text-6xl mb-4 animate-pulse">account_circle</span>
            <p className="font-mono text-xs uppercase tracking-widest">Đang xác thực danh tính...</p>
        </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
               <span>Trung tâm Điều phối</span>
               <span className="material-icons-round text-xs">chevron_right</span>
               <span>Quản trị viên</span>
               <span className="material-icons-round text-xs">chevron_right</span>
               <span className="text-primary">Hồ sơ người dùng</span>
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter dark:text-white">Cài đặt Tài khoản</h1>
         </div>
         <div className="px-5 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow"></span>
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Đã đồng bộ</span>
         </div>
      </header>

      {/* Profile Header Tactical Card */}
      <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-2xl p-10 rounded-4xl border border-gray-200 dark:border-white/5 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-6 opacity-20">
            <svg width="60" height="60" viewBox="0 0 100 100" className="fill-current text-primary">
              <path d="M90 0 L100 0 L100 10 L90 10 Z M100 90 L100 100 L90 100 L90 90 Z" />
            </svg>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative shrink-0">
               <div className="w-40 h-40 md:w-48 md:h-48 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-3 rounded-full border-2 border-primary overflow-hidden shadow-neon">
                    <img src={user.avatarUrl || 'https://i.pravatar.cc/300'} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-surface-dark border border-gray-600 rounded-full p-3 cursor-pointer hover:text-primary transition-all shadow-xl text-white" title="Đổi ảnh">
                    <span className="material-icons-round text-sm">camera_alt</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 text-center md:text-left">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <h2 className="text-4xl font-bold dark:text-white uppercase tracking-tighter">{user.username}</h2>
                  <div className="flex items-center justify-center md:justify-end gap-2 text-[10px] font-mono text-primary font-bold">
                     <span className="material-icons-round text-sm">lock</span>
                     MÃ HÓA TLS 1.3
                  </div>
               </div>
               <p className="text-gray-500 font-mono text-xs mb-8">SEC_ID: {user.userId} | LEVEL: {user.roles?.[0] || 'USER'}</p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Badge icon="admin_panel_settings" label={user.roles?.join(' • ') || 'AUTHENTICATED'} color="bg-gray-100 dark:bg-accent-dark" />
                  <Badge icon="hub" label="Vận hành HQ" color="bg-primary/10 text-primary border border-primary/20" />
               </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Identity Section */}
         <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl p-10 rounded-4xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <h3 className="text-xl font-bold mb-8 flex items-center uppercase tracking-tight">
               <span className="material-icons-round text-primary mr-3">person_outline</span>
               Danh tính Cá nhân
            </h3>
            
            <div className="space-y-8">
               <InputField label="Tên người dùng" value={user.username} icon="badge" />
               <InputField label="Email Bảo mật" value={user.email} icon="alternate_email" />
               <InputField label="Số điện thoại" value={user.phoneNumber || '+84 --- --- ---'} icon="call" />
               <InputField label="Đường dây Ưu tiên" value="+84 999 888 777" icon="call" />
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Lĩnh vực Phụ trách</label>
                  <div className="relative">
                    <select className="w-full bg-gray-100 dark:bg-accent-dark border-none rounded-xl py-4 pl-12 pr-4 text-sm font-mono dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all">
                      <option>Điều hành Chiến thuật</option>
                      <option>Logistics Lượng tử</option>
                      <option>Ma trận Bảo mật</option>
                    </select>
                    <span className="material-icons-round absolute left-4 top-4 text-gray-400 text-lg">business</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Security Protocol */}
         <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl p-10 rounded-4xl border border-gray-200 dark:border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
            <div>
               <h3 className="text-xl font-bold mb-8 flex items-center uppercase tracking-tight">
                  <span className="material-icons-round text-red-500 mr-3">gpp_good</span>
                  Ma trận Bảo mật
               </h3>

               <div className="bg-orange-500/5 border-l-4 border-orange-500 p-5 rounded-2xl flex gap-4 mb-10">
                  <span className="material-icons-round text-orange-500 mt-1">warning_amber</span>
                  <div>
                    <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Yêu cầu quyền truy cập cấp 2</h4>
                    <p className="text-xs text-orange-800/60 dark:text-orange-300/60 mt-1 leading-relaxed">
                      Khóa xác thực phải được thay đổi sau mỗi 30 chu kỳ. Sử dụng các ký hiệu và chuỗi ký tự kháng lượng tử.
                    </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Mật khẩu Hiện tại</label>
                    <input className="w-full bg-gray-100 dark:bg-accent-dark border-none rounded-xl px-5 py-4 font-mono text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" type="password" placeholder="••••••••••••" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Mật khẩu Mới</label>
                        <input className="w-full bg-gray-100 dark:bg-accent-dark border-none rounded-xl px-5 py-4 font-mono text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" type="password" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Xác nhận Mật khẩu</label>
                        <input className="w-full bg-gray-100 dark:bg-accent-dark border-none rounded-xl px-5 py-4 font-mono text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" type="password" />
                     </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 font-mono mb-2">
                      <span>ĐỘ MẠNH MẬT KHẨU</span>
                      <span className="text-primary">TỐI ƯU</span>
                    </div>
                    <div className="flex gap-1.5 h-1.5 w-full">
                       <div className="flex-1 bg-primary rounded-full shadow-glow"></div>
                       <div className="flex-1 bg-primary rounded-full shadow-glow"></div>
                       <div className="flex-1 bg-primary rounded-full shadow-glow"></div>
                       <div className="flex-1 bg-gray-200 dark:bg-white/5 rounded-full"></div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
               <span>LẦN THAY ĐỔI CUỐI: 30 NGÀY TRƯỚC</span>
               <button className="text-primary font-bold hover:underline uppercase tracking-widest">XEM NHẬT KÝ TRUY CẬP</button>
            </div>
         </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-gray-200 dark:border-white/5 pt-10">
         <button className="px-10 py-5 bg-transparent border-2 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 transition-all tactical-cut">
            HỦY THAY ĐỔI
         </button>
         <button className="group relative px-10 py-5 bg-primary text-black font-bold uppercase tracking-widest hover:shadow-neon transition-all tactical-cut overflow-hidden">
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="material-icons-round">save</span>
              XÁC NHẬN CẬP NHẬT
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
         </button>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, color }: any) => (
  <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${color}`}>
    <span className="material-icons-round text-sm">{icon}</span>
    {label}
  </div>
);

const InputField = ({ label, value, icon }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">{label}</label>
    <div className="relative">
      <input 
        className="w-full bg-gray-100 dark:bg-accent-dark border-none rounded-xl py-4 pl-12 pr-4 text-sm font-mono dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all" 
        defaultValue={value} 
      />
      <span className="material-icons-round absolute left-4 top-4 text-gray-400 text-lg group-focus-within:text-primary transition-colors">{icon}</span>
      <div className="absolute right-0 bottom-0 w-3 h-3 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  </div>
);

export default UserDetailScreen;
