// =========================================================================
// VARIABLES GLOBALES & CONFIGURATION DE LA SEMAINE
// =========================================================================
let baseSemaine = []; // Stocke l'export complet du fichier (Tous les jours)
let baseEnfants = []; // Stocke uniquement la liste générée pour le jour J
let filtresClasses = []; 
let modeAttente = true; 
let termeRecherche = ""; 
let serviceActif = 1; 
let filtreServiceAffichage = 'Tous';
let limiteAffichage = 20; // Nombre d'enfants affichés par défaut


function chargerDonnees() {
    let sauvegardeSemaine = localStorage.getItem('sauvegardeSemaineCantine');
    let sauvegardeJour = localStorage.getItem('sauvegardeCantine');
    
    if (sauvegardeSemaine) {
        baseSemaine = JSON.parse(sauvegardeSemaine);
    } else {
        baseSemaine = [];
    }

    if (sauvegardeJour) {
        baseEnfants = JSON.parse(sauvegardeJour);
    } else {
        baseEnfants = []; 
    }
}

function sauvegarderDonnees() {
    // On sauvegarde l'état de la semaine (les présences prévues)
    localStorage.setItem('sauvegardeSemaineCantine', JSON.stringify(baseSemaine));
    // On sauvegarde l'état du jour (les pointages effectifs)
    localStorage.setItem('sauvegardeCantine', JSON.stringify(baseEnfants));
}

function reinitialiserJournee() {
    let reponse = prompt("⚠️ ATTENTION : Cela va remettre à zéro tous les pointages d'aujourd'hui.\nPour confirmer, tapez 'effacer' :");

    if (reponse !== null && reponse.toLowerCase().trim() === "effacer") {
        baseEnfants.forEach(enfant => {
            enfant.aMange = false;
            enfant.service = null;
            enfant.heurePointage = null;
            enfant.heureSortie = null;
        });
        
        sauvegarderDonnees(); 
        changerService(1); 
        rafraichirAffichage(); 
        alert("✅ Pointages réinitialisés ! La liste des enfants est conservée pour la prochaine journée.");
    } else if (reponse !== null) {
        alert("❌ Le mot de sécurité est incorrect. L'effacement a été annulé.");
    }
}

function supprimerEnfant(id) {
    let enfant = baseEnfants.find(e => e.id === id);
    if (!enfant) return;

    if (confirm(`Es-tu sûr de vouloir retirer ${enfant.prenom} ${enfant.nom} de la liste de ce midi ?`)) {
        // Au lieu de filtrer et d'effacer, on marque l'enfant comme masqué
        enfant.masque = true;
        sauvegarderDonnees();
        rafraichirAffichage();
    }
}

function lancerRecherche() {
    let champ = document.getElementById("barre-recherche");
    termeRecherche = champ.value.toLowerCase();
    limiteAffichage = 20; 
    rafraichirAffichage();
}

function basculerMode() {
    modeAttente = !modeAttente; 
    limiteAffichage = 20;
    let btnMode = document.getElementById("btn-mode");
    let zoneServicesSelection = document.getElementById("zone-services"); 
    let zoneFiltresServices = document.getElementById("filtres-services"); 
    
    if (modeAttente) {
        btnMode.innerText = "Afficher les enfants déjà pointés (Corriger / Vérifier)";
        btnMode.style.backgroundColor = "#ffc107"; 
        btnMode.style.color = "black";
        zoneServicesSelection.style.display = "flex"; 
        zoneFiltresServices.style.display = "none"; 
    } else {
        btnMode.innerText = "Retour au pointage normal";
        btnMode.style.backgroundColor = "#17a2b8"; 
        btnMode.style.color = "white";
        zoneServicesSelection.style.display = "none"; 
        zoneFiltresServices.style.display = "flex"; 
        filtreServiceAffichage = 'Tous'; 
    }
    rafraichirAffichage();
}

function changerService(numero) {
    serviceActif = numero;
    for (let i = 1; i <= 3; i++) {
        let btn = document.getElementById("btn-s" + i);
        if (i === numero) {
            btn.classList.add("actif-service");
        } else {
            btn.classList.remove("actif-service");
        }
    }
}

function filtrerParService(service) {
    filtreServiceAffichage = service;
    rafraichirAffichage();
}

