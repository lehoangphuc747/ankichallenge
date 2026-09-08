import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/ac11_stats.json'), 'utf8'));
const ocrResults = JSON.parse(fs.readFileSync(path.join(__dirname, '../discord-export/ocr-results.json'), 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anki Challenge 11 — Báo Cáo & Bảng Xếp Hạng Check-in D1 - D7</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --bg: #FAF9F5;
      --card-bg: #FFFFFF;
      --text-main: #2D2A26;
      --text-muted: #736E65;
      --primary: #CC785C;
      --primary-hover: #BA6449;
      --primary-light: #FBF0EC;
      --forest: #4A7C59;
      --forest-light: #EBF3EE;
      --amber: #D97706;
      --amber-light: #FEF3C7;
      --navy: #2B4C7E;
      --border: #E8E5DE;
      --border-subtle: #F0EDE6;
      --shadow: 0 4px 20px -2px rgba(45, 42, 38, 0.05);
      --radius-lg: 18px;
      --radius-md: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg); color: var(--text-main); line-height: 1.6; padding: 32px 20px 80px; }
    .container { max-width: 1240px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
    .brand-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-light); color: var(--primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 12px; border: 1px solid rgba(204, 120, 92, 0.2); }
    .title { font-family: 'Newsreader', Georgia, serif; font-size: 38px; font-weight: 600; color: var(--text-main); letter-spacing: -0.5px; line-height: 1.2; }
    .subtitle { color: var(--text-muted); font-size: 15px; margin-top: 6px; }
    .header-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.2s ease; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-main); }
    .btn:hover { background: #F3F1EA; border-color: #D6D1C4; }
    .btn-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
    .btn-primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); color: #fff; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 32px; }
    .kpi-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); position: relative; overflow: hidden; }
    .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .kpi-card.cards::before { background: var(--primary); }
    .kpi-card.learners::before { background: var(--forest); }
    .kpi-card.time::before { background: var(--amber); }
    .kpi-card.avg::before { background: var(--navy); }
    .kpi-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .kpi-val { font-size: 34px; font-weight: 800; color: var(--text-main); line-height: 1.1; margin-bottom: 6px; }
    .kpi-desc { font-size: 13px; color: var(--text-muted); }

    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 24px; margin-bottom: 32px; }
    @media (max-width: 600px) { .charts-grid { grid-template-columns: 1fr; } }
    .chart-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .card-title { font-size: 18px; font-weight: 700; color: var(--text-main); }
    .card-subtitle { font-size: 13px; color: var(--text-muted); }
    .chart-container { position: relative; height: 280px; width: 100%; }

    .tabs-wrapper { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); margin-bottom: 32px; }
    .tab-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .tab-btn { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { background: #F3F1EA; color: var(--text-main); }
    .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    .date-nav-group { display: inline-flex; align-items: center; background: #FFFFFF; border: 1px solid var(--border); border-radius: 999px; padding: 2px 6px; gap: 2px; transition: all 0.2s ease; }
    .date-nav-group.active { border-color: var(--primary); background: var(--primary-light); }
    .date-nav-btn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
    .date-nav-btn:hover:not(:disabled) { background: #E8E5DE; color: var(--text-main); }
    .date-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .date-select { appearance: none; -webkit-appearance: none; background: transparent; border: none; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--text-main); padding: 4px 22px 4px 8px; cursor: pointer; outline: none; }

    .search-box { position: relative; min-width: 260px; }
    .search-box input { width: 100%; padding: 8px 14px 8px 36px; border-radius: 999px; border: 1px solid var(--border); font-size: 14px; background: #FAF9F5; outline: none; font-family: inherit; }
    .search-box input:focus { border-color: var(--primary); background: #fff; }
    .search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted); }

    .tab-desc-bar { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted); padding-bottom: 14px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 14px; }
    .count-badge { font-weight: 700; color: var(--text-main); }

    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { padding: 12px 16px; background: #FAF9F5; font-weight: 700; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); white-space: nowrap; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
    tr:hover td { background-color: #FAF9F5; }
    
    .rank-badge { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; font-weight: 800; font-size: 12px; }
    .rank-1 { background: #FEF3C7; color: #B45309; }
    .rank-2 { background: #E6DFD8; color: #736E65; }
    .rank-3 { background: #FBF0EC; color: #CC785C; }
    .rank-other { color: var(--text-muted); font-size: 13px; }

    .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .tag-day1 { background: #FBF0EC; color: #CC785C; }
    .tag-day2 { background: #FEF3C7; color: #B45309; }
    .tag-day3 { background: #EBF3EE; color: #4A7C59; }
    .tag-day4 { background: #EEF2FF; color: #4F46E5; }
    .tag-day5 { background: #FDF4FF; color: #9333EA; }
    .tag-day6 { background: #FFF7ED; color: #EA580C; }
    .tag-day7 { background: #ECFEFF; color: #0891B2; }

    .footer { text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-badge">
          <span>Anki Challenge 11</span>
          <span>•</span>
          <span>Báo Cáo Tổng Hợp D1 – D7</span>
        </div>
        <h1 class="title">Bảng Thống Kê & Xếp Hạng Check-in</h1>
        <p class="subtitle">Dữ liệu thị giác trích xuất trực tiếp từ hình ảnh check-in thực tế của <strong>${statsData.kpi.uniqueUsers} thành viên</strong> suốt 7 ngày đầu thử thách.</p>
      </div>
      <div class="header-actions">
        <a href="anki_challenge_d1_d7_chart.jpg" target="_blank" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          Xem Ảnh Biểu Đồ HD
        </a>
        <button onclick="window.print()" class="btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          In Báo Cáo
        </button>
      </div>
    </div>

    <!-- 4 KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card cards">
        <div class="kpi-label">Tổng số thẻ hoàn thành</div>
        <div class="kpi-val" style="color: var(--primary);">${statsData.kpi.totalCards.toLocaleString('vi-VN')}</div>
        <div class="kpi-desc">Trung bình <strong>${Math.round(statsData.kpi.totalCards / 7).toLocaleString('vi-VN')} thẻ/ngày</strong></div>
      </div>
      <div class="kpi-card learners">
        <div class="kpi-label">Tổng lượt check-in</div>
        <div class="kpi-val" style="color: var(--forest);">${statsData.kpi.totalCheckins}</div>
        <div class="kpi-desc">Trung bình <strong>${(statsData.kpi.totalCheckins / 7).toFixed(1)} lượt/ngày</strong> (34 thành viên)</div>
      </div>
      <div class="kpi-card time">
        <div class="kpi-label">Kỷ lục cày 1 ngày</div>
        <div class="kpi-val" style="color: var(--amber);">${statsData.kpi.maxSingleDayCards.toLocaleString('vi-VN')}</div>
        <div class="kpi-desc">Thiết lập bởi <strong>${statsData.kpi.topSingleUser}</strong></div>
      </div>
      <div class="kpi-card avg">
        <div class="kpi-label">Top 1 Tích Luỹ D1-D7</div>
        <div class="kpi-val" style="color: var(--navy);">${statsData.kpi.topAggregateCards.toLocaleString('vi-VN')}</div>
        <div class="kpi-desc">Dẫn đầu bởi <strong>${statsData.kpi.topAggregateUser}</strong></div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Tổng Thẻ Ôn Tập Theo Ngày</div>
            <div class="card-subtitle">Số lượng thẻ được toàn bộ cộng đồng hoàn thành</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="cardsPerDayChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Số Thành Viên Check-in Theo Ngày</div>
            <div class="card-subtitle">Duy trì thói quen học tập liên tục mỗi ngày</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="usersPerDayChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Top 10 Thành Viên Cày Thẻ Tích Luỹ Nhất</div>
            <div class="card-subtitle">Tổng số thẻ học qua các ngày tham gia</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="topUsersChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Phân Bổ Lĩnh Vực Học Tập</div>
            <div class="card-subtitle">Dựa trên tên bộ thẻ và nội dung check-in</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="deckCategoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Data Tabs & Search -->
    <div class="tabs-wrapper">
      <div class="tab-header-row">
        <div class="tabs" id="tabControls">
          <button class="tab-btn active" data-tab="topUsers">Top Tích Luỹ</button>
          <button class="tab-btn" data-tab="topSingle">Kỷ Lục 1 Ngày</button>
          
          <div class="date-nav-group" id="dateNavGroup">
            <button class="date-nav-btn" id="prevDayBtn" title="Ngày trước đó">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style="position: relative; display: flex; align-items: center;">
              <select id="daySelect" class="date-select">
                ${statsData.dailySummary.slice().reverse().map(d => `<option value="${d.day}">${d.dayLabel} (${d.date})</option>`).join('')}
              </select>
              <svg style="position: absolute; right: 6px; pointer-events: none; width: 12px; height: 12px; color: var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <button class="date-nav-btn" id="nextDayBtn" title="Ngày tiếp theo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="searchInput" placeholder="Tìm kiếm thành viên, bộ thẻ...">
        </div>
      </div>

      <div class="tab-desc-bar">
        <span id="tabDesc">Bảng xếp hạng tổng thẻ tích luỹ của 34 thành viên (D1-D7)</span>
        <span class="count-badge" id="countBadge">34 kết quả</span>
      </div>

      <div class="table-container">
        <table id="dataTable">
          <thead id="tableHead">
            <!-- Dynamic header -->
          </thead>
          <tbody id="tableBody">
            <!-- Dynamic body -->
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <p>Anki Challenge Vietnam — Thống kê được tạo tự động với sự hỗ trợ của Gemini Vision OCR</p>
      <p style="margin-top: 4px; font-size: 12px;">Dữ liệu đối chiếu từ hình ảnh chụp màn hình Anki và lệnh /checkin trên Discord Anki Việt Nam</p>
    </div>
  </div>

  <script>
    const DATA = ${JSON.stringify(statsData)};
    let currentTab = 'topUsers';
    let searchQuery = '';

    // Initialize Charts
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Cards Per Day
      new Chart(document.getElementById('cardsPerDayChart'), {
        type: 'bar',
        data: {
          labels: DATA.dailySummary.map(d => d.dayLabel),
          datasets: [{
            label: 'Số thẻ học',
            data: DATA.dailySummary.map(d => d.totalCards),
            backgroundColor: '#CC785C',
            hoverBackgroundColor: '#BA6449',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => ' ' + c.raw.toLocaleString('vi-VN') + ' thẻ' }
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F0EDE6' } },
            x: { grid: { display: false } }
          }
        }
      });

      // 2. Users Per Day
      new Chart(document.getElementById('usersPerDayChart'), {
        type: 'line',
        data: {
          labels: DATA.dailySummary.map(d => d.dayLabel),
          datasets: [{
            label: 'Người check-in',
            data: DATA.dailySummary.map(d => d.totalUsers),
            borderColor: '#4A7C59',
            backgroundColor: 'rgba(74, 124, 89, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#4A7C59'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => ' ' + c.raw + ' người check-in' }
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F0EDE6' } },
            x: { grid: { display: false } }
          }
        }
      });

      // 3. Top Users
      const top10 = DATA.userRankings.slice(0, 10);
      new Chart(document.getElementById('topUsersChart'), {
        type: 'bar',
        data: {
          labels: top10.map(u => u.user.length > 14 ? u.user.substring(0, 13) + '…' : u.user),
          datasets: [{
            label: 'Tổng số thẻ',
            data: top10.map(u => u.totalCards),
            backgroundColor: '#E8A55A',
            hoverBackgroundColor: '#D97706',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => ' ' + c.raw.toLocaleString('vi-VN') + ' thẻ' }
            }
          },
          scales: {
            x: { beginAtZero: true, grid: { color: '#F0EDE6' } },
            y: { grid: { display: false } }
          }
        }
      });

      // 4. Deck Categories
      new Chart(document.getElementById('deckCategoryChart'), {
        type: 'doughnut',
        data: {
          labels: ['Ngoại ngữ (Nhật / Trung / Hàn)', 'Tiếng Anh (IELTS / TOEIC)', 'Y / Dược / Khoa học', 'Khác'],
          datasets: [{
            data: [
              DATA.deckCategories.japanese,
              DATA.deckCategories.english,
              DATA.deckCategories.medical,
              DATA.deckCategories.other
            ],
            backgroundColor: ['#CC785C', '#2B4C7E', '#4A7C59', '#736E65'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } }
            }
          },
          cutout: '65%'
        }
      });

      // Initial table render
      setTab('topUsers');
    });

    const daysList = DATA.dailySummary.map(d => d.day);
    const daySelect = document.getElementById('daySelect');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const dateNavGroup = document.getElementById('dateNavGroup');

    function updateDateNav(day) {
      const idx = daysList.indexOf(day);
      if (idx === -1) {
        if (prevDayBtn) prevDayBtn.disabled = true;
        if (nextDayBtn) nextDayBtn.disabled = true;
      } else {
        if (prevDayBtn) prevDayBtn.disabled = (idx <= 0);
        if (nextDayBtn) nextDayBtn.disabled = (idx >= daysList.length - 1);
      }
    }

    function setTab(tab) {
      currentTab = tab;
      const isDay = tab.startsWith('day');

      document.querySelectorAll('.tab-btn').forEach(b => {
        if (b.getAttribute('data-tab') === tab) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      if (dateNavGroup && daySelect) {
        if (isDay) {
          dateNavGroup.classList.add('active');
          daySelect.style.color = 'var(--primary)';
          daySelect.style.fontWeight = '700';
          daySelect.value = tab;
          updateDateNav(tab);
        } else {
          dateNavGroup.classList.remove('active');
          daySelect.style.color = 'var(--text-main)';
          daySelect.style.fontWeight = '600';
          if (!daySelect.value && daysList.length > 0) {
            daySelect.value = daysList[daysList.length - 1];
          }
          updateDateNav(daySelect.value);
        }
      }

      renderTable();
    }

    function renderTable() {
      const thead = document.getElementById('tableHead');
      const tbody = document.getElementById('tableBody');
      const tabDesc = document.getElementById('tabDesc');
      const countBadge = document.getElementById('countBadge');

      let rows = [];

      if (currentTab === 'topUsers') {
        thead.innerHTML = '<tr><th style="width: 60px;">Hạng</th><th>Thành viên</th><th>Tổng thẻ</th><th>Số ngày tham gia</th><th>Thời gian ghi nhận</th><th>Streak cao nhất</th><th>Bộ thẻ (Deck)</th></tr>';
        tabDesc.textContent = 'Bảng xếp hạng tổng thẻ tích luỹ của toàn bộ thành viên (D1-D7)';
        
        rows = DATA.userRankings.map((u, i) => ({
          rank: i + 1,
          col1: u.user,
          col2: u.totalCards.toLocaleString('vi-VN') + ' thẻ',
          col3: u.daysCount + ' / 7 ngày',
          col4: u.totalMinutes > 0 ? Math.round(u.totalMinutes) + ' phút' : '—',
          col5: u.maxStreak ? u.maxStreak + ' ngày' : '—',
          col6: (u.decks && u.decks.length) ? u.decks.join(', ') : '—',
          rawCards: u.totalCards
        }));
      } else if (currentTab === 'topSingle') {
        thead.innerHTML = '<tr><th style="width: 60px;">Hạng</th><th>Thành viên</th><th>Số thẻ cày trong ngày</th><th>Ngày</th><th>Thời gian</th><th>Chi tiết ghi nhận</th></tr>';
        tabDesc.textContent = 'Top các kỷ lục số thẻ học nhiều nhất đạt được trong 1 ngày duy nhất';

        rows = DATA.topSingleDayRecords.map((r, i) => ({
          rank: i + 1,
          col1: r.user,
          col2: r.cards.toLocaleString('vi-VN') + ' thẻ',
          col3: r.date,
          col4: r.minutes ? Math.round(r.minutes) + ' phút' : '—',
          col5: r.detail || r.deck || '—',
          col6: '',
          rawCards: r.cards
        }));
      } else {
        const dayObj = DATA.dailySummary.find(d => d.day === currentTab);
        thead.innerHTML = '<tr><th style="width: 60px;">Hạng</th><th>Thành viên</th><th>Số thẻ</th><th>Thời gian</th><th>Streak</th><th>Chi tiết thống kê & Mô tả ảnh</th></tr>';
        tabDesc.textContent = 'Chi tiết các lượt check-in trong ' + (dayObj?.dayLabel || '') + ' (' + (dayObj?.date || '') + ')';

        const records = dayObj ? dayObj.records : [];
        rows = records.map((r, i) => ({
          rank: i + 1,
          col1: r.user,
          col2: r.cards.toLocaleString('vi-VN') + ' thẻ',
          col3: r.minutes ? Math.round(r.minutes) + ' phút' : '—',
          col4: r.streak ? r.streak + ' ngày' : '—',
          col5: (r.detail ? r.detail : '') + (r.imageDesc ? ' <br><small style="color: #8E8B82;">🔍 ' + r.imageDesc + '</small>' : ''),
          col6: '',
          rawCards: r.cards
        }));
      }

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        rows = rows.filter(r => 
          (r.col1 && r.col1.toLowerCase().includes(q)) || 
          (r.col5 && r.col5.toLowerCase().includes(q)) ||
          (r.col6 && r.col6.toLowerCase().includes(q))
        );
      }

      countBadge.textContent = rows.length + ' kết quả';

      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">Không tìm thấy kết quả phù hợp</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map(r => {
        let badge = '<span class="rank-badge rank-other">' + r.rank + '</span>';
        if (r.rank === 1) badge = '<span class="rank-badge rank-1">🥇</span>';
        else if (r.rank === 2) badge = '<span class="rank-badge rank-2">🥈</span>';
        else if (r.rank === 3) badge = '<span class="rank-badge rank-3">🥉</span>';

        return '<tr>' +
          '<td>' + badge + '</td>' +
          '<td><strong>' + r.col1 + '</strong></td>' +
          '<td><strong style="color: var(--primary);">' + r.col2 + '</strong></td>' +
          '<td>' + r.col3 + '</td>' +
          '<td>' + r.col4 + '</td>' +
          '<td>' + r.col5 + '</td>' +
          (r.col6 ? '<td><small style="color: var(--text-muted);">' + r.col6 + '</small></td>' : '') +
        '</tr>';
      }).join('');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) setTab(tab);
      });
    });

    daySelect?.addEventListener('change', (e) => {
      if (e.target.value) setTab(e.target.value);
    });

    prevDayBtn?.addEventListener('click', () => {
      const current = currentTab.startsWith('day') ? currentTab : (daySelect?.value || daysList[daysList.length - 1]);
      const idx = daysList.indexOf(current);
      if (idx > 0) setTab(daysList[idx - 1]);
    });

    nextDayBtn?.addEventListener('click', () => {
      const current = currentTab.startsWith('day') ? currentTab : (daySelect?.value || daysList[daysList.length - 1]);
      const idx = daysList.indexOf(current);
      if (idx >= 0 && idx < daysList.length - 1) setTab(daysList[idx + 1]);
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTable();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../dashboard_checkin_d1_d7.html'), htmlContent, 'utf8');
// Also write to public/dashboard_checkin_d1_d7.html so it can be served or viewed online
fs.writeFileSync(path.join(__dirname, '../public/dashboard_checkin_d1_d7.html'), htmlContent, 'utf8');
console.log('Successfully generated dashboard_checkin_d1_d7.html!');
