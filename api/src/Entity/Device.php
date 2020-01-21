<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use App\Resolver\DeviceCollectionResolver;
use App\Resolver\DeviceResolver;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\DeviceRepository")
 * @ApiResource(graphql={
 *     "retrievedQuery"={
 *         "item_query"=DeviceResolver::class
 *     },
 *     "notRetrievedQuery"={
 *         "item_query"=DeviceResolver::class,
 *         "args"={}
 *     },
 *     "withDefaultArgsNotRetrievedQuery"={
 *         "item_query"=DeviceResolver::class,
 *         "read"=false
 *     },
 *     "withCustomArgsQuery"={
 *         "item_query"=DeviceResolver::class,
 *         "args"={
 *             "id"={"type"="ID!"},
 *             "log"={"type"="Boolean!", "description"="Is logging activated?"},
 *             "logDate"={"type"="DateTime"}
 *         }
 *     },
 *     "collectionQuery"={
 *         "collection_query"=DeviceCollectionResolver::class
 *     }
 * })
 */
class Device
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $macAddress;

    /**
     * @ORM\Column(type="boolean")
     */
    private $onEntryDoor;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Salle", inversedBy="devices")
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
