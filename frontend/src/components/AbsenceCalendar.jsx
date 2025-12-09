/**
 * AbsenceCalendar Component
 * Monthly calendar view showing absences
 */
import { useState, useEffect } from 'react';
import { t } from '../utils/i18n';

export default function AbsenceCalendar({
  absences = [],
  absenceTypes = [],
  initialMonth = null,
  onAddClick = null,
  onEditClick = null,
  currentFilters = {},
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    // If initialMonth is provided (format: YYYY-MM), use it
    if (initialMonth) {
      const [year, month] = initialMonth.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const [hoveredAbsence, setHoveredAbsence] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [weekStartKey, setWeekStartKey] = useState(0); // Force re-render on week start change

  // Update currentDate when initialMonth changes
  useEffect(() => {
    if (initialMonth) {
      const [year, month] = initialMonth.split('-').map(Number);
      setCurrentDate(new Date(year, month - 1, 1));
    }
  }, [initialMonth]);

  // Listen for calendar week start changes
  useEffect(() => {
    const handleWeekStartChange = () => {
      setWeekStartKey(prev => prev + 1); // Force re-render
    };

    window.addEventListener('calendarWeekStartChange', handleWeekStartChange);
    return () => window.removeEventListener('calendarWeekStartChange', handleWeekStartChange);
  }, []);

  // Get color for absence type
  const getTypeColor = (typeName) => {
    const type = absenceTypes.find((t) => t.name === typeName || t.value === typeName);
    return type?.color || '#3B82F6';
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar week start preference from localStorage
  const getWeekStartsOn = () => {
    const saved = localStorage.getItem('calendarWeekStart');
    return saved === 'sunday' ? 0 : 1; // 0 = Sunday, 1 = Monday
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const weekStartsOn = getWeekStartsOn();

    // Adjust day of week based on week start preference
    let startingDayOfWeek = firstDay.getDay() - weekStartsOn;
    if (startingDayOfWeek < 0) startingDayOfWeek += 7;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Check if date has absences
  const getAbsencesForDate = (date) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return absences.filter((absence) => {
      return dateStr >= absence.start_date && dateStr <= absence.end_date;
    });
  };

  // Handle mouse hover for tooltip
  const handleAbsenceHover = (absence, event) => {
    setHoveredAbsence(absence);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleAbsenceLeave = () => {
    setHoveredAbsence(null);
  };

  // Handle adding absence from calendar
  const handleAddAbsence = (date) => {
    if (!onAddClick) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Create pre-filled data
    const prefilledData = {
      start_date: dateStr,
      end_date: dateStr,
    };

    // Check if there's a filtered employee
    if (currentFilters.service_account || currentFilters.employee_fullname) {
      if (absences.length > 0) {
        // Get data from first absence (all absences are from same employee when filtered)
        const firstAbsence = absences[0];
        prefilledData.service_account = firstAbsence.service_account || '';
        prefilledData.employee_fullname = firstAbsence.employee_fullname || '';
      } else {
        // Fallback to filter values if no absences available
        prefilledData.service_account = currentFilters.service_account || '';
        prefilledData.employee_fullname = currentFilters.employee_fullname || '';
      }
    }

    onAddClick(prefilledData);
  };

  // Handle clicking on existing absence
  const handleAbsenceClick = (absence) => {
    if (!onEditClick) return;
    onEditClick(absence);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Generate calendar days
  const calendarDays = [];
  const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

  for (let i = 0; i < totalSlots; i++) {
    const dayNumber = i - startingDayOfWeek + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const date = new Date(year, month, dayNumber);
      const dayAbsences = getAbsencesForDate(date);
      calendarDays.push({ date, dayNumber, absences: dayAbsences });
    } else {
      calendarDays.push({ date: null, dayNumber: null, absences: [] });
    }
  }

  // Month/Year display
  const monthNames = [
    t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'),
    t('calendar.months.april'), t('calendar.months.may'), t('calendar.months.june'),
    t('calendar.months.july'), t('calendar.months.august'), t('calendar.months.september'),
    t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
  ];
  const monthYearDisplay = `${monthNames[month]} ${year}`;

  // Day names - Dynamic based on week start preference
  const weekStartsOn = getWeekStartsOn();
  const dayNames = weekStartsOn === 1
    ? [
        t('calendar.days.monday'), t('calendar.days.tuesday'), t('calendar.days.wednesday'),
        t('calendar.days.thursday'), t('calendar.days.friday'), t('calendar.days.saturday'),
        t('calendar.days.sunday')
      ]  // Start with Monday
    : [
        t('calendar.days.sunday'), t('calendar.days.monday'), t('calendar.days.tuesday'),
        t('calendar.days.wednesday'), t('calendar.days.thursday'), t('calendar.days.friday'),
        t('calendar.days.saturday')
      ]; // Start with Sunday

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('calendar.title')}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            aria-label={t('calendar.previousMonth')}
          >
            ◀
          </button>
          <span className="text-lg font-semibold text-gray-700 min-w-[150px] text-center">
            {monthYearDisplay}
          </span>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            aria-label={t('calendar.nextMonth')}
          >
            ▶
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
          >
            {t('calendar.today')}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
          {dayNames.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isToday =
              day.date &&
              day.date.toDateString() === new Date().toDateString();
            const isWeekend = day.date && (day.date.getDay() === 0 || day.date.getDay() === 6);

            return (
              <div
                key={index}
                className={`min-h-[100px] border-r border-b border-gray-200 p-2 ${
                  !day.date ? 'bg-gray-50' : isWeekend ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day.date && (
                  <>
                    <div className="flex justify-between items-start mb-1">
                      <div
                        className={`text-sm font-medium ${
                          isToday
                            ? 'text-blue-600 font-bold'
                            : 'text-gray-700'
                        }`}
                      >
                        {day.dayNumber}
                      </div>
                      {onAddClick && !isWeekend && (
                        <button
                          onClick={() => handleAddAbsence(day.date)}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full w-5 h-5 flex items-center justify-center transition-colors text-lg font-bold leading-none"
                          title={t('calendar.addAbsence')}
                          aria-label={t('calendar.addAbsence')}
                        >
                          +
                        </button>
                      )}
                    </div>

                    {/* Absences for this day - Skip weekends (Saturday=6, Sunday=0) */}
                    <div className="space-y-1">
                      {(day.date.getDay() !== 0 && day.date.getDay() !== 6) && day.absences.map((absence) => {
                        const color = getTypeColor(absence.absence_type);
                        const displayName = absence.employee_fullname || absence.service_account;
                        const isHalfDay = absence.is_half_day;

                        return (
                          <div
                            key={absence.id}
                            className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden"
                            style={{
                              backgroundColor: isHalfDay ? 'transparent' : color,
                              color: isHalfDay ? '#374151' : '#fff',
                              border: isHalfDay ? `2px solid ${color}` : 'none'
                            }}
                            onClick={() => handleAbsenceClick(absence)}
                            onMouseEnter={(e) => handleAbsenceHover(absence, e)}
                            onMouseLeave={handleAbsenceLeave}
                            title={`${displayName} - ${absence.absence_type}${isHalfDay ? ' (Halber Tag)' : ''}`}
                          >
                            {isHalfDay && (
                              <div
                                className="absolute inset-0 w-1/2"
                                style={{ backgroundColor: color, opacity: 0.3 }}
                              />
                            )}
                            <div className="truncate font-medium relative z-10">
                              {displayName}{isHalfDay ? ' (½)' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="text-sm font-medium text-gray-700">{t('calendar.legend')}:</div>
        {absenceTypes.map((type) => (
          <div key={type.value || type.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: type.color || '#3B82F6' }}
            />
            <span className="text-sm text-gray-600">
              {t(`absence.${type.name || type.value}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredAbsence && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <div className="font-bold mb-1">
            {hoveredAbsence.employee_fullname || hoveredAbsence.service_account}
          </div>
          <div className="text-gray-300 text-xs mb-1">
            {hoveredAbsence.service_account}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getTypeColor(hoveredAbsence.absence_type) }}
            />
            <span>{hoveredAbsence.absence_type}</span>
          </div>
          <div className="text-gray-400 text-xs">
            {hoveredAbsence.start_date} bis {hoveredAbsence.end_date}
          </div>
          {hoveredAbsence.is_half_day && (
            <div className="text-yellow-300 text-xs mt-1 font-medium">
              ½ Halber Tag
            </div>
          )}
        </div>
      )}
    </div>
  );
}
