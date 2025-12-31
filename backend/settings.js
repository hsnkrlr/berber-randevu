const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');

const settingsFile = path.join(__dirname, 'settings.json');

// Multer ayarları (sadece resim)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Sadece resim dosyası yüklenebilir!'), false);
};
const upload = multer({ storage, fileFilter });

// Ayarları getir
router.get('/', (req, res) => {
  if (!fs.existsSync(settingsFile)) fs.writeFileSync(settingsFile, '{}');
  const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  const { adminPassword, ...safeData } = data;
  res.json(safeData);
});

// Ayarları güncelle (şifre kontrolü ile)
router.post('/bussines', upload.single('logo'), express.json(), async (req, res) => {
  // FormData'dan verileri al
  const password = req.body?.password;
  const settings = {
    name: req.body?.name,
    desc: req.body?.desc,
    contact: req.body?.contact,
    interval: req.body?.interval,
    workingHours: req.body?.workingHours,
    services: req.body?.services
  };

  if (!password) {
    return res.status(400).json({ error: 'Şifre gerekli' });
  }

  console.log(bcrypt.encodeBase64(password));

  const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  // Şifre kontrolü
  if (!data.adminPassword || !(await bcrypt.compare(password, data.adminPassword))) {
    return res.status(401).json({ error: 'Şifre yanlış' });
  }
  
  // Logo işlemi - boş değer kontrolü
  if (req.file) {
    // Yeni logo yüklendi
    if (data.logo && fs.existsSync(data.logo)) {
      fs.unlinkSync(data.logo);
    }
    data.logo = req.file.path.replace(/\\/g, '/');
  } else if (req.body.logo === '') {
    // Logo silinmek isteniyor (boş string gönderildi)
    if (data.logo && fs.existsSync(data.logo)) {
      fs.unlinkSync(data.logo);
    }
    data.logo = null;
  }
  // Eğer logoFile undefined veya null ise, mevcut logoyu koru
  
  // Diğer ayarlar
  if (settings.name !== undefined) data.name = settings.name;
  if (settings.desc !== undefined) data.desc = settings.desc;
  if (settings.interval !== undefined) data.interval = settings.interval;
  if (settings.contact !== undefined) data.contact =  JSON.parse(settings.contact);
  if (settings.workingHours !== undefined) data.workingHours =  JSON.parse(settings.workingHours);
  if (settings.services !== undefined) data.services = JSON.parse(settings.services);
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Şifre doğrulama endpointi
router.post('/verify-password', express.json(), async (req, res) => {
  const { password } = req.body;
  if (!fs.existsSync(settingsFile)) return res.status(400).json({ success: false, error: 'Ayar dosyası yok' });
  const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  if (data.adminPassword && await bcrypt.compare(password, data.adminPassword)) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Şifre yanlış' });
  }
});

module.exports = router; 