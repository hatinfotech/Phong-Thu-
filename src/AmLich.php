<?php
/**
 * Chuyển đổi dương lịch sang âm lịch (thuật toán thiên văn, múi giờ GMT+7).
 *
 * Không dùng bảng tra cứu cố định nên chạy được cho mọi năm, không bị chặn
 * ở 2025 như bảng dữ liệu cũ.
 */

declare(strict_types=1);

namespace TenPhongThuy;

final class AmLich
{
    /** Múi giờ dùng cho lịch Việt Nam (GMT+7). */
    public const MUI_GIO = 7.0;

    /** Số ngày Julian của một ngày dương lịch. */
    public static function jdTuNgay(int $dd, int $mm, int $yy): int
    {
        $a = intdiv(14 - $mm, 12);
        $y = $yy + 4800 - $a;
        $m = $mm + 12 * $a - 3;

        $jd = $dd + intdiv(153 * $m + 2, 5) + 365 * $y
            + intdiv($y, 4) - intdiv($y, 100) + intdiv($y, 400) - 32045;

        if ($jd < 2299161) { // trước 15/10/1582: lịch Julius
            $jd = $dd + intdiv(153 * $m + 2, 5) + 365 * $y + intdiv($y, 4) - 32083;
        }

        return $jd;
    }

    /** Ngày dương lịch tương ứng với một số ngày Julian. */
    public static function ngayTuJd(int $jd): array
    {
        if ($jd > 2299160) {
            $a = $jd + 32044;
            $b = intdiv(4 * $a + 3, 146097);
            $c = $a - intdiv($b * 146097, 4);
        } else {
            $b = 0;
            $c = $jd + 32082;
        }
        $d = intdiv(4 * $c + 3, 1461);
        $e = $c - intdiv(1461 * $d, 4);
        $m = intdiv(5 * $e + 2, 153);

        $day   = $e - intdiv(153 * $m + 2, 5) + 1;
        $month = $m + 3 - 12 * intdiv($m, 10);
        $year  = $b * 100 + $d - 4800 + intdiv($m, 10);

        return [$day, $month, $year];
    }

    /** Thời điểm sóc (trăng mới) thứ $k tính từ 1/1/1900, theo ngày Julian. */
    private static function thoiDiemSoc(int $k): float
    {
        $T  = $k / 1236.85;
        $T2 = $T * $T;
        $T3 = $T2 * $T;
        $dr = M_PI / 180;

        $jd1 = 2415020.75933 + 29.53058868 * $k + 0.0001178 * $T2 - 0.000000155 * $T3;
        $jd1 += 0.00033 * sin((166.56 + 132.87 * $T - 0.009173 * $T2) * $dr);

        $M   = 359.2242 + 29.10535608 * $k - 0.0000333 * $T2 - 0.00000347 * $T3;
        $Mpr = 306.0253 + 385.81691806 * $k + 0.0107306 * $T2 + 0.00001236 * $T3;
        $F   = 21.2964 + 390.67050646 * $k - 0.0016528 * $T2 - 0.00000239 * $T3;

        $c1  = (0.1734 - 0.000393 * $T) * sin($M * $dr);
        $c1 += 0.0021 * sin(2 * $dr * $M);
        $c1 += -0.4068 * sin($Mpr * $dr);
        $c1 += 0.0161 * sin($dr * 2 * $Mpr);
        $c1 += -0.0004 * sin($dr * 3 * $Mpr);
        $c1 += 0.0104 * sin($dr * 2 * $F);
        $c1 += -0.0051 * sin($dr * ($M + $Mpr));
        $c1 += -0.0074 * sin($dr * ($M - $Mpr));
        $c1 += 0.0004 * sin($dr * (2 * $F + $M));
        $c1 += -0.0004 * sin($dr * (2 * $F - $M));
        $c1 += -0.0006 * sin($dr * (2 * $F + $Mpr));
        $c1 += 0.0010 * sin($dr * (2 * $F - $Mpr));
        $c1 += 0.0005 * sin($dr * (2 * $Mpr + $M));

        if ($T < -11) {
            $deltat = 0.001 + 0.000839 * $T + 0.0002261 * $T2
                - 0.00000845 * $T3 - 0.000000081 * $T * $T3;
        } else {
            $deltat = -0.000278 + 0.000265 * $T + 0.000262 * $T2;
        }

        return $jd1 + $c1 - $deltat;
    }

    /** Kinh độ mặt trời (radian) tại thời điểm Julian $jdn. */
    private static function kinhDoMatTroi(float $jdn): float
    {
        $T  = ($jdn - 2451545.0) / 36525;
        $T2 = $T * $T;
        $dr = M_PI / 180;

        $l0 = 280.46645 + 36000.76983 * $T + 0.0003032 * $T2;
        $M  = 357.52910 + 35999.05030 * $T - 0.0001559 * $T2 - 0.00000048 * $T * $T2;

        $dl  = (1.914600 - 0.004817 * $T - 0.000014 * $T2) * sin($dr * $M);
        $dl += (0.019993 - 0.000101 * $T) * sin($dr * 2 * $M) + 0.000290 * sin($dr * 3 * $M);

        $l = ($l0 + $dl) * $dr;
        $l = $l - M_PI * 2 * floor($l / (M_PI * 2));

        return $l;
    }

