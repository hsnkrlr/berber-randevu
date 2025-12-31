# Berber Randevu Sistemi

Berber Randevu Sistemi, müşterilerin kolayca randevu almasını sağlayan, işletme sahibinin ise randevuları ve işletme ayarlarını yönetebildiği kapsamlı bir web uygulamasıdır. Proje; müşteri arayüzü (Frontend), yönetim paneli (Admin) ve sunucu tarafı (Backend) olmak üzere üç ana bölümden oluşmaktadır.

## 🚀 Özellikler

### Müşteri Arayüzü (Frontend)
- **Randevu Alma:** Müsait tarih ve saatleri görüntüleyip randevu oluşturma.
- **Hizmetleri Görüntüleme:** İşletmenin sunduğu hizmetleri ve fiyatları inceleme.
- **İletişim Bilgileri:** İşletme adresine ve iletişim bilgilerine erişim.
- **Duyarlı Tasarım (Responsive):** Mobil ve masaüstü uyumlu modern arayüz.

### Yönetim Paneli (Admin)
- **Randevu Yönetimi:** Gelen randevuları görüntüleme ve silme.
- **İşletme Ayarları:**
  - İşletme adı, açıklaması ve iletişim bilgilerini güncelleme.
  - Çalışma saatlerini ve randevu aralıklarını (periyot) belirleme.
  - Hizmet listesini düzenleme (ekleme/çıkarma/fiyatlandırma).
  - Logo yükleme ve güncelleme.
- **Güvenlik:** Şifre korumalı yönetim paneli girişi.

### Backend (Sunucu)
- **API Endpoints:** Frontend ve Admin paneli için gerekli RESTful API servisleri.
- **Veri Saklama:** JSON tabanlı hafif veri tabanı yapısı (`appointments.json`, `settings.json`).
- **Dosya Yönetimi:** Yüklenen logoların sunulması ve yönetimi.
- **Otomatik Temizlik:** Geçmiş (2 günden eski) randevuların otomatik temizlenmesi.

## 🛠 Teknoloji Yığını

Bu proje aşağıdaki modern teknolojiler kullanılarak geliştirilmiştir:

- **Backend:** Node.js, Express.js
  - `multer`: Dosya yükleme işlemleri için.
  - `bcryptjs`: Güvenli şifreleme için.
  - `cors`: Cross-Origin Resource Sharing yönetimi için.
- **Frontend & Admin:** React 19, Vite
  - `Tailwind CSS v4`: Modern ve esnek stil yönetimi.
  - `Heroicons`: İkon seti.
  - `browser-image-compression`: (Admin) Resim optimizasyonu için.

## 📂 Proje Yapısı

```
berber-randevu-sistemi/
├── admin/          # Yönetim paneli (React + Vite)
├── backend/        # API sunucusu (Node.js + Express)
│   ├── uploads/    # Yüklenen dosyalar
│   ├── appointments.json # Randevu verileri
│   └── settings.json     # Ayar verileri
└── frontent/       # Müşteri arayüzü (React + Vite)
```

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edin.

### Ön Koşullar
- Node.js (v14 veya üzeri)

### 1. Backend Kurulumu

Terminalde `backend` klasörüne gidin, bağımlılıkları yükleyin ve sunucuyu başlatın:

```bash
cd backend
npm install
npm start
```
Sunucu varsayılan olarak `http://localhost:3001` adresinde çalışacaktır.

### 2. Admin Paneli Kurulumu

Yeni bir terminal açın, `admin` klasörüne gidin ve uygulamayı başlatın:

```bash
cd admin
npm install
npm run dev
```

### 3. Frontend (Müşteri Arayüzü) Kurulumu

Yeni bir terminal açın, `frontent` klasörüne gidin ve uygulamayı başlatın:

```bash
cd frontent
npm install
npm run dev
```

## 🔌 API Dokümantasyonu

Backend sunucusu `http://localhost:3001` üzerinde aşağıdaki temel endpoint'leri sunar:

### Randevular (`/appointments`)
- `GET /`: Tüm randevuları listeler (Admin yetkisi gerektirir).
- `POST /`: Yeni randevu oluşturur.
- `DELETE /:id`: Belirtilen randevuyu siler (Admin yetkisi gerektirir).
- `GET /only-times`: Dolu randevu saatlerini döner (Herkese açık).

### Ayarlar (`/settings`)
- `GET /`: İşletme ayarlarını getirir (Herkese açık).
- `POST /bussines`: Ayarları günceller ve logo yükler (Admin yetkisi gerektirir).
- `POST /verify-password`: Admin şifresini doğrular.

## 🔒 Güvenlik Notları
- Admin işlemleri için `x-admin-password` başlığı (header) veya body içinde şifre gönderimi gereklidir.
- Şifreler sunucuda `bcrypt` ile hash'lenerek saklanır.