function filtrerClasse(classe) {
    limiteAffichage = 20;
    if (classe === 'Tous') {
        filtresClasses = []; 
    } else {
        if (filtresClasses.includes(classe)) {
            filtresClasses = filtresClasses.filter(c => c !== classe);
        } else {
            filtresClasses.push(classe);
        }
    }
    rafraichirAffichage(); 
}

// =========================================================================
// GESTION DE L'AFFICHAGE & RENDU DES CARTES
// =========================================================================
function rafraichirAffichage() {
let boutonsClasses = document.querySelectorAll("#boutons-classes .btn-filtre");
    boutonsClasses.forEach(btn => {
        let idBouton = btn.id; // Ex: btn-filtre-cpa
        
        if (idBouton === "btn-filtre-tous") {
            if (filtresClasses.length === 0) {
                btn.classList.add("actif");
            } else {
                btn.classList.remove("actif");
            }
        } else {
            // On extrait le nom de la classe depuis l'ID (ex: "cpa" devient "CPA")
            let classeBouton = idBouton.replace("btn-filtre-", "").toUpperCase();
            
            if (filtresClasses.includes(classeBouton)) {
                btn.classList.add("actif");
            } else {
                btn.classList.remove("actif");
            }
        }
    });

    if (!modeAttente) {
        document.getElementById("f-serv-tous").classList.toggle("actif", filtreServiceAffichage === 'Tous');
        document.getElementById("f-serv-1").classList.toggle("actif", filtreServiceAffichage === 1);
        document.getElementById("f-serv-2").classList.toggle("actif", filtreServiceAffichage === 2);
        document.getElementById("f-serv-3").classList.toggle("actif", filtreServiceAffichage === 3);
    }

    let listeHTML = document.getElementById("liste-enfants");
    listeHTML.innerHTML = ""; 

    let enfantsFiltres = baseEnfants.filter(enfant => {
        // S'assurer que l'enfant n'est pas masqué par la corbeille
        if (enfant.masque) return false;

    let bonneClasse = (filtresClasses.length === 0) ? true : filtresClasses.some(filtre => enfant.classe.startsWith(filtre));
        let bonStatut = (enfant.aMange === !modeAttente); 
        let identiteEnfant = (enfant.prenom + " " + UnifiedNom(enfant.nom)).toLowerCase();
        let correspondRecherche = identiteEnfant.includes(termeRecherche);
        
        let bonFiltreService = true;
        if (!modeAttente && filtreServiceAffichage !== 'Tous') {
            bonFiltreService = (enfant.service === filtreServiceAffichage);
        }
        
        return bonneClasse && bonStatut && correspondRecherche && bonFiltreService;
    });

    if (!modeAttente) {
        enfantsFiltres.sort((a, b) => b.heurePointage.localeCompare(a.heurePointage));
    }

    // Sécurité pour les chaînes de caractères de recherche
    function UnifiedNom(str) { return str ? String(str) : ""; }

// --- NOUVELLE GESTION DE LA LIMITE D'AFFICHAGE ---
    let enfantsAAfficher = enfantsFiltres.slice(0, limiteAffichage);

    enfantsAAfficher.forEach(enfant => {
        let div = document.createElement("div");
        div.className = modeAttente ? "enfant-carte" : "enfant-carte pointe";
        
        let texteAction = modeAttente ? "Pointer" : "Annuler";
        
        let infoService = "";
        if (!modeAttente && enfant.service !== null) {
            infoService = `<br><small>Service ${enfant.service} - Entrée : ${enfant.heurePointage} (Sortie vers ${enfant.heureSortie})</small>`;
        }
        
        // Définition des couleurs dynamiques pour le bouton Pointer/Annuler
        let couleurBordure = modeAttente ? "#009222" : "#ff0000"; 
        let couleurFond = modeAttente ? "#009222" : "#ff0000"; 

        // La poubelle n'est générée que si on est en mode "Attente" (liste de base)
        let boutonPoubelle = modeAttente 
            ? `<button onclick="supprimerEnfant(${enfant.id})" style="background-color: #ff0000; border: 2px solid #ff3d3d; border-radius: 6px; font-size: 14px; font-weight: bold; color: #ffffff; cursor: pointer; padding: 6px 12px; transition: 0.2s;" title="Retirer de la liste">Absent(e)</button>` 
            : "";
            
        // Structure scindée : Boutons bien séparés et mis en évidence
        div.innerHTML = `
            <div class="zone-clic-info" onclick="inverserStatutEnfant(${enfant.id})" style="flex-grow: 1; cursor: pointer; padding: 5px 0;">
                <strong>${enfant.prenom} ${enfant.nom}</strong> (${enfant.classe}) ${infoService}
            </div>
            <div class="zone-outils-carte" style="display: flex; align-items: center; gap: 120px;">
                <button onclick="inverserStatutEnfant(${enfant.id})" style="background-color: ${couleurFond}; border: 2px solid ${couleurBordure}; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; padding: 6px 12px; color: inherit; transition: 0.2s;">
                    ${texteAction}
                </button>
                ${boutonPoubelle}
            </div>
        `;        
        listeHTML.appendChild(div);
    });

    // --- LE BOUTON AFFICHER PLUS ---
    if (enfantsFiltres.length > limiteAffichage) {
        let btnPlus = document.createElement("button");
        btnPlus.innerText = "👇 Afficher plus d'enfants 👇";
        btnPlus.style.cssText = "background-color: #6c757d; color: white; border: none; border-radius: 6px; padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-top: 15px; margin-bottom: 20px;";
        
        btnPlus.onclick = function() {
            limiteAffichage += 20; 
            rafraichirAffichage();
        };

        listeHTML.appendChild(btnPlus);
    }

    mettreAJourCompteur();
    mettreAJourCompteursFiltres();
}

