import os
import time
import requests

token = ''
with open('.env') as f:
    for line in f:
        if line.startswith('DISCORD_TOKEN='):
            token = line.split('=', 1)[1].strip().strip('\"\'')
            break

headers = {
    'Authorization': f'Bot {token}',
    'Content-Type': 'application/json; charset=utf-8',
    'User-Agent': 'DiscordBot'
}

PINNED_THREAD_ID = '1567445151956213841'

m1 = (
    "# 📌 [TỔNG HỢP] MỤC LỤC TOÀN BỘ ADD-ON ANKI HAY NHẤT\n"
    "*Chào mừng bạn đến với kho lưu trữ Add-on của cộng đồng Anki Việt Nam! Dưới đây là mục lục toàn bộ add-on được phân loại khoa học theo từng chủ đề:*\n\n"
    "---\n\n"
    "### 🎨 1. Giao diện & Thẩm mỹ (UI / Theme / Dark Mode)\n"
    "* 🍙 **Onigiri 2.0 (Bento)** — Giao diện widget hiện đại, nhiều theme: [Xem bài](https://discord.com/channels/867268399687663616/1567439796593496216) *(Mã: `1011095603`)*\n"
    "* 🌸 **Beautify-Anki 2.0** — Lột xác giao diện Anki phong cách Material: [Xem bài](https://discord.com/channels/867268399687663616/1567455807040393347) *(Mã: `1116770498`)*\n"
    "* 🎨 **ReColor** — Tùy biến toàn diện bảng màu & Dark Mode: [Xem bài](https://discord.com/channels/867268399687663616/1567449234750312472) *(Mã: `688199788`)*\n"
    "* 🖼️ **Custom Background Image & Gear Icon** — Đổi hình nền & icon: [Xem bài](https://discord.com/channels/867268399687663616/1567443535815381045) *(Mã: `1210908941`)*\n"
    "* 💅 **Custom Stylesheet (CSS/JS)** — Tùy biến giao diện sâu qua code: [Xem bài](https://discord.com/channels/867268399687663616/1567455834663952386) *(Mã: `181103283`)*\n"
    "* 🎛️ **Advanced Review Bottom Bar** — Tinh chỉnh thanh nút & thời gian: [Xem bài](https://discord.com/channels/867268399687663616/1567443406186356790) *(Mã: `1136455830`)*\n"
    "* 🟢🔴 **Button Colours** — Tô màu 4 nút bấm trả lời trực quan: [Xem bài](https://discord.com/channels/867268399687663616/1567449306309460090) *(Mã: `249438483`)*\n"
    "* 🌙 **Zoom 24 & Night Mode Enhancer** — Phóng to font & Dark Mode: [Xem bài](https://discord.com/channels/867268399687663616/1567456112712613939) *(Mã: `1923741581`)*\n"
    "* 📑 **ReMemo** — Tùy biến thanh Sidebar bảng điều khiển gọn gàng: [Xem bài](https://discord.com/channels/867268399687663616/1567456047868940399) *(Mã: `1988760596`)*\n"
    "* 💻 **Modern Dashboard** — Giao diện dashboard tổng quan tiến độ: [Xem bài](https://discord.com/channels/867268399687663616/1452508862837162085)"
)

