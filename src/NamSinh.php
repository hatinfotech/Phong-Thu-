<?php
/**
 * Thuộc tính phong thuỷ của năm sinh: can chi, nạp âm, ngũ hành, cung mệnh.
 *
 * Tất cả đều tính bằng công thức (chu kỳ 60 năm, cửu cung) nên đúng với mọi
 * năm — 2026, 2027, 2100... — không cần bổ sung bảng dữ liệu hàng năm.
 */

declare(strict_types=1);

namespace TenPhongThuy;

require_once __DIR__ . '/AmLich.php';

final class NamSinh
{
    public const NAM = 'Nam';
    public const NU  = 'Nữ';

    private const CAN = [
        'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
    ];

    private const CHI = [
        'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
        'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
    ];

    /** 30 nạp âm của lục thập hoa giáp, bắt đầu từ cặp Giáp Tý - Ất Sửu. */
    private const NAP_AM = [
        'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim',
        'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
        'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy',
        'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
        'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc',
        'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy',
    ];

    /** Cửu cung: số cung => [tên cung, ngũ hành, trạch]. */
    private const CUNG = [
        1 => ['Khảm', 'Thủy', 'Đông tứ mệnh'],
        2 => ['Khôn', 'Thổ',  'Tây tứ mệnh'],
        3 => ['Chấn', 'Mộc',  'Đông tứ mệnh'],
        4 => ['Tốn',  'Mộc',  'Đông tứ mệnh'],
        6 => ['Càn',  'Kim',  'Tây tứ mệnh'],
        7 => ['Đoài', 'Kim',  'Tây tứ mệnh'],
        8 => ['Cấn',  'Thổ',  'Tây tứ mệnh'],
        9 => ['Ly',   'Hỏa',  'Đông tứ mệnh'],
    ];

    /** Năm Giáp Tý dùng làm mốc của chu kỳ 60. */
    private const MOC_GIAP_TY = 1984;

    public static function can(int $namAm): string
    {
        return self::CAN[self::mod($namAm + 6, 10)];
    }

    public static function chi(int $namAm): string
    {
        return self::CHI[self::mod($namAm + 8, 12)];
    }

    /** Ví dụ: 2026 => "Bính Ngọ". */
    public static function canChi(int $namAm): string
    {
        return self::can($namAm) . ' ' . self::chi($namAm);
    }

    /** Nạp âm của năm, ví dụ: 2026 => "Thiên Hà Thủy". */
    public static function napAm(int $namAm): string
    {
        $viTri = self::mod($namAm - self::MOC_GIAP_TY, 60);

        return self::NAP_AM[intdiv($viTri, 2)];
    }

    /** Ngũ hành nạp âm (Kim/Mộc/Thủy/Hỏa/Thổ), ví dụ: 2026 => "Thủy". */
    public static function nguHanh(int $namAm): string
    {
        $tu = explode(' ', self::napAm($namAm));

        return end($tu);
    }

    /**
     * Cung mệnh theo bát trạch.
     *
     * @return array{so:int, cung:string, nguHanh:string, trach:string}
     */
    public static function cungMenh(int $namAm, string $gioiTinh): array
    {
        $so = self::soCung($namAm, $gioiTinh);
        [$cung, $hanh, $trach] = self::CUNG[$so];

        return ['so' => $so, 'cung' => $cung, 'nguHanh' => $hanh, 'trach' => $trach];
    }

    /**
     * Toàn bộ thuộc tính của một ngày sinh dương lịch.
     *
     * Ngày sinh trước Tết thì năm can chi vẫn là năm âm lịch trước đó — đây
     * chính là chỗ hay sai với các bé sinh tháng 1, tháng 2.
     *
     * @return array{namDuong:int, namAm:int, canChi:string, napAm:string,
     *               nguHanh:string, cungMenh:array, truocTet:bool}
     */
    public static function tuNgaySinh(int $ngay, int $thang, int $nam, string $gioiTinh): array
    {
        $namAm = AmLich::namAmLich($ngay, $thang, $nam);

        return [
            'namDuong' => $nam,
            'namAm'    => $namAm,
            'canChi'   => self::canChi($namAm),
            'napAm'    => self::napAm($namAm),
            'nguHanh'  => self::nguHanh($namAm),
            'cungMenh' => self::cungMenh($namAm, $gioiTinh),
            'truocTet' => $namAm !== $nam,
        ];
    }

    private static function soCung(int $namAm, string $gioiTinh): int
    {
        if ($namAm < 1900 || $namAm > 2099) {
            throw new \InvalidArgumentException(
                "Cung mệnh chỉ hỗ trợ năm 1900-2099, nhận được: $namAm"
            );
        }

        $tong = self::rutGon($namAm);
        $la   = self::laNam($gioiTinh);

        if ($namAm < 2000) {
            $so = $la ? 10 - $tong : $tong + 5;
        } else {
            $so = $la ? 9 - $tong : $tong + 6;
        }

        $so = self::mod($so, 9);
        if ($so === 0) {
            $so = 9;
        }

        if ($so === 5) { // cung 5 ký gửi: nam về Khôn, nữ về Cấn
            $so = $la ? 2 : 8;
        }

        return $so;
    }

    /** Cộng dồn các chữ số của năm cho tới khi còn một chữ số (1..9). */
    private static function rutGon(int $nam): int
    {
        $n = abs($nam);
        while ($n > 9) {
            $n = array_sum(str_split((string) $n));
        }

        return $n === 0 ? 9 : $n;
    }

    private static function laNam(string $gioiTinh): bool
    {
        $g = mb_strtolower(trim($gioiTinh), 'UTF-8');

        if (in_array($g, ['nam', 'male', 'm', 'trai', 'bé trai', '1'], true)) {
            return true;
        }
        if (in_array($g, ['nữ', 'nu', 'female', 'f', 'gái', 'bé gái', '0', '2'], true)) {
            return false;
        }

        throw new \InvalidArgumentException("Giới tính không hợp lệ: $gioiTinh");
    }

    private static function mod(int $a, int $b): int
    {
        return (($a % $b) + $b) % $b;
    }
}