function inverserStatutEnfant(idEnfant) {
    let enfant = baseEnfants.find(e => e.id === idEnfant);
    if (enfant) {
        if (!enfant.aMange) {
            enfant.aMange = true;
            enfant.service = serviceActif;
            
            let maintenant = new Date();
            enfant.heurePointage = maintenant.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
            
            let tempsSortie = new Date(maintenant.getTime() + 20 * 60000);
            enfant.heureSortie = tempsSortie.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

        } else {
            childReset(enfant);
        }
        sauvegarderDonnees(); 
    }
    
    function childReset(e) {
        e.aMange = false;
        e.service = null;
        e.heurePointage = null;
        e.heureSortie = null;
    }

    document.getElementById("barre-recherche").value = "";
    termeRecherche = "";
    rafraichirAffichage();
}

function mettreAJourCompteur() {
    // 1. On isole d'abord les enfants actifs (non masqués par la corbeille)
    let enfantsActifs = baseEnfants.filter(e => !e.masque);

    // 2. On calcule les statistiques globales
    let repasValides = enfantsActifs.filter(e => e.aMange === true).length;
    let totalEnfants = enfantsActifs.length;
    
    // 3. Mise à jour du compteur principal en haut de l'écran
    document.getElementById("compteur").innerText = `Repas : ${repasValides} / ${totalEnfants}`;
    
    let zoneMessage = document.getElementById("message-fin");
    if (totalEnfants > 0 && repasValides === totalEnfants) {
        zoneMessage.innerText = "✅ Tous les enfants ont mangé !";
        zoneMessage.style.color = "#28a745"; 
    } else {
        zoneMessage.innerText = "";
    }

    // 4. Calcul dynamique des présences par service
    let compteursService = { 1: 0, 2: 0, 3: 0 };
    enfantsActifs.forEach(e => {
        if (e.aMange && compteursService[e.service] !== undefined) {
            compteursService[e.service]++;
        }
    });

    // 5. Mise à jour visuelle des boutons de sélection (Mode Pointage)
    let btnS1 = document.getElementById("btn-s1");
    if (btnS1) btnS1.innerText = `🍽️ 1er Service (${compteursService[1]})`;
    
    let btnS2 = document.getElementById("btn-s2");
    if (btnS2) btnS2.innerText = `🍽️ 2ème Service (${compteursService[2]})`;
    
    let btnS3 = document.getElementById("btn-s3");
    if (btnS3) btnS3.innerText = `🍽️ 3ème Service (${compteursService[3]})`;

    // 6. Mise à jour visuelle des boutons de filtres (Mode Vérification)
    let fServ1 = document.getElementById("f-serv-1");
    if (fServ1) fServ1.innerText = `Service 1 (${compteursService[1]})`;
    
    let fServ2 = document.getElementById("f-serv-2");
    if (fServ2) fServ2.innerText = `Service 2 (${compteursService[2]})`;
    
    let fServ3 = document.getElementById("f-serv-3");
    if (fServ3) fServ3.innerText = `Service 3 (${compteursService[3]})`;
}

