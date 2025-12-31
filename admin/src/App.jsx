import React, { useState, useEffect } from "react";
import {
  ScissorsIcon,
  SparklesIcon,
  StarIcon,
  HeartIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  HomeIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

const ICONS = [
  { name: "none", label: "Hiçbiri", icon: null },
  { name: "scissors", label: "Makas", icon: ScissorsIcon },
  { name: "sparkles", label: "Parıltı", icon: SparklesIcon },
  { name: "star", label: "Yıldız", icon: StarIcon },
  { name: "heart", label: "Kalp", icon: HeartIcon },
  { name: "user", label: "Kullanıcı", icon: UserIcon },
  { name: "calendar", label: "Takvim", icon: CalendarDaysIcon },
  { name: "phone", label: "Telefon", icon: PhoneIcon },
  { name: "check", label: "Onay", icon: CheckCircleIcon },
  { name: "clock", label: "Saat", icon: ClockIcon },
  { name: "map", label: "Harita", icon: MapPinIcon },
  { name: "mail", label: "Mail", icon: EnvelopeIcon },
  { name: "home", label: "Ev", icon: HomeIcon },
  { name: "group", label: "Grup", icon: UserGroupIcon },
  { name: "bars", label: "Menü", icon: Bars3Icon },
  { name: "close", label: "Kapat", icon: XMarkIcon },
  { name: "money", label: "Para", icon: CurrencyDollarIcon },
  { name: "edit", label: "Düzenle", icon: PencilIcon },
  { name: "delete", label: "Sil", icon: TrashIcon },
  { name: "plus", label: "Ekle", icon: PlusIcon },
  { name: "eye", label: "Göz", icon: EyeIcon },
  { name: "shield", label: "Güvenlik", icon: ShieldCheckIcon },
];

function Navbar({ page, setPage, totalAppointments }) {
  return (
    <nav className="w-full bg-barber-dark text-white px-6 py-4 flex items-center justify-between shadow">
      <div className="text-2xl font-bold text-barber-gold tracking-wide">Berber Admin</div>
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded font-semibold transition-all duration-200 ${
            page === "appointments"
              ? "bg-barber-gold text-barber-dark"
              : "hover:bg-barber-gold/10 hover:text-barber-gold"
          }`}
          onClick={() => setPage("appointments")}
        >
          Randevular {totalAppointments > 0 && `(${totalAppointments})`}
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold transition-all duration-200 ${
            page === "settings"
              ? "bg-barber-gold text-barber-dark"
              : "hover:bg-barber-gold/10 hover:text-barber-gold"
          }`}
          onClick={() => setPage("settings")}
        >
          Ayarlar
        </button>
      </div>
    </nav>
  );
}

