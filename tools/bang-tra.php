<?php
/**
 * In bảng tra cứu năm sinh dạng Markdown.
 *
 *   php tools/bang-tra.php 2026 2045 > docs/bang-nam.md
 */

declare(strict_types=1);

require_once __DIR__ . '/../src/NamSinh.php';

use TenPhongThuy\AmLich;
use TenPhongThuy\NamSinh;

$tu  = (int) ($argv[1] ?? 2026);
$den = (int) ($argv[2] ?? 2045);

echo "# Bảng tra cứu năm sinh $tu - $den\n\n";
echo "Sinh tự động bằng `php tools/bang-tra.php $tu $den`.\n\n";
echo "| Năm | Can chi | Nạp âm | Ngũ hành | Cung mệnh nam | Cung mệnh nữ | Mùng 1 Tết |\n";
echo "| --- | --- | --- | --- | --- | --- | --- |\n";

foreach (range($tu, $den) as $nam) {
    $cn = NamSinh::cungMenh($nam, 'Nam');
    $cnu = NamSinh::cungMenh($nam, 'Nữ');
    [$d, $m, $y] = AmLich::ngayTet($nam);

    printf(
        "| %d | %s | %s | %s | %s (%s) | %s (%s) | %02d/%02d/%d |\n",
        $nam,
        NamSinh::canChi($nam),
        NamSinh::napAm($nam),
        NamSinh::nguHanh($nam),
        $cn['cung'], $cn['nguHanh'],
        $cnu['cung'], $cnu['nguHanh'],
        $d, $m, $y
    );
}
