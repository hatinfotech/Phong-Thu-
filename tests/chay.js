/** Kiểm thử bản JS và đối chiếu với bản PHP: node tests/chay.js */

'use strict';

var NamSinh = require('../src/nam-sinh.js');
var fs = require('fs');
var path = require('path');

var tong = 0;
var loi = 0;

function ktra(ten, nhan, mongDoi) {
  tong++;
  var a = JSON.stringify(nhan);
  var b = JSON.stringify(mongDoi);

  if (a === b) {
    console.log('  ok   ' + ten);
    return;
  }

  loi++;
  console.log('  SAI  ' + ten);
  console.log('       nhận:     ' + a);
  console.log('       mong đợi: ' + b);
}

console.log('Ngày Tết');
[[1990, '27/01/1990'], [2000, '05/02/2000'], [2020, '25/01/2020'], [2024, '10/02/2024'],
 [2025, '29/01/2025'], [2026, '17/02/2026'], [2027, '06/02/2027']].forEach(function (c) {
  var d = NamSinh.ngayTet(c[0]);
  var s = ('0' + d[0]).slice(-2) + '/' + ('0' + d[1]).slice(-2) + '/' + d[2];
  ktra('Tết ' + c[0], s, c[1]);
});

console.log('\nNăm 2026');
ktra('can chi', NamSinh.canChi(2026), 'Bính Ngọ');
ktra('nạp âm', NamSinh.napAm(2026), 'Thiên Hà Thủy');
ktra('ngũ hành', NamSinh.nguHanh(2026), 'Thủy');
ktra('cung mệnh nam', NamSinh.cungMenh(2026, 'Nam').cung, 'Cấn');
ktra('cung mệnh nữ', NamSinh.cungMenh(2026, 'Nữ').cung, 'Đoài');
ktra('16/02/2026 vẫn là Ất Tỵ', NamSinh.tuNgaySinh(16, 2, 2026, 'Nam').canChi, 'Ất Tỵ');
ktra('17/02/2026 là Bính Ngọ', NamSinh.tuNgaySinh(17, 2, 2026, 'Nam').canChi, 'Bính Ngọ');

console.log('\nDanh sách năm cho <select>');
var ds = NamSinh.danhSachNam(1900, 2030);
ktra('năm mới nhất', ds[0].nam, 2030);
ktra('có năm 2026', ds.some(function (x) { return x.nam === 2026; }), true);
ktra('số năm', ds.length, 131);

console.log('\nĐối chiếu với bản PHP (1900-2099, cả hai giới)');
var mocPhp = path.join(__dirname, 'moc-php.json');
if (fs.existsSync(mocPhp)) {
  var moc = JSON.parse(fs.readFileSync(mocPhp, 'utf8'));
  var lech = [];

  Object.keys(moc).forEach(function (nam) {
    var y = Number(nam);
    var js = {
      canChi: NamSinh.canChi(y),
      napAm: NamSinh.napAm(y),
      cungNam: NamSinh.cungMenh(y, 'Nam').cung,
      cungNu: NamSinh.cungMenh(y, 'Nữ').cung,
      tet: NamSinh.ngayTet(y).join('/')
    };
    if (JSON.stringify(js) !== JSON.stringify(moc[nam])) {
      lech.push(nam + ': js=' + JSON.stringify(js) + ' php=' + JSON.stringify(moc[nam]));
    }
  });

  ktra('không lệch', lech, []);
} else {
  console.log('  bỏ qua (chạy tools/xuat-moc.php trước)');
}

console.log('\n' + tong + ' kiểm thử, ' + loi + ' sai');
process.exit(loi === 0 ? 0 : 1);
