<?php

declare(strict_types=1);

use Dogfood\Percent;

it('converts fraction to display percent', function (): void {
    expect(Percent::toDisplay(0.2))->toBe(20.0);
});
