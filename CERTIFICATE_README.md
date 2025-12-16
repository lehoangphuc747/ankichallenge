# Hệ thống Chứng chỉ Anki Challenge

## Tổng quan

Hệ thống chứng chỉ cho phép người dùng xem và tải xuống chứng chỉ cho các thử thách Anki mà họ đã tham gia.

## Các tính năng chính

### 1. Hiển thị Chứng chỉ trên Profile
- Mỗi người dùng có thể xem danh sách chứng chỉ của các challenge đã tham gia
- Hiển thị thống kê: số ngày học, tỷ lệ kỷ luật
- Card chứng chỉ có design đẹp mắt với gradient màu tím

### 2. Tải xuống Chứng chỉ
Người dùng có thể tải chứng chỉ theo các định dạng:
- **HTML**: File HTML standalone với CSS inline, có thể mở trực tiếp trên trình duyệt
- **PNG**: (Đang phát triển) Export thành ảnh PNG
- **PDF**: (Đang phát triển) Export thành file PDF - hiện tại có thể dùng chức năng In và chọn "Save as PDF"

### 3. Xem Chứng chỉ Toàn màn hình
- Trang riêng để xem chứng chỉ ở kích thước A4 chuẩn
- Có các nút tải xuống và in
- Chức năng in được tối ưu cho kích thước A4

## Cấu trúc Files

```
src/
├── components/
│   ├── Certificate.astro          # Component chính hiển thị chứng chỉ
│   └── CertificateCard.astro      # Card component (không sử dụng trong code cuối)
├── pages/
│   ├── api/
│   │   └── certificate/
│   │       └── [userId]/
│   │           └── [challengeId].ts    # API endpoint lấy dữ liệu chứng chỉ
│   ├── certificate/
│   │   └── [userId]/
│   │       └── [challengeId].astro     # Trang xem chứng chỉ toàn màn hình
│   └── profile/
│       └── [id].astro                   # Trang profile (đã tích hợp hiển thị chứng chỉ)
```

## Cách sử dụng

### Xem chứng chỉ trên Profile
1. Truy cập trang profile của người dùng: `/profile/{userId}`
2. Cuộn xuống phần "🏆 Chứng chỉ"
3. Xem danh sách các chứng chỉ có sẵn

### Tải xuống chứng chỉ
Từ trang profile:
1. Nhấn nút **HTML** để tải xuống file HTML
2. Nhấn nút **Xem** để xem chứng chỉ toàn màn hình
3. Từ trang xem toàn màn hình, có thể:
   - Nhấn **In chứng chỉ** để in hoặc save as PDF
   - Nhấn các nút tải xuống khác

## Design Chứng chỉ

### Giao diện
- Kích thước: A4 (210mm x 297mm)
- Font chữ:
  - **Be Vietnam Pro**: Font chính cho nội dung
  - **Playfair Display**: Font serif sang trọng cho tiêu đề và tên người nhận
  - **Mrs Saint Delafield**: Font chữ ký thủ công

### Màu sắc
- Viền ngoài: Navy Blue (#1e293b)
- Viền trong: Vàng Gold (#d97706)
- Tên người nhận: Deep Blue (#1e3a8a)
- Tên thử thách: Gradient xanh biển → xanh ngọc (#1e3a8a → #0891b2)

### Thống kê hiển thị
1. **Ngày học**: Số ngày đã check-in / Tổng số ngày
2. **Kỷ luật**: Phần trăm tỷ lệ check-in (đã thay đổi từ "Chuyên cần")

### Các yếu tố trang trí
- Khung viền kép (double border) sang trọng
- Góc trang trí với viền double gold
- Chữ ký "Hph" nghiêng 8 độ
- Pattern background nhẹ (trong bản web preview)

## API Endpoints

### GET `/api/certificate/{userId}/{challengeId}`

Lấy dữ liệu chứng chỉ cho một người dùng và challenge cụ thể.

**Response:**
```json
{
  "userName": "NGUYEN KHANH LINH",
  "challengeName": "Anki Challenge 8",
  "studyDays": 77,
  "totalDays": 100,
  "attendanceRate": 77,
  "completionDate": "12/12/2025",
  "userId": 9,
  "challengeId": 1
}
```

**Errors:**
- 400: Missing parameters
- 403: User did not participate in this challenge
- 404: User or challenge not found
- 500: Internal server error

## Quy tắc hiển thị Chứng chỉ

Hiện tại, tất cả các challenge mà người dùng tham gia đều hiển thị chứng chỉ. Có thể thêm điều kiện:

```javascript
const eligibleChallenges = challengeStats.filter(stat => {
  // Ví dụ: Chỉ hiển thị nếu tỷ lệ kỷ luật >= 50%
  return stat.disciplinePercentage >= 50;
});
```

## Tính năng sẽ phát triển

### Export PNG
Cần cài đặt thư viện:
```bash
npm install html2canvas
```

Sau đó implement trong trang certificate viewer:
```javascript
import html2canvas from 'html2canvas';

async function exportToPNG() {
  const element = document.querySelector('.certificate-container');
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certificate.png';
  a.click();
}
```

### Export PDF
Cần cài đặt thư viện:
```bash
npm install jspdf html2canvas
```

Sau đó implement:
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function exportToPDF() {
  const element = document.querySelector('.certificate-container');
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  pdf.save('certificate.pdf');
}
```

## Lưu ý kỹ thuật

1. **Print CSS**: Đã được tối ưu với `@media print` để đảm bảo in đẹp
2. **Gradient Text**: Trong bản in sẽ hiển thị màu solid thay vì gradient (để đảm bảo tương thích)
3. **Fonts**: Các font được load từ Google Fonts, cần kết nối internet để hiển thị đúng
4. **Responsive**: Certificate card responsive trên mobile

## Troubleshooting

### Chứng chỉ không hiển thị
- Kiểm tra user có tham gia challenge đó không (kiểm tra `challengeIds` trong users.json)
- Kiểm tra API endpoint có trả về dữ liệu đúng không

### Font không hiển thị đúng
- Kiểm tra kết nối internet
- Google Fonts có thể bị chặn ở một số môi trường

### Gradient không hiển thị khi in
- Đây là tính năng, gradient được chuyển thành màu solid để đảm bảo tương thích với máy in

## Tác giả

Phát triển bởi GitHub Copilot cho dự án Anki Challenge Vietnam.