m2 = (
    "### 🧠 2. Thuật toán FSRS, Ôn tập & Thống kê (Review & Stats)\n"
    "* ⚡ **FSRS Helper** — Tối ưu FSRS (Load Balance, Easy Days): [Xem bài](https://discord.com/channels/867268399687663616/1567439800481484801) *(Mã: `759844606`)*\n"
    "* 🎁 **Straight Reward** — Thưởng Ease Factor khi nhớ liên tiếp, chống Ease Hell: [Xem bài](https://discord.com/channels/867268399687663616/1567455708264398900) *(Mã: `957961234`)*\n"
    "* ⚖️ **Pass/Fail 2** — Tối giản 2 nút Đúng/Sai tăng tốc độ học: [Xem bài](https://discord.com/channels/867268399687663616/1567443477128814633) *(Mã: `876946123`)*\n"
    "* ⚡ **Speed Focus Mode** — Chuông báo & tự động lật thẻ siêu tốc: [Xem bài](https://discord.com/channels/867268399687663616/1567443335252017164) *(Mã: `1046608507`)*\n"
    "* 🔮 **Anki Simulator** — Dự báo khối lượng ôn tập tương lai: [Xem bài](https://discord.com/channels/867268399687663616/1567443432228520028) *(Mã: `817108664`)*\n"
    "* 📊 **More Overview Stats 2.1** — Thống kê chi tiết & ngày hoàn thành deck: [Xem bài](https://discord.com/channels/867268399687663616/1567455781601677323) *(Mã: `738807903`)*\n"
    "* 🟩 **Review & New Added Heatmap** — Heatmap 2 chế độ (Ôn tập & Thẻ mới): [Xem bài](https://discord.com/channels/867268399687663616/1567449259966730283) *(Mã: `1842249105`)*\n"
    "* 🟩 **Review Heatmap** — Biểu đồ ô vuông nhiệt độ streak: [Xem bài](https://discord.com/channels/867268399687663616/1436768309210255380)\n"
    "* 🟩 **Interactive Heatmap** — Biểu đồ nhiệt streak tương tác: [Xem bài](https://discord.com/channels/867268399687663616/1494397189034868966)\n"
    "* 🍅 **PomoVN & 🍵 Senchado** — Pomodoro & Tea Timer tập trung: [PomoVN](https://discord.com/channels/867268399687663616/1500144717537480764) | [Senchado](https://discord.com/channels/867268399687663616/1454656687872016497)"
)

m3 = (
    "### 🎮 3. Game hoá học tập & Tạo động lực (Gamification)\n"
    "* 🎮 **Pokemanki Gold** — Nuôi & tiến hóa Pokémon theo tiến độ học: [Xem bài](https://discord.com/channels/867268399687663616/1567455664010297416) *(Mã: `1677779223`)*\n"
    "* 🎮 **ANKIMON** — Bắt và luyện quái thú khi ôn tập: [Xem bài](https://discord.com/channels/867268399687663616/1560536181115068457)\n"
    "* 🛡️ **Anki Habitica** — Đồng bộ kinh nghiệm & vàng game RPG Habitica: [Xem bài](https://discord.com/channels/867268399687663616/1567455965337354271) *(Mã: `1758045507`)*\n"
    "* 🔥 **Anki Killstreaks** — Hiệu ứng chuỗi tiêu diệt Call of Duty: [Xem bài](https://discord.com/channels/867268399687663616/1567455872030871654) *(Mã: `579111794`)*\n"
    "* 🩸 **Life Drain** — Thanh máu sinh tồn tụt dần ép tập trung cao độ: [Xem bài](https://discord.com/channels/867268399687663616/1567443454374715404) *(Mã: `715575551`)*\n"
    "* 🏆 **Anki Leaderboard** — Bảng xếp hạng thi đua toàn cầu & bạn bè: [Xem bài](https://discord.com/channels/867268399687663616/1567443380860878925) *(Mã: `175794613`)*\n\n"
    "---\n\n"
    "### 🤖 4. Trí tuệ nhân tạo (AI), Audio & Ngoại ngữ\n"
    "* 🧠 **AnkiBrain** — AI giải thích bài, tạo thẻ từ PDF & Kokoro Voice TTS: [Xem bài](https://discord.com/channels/867268399687663616/1567441187701391377) *(Mã: `1915225457`)*\n"
    "* 💡 **FlashCard GPT** — Hỗ trợ tạo thẻ flashcard bằng GPT: [Xem bài](https://discord.com/channels/867268399687663616/1436762927745990697)\n"
    "* 🔊 **HyperTTS** — Bộ sinh giọng đọc AI Neural (Azure, OpenAI, Google, Forvo): [Xem bài](https://discord.com/channels/867268399687663616/1567441194559217667) *(Mã: `111623432`)*\n"
    "* 🗣️ **Superfreetts** — Công cụ sinh âm thanh audio AnkiVN: [Xem bài](https://discord.com/channels/867268399687663616/1492894237287776460)\n"
    "* 🇯🇵 **Japanese Pitch Accent (Migaku)** — Biểu đồ cao độ ngữ điệu tiếng Nhật: [Xem bài](https://discord.com/channels/867268399687663616/1567456091133059083) *(Mã: `148002038`)*"
)

