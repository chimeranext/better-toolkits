<?php

declare(strict_types=1);

namespace Dogfood;

final class Percent
{
    public static function toDisplay(float $fraction): float
    {
        return $fraction * 100.0;
    }
}
