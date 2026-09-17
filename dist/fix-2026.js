/**
 * Mở rộng trang chấm điểm tên cho năm 2026 trở đi — chạy tạm tại trình duyệt.
 *
 * Dán toàn bộ file này vào Chrome DevTools → Console → Enter.
 * Script sẽ tự mở khoá dropdown năm sinh và hiện bảng kết quả tính lại.
 *
 * Sau đó gõ trong Console:
 *   PT2026.chuanDoan()                     xem giới hạn năm nằm ở đâu
 *   PT2026.moKhoaNam(2030)                 mở khoá tới năm 2030
 *   PT2026.tinh(14, 9, 2026, "Nam")        can chi / nạp âm / cung mệnh
 *   PT2026.hienBang(14, 9, 2026, "Nam")    hiện bảng kết quả
 *   PT2026.suaVanBan()                     sửa chữ hiển thị sai trong trang
 *   await PT2026.kiemTraMayChu(2026)       hỏi thử máy chủ có tính được không
 *
 * LƯU Ý: script chỉ sửa được phần chạy trong trình duyệt. Nếu điểm số do máy
 * chủ tính thì vẫn phải sửa code phía máy chủ — dùng src/NamSinh.php.
 *
 * Sinh tự động bởi tools/dong-goi.js — đừng sửa trực tiếp file này.
 */