m4 = (
    "### ✏️ 5. Trình biên tập, Định dạng & Soạn thẻ (Editor & Cards)\n"
    "* ✏️ **Edit Field During Review (Cloze)** — Sửa thẻ trực tiếp khi đang học: [Xem bài](https://discord.com/channels/867268399687663616/1567443356164816947) *(Mã: `385888438`)*\n"
    "* ⌨️ **Fill the blanks** — Gõ trực tiếp đáp án vào thẻ đục lỗ: [Xem bài](https://discord.com/channels/867268399687663616/1567449184250888296) *(Mã: `1933645497`)*\n"
    "* 🙈 **Cloze (Hide All)** — Ẩn toàn bộ các vị trí đục lỗ cùng một lúc: [Xem bài](https://discord.com/channels/867268399687663616/1567455918612807691) *(Mã: `1709973686`)*\n"
    "* 🔘 **Multiple Choice for Anki** — Tạo câu hỏi trắc nghiệm tương tác A/B/C/D: [Xem bài](https://discord.com/channels/867268399687663616/1567455985826664490) *(Mã: `1566095810`)*\n"
    "* ✏️ **Mini Format Pack** — Thanh công cụ định dạng văn bản phong phú: [Xem bài](https://discord.com/channels/867268399687663616/1567449285786599435) *(Mã: `1187194862`)*\n"
    "* ⚡ **Fastbar with nightmode** — Thanh công cụ soạn thảo trên đỉnh cửa sổ: [Xem bài](https://discord.com/channels/867268399687663616/1567455684566712393) *(Mã: `46611790`)*\n"
    "* 🔣 **Symbols As You Type** — Tự động gõ tắt biến thành ký hiệu toán & mũi tên: [Xem bài](https://discord.com/channels/867268399687663616/1567455730192097352) *(Mã: `2040501954`)*\n"
    "* 🏷️ **Extended Tag Add/Edit Box** — Thanh nhập tag nhiều dòng tiện lợi: [Xem bài](https://discord.com/channels/867268399687663616/1567455894181117954) *(Mã: `1135507717`)*\n"
    "* 📌 **Frozen Fields** — Ghim giữ nguyên nội dung khi tạo thẻ liên tiếp: [Xem bài](https://discord.com/channels/867268399687663616/1567456068873756725) *(Mã: `516643804`)*\n"
    "* 💻 **Syntax Highlighting (NG)** — Tô màu code cho lập trình viên: [Xem bài](https://discord.com/channels/867268399687663616/1567449207541862431) *(Mã: `566351439`)*\n"
    "* 🖼️ **ImageResizer** — Tự động nén & thu nhỏ ảnh khi dán: [Xem bài](https://discord.com/channels/867268399687663616/1567449161492865128) *(Mã: `1214357311`)*"
)

