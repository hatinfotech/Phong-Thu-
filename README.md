# Phong thuỷ - thuộc tính năm sinh (không giới hạn năm)

Thư viện tính **can chi, nạp âm, ngũ hành, cung mệnh** từ ngày sinh dương lịch,
dùng cho trang chấm điểm tên (`tenphongthuy.vn/cham-diem-ten.html`).

## Vấn đề

Trang chấm điểm hiện chỉ tính được tới **năm 2025**: các bé sinh năm 2026 không
chọn được năm sinh, hoặc chọn được nhưng phần mệnh/cung mệnh để trống.

Nguyên nhân gần như chắc chắn là **dữ liệu năm được nhập cứng** — một trong ba
dạng sau (thường có cả ba):

1. `<select name="namsinh">` đổ ra bằng vòng lặp có cận trên cố định, ví dụ
   `for ($y = 2025; $y >= 1900; $y--)`;
2. bảng tra cứu can chi / nạp âm viết tay dừng ở dòng `2025 => 'Ất Tỵ'`;
3. bảng cung mệnh hoặc bảng ngày Tết (đổi dương sang âm) chỉ có dữ liệu tới 2025.

Thêm một năm vào bảng chỉ dời vấn đề sang 2027. Thư viện này thay bảng tra cứu
bằng **công thức**, nên đúng với mọi năm mà không phải bảo trì hàng năm:

- can chi: chu kỳ 60 năm (`can = (năm + 6) % 10`, `chi = (năm + 8) % 12`);
- nạp âm: 30 cặp lục thập hoa giáp, lấy mốc Giáp Tý 1984;
- cung mệnh: cửu cung bát trạch, có xử lý cung 5 ký gửi (nam về Khôn, nữ về Cấn);
- năm âm lịch: tính bằng thuật toán thiên văn (điểm sóc + kinh độ mặt trời,
  múi giờ GMT+7), không dùng bảng ngày Tết.

## Năm 2026

| | |
| --- | --- |
| Can chi | **Bính Ngọ** |
| Nạp âm | **Thiên Hà Thủy** (nước trên trời) |
| Ngũ hành | **Thủy** |
| Cung mệnh nam | **Cấn** - Thổ - Tây tứ mệnh |
| Cung mệnh nữ | **Đoài** - Kim - Tây tứ mệnh |
| Mùng 1 Tết | **17/02/2026** |

Bảng đầy đủ 2026-2045: [`docs/bang-nam.md`](docs/bang-nam.md).

**Lưu ý quan trọng với các bé sinh đầu năm:** năm can chi đổi vào mùng 1 Tết,
không phải 1/1 dương lịch. Bé sinh 16/02/2026 vẫn là **Ất Tỵ**, sinh 17/02/2026
mới là **Bính Ngọ**. `NamSinh::tuNgaySinh()` đã xử lý sẵn việc này.

## Dùng thư viện

### PHP

```php
require_once __DIR__ . '/src/NamSinh.php';

use TenPhongThuy\NamSinh;

$tt = NamSinh::tuNgaySinh(14, 9, 2026, 'Nam');

// $tt = [
//   'namDuong' => 2026,
//   'namAm'    => 2026,
//   'canChi'   => 'Bính Ngọ',
//   'napAm'    => 'Thiên Hà Thủy',
//   'nguHanh'  => 'Thủy',
//   'cungMenh' => ['so' => 8, 'cung' => 'Cấn', 'nguHanh' => 'Thổ', 'trach' => 'Tây tứ mệnh'],
//   'truocTet' => false,
// ];
```

Các hàm lẻ khi chỉ cần một phần:

```php
NamSinh::canChi(2026);              // 'Bính Ngọ'
NamSinh::napAm(2026);               // 'Thiên Hà Thủy'
NamSinh::nguHanh(2026);             // 'Thủy'
NamSinh::cungMenh(2026, 'Nữ');      // ['so' => 7, 'cung' => 'Đoài', ...]

TenPhongThuy\AmLich::namAmLich(16, 2, 2026);   // 2025
TenPhongThuy\AmLich::ngayTet(2026);            // [17, 2, 2026]
TenPhongThuy\AmLich::duongSangAm(14, 9, 2026); // ['ngay' => 3, 'thang' => 8, ...]
```

### JavaScript

`src/nam-sinh.js` là bản dịch sát bản PHP, dùng cho phần chạy trên trình duyệt
(đổ `<select>` năm sinh, hiện can chi ngay khi chọn ngày):

```html
<script src="/js/nam-sinh.js"></script>
<script>
  // đổ danh sách năm, mặc định tới năm hiện tại + 1 nên không bao giờ hết hạn
  NamSinh.danhSachNam().forEach(function (n) {
    select.add(new Option(n.nam + ' - ' + n.canChi, n.nam));
  });

  NamSinh.tuNgaySinh(14, 9, 2026, 'Nam').canChi; // 'Bính Ngọ'
</script>
```

### Sửa `<select>` năm sinh

Chỗ nào đang viết cận trên cố định thì thay bằng năm hiện tại, cộng thêm 1 để
bố mẹ đặt tên trước cho con chưa sinh:

```php
// trước:  for ($y = 2025; $y >= 1900; $y--)
$namMax = (int) date('Y') + 1;
for ($y = $namMax; $y >= 1900; $y--) { /* ... */ }
```

## Kiểm thử

```bash
php tests/chay.php    # 45 kiểm thử: ngày Tết, can chi, nạp âm, cung mệnh, 1900-2099
node tests/chay.js    # bản JS + đối chiếu kết quả với bản PHP
```

Ngày Tết do thư viện tính được đối chiếu với lịch đã công bố cho các năm 1990,
2000, 2020-2027 và khớp toàn bộ. Bản PHP và bản JS cho kết quả giống nhau trên
toàn dải 1900-2099 (`tools/xuat-moc.php` sinh mốc đối chiếu).

## Phạm vi

- Can chi, nạp âm: mọi năm.
- Cung mệnh: 1900-2099 (công thức cửu cung khác nhau theo thế kỷ; ngoài dải này
  hàm ném `InvalidArgumentException` thay vì trả kết quả sai).
- Âm lịch: dùng múi giờ GMT+7, đúng với lịch Việt Nam.

## Cấu trúc

```
src/AmLich.php      đổi dương lịch sang âm lịch, tìm ngày Tết
src/NamSinh.php     can chi, nạp âm, ngũ hành, cung mệnh
src/nam-sinh.js     bản JavaScript tương đương
tests/chay.php      kiểm thử PHP
tests/chay.js       kiểm thử JS và đối chiếu với PHP
tools/bang-tra.php  in bảng tra cứu Markdown
tools/xuat-moc.php  xuất mốc đối chiếu cho bản JS
docs/bang-nam.md    bảng tra cứu 2026-2045
```