(function () {
  "use strict";

  var module = { exports: {} };

/**
 * Bản JavaScript của src/AmLich.php + src/NamSinh.php.
 *
 * Dùng cho phần chạy trên trình duyệt (đổ danh sách năm sinh, hiển thị can chi
 * ngay khi người dùng chọn ngày sinh). Kết quả khớp với bản PHP.
 *
 *   <script src="nam-sinh.js"></script>
 *   NamSinh.tuNgaySinh(14, 9, 2026, 'Nam');
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NamSinh = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MUI_GIO = 7.0;
  var PI = Math.PI;

  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  var NAP_AM = [
    'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim',
    'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
    'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy',
    'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
    'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc',
    'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy'
  ];

  var CUNG = {
    1: ['Khảm', 'Thủy', 'Đông tứ mệnh'],
    2: ['Khôn', 'Thổ', 'Tây tứ mệnh'],
    3: ['Chấn', 'Mộc', 'Đông tứ mệnh'],
    4: ['Tốn', 'Mộc', 'Đông tứ mệnh'],
    6: ['Càn', 'Kim', 'Tây tứ mệnh'],
    7: ['Đoài', 'Kim', 'Tây tứ mệnh'],
    8: ['Cấn', 'Thổ', 'Tây tứ mệnh'],
    9: ['Ly', 'Hỏa', 'Đông tứ mệnh']
  };

  var MOC_GIAP_TY = 1984;

  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function jdTuNgay(dd, mm, yy) {
    var a = Math.floor((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y
      + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    if (jd < 2299161) {
      jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }

    return jd;
  }

  function ngayTuJd(jd) {
    var a, b, c;

    if (jd > 2299160) {
      a = jd + 32044;
      b = Math.floor((4 * a + 3) / 146097);
      c = a - Math.floor((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }

    var d = Math.floor((4 * c + 3) / 1461);
    var e = c - Math.floor((1461 * d) / 4);
    var m = Math.floor((5 * e + 2) / 153);

    return [
      e - Math.floor((153 * m + 2) / 5) + 1,
      m + 3 - 12 * Math.floor(m / 10),
      b * 100 + d - 4800 + Math.floor(m / 10)
    ];
  }

  function thoiDiemSoc(k) {
    var T = k / 1236.85;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = PI / 180;

    var jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    var c1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr);
    c1 += 0.0021 * Math.sin(2 * dr * M);
    c1 += -0.4068 * Math.sin(Mpr * dr);
    c1 += 0.0161 * Math.sin(dr * 2 * Mpr);
    c1 += -0.0004 * Math.sin(dr * 3 * Mpr);
    c1 += 0.0104 * Math.sin(dr * 2 * F);
    c1 += -0.0051 * Math.sin(dr * (M + Mpr));
    c1 += -0.0074 * Math.sin(dr * (M - Mpr));
    c1 += 0.0004 * Math.sin(dr * (2 * F + M));
    c1 += -0.0004 * Math.sin(dr * (2 * F - M));
    c1 += -0.0006 * Math.sin(dr * (2 * F + Mpr));
    c1 += 0.0010 * Math.sin(dr * (2 * F - Mpr));
    c1 += 0.0005 * Math.sin(dr * (2 * Mpr + M));

    var deltat;
    if (T < -11) {
      deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }

    return jd1 + c1 - deltat;
  }

  function kinhDoMatTroi(jdn) {
    var T = (jdn - 2451545.0) / 36525;
    var T2 = T * T;
    var dr = PI / 180;

    var l0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;

    var dl = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    dl += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);

    var l = (l0 + dl) * dr;

    return l - PI * 2 * Math.floor(l / (PI * 2));
  }

  function ngaySoc(k, tz) {
    return Math.floor(thoiDiemSoc(k) + 0.5 + tz / 24);
  }

  function trungKhi(jdn, tz) {
    return Math.floor(kinhDoMatTroi(jdn - 0.5 - tz / 24) / PI * 6);
  }

  function thangMot(yy, tz) {
    var off = jdTuNgay(31, 12, yy) - 2415021;
    var k = Math.floor(off / 29.530588853);
    var nm = ngaySoc(k, tz);

    if (trungKhi(nm, tz) >= 9) {
      nm = ngaySoc(k - 1, tz);
    }

    return nm;
  }

  function viTriThangNhuan(a11, tz) {
    var k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var i = 1;
    var arc = trungKhi(ngaySoc(k + i, tz), tz);
    var last;

    do {
      last = arc;
      i++;
      arc = trungKhi(ngaySoc(k + i, tz), tz);
    } while (arc !== last && i < 14);

    return i - 1;
  }

  function duongSangAm(dd, mm, yy, tz) {
    tz = tz === undefined ? MUI_GIO : tz;

    var soNgay = jdTuNgay(dd, mm, yy);
    var k = Math.floor((soNgay - 2415021.076998695) / 29.530588853);
    var dauThang = ngaySoc(k + 1, tz);

    if (dauThang > soNgay) {
      dauThang = ngaySoc(k, tz);
    }

    var a11 = thangMot(yy, tz);
    var b11 = a11;
    var namAm;

    if (a11 >= dauThang) {
      namAm = yy;
      a11 = thangMot(yy - 1, tz);
    } else {
      namAm = yy + 1;
      b11 = thangMot(yy + 1, tz);
    }

    var ngayAm = soNgay - dauThang + 1;
    var chenh = Math.floor((dauThang - a11) / 29);
    var nhuan = false;
    var thangAm = chenh + 11;

    if (b11 - a11 > 365) {
      var viTriNhuan = viTriThangNhuan(a11, tz);
      if (chenh >= viTriNhuan) {
        thangAm = chenh + 10;
        if (chenh === viTriNhuan) {
          nhuan = true;
        }
      }
    }

    if (thangAm > 12) {
      thangAm -= 12;
    }
    if (thangAm >= 11 && chenh < 4) {
      namAm -= 1;
    }

    return { ngay: ngayAm, thang: thangAm, nam: namAm, nhuan: nhuan };
  }

  function namAmLich(dd, mm, yy, tz) {
    return duongSangAm(dd, mm, yy, tz).nam;
  }

  function ngayTet(namAm, tz) {
    var jd = jdTuNgay(21, 1, namAm);
    var het = jdTuNgay(21, 2, namAm);

    for (; jd <= het; jd++) {
      var d = ngayTuJd(jd);
      var am = duongSangAm(d[0], d[1], d[2], tz);
      if (am.ngay === 1 && am.thang === 1 && am.nam === namAm) {
        return d;
      }
    }

    throw new Error('Không xác định được ngày Tết năm ' + namAm);
  }

  function can(namAm) {
    return CAN[mod(namAm + 6, 10)];
  }

  function chi(namAm) {
    return CHI[mod(namAm + 8, 12)];
  }

  function canChi(namAm) {
    return can(namAm) + ' ' + chi(namAm);
  }

  function napAm(namAm) {
    return NAP_AM[Math.floor(mod(namAm - MOC_GIAP_TY, 60) / 2)];
  }

  function nguHanh(namAm) {
    var tu = napAm(namAm).split(' ');

    return tu[tu.length - 1];
  }

  function rutGon(nam) {
    var n = Math.abs(nam);

    while (n > 9) {
      n = String(n).split('').reduce(function (t, c) { return t + Number(c); }, 0);
    }

    return n === 0 ? 9 : n;
  }

  function laNam(gioiTinh) {
    var g = String(gioiTinh).trim().toLowerCase();

    if (['nam', 'male', 'm', 'trai', 'bé trai', '1'].indexOf(g) !== -1) {
      return true;
    }
    if (['nữ', 'nu', 'female', 'f', 'gái', 'bé gái', '0', '2'].indexOf(g) !== -1) {
      return false;
    }

    throw new Error('Giới tính không hợp lệ: ' + gioiTinh);
  }

  function cungMenh(namAm, gioiTinh) {
    if (namAm < 1900 || namAm > 2099) {
      throw new Error('Cung mệnh chỉ hỗ trợ năm 1900-2099, nhận được: ' + namAm);
    }

    var tong = rutGon(namAm);
    var la = laNam(gioiTinh);
    var so = namAm < 2000
      ? (la ? 10 - tong : tong + 5)
      : (la ? 9 - tong : tong + 6);

    so = mod(so, 9);
    if (so === 0) {
      so = 9;
    }
    if (so === 5) {
      so = la ? 2 : 8;
    }

    return { so: so, cung: CUNG[so][0], nguHanh: CUNG[so][1], trach: CUNG[so][2] };
  }

  function tuNgaySinh(ngay, thang, nam, gioiTinh) {
    var namAm = namAmLich(ngay, thang, nam);

    return {
      namDuong: nam,
      namAm: namAm,
      canChi: canChi(namAm),
      napAm: napAm(namAm),
      nguHanh: nguHanh(namAm),
      cungMenh: cungMenh(namAm, gioiTinh),
      truocTet: namAm !== nam
    };
  }

  /** Danh sách năm để đổ vào <select>, mặc định tới năm hiện tại + 1. */
  function danhSachNam(tuNam, denNam) {
    tuNam = tuNam || 1900;
    denNam = denNam || (new Date().getFullYear() + 1);

    var ds = [];
    for (var y = denNam; y >= tuNam; y--) {
      ds.push({ nam: y, canChi: canChi(y), napAm: napAm(y) });
    }

    return ds;
  }

  return {
    MUI_GIO: MUI_GIO,
    jdTuNgay: jdTuNgay,
    ngayTuJd: ngayTuJd,
    duongSangAm: duongSangAm,
    namAmLich: namAmLich,
    ngayTet: ngayTet,
    can: can,
    chi: chi,
    canChi: canChi,
    napAm: napAm,
    nguHanh: nguHanh,
    cungMenh: cungMenh,
    tuNgaySinh: tuNgaySinh,
    danhSachNam: danhSachNam
  };
}));


  var NamSinh = module.exports;

