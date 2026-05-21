const baseParDefaut = [
    { id: 1, prenom: "Léo", nom: "Martin", classe: "CP", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 2, prenom: "Mia", nom: "Bernard", classe: "CP", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 3, prenom: "Théo", nom: "Dubois", classe: "CE1", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 4, prenom: "Chloé", nom: "Thomas", classe: "CE1", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 5, prenom: "Hugo", nom: "Robert", classe: "CE2", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 6, prenom: "Emma", nom: "Richard", classe: "CM1", aMange: false, service: null, heurePointage: null, heureSortie: null },
    { id: 7, prenom: "Lucas", nom: "Petit", classe: "CM2", aMange: false, service: null, heurePointage: null, heureSortie: null }
];

let baseEnfants = [];
let filtresClasses = []; 
let modeAttente = true; 
let termeRecherche = ""; 
let serviceActif = 1; 
let filtreServiceAffichage = 'Tous'; 

function chargerDonnees() {
    let sauvegarde = localStorage.getItem('sauvegardeCantine');
    if (sauvegarde) {
        baseEnfants = JSON.parse(sauvegarde);
    } else {
        baseEnfants = JSON.parse(JSON.stringify(baseParDefaut));
    }
}

function sauvegarderDonnees() {
    localStorage.setItem('sauvegardeCantine', JSON.stringify(baseEnfants));
}

function reinitialiserJournee() {
    let reponse = prompt("⚠️ ATTENTION : Cela va remettre à zéro tous les pointages d'aujourd'hui.\nPour confirmer, tapez 'effacer' :");

    if (reponse !== null && reponse.toLowerCase().trim() === "effacer") {
        // Au lieu de détruire la sauvegarde, on remet juste les compteurs de la journée à zéro
        baseEnfants.forEach(enfant => {
            enfant.aMange = false;
            enfant.service = null;
            enfant.heurePointage = null;
            enfant.heureSortie = null;
        });
        
        sauvegarderDonnees(); // On sauvegarde la liste avec les compteurs à zéro
        changerService(1); 
        rafraichirAffichage(); 
        alert("✅ Pointages réinitialisés ! La liste des enfants est conservée pour la prochaine journée.");
    } else if (reponse !== null) {
        alert("❌ Mot de sécurité incorrect. L'effacement a été annulé.");
    }
}

function lancerRecherche() {
    let champ = document.getElementById("barre-recherche");
    termeRecherche = champ.value.toLowerCase(); 
    rafraichirAffichage();
}

function basculerMode() {
    modeAttente = !modeAttente; 
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
        let bonneClasse = (filtresClasses.length === 0) ? true : filtresClasses.includes(enfant.classe);
        let bonStatut = (enfant.aMange === !modeAttente); 
        let identiteEnfant = (enfant.prenom + " " + enfant.nom).toLowerCase();
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

    enfantsFiltres.forEach(enfant => {
        let div = document.createElement("div");
        div.className = modeAttente ? "enfant-carte" : "enfant-carte pointe";
        
        let texteAction = modeAttente ? "Pointer" : "Annuler";
        
        let infoService = "";
        if (!modeAttente && enfant.service !== null) {
            // Modification du texte avec la grammaire neutre et l'ajout de la sortie prévue
            // Note : J'ai enlevé le style="color..." codé en dur pour laisser ton CSS gérer la couleur proprement selon le thème
            infoService = `<br><small>Service ${enfant.service} - Heure d'entrée : ${enfant.heurePointage} (Sortie vers ${enfant.heureSortie})</small>`;
        }
        
        div.innerHTML = `<span><strong>${enfant.prenom} ${enfant.nom}</strong> (${enfant.classe}) ${infoService}</span> <span><small>${texteAction}</small></span>`;
        div.onclick = function() { inverserStatutEnfant(enfant.id); };
        
        listeHTML.appendChild(div);
    });

    mettreAJourCompteur();
}

function inverserStatutEnfant(idEnfant) {
    let enfant = baseEnfants.find(e => e.id === idEnfant);
    if (enfant) {
        if (!enfant.aMange) {
            enfant.aMange = true;
            enfant.service = serviceActif;
            
            // Calcul de l'heure d'entrée
            let maintenant = new Date();
            enfant.heurePointage = maintenant.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
            
            // NOUVEAU : Calcul de l'heure de sortie (+20 minutes)
            // 20 minutes = 20 * 60000 millisecondes
            let tempsSortie = new Date(maintenant.getTime() + 20 * 60000);
            enfant.heureSortie = tempsSortie.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

        } else {
            enfant.aMange = false;
            enfant.service = null;
            enfant.heurePointage = null;
            enfant.heureSortie = null;
        }
        sauvegarderDonnees(); 
    }
    
    document.getElementById("barre-recherche").value = "";
    termeRecherche = "";
    rafraichirAffichage();
}

function mettreAJourCompteur() {
    let repasValides = baseEnfants.filter(e => e.aMange === true).length;
    let totalEnfants = baseEnfants.length;
    
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
    if (document.body.classList.contains('dark-mode')) {
        btnTheme.innerText = "☀️ Mode Clair";
        btnTheme.style.backgroundColor = "#444c56"; 
        btnTheme.style.color = "#e0e0e0";
    } else {
        btnTheme.innerText = "🌙 Mode Sombre";
        btnTheme.style.backgroundColor = "#e2e6ea"; 
        btnTheme.style.color = "black";
    }
}

chargerDonnees(); 
chargerTheme();
rafraichirAffichage();

// --------------------------------------------------------
// IMPORTATION DU FICHIER (CSV, XLS, XML) VIA SHEETJS
// --------------------------------------------------------

function importerCSV(event) {
    let fichier = event.target.files[0];
    if (!fichier) return;

    let lecteur = new FileReader();

    lecteur.onload = function(e) {
        let data = new Uint8Array(e.target.result);

        try {
            // Lecture du fichier via SheetJS
            let classeur = XLSX.read(data, {type: 'array'});
            let nomPremiereFeuille = classeur.SheetNames[0];
            let feuille = classeur.Sheets[nomPremiereFeuille];
            let lignes = XLSX.utils.sheet_to_json(feuille, {header: 1});

            let nouvelleBase = [];
            let idCompteur = 1;
            let debutDonnees = false;

            // --- 1. DÉTECTION DU JOUR ACTUEL ---
            let jourActuel = new Date().getDay(); // 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam

            // --- 2. CONFIGURATION DES COLONNES ---
            // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13, O=14, P=15
            let indexColonneMidi = 15; // Lundi par défaut

            if (jourActuel === 1) {
                indexColonneMidi = 15; // Lundi Midi (P)
            } else if (jourActuel === 2) {
                indexColonneMidi = 4;  // Mardi Midi (E)
            } else if (jourActuel === 4) {
                indexColonneMidi = 7;  // Jeudi Midi (H)
            } else if (jourActuel === 5) {
                indexColonneMidi = 10; // Vendredi Midi (K)
            }

            // --- 3. LECTURE DES LIGNES ---
            for (let i = 0; i < lignes.length; i++) {
                let ligne = lignes[i];

                if (!ligne || ligne.length === 0) continue;

                if (!debutDonnees) {
                    let texteLigne = ligne.join(" ").toLowerCase();
                    // On cherche la ligne 7 avec le mot-clé
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

            // --- 4. VALIDATION ---
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