function basculerTheme() {
    document.body.classList.toggle('dark-mode');
    let themeActuel = document.body.classList.contains('dark-mode') ? 'sombre' : 'clair';
    localStorage.setItem('themeCantine', themeActuel);
    mettreAJourBoutonTheme();
}

function chargerTheme() {
    let themeSauvegarde = localStorage.getItem('themeCantine');
    if (themeSauvegarde === 'sombre') {
        document.body.classList.add('dark-mode');
    }
    mettreAJourBoutonTheme();
}

function mettreAJourBoutonTheme() {
    let btnTheme = document.getElementById("btn-theme");
    let btnRestaurer = document.getElementById("btn-restaurer"); 
    
    if (document.body.classList.contains('dark-mode')) {
        btnTheme.innerText = "☀️ Mode Clair";
        btnTheme.style.backgroundColor = "#444c56"; 
        btnTheme.style.color = "#e0e0e0";
        
        if (btnRestaurer) {
            btnRestaurer.style.backgroundColor = "#444c56";
            btnRestaurer.style.color = "#e0e0e0";
        }
    } else {
        btnTheme.innerText = "🌙 Mode Sombre";
        btnTheme.style.backgroundColor = "#e2e6ea"; 
        btnTheme.style.color = "black";
        
        if (btnRestaurer) {
            btnRestaurer.style.backgroundColor = "#e2e6ea";
            btnRestaurer.style.color = "black";
        }
    }
}

// Initialisation au chargement du script
chargerDonnees(); 
chargerTheme();
rafraichirAffichage();

// =========================================================================
// MOTEUR D'IMPORTATION DYNAMIQUE (RADAR) DES EXTRACTIONS DE LA DIRECTION
// =========================================================================

function trouverColonneCantine(lignesExcel, jourCible) {
    const nomsJours = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi" };
    let nomJour = nomsJours[jourCible];

    if (!nomJour) return -1;

    let indexColJour = -1;
    let indexLigneJour = -1;

    // Étape 1 : Trouver la case contenant le jour
    for (let i = 0; i < 20; i++) {
        if (!lignesExcel[i]) continue;
        for (let j = 0; j < lignesExcel[i].length; j++) {
            let cellule = String(lignesExcel[i][j] || "").trim().toLowerCase();
            if (cellule.includes(nomJour.toLowerCase())) {
                indexColJour = j;
                indexLigneJour = i;
                break;
            }
        }
        if (indexColJour !== -1) break;
    }

    if (indexColJour === -1) return -1;

    // Étape 2 : Chercher la sous-colonne "Midi" UNIQUEMENT sur ou après ce jour
    for (let i = indexLigneJour; i <= indexLigneJour + 4; i++) {
        if (!lignesExcel[i]) continue;
        // La correction est ici : on commence la recherche pile à indexColJour (plus de retour en arrière)
        for (let j = indexColJour; j <= indexColJour + 3; j++) {
            let cellule = String(lignesExcel[i][j] || "").trim().toLowerCase();
            if (cellule.includes("midi")) {
                return j;
            }
        }
    }

    return indexColJour; // Sécurité si "Midi" n'est pas trouvé
}

