<?php
/** Kiểm thử nhanh: php tests/chay.php */

declare(strict_types=1);

require_once __DIR__ . '/../src/NamSinh.php';

use TenPhongThuy\AmLich;
use TenPhongThuy\NamSinh;

$tong = 0;
$loi  = 0;

function ktra(string $ten, $nhan, $mongDoi): void
{
    global $tong, $loi;
    $tong++;

    if ($nhan === $mongDoi) {
        echo "  ok   $ten\n";
        return;
    }

    $loi++;
    echo "  SAI  $ten\n";
    echo "       nhận:     " . var_export($nhan, true) . "\n";
    echo "       mong đợi: " . var_export($mongDoi, true) . "\n";
}

echo "Ngày Tết (đối chiếu lịch đã công bố)\n";
foreach ([
    1990 => '27/01/1990', 2000 => '05/02/2000', 2020 => '25/01/2020',
    2021 => '12/02/2021', 2022 => '01/02/2022', 2023 => '22/01/2023',
    2024 => '10/02/2024', 2025 => '29/01/2025', 2026 => '17/02/2026',
    2027 => '06/02/2027',
] as $nam => $mongDoi) {
    [$d, $m, $y] = AmLich::ngayTet($nam);
    ktra("Tết $nam", sprintf('%02d/%02d/%d', $d, $m, $y), $mongDoi);
}

echo "\nCan chi\n";
ktra('1984', NamSinh::canChi(1984), 'Giáp Tý');
ktra('1990', NamSinh::canChi(1990), 'Canh Ngọ');
ktra('1992', NamSinh::canChi(1992), 'Nhâm Thân');
ktra('2025', NamSinh::canChi(2025), 'Ất Tỵ');
ktra('2026', NamSinh::canChi(2026), 'Bính Ngọ');
ktra('2027', NamSinh::canChi(2027), 'Đinh Mùi');
ktra('2030', NamSinh::canChi(2030), 'Canh Tuất');
ktra('2044', NamSinh::canChi(2044), 'Giáp Tý');
ktra('1924', NamSinh::canChi(1924), 'Giáp Tý');

echo "\nNạp âm và ngũ hành\n";
ktra('1984 nạp âm', NamSinh::napAm(1984), 'Hải Trung Kim');
ktra('1990 nạp âm', NamSinh::napAm(1990), 'Lộ Bàng Thổ');
ktra('2025 nạp âm', NamSinh::napAm(2025), 'Phú Đăng Hỏa');
ktra('2026 nạp âm', NamSinh::napAm(2026), 'Thiên Hà Thủy');
ktra('2027 nạp âm', NamSinh::napAm(2027), 'Thiên Hà Thủy');
ktra('2028 nạp âm', NamSinh::napAm(2028), 'Đại Trạch Thổ');
ktra('2026 ngũ hành', NamSinh::nguHanh(2026), 'Thủy');
ktra('2025 ngũ hành', NamSinh::nguHanh(2025), 'Hỏa');

echo "\nCung mệnh\n";
ktra('nam 1986', NamSinh::cungMenh(1986, 'Nam')['cung'], 'Tốn');
ktra('nam 1990', NamSinh::cungMenh(1990, 'Nam')['cung'], 'Ly');
ktra('nữ 1990',  NamSinh::cungMenh(1990, 'Nữ')['cung'],  'Càn');
ktra('nam 2026', NamSinh::cungMenh(2026, 'Nam')['cung'], 'Cấn');
ktra('nữ 2026',  NamSinh::cungMenh(2026, 'Nữ')['cung'],  'Đoài');
ktra('nam 2026 ngũ hành', NamSinh::cungMenh(2026, 'Nam')['nguHanh'], 'Thổ');
ktra('nam 2020 (cung 5 → Khôn)', NamSinh::cungMenh(2020, 'Nam')['cung'], 'Khôn');
ktra('nữ 2024 (cung 5 → Cấn)',   NamSinh::cungMenh(2024, 'Nữ')['cung'],  'Cấn');
ktra('nữ 2029',                  NamSinh::cungMenh(2029, 'Nữ')['cung'],  'Khảm');

echo "\nNgày sinh dương lịch → năm âm lịch\n";
$t = NamSinh::tuNgaySinh(14, 9, 2026, 'Nam');
ktra('14/09/2026 năm âm', $t['namAm'], 2026);
ktra('14/09/2026 can chi', $t['canChi'], 'Bính Ngọ');
ktra('14/09/2026 trước Tết', $t['truocTet'], false);

$t = NamSinh::tuNgaySinh(16, 2, 2026, 'Nam');   // trước Tết Bính Ngọ một ngày
ktra('16/02/2026 năm âm', $t['namAm'], 2025);
ktra('16/02/2026 can chi', $t['canChi'], 'Ất Tỵ');
ktra('16/02/2026 trước Tết', $t['truocTet'], true);

$t = NamSinh::tuNgaySinh(17, 2, 2026, 'Nữ');    // mùng 1 Tết
ktra('17/02/2026 can chi', $t['canChi'], 'Bính Ngọ');
ktra('17/02/2026 cung mệnh', $t['cungMenh']['cung'], 'Đoài');

echo "\nMọi năm 1900-2099 đều tính được\n";
$sai = [];
foreach (range(1900, 2099) as $nam) {
    foreach (['Nam', 'Nữ'] as $gt) {
        try {
            NamSinh::canChi($nam);
            NamSinh::napAm($nam);
            NamSinh::cungMenh($nam, $gt);
        } catch (Throwable $e) {
            $sai[] = "$nam/$gt: " . $e->getMessage();
        }
    }
}
ktra('1900-2099 không lỗi', $sai, []);

echo "\n$tong kiểm thử, $loi sai\n";
exit($loi === 0 ? 0 : 1);
