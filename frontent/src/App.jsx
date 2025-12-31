import React, { useState, useRef, useEffect } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ScissorsIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  StarIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import ScissorsLoader from './ScissorsLoader'

// Icon mapping function
const iconMap = {
  scissors: ScissorsIcon,
  sparkles: SparklesIcon,
  star: StarIcon,
  heart: HeartIcon,
}

function findFirstAvailableDate(availableDates, getTimeSlots) {
  for (let date of availableDates) {
    const slots = getTimeSlots(date);
    // Eğer en az bir tane isDisabled=false slot varsa, bu gün seçilebilir
    if (slots.some(slot => !slot.isDisabled)) {
      return date;
    }
  }
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Appointment states
  const [selectedDate, setSelectedDate] = useState(new Date()) // Will be updated after functions are defined
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedServices, setSelectedServices] = useState([])

  // Backend data states
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bookedAppointments, setBookedAppointments] = useState({})
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successDateText, setSuccessDateText] = useState('');

  // Refs for smooth scrolling
  const homeRef = useRef(null)
  const servicesRef = useRef(null)
  const appointmentRef = useRef(null)
  const contactRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const handleNavClick = (tab, sectionRef) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
    scrollToSection(sectionRef)
  }

  // Set default date when component mounts
  useEffect(() => {
    const availableDates = getAvailableDates()
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0])
    }
  }, [])

  // Fetch settings and appointments on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch all settings (business info, services, working hours, contact, logo)
      const settingsRes = await fetch('http://localhost:3001/settings')
      const settingsData = await settingsRes.json()
      setSettings({
        logo: settingsData.logo && settingsData.logo.startsWith('uploads/')
          ? `http://localhost:3001/${settingsData.logo.replace(/^\/+/, '')}`
          : settingsData.logo,
        name: settingsData.name,
        desc: settingsData.desc,
        contact: typeof settingsData.contact === 'string' ? JSON.parse(settingsData.contact) : settingsData.contact,
        interval: settingsData.interval,
        workingHours: typeof settingsData.workingHours === 'string' ? JSON.parse(settingsData.workingHours) : settingsData.workingHours,
        services: typeof settingsData.services === 'string' ? JSON.parse(settingsData.services) : settingsData.services
      });
      // Fetch appointments
      const apptRes = await fetch('http://localhost:3001/appointments/only-times', )
      const appts = await apptRes.json()
      
      if (!Array.isArray(appts)) {
        setLoading(false)
        return;
      }
      console.log(appts)
      setBookedAppointments(appts)
      setLoading(false)
    }
    fetchData()
  }, [])

  // getAvailableDates fonksiyonu: Sadece en az bir boş slotu olan günleri döndür
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);
      // O günün en az bir slotu boşsa ekle
      const slots = getTimeSlots(date);
      if (slots.some(slot => !slot.isDisabled)) {
        dates.push(new Date(date));
      }
    }
    return dates;
  };

  // İlk uygun günü otomatik seçili yap
  useEffect(() => {
    if (!settings) return;
    const availableDates = getAvailableDates();
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [settings, bookedAppointments]);

  const getDayKey = (date) => {
    const dayNames = ['paz', 'pzt', 'sal', 'car', 'per', 'cum', 'cmt']
    return dayNames[date.getDay()]
  }

  // Format date to DDMMYY format for appointment tracking
  const formatDateForAppointments = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    return `${day}${month}${year}`
  }

  // Check if a time slot is booked for a specific date
  const isTimeSlotBooked = (date, time) => {
    if (!Array.isArray(bookedAppointments)) return false;
    // UTC değil, yerel tarih stringi kullan
    const dateStr = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    return bookedAppointments.some(
      a => a.date === dateStr && a.time === time
    );
  };

  // Handle service selection
  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = settings?.services.find(s => s.id === serviceId)
      return total + (service ? service.price : 0)
    }, 0)
  }

  const getTimeSlots = (date) => {
    const slots = [];
    const now = new Date();
    const dayKey = getDayKey(date);
    const daySchedule = settings?.workingHours ? settings.workingHours[dayKey] : null;

    // Check if the date is today
    const isToday = date.toDateString() === now.toDateString()

    // Calculate minimum time (1 hour from now)
    const minTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now

    // Check if the day is open
    if (!daySchedule || !daySchedule.is_open) {
      return slots
    }

    // Parse opening and closing hours
    const [openingHour, openingMinute] = daySchedule.opening.split(':').map(Number)
    const [closingHour, closingMinute] = daySchedule.closing.split(':').map(Number)

    // Generate time slots
    for (let hour = openingHour; hour < closingHour; hour++) {
      for (let minute of [0, 30]) {
        if (hour === closingHour - 1 && minute === 30) continue;
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isPastOrTooSoon = isToday && slotTime <= minTime;
        const isBooked = isTimeSlotBooked(date, timeString);

        slots.push({
          time: timeString,
          isDisabled: isPastOrTooSoon || isBooked
        });
      }
    }
    return slots;
  };

  const handleDateSelect = (date) => {
    const availableDates = getAvailableDates()
    const isAvailable = availableDates.some(availableDate =>
      availableDate.toDateString() === date.toDateString()
    )



    if (isAvailable) {
      setSelectedDate(date)
      setSelectedTime('') // Reset time when date changes
    }
  }

  // Helper: Get allowed phone numbers from localStorage
  const getLocalPhoneNumbers = () => {
    try {
      const data = localStorage.getItem('berber_phone_numbers')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  // Helper: Save phone numbers to localStorage
  const saveLocalPhoneNumbers = (numbers) => {
    localStorage.setItem('berber_phone_numbers', JSON.stringify(numbers))
  }

  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    let digits = value.replace(/\D/g, '');
    // 5 ile başlamıyorsa düzelt
    if (digits.length > 0 && digits[0] !== '5') {
      digits = '5' + digits.slice(1);
    }
    // 10 haneden fazla olmasın
    digits = digits.slice(0, 10);
    // Format: 5xx xxx xxxx
    let formatted = digits;
    if (digits.length > 3) {
      formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
    }
    if (digits.length > 6) {
      formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);
    }
    return formatted;
  };

  const [phoneInput, setPhoneInput] = useState('');

  // On form submit, POST to backend and then refetch appointments
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    // Additional validation
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Lütfen tüm alanları doldurun.')
      return
    }

    // Check if form fields are filled
    const name = e.target.name?.value || ''
    const phone = phoneInput.replace(/\D/g, '');

    if (!name.trim() || !phone.trim()) {
      alert('Lütfen adınız ve telefon numaranızı girin.')
      return
    }

    if (!/^5\d{9}$/.test(phone)) {
      alert('Lütfen geçerli bir 5xx xxx xxxx formatında telefon numarası girin.');
      return;
    }

    // --- LIMIT: Only 2 different phone numbers per device ---
    const localPhones = getLocalPhoneNumbers()
    const uniquePhones = Array.from(new Set(localPhones))
    if (
      uniquePhones.length >= 2 &&
      !uniquePhones.includes(phone)
    ) {
      alert('Bu cihazdan en fazla iki farklı kişi için randevu alınabilir. Lütfen mevcut numaralardan biriyle giriş yapın.')
      return
    }
    // --- END LIMIT ---

    // Check if the selected time slot is still available
    if (isTimeSlotBooked(selectedDate, selectedTime)) {
      alert('Seçtiğiniz saat dolu. Lütfen başka bir saat seçin.')
      return
    }

    // Form data to submit
    const formData = {
      name: name,
      phone: phone, // Boşluksuz, sadece rakam
      services: selectedServices,
      totalPrice: calculateTotalPrice(),
      date: selectedDate.getFullYear() + '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(selectedDate.getDate()).padStart(2, '0'),
      time: selectedTime
    }

    // POST to backend
    const resp = await fetch('http://localhost:3001/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (!resp.ok) {
      alert('Randevu kaydedilemedi!')
      return
    }

    // Add phone to localStorage if not present
    if (!uniquePhones.includes(phone)) {
      saveLocalPhoneNumbers([...uniquePhones, phone].slice(-2))
    }

    // Refetch appointments
    const apptRes = await fetch('http://localhost:3001/appointments/only-times')
    const times = await apptRes.json()
    if (!Array.isArray(times)) {
      alert('Randevu verileri alınamadı. Lütfen tekrar deneyin.');
      return;
    }
    setBookedAppointments(times)
    // Başarı animasyonu için tarih metni hazırla
    const dateObj = selectedDate;
    const trDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
    setSuccessDateText(`<b>${trDate}</b> için randevunuzu oluşturduk`);
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 6000);

    // Reset form
    setSelectedDate(new Date())
    setSelectedTime('')
    setSelectedServices([])
    e.target.reset()
  }



  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Takvim renderında, tamamen dolu günleri disabled yap
  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);

      const slots = getTimeSlots(date);
      const isAvailable = slots.some(slot => !slot.isDisabled);
      const isDisabled = !isAvailable;
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const isToday = i === 0;
      const shouldBeSelected = isSelected;
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayNumber = date.getDate();

      days.push(
        <div key={i} className="flex flex-col items-center">
          <div className={`text-xs mb-1 font-medium ${
            isDisabled ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {dayName}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isDisabled) handleDateSelect(date);
            }}
            disabled={isDisabled}
            className={`
              w-12 h-12 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center
              ${isDisabled
                ? 'text-gray-300 cursor-not-allowed bg-gray-50 border border-gray-200'
                : 'text-gray-700 hover:bg-barber-gold/10 hover:text-barber-gold border border-transparent'
              }
              ${shouldBeSelected ? 'bg-barber-gold text-barber-dark border-barber-gold' : ''}
              ${isToday ? 'ring-2 ring-barber-gold bg-barber-gold/5' : ''}
            `}
          >
            {dayNumber}
          </button>
        </div>
      );
    }
    return days;
  };

  // Add this mapping for Turkish day names in the same order as workingHours
  const dayNameMap = [
    { key: 'pzt', label: 'Pazartesi' },
    { key: 'sal', label: 'Salı' },
    { key: 'car', label: 'Çarşamba' },
    { key: 'per', label: 'Perşembe' },
    { key: 'cum', label: 'Cuma' },
    { key: 'cmt', label: 'Cumartesi' },
    { key: 'paz', label: 'Pazar' },
  ]

  if (loading || !settings) {
    return <ScissorsLoader />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Başarı animasyonu overlay */}
      {showSuccessAnimation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 1s',
            pointerEvents: 'none',
          }}
          className={showSuccessAnimation ? 'opacity-100' : 'opacity-0'}
        >
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircleIcon className="w-28 h-28 text-green-500 animate-pulse" style={{ filter: 'drop-shadow(0 0 16px #22c55e)' }} />
            <div className="mt-6 text-xl text-barber-dark text-center font-semibold" dangerouslySetInnerHTML={{ __html: successDateText }} />
          </div>
        </div>
      )}
      {/* Header */}
      <header className="gradient-bg text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-center md:text-left">
              {settings?.logo && (
                <img src={settings?.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover border-2 border-barber-gold bg-white" />
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-barber-gold mb-1">{settings?.name}</h1>
                <span className="text-sm text-gray-300 font-light">Profesyonel Saç & Sakal Tasarımı</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2">
              <button
                className={`px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                  activeTab === 'home'
                    ? 'bg-barber-gold text-barber-dark'
                    : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                }`}
                onClick={() => handleNavClick('home', homeRef)}
              >
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Ana Sayfa
              </button>
              <button
                className={`px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'bg-barber-gold text-barber-dark'
                    : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                }`}
                onClick={() => handleNavClick('services', servicesRef)}
              >
                <SparklesIcon className="w-4 h-4 inline mr-2" />
                Hizmetler
              </button>
              <button
                className={`px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'bg-barber-gold text-barber-dark'
                    : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                }`}
                onClick={() => handleNavClick('appointments', appointmentRef)}
              >
                <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                Randevu
              </button>
              <button
                className={`px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'bg-barber-gold text-barber-dark'
                    : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                }`}
                onClick={() => handleNavClick('contact', contactRef)}
              >
                <PhoneIcon className="w-4 h-4 inline mr-2" />
                İletişim
              </button>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-barber-gold/10 transition-all duration-300"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 animate-fade-in">
              <nav className="flex flex-col gap-2 bg-barber-gray rounded-lg p-4 shadow-lg">
                <button
                  className={`px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm text-left ${
                    activeTab === 'home'
                      ? 'bg-barber-gold text-barber-dark'
                      : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                  }`}
                  onClick={() => handleNavClick('home', homeRef)}
                >
                  <HomeIcon className="w-4 h-4 inline mr-2" />
                  Ana Sayfa
                </button>
                <button
                  className={`px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm text-left ${
                    activeTab === 'services'
                      ? 'bg-barber-gold text-barber-dark'
                      : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                  }`}
                  onClick={() => handleNavClick('services', servicesRef)}
                >
                  <SparklesIcon className="w-4 h-4 inline mr-2" />
                  Hizmetler
                </button>
                <button
                  className={`px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm text-left ${
                    activeTab === 'appointments'
                      ? 'bg-barber-gold text-barber-dark'
                      : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                  }`}
                  onClick={() => handleNavClick('appointments', appointmentRef)}
                >
                  <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                  Randevu
                </button>
                <button
                  className={`px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm text-left ${
                    activeTab === 'contact'
                      ? 'bg-barber-gold text-barber-dark'
                      : 'hover:bg-barber-gold/10 hover:text-barber-gold'
                  }`}
                  onClick={() => handleNavClick('contact', contactRef)}
                >
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  İletişim
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section ref={homeRef} className="scroll-section gradient-bg text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left animate-fade-in">
              <h2 className="text-4xl md:text-6xl font-bold text-barber-gold mb-6">
                Profesyonel Berber Hizmeti
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Modern teknikler ve geleneksel ustalığın buluştuğu yerde, size özel saç ve sakal tasarımı sunuyoruz.
              </p>
              <button
                className="btn-primary text-lg"
                onClick={() => scrollToSection(appointmentRef)}
              >
                <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
                Randevu Al
              </button>
            </div>
            <div className="flex justify-center animate-slide-up">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-barber-gold to-yellow-300 rounded-full flex items-center justify-center shadow-2xl">
                {settings?.logo ? (
                  <img src={settings?.logo} alt="Logo" className="h-full w-full rounded-full object-cover border-2 border-barber-gold bg-white" />
                ) : 
                  <ScissorsIcon className="w-32 h-32 text-barber-dark" />
                }
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="scroll-section py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-barber-dark mb-16">
            Hizmetlerimiz
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {settings?.services?.map((service, index) => {
              let iconOrImage = null;
              if (service.image) {
                iconOrImage = (
                  <img
                    src={service.image.startsWith('data:') ? service.image : service.image}
                    alt={service.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                );
              } else if (service.icon && iconMap[service.icon]) {
                const IconComponent = iconMap[service.icon];
                iconOrImage = <IconComponent className="w-8 h-8 text-barber-dark" />;
              } // else null, boş bırak
              return (
                <div key={service.id} className="card p-8 text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-barber-gold to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
                    {iconOrImage}
                  </div>
                  <h4 className="text-xl font-semibold text-barber-dark mb-4">{service.name}</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <span className="bg-gradient-to-r from-barber-gold to-yellow-300 text-barber-dark px-6 py-2 rounded-full font-semibold">
                    ₺{service.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section ref={appointmentRef} className="scroll-section gradient-bg text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-in">
              <h3 className="text-3xl md:text-4xl font-bold text-barber-gold mb-6">
                Hemen Randevu Alın
              </h3>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Online randevu sistemi ile kolayca rezervasyon yapabilir, size en uygun zamanı seçebilirsiniz.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-6 h-6 text-barber-gold" />
                  <span>7/24 Online Rezervasyon</span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-barber-gold" />
                  <span>30 Dakika Aralıklarla</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-barber-gold" />
                  <span>1 Hafta Öncesine Kadar</span>
                </div>
              </div>
            </div>

            <div className="animate-slide-up">
              <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      maxLength={50}
                      placeholder="Adınız Soyadınız"
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Telefon Numarası"
                      className="form-input"
                      required
                      value={phoneInput}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhoneInput(formatted);
                      }}
                      maxLength={12} // 10 rakam + 2 boşluk
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Hizmet Seçin
                    </label>
                    <div className="flex flex-wrap justify-center gap-3">
                      {settings?.services?.map(service => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleServiceToggle(service.id)
                          }}
                          className={`
                            px-4 py-3 rounded-full border-2 transition-all duration-200 font-medium text-sm
                            ${selectedServices.includes(service.id)
                              ? 'border-barber-gold bg-barber-gold text-white'
                              : 'border-gray-200 hover:border-barber-gold hover:bg-barber-gold/5 text-gray-700'
                            }
                          `}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Price Display */}
                  {selectedServices.length > 0 && (
                    <div className="bg-gradient-to-r from-barber-gold/10 to-yellow-300/10 border border-barber-gold/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Seçilen Hizmetler:</span>
                        <span className="text-lg font-bold text-barber-dark">
                          ₺{calculateTotalPrice()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {selectedServices.map(serviceId => {
                          const service = settings?.services.find(s => s.id === serviceId)
                          return service ? (
                            <div key={serviceId} className="flex justify-between">
                              <span>{service.name}</span>
                              <span>₺{service.price}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarih Seçin
                    </label>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      {/* Calendar Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                          Önümüzdeki 7 Gün
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          Bugünden itibaren 1 hafta
                        </p>
                      </div>

                      {/* Calendar Days */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        {renderCalendar()}
                      </div>

                      <div className="text-sm text-gray-700 text-center font-medium bg-gray-50 py-2 px-3 rounded-lg">
                        Seçilen: {formatDate(selectedDate)}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saat Seçin
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {getTimeSlots(selectedDate).map(slot => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isDisabled}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!slot.isDisabled) {
                              setSelectedTime(slot.time)
                            }
                          }}
                          className={`
                            px-4 py-2 rounded-lg border-2 text-sm font-semibold
                            ${slot.isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-barber-dark hover:bg-barber-gold/10 hover:text-barber-gold'}
                            ${selectedTime === slot.time ? 'border-barber-gold bg-barber-gold/10 text-barber-gold' : ''}
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || selectedServices.length === 0}
                    className="w-full bg-gradient-to-r from-barber-gold to-yellow-300 text-barber-dark font-semibold py-3 rounded-lg hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:transform-none"
                    onClick={(e) => {
                      if (!selectedDate || !selectedTime || selectedServices.length === 0) {
                        e.preventDefault()
                        alert('Lütfen tüm alanları doldurun.')
                        return
                      }
                    }}
                  >
                    <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
                    Randevu Al
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={contactRef} className="scroll-section bg-barber-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-barber-gold mb-4">{settings?.name}</h4>
              <p className="text-gray-300 leading-relaxed">
                Profesyonel berber hizmeti ile modern ve şık görünümünüzü tamamlayın.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-barber-gold mb-4">İletişim</h4>
              <div className="space-y-2 text-gray-300">
                {settings?.contact.phone && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    {settings?.contact.phone}
                  </p>
                )}
                {settings?.contact.email && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    {settings?.contact.email}
                  </p>
                )}
                {settings?.contact.address && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    {settings?.contact.address}
                  </p>
                )}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-barber-gold mb-4">Çalışma Saatleri</h4>
              <div className="space-y-2 text-gray-300">
                {dayNameMap.map(day => {
                  const wh = settings?.workingHours ? settings.workingHours[day.key] : null
                  return (
                    <p key={day.key} className={wh?.is_open ? '' : 'opacity-60'}>
                      <span className="inline-block w-24 font-semibold">{day.label}:</span>
                      {wh?.is_open
                        ? `${wh.opening} - ${wh.closing}`
                        : 'Kapalı'}
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-700">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} {settings?.name}. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
