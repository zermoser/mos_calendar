import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Plus, X, Edit3, Trash2, Check, Search, ChevronLeft, ChevronRight, ChevronDown, MapPin, Menu, Users } from 'lucide-react';

// Define the interface for a Calendar Event
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  category: 'work' | 'personal' | 'health' | 'social';
  location?: string;
  attendees?: string[]; // Array of attendee names
  reminder?: number; // Reminder in minutes before the event
}

const CalendarApp: React.FC = () => {
  // State for the currently displayed month/year in the calendar grid
  const [currentDate, setCurrentDate] = useState(new Date());
  // State for the date selected by the user (e.g., clicking on a day cell)
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State to store all calendar events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // State to control the visibility of the event creation/edit modal
  const [showEventModal, setShowEventModal] = useState(false);
  // State to hold the event being edited (null if creating a new event)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  // State for the search term to filter events
  const [searchTerm, setSearchTerm] = useState('');
  // State for the category filter
  const [filterCategory, setFilterCategory] = useState<string>('all');
  // State for the calendar view (month, week, day - currently only month is fully implemented)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  // State to control the visibility of the mobile navigation menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // State to control the visibility of the year selector dropdown
  const [showYearSelector, setShowYearSelector] = useState(false);
  // State to hold data for a new or currently edited event in the modal form
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
  // State for displaying validation error messages in the modal
  const [errorMessage, setErrorMessage] = useState('');

  // Define event categories with their associated colors and labels
  const categories = {
    work: { color: 'bg-blue-500', label: 'งาน' },
    personal: { color: 'bg-emerald-500', label: 'ส่วนตัว' },
    health: { color: 'bg-red-500', label: 'สุขภาพ' },
    social: { color: 'bg-purple-500', label: 'สังคม' }
  };

  // Month names in Thai
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Day names in Thai (short form)
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // useEffect hook to initialize the calendar with today's date and sample events
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    // Set default date and time for new event based on today
    setNewEvent(prev => ({
      ...prev,
      date: today.toISOString().split('T')[0],
      time: '09:00'
    }));

    // Sample events for demonstration
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'ประชุมทีม',
        description: 'ประชุมรายสัปดาห์กับทีมงาน',
        date: today.toISOString().split('T')[0],
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
        date: new Date(today.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '06:00',
        category: 'health',
        location: 'สวนลุมพินี',
        reminder: 30
      },
      {
        id: '3',
        title: 'ทานข้าวกับเพื่อน',
        description: 'นัดทานข้าวเย็นที่ร้านอาหาร',
        date: today.toISOString().split('T')[0],
        time: '19:00',
        category: 'social',
        location: 'ร้านอาหารไทย',
        attendees: ['เจน', 'ปีเตอร์'],
        reminder: 60
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // Function to get all days for the current month view (including prev/next month's overflow)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    const days = [];

    // Add days from the previous month to fill the first week
    for (let i = startDate - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Add days from the next month to fill the last week(s) to make it a 6-row grid (42 days)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  // Memoized list of days to avoid re-calculating on every render
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Function to filter events based on selected date, search term, and category
  const getFilteredEvents = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const matchesDate = event.date === dateString;
      const matchesSearch = searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesDate && matchesSearch && matchesCategory;
    }).sort((a, b) => a.time.localeCompare(b.time)); // Sort events by time
  };

  // Handle saving a new event or updating an existing one
  const handleSaveEvent = () => {
    // Basic validation for required fields
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      setErrorMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อกิจกรรม, วันที่, เวลา).');
      return;
    }

    setErrorMessage(''); // Clear error message if validation passes

    const eventToSave: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(), // Use existing ID if editing, otherwise generate new
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
      // Update existing event
      setEvents(events.map(e => e.id === editingEvent.id ? eventToSave : e));
    } else {
      // Add new event
      setEvents([...events, eventToSave]);
    }

    handleCloseModal(); // Close modal after saving
  };

  // Reset modal state and close it
  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setErrorMessage(''); // Clear error message on modal close
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0], // Default to selected date
      time: '09:00', // Default time
      category: 'personal',
      location: '',
      attendees: [],
      reminder: 15
    });
  };

  // Prepare event data for editing and open the modal
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent(event); // Populate form with event data
    setShowEventModal(true);
  };

  // Delete an event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  // Navigate to previous or next month
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

  // Change the current year displayed in the calendar
  const changeYear = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearSelector(false); // Close year selector after selection
  };

  // Check if a given date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a given date is the currently selected date
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Generate a list of years for the year selector (e.g., +/- 10 years from current)
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800">
      {/* Tailwind CSS CDN for global styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter font for better typography */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar for better aesthetics */
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1; /* gray-300 */
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; /* gray-400 */
          }

          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .animate-slide-in-down { animation: slideInDown 0.3s ease-out forwards; }
          .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        `}
      </style>

      {/* Mobile Header (visible on small screens) */}
      <div className="lg:hidden bg-white shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">ปฏิทิน</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md transform active:scale-95"
            aria-label="Add new event"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu (conditionally visible) */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-md px-4 py-3 animate-slide-in-down">
          <div className="flex gap-2 mb-3 justify-center">
            {/* View selection buttons (month, week, day) */}
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v as any);
                  setShowMobileMenu(false); // Close menu after selection
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${view === v
                    ? 'bg-blue-500 text-white transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}
              </button>
            ))}
          </div>

          {/* Search input for mobile */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              aria-label="Search events"
            />
          </div>

          {/* Category filter for mobile */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            aria-label="Filter by category"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {Object.entries(categories).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main content area */}
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Desktop Header (visible on large screens) */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ปฏิทินอัจฉริยะ</h1>
                <p className="text-gray-600">จัดการเวลาอย่างมีประสิทธิภาพ</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View selection buttons for desktop */}
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner border border-gray-200">
                {['month', 'week', 'day'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${view === v
                        ? 'bg-white shadow-md text-blue-600 ring-1 ring-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    {v === 'month' ? 'เดือน' : v === 'week' ? 'สัปดาห์' : 'วัน'}
                  </button>
                ))}
              </div>

              {/* Add Event button for desktop */}
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg transform active:scale-95"
              >
                <Plus className="w-5 h-5" />
                เพิ่มกิจกรรม
              </button>
            </div>
          </div>
        </div>

        {/* Main grid layout: Calendar on left (3/4 width), Sidebar on right (1/4 width) */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Calendar Header (Month Navigation) */}
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 text-gray-600 hover:text-gray-900 transform active:scale-95"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]}
                      </h2>

                      {/* Year Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowYearSelector(!showYearSelector)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-900 transform active:scale-95"
                          aria-label="Select year"
                        >
                          <span className="text-lg lg:text-xl font-semibold">
                            {currentDate.getFullYear()}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {showYearSelector && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto w-32 animate-scale-in origin-top-left">
                            {years.map(year => (
                              <button
                                key={year}
                                onClick={() => changeYear(year)}
                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors duration-150 text-gray-700 ${year === currentYear ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                                  }`}
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
                      className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 text-gray-600 hover:text-gray-900 transform active:scale-95"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Today button */}
                  <button
                    onClick={() => {
                      const today = new Date();
                      setCurrentDate(today);
                      setSelectedDate(today);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium shadow-md transform active:scale-95"
                  >
                    วันนี้
                  </button>
                </div>
              </div>

              {/* Calendar Grid (Days of the week and dates) */}
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 py-2 text-sm lg:text-base">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 lg:gap-2">
                  {days.map(({ date, isCurrentMonth }, index) => {
                    // Get events for the current day, filtered by search/category
                    const dayEvents = getFilteredEvents(date);
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          min-h-16 lg:min-h-24 p-1 lg:p-2 rounded-lg cursor-pointer transition-all duration-200 relative
                          ${isCurrentMonth ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}
                          ${isToday(date) ? 'ring-2 ring-blue-500 bg-blue-50 font-bold' : ''}
                          ${isSelected(date) ? 'bg-blue-100 ring-1 ring-blue-300 shadow-inner' : ''}
                          flex flex-col
                        `}
                      >
                        <div className={`text-sm lg:text-base font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday(date) ? 'text-blue-600' : ''}`}>
                          {date.getDate()}
                        </div>

                        {hasEvents && (
                          <div className="space-y-1 flex-grow overflow-hidden">
                            {/* Display a limited number of events based on screen size */}
                            {dayEvents.slice(0, window.innerWidth < 1024 ? 1 : 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 lg:px-2 py-0.5 rounded text-white truncate ${categories[event.category].color} shadow-sm`}
                                title={event.title} // Show full title on hover
                              >
                                {event.title}
                              </div>
                            ))}
                            {/* Show count of hidden events if more than display limit */}
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
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filter - Desktop Only */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ค้นหาและกรอง</h3>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหากิจกรรม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Search events"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  aria-label="Filter by category"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                กิจกรรมวันที่ {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>

              <div className="space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
                {getFilteredEvents(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">ไม่มีกิจกรรมในวันนี้</p>
                  </div>
                ) : (
                  getFilteredEvents(selectedDate).map(event => (
                    <div key={event.id} className="p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${categories[event.category].color}`}></div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200 transform active:scale-95"
                            aria-label={`Edit event ${event.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 transform active:scale-95"
                            aria-label={`Delete event ${event.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{event.attendees.join(', ')}</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">หมวดหมู่</h3>
              <div className="space-y-2">
                {Object.entries(categories).map(([key, { color, label }]) => {
                  const count = events.filter(e => e.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterCategory(key)} // Set filter on click
                      className={`flex items-center justify-between p-2 rounded-lg w-full text-left transition-colors duration-200
                        ${filterCategory === key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <span>{label}</span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setFilterCategory('all')} // Option to show all categories
                  className={`flex items-center justify-between p-2 rounded-lg w-full text-left transition-colors duration-200
                    ${filterCategory === 'all' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div> {/* Neutral color for 'all' */}
                    <span>ทุกหมวดหมู่</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{events.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal (for adding/editing events) */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 transform active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <strong className="font-bold">ข้อผิดพลาด!</strong>
                    <span className="block sm:inline ml-2">{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อกิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="ใส่ชื่อกิจกรรม..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-2">
                      รายละเอียด
                    </label>
                    <textarea
                      id="event-description"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="ใส่รายละเอียดกิจกรรม..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-2">
                        วันที่ <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        value={newEvent.date || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 mb-2">
                        เวลา <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="event-time"
                        type="time"
                        value={newEvent.time || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="event-category" className="block text-sm font-medium text-gray-700 mb-2">
                      หมวดหมู่
                    </label>
                    <select
                      id="event-category"
                      value={newEvent.category || 'personal'}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CalendarEvent['category'] })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      {Object.entries(categories).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-2">
                      สถานที่
                    </label>
                    <input
                      id="event-location"
                      type="text"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="ใส่สถานที่..."
                    />
                  </div>

                  <div>
                    <label htmlFor="event-attendees" className="block text-sm font-medium text-gray-700 mb-2">
                      ผู้เข้าร่วม (คั่นด้วยจุลภาค)
                    </label>
                    <input
                      id="event-attendees"
                      type="text"
                      value={newEvent.attendees?.join(', ') || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="เช่น จอห์น, เจน"
                    />
                  </div>

                  <div>
                    <label htmlFor="event-reminder" className="block text-sm font-medium text-gray-700 mb-2">
                      แจ้งเตือนล่วงหน้า (นาที)
                    </label>
                    <select
                      id="event-reminder"
                      value={newEvent.reminder || 15}
                      onChange={(e) => setNewEvent({ ...newEvent, reminder: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm transform active:scale-95"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md flex items-center gap-2 transform active:scale-95"
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