function importerCSV(event) {
    let fichier = event.target.files[0];
    if (!fichier) return;

    let lecteur = new FileReader();

    lecteur.onload = function(e) {
        let data = new Uint8Array(e.target.result);

        try {
            let classeur = XLSX.read(data, {type: 'array'});
            let feuille = classeur.Sheets[classeur.SheetNames[0]];
            let lignes = XLSX.utils.sheet_to_json(feuille, {header: 1});

            let nouvelleBase = [];
            let idCompteur = 1;
            
            // --- ⚙️ CONFIGURATION DES CLASSES ---
            // L'ordre exact d'apparition des groupes dans le fichier d'export
            let ordreClasses = ["CPB", "CE1", "CM1", "CM2", "CE2", "CPA"];
            let indexGroupeCourant = -1; 

            // --- ⚠️ MODE TEST WEEK-END ---
            // LUNDI : N'oublie pas de remettre let jourActuel = new Date().getDay();
            //let jourActuel = 5; 
            let jourActuel = new Date().getDay()

            const nomsJours = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi" };
            let nomDuJour = nomsJours[jourActuel] || "ce jour";

            let indexColonneMidi = trouverColonneCantine(lignes, jourActuel);

            if (indexColonneMidi === -1) {
                alert(`❌ Le radar n'a pas trouvé la colonne du repas pour ${nomDuJour}.`);
                return;
            }

            let totalAttendu = 0;
            for (let i = lignes.length - 1; i >= 0; i--) {
                if (lignes[i] && lignes[i][indexColonneMidi] !== undefined) {
                    let val = String(lignes[i][indexColonneMidi]).trim();
                    let num = parseInt(val, 10);
                    if (!isNaN(num) && num > 0 && val === String(num)) {
                        totalAttendu = num;
                        break;
                    }
                }
            }

            for (let i = 0; i < lignes.length; i++) {
                let ligne = lignes[i];
                if (!ligne || ligne.length === 0) continue;

                let texteLigne = ligne.join(" ").toLowerCase();

                // DÉTECTION DU GROUPE : Dès qu'on voit l'en-tête, on passe à la classe suivante
                if (texteLigne.includes("inscrits") && (texteLigne.includes("régime") || texteLigne.includes("allergies"))) {
                    indexGroupeCourant++;
                    continue; 
                }

                if (indexGroupeCourant === -1) continue;

                let identiteBrute = "";
                for (let c = 0; c <= 3; c++) {
                    if (ligne[c] && String(ligne[c]).trim().length > 2) {
                        identiteBrute = String(ligne[c]).trim();
                        break;
                    }
                }

                if (identiteBrute === "") continue;
                if (identiteBrute.toLowerCase().includes("total") || identiteBrute.toLowerCase().includes("aucun")) continue;

                let estPrevuCeMidi = false;
                
                if (ligne[indexColonneMidi] !== undefined && ligne[indexColonneMidi] !== null) {
                    let valeurCase = String(ligne[indexColonneMidi]).toUpperCase().trim();
                    if (valeurCase === "X" || valeurCase === "V" || valeurCase === "1" || valeurCase === "OUI" || valeurCase === "O" || valeurCase === "AJ") {
                        estPrevuCeMidi = true;
                    }
                }

                if (estPrevuCeMidi) {
                    let mots = identiteBrute.split(" ");
                    let nom = mots[0] || "Inconnu";
                    let prenom = mots.slice(1).join(" ") || "";

                    // ATTRIBUTION AUTOMATIQUE DE LA CLASSE selon le nouvel ordre
                    let classeAttribuee = ordreClasses[indexGroupeCourant] || "Non précisée";

                    nouvelleBase.push({
                        id: idCompteur++,
                        nom: nom,
                        prenom: prenom,
                        classe: classeAttribuee, 
                        aMange: false,
                        service: null,
                        heurePointage: null,
                        heureSortie: null,
                        masque: false
                    });
                }
            }

            if (totalAttendu > 0 && nouvelleBase.length !== totalAttendu) {
                alert(`❌ ALERTE DE SÉCURITÉ :\nLe fichier indique un total de ${totalAttendu} enfants prévus pour le repas de ${nomDuJour}, mais l'application en a détecté ${nouvelleBase.length}.\n\nL'importation a été bloquée pour éviter toute erreur de pointage.`);
                document.getElementById("fichier-csv").value = "";
                return; 
            }

            if (nouvelleBase.length > 0) {
                baseEnfants = nouvelleBase;
                sauvegarderDonnees();
                rafraichirAffichage();
                document.getElementById("fichier-csv").value = "";
                alert(`✅ Importation sécurisée réussie !\nLe radar a détecté les ${nouvelleBase.length} enfants prévus pour le repas de ${nomDuJour}, et a trié les classes automatiquement.`);
            } else {
                alert(`❌ Aucun enfant trouvé pour le repas de ${nomDuJour}.`);
            }

        } catch (erreur) {
            console.error(erreur);
            alert("❌ Erreur : Impossible d'analyser le fichier.");
        }
    };

    lecteur.readAsArrayBuffer(fichier);
}

