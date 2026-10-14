<?php

declare(strict_types=1);

namespace Dogfood\Domain\Pricing;

final class LineTotal
{
    public static function fromNet(float $net, float $taxRate): float
    {
        return $net * (1.0 + $taxRate);
    }
}
