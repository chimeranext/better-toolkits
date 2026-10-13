<?php

declare(strict_types=1);

arch('dogfood php namespace is final-friendly')
    ->expect('Dogfood')
    ->toBeClasses()
    ->toExtendNothing();

arch('domain slice has no HTTP imports')
    ->expect('Dogfood\Domain')
    ->not->toUse('Illuminate\Http\Request');
