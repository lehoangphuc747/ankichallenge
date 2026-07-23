import React, { useState, useEffect, useRef } from 'react';

interface DatePickerWithSearchProps {
    initialDate?: string;
    challengeStartDate?: string;
}

export default function DatePickerWithSearch({ initialDate, challengeStartDate = '2026-04-10' }: DatePickerWithSearchProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(
        initialDate ? new Date(initialDate) : new Date()
    );
    const [startDateStr, setStartDateStr] = useState<string>(challengeStartDate);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Read active challenge start date from DOM or state if available
    useEffect(() => {
        const updateStartDate = () => {
            const selector = document.getElementById('challengeSelect') as HTMLSelectElement | null;
            if (selector && selector.value) {
                if (selector.value === '1') setStartDateStr('2025-09-03');
                else if (selector.value === '2') setStartDateStr('2025-12-22');
                else if (selector.value === '3') setStartDateStr('2026-04-10');
            }
        };

        updateStartDate();
        const selector = document.getElementById('challengeSelect');
        if (selector) {
            selector.addEventListener('change', updateStartDate);
            return () => selector.removeEventListener('change', updateStartDate);
        }
    }, []);

    // Format date YYYY-MM-DD for app logic
    const formatDateForApp = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Format for display DD/MM/YYYY
    const formatDateForDisplay = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Calculate Day number from challenge start date
    const calculateDayNumber = (date: Date, startStr: string) => {
        const start = new Date(startStr);
        // Reset hours to start of day for clean calculation
        const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const d2 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const diffTime = d1.getTime() - d2.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    // Handle selecting a new date
    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate);
        setIsOpen(false);
        setSearchTerm('');

        // Dispatch custom event for Astro page script
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

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // External sync
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

    // Keyboard navigation (ArrowLeft / ArrowRight)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                shiftDate(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                shiftDate(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedDate]);

    // Generate search quick suggestions based on search term (supports DAY 99, 98, date DD/MM/YYYY)
    const getSearchResults = () => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.trim().toLowerCase();
        const results: { date: Date; label: string; badge?: string }[] = [];

        // 1. Check for DAY search (vd: "DAY 99", "day 98", "d99", "d 99", "99")
        const dayMatch = term.match(/^(?:day|d)?\s*(\d{1,3})$/i);
        if (dayMatch) {
            const dayNum = parseInt(dayMatch[1], 10);
            if (dayNum >= 1 && dayNum <= 200) {
                const start = new Date(startDateStr);
                const dayDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (dayNum - 1));
                results.push({
                    date: dayDate,
                    label: `DAY ${dayNum} ➔ ${formatDateForDisplay(dayDate)} (${dayDate.toLocaleDateString('vi-VN', { weekday: 'short' })})`,
                    badge: `DAY ${dayNum}`
                });
            }
        }

        // 2. Try parsing full date DD/MM/YYYY or DD/MM
        const parts = term.split(/[\/\-\.]/);
        if (parts.length >= 2) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parts[2] ? parseInt(parts[2], 10) : selectedDate.getFullYear();

            if (!isNaN(day) && !isNaN(month) && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
                const parsedDate = new Date(year, month, day);
                if (!isNaN(parsedDate.getTime())) {
                    const dayNum = calculateDayNumber(parsedDate, startDateStr);
                    results.push({
                        date: parsedDate,
                        label: `${formatDateForDisplay(parsedDate)} (${parsedDate.toLocaleDateString('vi-VN', { weekday: 'short' })}) - DAY ${dayNum}`,
                        badge: `DAY ${dayNum}`
                    });
                }
            }
        }

        // 3. Search days in current month matching term
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dStr = String(d).padStart(2, '0');
            const fullStr = `${dStr}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;
            if (dStr.includes(term) || fullStr.includes(term)) {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
                const dayNum = calculateDayNumber(date, startDateStr);
                if (!results.some(r => formatDateForApp(r.date) === formatDateForApp(date))) {
                    results.push({
                        date,
                        label: `Ngày ${dStr}/${String(selectedDate.getMonth() + 1).padStart(2, '0')} (${date.toLocaleDateString('vi-VN', { weekday: 'short' })}) - DAY ${dayNum}`,
                        badge: `DAY ${dayNum}`
                    });
                }
            }
        }

        return results.slice(0, 5); // Return top 5 suggestions
    };

    const searchResults = getSearchResults();
    const currentDayNumber = calculateDayNumber(selectedDate, startDateStr);

    return (
        <div className="relative font-sans inline-block text-left">
            <div className="flex items-center justify-center gap-2">
                {/* Button Lùi ngày */}
                <button
                    onClick={() => shiftDate(-1)}
                    className="w-10 h-10 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center text-lg shadow-sm active:scale-95 cursor-pointer"
                    title="Ngày trước (Mũi tên trái ←)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                {/* Display & Open Popup Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <span className="text-[9px] font-black uppercase leading-none">DAY</span>
                            <span className="text-xs font-black leading-none mt-0.5">{currentDayNumber}</span>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider leading-none">
                                DAY {currentDayNumber} • {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}
                            </span>
                            <span className="text-lg font-black text-gray-800 tabular-nums leading-tight mt-0.5">
                                {formatDateForDisplay(selectedDate)}
                            </span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Calendar & Search Popup */}
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 p-3.5 bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Mini Search Input */}
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400 text-xs">
                                    🔍
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchResults.length > 0) {
                                            handleDateChange(searchResults[0].date);
                                        }
                                    }}
                                    placeholder="Tìm DAY (VD: DAY 99, 98) hoặc Ngày (24/07)..."
                                    className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Mini Search Results List if user is searching */}
                            {searchTerm.trim() ? (
                                <div className="mb-3 space-y-1 max-h-[180px] overflow-y-auto pr-1">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase px-1 mb-1">Kết quả tìm kiếm ({searchResults.length}):</div>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((res, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleDateChange(res.date)}
                                                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-600 hover:text-white text-indigo-950 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer"
                                            >
                                                <span className="truncate pr-2">{res.label}</span>
                                                <span className="text-[10px] bg-indigo-200/60 text-indigo-800 group-hover:bg-white group-hover:text-indigo-700 px-1.5 py-0.5 rounded font-black shrink-0">
                                                    Chọn ↵
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-400 text-center py-2 italic">Không tìm thấy ngày hoặc DAY tương ứng</div>
                                    )}
                                </div>
                            ) : null}

                            {/* Month Header & Quick Today Button */}
                            <div className="mb-3 flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-sm capitalize text-gray-800">
                                        {selectedDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                                        DAY {currentDayNumber}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDateChange(new Date())}
                                    className="text-[11px] font-extrabold text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer"
                                >
                                    Hôm nay
                                </button>
                            </div>

                            {/* Calendar Days Header */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1.5 font-bold text-gray-400">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="py-0.5">{d}</div>
                                ))}
                            </div>

                            {/* Calendar Days Grid */}
                            <div className="grid grid-cols-7 gap-1 text-xs">
                                {(() => {
                                    const days = [];
                                    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                                    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                                    const startOffset = firstDayOfMonth.getDay();
                                    const daysInMonth = lastDayOfMonth.getDate();

                                    // Empty padding slots
                                    for (let i = 0; i < startOffset; i++) {
                                        days.push(<div key={`empty-${i}`} className="p-1.5"></div>);
                                    }

                                    // Days list
                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
                                        const isToday = formatDateForApp(date) === formatDateForApp(new Date());
                                        const isSelected = d === selectedDate.getDate();

                                        days.push(
                                            <button
                                                key={d}
                                                onClick={() => handleDateChange(date)}
                                                className={`
                                                    w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer font-bold text-xs
                                                    ${isSelected
                                                        ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                        : isToday
                                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                                                            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
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

                            {/* Navigation Footers */}
                            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)); }}
                                    className="text-gray-500 font-bold hover:text-indigo-600 px-1 transition-colors cursor-pointer"
                                >
                                    ◀ Tháng trước
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)); }}
                                    className="text-gray-500 font-bold hover:text-indigo-600 px-1 transition-colors cursor-pointer"
                                >
                                    Tháng sau ▶
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Backdrop to dismiss on outside click */}
                    {isOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    )}
                </div>

                {/* Button Tiến ngày */}
                <button
                    onClick={() => shiftDate(1)}
                    className="w-10 h-10 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center text-lg shadow-sm active:scale-95 cursor-pointer"
                    title="Ngày sau (Mũi tên phải →)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
}
