<?php
use ApiPlatform\Core\GraphQl\Resolver\QueryCollectionResolverInterface;
use App\Entity\Device;

final class DeviceCollectionResolverr implements QueryCollectionResolverInterface
{
    /**
     * @param iterable<Device> $collection
     *
     * @return iterable<Device>
     */
    public function __invoke(iterable $collection, array $context): iterable
    {
        // Query arguments are in $context['args'].

        foreach ($collection as $Device) {
            // Do something with the book.
        }

        return $collection;
    }
}
