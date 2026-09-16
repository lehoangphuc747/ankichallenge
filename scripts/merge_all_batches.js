import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

// Data from Batch 1
const batch1Results = {
  "day6": {
    "567311737464946703": {
      "user": "Tuong Vie",
      "cards": 0,
      "minutes": null,
      "streak": 6,
      "deck": null,
      "detail": "Anki Review Heatmap chuỗi 6 ngày xanh lá liên tục (01/09 - 06/09/2026), ô ngày Chủ Nhật 06/09 có viền đen được chọn, không có tooltip số thẻ cụ thể",
      "image_content_desc": "Ảnh crop Anki Review Heatmap thu nhỏ hiển thị 1 cột dọc 6 ô màu xanh lá cây liên tiếp từ ngày 1 đến ngày 6 tháng 9 năm 2026, ô ngày 06/09 ở đáy cột được viền đen chọn"
    },
    "534726411521490956": {
      "user": "Dan1elP",
      "cards": 129,
      "minutes": null,
      "streak": 9,
      "deck": null,
      "detail": "129 cards reviewed on Sunday September 6, 2026 · Daily average: 84 cards · Longest streak: 116 days · Current streak: 9 days",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap nền tối: tooltip hiển thị '129 cards reviewed on Sunday September 6, 2026'"
    }
  },
  "day10": {
    "894143041298894859": {
      "user": "Hhoopj",
      "cards": 248,
      "minutes": null,
      "streak": 10,
      "deck": null,
      "detail": "248 cards reviewed on Thursday September 10, 2026 · Days learned: 40%",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap tông cam/đỏ: tooltip hiển thị '248 cards reviewed on Thursday September 10, 2026'"
    }
  },
  "day11": {
    "894143041298894859": {
      "user": "Hhoopj",
      "cards": 320,
      "minutes": null,
      "streak": 11,
      "deck": null,
      "detail": "320 cards reviewed on Friday September 11, 2026 · Days learned: 40%",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap tông cam/đỏ: tooltip hiển thị '320 cards reviewed on Friday September 11, 2026'"
    }
  },
  "day12": {
    "963399002466955314": {
      "user": "Nguyen",
      "cards": 25,
      "minutes": null,
      "streak": 190,
      "deck": null,
      "detail": "25 cards reviewed on Saturday September 12, 2026 · Current streak: 190 days · Longest streak: 190 days",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap nền sáng: tooltip hiển thị '25 cards reviewed on Saturday September 12, 2026'"
    },
    "894143041298894859": {
      "user": "Hhoopj",
      "cards": 300,
      "minutes": null,
      "streak": 12,
      "deck": null,
      "detail": "300 cards reviewed on Saturday September 12, 2026 · Daily average: 325 cards · Days learned: 40%",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap tông cam/đỏ: tooltip hiển thị '300 cards reviewed on Saturday September 12, 2026'"
    }
  },
  "day13": {
    "963399002466955314": {
      "user": "Nguyen",
      "cards": 36,
      "minutes": null,
      "streak": 190,
      "deck": null,
      "detail": "36 cards reviewed on Sunday September 13, 2026 · Current streak: 190 days · Longest streak: 190 days",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap: tooltip hiển thị '36 cards reviewed on Sunday September 13, 2026'"
    },
    "1446702112347127869": {
      "user": "nothinn",
      "cards": 13,
      "minutes": 2,
      "streak": 4,
      "deck": null,
      "detail": "13 cards reviewed (thanh trạng thái 13 rev trong 00h 02m, tự khai 20 thẻ / 3 phút) · Current streak: 4 days",
      "image_content_desc": "Ảnh chụp màn hình máy Mac ứng dụng Anki: thanh công cụ trên hiển thị '13 rev (10sec) | 00h 02m | 4d'"
    },
    "790859151734996992": {
      "user": "TheMink",
      "cards": 257,
      "minutes": 50,
      "streak": 13,
      "deck": null,
      "detail": "257 cards reviewed on Sunday September 13, 2026 (tự khai 50 phút) · streak 13",
      "image_content_desc": "Ảnh chụp màn hình tooltip Anki Review Heatmap: '257 cards reviewed on Sunday September 13, 2026'"
    },
    "534726411521490956": {
      "user": "Dan1elP",
      "cards": 44,
      "minutes": null,
      "streak": 14,
      "deck": null,
      "detail": "Sunday, September 13, 2026: 44 reviews · AnkiDroid heatmap",
      "image_content_desc": "Ảnh chụp màn hình AnkiDroid: 'Sunday, September 13, 2026' kèm '44 reviews'"
    },
    "894143041298894859": {
      "user": "Hhoopj",
      "cards": 316,
      "minutes": null,
      "streak": 13,
      "deck": null,
      "detail": "316 cards reviewed on Sunday September 13, 2026 · Daily average: 325 cards · Days learned: 40%",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap tông cam/đỏ: tooltip hiển thị '316 cards reviewed on Sunday September 13, 2026'"
    }
  }
};

