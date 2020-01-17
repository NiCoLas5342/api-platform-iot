<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\HistoryRepository")
 */
class History
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Salle", inversedBy="histories")
     * @ORM\JoinColumn(nullable=false)
     */
    private $salle;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Personne", inversedBy="histories")
     * @ORM\JoinColumn(nullable=false)
     */
    private $personne;

    /**
     * @ORM\Column(type="datetime")
     */
    private $heureEntry;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $heureExit;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPersonne(): ?Personne
    {
        return $this->personne;
    }

    public function setPersonne(?Personne $personne): self
    {
        $this->personne = $personne;

        return $this;
    }

    public function getHeureEntry(): ?\DateTimeInterface
    {
        return $this->heureEntry;
    }

    public function setHeureEntry(\DateTimeInterface $heureEntry): self
    {
        $this->heureEntry = $heureEntry;

        return $this;
    }

    public function getHeureExit(): ?\DateTimeInterface
    {
        return $this->heureExit;
    }

    public function setHeureExit(?\DateTimeInterface $heureExit): self
    {
        $this->heureExit = $heureExit;

        return $this;
    }
}
