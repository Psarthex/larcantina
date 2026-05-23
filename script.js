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
        let nomBouton = btn.innerText;
        if (filtresClasses.length === 0 && nomBouton === 'Voir Tous') {
            btn.classList.add("actif");
        } else if (filtresClasses.includes(nomBouton)) {
            btn.classList.add("actif");
        } else {
            btn.classList.remove("actif");
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

        let bonneClasse = (filtresClasses.length === 0) ? true : filtresClasses.includes(enfant.classe);
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
            ? `<button onclick="supprimerEnfant(${enfant.id})" style="background-color: #ff0000; border: 2px solid #ff3d3d; border-radius: 6px; font-size: 14px; font-weight: bold; color: #ffffff; cursor: pointer; padding: 6px 12px; transition: 0.2s;" title="Retirer de la liste">Supprimer</button>` 
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

    // 2. On calcule les statistiques uniquement sur ces enfants actifs
    let repasValides = enfantsActifs.filter(e => e.aMange === true).length;
    let totalEnfants = enfantsActifs.length;
    
    // 3. Mise à jour de l'interface
    document.getElementById("compteur").innerText = `Repas : ${repasValides} / ${totalEnfants}`;
    
    let zoneMessage = document.getElementById("message-fin");
    if (totalEnfants > 0 && repasValides === totalEnfants) {
        zoneMessage.innerText = "✅ Tous les enfants ont mangé !";
        zoneMessage.style.color = "#28a745"; 
    } else {
        zoneMessage.innerText = "";
    }
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
// MOTEUR D'IMPORTATION DES EXTRACTIONS DE LA DIRECTION
// =========================================================================
function importerCSV(event) {
    let fichier = event.target.files[0];
    if (!fichier) return;

    let lecteur = new FileReader();

    lecteur.onload = function(e) {
        let data = new Uint8Array(e.target.result);

        try {
            let classeur = XLSX.read(data, {type: 'array'});
            let nomPremiereFeuille = classeur.SheetNames[0];
            let feuille = classeur.Sheets[nomPremiereFeuille];
            let lignes = XLSX.utils.sheet_to_json(feuille, {header: 1});

            let nouvelleBase = [];
            let idCompteur = 1;
            let debutDonnees = false;

            let jourActuel = new Date().getDay(); 
            let indexColonneMidi = 15; // Valeur par défaut (Lundi)

            if (jourActuel === 1) {
                indexColonneMidi = 15; // Lundi Midi (P)
            } else if (jourActuel === 2) {
                indexColonneMidi = 4;  // Mardi Midi (E)
            } else if (jourActuel === 4) {
                indexColonneMidi = 7;  // Jeudi Midi (H)
            } else if (jourActuel === 5) {
                indexColonneMidi = 10; // Vendredi Midi (K)
            }

            for (let i = 0; i < lignes.length; i++) {
                let ligne = lignes[i];

                if (!ligne || ligne.length === 0) continue;

                if (!debutDonnees) {
                    let texteLigne = ligne.join(" ").toLowerCase();
                    if (texteLigne.includes("inscrits") || texteLigne.includes("nom") || texteLigne.includes("prénom")) {
                        debutDonnees = true;
                    }
                    continue; 
                }

                if (ligne.length >= 2 && ligne[0] !== undefined && ligne[1] !== undefined) {
                    let estPrevuCeMidi = false;

                    if (ligne[indexColonneMidi]) {
                        let valeurCase = String(ligne[indexColonneMidi]).toUpperCase().trim();
                        if (valeurCase === "X" || valeurCase === "1" || valeurCase === "OUI") {
                            estPrevuCeMidi = true;
                        }
                    }

                    if (estPrevuCeMidi) {
                        nouvelleBase.push({
                            id: idCompteur++,
                            nom: String(ligne[0]).trim(),
                            prenom: String(ligne[1]).trim(),
                            classe: "Non précisée", 
                            aMange: false,
                            service: null,
                            heurePointage: null,
                            heureSortie: null
                        });
                    }
                }
            }

            if (nouvelleBase.length > 0) {
                baseEnfants = nouvelleBase;
                sauvegarderDonnees();
                rafraichirAffichage();
                document.getElementById("fichier-csv").value = "";
                alert("✅ Importation réussie ! " + nouvelleBase.length + " enfants chargés pour le repas de ce midi.");
            } else {
                alert("❌ Erreur : Aucun enfant trouvé avec une croix pour le repas de ce midi.");
            }

        } catch (erreur) {
            console.error("Erreur de lecture SheetJS :", erreur);
            alert("❌ Erreur : Impossible d'analyser le fichier.");
        }
    };

    lecteur.readAsArrayBuffer(fichier);
}

function ouvrirMenuRestauration() {
    // On récupère uniquement les enfants marqués comme masqués
    let exclus = baseEnfants.filter(e => e.masque === true);

    if (exclus.length === 0) {
        alert("ℹ️ Aucun enfant n'a été supprimé aujourd'hui.");
        return;
    }

    // On prépare le texte de la liste
    let message = "Sélectionnez le numéro de l'enfant à restaurer :\n\n";
    exclus.forEach((enfant, index) => {
        message += `${index + 1}. ${enfant.prenom} ${enfant.nom}\n`;
    });

    let choix = prompt(message);
    
    if (choix !== null) {
        let indexSelection = parseInt(choix) - 1;
        if (indexSelection >= 0 && indexSelection < exclus.length) {
            let enfantAActiver = exclus[indexSelection];
            
            // On retire le masque pour le réintégrer
            enfantAActiver.masque = false;
            
            sauvegarderDonnees();
            rafraichirAffichage();
            alert(`✅ ${enfantAActiver.prenom} ${enfantAActiver.nom} a été réintégré dans la liste.`);
        } else {
            alert("❌ Numéro invalide. Opération annulée.");
        }
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