// Data from Batch 2
const batch2Results = {
  "day14": {
    "1503052423390957772": {
      "user": "Danneee05",
      "cards": 1258,
      "minutes": 30.45,
      "streak": 38,
      "deck": null,
      "detail": "1.258 thẻ ôn tập trong 30,45 phút (1,45s/thẻ) ngày 14/09/2026, longest streak 38 days",
      "image_content_desc": "Ảnh chụp màn hình laptop Anki Heatmap hiển thị đã học 1258 thẻ trong 30,45 phút vào thứ Hai 14/09/2026."
    },
    "705779271603322911": {
      "user": "Minh may mắn",
      "cards": 122,
      "minutes": 38.2,
      "streak": 38,
      "deck": null,
      "detail": "122 thẻ trong 38,2 phút (pace 18,8s/card, retention 96%), streak 38 ngày",
      "image_content_desc": "Bảng thống kê Anki dashboard retro 'Die Trying!!!' với 122 cards, 38.2 min, streak 38 ngày."
    },
    "711153532392308767": {
      "user": "Alan Le",
      "cards": 116,
      "minutes": 24.53,
      "streak": null,
      "deck": null,
      "detail": "116 cards studied in 24.53 minutes (Learn: 69, Review: 29, Relearn: 18)",
      "image_content_desc": "Thống kê Anki Today dark mode hiển thị đã học 116 cards trong 24.53 phút và biểu đồ Future Due."
    },
    "883936057878536222": {
      "user": "Linh",
      "cards": 134,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "134 cards reviewed on Monday September 14, 2026",
      "image_content_desc": "Ảnh crop tooltip Anki Heatmap hiển thị 134 cards reviewed on Monday September 14, 2026."
    },
    "1393440400038957157": {
      "user": "Serene Flow",
      "cards": 141,
      "minutes": 15.95,
      "streak": null,
      "deck": null,
      "detail": "141 cards studied in 15.95 minutes (Review: 134, Relearn: 7, Again: 8)",
      "image_content_desc": "Bảng thống kê Anki Statistics mục Today hiển thị 141 cards trong 15.95 phút."
    },
    "963399002466955314": {
      "user": "Nguyen",
      "cards": 21,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "21 cards reviewed on Monday September 14, 2026",
      "image_content_desc": "Tooltip Anki Heatmap hiển thị 21 cards reviewed ngày 14/09/2026."
    },
    "567311737464946703": {
      "user": "Tuong Vie",
      "cards": 1,
      "minutes": null,
      "streak": 14,
      "deck": null,
      "detail": "Review Heatmap: Ô ngày 14/09 được chọn có viền đen màu xanh lá nhạt, hoàn thành chuỗi 14 ngày liên tục",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap năm 2026 với ô ngày 14/09 được highlight xanh lá nhạt viền đen, duy trì streak 14 ngày."
    },
    "438960335983083530": {
      "user": "Gai Hàn TOPIK 6",
      "cards": 879,
      "minutes": 61.79,
      "streak": null,
      "deck": "New General Service List 1.2",
      "detail": "879 cards studied in 61.79 minutes (Learn: 620, Review: 228, Relearn: 31) · Deck: New General Service List 1.2",
      "image_content_desc": "Màn hình AnkiDroid Statistics giao diện trắng hiển thị 879 cards trong 61.79 phút, deck New General Service List 1.2."
    },
    "616159212980011018": {
      "user": "Aleye",
      "cards": 756,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "756 thẻ ôn tập vào Thứ Hai, 14 tháng 9, 2026",
      "image_content_desc": "Tooltip Anki Review Heatmap giao diện tiếng Việt hiển thị 756 thẻ ôn tập ngày 14/09/2026."
    },
    "928998165770825728": {
      "user": "linhkhanhahi",
      "cards": 45,
      "minutes": 5.84,
      "streak": 7,
      "deck": null,
      "detail": "Đã học 45 thẻ trong 5,84 phút (7,79s/thẻ), Current streak: 7 days, Longest streak: 122 days",
      "image_content_desc": "Giao diện Anki nền Shin-chan hoạt hình hiển thị đã học 45 thẻ trong 5,84 phút, streak 7 ngày."
    },
    "870187268692906014": {
      "user": "Lê Đức Tuấn",
      "cards": 366,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "366 reviews on Monday, September 14, 2026",
      "image_content_desc": "Ảnh chụp cận cảnh tooltip Review Heatmap dark mode hiển thị 366 reviews ngày 14/09/2026."
    },
    "534726411521490956": {
      "user": "Dan1elP",
      "cards": 170,
      "minutes": 10.01,
      "streak": null,
      "deck": null,
      "detail": "170 cards studied in 10.01 minutes (Learn: 156, Review: 10, Relearn: 4)",
      "image_content_desc": "Màn hình Anki Statistics phần Today hiển thị 170 thẻ đã học trong 10.01 phút."
    },
    "894143041298894859": {
      "user": "Hhoopj",
      "cards": 45,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "45 cards reviewed on Monday September 14, 2026",
      "image_content_desc": "Tooltip Review Heatmap tông cam đỏ hiển thị 45 cards reviewed ngày 14/09/2026."
    },
    "1465133555574243348": {
      "user": "Gai con HaVy",
      "cards": 93,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "93 thẻ ôn tập vào Thứ Hai, 14/09/2026",
      "image_content_desc": "Giao diện Thống kê AnkiDroid mục Lịch hiển thị 93 thẻ ôn tập ngày 14/09/2026."
    },
    "1424374539177164861": {
      "user": "TaiTran",
      "cards": 226,
      "minutes": null,
      "streak": 522,
      "deck": null,
      "detail": "226 reviews on Monday, September 14, 2026, streak 522 days",
      "image_content_desc": "Giao diện Anki Activity Heatmap nền fantasy rừng núi hiển thị 226 reviews ngày 14/09/2026 và chuỗi streak 522 ngày."
    },
    "790859151734996992": {
      "user": "TheMink",
      "cards": 174,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "Reviewed: 174 cards on Monday September 14, 2026",
      "image_content_desc": "Tooltip Anki Heatmap hiển thị Reviewed: 174 cards ngày 14/09/2026."
    }
  }
};

