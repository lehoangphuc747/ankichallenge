import json
import os
import time
import requests
import urllib.request

token = ''
with open('.env') as f:
    for line in f:
        if line.startswith('DISCORD_TOKEN='):
            token = line.split('=', 1)[1].strip().strip('\"\'')
            break

CHANNEL_ID = '1436759768713662705' # Forum 〔➕〕addons
headers = {'Authorization': f'Bot {token}', 'User-Agent': 'DiscordBot'}
TEMP_DIR = '/tmp/batch_3_images'
os.makedirs(TEMP_DIR, exist_ok=True)

addons_20 = [
    {
        'title': '🎮 Pokemanki Gold — Nuôi, chiến đấu & tiến hóa Pokémon theo tiến độ học Anki',
        'code': '1677779223',
        'compat': 'Anki 2.1.x / 23.x / 24.x (Bản Shige duy trì)',
        'content': (
            '# 🎮 Pokemanki Gold — Biến buổi học Anki thành hành trình huấn luyện Pokémon\n\n'
            'Nếu bạn thấy việc cày hàng trăm thẻ mỗi ngày quá khô khan, **Pokemanki Gold** sẽ biến mỗi bộ thẻ thành một Pokémon đồng hành. Càng học chăm, Pokémon của bạn càng mạnh mẽ và tiến hóa lên cấp độ cao hơn!\n\n'
            '---\n\n'
            '### ✨ Những tính năng cực kỳ lôi cuốn:\n'
            '* 🥚 **Ấp trứng & Tiến hóa**: Khi tạo bộ thẻ mới, bạn sẽ nhận được một quả trứng hoặc Pokémon khởi đầu. Số thẻ bạn review và tỉ lệ ghi nhớ sẽ quyết định tốc độ tiến hóa của chúng.\n'
            '* ⚔️ **Đấu Pokémon theo lượt**: Trả lời đúng (Good/Easy) sẽ ra đòn tấn công quái vật, trả lời sai (Again) sẽ bị đối thủ đánh trả.\n'
            '* 🔄 **Hệ thống Trao đổi (Trade)**: Hỗ trợ trao đổi Pokémon với người học khác hoặc mở khóa Pokédex đầy đủ các thế hệ Gen 1 - Gen 8.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1677779223`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://shigeyukey.github.io/shige-addons-wiki/images/pokemanki/choose_starter_pokemon.png',
            'https://shigeyukey.github.io/shige-addons-wiki/images/pokemanki/01.png'
        ]
    },
    {
        'title': '⚡ Fastbar with nightmode — Thanh công cụ soạn thảo nhanh trên đỉnh cửa sổ Edit',
        'code': '46611790',
        'compat': 'Anki 2.1.x / 23.x / 24.x (Duy trì bởi AnKing)',
        'content': (
            '# ⚡ Fastbar with nightmode support — Thanh công cụ soạn thảo nhanh số 1\n\n'
            'Cửa sổ thêm thẻ (Add) và chỉnh sửa thẻ (Edit) mặc định của Anki giấu nhiều nút tính năng vào thanh menu con rất bất tiện. **Fastbar** mang toàn bộ các nút thao tác nhanh lên đầu cửa sổ để bạn click chuột trong tích tắc!\n\n'
            '---\n\n'
            '### ✨ Tính năng nổi bật:\n'
            '* 🚀 **Thao tác 1 click**: Các nút chèn Cloze, in đậm, đổi màu chữ, xóa định dạng, gắn tag, ghim field đều nằm ngay trong tầm mắt.\n'
            '* 🌙 **Tương thích hoàn hảo Dark Mode**: Không bị lỗi chói mắt hay vỡ icon khi bạn bật chế độ ban đêm.\n'
            '* 📐 **Tiết kiệm diện tích màn hình**: Thiết kế thanh mảnh, hiện đại, tối ưu không gian soạn thảo thẻ.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `46611790`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/AnKingMed/Fastbar-with-nightmode-support/master/screenshots/Normal.jpg'
        ]
    },
    {
        'title': '🎁 Straight Reward — Thưởng Ease Factor khi trả lời đúng liên tiếp, chống Ease Hell',
        'code': '957961234',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🎁 Straight Reward — Cứu cánh thoát khỏi "Địa ngục Ease Hell"\n\n'
            'Trong thuật toán SM-2 cổ điển của Anki, mỗi khi bạn bấm Again, hệ số Ease Factor sẽ bị trừ 20%, nhưng khi trả lời Good thì hệ số này không bao giờ tăng trở lại. Điều này dẫn đến hiện tượng **Ease Hell**: thẻ bị lặp đi lặp lại quá dày đặc gây kiệt sức. **Straight Reward** sinh ra để sửa chữa lỗi thiết kế này!\n\n'
            '---\n\n'
            '### ✨ Cơ chế tự động giải cứu:\n'
            '* 📈 **Thưởng Ease khi giữ vững phong độ**: Nếu bạn trả lời đúng một thẻ liên tiếp 3 hay 4 lần (chuỗi Straight), add-on sẽ tự động cộng thêm Ease Factor để dãn khoảng cách ôn tập ra một cách khoa học.\n'
            '* 🧘 **Giảm áp lực cày thẻ**: Tránh tình trạng thẻ đã thuộc làu nhưng ngày nào cũng hiện lên bắt ôn lại.\n'
            '* ⚙️ **Tùy biến ngưỡng thưởng**: Tự do cài đặt độ dài chuỗi đúng và mức phần trăm Ease được thưởng trong menu cấu hình.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `957961234`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/hgiesel/anki_straight_reward/master/images/setting_menu.png',
            'https://i.imgur.com/V1lNWqQ.png'
        ]
    },
    {
        'title': '🔣 Symbols As You Type — Tự động gõ tắt biến thành ký hiệu toán học & mũi tên',
        'code': '2040501954',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🔣 Symbols As You Type — Soạn thảo ký hiệu khoa học cực nhanh\n\n'
            'Mỗi lần cần chèn mũi tên `→`, dấu suy ra `⇒`, độ C `°C`, ký hiệu micro `µ` hay chữ cái Hy Lạp `α, β, θ`, bạn lại phải mở Google copy paste rất mất thời gian? **Symbols As You Type** cho phép bạn gõ tắt tự động chuyển đổi ngay khi đang gõ phím!\n\n'
            '---\n\n'
            '### ✨ Ví dụ các phím gõ tắt thông dụng:\n'
            '* `->` tự đổi thành `→`\n'
            '* `=>` tự đổi thành `⇒`\n'
            '* `!=` tự đổi thành `≠`\n'
            '* `<=`, `>=` tự đổi thành `≤`, `≥`\n'
            '* `+-` tự đổi thành `±`\n'
            '* `:alpha:`, `:beta:` tự đổi thành `α`, `β`\n'
            '* `:deg:` tự đổi thành `°`\n'
            '* Hỗ trợ tự thêm các từ viết tắt riêng theo chuyên ngành của bạn.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `2040501954`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/jefdongus/insert-symbols-anki-addon/master/docs/demo.gif',
            'https://raw.githubusercontent.com/jefdongus/insert-symbols-anki-addon/master/docs/options_1.png'
        ]
    },
    {
        'title': '📥 Quizlet to Anki 2.1 Importer — Nhập trực tiếp bộ thẻ Quizlet về Anki trong 3 giây',
        'code': '1362209126',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 📥 Quizlet to Anki 2.1 Importer — Mang kho tài liệu Quizlet về Anki\n\n'
            'Quizlet có hàng triệu bộ flashcard từ vựng và câu hỏi trắc nghiệm cực hay nhưng tính năng Spaced Repetition của Quizlet lại bắt trả phí đắt đỏ. Với **Quizlet to Anki Importer**, bạn có thể bê nguyên bộ thẻ Quizlet về Anki hoàn toàn miễn phí!\n\n'
            '---\n\n'
            '### ✨ Ưu điểm vượt trội:\n'
            '* ⚡ **Nhập 1 click bằng URL**: Chỉ cần dán link bộ thẻ Quizlet vào Anki, nhấn Import là toàn bộ từ vựng, định nghĩa và hình ảnh minh họa sẽ tự động tải về.\n'
            '* 🖼️ **Giữ nguyên hình ảnh & âm thanh**: Tải trọn vẹn cả ảnh minh họa gốc từ Quizlet về máy của bạn.\n'
            '* 🔒 **Tự do ôn tập offline**: Học vĩnh viễn trên Anki mà không lo Quizlet bắt mua tài khoản Premium.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1362209126`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://res.cloudinary.com/dwhn1pq8a/image/upload/h_61,w_217/v1667335007/cdn/default-yellow_oofkeg.png'
        ]
    },
    {
        'title': '📊 More Overview Stats 2.1 — Thống kê chi tiết & dự báo ngày hoàn thành deck',
        'code': '738807903',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 📊 More Overview Stats 2.1 — Khai phá dữ liệu tiềm ẩn trong bộ thẻ\n\n'
            'Màn hình Overview mặc định của Anki chỉ hiển thị 3 con số ít ỏi (New, Learn, Due). **More Overview Stats** bổ sung một bảng thống kê chi tiết toàn diện ngay trên màn hình chọn bộ thẻ!\n\n'
            '---\n\n'
            '### ✨ Dữ liệu chi tiết hiển thị:\n'
            '* 📅 **Dự báo ngày hoàn thành bộ thẻ (Finish Date)**: Tính toán chính xác ngày bạn sẽ học hết bộ thẻ dựa trên mục tiêu số thẻ mới/ngày của bạn.\n'
            '* 📈 **Phân loại trạng thái thẻ**: Đếm rõ ràng số thẻ chưa học (Unseen), đang học (Learning), thẻ ôn (Review), thẻ bị treo (Suspended) và thẻ bị chôn (Buried).\n'
            '* 🎯 **Tỉ lệ phần trăm % thực tế**: Tính toán tỉ lệ bao quát kiến thức thực sự của bạn trong deck.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `738807903`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://i.postimg.cc/pTmFsdVG/anki-2021-07-30-21-23-46.png'
        ]
    },
    {
        'title': '🌸 Beautify-Anki 2.0 — Lột xác giao diện Anki theo phong cách Material Design',
        'code': '1116770498',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🌸 Beautify-Anki 2.0 — Biến Anki thành ứng dụng hiện đại & bắt mắt\n\n'
            'Nếu bạn muốn Anki trông giống một ứng dụng hiện đại năm 2026 với các góc bo tròn mềm mại, biểu tượng đẹp và thanh tiến độ phẳng thì **Beautify-Anki 2.0** là lựa chọn tuyệt vời!\n\n'
            '---\n\n'
            '### ✨ Điểm nhấn giao diện:\n'
            '* 🎨 **Phong cách phẳng Material Design**: Thiết kế lại toàn bộ danh sách bộ thẻ, nút bấm và thanh tiêu đề.\n'
            '* 🖼️ **Tích hợp hình nền đẹp sẵn có**: Đi kèm nhiều hình nền nghệ thuật chất lượng cao cho cả chế độ sáng và tối.\n'
            '* 📁 **Gắn icon tùy biến cho từng bộ thẻ**: Đặt các biểu tượng ngộ nghĩnh trước tên deck để phân biệt dễ dàng.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1116770498`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://media.githubusercontent.com/media/hafatsat-anki/Beautify-Anki_2.0/master/ads/Beautify_Anki_2.0.png'
        ]
    },
    {
        'title': '💅 Custom Stylesheet (CSS) and Javascript (JS) — Tùy biến sâu giao diện Anki',
        'code': '181103283',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 💅 Custom Stylesheet (CSS) and Javascript (JS) — Cho dân thích vọc vạch\n\n'
            'Bạn muốn đổi font chữ hệ thống của Anki, làm mờ viền, thêm hiệu ứng đổ bóng hoặc chạy script JS tùy biến ngay trong màn hình Review? Add-on này cho phép bạn nhúng trực tiếp mã CSS/JS vào Anki mà không cần sửa file gốc của phần mềm!\n\n'
            '---\n\n'
            '### ✨ Khả năng tùy biến không giới hạn:\n'
            '* 🖋️ **Thay đổi toàn bộ Typography**: Đổi font chữ của cả ứng dụng sang Inter, Roboto, SF Pro hoặc các font chữ yêu thích.\n'
            '* 🎭 **Hiệu ứng Animation**: Thêm hiệu ứng trượt thẻ, mờ dần mượt mà khi lật đáp án.\n'
            '* 🛠️ **Hỗ trợ file CSS ngoài**: Tự động nhận diện các file `.css` và `.js` trong thư mục user_files.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `181103283`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://user-images.githubusercontent.com/62722460/164108977-3a0864fe-0e7b-42e6-bf2b-0b02c197e0a6.png',
            'https://user-images.githubusercontent.com/62722460/164108835-7cf143ed-8bf9-4650-8c06-1893a576af27.png'
        ]
    },
    {
        'title': '🔥 Anki Killstreaks — Hiệu ứng chuỗi tiêu diệt Call of Duty bùng nổ khi ôn thẻ',
        'code': '579111794',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🔥 Anki Killstreaks — Hưng phấn tột độ khi giữ vững chuỗi trả lời đúng\n\n'
            'Mỗi khi bạn trả lời đúng liên tục 5, 10, 25, 50 thẻ mà không sai thẻ nào, Anki sẽ bắn ra hiệu ứng âm thanh và huy hiệu Killstreak (UAV, Chopper Gunner, Tactical Nuke) như trong tựa game bắn súng huyền thoại Call of Duty!\n\n'
            '---\n\n'
            '### ✨ Trải nghiệm game hóa cực đỉnh:\n'
            '* 🎖️ **Huy hiệu Killstreak sinh động**: Hiển thị popup vinh danh chuỗi thẻ đúng ngay trên góc màn hình.\n'
            '* 🔊 **Âm thanh hào hùng**: Âm thanh phát ra cực kỳ thỏa mãn giúp đánh tan cảm giác buồn ngủ khi cày bài ban đêm.\n'
            '* ⚙️ **Tùy biến cấp độ chuỗi**: Bạn có thể tự đổi âm thanh hoặc đặt các mốc chuỗi thẻ theo ý thích.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `579111794`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://user-images.githubusercontent.com/3792672/76172087-71164780-6168-11ea-8ab0-8962ec2b74c5.gif',
            'https://user-images.githubusercontent.com/3792672/87225074-40356180-c358-11ea-84fd-b43936c0c33a.png'
        ]
    },
    {
        'title': '🏷️ Extended Tag Add/Edit Box — Thanh nhập tag nhiều dòng, dễ quản lý tag lớn',
        'code': '1135507717',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🏷️ Extended Tag Add/Edit Box — Quản lý thẻ tag chuyên nghiệp\n\n'
            'Ô nhập tag mặc định của Anki chỉ là một dòng chữ nhỏ xíu nằm sát đáy màn hình. Khi một thẻ có 10-15 tags phân loại thì chữ bị tràn ra ngoài không thể nhìn thấy hết. Add-on này mở rộng ô nhập tag thành một cửa sổ lớn đa dòng cực kỳ tiện lợi!\n\n'
            '---\n\n'
            '### ✨ Tiện ích nổi bật:\n'
            '* 📜 **Hiển thị nhiều dòng**: Nhìn thấy toàn bộ danh sách tag cùng lúc mà không bị cắt chữ.\n'
            '* 🔍 **Gợi ý tag tự động thông minh**: Gõ vài ký tự đầu là danh sách các tag cũ đã dùng hiện ra để chọn ngay, tránh gõ nhầm chính tả tạo tag rác.\n'
            '* 🌲 **Hỗ trợ thẻ phân cấp (Hierarchical Tags)**: Hiển thị cấu trúc tag dạng cây thư mục `cha::con::chau` cực kỳ trực quan.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1135507717`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/ijgnd/anki__screenshots/master/1135507717__extended_tag_dialog__new_white.gif'
        ]
    },
    {
        'title': '🙈 Cloze (Hide All) — Ẩn toàn bộ các vị trí đục lỗ cùng một lúc trên thẻ Cloze',
        'code': '1709973686',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🙈 Cloze (Hide All) — Tăng độ khó & kiểm tra trí nhớ toàn diện\n\n'
            'Mặc định trên Anki, khi một câu có 3 chỗ đục lỗ (c1, c2, c3), khi ôn thẻ c1 thì c2 và c3 vẫn hiện ra lộ liễu. Điều này khiến bạn vô tình bị "nhớ mồi" từ ngữ cảnh xung quanh. **Cloze (Hide All)** sẽ ẩn toàn bộ các vị trí c1, c2, c3 cùng lúc!\n\n'
            '---\n\n'
            '### ✨ Lợi ích học tập vượt trội:\n'
            '* 🧠 **Ép não phải nhớ thực chất**: Bạn phải tự nhớ ra từ còn thiếu mà không thể nhìn trộm các đáp án của những chỗ trống bên cạnh.\n'
            '* 🎯 **Rất thích hợp cho học ngữ pháp & công thức**: Khi học một bài thơ, đoạn hội thoại hay công thức toán dài có nhiều biến số.\n'
            '* 👁️ **Mở đáp án theo từng bước**: Click vào từng ô để hiện đáp án dần dần.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1709973686`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/trgkanki/cloze_hide_all/a738645aae30265238e8c5b46dd32b55cb6160b1/docs/cha_with_header_card.png'
        ]
    },
    {
        'title': '🌐 Anki Web Browser — Trình duyệt web tích hợp ngay trong Anki để tra cứu & kéo thả',
        'code': '864545277',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🌐 Anki Web Browser — Tra từ điển & tìm ảnh ngay trong cửa sổ soạn thảo\n\n'
            'Mỗi khi cần tra nghĩa một từ hoặc tìm một tấm ảnh minh họa, bạn lại phải chuyển tab qua Chrome/Edge rồi copy dán lại? **Anki Web Browser** nhúng hẳn một trình duyệt web thu nhỏ vào ngay cạnh cửa sổ soạn thảo thẻ!\n\n'
            '---\n\n'
            '### ✨ Thao tác tạo thẻ thần tốc:\n'
            '* 🔎 **Tra cứu 1 click**: Bôi đen từ vựng trong thẻ, bấm phím tắt là trình duyệt bên cạnh tự động mở Google Images, Từ điển Cambridge hoặc Wikipedia.\n'
            '* 🖱️ **Kéo thả trực tiếp (Drag & Drop)**: Thấy tấm ảnh ưng ý trên web? Chỉ cần kéo thẳng tấm ảnh đó thả vào thẻ Anki là xong, không cần lưu file về máy.\n'
            '* ⚙️ **Cấu hình sẵn các trang web yêu thích**: Tự do cài đặt các trang từ điển hoặc nguồn tài liệu học tập quen thuộc.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `864545277`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://github.com/ssricardo/anki-web-browser/raw/master/doc/anki-webb-review.gif'
        ]
    },
    {
        'title': '🛡️ Anki Habitica — Đồng bộ kinh nghiệm game RPG Habitica khi học Anki',
        'code': '1758045507',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🛡️ Anki Habitica — Biến nỗ lực học Anki thành sức mạnh trong game RPG\n\n'
            'Nếu bạn đang dùng ứng dụng quản lý thói quen phong cách game nhập vai **Habitica**, add-on này sẽ kết nối tài khoản Habitica trực tiếp với Anki của bạn!\n\n'
            '---\n\n'
            '### ✨ Lợi ích kết hợp:\n'
            '* ⚔️ **Nhận EXP & Vàng khi học bài**: Cứ hoàn thành một mốc thẻ review nhất định, nhân vật trong game Habitica của bạn sẽ được cộng Điểm kinh nghiệm (EXP), Mana và Vàng để mua trang bị.\n'
            '* 🐉 **Cùng tổ đội săn Boss**: Nỗ lực cày thẻ của bạn sẽ biến thành sát thương đánh quái cùng đồng đội trong bang hội Habitica.\n'
            '* 💀 **Phạt khi bỏ bê**: Giúp bạn có thêm kỷ luật sắt vì lười học sẽ khiến nhân vật bị mất máu!\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1758045507`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://github.com/eshapard/AnkiHabitica/raw/master/AnkiHabitica_msgbox.png'
        ]
    },
    {
        'title': '🔘 Multiple Choice for Anki — Tạo câu hỏi trắc nghiệm tương tác A/B/C/D',
        'code': '1566095810',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🔘 Multiple Choice for Anki — Luyện thi trắc nghiệm chân thực trên Anki\n\n'
            'Bạn đang ôn thi các chứng chỉ quốc tế, thi đại học hoặc thi bằng lái xe với hàng nghìn câu hỏi trắc nghiệm 4 lựa chọn? **Multiple Choice for Anki** cung cấp loại thẻ trắc nghiệm tương tác có thể click chọn trực tiếp!\n\n'
            '---\n\n'
            '### ✨ Tính năng thi cử chuyên nghiệp:\n'
            '* 🔀 **Tự động đảo thứ tự đáp án (Shuffle)**: Mỗi lần thẻ hiện lên, các lựa chọn A, B, C, D sẽ bị xáo trộn vị trí ngẫu nhiên để tránh việc bạn học vẹt "câu này chọn C".\n'
            '* 🖱️ **Click hoặc bấm phím 1, 2, 3, 4**: Click chọn đáp án là hệ thống lập tức chấm điểm xanh/đỏ và hiện giải thích chi tiết.\n'
            '* 📋 **Dễ dàng soạn câu hỏi**: Cú pháp tạo câu hỏi trắc nghiệm cực kỳ đơn giản và nhanh gọn.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1566095810`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/zjosua/anki-mc/master/screenshots/addon_config.png'
        ]
    },
    {
        'title': '🔗 Merge Duplicate Notes — Gộp & xử lý triệt để các thẻ ghi chú bị trùng lặp',
        'code': '1425504015',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🔗 Merge Duplicate Notes — Dọn dẹp sạch sẽ bộ thẻ bị trùng lặp\n\n'
            'Khi tải nhiều bộ thẻ từ nhiều nguồn khác nhau hoặc nhập từ vựng qua nhiều năm, bạn sẽ dễ gặp tình trạng một từ vựng bị tạo thành 2, 3 thẻ riêng lẻ. **Merge Duplicate Notes** sẽ tự động tìm và gộp chúng lại làm một!\n\n'
            '---\n\n'
            '### ✨ Cơ chế gộp thông minh:\n'
            '* 🧹 **Gộp nội dung không làm mất dữ liệu**: Gộp toàn bộ ví dụ, hình ảnh và ghi chú phụ từ thẻ trùng vào thẻ chính.\n'
            '* ⏳ **Bảo tồn lịch sử học tập**: Giữ lại thẻ có độ chín (Interval/Stability) cao nhất để bạn không phải học lại từ đầu.\n'
            '* 🎯 **Xem trước trước khi gộp (Preview Diff)**: Hiển thị bảng đối chiếu rõ ràng trước khi bạn quyết định bấm gộp hàng loạt.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1425504015`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://user-images.githubusercontent.com/69171671/101429753-99032900-38fb-11eb-8b8d-06720ee7ef9a.png'
        ]
    },
    {
        'title': '📝 Batch Editing — Chỉnh sửa hàng loạt nội dung nhiều thẻ cùng lúc trong Browser',
        'code': '291119185',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 📝 Batch Editing — Thay đổi hàng trăm thẻ chỉ trong 1 thao tác\n\n'
            'Bạn có 500 thẻ muốn thêm cùng một ghi chú vào cuối trường, hoặc muốn dán đè một thông tin mới vào hàng loạt thẻ đã chọn? Làm thủ công từng thẻ sẽ mất cả buổi tối. **Batch Editing** (tác giả Glutanimate) giúp bạn làm điều đó trong 2 giây!\n\n'
            '---\n\n'
            '### ✨ Khả năng chỉnh sửa hàng loạt:\n'
            '* ➕ **Append / Prepend**: Thêm nội dung vào trước hoặc sau trường văn bản của hàng loạt thẻ.\n'
            '* 🔄 **Replace Field**: Thay thế toàn bộ nội dung của trường chỉ định trên các thẻ được chọn.\n'
            '* 🛡️ **An toàn tuyệt đối**: Hỗ trợ Undo (`Ctrl + Z`) nếu bạn lỡ thao tác nhầm.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `291119185`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/glutanimate/batch-editing/master/screenshots/screenshot.png'
        ]
    },
    {
        'title': '📑 ReMemo — Tùy biến thanh Sidebar bảng điều khiển Anki gọn gàng',
        'code': '1988760596',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 📑 ReMemo (Customize Sidebar) — Sắp xếp gọn gàng thanh danh mục Anki\n\n'
            'Khi bạn có quá nhiều deck, nhiều thẻ Note Type và hàng trăm tags, thanh Sidebar bên trái của Anki Browser sẽ trở nên dài ngoằng và lộn xộn. **ReMemo** giúp bạn thu gọn và tổ chức lại thanh Sidebar ngăn nắp!\n\n'
            '---\n\n'
            '### ✨ Tiện ích cải tiến:\n'
            '* 📁 **Gom nhóm thông minh**: Ẩn bớt các mục không cần thiết, gom các bộ thẻ ít dùng vào nhóm phụ.\n'
            '* 🔍 **Tìm kiếm nhanh trong Sidebar**: Gõ từ khóa để lọc ngay deck hoặc tag cần tìm trong tích tắc.\n'
            '* 🎨 **Tùy chỉnh biểu tượng**: Thêm icon màu sắc để dễ dàng nhận diện danh mục.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1988760596`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/yukach/anki21-addon-customize-sidebar/master/picture.jpg'
        ]
    },
    {
        'title': '📌 Frozen Fields — Ghim giữ nguyên nội dung khi tạo nhiều thẻ liên tiếp',
        'code': '516643804',
        'compat': 'Anki 2.1.x (Classic/Legacy mode)',
        'content': (
            '# 📌 Frozen Fields (Classic) — Add-on ghim trường kinh điển của Glutanimate\n\n'
            'Khi tạo hàng chục thẻ có chung một chủ đề, chương sách hoặc nguồn tham khảo, việc phải gõ lại cùng một thông tin cho mỗi thẻ mới là nỗi ác mộng. **Frozen Fields** cho phép bạn bấm vào biểu tượng chiếc ghim nhỏ cạnh mỗi trường để giữ nguyên nội dung đó cho các thẻ tiếp theo!\n\n'
            '---\n\n'
            '### ✨ Lợi ích tuyệt vời:\n'
            '* 📌 **Ghim 1 click**: Chỉ cần bấm icon chiếc ghim (hoặc phím tắt `F9`), nội dung trường đó sẽ đóng băng cố định.\n'
            '* ⏩ **Tăng tốc độ nhập thẻ gấp 3 lần**: Chỉ việc tập trung gõ từ mới và nghĩa mới, các thông tin phụ (Deck, Nguồn, Chủ đề) đều tự động giữ nguyên.\n'
            '* *(Lưu ý: Trên các phiên bản Anki mới nhất, tính năng này đã được tích hợp bằng icon chiếc ghim cạnh ô field, nhưng với các bạn dùng bản Anki cũ thì add-on này vẫn là huyền thoại không thể thiếu).*\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `516643804`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/glutanimate/frozen-fields/master/screenshots/screenshot.png'
        ]
    },
    {
        'title': '🇯🇵 Japanese Pitch Accent (Migaku) — Thêm biểu đồ cao độ ngữ điệu tiếng Nhật',
        'code': '148002038',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🇯🇵 Japanese Pitch Accent (Migaku) — Nói tiếng Nhật chuẩn như người bản xứ\n\n'
            'Người học tiếng Nhật thường gặp khó khăn về **Pitch Accent** (trọng âm cao độ) — cùng là chữ "Ame" nhưng đọc bổng ở đầu là "Cơn mưa", bổng ở sau lại là "Viên kẹo". Add-on này tự động vẽ sơ đồ ngữ điệu cao độ chuẩn xác cho mọi từ vựng tiếng Nhật trên thẻ Anki!\n\n'
            '---\n\n'
            '### ✨ Tính năng hỗ trợ ngữ điệu đỉnh cao:\n'
            '* 📈 **Vẽ sơ đồ cao độ trực quan**: Hiển thị đường kẻ ngữ điệu (Atamadaka, Nakadaka, Odaka, Heiban) rõ ràng trên chữ Hán và Hiragana.\n'
            '* 🎨 **Đánh dấu màu sắc theo loại ngữ điệu**: Giúp mắt bạn nhận diện phản xạ ngay từ cái nhìn đầu tiên.\n'
            '* ⚡ **Xử lý hàng loạt toàn bộ bộ thẻ**: Quét cả nghìn từ vựng tiếng Nhật và tự động điền Pitch Accent chỉ trong vài phút.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `148002038`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/IllDepence/anki_add_pitch_plugin/master/doc/ankiweb_img/menu.png'
        ]
    },
    {
        'title': '🌙 Zoom 24 & Night Mode Enhancer — Phóng to thu nhỏ font chữ & tối ưu Dark Mode',
        'code': '1923741581',
        'compat': 'Anki 2.1.x / 23.x / 24.x',
        'content': (
            '# 🌙 Zoom 24 & Night Mode Enhancer — Tối ưu tầm nhìn & bảo vệ mắt\n\n'
            'Nếu bạn dùng màn hình độ phân giải cao 2K/4K khiến font chữ trên Anki quá nhỏ, hoặc bạn muốn phóng to ảnh minh họa để nhìn rõ chi tiết khi ngồi xa màn hình, add-on này sẽ khóa cố định mức Zoom trên toàn bộ ứng dụng Anki!\n\n'
            '---\n\n'
            '### ✨ Lợi ích thực tế:\n'
            '* 🔍 **Khóa độ Zoom vĩnh viễn**: Khác với Zoom tạm thời bằng `Ctrl + Plus`, add-on này ghi nhớ mức phóng to (120%, 150%) vĩnh viễn cả sau khi tắt Anki mở lại.\n'
            '* 👁️ **Chống mỏi mắt khi học lâu**: Tăng kích cỡ chữ trên cả màn hình chính, màn hình chọn deck và màn hình review thẻ.\n'
            '* 🌙 **Cân chỉnh độ tương phản Dark Mode**: Giúp các thẻ nền tối hiển thị chữ trắng êm mắt, không bị gắt sáng.\n\n'
            '---\n\n'
            '### 📥 Cách cài đặt:\n'
            '1. Mở Anki → **Tools** → **Add-ons** → **Get Add-ons...**\n'
            '2. Dán mã code: `1923741581`\n'
            '3. Nhấn **OK** và khởi động lại Anki.'
        ),
        'images': [
            'https://raw.githubusercontent.com/shigeyukey/my_addons/main/media_files/zoom%2024.gif'
        ]
    }
]