/**
 * Lớp vá chạy trong Chrome DevTools.
 *
 * File này không dùng riêng được: nó cần biến `NamSinh` (từ src/nam-sinh.js).
 * Chạy `node tools/dong-goi.js` để ghép hai file thành dist/fix-2026.js — đó
 * mới là file dán vào Console.
 */

var PT = (function () {
  'use strict';

  var TEN_NHAN = 'pt2026';

  function log() {
    var tham = ['%c[2026]', 'color:#0a7;font-weight:bold'].concat([].slice.call(arguments));
    console.log.apply(console, tham);
  }

  function canhBao() {
    var tham = ['%c[2026]', 'color:#c60;font-weight:bold'].concat([].slice.call(arguments));
    console.warn.apply(console, tham);
  }

  /** Các tham số ngày sinh lấy từ URL, có fallback sang form. */
  function thamSo() {
    var q = new URLSearchParams(location.search);
    var lay = function (ten) {
      var v = q.get(ten);
      if (v !== null && v !== '') {
        return v;
      }
      var el = document.querySelector('[name="' + ten + '"]');
      return el ? el.value : null;
    };

    var gt = lay('gioitinh') || 'Nam';

    return {
      ngay: parseInt(lay('ngaysinh'), 10) || null,
      thang: parseInt(lay('thangsinh'), 10) || null,
      nam: parseInt(lay('namsinh'), 10) || null,
      gioiTinh: /^(nam|1|male|m)$/i.test(String(gt).trim()) ? 'Nam' : 'Nữ'
    };
  }

  function soNam(o) {
    var n = parseInt(String(o.value || o.text).trim(), 10);
    return isNaN(n) ? null : n;
  }

  /** Select này có phải danh sách năm sinh không. */
  function laSelectNam(sel) {
    var dauHieu = [sel.name, sel.id, sel.className].join(' ');
    if (/n[aă]m.?sinh|namsinh|birth.?year|\byear\b/i.test(dauHieu)) {
      return true;
    }

    var nam = [].slice.call(sel.options).map(soNam).filter(function (n) { return n !== null; });

    return nam.length >= 20 && nam.every(function (n) { return n >= 1800 && n <= 2200; });
  }

  function timSelectNam() {
    return [].slice.call(document.querySelectorAll('select')).filter(laSelectNam);
  }

  /** Input số/text đang chặn năm bằng thuộc tính max. */
  function timInputNam() {
    return [].slice.call(document.querySelectorAll('input[name],input[id]')).filter(function (el) {
      return /n[aă]m.?sinh|namsinh|birth.?year/i.test(el.name + ' ' + el.id)
        && el.hasAttribute('max');
    });
  }

  function namToiDa() {
    return new Date().getFullYear() + 1;
  }

  /** Báo cho select2 / chosen / Angular biết select vừa đổi. */
  function baoDaDoi(sel) {
    try {
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.jQuery && window.jQuery(sel).data('select2')) {
        window.jQuery(sel).trigger('change.select2');
      }
    } catch (e) {
      /* không quan trọng */
    }
  }

  /**
   * Mở khoá danh sách năm sinh tới năm $den (mặc định: năm nay + 1).
   *
   * @return {number} số năm đã thêm
   */
  function moKhoaNam(den) {
    den = den || namToiDa();

    var themTong = 0;
    var selects = timSelectNam();

    if (!selects.length) {
      canhBao('Không tìm thấy <select> năm sinh nào trên trang.');
    }

    selects.forEach(function (sel) {
      var dsNam = [].slice.call(sel.options).map(soNam).filter(function (n) { return n !== null; });
      if (!dsNam.length) {
        return;
      }

      var max = Math.max.apply(null, dsNam);
      var min = Math.min.apply(null, dsNam);
      if (max >= den) {
        log('Select "' + (sel.name || sel.id) + '" đã có tới năm ' + max + ', bỏ qua.');
        return;
      }

      // giữ nguyên cách hiển thị sẵn có: "2025" hay "2025 - Ất Tỵ"
      var mau = sel.options[0] ? sel.options[0].text : '';
      var coCanChi = /\d{4}\s*[-–—]\s*\S+/.test(mau);
      var giamDan = dsNam.length > 1 && dsNam[0] > dsNam[dsNam.length - 1];

      var them = [];
      for (var y = max + 1; y <= den; y++) {
        var o = document.createElement('option');
        o.value = String(y);
        o.text = coCanChi ? y + ' - ' + NamSinh.canChi(y) : String(y);
        o.setAttribute('data-' + TEN_NHAN, '1');
        them.push(o);
      }

      if (giamDan) {
        // chèn dần từ năm nhỏ lên đầu danh sách, năm mới nhất sẽ nằm trên cùng
        them.forEach(function (o) { sel.insertBefore(o, sel.options[0]); });
      } else {
        them.forEach(function (o) { sel.appendChild(o); });
      }

      themTong += them.length;
      baoDaDoi(sel);
      log('Select "' + (sel.name || sel.id) + '": ' + min + '-' + max + ' → ' + min + '-' + den
        + ' (thêm ' + them.length + ' năm)');
    });

    timInputNam().forEach(function (el) {
      if (parseInt(el.getAttribute('max'), 10) < den) {
        log('Input "' + (el.name || el.id) + '": max ' + el.getAttribute('max') + ' → ' + den);
        el.setAttribute('max', String(den));
        themTong++;
      }
    });

    return themTong;
  }

  /** Tính lại các thuộc tính phong thuỷ ở phía trình duyệt. */
  function tinh(ngay, thang, nam, gioiTinh) {
    var p = thamSo();
    ngay = ngay || p.ngay;
    thang = thang || p.thang;
    nam = nam || p.nam;
    gioiTinh = gioiTinh || p.gioiTinh;

    if (!ngay || !thang || !nam) {
      throw new Error('Thiếu ngày sinh. Gọi PT2026.tinh(14, 9, 2026, "Nam").');
    }

    return NamSinh.tuNgaySinh(ngay, thang, nam, gioiTinh);
  }

  /** Bảng nổi hiển thị kết quả đúng, tính ngay trên trình duyệt. */
  function hienBang(ngay, thang, nam, gioiTinh) {
    var tt = tinh(ngay, thang, nam, gioiTinh);
    var cu = document.getElementById(TEN_NHAN + '-bang');
    if (cu) {
      cu.remove();
    }

    var hop = document.createElement('div');
    hop.id = TEN_NHAN + '-bang';
    hop.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:2147483647',
      'width:320px', 'max-width:calc(100vw - 32px)', 'box-sizing:border-box',
      'padding:14px 16px', 'border-radius:10px', 'border:1px solid rgba(0,0,0,.12)',
      'background:#fff', 'color:#111', 'box-shadow:0 8px 28px rgba(0,0,0,.18)',
      'font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'
    ].join(';');

    var dong = function (nhan, giaTri) {
      return '<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0">'
        + '<span style="color:#666">' + nhan + '</span>'
        + '<strong style="text-align:right">' + giaTri + '</strong></div>';
    };

    hop.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">'
      + '<strong style="font-size:15px">Tính lại tại trình duyệt</strong>'
      + '<span style="cursor:pointer;color:#888;font-size:18px;line-height:1"'
      + ' onclick="this.closest(\'#' + TEN_NHAN + '-bang\').remove()">&times;</span></div>'
      + dong('Ngày sinh', tt.namDuong ? (thamSo().ngay || '?') + '/' + (thamSo().thang || '?') + '/' + tt.namDuong : '')
      + dong('Năm âm lịch', tt.namAm + ' - ' + tt.canChi)
      + dong('Nạp âm', tt.napAm)
      + dong('Ngũ hành', tt.nguHanh)
      + dong('Cung mệnh', tt.cungMenh.cung + ' - ' + tt.cungMenh.nguHanh)
      + dong('Trạch', tt.cungMenh.trach)
      + (tt.truocTet
        ? '<div style="margin-top:8px;padding:8px;border-radius:6px;background:#fff6e5;color:#8a5a00;font-size:13px">'
          + 'Bé sinh trước Tết nên năm can chi là ' + tt.namAm + ' (' + tt.canChi + '), '
          + 'không phải ' + tt.namDuong + '.</div>'
        : '')
      + '<div style="margin-top:8px;color:#888;font-size:12px">Số liệu này tính tại máy, '
      + 'không thay cho kết quả chấm điểm của máy chủ.</div>';

    document.body.appendChild(hop);
    log('Kết quả đúng cho năm ' + tt.namAm + ':', tt.canChi + ' / ' + tt.napAm
      + ' / cung ' + tt.cungMenh.cung);

    return tt;
  }

  /**
   * Thay các chỗ hiển thị sai can chi / nạp âm trong DOM.
   *
   * Chỉ sửa phần chữ đang hiện, không đụng tới điểm số do máy chủ tính.
   */
  function suaVanBan(ngay, thang, nam, gioiTinh) {
    var tt = tinh(ngay, thang, nam, gioiTinh);
    var sai = [];

    // can chi và nạp âm của năm liền trước / liền sau hay bị hiển thị nhầm
    [tt.namAm - 1, tt.namAm + 1].forEach(function (n) {
      sai.push([NamSinh.canChi(n), tt.canChi]);
      if (NamSinh.napAm(n) !== tt.napAm) {
        sai.push([NamSinh.napAm(n), tt.napAm]);
      }
    });

    var duyet = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var doi = 0;
    var nut;

    while ((nut = duyet.nextNode())) {
      if (nut.parentNode && nut.parentNode.id === TEN_NHAN + '-bang') {
        continue;
      }
      sai.forEach(function (cap) {
        if (nut.nodeValue.indexOf(cap[0]) !== -1) {
          nut.nodeValue = nut.nodeValue.split(cap[0]).join(cap[1]);
          doi++;
        }
      });
    }

    log('Đã sửa ' + doi + ' chỗ hiển thị sai.');

    return doi;
  }

  /**
   * Hỏi thử máy chủ với năm mới để biết lỗi nằm ở đâu.
   *
   * Nếu máy chủ trả về đúng can chi thì chỉ cần sửa dropdown; nếu không thì
   * phải sửa code phía máy chủ, script này không thay thế được.
   */
  function kiemTraMayChu(nam) {
    nam = nam || namToiDa();

    var u = new URL(location.href);
    u.searchParams.set('namsinh', String(nam));

    log('Đang hỏi thử máy chủ:', u.href);

    return fetch(u.href, { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var mong = NamSinh.canChi(nam);
        var cu = NamSinh.canChi(nam - 1);
        var coMong = html.indexOf(mong) !== -1;
        var coCu = html.indexOf(cu) !== -1;

        if (coMong) {
          log('%cMáy chủ tính được năm ' + nam + ' (thấy "' + mong + '").',
            'color:#0a7', 'Chỉ cần mở khoá dropdown là xong.');
        } else if (coCu) {
          canhBao('Máy chủ trả về "' + cu + '" thay vì "' + mong + '"'
            + ' — bảng dữ liệu phía máy chủ dừng ở năm ' + (nam - 1) + '.');
        } else {
          canhBao('Máy chủ không trả ra can chi nào cho năm ' + nam
            + ' — nhiều khả năng bảng tra cứu phía máy chủ không có năm này.');
        }

        return { nam: nam, mayChuTinhDuoc: coMong, html: html };
      })
      .catch(function (e) {
        canhBao('Không hỏi được máy chủ:', e.message);
        throw e;
      });
  }

  /** In chẩn đoán: giới hạn năm đang nằm ở đâu. */
  function chuanDoan() {
    var den = namToiDa();
    var selects = timSelectNam();

    console.group('%c[2026] Chẩn đoán trang', 'color:#0a7;font-weight:bold');

    if (!selects.length) {
      canhBao('Không thấy <select> năm sinh.');
    }

    selects.forEach(function (sel) {
      var ds = [].slice.call(sel.options).map(soNam).filter(function (n) { return n !== null; });
      var max = ds.length ? Math.max.apply(null, ds) : null;
      log('select[' + (sel.name || sel.id || '?') + ']: ' + ds.length + ' năm, lớn nhất = ' + max
        + (max !== null && max < den ? ' → THIẾU ' + (den - max) + ' năm' : ' → đủ'));
    });

    timInputNam().forEach(function (el) {
      log('input[' + (el.name || el.id) + '] max=' + el.getAttribute('max'));
    });

    var p = thamSo();
    log('Tham số trên URL:', p);

    if (p.nam) {
      var tt = NamSinh.tuNgaySinh(p.ngay || 1, p.thang || 1, p.nam, p.gioiTinh);
      var tren = document.body.innerText || '';
      log('Đúng ra phải là:', tt.canChi + ' / ' + tt.napAm + ' / cung ' + tt.cungMenh.cung);
      log('Trang đang hiển thị "' + tt.canChi + '": ' + (tren.indexOf(tt.canChi) !== -1 ? 'có' : 'KHÔNG'));
    }

    console.groupEnd();
  }

  /** Mở khoá dropdown + hiện bảng kết quả (chạy sẵn khi dán script). */
  function tuDong() {
    var them = moKhoaNam();

    try {
      if (thamSo().nam) {
        hienBang();
      }
    } catch (e) {
      log('Chưa có ngày sinh trên URL — chọn ngày sinh rồi gọi PT2026.hienBang().');
    }

    return them;
  }

  return {
    NamSinh: NamSinh,
    chuanDoan: chuanDoan,
    moKhoaNam: moKhoaNam,
    tinh: tinh,
    hienBang: hienBang,
    suaVanBan: suaVanBan,
    kiemTraMayChu: kiemTraMayChu,
    tuDong: tuDong,
    thamSo: thamSo
  };
}());


  window.PT2026 = PT;
  PT.tuDong();
  console.log("%c[2026] Xong. Gõ PT2026 để xem các lệnh có sẵn.",
    "color:#0a7;font-weight:bold");
}());
