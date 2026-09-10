import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Load stats data
with open('src/data/ac11_stats.json', 'r', encoding='utf-8') as f:
    stats = json.load(f)

kpi = stats['kpi']
daily = stats['dailySummary']
top_users = stats['userRankings'][:10]
categories = stats['deckCategories']

# Set font family
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Segoe UI', 'Helvetica']

fig = plt.figure(figsize=(16, 11), facecolor='#FAF9F5')

# Create a background full-canvas axis for text/decorations and turn off ticks
ax_bg = fig.add_axes([0, 0, 1, 1], facecolor='none')
ax_bg.axis('off')

# Title & Subtitle
day_range_str = f"{daily[0]['dayLabel'].upper()} – {daily[-1]['dayLabel'].upper()}" if len(daily) > 0 else "AC11"
ax_bg.text(0.06, 0.955, f"ANKI CHALLENGE 11  •  {day_range_str}", fontsize=11, fontweight='bold', color='#CC785C')
ax_bg.text(0.06, 0.915, "Thống Kê & Bảng Xếp Hạng Check-in Thử Thách", fontsize=23, fontweight='bold', color='#2D2A26')
ax_bg.text(0.06, 0.885, f"Dữ liệu trích xuất từ thị giác (Gemini Vision OCR) trên {kpi['totalCheckins']} lượt check-in của {kpi['uniqueUsers']} thành viên", fontsize=11.5, color='#736E65')

# KPI Box drawing helper
def draw_kpi(x, y, w, h, label, val, sub, bar_color):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.015,rounding_size=0.012",
                                  facecolor='#FFFFFF', edgecolor='#E8E5DE', linewidth=1, transform=ax_bg.transAxes)
    ax_bg.add_patch(rect)
    # top accent strip
    top_bar = patches.Rectangle((x + 0.005, y + h - 0.004), w - 0.01, 0.004, facecolor=bar_color, transform=ax_bg.transAxes)
    ax_bg.add_patch(top_bar)
    ax_bg.text(x + 0.015, y + h - 0.024, label.upper(), fontsize=9, fontweight='bold', color='#736E65')
    ax_bg.text(x + 0.015, y + 0.028, val, fontsize=19, fontweight='bold', color='#2D2A26')
    ax_bg.text(x + 0.015, y + 0.010, sub, fontsize=8.5, color='#736E65')

avg_daily_checkin = round(kpi['totalCheckins'] / len(daily), 1) if len(daily) > 0 else 0
draw_kpi(0.06, 0.77, 0.20, 0.088, "Tổng số thẻ học", f"{kpi['totalCards']:,}".replace(',', '.'), f"{len(daily)} ngày liên tục", '#CC785C')
draw_kpi(0.28, 0.77, 0.20, 0.088, "Tổng lượt check-in", f"{kpi['totalCheckins']} lượt", f"Trung bình {avg_daily_checkin} lượt/ngày", '#4A7C59')
draw_kpi(0.50, 0.77, 0.20, 0.088, "Kỷ lục 1 ngày", f"{kpi['maxSingleDayCards']:,}".replace(',', '.') + " thẻ", f"Bởi {kpi['topSingleUser']}", '#D97706')
draw_kpi(0.72, 0.77, 0.22, 0.088, "Top 1 Tích Luỹ", f"{kpi['topAggregateCards']:,}".replace(',', '.') + " thẻ", f"Bởi {kpi['topAggregateUser']}", '#2B4C7E')

# Subplot 1: Cards Per Day
ax1 = fig.add_axes([0.06, 0.43, 0.41, 0.28], facecolor='#FFFFFF')
labels = [d['dayLabel'] for d in daily]
card_vals = [d['totalCards'] for d in daily]
bars = ax1.bar(labels, card_vals, color='#CC785C', width=0.52, zorder=3)
ax1.grid(axis='y', color='#F0EDE6', linestyle='--', zorder=0)
ax1.set_title("Tổng Thẻ Ôn Tập Theo Ngày", fontsize=13, fontweight='bold', color='#2D2A26', pad=12, loc='left')
for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 160, f"{int(yval):,}".replace(',', '.'), ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#2D2A26')
ax1.set_ylim(0, max(card_vals) * 1.15)
ax1.tick_params(colors='#736E65', labelsize=9)
for spine in ax1.spines.values():
    spine.set_color('#E8E5DE')

