<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\DeviceRepository")
 * @ApiResource(
 *     normalizationContext={"groups"={"read"}}
 *     ,denormalizationContext={"groups"={"read"}}
 *     ,attributes={"filters"={"Device.macAddress"}}
 *     )
 * @ApiFilter(SearchFilter::class, properties={"macAddress": "exact", "onEntryDoor": "exact"})
 */
class Device
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     * @Groups("read")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups("read")
     */
    private $macAddress;

    /**
     * @ORM\Column(type="boolean")
     * @Groups("read")
     */
    private $onEntryDoor;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Salle", inversedBy="devices")
     * @Groups("read")
     */
    private $salle;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMacAddress(): ?string
    {
        return $this->macAddress;
    }

    public function setMacAddress(string $macAddress): self
    {
        $this->macAddress = $macAddress;

        return $this;
    }

    public function getOnEntryDoor(): ?bool
    {
        return $this->onEntryDoor;
    }

    public function setOnEntryDoor(bool $onEntryDoor): self
    {
        $this->onEntryDoor = $onEntryDoor;

        return $this;
    }

    public function getSalle(): ?Salle
    {
        return $this->salle;
    }

    public function setSalle(?Salle $salle): self
    {
        $this->salle = $salle;

        return $this;
    }
}
