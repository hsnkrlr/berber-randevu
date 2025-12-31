const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const appointmentsFile = path.join(__dirname, 'appointments.json');
const settingsFile = path.join(__dirname, 'settings.json');

function getPassword() {
  if (!fs.existsSync(settingsFile)) return '';
  const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  return data.adminPassword || '';
}

// Telefon numarasını maskeleme fonksiyonu
function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return digits.slice(0, 1) + '*'.repeat(digits.length - 4) + digits.slice(-2);
}

// Randevu verisinden eski kayıtları temizleyen fonksiyon
function cleanOldAppointments() {
  if (!fs.existsSync(appointmentsFile)) return;
  const data = fs.readFileSync(appointmentsFile, 'utf-8');
  let appointments = JSON.parse(data);
  const now = new Date();
  // 2 gün öncesinin 00:00'ı
  const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
  appointments = appointments.filter(a => {
    // a.date: "YYYY-MM-DD"
    const apptDate = new Date(a.date);
    return apptDate >= threshold;
  });
  fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
}

// List all appointments (admin only)
router.get('/', async (req, res) => {
  const adminPassword = getPassword();
  const sentPassword = req.headers['x-admin-password'];
  if (!adminPassword || !sentPassword) {
    return res.status(401).json({ error: 'Şifre gerekli' });
  }
  const bcrypt = require('bcryptjs');
  const isMatch = await bcrypt.compare(sentPassword, adminPassword);
  if (!isMatch) {
    return res.status(401).json({ error: 'Şifre yanlış' });
  }

  if (!fs.existsSync(appointmentsFile)) fs.writeFileSync(appointmentsFile, '[]');
  const data = fs.readFileSync(appointmentsFile, 'utf-8');
  const appointments = JSON.parse(data).map(a => ({
    ...a,
    phone: maskPhone(a.phone)
  }));
  res.json(appointments);
});

// Add new appointment (POST)
router.post('/', (req, res) => {
  if (!fs.existsSync(appointmentsFile)) fs.writeFileSync(appointmentsFile, '[]');
  const data = JSON.parse(fs.readFileSync(appointmentsFile, 'utf-8'));
  // Yeni randevuyu ekle
  const newAppointment = { ...req.body, id: Date.now() };
  data.push(newAppointment);
  // Tarih ve saat sırasına göre sırala
  data.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA - dateB;
  });
  fs.writeFileSync(appointmentsFile, JSON.stringify(data, null, 2));
  res.json({ success: true, id: newAppointment.id });
});

// Delete appointment (DELETE, admin only)
router.delete('/:id', async (req, res) => {
  const adminPassword = getPassword();
  const sentPassword = req.headers['x-admin-password'];
  if (!adminPassword || !sentPassword) {
    return res.status(401).json({ error: 'Şifre gerekli' });
  }
  const bcrypt = require('bcryptjs');
  const isMatch = await bcrypt.compare(sentPassword, adminPassword);
  if (!isMatch) {
    return res.status(401).json({ error: 'Şifre yanlış' });
  }
  let appointments = [];
  if (fs.existsSync(appointmentsFile)) {
    appointments = JSON.parse(fs.readFileSync(appointmentsFile, 'utf-8'));
  }
  const idx = appointments.findIndex(a => a.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Randevu bulunamadı' });
  appointments.splice(idx, 1);
  fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
  res.json({ success: true });
});

// Sadece randevu tarih ve saatlerini dönen endpoint
router.get('/only-times', async (req, res) => {
  if (!fs.existsSync(appointmentsFile)) fs.writeFileSync(appointmentsFile, '[]');
  const data = fs.readFileSync(appointmentsFile, 'utf-8');
  const appointments = JSON.parse(data);
  const times = appointments.map(a => ({ date: a.date, time: a.time }));
  res.json(times);
});

// Tüm endpointlerin başında temizlik yap
router.use((req, res, next) => {
  cleanOldAppointments();
  next();
});

module.exports = router;