# Subplot 2: Users Per Day
ax2 = fig.add_axes([0.53, 0.43, 0.41, 0.28], facecolor='#FFFFFF')
user_vals = [d['totalUsers'] for d in daily]
ax2.plot(labels, user_vals, color='#4A7C59', linewidth=2.5, marker='o', markersize=6.5, markerfacecolor='#4A7C59', markeredgecolor='#FFFFFF', markeredgewidth=1.5, zorder=3)
ax2.fill_between(labels, user_vals, color='#4A7C59', alpha=0.10, zorder=2)
ax2.grid(axis='y', color='#F0EDE6', linestyle='--', zorder=0)
ax2.set_title("Số Lượng Thành Viên Check-in Mỗi Ngày", fontsize=13, fontweight='bold', color='#2D2A26', pad=12, loc='left')
for i, val in enumerate(user_vals):
    ax2.text(i, val + 0.8, f"{val} người", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#4A7C59')
ax2.set_ylim(0, 36)
ax2.tick_params(colors='#736E65', labelsize=9)
for spine in ax2.spines.values():
    spine.set_color('#E8E5DE')

# Subplot 3: Top Users Horizontal Bar
ax3 = fig.add_axes([0.06, 0.08, 0.41, 0.28], facecolor='#FFFFFF')
top_names = [u['user'] if len(u['user']) <= 12 else u['user'][:11] + '…' for u in reversed(top_users)]
top_vals = [u['totalCards'] for u in reversed(top_users)]
bars_h = ax3.barh(top_names, top_vals, color='#E8A55A', height=0.58, zorder=3)
ax3.grid(axis='x', color='#F0EDE6', linestyle='--', zorder=0)
ax3.set_title(f"Top 10 Cày Thẻ Tích Luỹ {daily[0]['dayLabel']} – {daily[-1]['dayLabel']}", fontsize=13, fontweight='bold', color='#2D2A26', pad=12, loc='left')
for bar in bars_h:
    xval = bar.get_width()
    ax3.text(xval + 140, bar.get_y() + bar.get_height()/2.0, f"{int(xval):,}".replace(',', '.'), ha='left', va='center', fontsize=8, fontweight='bold', color='#2D2A26')
ax3.set_xlim(0, max(top_vals) * 1.22)
ax3.tick_params(colors='#736E65', labelsize=8.5)
for spine in ax3.spines.values():
    spine.set_color('#E8E5DE')

# Subplot 4: Categories Doughnut Chart
ax4 = fig.add_axes([0.53, 0.08, 0.41, 0.28], facecolor='#FFFFFF')
cat_labels = ['Ngoại ngữ (Nhật/Trung/Hàn)', 'Tiếng Anh (IELTS/TOEIC)', 'Y / Dược / Khoa học', 'Khác']
cat_vals = [categories['japanese'], categories['english'], categories['medical'], categories['other']]
cat_colors = ['#CC785C', '#2B4C7E', '#4A7C59', '#8E8B82']
wedges, texts, autotexts = ax4.pie(cat_vals, labels=None, autopct='%1.1f%%', pctdistance=0.75,
                                  colors=cat_colors, startangle=140,
                                  wedgeprops=dict(width=0.45, edgecolor='#FFFFFF', linewidth=2))
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontsize(8.5)
    autotext.set_fontweight('bold')
ax4.set_title("Phân Bổ Lĩnh Vực Học Tập (Theo Bộ Thẻ)", fontsize=13, fontweight='bold', color='#2D2A26', pad=12, loc='left')
ax4.legend(wedges, cat_labels, loc="center left", bbox_to_anchor=(0.78, 0.5), fontsize=8.5, frameon=False)

# Footer note
ax_bg.text(0.5, 0.02, "Anki Challenge Vietnam  •  Báo Cáo Tự Động  •  Gemini Vision OCR Verification", ha='center', fontsize=9, color='#8E8B82')

# Save figure with high DPI
plt.savefig('anki_challenge_d1_d10_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
plt.savefig('public/anki_challenge_d1_d10_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
plt.savefig('anki_challenge_day1_day10_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
plt.savefig('public/anki_challenge_day1_day10_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
plt.savefig('anki_challenge_d1_d9_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
plt.savefig('public/anki_challenge_d1_d9_chart.jpg', dpi=220, facecolor='#FAF9F5', edgecolor='none')
print("Successfully generated clean anki_challenge_d1_d10_chart.jpg!")
