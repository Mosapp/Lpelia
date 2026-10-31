# Espace admin LPELIA — mode d'emploi

## Ce qui a été ajouté
- **Galerie dynamique** (section `#galerie`) : filtres par catégorie, bouton « Voir plus », visionneuse avec flèches, clavier, balayage tactile et compteur. Lien « Galerie » ajouté au menu et au pied de page.
- **Espace admin** : `https://VOTRE-SITE/admin/` — ou lien discret **« 🔒 Administration »** tout en bas du site (pied de page).
  - Onglet **Textes** : 104 zones de texte du site, classées par section (recherche intégrée).
  - Onglet **Images** : les 5 grandes images (bannière, présentation, formations, résultats).
  - Onglet **Galerie** : ajouter (glisser-déposer), renommer, catégoriser, réordonner, remplacer, supprimer.
  - **Illustrations repères** : chaque section de l'éditeur affiche une image de la partie du site concernée ; quand vous cliquez dans un champ, la zone correspondante s'allume et l'illustration zoome dessus. Cliquez sur une zone de l'illustration pour ouvrir son champ.
  - **Aperçu en direct** à droite : cliquez sur un élément du site pour ouvrir le champ correspondant.
  - Brouillon **enregistré automatiquement** sur l'appareil (rien n'est perdu si la page se ferme).
  - Bouton **Publier** : envoie tout en un seul enregistrement sur GitHub → le site se met à jour tout seul en ~1 minute.

## Fichiers
| Fichier | Rôle |
|---|---|
| `content.json` | Contenu modifié depuis l'admin (ne pas supprimer) |
| `assets/js/content.js` | Applique `content.json` au site + galerie |
| `admin/index.html` | Espace admin (un seul fichier) |
| `admin/comptes.json` | Comptes administrateurs (créé par l'onglet « Comptes », ne pas modifier à la main) |
| `admin/illustrations/` | Images repères des sections + `map.json` (positions des zones) |
| `assets/images/uploads/` | Créé automatiquement pour les nouvelles photos |

## Mise en place (une seule fois)
1. Remplacez les fichiers du dépôt GitHub par ceux de ce dossier (commit + push).
2. Le site doit être publié depuis ce dépôt : **GitHub Pages** (Settings → Pages → branche `main`), Netlify ou Vercel.
3. Créez un jeton : GitHub → Settings → Developer settings → **Fine-grained tokens** → *Only select repositories* (le dépôt du site) → **Contents : Read and write**.
4. Ouvrez `https://VOTRE-SITE/admin/`, cliquez sur **« Accès propriétaire (jeton GitHub) »**, puis saisissez le compte GitHub, le nom du dépôt et le jeton.
5. Dans l'onglet **Comptes**, créez les identifiants de vos administrateurs (voir ci-dessous).

## Comptes administrateurs (créés par le propriétaire)
Seul le propriétaire, connecté avec son jeton GitHub, voit l'onglet **Comptes**. Les administrateurs, eux, se connectent avec un simple **identifiant + mot de passe** : ils n'ont pas besoin de compte GitHub.

- **Ajouter** : nom complet, identifiant, mot de passe (bouton « Générer » pour en créer un solide) → « Créer le compte ». Une fenêtre affiche les informations à transmettre à la personne (bouton « Copier »). Le mot de passe n'est plus jamais réaffiché ensuite.
- **Suspendre / Réactiver** : un compte suspendu ne peut plus se connecter ni publier, même s'il est déjà connecté.
- **Nouveau mot de passe** : en génère un nouveau ; l'ancien cesse de fonctionner.
- **Supprimer** : retire définitivement l'accès.
- Chaque changement est effectif **environ 1 minute** après l'enregistrement (le temps que le site se mette à jour).
- Chaque publication sur GitHub indique **qui** l'a faite (ex. : « — par Awa Koné (awa.kone) »).

Fonctionnement : la liste est enregistrée dans `admin/comptes.json`. Aucun mot de passe n'y figure ; pour chaque compte, le jeton de publication y est **chiffré avec son mot de passe** (PBKDF2 600 000 itérations + AES-256-GCM). Sans un compte créé par vous, actif, et le bon mot de passe, personne ne peut entrer ni publier. Ne modifiez pas ce fichier à la main.

**Si vous renouvelez votre jeton GitHub** (expiration, perte d'appareil…) : reconnectez-vous avec le nouveau jeton, puis cliquez sur « Nouveau mot de passe » pour chaque administrateur (ils sont signalés « Mot de passe à renouveler »).

**Si vous retirez l'accès à quelqu'un en qui vous n'avez plus confiance** : supprimez son compte **et** renouvelez votre jeton GitHub. Un administrateur connecté peut techniquement voir le jeton dans son navigateur ; le renouveler le rend inutilisable.

## Écrire dans les titres
- `*mot*` → le mot apparaît dans la couleur d'accent (ex. : `aux métiers de *l’électronique*`).
- Un retour à la ligne dans un champ = un retour à la ligne sur le site.

## Sans GitHub
Dans « Accès propriétaire », le lien « Continuer sans GitHub » permet de tout modifier puis de **télécharger `content.json`** (les nouvelles photos sont incluses dedans). Il suffit ensuite de remplacer ce fichier sur l'hébergement.

## Sécurité
- Le jeton reste uniquement sur l'appareil du propriétaire ; les administrateurs ne le reçoivent que chiffré. Sans jeton, personne ne peut publier.
- Mots de passe des comptes : **14 caractères minimum**, et un mot de passe aléatoire de 16 caractères est proposé d'office (bouton « Générer »). Gardez-le : `admin/comptes.json` est public, et c'est la longueur du mot de passe qui protège le jeton chiffré.
- « Rester connecté sur cet appareil » : à cocher uniquement sur un appareil personnel.
- Donnez au jeton l'accès à **ce seul dépôt** et une date d'expiration. En cas de perte du téléphone ou de l'ordinateur : supprimez le jeton sur GitHub.
- `/admin/` est exclu des moteurs de recherche (`robots.txt` + balise `noindex`).

## Note
L'admin ne fonctionne pas en ouvrant le fichier par double-clic : utilisez le site en ligne (ou Live Server dans VS Code pour tester en local).
