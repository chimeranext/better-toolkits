<?php

declare(strict_types=1);

use Dogfood\Domain\Pricing\LineTotal;

it('applies tax rate to net line amount', function (): void {
    expect(LineTotal::fromNet(100.0, 0.2))->toBe(120.0);
});