// =========================================================================
// GESTION DE LA RESTAURATION D'UN ENFANT ABSENT
// =========================================================================

function ouvrirMenuRestauration() {
    let exclus = baseEnfants.filter(e => e.masque === true);

    if (exclus.length === 0) {
        alert("ℹ️ Aucun enfant n'est actuellement absent ou supprimé de la liste.");
        return;
    }

    // 1. Définition de l'ordre hiérarchique des classes pour le menu
    const ordreClassesRestauration = {
        "Maternelle": 1, "CPA": 2, "CPB": 3, "CE1": 4, 
        "CE2": 5, "CM1": 6, "CM2": 7, "Non précisée": 8
    };

    // 2. Double Tri : Par classe en priorité, puis par nom de famille
    exclus.sort((a, b) => {
        let rangA = ordreClassesRestauration[a.classe] || 99;
        let rangB = ordreClassesRestauration[b.classe] || 99;
        
        // Si les classes sont différentes, on trie par classe
        if (rangA !== rangB) {
            return rangA - rangB; 
        }
        // Si c'est la même classe, on trie par ordre alphabétique
        return String(a.nom).localeCompare(String(b.nom));
    });

    let selectHTML = document.getElementById("select-restauration");
    selectHTML.innerHTML = ""; // On vide la liste précédente

    let optgroupCourant = null;
    let classeCourante = "";

    // 3. Injection dans le menu avec création dynamique des séparateurs
    exclus.forEach(enfant => {
        // Dès que la boucle détecte une nouvelle classe, elle crée un séparateur
        if (enfant.classe !== classeCourante) {
            classeCourante = enfant.classe;
            optgroupCourant = document.createElement("optgroup");
            optgroupCourant.label = `--- 📚 ${classeCourante} ---`;
            selectHTML.appendChild(optgroupCourant);
        }

        // Création de l'enfant
        let option = document.createElement("option");
        option.value = enfant.id;
        option.text = `${enfant.nom} ${enfant.prenom}`; // Plus besoin d'afficher la classe ici
        
        // On range l'enfant dans le séparateur en cours
        if (optgroupCourant) {
            optgroupCourant.appendChild(option);
        } else {
            selectHTML.appendChild(option);
        }
    });

    // On affiche la fenêtre modale
    document.getElementById("modal-restauration").style.display = "flex";
}

function fermerModalRestauration() {
    document.getElementById("modal-restauration").style.display = "none";
}

function validerRestaurationEnfant() {
    let selectElement = document.getElementById("select-restauration");
    let idSelectionne = parseInt(selectElement.value);

    let enfantAActiver = baseEnfants.find(e => e.id === idSelectionne);

    if (enfantAActiver) {
        // On retire le masque
        enfantAActiver.masque = false;
        
        sauvegarderDonnees();
        rafraichirAffichage();
        fermerModalRestauration();
        
        // Un petit délai pour éviter les bugs d'affichage sur smartphone
        setTimeout(() => {
            alert(`✅ ${enfantAActiver.prenom} ${enfantAActiver.nom} a été réintégré(e) dans la liste.`);
        }, 100);
    }
}

// =========================================================================
// GESTION DE L'AJOUT MANUEL D'UN ENFANT IMPRÉVU
// =========================================================================

function ouvrirModalAjout() {
    document.getElementById('modal-ajout').style.display = 'flex';
}

function fermerModalAjout() {
    document.getElementById('modal-ajout').style.display = 'none';
    // On vide les champs pour la prochaine fois
    document.getElementById('ajout-prenom').value = '';
    document.getElementById('ajout-nom').value = '';
    document.getElementById('ajout-classe').value = 'Non précisée';
}

function validerAjoutEnfant() {
    let prenom = document.getElementById('ajout-prenom').value.trim();
    let nom = document.getElementById('ajout-nom').value.trim();
    let classe = document.getElementById('ajout-classe').value;

    if (prenom === "" || nom === "") {
        alert("❌ Le prénom et le nom sont obligatoires.");
        return;
    }

    // Sécurité : On génère un ID unique pour cet enfant (le plus grand ID + 1)
    let maxId = 0;
    if (baseEnfants.length > 0) {
        maxId = Math.max(...baseEnfants.map(e => e.id));
    }
    
    let nouvelEnfant = {
        id: maxId + 1,
        prenom: prenom,
        nom: nom,
        classe: classe,
        aMange: false,
        service: null,
        heurePointage: null,
        heureSortie: null,
        masque: false
    };

    baseEnfants.push(nouvelEnfant);
    sauvegarderDonnees();
    rafraichirAffichage();
    fermerModalAjout();
    alert(`✅ ${prenom} ${nom} a été ajouté manuellement à la liste.`);
}

