/**
 * Kiểm thử dist/fix-2026.js bằng Chromium thật.
 *
 *   NODE_PATH=/opt/node22/lib/node_modules node tests/chay-trinh-duyet.js
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chromium = require('playwright').chromium;

var goc = path.join(__dirname, '..');
var script = fs.readFileSync(path.join(goc, 'dist', 'fix-2026.js'), 'utf8');
var trang = 'file://' + path.join(goc, 'tests', 'gia', 'trang-gia.html');

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

(async function () {
  var browser = await chromium.launch();
  var namNay = new Date().getFullYear();

  // --- 1. dán script vào trang chưa có tham số ngày sinh
  var page = await browser.newPage();
  await page.goto(trang);

  ktra('trước khi vá: năm lớn nhất', await page.evaluate(function () {
    return Math.max.apply(null, [].slice.call(namsinh.options).map(function (o) {
      return Number(o.value);
    }));
  }), 2025);

  await page.evaluate(script);

  console.log('\nSau khi dán script');
  ktra('năm lớn nhất', await page.evaluate(function () {
    return Math.max.apply(null, [].slice.call(namsinh.options).map(function (o) {
      return Number(o.value);
    }));
  }), namNay + 1);

  ktra('có option 2026', await page.evaluate(function () {
    return [].slice.call(namsinh.options).some(function (o) { return o.value === '2026'; });
  }), true);

  ktra('2026 nằm đúng thứ tự giảm dần', await page.evaluate(function () {
    var ds = [].slice.call(namsinh.options).map(function (o) { return Number(o.value); });
    for (var i = 1; i < ds.length; i++) {
      if (ds[i] > ds[i - 1]) { return false; }
    }
    return true;
  }), true);

  ktra('không mất năm cũ', await page.evaluate(function () {
    return namsinh.options.length;
  }), (namNay + 1) - 1900 + 1);

  ktra('input max được nâng', await page.evaluate(function () {
    return namsinh_nhap.getAttribute('max');
  }), String(namNay + 1));

  ktra('chọn được 2026', await page.evaluate(function () {
    namsinh.value = '2026';
    return namsinh.value;
  }), '2026');

  ktra('tính đúng năm 2026', await page.evaluate(function () {
    var t = PT2026.tinh(14, 9, 2026, 'Nam');
    return [t.canChi, t.napAm, t.nguHanh, t.cungMenh.cung];
  }), ['Bính Ngọ', 'Thiên Hà Thủy', 'Thủy', 'Cấn']);

  ktra('bé sinh trước Tết 2026', await page.evaluate(function () {
    var t = PT2026.tinh(16, 2, 2026, 'Nam');
    return [t.canChi, t.truocTet];
  }), ['Ất Tỵ', true]);

  ktra('chạy lại không nhân đôi option', await page.evaluate(function (s) {
    var truoc = namsinh.options.length;
    PT2026.moKhoaNam();
    return namsinh.options.length === truoc;
  }), true);

  // --- 2. trang kết quả có sẵn tham số trên URL
  var page2 = await browser.newPage();
  await page2.goto(trang + '?ngaysinh=14&thangsinh=9&namsinh=2026&gioitinh=Nam');
  await page2.evaluate(script);

  console.log('\nTrang kết quả có tham số 2026 trên URL');
  ktra('đọc đúng tham số', await page2.evaluate(function () {
    var p = PT2026.thamSo();
    return [p.ngay, p.thang, p.nam, p.gioiTinh];
  }), [14, 9, 2026, 'Nam']);

  ktra('bảng kết quả hiện ra', await page2.evaluate(function () {
    return !!document.getElementById('pt2026-bang');
  }), true);

  ktra('bảng ghi Bính Ngọ', await page2.evaluate(function () {
    return document.getElementById('pt2026-bang').innerText.indexOf('Bính Ngọ') !== -1;
  }), true);

  ktra('bảng ghi cung Cấn', await page2.evaluate(function () {
    return document.getElementById('pt2026-bang').innerText.indexOf('Cấn') !== -1;
  }), true);

  ktra('trang đang hiển thị sai (Ất Tỵ)', await page2.evaluate(function () {
    return document.getElementById('canchi').innerText;
  }), 'Ất Tỵ');

  await page2.evaluate(function () { PT2026.suaVanBan(); });

  ktra('suaVanBan sửa can chi', await page2.evaluate(function () {
    return document.getElementById('canchi').innerText;
  }), 'Bính Ngọ');

  ktra('suaVanBan sửa nạp âm', await page2.evaluate(function () {
    return document.getElementById('napam').innerText;
  }), 'Thiên Hà Thủy');

  ktra('đóng bảng được', await page2.evaluate(function () {
    var nut = document.querySelector('#pt2026-bang span[onclick]');
    nut.click();
    return document.getElementById('pt2026-bang');
  }), null);

  console.log('\nBáo cáo để gửi đi');
  var bc = JSON.parse(await page2.evaluate(function () { return PT2026.baoCao(); }));

  ktra('báo cáo là JSON hợp lệ', typeof bc, 'object');
  ktra('ghi nhận select năm sinh', bc.truocKhiVa.select.length >= 1, true);
  ktra('trạng thái gốc: max = 2025', bc.truocKhiVa.select[0].max, 2025);
  ktra('trạng thái gốc: input max = 2025', bc.truocKhiVa.input[0].max, '2025');
  ktra('sau khi vá: max = năm nay + 1', bc.sauKhiVa.select[0].max, namNay + 1);
  ktra('ghi nhận tham số', [bc.thamSo.nam, bc.thamSo.gioiTinh], [2026, 'Nam']);
  ktra('ghi nhận giá trị đúng', [bc.dungRaPhaiLa.canChi, bc.dungRaPhaiLa.cung], ['Bính Ngọ', 'Cấn']);
  ktra('bắt được dòng script gắn năm cứng', bc.scriptNoiDungNghiNgo.some(function (d) {
    return d.indexOf('2025') !== -1 && /for\s*\(/.test(d);
  }), true);
  ktra('báo cáo đủ gọn để dán', JSON.stringify(bc).length < 8000, true);
  ktra('báo cáo sau suaVanBan: trang đã hiện đúng', [
    bc.trangDangHienThi.coCanChiDung, bc.trangDangHienThi.coCanChiNamTruoc
  ], [true, false]);

  // trang sạch: bảng nổi của script không được tính là "trang đang hiển thị đúng"
  var pageSach = await browser.newPage();
  await pageSach.goto(trang + '?ngaysinh=14&thangsinh=9&namsinh=2026&gioitinh=Nam');
  await pageSach.evaluate(script);
  var bcSach = JSON.parse(await pageSach.evaluate(function () { return PT2026.baoCao(); }));

  ktra('bảng nổi đang hiện', await pageSach.evaluate(function () {
    return !!document.getElementById('pt2026-bang');
  }), true);
  ktra('không tính bảng nổi vào chữ trên trang', [
    bcSach.trangDangHienThi.coCanChiDung, bcSach.trangDangHienThi.coCanChiNamTruoc
  ], [false, true]);

  // --- 3. select xếp tăng dần, và trang đã có biến NamSinh riêng
  var page4 = await browser.newPage();
  await page4.setContent(
    '<body><select name="namsinh" id="ns"></select>'
    + '<script>window.NamSinh = "cua trang";'
    + 'for (var y = 1900; y <= 2025; y++) ns.add(new Option(y, y));<\/script></body>'
  );
  await page4.evaluate(script);

  console.log('\nSelect xếp tăng dần');
  ktra('năm cuối danh sách', await page4.evaluate(function () {
    return Number(ns.options[ns.options.length - 1].value);
  }), namNay + 1);

  ktra('vẫn tăng dần', await page4.evaluate(function () {
    var ds = [].slice.call(ns.options).map(function (o) { return Number(o.value); });
    for (var i = 1; i < ds.length; i++) {
      if (ds[i] < ds[i - 1]) { return false; }
    }
    return true;
  }), true);

  ktra('không ghi đè window.NamSinh của trang', await page4.evaluate(function () {
    return window.NamSinh;
  }), 'cua trang');

  ktra('script vẫn tính đúng', await page4.evaluate(function () {
    return PT2026.tinh(14, 9, 2026, 'Nam').canChi;
  }), 'Bính Ngọ');

  // --- 4. bé gái, và một trang không có select năm
  console.log('\nTrường hợp khác');
  ktra('bé gái 2026 → Đoài', await page2.evaluate(function () {
    return PT2026.tinh(14, 9, 2026, 'Nữ').cungMenh.cung;
  }), 'Đoài');

  var page3 = await browser.newPage();
  await page3.setContent('<body><p>Trang không có form</p></body>');
  var canhBao = [];
  page3.on('console', function (m) { if (m.type() === 'warning') { canhBao.push(m.text()); } });
  await page3.evaluate(script);

  ktra('trang không có select: không vỡ', await page3.evaluate(function () {
    return typeof PT2026.moKhoaNam === 'function';
  }), true);
  ktra('có cảnh báo không tìm thấy select', canhBao.some(function (t) {
    return /select.*n[aă]m sinh/i.test(t);
  }), true);

  await browser.close();

  console.log('\n' + tong + ' kiểm thử, ' + loi + ' sai');
  process.exit(loi === 0 ? 0 : 1);
}()).catch(function (e) {
  console.error(e);
  process.exit(1);
});