def post_batch_3():
    print(f'Bắt đầu đăng loạt 20 add-on mới vào diễn đàn (Channel {CHANNEL_ID})...\n')
    posted_threads = []
    
    for idx, item in enumerate(addons_20, 1):
        it_title = item['title']
        print(f'[{idx}/20] Đang xử lý: {it_title}...')
        
        # Download images
        downloaded = []
        for img_idx, img_url in enumerate(item['images']):
            ext = '.gif' if '.gif' in img_url.lower() else ('.jpg' if any(j in img_url.lower() for j in ['.jpg', '.jpeg']) else '.png')
            local_path = os.path.join(TEMP_DIR, f'b3_{idx}_{img_idx}{ext}')
            try:
                req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as resp:
                    with open(local_path, 'wb') as f:
                        f.write(resp.read())
                downloaded.append((f'img_{img_idx}{ext}', local_path))
                print(f'   ⬇️ Đã tải ảnh: {img_idx}')
            except Exception as e:
                print(f'   ⚠️ Lỗi tải ảnh: {e}')
                
        url = f'https://discord.com/api/v10/channels/{CHANNEL_ID}/threads'
        payload = {
            'name': item['title'],
            'auto_archive_duration': 4320,
            'message': {
                'content': item['content']
            }
        }
        
        files = {'payload_json': (None, json.dumps(payload), 'application/json')}
        opened_files = []
        for i, (name, path) in enumerate(downloaded):
            mime = 'image/gif' if path.endswith('.gif') else ('image/jpeg' if path.endswith(('.jpg', '.jpeg')) else 'image/png')
            f = open(path, 'rb')
            opened_files.append(f)
            files[f'files[{i}]'] = (name, f, mime)
            
        try:
            res = requests.post(url, headers=headers, files=files)
            for f in opened_files:
                f.close()
                
            if res.status_code in (200, 201):
                res_data = res.json()
                th_id = res_data.get('id')
                th_name = res_data.get('name')
                print(f'   ✅ Đã tạo thread: {th_name} (ID: {th_id})')
                posted_threads.append({
                    'title': th_name,
                    'id': th_id,
                    'code': item['code']
                })
            else:
                print(f'   ❌ Lỗi tạo thread ({res.status_code}):', res.text)
        except Exception as e:
            for f in opened_files:
                f.close()
            print(f'   ❌ Exception khi tạo thread: {e}')
            
        print('   ⏳ Nghỉ 4 giây tránh rate limit...')
        time.sleep(4)
        
    print(f'\n🎉 Đã hoàn tất đăng {len(posted_threads)}/20 add-on mới lên diễn đàn!')
    
    # Cập nhật thêm vào bài ghim tổng hợp
    if posted_threads:
        print('\n📌 Đang gửi phần bổ sung vào bài ghim tổng hợp danh mục...')
        PINNED_THREAD_ID = '1567445151956213841'
        
        # Chia làm 2 tin nhắn nếu quá dài
        msg_1 = "### 🌟 Cập nhật thêm 10 Add-on hữu ích mới (Phần 1):\n"
        for pt in posted_threads[:10]:
            short_name = pt['title'].split('—')[0].strip()
            msg_1 += f"* 🔹 **{short_name}** — [Xem bài viết](https://discord.com/channels/867268399687663616/{pt['id']}) *(Mã: `{pt['code']}`)*\n"
            
        msg_2 = "### 🌟 Cập nhật thêm 10 Add-on hữu ích mới (Phần 2):\n"
        for pt in posted_threads[10:]:
            short_name = pt['title'].split('—')[0].strip()
            msg_2 += f"* 🔹 **{short_name}** — [Xem bài viết](https://discord.com/channels/867268399687663616/{pt['id']}) *(Mã: `{pt['code']}`)*\n"
            
        msg_url = f"https://discord.com/api/v10/channels/{PINNED_THREAD_ID}/messages"
        up_res1 = requests.post(msg_url, headers={'Authorization': f'Bot {token}', 'Content-Type': 'application/json'}, json={'content': msg_1})
        time.sleep(1)
        up_res2 = requests.post(msg_url, headers={'Authorization': f'Bot {token}', 'Content-Type': 'application/json'}, json={'content': msg_2})
        print('Cập nhật bài ghim status:', up_res1.status_code, up_res2.status_code)

if __name__ == '__main__':
    post_batch_3()
