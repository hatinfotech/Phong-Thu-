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

  function catBot(chuoi, dai) {
    chuoi = String(chuoi).replace(/\s+/g, ' ').trim();

    return chuoi.length > dai ? chuoi.slice(0, dai) + '…' : chuoi;
  }

  /** Chữ đang hiện trên trang, không tính bảng nổi do script tự thêm. */
  function chuTrenTrang() {
    var bang = document.getElementById(TEN_NHAN + '-bang');
    if (!bang) {
      return document.body.innerText || '';
    }

    var giu = bang.style.display;
    bang.style.display = 'none';
    var chu = document.body.innerText || '';
    bang.style.display = giu;

    return chu;
  }

  /** Ảnh chụp tình trạng các ô năm sinh trên trang. */
  function trangThaiNam() {
    return {
      select: timSelectNam().map(function (sel) {
        var ds = [].slice.call(sel.options).map(soNam).filter(function (n) { return n !== null; });

        return {
          ten: sel.name || sel.id || '?',
          soLuong: ds.length,
          min: ds.length ? Math.min.apply(null, ds) : null,
          max: ds.length ? Math.max.apply(null, ds) : null,
          mauOption: sel.options[0] ? catBot(sel.options[0].outerHTML, 120) : null
        };
      }),
      input: timInputNam().map(function (el) {
        return { ten: el.name || el.id, min: el.getAttribute('min'), max: el.getAttribute('max') };
      })
    };
  }

  /** Trạng thái trước khi script đụng vào trang, chụp một lần duy nhất. */
  var banDau = null;

  function ghiNhoBanDau() {
    if (banDau === null) {
      banDau = trangThaiNam();
    }
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
    ghiNhoBanDau();

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
      var tren = chuTrenTrang();
      log('Đúng ra phải là:', tt.canChi + ' / ' + tt.napAm + ' / cung ' + tt.cungMenh.cung);
      log('Trang đang hiển thị "' + tt.canChi + '": ' + (tren.indexOf(tt.canChi) !== -1 ? 'có' : 'KHÔNG'));
    }

    console.groupEnd();
  }

  /**
   * Gom một báo cáo gọn về tình trạng trang, để copy gửi đi.
   *
   *   copy(PT2026.baoCao())              // đồng bộ, không hỏi máy chủ
   *   copy(await PT2026.baoCaoDayDu())   // có kèm kết quả hỏi thử máy chủ
   */
  function baoCao() {
    var p = thamSo();

    ghiNhoBanDau();

    var bc = {
      url: location.href.split('#')[0],
      namNay: new Date().getFullYear(),
      thamSo: p,
      truocKhiVa: banDau,
      sauKhiVa: trangThaiNam(),
      scriptNgoai: [].slice.call(document.querySelectorAll('script[src]'))
        .map(function (s) { return s.getAttribute('src'); })
        .slice(0, 20),
      scriptNoiDungNghiNgo: [],
      formAction: (function () {
        var f = document.querySelector('form');
        return f ? { action: f.getAttribute('action'), method: f.getAttribute('method') } : null;
      }())
    };

    // tìm đoạn script gắn năm cứng — chỗ nhiều khả năng phải sửa
    [].slice.call(document.querySelectorAll('script:not([src])')).forEach(function (s) {
      var m = s.textContent.match(/[^\n]{0,90}\b(19|20)\d{2}\b[^\n]{0,90}/g);
      if (!m) {
        return;
      }
      m.filter(function (d) {
        return /for\s*\(|while\s*\(|new Option|appendChild|option|nam|year/i.test(d);
      }).slice(0, 5).forEach(function (d) {
        if (bc.scriptNoiDungNghiNgo.length < 10) {
          bc.scriptNoiDungNghiNgo.push(catBot(d, 180));
        }
      });
    });

    if (p.nam) {
      var tt = NamSinh.tuNgaySinh(p.ngay || 1, p.thang || 1, p.nam, p.gioiTinh);
      var chu = chuTrenTrang();
      bc.dungRaPhaiLa = {
        namAm: tt.namAm, canChi: tt.canChi, napAm: tt.napAm, cung: tt.cungMenh.cung
      };
      bc.trangDangHienThi = {
        coCanChiDung: chu.indexOf(tt.canChi) !== -1,
        coNapAmDung: chu.indexOf(tt.napAm) !== -1,
        coCanChiNamTruoc: chu.indexOf(NamSinh.canChi(tt.namAm - 1)) !== -1
      };
    }

    return JSON.stringify(bc, null, 2);
  }

  /** baoCao() kèm kết quả hỏi thử máy chủ với năm mới. */
  function baoCaoDayDu(nam) {
    nam = nam || namToiDa();

    return kiemTraMayChu(nam).then(function (kq) {
      var bc = JSON.parse(baoCao());
      bc.mayChu = {
        nam: kq.nam,
        tinhDuoc: kq.mayChuTinhDuoc,
        coCanChiNamTruoc: kq.html.indexOf(NamSinh.canChi(nam - 1)) !== -1,
        doDaiHtml: kq.html.length
      };

      return JSON.stringify(bc, null, 2);
    }).catch(function () {
      var bc = JSON.parse(baoCao());
      bc.mayChu = { nam: nam, loi: 'không hỏi được máy chủ' };

      return JSON.stringify(bc, null, 2);
    });
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
    trangThaiNam: trangThaiNam,
    baoCao: baoCao,
    baoCaoDayDu: baoCaoDayDu,
    tuDong: tuDong,
    thamSo: thamSo
  };
}());