function AppointmentsPage({ onAppointmentsUpdate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Admin şifre doğrulama state'leri
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);

  const [settings, setSettings] = useState({
    logo: null,
    name: '',
    desc: '',
    contact: { name: '', phone: '', email: '', address: '' },
    interval: 30,
    workingHours: {
      pzt: { is_open: false, opening: '', closing: '' },
      sal: { is_open: false, opening: '', closing: '' },
      car: { is_open: false, opening: '', closing: '' },
      per: { is_open: false, opening: '', closing: '' },
      cum: { is_open: false, opening: '', closing: '' },
      cmt: { is_open: false, opening: '', closing: '' },
      paz: { is_open: false, opening: '', closing: '' },
    },
    services: []
  });

  // Şifreyi cookie'den otomatik al
  useEffect(() => {
    const saved = Cookies.get('adminPassword');
    if (saved) {
      setAdminPassword(saved);
      setShowPasswordModal(false);
      setPasswordVerified(true);
    } else {
      setShowPasswordModal(true);
      setPasswordVerified(false);
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/settings");
        const data = await res.json();
        console.log(data)
        setSettings({
          logo: data.logo,
          name: data.name,
          desc: data.desc,
          contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
          interval: data.interval,
          workingHours: typeof data.workingHours === 'string' ? JSON.parse(data.workingHours) : data.workingHours,
          services: typeof data.services === 'string' ? JSON.parse(data.services) : data.services
        });
      } catch (err) {}
      setLoading(false);
      console.log("?")
    };
    fetchSettings();
  }, []);

  // Şifre doğrulama fonksiyonu
  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    try {
      const resp = await fetch('http://localhost:3001/settings/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (!resp.ok) {
        setPasswordError("Şifre yanlış veya sunucu hatası.");
        setPasswordLoading(false);
        return;
      }
      setPasswordVerified(true);
      setShowPasswordModal(false);
      setPasswordLoading(false);
      Cookies.set('adminPassword', adminPassword, { expires: 30 });
    } catch {
      setPasswordError("Sunucuya ulaşılamıyor.");
      setPasswordLoading(false);
    }
  };

  // Fetch appointments on mount (sadece şifre doğrulandıysa)
  useEffect(() => {
    if (!passwordVerified) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/appointments", {
          headers: {
            'x-admin-password': adminPassword
          }
        });
        if (!res.ok) {
          setAppointments([]);
          setLoading(false);
          onAppointmentsUpdate(0);
          return;
        }
        const data = await res.json();
        setAppointments(data);
        onAppointmentsUpdate(data.length);
      } catch (err) {
        setAppointments([]);
        onAppointmentsUpdate(0);
      }
      setLoading(false);
    };
    fetchAppointments();
  }, [passwordVerified, onAppointmentsUpdate]);

  // Filtrelenmiş randevular
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      appointment.name?.toLowerCase().includes(term) ||
      appointment.time?.toLowerCase().includes(term) ||
      appointment.phone?.slice(-2).includes(term)
    );
  });

  // Delete handler
  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteStatus("");
  };
  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    setDeleteStatus("Siliniyor...");
    try {
      const res = await fetch(`http://localhost:3001/appointments/${deleteId}`, {
        method: "DELETE",
        headers: {
          'x-admin-password': adminPassword,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteStatus(data.error || "Hata oluştu");
        return;
      }
      setAppointments(appts => {
        const newAppts = appts.filter(a => a.id !== deleteId);
        onAppointmentsUpdate(newAppts.length);
        return newAppts;
      });
      setDeleteStatus("Başarıyla silindi!");
      setTimeout(() => setDeleteId(null), 1000);
    } catch (err) {
      setDeleteStatus("Sunucu hatası");
    }
  };

  // Render başında şifre modalı göster
  if (showPasswordModal || !passwordVerified) {
    return (
      <>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative flex flex-col gap-4"
              onSubmit={handlePasswordVerify}
            >
              <h3 className="text-lg font-bold text-barber-gold mb-2">Şifre Girin</h3>
              <div className="text-sm text-gray-600 mb-2">Lütfen yönetici şifrenizi girin.</div>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
                placeholder="Şifre"
                autoFocus
                autoComplete="off"
                disabled={passwordLoading}
              />
              <button
                type="submit"
                className="bg-barber-gold text-barber-dark font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
                disabled={passwordLoading || !adminPassword}
              >
                {passwordLoading ? "Doğrulanıyor..." : "Onayla"}
              </button>
              {passwordError && <div className="text-sm text-red-500 mt-2">{passwordError}</div>}
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4 text-barber-gold">Randevular</h2>
        <div className="mb-4 text-gray-600">
          Toplam <span className="font-bold text-barber-gold">{appointments.length}</span> randevu
        </div>
      </div>
      {/* Arama Inputu */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim, saat veya telefon son 2 hanesi ile arama yapın..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-sm text-gray-500 mt-2">
            {filteredAppointments.length} sonuç bulundu
          </div>
        )}
      </div>
      <div className="bg-white rounded shadow p-6 min-h-[200px] text-gray-700 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-barber-gold font-semibold text-lg">Yükleniyor...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">Tarih</th>
                <th className="py-2 px-3 text-left">Saat</th>
                <th className="py-2 px-3 text-left">Ad Soyad</th>
                <th className="py-2 px-3 text-left">Telefon</th>
                <th className="py-2 px-3 text-left">Hizmetler</th>
                <th className="py-2 px-3 text-left">Not</th>
                <th className="py-2 px-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3">{r.time}</td>
                  <td className="py-2 px-3 font-semibold">{r.name}</td>
                  <td className="py-2 px-3">{r.phone}</td>
                  <td className="py-2 px-3">
                    <ul>
                      {r.services.map((s, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span>- {settings?.services?.find(service => String(service.id) === String(s))?.name}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="text-xs text-gray-400 ml-1">Toplam: ₺{r.totalPrice}</span>
                  </td>
                  <td className="py-2 px-3">{r.note}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <form
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
            onSubmit={handleDeleteConfirm}
          >
            <button type="button" onClick={() => setDeleteId(null)} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700">×</button>
            <h3 className="text-lg font-bold text-barber-gold mb-2">Randevuyu Sil</h3>
            <div className="text-sm text-gray-600 mb-2">Bu randevuyu silmek istediğinize emin misiniz?</div>
            <button
              type="submit"
              className="bg-barber-gold text-barber-dark font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              Onayla ve Sil
            </button>
            {deleteStatus && <div className={`text-sm mt-2 ${deleteStatus.includes("Başarı") ? "text-green-600" : "text-red-500"}`}>{deleteStatus}</div>}
          </form>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  // Tek bir settings state'i
  const [settings, setSettings] = useState({
    logo: null,
    name: '',
    desc: '',
    contact: { name: '', phone: '', email: '', address: '' },
    interval: 30,
    workingHours: {
      pzt: { is_open: false, opening: '', closing: '' },
      sal: { is_open: false, opening: '', closing: '' },
      car: { is_open: false, opening: '', closing: '' },
      per: { is_open: false, opening: '', closing: '' },
      cum: { is_open: false, opening: '', closing: '' },
      cmt: { is_open: false, opening: '', closing: '' },
      paz: { is_open: false, opening: '', closing: '' },
    },
    services: []
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Şifre doğrulama state'i
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);

  // Hizmet ekleme/düzenleme modal state'leri
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editService, setEditService] = useState(null); // null ise yeni, değilse düzenleme
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcIcon, setSvcIcon] = useState("none");

  // Görsel state'i ve drag-drop
  const [svcImage, setSvcImage] = useState(null);
  const [svcImageDrag, setSvcImageDrag] = useState(false);

  // Modal açma
  const openServiceModal = (svc = null) => {
    setEditService(svc);
    setSvcName(svc ? svc.name : "");
    setSvcDesc(svc ? svc.description || svc.desc : "");
    setSvcPrice(svc ? svc.price : "");
    setSvcIcon(svc ? svc.icon ?? "none" : "none");
    setSvcImage(svc ? svc.image || null : null);
    setShowServiceModal(true);
  };
  const closeServiceModal = () => setShowServiceModal(false);

  // Görsel yükleme (input)
  const handleSvcImage = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setSvcImage(ev.target.result);
        if (svcIcon === 'none') setSvcIcon('scissors'); // veya varsayılan bir ikon
      };
      reader.readAsDataURL(file);
    }
  };
  // Drag & drop
  const handleSvcImageDrop = e => {
    e.preventDefault();
    setSvcImageDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setSvcImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSvcImageDragOver = e => {
    e.preventDefault();
    setSvcImageDrag(true);
  };
  const handleSvcImageDragLeave = e => {
    e.preventDefault();
    setSvcImageDrag(false);
  };

  // Hizmet ekle/güncelle
  const handleServiceSave = (e) => {
    e.preventDefault();
    if (!svcName.trim() || !svcPrice) return;
    const newService = {
      id: editService ? editService.id : Date.now().toString(),
      name: svcName,
      description: svcDesc,
      price: Number(svcPrice),
      icon: svcIcon === 'none' ? null : (svcImage ? null : svcIcon),
      image: svcIcon === 'none' ? null : (svcImage || null)
    };
    setSettings(prev => ({
      ...prev,
      services: editService
        ? prev.services.map(svc => svc.id === editService.id ? newService : svc)
        : [...prev.services, newService]
    }));
    closeServiceModal();
  };

  // Hizmet sil
  const handleServiceDelete = (id) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.filter(svc => svc.id !== id)
    }));
  };

  // Settings'i tek seferde çek
  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const res = await fetch("http://localhost:3001/settings");
        const data = await res.json();
        setSettings({
          logo: data.logo,
          name: data.name,
          desc: data.desc,
          contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
          interval: data.interval,
          workingHours: typeof data.workingHours === 'string' ? JSON.parse(data.workingHours) : data.workingHours,
          services: typeof data.services === 'string' ? JSON.parse(data.services) : data.services
        });
      } catch (err) {}
      setSettingsLoading(false);
    };
    fetchSettings();
  }, []);

  // Tüm inputlar settings state'inden beslenecek şekilde güncellenecek
  // ... (form inputlarını settings.name, settings.contact vs. ile bağla)

  // Şifre doğrulama fonksiyonu
  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    try {
      const resp = await fetch('http://localhost:3001/settings/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (!resp.ok) {
        setPasswordError("Şifre yanlış veya sunucu hatası.");
        setPasswordLoading(false);
        return;
      }
      setPasswordVerified(true);
      setShowPasswordModal(false);
      setPasswordLoading(false);
      Cookies.set('adminPassword', adminPassword, { expires: 30 });
    } catch {
      setPasswordError("Sunucuya ulaşılamıyor.");
      setPasswordLoading(false);
    }
  };

  // Ayarlar kaydedildiğinde modal otomatik kapanır
  const handleSaveSettings = async () => {
    setSaveStatus("");
    if (!adminPassword) {
      setShowPasswordModal(true);
      return;
    }
    const passwordToUse = adminPassword;
    try {
      const formData = new FormData();
      formData.append('password', passwordToUse);
      formData.append('name', settings.name);
      formData.append('desc', settings.desc);
      formData.append('contact', JSON.stringify(settings.contact));
      formData.append('interval', settings.interval);
      formData.append('workingHours', JSON.stringify(settings.workingHours));
      formData.append('services', JSON.stringify(settings.services));
      formData.append('logo', logoFile || '');
      const response = await fetch('http://localhost:3001/settings/bussines', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        let errorMsg = 'Sunucu hatası';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
          if (response.status === 401) {
            Cookies.remove('adminPassword');
            setShowPasswordModal(true);
            setPasswordVerified(false);
          }
        } catch (e) {}
        setSaveStatus(errorMsg);
        return;
      }
      setSaveStatus("Başarıyla kaydedildi!");
      setTimeout(() => setSaveStatus(""), 2000);
      setShowPasswordModal(false);
      setPasswordVerified(true);
      if (rememberMe) {
        Cookies.set('adminPassword', passwordToUse, { expires: 30 });
      }
    } catch (err) {
      setSaveStatus("Sunucu hatası");
    }
  };

  // Çıkış/yönetici şifresini unut fonksiyonu
  const handleForgetPassword = () => {
    Cookies.remove('adminPassword');
    setAdminPassword("");
    setShowPasswordModal(true);
  };

  // Logo ve resim URL yardımcı fonksiyonu
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:3001/${url.replace(/^\/+/, '')}`;
  };

  // İlk girişte şifre cookie'de yoksa modalı aç
  useEffect(() => {
    const saved = Cookies.get('adminPassword');
    if (saved) {
      setAdminPassword(saved);
      setShowPasswordModal(false);
      setPasswordVerified(true);
    } else {
      setShowPasswordModal(true);
      setPasswordVerified(false);
    }
  }, []);

  // Ayarlar sayfası şifre doğrulanmadan render edilmez
  if (settingsLoading || showPasswordModal || !passwordVerified) {
    return (
      <>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative flex flex-col gap-4"
              onSubmit={handlePasswordVerify}
            >
              <h3 className="text-lg font-bold text-barber-gold mb-2">Şifre Girin</h3>
              <div className="text-sm text-gray-600 mb-2">Lütfen yönetici şifrenizi girin.</div>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
                placeholder="Şifre"
                autoFocus
                autoComplete="off"
                disabled={passwordLoading}
              />
              <button
                type="submit"
                className="bg-barber-gold text-barber-dark font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
                disabled={passwordLoading || !adminPassword}
              >
                {passwordLoading ? "Doğrulanıyor..." : "Onayla"}
              </button>
              {passwordError && <div className="text-sm text-red-500 mt-2">{passwordError}</div>}
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-8 space-y-10">
      {/* Business Info */}
      <section className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-barber-gold mb-4">İşletme Bilgileri</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex flex-col items-center gap-1 w-full max-w-xs">
            {!logoFile ? (
              <label
                className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${logoFile ? 'border-barber-gold bg-barber-gold/10' : 'border-gray-200 bg-gray-50 hover:border-barber-gold/60'}`}
                onDragOver={e => e.preventDefault()}
                onDragLeave={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setLogoFile(e.dataTransfer.files[0]); }}
                htmlFor="logo-input"
              >
                <svg className="w-10 h-10 mb-2 text-barber-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4" /></svg>
                <span className="text-base text-gray-500 text-center px-2 font-medium">Logo yükle veya sürükle-bırak</span>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    setLogoFile(file);
                    if (file) {
                      setSettings(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
                    }
                  }}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex justify-center">
                  {logoFile ? (
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="logo"
                      className="w-28 h-28 object-cover rounded-full border-2 border-barber-gold shadow"
                    />
                  ) : (
                    <img
                      src={getImageUrl(settings.logo)}
                      alt="logo"
                      className="w-28 h-28 object-cover rounded-full border-2 border-barber-gold shadow"
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => { 
                      setSettings(prev => ({ ...prev, logo: null })); 
                      setLogoFile(null); 
                    }}
                    className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                  >
                    Sil
                  </button>
                  <label
                    className={`px-4 py-2 rounded bg-barber-gold text-barber-dark font-semibold cursor-pointer hover:opacity-90 transition border-2 border-barber-gold flex items-center gap-2 ${logoFile ? 'ring-2 ring-barber-gold' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDragLeave={e => e.preventDefault()}
                    onDrop={e => { 
                      e.preventDefault(); 
                      const file = e.dataTransfer.files[0];
                      setLogoFile(file);
                      if (file) {
                        setSettings(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
                      }
                    }}
                    htmlFor="logo-input"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4" /></svg>
                    Değiştir
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        setLogoFile(file);
                        if (file) {
                          setSettings(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-barber-dark">İşletme Adı</label>
              <input
                value={settings.name}
                onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
                placeholder="Örn: Elite Barber"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-barber-dark">Açıklama</label>
              <textarea
                value={settings.desc}
                onChange={e => setSettings(prev => ({ ...prev, desc: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400 min-h-[60px] resize-none"
                placeholder="Kısa açıklama..."
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-barber-gold mb-4">İletişim Bilgileri</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-barber-dark">Yetkili Kişi Adı</label>
            <input
              value={settings.contact?.name || ""}
              onChange={e => setSettings(prev => ({ ...prev, contact: { ...prev.contact, name: e.target.value } }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="Yetkili kişi adı"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-barber-dark">Telefon</label>
            <input
              value={settings.contact?.phone || ""}
              onChange={e => setSettings(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
              className="w-full rounded-lg border px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 transition placeholder-gray-400"
              placeholder="Telefon"
              autoComplete="off"
              inputMode="tel"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-barber-dark">E-posta</label>
            <input
              value={settings.contact?.email || ""}
              onChange={e => setSettings(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="E-posta"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-barber-dark">Adres</label>
            <input
              value={settings.contact?.address || ""}
              onChange={e => setSettings(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="Adres"
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      {/* Randevu Aralığı */}
      <section className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-barber-gold mb-4">Randevu Aralığı</h2>
        <div className="flex items-center gap-4">
          <label className="block text-sm font-semibold text-barber-dark" htmlFor="interval-input">Her randevu arası</label>
          <input
            id="interval-input"
            type="number"
            min={5}
            max={120}
            step={5}
            value={settings.interval}
            onChange={e => setSettings(prev => ({ ...prev, interval: Math.max(5, Math.min(120, Number(e.target.value))) }))}
            className="w-24 rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
          />
          <span className="text-base text-barber-dark">dakika</span>
        </div>
      </section>
      {/* Working Hours */}
      <section className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-barber-gold mb-4">Çalışma Saatleri</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">Gün</th>
                <th className="py-2 px-3 text-left">Açık/Kapalı</th>
                <th className="py-2 px-3 text-left">Açılış</th>
                <th className="py-2 px-3 text-left">Kapanış</th>
              </tr>
            </thead>
            <tbody>
              {['pzt', 'sal', 'car', 'per', 'cum', 'cmt', 'paz'].map(dayKey => {
                const dayLabel = { pzt: "Pazartesi", sal: "Salı", car: "Çarşamba", per: "Perşembe", cum: "Cuma", cmt: "Cumartesi", paz: "Pazar" }[dayKey];
                const wh = settings.workingHours[dayKey] || { is_open: false, opening: '', closing: '' };
                return (
                  <tr key={dayKey} className="border-b">
                    <td className="py-2 px-3 font-semibold">{dayLabel}</td>
                    <td className="py-2 px-3">
                      <label className="inline-flex items-center cursor-pointer select-none">
                        <span className="mr-3 text-sm font-medium min-w-[48px] text-barber-dark">{wh.is_open ? "Açık" : "Kapalı"}</span>
                        <span className="relative">
                          <input
                            type="checkbox"
                            checked={wh.is_open}
                            onChange={e => setSettings(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [dayKey]: { ...wh, is_open: e.target.checked }
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-200" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-200" />
                        </span>
                      </label>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="time"
                        value={wh.opening}
                        disabled={!wh.is_open}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [dayKey]: { ...wh, opening: e.target.value }
                          }
                        }))}
                        className="w-28 rounded-lg border border-gray-300 px-3 py-1 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="time"
                        value={wh.closing}
                        disabled={!wh.is_open}
                        onChange={e => setSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [dayKey]: { ...wh, closing: e.target.value }
                          }
                        }))}
                        className="w-28 rounded-lg border border-gray-300 px-3 py-1 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Services Management */}
      <section className="bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-barber-gold">Hizmetler</h2>
          <button onClick={() => openServiceModal()} className="bg-barber-gold text-barber-dark px-4 py-2 rounded font-semibold hover:opacity-90">+ Yeni Hizmet</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">İkon</th>
                <th className="py-2 px-3 text-left">Başlık</th>
                <th className="py-2 px-3 text-left">Açıklama</th>
                <th className="py-2 px-3 text-left">Fiyat</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {settings.services.map(svc => {
                const IconComp = ICONS.find(i => i.name === svc.icon)?.icon;
                return (
                  <tr key={svc.id} className="border-b">
                    <td className="py-2 px-3 text-2xl">
                      {svc.image ? (
                        <img
                          src={svc.image.startsWith("data:") ? svc.image : getImageUrl(svc.image)}
                          alt={svc.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : IconComp ? (
                        <IconComp className="w-6 h-6" />
                      ) : null}
                    </td>
                    <td className="py-2 px-3 font-semibold">{svc.name}</td>
                    <td className="py-2 px-3">{svc.description || svc.desc}</td>
                    <td className="py-2 px-3">₺{svc.price}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button onClick={() => openServiceModal(svc)} className="px-3 py-1 rounded bg-barber-gold text-barber-dark font-semibold">Düzenle</button>
                      <button onClick={() => handleServiceDelete(svc.id)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold">Sil</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {/* Hizmet ekleme/düzenleme modalı */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeServiceModal}>
          <form
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-150 max-h-[80vh] overflow-y-auto relative flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
            onSubmit={handleServiceSave}
          >
            <button type="button" onClick={closeServiceModal} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700">×</button>
            <h3 className="text-lg font-bold text-barber-gold mb-2">{editService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}</h3>
            <input
              value={svcName}
              onChange={e => setSvcName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="Hizmet başlığı"
              autoComplete="off"
            />
            <textarea
              value={svcDesc}
              onChange={e => setSvcDesc(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400 min-h-[60px] resize-none"
              placeholder="Kısa açıklama..."
              autoComplete="off"
            />
            <input
              type="number"
              value={svcPrice}
              onChange={e => setSvcPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="Fiyat"
              autoComplete="off"
            />
            {/* İkon seçimi ve görsel yükleme alanı */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap justify-center mb-2">
                {/* Hiçbiri seçeneği */}
                <button
                  type="button"
                  className={`text-2xl p-2 rounded-lg border-2 transition-all duration-200 ${svcIcon === 'none' ? "border-barber-gold bg-barber-gold/10" : "border-gray-200"}`}
                  onClick={() => { setSvcIcon('none'); setSvcImage(null); }}
                >
                  <span className="w-7 h-7 mx-auto flex items-center justify-center text-gray-400">✖</span>
                  <span className="text-xs">Hiçbiri</span>
                </button>
                {ICONS.filter(ic => ["scissors","sparkles","star","heart","user","calendar","phone","check","clock","map"].includes(ic.name)).map(icon => {
                  const IconComp = icon.icon;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      className={`text-2xl p-2 rounded-lg border-2 transition-all duration-200 ${svcIcon === icon.name && !svcImage ? "border-barber-gold bg-barber-gold/10" : "border-gray-200"}`}
                      onClick={() => { setSvcIcon(icon.name); setSvcImage(null); }}
                    >
                      {IconComp && <IconComp className="w-7 h-7 mx-auto" />}
                      <span className="text-xs">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                {!svcImage ? (
                  <label
                    className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${svcImageDrag ? 'border-barber-gold bg-barber-gold/10' : 'border-gray-200 bg-gray-50 hover:border-barber-gold/60'}`}
                    onDragOver={handleSvcImageDragOver}
                    onDragLeave={handleSvcImageDragLeave}
                    onDrop={handleSvcImageDrop}
                    htmlFor="svc-image-input"
                  >
                    <svg className="w-10 h-10 mb-2 text-barber-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4" /></svg>
                    <span className="text-base text-gray-500 text-center px-2 font-medium">Görsel yükle veya sürükle-bırak</span>
                    <input
                      id="svc-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleSvcImage}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex justify-center">
                      <img src={svcImage} alt="" className="w-28 h-28 object-cover rounded-xl border-2 border-barber-gold shadow" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSvcImage(null)}
                      className="px-4 py-2 mt-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                    >
                      Görseli Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-barber-gold text-barber-dark font-semibold py-2 rounded hover:opacity-90">
              Kaydet
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-col items-end mt-8">
        {saveStatus && (
          <div className={`mb-4 px-4 py-2 rounded text-center font-semibold shadow
            ${saveStatus.includes("Başarı") ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
            {saveStatus}
          </div>
        )}
        <button
          onClick={handleSaveSettings}
          className="bg-barber-gold cursor-pointer text-barber-dark font-semibold px-8 py-3 rounded-lg shadow hover:opacity-90 transition text-lg"
        >
          Kaydet
        </button>
      </div>
      {/* Password Modal ve Çıkış butonu kodları burada kalabilir */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
          <form
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}
          >
            <button type="button" onClick={() => setShowPasswordModal(false)} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700">×</button>
            <h3 className="text-lg font-bold text-barber-gold mb-2">Şifre Girin</h3>
            <div className="text-sm text-gray-600 mb-2">Lütfen yönetici şifrenizi girin.</div>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-barber-gold focus:border-barber-gold transition placeholder-gray-400"
              placeholder="Şifre"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-barber-gold text-barber-dark font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              Onayla ve Kaydet
            </button>
            {saveStatus && <div className={`text-sm mt-2 ${saveStatus.includes("Başarı") ? "text-green-600" : "text-red-500"}`}>{saveStatus}</div>}
          </form>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("appointments");
  const [totalAppointments, setTotalAppointments] = useState(0);
  
  // AppointmentsPage'den toplam sayıyı al
  const handleAppointmentsUpdate = (count) => {
    setTotalAppointments(count);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar page={page} setPage={setPage} totalAppointments={totalAppointments} />
      <main className="max-w-4xl mx-auto">
        {page === "appointments" && <AppointmentsPage onAppointmentsUpdate={handleAppointmentsUpdate} />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}