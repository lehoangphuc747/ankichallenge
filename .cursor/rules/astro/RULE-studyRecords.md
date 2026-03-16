## Quy tắc chỉnh `public/data/studyRecords.json`

1. **Không tự suy luận người học**
   - Chỉ thêm/bỏ user **khi người dùng gõ rõ tên** trong chat.
   - Không tự động thêm "core team" hoặc người "thường xuất hiện" nếu người dùng không nhắc.

2. **Cách thêm cho từng ngày**
   - Mỗi ngày trong `studyRecords.json` có dạng:
     - `"YYYY-MM-DD": { "<userId>": true, ... }`
   - Khi người dùng bảo:  
     - `Dxx: tên1, tên2, ...`  
     thì:
     1. Map từng tên sang đúng `id` trong `users.json`.
     2. **Nếu ngày đó đã tồn tại**:
        - Thêm các `id` mới (chưa có) vào object của ngày đó.
        - **Không xoá** các `id` cũ, trừ khi người dùng nói rõ là "bỏ / reset / ghi đè".
     3. **Nếu ngày đó chưa tồn tại**:
        - Tạo key mới với **chỉ** các `id` từ list người dùng gõ.

3. **Quy tắc cho Dxx sửa lại**
   - Nếu người dùng nói kiểu:  
     - `Dxx: A, B, C (cái nào trùng thì bỏ qua, chỉ thêm cái chưa có)`  
     thì:
     - Kiểm tra ngày Dxx hiện có những `id` nào.
     - Map list mới sang `id`.
     - **Chỉ thêm** các `id` chưa có trong ngày đó.
     - Không xoá bất kỳ `id` nào đang có, trừ khi được yêu cầu rõ ràng.

4. **Ưu tiên tuyệt đối yêu cầu người dùng**
   - Nếu có mâu thuẫn giữa "pattern" và list cụ thể trong chat, **luôn** tin list cụ thể.
   - Khi không chắc, **không tự quyết**, mà giữ nguyên và hỏi lại (nếu người dùng cho phép).

## Bảng nickname → ID (core thường dùng)

- tram1601 → 34  
- vu → 33  
- duy sanji → 37  
- luxultm → 86  
- alan le (`alan.ta.le`) → 79  
- madbear (Tiếng Hàn Phúc Lee) → 9  
- tracy (`thuy.tracy.seni`) → 77  
- Trinhthuthao (`Trinhthuthao2905`) → 10  
- 13nov (`13november._`) → 32  
- noctivia (`noctivia10`) → 31  
- bich (`BICH`) → 42  
- npchieens (`phucschiens`) → 56  
- nger (`Nger`) → 44  
- nothin (`nothinn_39086`) → 43  
- kirstin (`kizrin`) → 45  
- chauvegas → 46  
- dulgi (`dulgi_kun`) → 52  
- thocao (`thocao118`) → 24  
- ava (`pthuy3x3`) → 26  
- meo xinh dep (`meoxinhdep5470`) → 49  
- wind (`Wind_2605`) → 64  
- hana (`hana.112`) → 25  
- myhuyen → 35  
- linh0101 (`linh0101`) → 63  
- andrew (`adrewvn_91234`) → 69  
- btram 89888 (`btram_89888`) → 58  
- leductuan73 → 38  
- long hoang (`gnol2k`) → 39  

> Khi gặp nickname trong bảng này, có thể dùng trực tiếp ID tương ứng  
> mà không cần mở `users.json`, trừ khi bạn nghi ngờ nó đã bị đổi trong bản mới.

