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