// Data from Batch 3
const batch3Results = {
  "day15": {
    "1446504123657748651": {
      "user": "Tram",
      "cards": 234,
      "minutes": 12.74,
      "streak": null,
      "deck": null,
      "detail": "Đã học 234 thẻ trong 12,74 phút hôm nay (3,27 giây/thẻ)",
      "image_content_desc": "Ảnh chụp thanh trạng thái Anki tiếng Việt trên nền đá sỏi: 'Đã học 234 thẻ trong 12,74 phút hôm nay (3,27giây/thẻ)'"
    },
    "616159212980011018": {
      "user": "Aleye",
      "cards": 144,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "Lịch 2026 heatmap tooltip: Thứ Ba, 15 tháng 9, 2026 - 144 thẻ ôn tập",
      "image_content_desc": "Ảnh chụp màn hình Anki Lịch 2026, tooltip hover vào ô ngày Thứ Ba, 15 tháng 9, 2026 hiển thị '144 thẻ ôn tập'"
    },
    "1410392551634112640": {
      "user": "Sunny",
      "cards": 2314,
      "minutes": 205.78,
      "streak": null,
      "deck": "Cambridge Vocabulary for IELTS",
      "detail": "Đã học 2.314 thẻ trong 205,78 phút hôm nay (5,34 giây/thẻ), Ôn: 749, Học lại: 1.565. Deck: Cambridge Vocabulary for IELTS. Xác nhận số thẻ chính xác 2314 thẻ!",
      "image_content_desc": "Ảnh chụp màn hình Anki iOS thống kê deck Cambridge Vocabulary for IELTS: 'Đã học 2.314 thẻ trong 205,78 phút hôm nay (5,34giây/thẻ)', Ôn 749 thẻ, Học lại 1565 thẻ. Số thẻ chuẩn xác 2314 thẻ."
    },
    "813419447150444554": {
      "user": "PhươngPhương",
      "cards": 166,
      "minutes": 28.89,
      "streak": null,
      "deck": null,
      "detail": "Đã học 166 thẻ trong 28,89 phút hôm nay (10,44 giây/thẻ)",
      "image_content_desc": "Ảnh chụp màn hình Anki: 'Đã học 166 thẻ trong 28,89 phút hôm nay (10,44giây/thẻ)'"
    },
    "1503052423390957772": {
      "user": "Danneee05",
      "cards": 1323,
      "minutes": 34.23,
      "streak": 38,
      "deck": null,
      "detail": "Đã học 1323 thẻ trong 34,23 phút hôm nay; Heatmap tooltip: 1,323 cards reviewed on Tuesday September 15, 2026, Longest streak: 38",
      "image_content_desc": "Ảnh chụp màn hình Anki máy tính: 'Đã học 1323 thẻ trong 34,23 phút hôm nay', tooltip Review Heatmap: 1,323 cards reviewed on Tuesday September 15, 2026"
    },
    "711153532392308767": {
      "user": "Alan Le",
      "cards": 125,
      "minutes": 19.86,
      "streak": null,
      "deck": "ZHVI HSK 3.0::HSK 1::Ghi nhớ Pinyin",
      "detail": "Đã học 125 thẻ trong 19,86 phút hôm nay (9,53 giây/thẻ), Học: 95, Ôn: 21, Học lại: 9. Deck: ZHVI HSK 3.0::HSK 1::Ghi nhớ Pinyin",
      "image_content_desc": "Ảnh chụp màn hình AnkiDroid dark mode: Đã học 125 thẻ trong 19,86 phút hôm nay, deck ZHVI HSK 3.0::HSK 1::Ghi nhớ Pinyin"
    },
    "705779271603322911": {
      "user": "Minh may mắn",
      "cards": 127,
      "minutes": 48.7,
      "streak": 39,
      "deck": null,
      "detail": "127 cards, 48.7 min, pace 23.0 s/card, retention 92%, 39 day streak (Add-on Die Trying!!!)",
      "image_content_desc": "Bảng thống kê Anki Addon 'Die Trying!!!': Studied 127 cards, Time 48.7 min, Pace 23.0 s/card, Retention 92%, 39 day streak"
    },
    "1465133555574243348": {
      "user": "Gai con HaVy",
      "cards": 147,
      "minutes": null,
      "streak": null,
      "deck": "1 Chinese (HSK9)::Từ vựng::HSK7-9::HSK7-9 (1-1000)",
      "detail": "Thứ Ba, 15 tháng 9, 2026: 147 thẻ ôn tập (Lịch/Heatmap). Deck: 1 Chinese (HSK9)::Từ vựng::HSK7-9::HSK7-9 (1-1000)",
      "image_content_desc": "Ảnh chụp AnkiDroid dark mode thống kê deck HSK 7-9 (1-1000), tooltip Lịch ngày Thứ Ba 15/09/2026 hiển thị 147 thẻ ôn tập"
    },
    "1375756159834783755": {
      "user": ".diffusion.",
      "cards": 484,
      "minutes": 63.1,
      "streak": 16,
      "deck": null,
      "detail": "Studied 484 cards in 1.05 hours today (63.1 phút, 7.83s/card), Streak: 16, Retention: 69.6% (Anki-Leaderboard user pktruong)",
      "image_content_desc": "Bảng xếp hạng Anki-Leaderboard: Studied 484 cards in 1.05 hours today, user pktruong hạng 462 với 484 reviews, 63.1 phút, streak 16"
    },
    "567311737464946703": {
      "user": "Tuong Vie",
      "cards": 1,
      "minutes": null,
      "streak": 15,
      "deck": null,
      "detail": "Review Heatmap: Ô ngày Thứ Ba 15/09/2026 được chọn (có viền đen, màu xanh lá nhạt thể hiện có học ôn tập), duy trì streak liên tục 15 ngày",
      "image_content_desc": "Ảnh chụp màn hình Anki Review Heatmap năm 2026 của Tuong Vie với ô ngày 15/09/2026 có viền đen màu xanh lá nhạt ghi nhận hoạt động học tập"
    },
    "1393440400038957157": {
      "user": "Serene Flow",
      "cards": 49,
      "minutes": 10.8,
      "streak": null,
      "deck": null,
      "detail": "Studied 49 cards in 10.8 minutes today (13.22s/card), Learn: 1, Review: 46, Relearn: 2, Mature: 32/32 (100%)",
      "image_content_desc": "Ảnh chụp màn hình Anki: Studied 49 cards in 10.8 minutes today (13.22s/card), Learn 1, Review 46, Relearn 2"
    },
    "928998165770825728": {
      "user": "linhkhanhahi",
      "cards": 88,
      "minutes": 24.84,
      "streak": 8,
      "deck": null,
      "detail": "Đã học 88 thẻ trong 24,84 phút hôm nay (16,94 giây/thẻ), Longest streak: 122 days, Current streak: 8 days",
      "image_content_desc": "Ảnh chụp màn hình Anki nền Shin-chan: Đã học 88 thẻ trong 24,84 phút hôm nay, Current streak: 8 days"
    },
    "438960335983083530": {
      "user": "Gai Hàn TOPIK 6",
      "cards": 516,
      "minutes": 53.36,
      "streak": null,
      "deck": "New General Service List 1.2",
      "detail": "Studied 516 cards in 53.36 minutes today (6.2s/card), Learn: 179, Review: 292, Relearn: 45. Deck: New General Service List 1.2",
      "image_content_desc": "Ảnh chụp AnkiDroid: Studied 516 cards in 53.36 minutes today (6.2s/card), Learn 179, Review 292, Relearn 45"
    },
    "790859151734996992": {
      "user": "TheMink",
      "cards": 397,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "397 cards reviewed on Tuesday September 15, 2026 (Heatmap tooltip)",
      "image_content_desc": "Tooltip Anki Review Heatmap: '397 cards reviewed on Tuesday September 15, 2026'"
    },
    "870187268692906014": {
      "user": "Lê Đức Tuấn",
      "cards": 313,
      "minutes": null,
      "streak": null,
      "deck": null,
      "detail": "Tuesday, September 15, 2026: 313 reviews (Heatmap tooltip)",
      "image_content_desc": "Tooltip Anki Review Heatmap: 'Tuesday, September 15, 2026 / 313 reviews'"
    }
  },
  "day16": {
    "1446504123657748651": {
      "user": "Tram",
      "cards": 215,
      "minutes": 8.12,
      "streak": null,
      "deck": null,
      "detail": "Đã học 215 thẻ trong 8,12 phút hôm nay (2,27 giây/thẻ)",
      "image_content_desc": "Ảnh chụp thanh trạng thái Anki tiếng Việt trên nền hoa văn đá: 'Đã học 215 thẻ trong 8,12 phút hôm nay (2,27giây/thẻ)'"
    }
  }
};

// Merge into ocr
function mergeBatch(batch) {
  for (const [dayKey, dayUsers] of Object.entries(batch)) {
    if (!ocr[dayKey]) ocr[dayKey] = {};
    for (const [uid, data] of Object.entries(dayUsers)) {
      ocr[dayKey][uid] = data;
    }
  }
}

mergeBatch(batch1Results);
mergeBatch(batch2Results);
mergeBatch(batch3Results);

ocr.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 16 checkin screenshots',
  lastUpdated: new Date().toISOString(),
  note: 'Cập nhật bổ sung toàn bộ check-in bù Day 6, Day 10-13, hoàn thiện Day 14 (20 người), Day 15 (15 người) và mở màn Day 16.'
};

fs.writeFileSync('discord-export/ocr-results.json', JSON.stringify(ocr, null, 2), 'utf8');
console.log('Successfully merged all 3 batches into discord-export/ocr-results.json!');