m5 = (
    "### 🛠️ 6. Quản lý, Đồng bộ & Tiện ích mở rộng (Sync & Workflow)\n"
    "* 🌐 **AnkiConnect** — Cầu nối API cho Yomitan, Obsidian & Web Extension: [Xem bài](https://discord.com/channels/867268399687663616/1567443314599264408) *(Mã: `2055492159`)*\n"
    "* 🤝 **AnkiHub** — Đồng bộ bộ thẻ cộng tác thời gian thực: [Xem bài](https://discord.com/channels/867268399687663616/1567443502164353117) *(Mã: `1322529746`)*\n"
    "* 📥 **Quizlet to Anki 2.1 Importer** — Nhập trực tiếp deck từ Quizlet về Anki: [Xem bài](https://discord.com/channels/867268399687663616/1567455750312300555) *(Mã: `1362209126`)*\n"
    "* 🚀 **JSON Bulk Importer** — Tự động nhập hàng loạt thẻ từ JSON: [Xem bài](https://discord.com/channels/867268399687663616/1491002252062621837)\n"
    "* ⚡ **Bulk Deck Management** — Quản lý và xử lý bộ thẻ hàng loạt: [Xem bài](https://discord.com/channels/867268399687663616/1489893661507457085)\n"
    "* 🔗 **Merge Duplicate Notes** — Gộp & xử lý triệt để thẻ bị trùng lặp: [Xem bài](https://discord.com/channels/867268399687663616/1567456005728510074) *(Mã: `1425504015`)*\n"
    "* 📝 **Batch Editing** — Chỉnh sửa hàng loạt nội dung nhiều thẻ trong Browser: [Xem bài](https://discord.com/channels/867268399687663616/1567456026335256589) *(Mã: `291119185`)*\n"
    "* 🌐 **Anki Web Browser** — Trình duyệt tích hợp tra cứu & kéo thả ngay trong Anki: [Xem bài](https://discord.com/channels/867268399687663616/1567455942365286463) *(Mã: `864545277`)*\n"
    "* ⌨️ **Customize Keyboard Shortcuts** — Tùy chỉnh phím tắt theo ý muốn: [Xem bài](https://discord.com/channels/867268399687663616/1436760429865996440)\n"
    "* ➕ **AnkiNewCardBtn** — Phím tắt tạo thẻ nhanh: [Xem bài](https://discord.com/channels/867268399687663616/1436760723450499253)\n"
    "* 🇻🇳 **Gõ tiếng Việt không dấu** — Hỗ trợ gõ tìm kiếm tiếng Việt không dấu: [Xem bài](https://discord.com/channels/867268399687663616/1492067993356603433)\n\n"
    "---\n"
    "💡 **Mẹo cài đặt**: Trong Anki, chọn menu **Tools (Công cụ) → Add-ons (Phần mở rộng) → Get Add-ons... (Tải tiện ích...)** và dán mã số tương ứng để cài đặt."
)

sections = [m1, m2, m3, m4, m5]
target_msg_ids = [
    '1567445151956213841', # Msg 1 (Starter)
    '1567445157832433705', # Msg 2
    '1567445165101023233', # Msg 3
    '1567449328983736353', # Msg 4
    '1567456132560068640', # Msg 5
]
redundant_msg_id = '1567456138620968981' # Msg 6 (to delete)

def run():
    print("Kiểm tra độ dài các phần:")
    for idx, s in enumerate(sections, 1):
        print(f"Phần {idx}: {len(s)} ký tự (Giới hạn: 2000)")
        assert len(s) <= 2000, f"Phần {idx} quá dài ({len(s)} > 2000)"

    print("\n🚀 Bắt đầu cập nhật các tin nhắn trong bài ghim tổng hợp...")
    for idx, (mid, text) in enumerate(zip(target_msg_ids, sections), 1):
        url = f"https://discord.com/api/v10/channels/{PINNED_THREAD_ID}/messages/{mid}"
        res = requests.patch(url, headers=headers, json={"content": text})
        print(f"[{idx}/5] Cập nhật Message {mid}: {res.status_code}")
        if res.status_code not in (200, 201):
            print(f"❌ Lỗi: {res.text}")
        time.sleep(1)

    # Xóa message dư thừa thứ 6
    print(f"\n🗑️ Xóa tin nhắn thừa {redundant_msg_id}...")
    del_url = f"https://discord.com/api/v10/channels/{PINNED_THREAD_ID}/messages/{redundant_msg_id}"
    del_res = requests.delete(del_url, headers=headers)
    print(f"Xóa message thừa: {del_res.status_code}")

    print("\n✨ Đã tái cấu trúc và cập nhật toàn bộ bài ghim mục lục tổng hợp thành công!")

if __name__ == '__main__':
    run()