    /** Ngày (theo múi giờ) chứa điểm sóc thứ $k. */
    private static function ngaySoc(int $k, float $tz): int
    {
        return (int) floor(self::thoiDiemSoc($k) + 0.5 + $tz / 24);
    }

    /** Số thứ tự trung khí (0..11) của ngày $jdn. */
    private static function trungKhi(int $jdn, float $tz): int
    {
        return (int) floor(self::kinhDoMatTroi($jdn - 0.5 - $tz / 24) / M_PI * 6);
    }

    /** Ngày bắt đầu tháng 11 âm lịch của năm dương lịch $yy. */
    private static function thangMot(int $yy, float $tz): int
    {
        $off = self::jdTuNgay(31, 12, $yy) - 2415021;
        $k   = (int) floor($off / 29.530588853);
        $nm  = self::ngaySoc($k, $tz);

        if (self::trungKhi($nm, $tz) >= 9) {
            $nm = self::ngaySoc($k - 1, $tz);
        }

        return $nm;
    }

    /** Vị trí tháng nhuận so với tháng 11 của năm âm lịch bắt đầu tại $a11. */
    private static function viTriThangNhuan(int $a11, float $tz): int
    {
        $k = (int) floor(($a11 - 2415021.076998695) / 29.530588853 + 0.5);
        $i = 1;
        $arc = self::trungKhi(self::ngaySoc($k + $i, $tz), $tz);

        do {
            $last = $arc;
            $i++;
            $arc = self::trungKhi(self::ngaySoc($k + $i, $tz), $tz);
        } while ($arc !== $last && $i < 14);

        return $i - 1;
    }

    /**
     * Đổi ngày dương lịch sang âm lịch.
     *
     * @return array{ngay:int, thang:int, nam:int, nhuan:bool}
     */
    public static function duongSangAm(int $dd, int $mm, int $yy, float $tz = self::MUI_GIO): array
    {
        $soNgay = self::jdTuNgay($dd, $mm, $yy);

        $k         = (int) floor(($soNgay - 2415021.076998695) / 29.530588853);
        $dauThang  = self::ngaySoc($k + 1, $tz);
        if ($dauThang > $soNgay) {
            $dauThang = self::ngaySoc($k, $tz);
        }

        $a11 = self::thangMot($yy, $tz);
        $b11 = $a11;

        if ($a11 >= $dauThang) {
            $namAm = $yy;
            $a11   = self::thangMot($yy - 1, $tz);
        } else {
            $namAm = $yy + 1;
            $b11   = self::thangMot($yy + 1, $tz);
        }

        $ngayAm  = $soNgay - $dauThang + 1;
        $chenh   = (int) floor(($dauThang - $a11) / 29);
        $nhuan   = false;
        $thangAm = $chenh + 11;

        if ($b11 - $a11 > 365) {
            $viTriNhuan = self::viTriThangNhuan($a11, $tz);
            if ($chenh >= $viTriNhuan) {
                $thangAm = $chenh + 10;
                if ($chenh === $viTriNhuan) {
                    $nhuan = true;
                }
            }
        }

        if ($thangAm > 12) {
            $thangAm -= 12;
        }
        if ($thangAm >= 11 && $chenh < 4) {
            $namAm -= 1;
        }

        return ['ngay' => $ngayAm, 'thang' => $thangAm, 'nam' => $namAm, 'nhuan' => $nhuan];
    }

    /** Năm âm lịch của một ngày sinh dương lịch (dùng để lấy đúng can chi). */
    public static function namAmLich(int $dd, int $mm, int $yy, float $tz = self::MUI_GIO): int
    {
        return self::duongSangAm($dd, $mm, $yy, $tz)['nam'];
    }

    /** Ngày dương lịch của mùng 1 Tết năm âm lịch $namAm: [ngày, tháng, năm]. */
    public static function ngayTet(int $namAm, float $tz = self::MUI_GIO): array
    {
        // Tết luôn rơi vào khoảng 21/01 - 21/02 dương lịch của cùng năm số.
        for ($jd = self::jdTuNgay(21, 1, $namAm); $jd <= self::jdTuNgay(21, 2, $namAm); $jd++) {
            [$d, $m, $y] = self::ngayTuJd($jd);
            $am = self::duongSangAm($d, $m, $y, $tz);
            if ($am['ngay'] === 1 && $am['thang'] === 1 && $am['nam'] === $namAm) {
                return [$d, $m, $y];
            }
        }

        throw new \RuntimeException("Không xác định được ngày Tết năm $namAm");
    }
}
