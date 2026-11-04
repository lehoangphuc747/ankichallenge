import json
import time
import requests

token = ''
with open('.env') as f:
    for line in f:
        if line.startswith('DISCORD_TOKEN='):
            token = line.split('=', 1)[1].strip().strip('\"\'')
            break

CHANNEL_ID = '1436759768713662705' # Forum 〔➕〕addons
headers = {
    'Authorization': f'Bot {token}',
    'User-Agent': 'DiscordBot',
    'Content-Type': 'application/json; charset=utf-8'
}

p1 = (
    "# 📌 [TỔNG HỢP] MỤC LỤC TOÀN BỘ ADD-ON ANKI HAY NHẤT\n"
    "*Chào mừng các bạn đến với kho lưu trữ Add-on của cộng đồng Anki Việt Nam! Dưới đây là mục lục tổng hợp toàn bộ các add-on đã được giới thiệu trong diễn đàn, phân loại theo từng nhu cầu để bạn dễ dàng tìm kiếm:*\n\n"
    "---\n\n"
    "### 🎨 1. Giao diện & Thẩm mỹ (UI / Theme / Dashboard)\n"
    "* 🍙 **Onigiri 2.0 (Bento)** — Giao diện widget grid hiện đại, đa dạng theme Catppuccin/Dracula: [Xem bài viết](https://discord.com/channels/867268399687663616/1567439796593496216) *(Mã: `1011095603`)*\n"
    "* 🖼️ **Custom Background Image & Gear Icon** — Đổi hình nền, ảnh GIF động và icon cài đặt: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443535815381045) *(Mã: `1210908941`)*\n"
    "* 🎛️ **Advanced Review Bottom Bar** — Tinh chỉnh thanh nút bên dưới, hiển thị thời gian ôn kế tiếp: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443406186356790) *(Mã: `1136455830`)*\n"
    "* 💻 **Modern Dashboard** — Giao diện dashboard tổng quan tiến độ: [Xem bài viết](https://discord.com/channels/867268399687663616/1452508862837162085)\n\n"
    "---\n\n"
    "### 🧠 2. Thuật toán FSRS, Ôn tập & Tập trung\n"
    "* ⚡ **FSRS Helper** — Trợ thủ tối ưu FSRS (Load Balance, Easy Days, Disperse Siblings): [Xem bài viết](https://discord.com/channels/867268399687663616/1567439800481484801) *(Mã: `759844606`)*\n"
    "* ⚖️ **Pass/Fail 2** — Tối giản chỉ còn 2 nút Đúng/Sai, tăng tốc học & tối ưu FSRS: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443477128814633) *(Mã: `876946123`)*\n"
    "* ⚡ **Speed Focus Mode** — Chuông báo cảnh báo & tự động lật thẻ, cắt giảm 50% thời gian cày thẻ: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443335252017164) *(Mã: `1046608507`)*\n"
    "* 🔮 **Anki Simulator** — Dự báo khối lượng thẻ và tải học tập trong tương lai: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443432228520028) *(Mã: `817108664`)*"
)

p2 = (
    "### 🤖 3. Trí tuệ nhân tạo (AI) & Phát âm (Text-to-Speech)\n"
    "* 🧠 **AnkiBrain (AnkiChatGPT)** — Gia sư AI giải thích bài lúc học, tạo thẻ từ PDF & tích hợp Kokoro Voice miễn phí: [Xem bài viết](https://discord.com/channels/867268399687663616/1567441187701391377) *(Mã: `1915225457`)*\n"
    "* 🔊 **HyperTTS** — Bộ sinh âm thanh giọng đọc AI Neural hàng đầu (Azure, OpenAI, Google, Forvo, Naver, FPT.AI): [Xem bài viết](https://discord.com/channels/867268399687663616/1567441194559217667) *(Mã: `111623432`)*\n"
    "* 🗣️ **Superfreetts** — Công cụ sinh audio miễn phí từ AnkiVN: [Xem bài viết](https://discord.com/channels/867268399687663616/1492894237287776460)\n"
    "* 💡 **FlashCard GPT** — Hỗ trợ tạo thẻ flashcard bằng GPT: [Xem bài viết](https://discord.com/channels/867268399687663616/1436762927745990697)\n\n"
    "---\n\n"
    "### 🎮 4. Gamification & Tạo động lực (Game hoá học tập)\n"
    "* 🎮 **ANKIMON** — Biến việc review Anki thành game bắt và luyện Pokémon: [Xem bài viết](https://discord.com/channels/867268399687663616/1560536181115068457)\n"
    "* 🏆 **Anki Leaderboard** — Bảng xếp hạng thi đua toàn cầu & nhóm kín: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443380860878925) *(Mã: `175794613`)*\n"
    "* 🩸 **Life Drain** — Thanh máu sinh tồn liên tục tụt theo giây, ép não tập trung cao độ: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443454374715404) *(Mã: `715575551`)*\n"
    "* 🟩 **Review Heatmap** — Biểu đồ ô vuông nhiệt độ streak phong cách GitHub: [Xem bài viết](https://discord.com/channels/867268399687663616/1436768309210255380)"
)