// =========================================================================
// ACTIONS DE MASSE ET COMPTEURS DYNAMIQUES
// =========================================================================

function gererAbsenceClasse(classeCible) {
    // On isole les enfants de cette classe qui ne sont pas encore passés à la cantine
    let enfantsDeLaClasse = baseEnfants.filter(e => e.classe === classeCible && !e.aMange);
    let enfantsActifs = enfantsDeLaClasse.filter(e => !e.masque);

    if (enfantsActifs.length > 0) {
        // ACTION : ABSENTER (S'il reste des enfants actifs dans la liste)
        if (confirm(`Action de sécurité : Es-tu sûr de vouloir marquer tous les élèves de ${classeCible} comme absents ce midi ?`)) {
            enfantsActifs.forEach(enfant => enfant.masque = true);
            sauvegarderDonnees();
            rafraichirAffichage();
        }
    } else {
        // ACTION : RESTAURER (Si tout le monde est déjà masqué)
        let enfantsMasques = enfantsDeLaClasse.filter(e => e.masque);
        if (enfantsMasques.length > 0) {
            if (confirm(`Veux-tu réintégrer tous les élèves absents de ${classeCible} ?`)) {
                enfantsMasques.forEach(enfant => enfant.masque = false);
                sauvegarderDonnees();
                rafraichirAffichage();
            }
        } else {
            alert(`ℹ️ Aucun enfant de ${classeCible} dans la liste d'aujourd'hui.`);
        }
    }
}

function mettreAJourCompteursFiltres() {
    let compteurs = { "CPA": 0, "CPB": 0, "CE1": 0, "CE2": 0, "CM1": 0, "CM2": 0 };
    let totalEnAttente = 0;

    baseEnfants.forEach(enfant => {
        if (!enfant.masque && !enfant.aMange) { 
            if (compteurs[enfant.classe] !== undefined) {
                compteurs[enfant.classe]++;
            }
            totalEnAttente++;
        }
    });

    // Mise à jour du texte des boutons de filtres
    document.getElementById('btn-filtre-cpa').innerText = `CPA (${compteurs["CPA"]})`;
    document.getElementById('btn-filtre-cpb').innerText = `CPB (${compteurs["CPB"]})`;
    document.getElementById('btn-filtre-ce1').innerText = `CE1 (${compteurs["CE1"]})`;
    document.getElementById('btn-filtre-ce2').innerText = `CE2 (${compteurs["CE2"]})`;
    document.getElementById('btn-filtre-cm1').innerText = `CM1 (${compteurs["CM1"]})`;
    document.getElementById('btn-filtre-cm2').innerText = `CM2 (${compteurs["CM2"]})`;
    document.getElementById('btn-filtre-tous').innerText = `Voir Tous (${totalEnAttente})`;

    // Mise à jour visuelle des boutons d'Absence/Restauration
    let classesList = ["CPA", "CPB", "CE1", "CE2", "CM1", "CM2"];
    classesList.forEach(classe => {
        let btnAction = document.getElementById(`btn-action-${classe.toLowerCase()}`);
        if (btnAction) {
            let enfantsDeLaClasse = baseEnfants.filter(e => e.classe === classe && !e.aMange);
            let enfantsActifs = enfantsDeLaClasse.filter(e => !e.masque);
            
            if (enfantsDeLaClasse.length > 0 && enfantsActifs.length === 0) {
                // Tout le groupe est masqué -> Le bouton devient vert et propose de restaurer
                btnAction.innerText = `✅ Restaurer ${classe}`;
                btnAction.style.backgroundColor = "#28a745"; 
            } else {
                // Comportement normal -> Le bouton reste rouge et propose d'absenter
                btnAction.innerText = `🚫 Absenter ${classe}`;
                btnAction.style.backgroundColor = "#dc3545"; 
            }
        }
    });
}