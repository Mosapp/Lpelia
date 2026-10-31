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
| `admin/illustrations/` | Images repères des sections + `map.json` (positions des zones) |
| `assets/images/uploads/` | Créé automatiquement pour les nouvelles photos |

## Mise en place (une seule fois)
1. Remplacez les fichiers du dépôt GitHub par ceux de ce dossier (commit + push).
2. Le site doit être publié depuis ce dépôt : **GitHub Pages** (Settings → Pages → branche `main`), Netlify ou Vercel.
3. Créez un jeton : GitHub → Settings → Developer settings → **Fine-grained tokens** → *Only select repositories* (le dépôt du site) → **Contents : Read and write**.
4. Ouvrez `https://VOTRE-SITE/admin/`, collez le jeton et cliquez sur **Se connecter**. Sur GitHub Pages, le compte et le dépôt sont remplis tout seuls (sinon : « Réglages avancés »).

## Donner l'accès à d'autres personnes
Il n'y a plus de comptes enregistrés sur le site : **chaque personne reçoit son propre jeton**, qui reste uniquement sur son appareil. Rien de secret n'est publié dans le dépôt.

- **Ajouter quelqu'un** : créez un nouveau jeton fine-grained nommé d'après la personne (ex. : « Admin — Awa Koné »), limité à ce dépôt, **Contents : Read and write**, avec une date d'expiration. Remettez-le-lui en main propre. Elle le colle une seule fois dans `/admin/`, avec son nom (facultatif).
- **Retirer l'accès** : supprimez son jeton sur GitHub (Settings → Developer settings → Fine-grained tokens). Elle ne peut plus publier, immédiatement.
- **Jeton expiré** : l'espace admin demande d'en coller un nouveau.
- Chaque publication sur GitHub indique **qui** l'a faite, si la personne a saisi son nom (ex. : « — par Awa Koné »).

## Écrire dans les titres
- `*mot*` → le mot apparaît dans la couleur d'accent (ex. : `aux métiers de *l’électronique*`).
- Un retour à la ligne dans un champ = un retour à la ligne sur le site.

## Sans GitHub
Sur l'écran de connexion, le lien « Continuer sans GitHub » permet de tout modifier puis de **télécharger `content.json`** (les nouvelles photos sont incluses dedans). Il suffit ensuite de remplacer ce fichier sur l'hébergement.

## Sécurité
- Chaque jeton reste uniquement sur l'appareil de la personne. Aucun mot de passe ni jeton, même chiffré, n'est enregistré dans le dépôt. Sans jeton, personne ne peut publier.
- « Rester connecté sur cet appareil » : à cocher uniquement sur un appareil personnel.
- Donnez au jeton l'accès à **ce seul dépôt** et une date d'expiration. En cas de perte du téléphone ou de l'ordinateur : supprimez le jeton sur GitHub.
- `/admin/` est exclu des moteurs de recherche (`robots.txt` + balise `noindex`).

## Note
L'admin ne fonctionne pas en ouvrant le fichier par double-clic : utilisez le site en ligne (ou Live Server dans VS Code pour tester en local).
