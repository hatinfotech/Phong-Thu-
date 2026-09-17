# Vá tạm bằng Chrome DevTools

`dist/fix-2026.js` là bản đóng gói sẵn để dán thẳng vào Console — mở rộng
dropdown năm sinh và tính lại can chi / nạp âm / cung mệnh ngay tại trình duyệt.

## Script làm được gì, không làm được gì

Script chạy trong trình duyệt nên chỉ sửa được **phần phía trình duyệt**:

| | |
| --- | --- |
| Dropdown năm sinh dừng ở 2025 | **sửa được** — thêm năm còn thiếu vào `<select>` |
| `<input max="2025">` chặn nhập | **sửa được** — nâng `max` |
| Can chi / nạp âm / cung mệnh hiển thị sai hoặc trống | **sửa được** — tính lại và thay chữ |
| Điểm số do máy chủ (PHP) chấm | **không sửa được** — phải sửa code máy chủ |

Nếu điểm chấm tên do máy chủ tính, việc chọn được 2026 chỉ khiến trình duyệt
gửi `namsinh=2026` lên máy chủ; máy chủ vẫn dùng bảng tra cứu cũ. Chạy
`await PT2026.kiemTraMayChu(2026)` để biết chắc lỗi nằm ở đâu — script sẽ hỏi
thử máy chủ và báo lại. Khi máy chủ là thủ phạm thì dùng `src/NamSinh.php`.

Đây là bản vá tạm, chỉ có tác dụng trong tab đang mở; tải lại trang là mất.
Người dùng thật vào web vẫn gặp lỗi cũ cho tới khi sửa source.

## Cách dùng

1. Mở trang chấm điểm tên trên Chrome.
2. `F12` (hoặc `Cmd+Option+I`) → tab **Console**.
3. Lần đầu Chrome chặn dán thì gõ `allow pasting` rồi Enter.
4. Mở `dist/fix-2026.js`, copy toàn bộ, dán vào Console, Enter.

Script tự chạy: mở khoá dropdown và hiện bảng kết quả (nếu URL đã có ngày sinh).

## Các lệnh trong Console

```js
PT2026.chuanDoan()                  // giới hạn năm đang nằm ở chỗ nào
PT2026.moKhoaNam()                  // mở tới năm nay + 1
PT2026.moKhoaNam(2035)              // mở tới 2035
PT2026.tinh(14, 9, 2026, 'Nam')     // {canChi, napAm, nguHanh, cungMenh, truocTet}
PT2026.hienBang(14, 9, 2026, 'Nam') // bảng nổi góc phải
PT2026.suaVanBan()                  // thay chữ hiển thị sai trong trang
await PT2026.kiemTraMayChu(2026)    // máy chủ có tính được 2026 không
PT2026.NamSinh.canChi(2026)         // 'Bính Ngọ'

copy(PT2026.baoCao())               // chép báo cáo gọn để gửi đi
copy(await PT2026.baoCaoDayDu())    // báo cáo kèm kết quả hỏi thử máy chủ
```

`baoCao()` trả về JSON gồm: tình trạng dropdown **trước** khi vá (chụp lại
trước khi script đụng vào) và sau khi vá, các `<input max>` đang chặn, danh sách
file JS của trang, những dòng script có năm gắn cứng, giá trị đúng phải ra, và
trang đang thực sự hiển thị gì. Chép rồi gửi là đủ để biết phải sửa ở đâu.

Gọi không tham số thì script tự đọc `ngaysinh`, `thangsinh`, `namsinh`,
`gioitinh` trên URL, không có thì đọc từ các ô trong form.

## Chạy lại không cần dán mỗi lần

**Snippets** (giữ được sau khi tải lại trang, vẫn phải bấm chạy):
DevTools → **Sources** → **Snippets** → **New snippet** → dán nội dung
`dist/fix-2026.js` → `Ctrl+Enter` mỗi khi cần.

**Local Overrides** (tự chạy, hợp khi muốn thử như thật trước lúc sửa server):
DevTools → **Sources** → **Overrides** → chọn một thư mục → tick *Enable*.
Mở tab **Network**, chuột phải vào file JS của trang → **Save for overrides**,
rồi chèn nội dung `dist/fix-2026.js` vào cuối file đó. Từ đó mỗi lần tải trang
Chrome dùng bản đã sửa. Chỉ có tác dụng trên máy của mình.

**Bookmarklet** (bấm một nút trên thanh bookmark):

```bash
node -e "console.log('javascript:'+encodeURIComponent(require('fs').readFileSync('dist/fix-2026.js','utf8')))"
```

Copy kết quả làm URL của một bookmark mới.

## Dựng lại file

`dist/fix-2026.js` được sinh tự động, đừng sửa trực tiếp:

```bash
node tools/dong-goi.js                                          # dựng lại
NODE_PATH=/opt/node22/lib/node_modules node tests/chay-trinh-duyet.js   # kiểm thử bằng Chromium thật
```

Bộ kiểm thử mở Chromium, dán script vào một trang giả có dropdown dừng ở 2025
(`tests/gia/trang-gia.html`) và kiểm tra: năm 2026 được thêm đúng thứ tự, không
mất năm cũ, chạy lại không nhân đôi, `max` của input được nâng, bảng kết quả ghi
đúng Bính Ngọ / Thiên Hà Thủy / cung Cấn, chữ hiển thị sai được thay, và script
không ghi đè biến `NamSinh` sẵn có của trang.