p3 = (
    "### 🛠️ 5. Công cụ & Tối ưu hoá quy trình (Workflow & Integration)\n"
    "* 🌐 **AnkiConnect** — Cầu nối API cho Yomitan, Obsidian & Web Extension: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443314599264408) *(Mã: `2055492159`)*\n"
    "* ✏️ **Edit Field During Review (Cloze)** — Sửa thẻ trực tiếp khi đang review: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443356164816947) *(Mã: `385888438`)*\n"
    "* 🤝 **AnkiHub** — Nền tảng chia sẻ và tự động đồng bộ thẻ cộng đồng thời gian thực: [Xem bài viết](https://discord.com/channels/867268399687663616/1567443502164353117) *(Mã: `1322529746`)*\n"
    "* 🚀 **JSON Bulk Importer** — Tự động nhập hàng loạt thẻ từ JSON: [Xem bài viết](https://discord.com/channels/867268399687663616/1491002252062621837)\n"
    "* ⚡ **Bulk Deck Management** — Quản lý và xử lý bộ thẻ hàng loạt: [Xem bài viết](https://discord.com/channels/867268399687663616/1489893661507457085)\n"
    "* 🍅 **PomoVN & 🍵 Senchado** — Bộ đếm Pomodoro và Tea Timer tập trung: [PomoVN](https://discord.com/channels/867268399687663616/1500144717537480764) | [Senchado](https://discord.com/channels/867268399687663616/1454656687872016497)\n"
    "* ⌨️ **Customize Keyboard Shortcuts** — Tùy chỉnh phím tắt theo ý muốn: [Xem bài viết](https://discord.com/channels/867268399687663616/1436760429865996440)\n"
    "* 🇻🇳 **Gõ tiếng Việt không dấu** — Add-on hỗ trợ gõ tìm kiếm tiếng Việt tiện lợi: [Xem bài viết](https://discord.com/channels/867268399687663616/1492067993356603433)\n"
    "* ➕ **AnkiNewCardBtn** — Phím tắt tạo thẻ nhanh: [Xem bài viết](https://discord.com/channels/867268399687663616/1436760723450499253)\n\n"
    "---\n"
    "*💡 **Mẹo cài đặt**: Trong Anki, chọn menu **Tools (Công cụ) → Add-ons (Phần mở rộng) → Get Add-ons... (Tải tiện ích...)** và dán mã số tương ứng để cài đặt.*"
)

def create_and_pin():
    print("🚀 Đang tạo thread bài ghim tổng hợp...")
    url = f"https://discord.com/api/v10/channels/{CHANNEL_ID}/threads"
    
    payload = {
        "name": "📌 [TỔNG HỢP] Danh mục toàn bộ Add-on hay nhất cho Anki",
        "auto_archive_duration": 10080,
        "message": {
            "content": p1
        }
    }
    
    res = requests.post(url, headers=headers, json=payload)
    print("Tạo thread status:", res.status_code)
    if res.status_code not in (200, 201):
        print("❌ Lỗi tạo thread:", res.text)
        return
        
    thread_data = res.json()
    thread_id = thread_data.get("id")
    print(f"✅ Đã tạo thread thành công! ID: {thread_id}")
    
    # Gửi phần 2
    time.sleep(1)
    msg_url = f"https://discord.com/api/v10/channels/{thread_id}/messages"
    res2 = requests.post(msg_url, headers=headers, json={"content": p2})
    print("Gửi phần 2 status:", res2.status_code)
    
    # Gửi phần 3
    time.sleep(1)
    res3 = requests.post(msg_url, headers=headers, json={"content": p3})
    print("Gửi phần 3 status:", res3.status_code)
    
    # Ghim thread lên đầu forum channel (flags = 2)
    time.sleep(1)
    pin_url = f"https://discord.com/api/v10/channels/{thread_id}"
    pin_res = requests.patch(pin_url, headers=headers, json={"flags": 2})
    print("Set flags PINNED status:", pin_res.status_code)
    if pin_res.status_code in (200, 201):
        print("✅ Đã ghim bài viết lên đầu diễn đàn forum thành công (PINNED: flags 2)!")
    else:
        print("⚠️ Chú ý flags:", pin_res.text)

if __name__ == '__main__':
    create_and_pin()
