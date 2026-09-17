/**
 * Ghép src/nam-sinh.js + src/va-devtools.js thành dist/fix-2026.js
 * — file dán thẳng vào Chrome DevTools Console.
 *
 *   node tools/dong-goi.js
 */

'use strict';

var fs = require('fs');
var path = require('path');

var goc = path.join(__dirname, '..');
var loi = fs.readFileSync(path.join(goc, 'src', 'nam-sinh.js'), 'utf8');
var va = fs.readFileSync(path.join(goc, 'src', 'va-devtools.js'), 'utf8');

var dauRa = path.join(goc, 'dist', 'fix-2026.js');

var noiDung = [
  '/**',
  ' * Mở rộng trang chấm điểm tên cho năm 2026 trở đi — chạy tạm tại trình duyệt.',
  ' *',
  ' * Dán toàn bộ file này vào Chrome DevTools → Console → Enter.',
  ' * Script sẽ tự mở khoá dropdown năm sinh và hiện bảng kết quả tính lại.',
  ' *',
  ' * Sau đó gõ trong Console:',
  ' *   PT2026.chuanDoan()                     xem giới hạn năm nằm ở đâu',
  ' *   PT2026.moKhoaNam(2030)                 mở khoá tới năm 2030',
  ' *   PT2026.tinh(14, 9, 2026, "Nam")        can chi / nạp âm / cung mệnh',
  ' *   PT2026.hienBang(14, 9, 2026, "Nam")    hiện bảng kết quả',
  ' *   PT2026.suaVanBan()                     sửa chữ hiển thị sai trong trang',
  ' *   await PT2026.kiemTraMayChu(2026)       hỏi thử máy chủ có tính được không',
  ' *',
  ' * LƯU Ý: script chỉ sửa được phần chạy trong trình duyệt. Nếu điểm số do máy',
  ' * chủ tính thì vẫn phải sửa code phía máy chủ — dùng src/NamSinh.php.',
  ' *',
  ' * Sinh tự động bởi tools/dong-goi.js — đừng sửa trực tiếp file này.',
  ' */',
  '(function () {',
  '  "use strict";',
  '',
  '  var module = { exports: {} };',
  '',
  loi,
  '',
  '  var NamSinh = module.exports;',
  '',
  va,
  '',
  '  window.PT2026 = PT;',
  '  PT.tuDong();',
  '  console.log("%c[2026] Xong. Gõ PT2026 để xem các lệnh có sẵn.",',
  '    "color:#0a7;font-weight:bold");',
  '}());',
  ''
].join('\n');

fs.mkdirSync(path.dirname(dauRa), { recursive: true });
fs.writeFileSync(dauRa, noiDung);

console.log('Đã ghi ' + dauRa + ' (' + Math.round(noiDung.length / 1024) + ' KB)');
