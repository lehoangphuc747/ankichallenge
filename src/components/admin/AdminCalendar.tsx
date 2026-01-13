import React, { useState, useEffect } from 'react';

interface AdminCalendarProps {
    initialDate?: string;
}

export default function AdminCalendar({ initialDate }: AdminCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(
        initialDate ? new Date(initialDate) : new Date()
    );
    const [isOpen, setIsOpen] = useState(false);

    // Helper to format date as YYYY-MM-DD for consistency with app logic
    const formatDateForApp = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Helper for UI display (dd/mm/yyyy)
    const formatDateForDisplay = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Handle date change from UI
    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate);
        setIsOpen(false);

        // Dispatch custom event for Astro/Vanilla JS to catch
        const event = new CustomEvent('admin-date-change', {
            detail: { date: formatDateForApp(newDate) }
        });
        document.dispatchEvent(event);
    };

    const shiftDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        handleDateChange(newDate);
    };

    // Listen for updates from outside (e.g. initial load or other scripts)
    useEffect(() => {
        const handleRemoteUpdate = (e: CustomEvent) => {
            if (e.detail?.date) {
                setSelectedDate(new Date(e.detail.date));
            }
        };

        document.addEventListener('admin-date-update' as any, handleRemoteUpdate);
        return () => {
            document.removeEventListener('admin-date-update' as any, handleRemoteUpdate);
        };
    }, []);

    // ⌨️ Keyboard shortcuts: Arrow Left/Right to navigate dates
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if not typing in an input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                shiftDate(-1); // Yesterday
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                shiftDate(1); // Tomorrow
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedDate]); // Include selectedDate in deps so shiftDate has latest state

    return (
        <div className="relative font-sans">
            <div className="flex items-center justify-center gap-3">
                {/* Prev Button */}
                <button
                    onClick={() => shiftDate(-1)}
                    className="w-12 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center text-xl shadow-sm hover:shadow active:scale-95"
                    title="Ngày trước"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                {/* Date Display (Click to open calendar) */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white border-2 border-indigo-100 rounded-xl px-6 py-2.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center min-w-[180px] group"
                    >
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-0.5 group-hover:text-indigo-600">
                            {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}
                        </span>
                        <span className="text-2xl font-bold text-gray-800 tabular-nums">
                            {formatDateForDisplay(selectedDate)}
                        </span>
                    </button>

                    {/* Calendar Popup */}
                    {isOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="mb-4 flex justify-between items-center">
                                <span className="font-bold text-lg capitalize text-gray-800">
                                    {selectedDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                                >
                                    Hôm nay
                                </button>
                            </div>

                            {/* Simple Custom Calendar Grid Implementation for dependency-free lightweight usage */}
                            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="text-gray-400 font-medium text-xs py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm">
                                {(() => {
                                    const days = [];
                                    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                                    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                                    const startOffset = firstDayOfMonth.getDay();
                                    const daysInMonth = lastDayOfMonth.getDate();

                                    // Empty slots for previous month
                                    for (let i = 0; i < startOffset; i++) {
                                        days.push(<div key={`empty-${i}`} className="p-2"></div>);
                                    }

                                    // Days
                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
                                        const isToday = formatDateForApp(date) === formatDateForApp(new Date());
                                        const isSelected = d === selectedDate.getDate();

                                        days.push(
                                            <button
                                                key={d}
                                                onClick={() => handleDateChange(date)}
                                                className={`
                                        w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors
                                        ${isSelected
                                                        ? 'bg-indigo-600 text-white font-bold shadow-md'
                                                        : isToday
                                                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }
                                    `}
                                            >
                                                {d}
                                            </button>
                                        );
                                    }
                                    return days;
                                })()}
                            </div>

                            {/* Month Navigation within Popup */}
                            <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)); }}
                                    className="text-gray-500 hover:text-indigo-600 px-2"
                                >
                                    ◀ Tháng trước
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)); }}
                                    className="text-gray-500 hover:text-indigo-600 px-2"
                                >
                                    Tháng sau ▶
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Backdrop to close */}
                    {isOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    )}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => shiftDate(1)}
                    className="w-12 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center text-xl shadow-sm hover:shadow active:scale-95"
                    title="Ngày sau"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
}
