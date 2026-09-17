<?php
/** Xuất kết quả bản PHP ra tests/moc-php.json để bản JS đối chiếu. */

declare(strict_types=1);

require_once __DIR__ . '/../src/NamSinh.php';

use TenPhongThuy\AmLich;
use TenPhongThuy\NamSinh;

$moc = [];

foreach (range(1900, 2099) as $nam) {
    $moc[$nam] = [
        'canChi'  => NamSinh::canChi($nam),
        'napAm'   => NamSinh::napAm($nam),
        'cungNam' => NamSinh::cungMenh($nam, 'Nam')['cung'],
        'cungNu'  => NamSinh::cungMenh($nam, 'Nữ')['cung'],
        'tet'     => implode('/', AmLich::ngayTet($nam)),
    ];
}

$duong = __DIR__ . '/../tests/moc-php.json';
file_put_contents($duong, json_encode($moc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

echo "Đã ghi " . count($moc) . " năm vào $duong\n";
