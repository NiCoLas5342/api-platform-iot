# api-platform-iot

1 - Installation des pré-requis 
Avant de commencer a dévelloper, nous avons mis en place un environnement de travail.
PhpStorm : Telechargement directement sur internet , gratuit pour les étudiant avec justificatif(mail de l'école)
Symfony plugin : Il faut le telecharger dans PhpStorm, dans la partie "Plugin" -> taper "Symfony". 
Après il suffit de l'installer et redemarrer PhpStorm. Puis ouvrez un projet Symfony
XCTU : Le telechargement se fait sur le site https://www.digi.com/
Docker : Pour windows family -> docker toolbox | Windows pro -> docker (version 19.03.5) 
Sur windows ne pas cocher la case windows conteneur lors de l’installation.
npm : tutoriel -> https://github.com/jankolkmeier/xbee-api
yarn : site web pour l'installation -> https://yarnpkg.com/lang/en/

2 - Prise en main XCTU avec xbee

Brancher les 2 modules Xbee en USB sur votre ordinateur, si ils ne sont pas reconnu installer le driver The CP210x USB to UART Bridge Virtual COM Port (VCP) drivers : 
https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers

Il faut ensuite avoir un Xbee en controlleur et l'autre en enddevice et leur donner le même PAN ID.

Donner ensuite l'adresse mac de l'enddevice au controlleur pour qu'il puisse communiquer avec lui.

Creation de frames de commande AT : 

Aller sur le controlleur et cliquer sur la console, cliquer sur ajouter une frame, selectionner une frame de type 0x17, ajouter l'adresse mac du enddevice.
Dans le champs AT Command ajouter en ASCII le numero du Pin sur lequel est connecté votre LED par exemple (D0). Et donner en parametre l'orde a executer par exemple éteindre (0).

Vous pouvez ensuite exécuter les frames créer en lançant la séquence.

Pour passer en mode API, il faut Activer AP à (1) Enabled.
