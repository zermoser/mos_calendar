import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Clock, Plus, X, Edit3, Trash2, Check, Search, ChevronLeft, ChevronRight, ChevronDown, MapPin, Menu, Users, Star, Bell, Tag, Settings, User, LogOut, Info, HelpCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'work' | 'personal' | 'health' | 'social';
  location?: string;
  attendees?: string[];
  reminder?: number;
}

const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'personal',
    location: '',
    attendees: [],
    reminder: 15
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showEventModal) {
      setAttendeesInput(newEvent.attendees?.join(', ') || '');
    }
  }, [showEventModal, newEvent.attendees]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (showEventModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEventModal]);

  // Categories with updated colors
  const categories = {
    work: { color: 'bg-blue-500', label: 'งาน', icon: <Tag size={16} className="mr-1" /> },
    personal: { color: 'bg-emerald-500', label: 'ส่วนตัว', icon: <User size={16} className="mr-1" /> },
    health: { color: 'bg-rose-500', label: 'สุขภาพ', icon: <Star size={16} className="mr-1" /> },
    social: { color: 'bg-violet-500', label: 'สังคม', icon: <Users size={16} className="mr-1" /> }
  };

  // Day names in Thai (short form)
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // Formatters (unchanged)
  const thaiDateFormatter = useMemo(() => new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok' }), []);
  const thaiMonthYearFormatter = useMemo(() => new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'long', timeZone: 'Asia/Bangkok' }), []);
  const thaiDayFormatter = useMemo(() => new Intl.DateTimeFormat('th-TH', { day: 'numeric', timeZone: 'Asia/Bangkok' }), []);
  const thaiYearFormatter = useMemo(() => new Intl.DateTimeFormat('th-TH', { year: 'numeric', timeZone: 'Asia/Bangkok' }), []);

  // Helper functions (unchanged)
  const getLocalISODateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // useEffect for initialization (unchanged)
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);

    const todayLocalString = getLocalISODateString(today);
    const tomorrow = new Date(today.getTime() + 86400000);
    const tomorrowLocalString = getLocalISODateString(tomorrow);

    setNewEvent(prev => ({
      ...prev,
      date: todayLocalString,
      time: '09:00'
    }));

    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'ประชุมทีม',
        description: 'ประชุมรายสัปดาห์กับทีมงาน',
        date: todayLocalString,
        time: '10:00',
        category: 'work',
        location: 'ห้องประชุม A',
        attendees: ['จอห์น', 'เซรา'],
        reminder: 15
      },
      {
        id: '2',
        title: 'ออกกำลังกาย',
        description: 'วิ่งในสวนสาธารณะ',
        date: tomorrowLocalString,
        time: '06:00',
        category: 'health',
        location: 'สวนลุมพินี',
        reminder: 30
      },
      {
        id: '3',
        title: 'ทานข้าวกับเพื่อน',
        description: 'นัดทานข้าวเย็นที่ร้านอาหาร',
        date: todayLocalString,
        time: '19:00',
        category: 'social',
        location: 'ร้านอาหารไทย',
        attendees: ['เจน', 'ปีเตอร์'],
        reminder: 60
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // Function to get all days for the current month view (unchanged)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];

    for (let i = startDate - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  // Memoized list of days (unchanged)
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Function to filter events (unchanged)
  const getFilteredEvents = (date: Date) => {
    const dateString = getLocalISODateString(date);
    return events.filter(event => {
      const matchesDate = event.date === dateString;
      const matchesSearch = searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesDate && matchesSearch && matchesCategory;
    }).sort((a, b) => a.time.localeCompare(b.time));
  };

  // Event handlers (unchanged)
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      setErrorMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อกิจกรรม, วันที่, เวลา).');
      return;
    }

    setErrorMessage('');

    const eventToSave: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      date: newEvent.date!,
      time: newEvent.time!,
      category: newEvent.category as CalendarEvent['category'],
      location: newEvent.location || '',
      attendees: newEvent.attendees || [],
      reminder: newEvent.reminder || 15
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? eventToSave : e));
    } else {
      setEvents([...events, eventToSave]);
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setErrorMessage('');
    setNewEvent({
      title: '',
      description: '',
      date: getLocalISODateString(selectedDate),
      time: '09:00',
      category: 'personal',
      location: '',
      attendees: [],
      reminder: 15
    });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const changeYear = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearSelector(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Function to render week view
  const renderWeekView = () => {
    const startDate = new Date(selectedDate);
    startDate.setDate(selectedDate.getDate() - selectedDate.getDay());

    const daysInWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      daysInWeek.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {daysInWeek.map((date, index) => {
          const dayEvents = getFilteredEvents(date);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`
                min-h-24 p-2 rounded-xl cursor-pointer transition-all duration-200 relative
                ${isToday(date) ? 'ring-2 ring-blue-500 bg-blue-50 font-bold' : 'bg-white'}
                ${isSelected(date) ? 'bg-blue-100 ring-1 ring-blue-300 shadow-inner' : 'hover:bg-gray-50'}
                flex flex-col border border-gray-200
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                {dayNames[date.getDay()]} {thaiDayFormatter.format(date)}
              </div>

              {hasEvents && (
                <div className="space-y-1 flex-grow overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded text-white truncate ${categories[event.category].color} shadow-sm`}
                      title={event.title}
                    >
                      {event.time} - {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} เพิ่มเติม
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render day view
  const renderDayView = () => {
    const dayEvents = getFilteredEvents(selectedDate);

    return (
      <div className="min-h-[500px] bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-lg font-bold mb-4">
          {thaiDateFormatter.format(selectedDate)}
        </div>

        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar size={48} className="mb-4" />
            <p>ไม่มีกิจกรรมในวันนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${categories[event.category].color}`}></div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span>{event.time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <span>{event.attendees.join(', ')}</span>
                    </div>
                  )}
                  {event.description && (
                    <p className="mt-2 text-gray-700 leading-relaxed">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800">
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
          .calendar-cell {
            transition: all 0.2s ease;
          }
          .calendar-cell:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .event-item {
            transition: all 0.2s ease;
          }
          .event-item:hover {
            transform: translateX(2px);
          }
          .category-chip {
            transition: all 0.2s ease;
          }
          .category-chip:hover {
            transform: scale(1.05);
          }
          .modal-content {
            animation: fadeIn 0.3s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">ปฏิทิน</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-md transform active:scale-95 transition-all"
            aria-label="Add new event"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-md px-4 py-3 animate-fade-in">
          <div className="flex gap-2 mb-3 justify-center">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v as any);
                  setShowMobileMenu(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${view === v
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}
              </button>
            ))}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {Object.entries(categories).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ปฏิทินอัจฉริยะ</h1>
              <p className="text-gray-600">จัดการเวลาอย่างมีประสิทธิภาพ</p>
              <p className="text-xs text-gray-500 mt-1">เวลาอ้างอิง: ประเทศไทย (GMT+7)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner border border-gray-200">
              {['month', 'week', 'day'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${view === v
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowEventModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              เพิ่มกิจกรรม
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md"
              >
                <User size={20} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fade-in">
                  <div className="p-4 border-b border-gray-100">
                    <div className="font-medium">ผู้ใช้ระบบ</div>
                    <div className="text-sm text-gray-500">user@example.com</div>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <Settings size={16} className="text-gray-600" /> การตั้งค่า
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <HelpCircle size={16} className="text-gray-600" /> ความช่วยเหลือ
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <Info size={16} className="text-gray-600" /> เกี่ยวกับ
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-500">
                      <LogOut size={16} /> ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Calendar Header */}
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 transform active:scale-95"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                        {thaiMonthYearFormatter.format(currentDate).split(' ')[0]}
                      </h2>

                      <div className="relative">
                        <button
                          onClick={() => setShowYearSelector(!showYearSelector)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all text-gray-900 transform active:scale-95"
                          aria-label="Select year"
                        >
                          <span className="text-lg lg:text-xl font-bold">
                            {thaiYearFormatter.format(currentDate)}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {showYearSelector && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto w-32 animate-fade-in">
                            {years.map(year => (
                              <button
                                key={year}
                                onClick={() => changeYear(year)}
                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-gray-700 ${year === currentYear ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 transform active:scale-95"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const today = new Date();
                      setCurrentDate(today);
                      setSelectedDate(today);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-md transform active:scale-95"
                  >
                    วันนี้
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 py-2 text-sm lg:text-base">
                      {day}
                    </div>
                  ))}
                </div>

                {view === 'month' ? (
                  <div className="grid grid-cols-7 gap-1 lg:gap-2">
                    {days.map(({ date, isCurrentMonth }, index) => {
                      const dayEvents = getFilteredEvents(date);
                      const hasEvents = dayEvents.length > 0;

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          className={`
                            min-h-16 lg:min-h-24 p-1 lg:p-2 rounded-xl cursor-pointer transition-all duration-200 relative
                            calendar-cell
                            ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                            ${isToday(date) ? 'ring-2 ring-blue-500 bg-blue-50 font-bold' : ''}
                            ${isSelected(date) ? 'bg-blue-100 ring-1 ring-blue-300 shadow-inner' : 'hover:bg-gray-50'}
                            flex flex-col border border-gray-200
                          `}
                        >
                          <div className={`text-sm lg:text-base font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday(date) ? 'text-blue-600' : ''}`}>
                            {thaiDayFormatter.format(date)}
                          </div>

                          {hasEvents && (
                            <div className="space-y-1 flex-grow overflow-hidden">
                              {dayEvents.slice(0, window.innerWidth < 1024 ? 1 : 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1 lg:px-2 py-0.5 rounded text-white truncate ${categories[event.category].color} shadow-sm`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > (window.innerWidth < 1024 ? 1 : 2) && (
                                <div className="text-xs text-gray-500 px-1">
                                  +{dayEvents.length - (window.innerWidth < 1024 ? 1 : 2)} เพิ่มเติม
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : view === 'week' ? (
                  renderWeekView()
                ) : (
                  renderDayView()
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filter - Desktop Only */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ค้นหาและกรอง</h3>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหากิจกรรม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {Object.entries(categories).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Day Events */}
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  กิจกรรมวันที่ {thaiDateFormatter.format(selectedDate)}
                </h3>
                <div className="text-xs text-gray-500">
                  {dayNames[selectedDate.getDay()]}
                </div>
              </div>

              <div className="space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
                {getFilteredEvents(selectedDate).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">ไม่มีกิจกรรมในวันนี้</p>
                  </div>
                ) : (
                  getFilteredEvents(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="event-item p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${categories[event.category].color}`}></div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-500" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <span>{event.attendees.join(', ')}</span>
                          </div>
                        )}
                        {event.reminder && event.reminder > 0 && (
                          <div className="flex items-center gap-2">
                            <Bell size={16} className="text-gray-500" />
                            <span>แจ้งเตือนล่วงหน้า {event.reminder} นาที</span>
                          </div>
                        )}
                        {event.description && (
                          <p className="mt-2 text-gray-700 leading-relaxed">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Categories Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">หมวดหมู่</h3>
              <div className="space-y-2">
                {Object.entries(categories).map(([key, { color, label, icon }]) => {
                  const count = events.filter(e => e.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterCategory(key)}
                      className={`category-chip flex items-center justify-between p-3 rounded-lg w-full text-left transition-all
                        ${filterCategory === key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <span>{icon} {label}</span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`category-chip flex items-center justify-between p-3 rounded-lg w-full text-left transition-all
                    ${filterCategory === 'all' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span>ทุกหมวดหมู่</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{events.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              ref={modalRef}
              className="modal-content bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                    <strong className="font-bold">ข้อผิดพลาด!</strong>
                    <span className="block sm:inline ml-2">{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อกิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="ใส่ชื่อกิจกรรม..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รายละเอียด
                    </label>
                    <textarea
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="ใส่รายละเอียดกิจกรรม..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วันที่ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newEvent.date || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        เวลา <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={newEvent.time || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมวดหมู่
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(categories).map(([key, { color, label }]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, category: key as CalendarEvent['category'] })}
                          className={`py-2 rounded-lg text-center text-sm font-medium transition-all
                            ${newEvent.category === key
                              ? `${color} text-white shadow-md`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สถานที่
                    </label>
                    <input
                      type="text"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="ใส่สถานที่..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ผู้เข้าร่วม (คั่นด้วยจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={attendeesInput}
                      onChange={(e) => setAttendeesInput(e.target.value)}
                      onBlur={() => {
                        const attendees = attendeesInput.split(',').map(s => s.trim()).filter(s => s !== '');
                        setNewEvent({ ...newEvent, attendees });
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="เช่น จอห์น, เจน"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      แจ้งเตือนล่วงหน้า
                    </label>
                    <select
                      value={newEvent.reminder || 15}
                      onChange={(e) => setNewEvent({ ...newEvent, reminder: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value={0}>ไม่มี</option>
                      <option value={5}>5 นาที</option>
                      <option value={15}>15 นาที</option>
                      <option value={30}>30 นาที</option>
                      <option value={60}>1 ชั่วโมง</option>
                      <option value={120}>2 ชั่วโมง</option>
                      <option value={1440}>1 วัน</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium shadow-sm"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {editingEvent ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มกิจกรรม'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarApp;