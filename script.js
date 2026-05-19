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
// IMPORTATION DU FICHIER CSV
// --------------------------------------------------------

function importerCSV(event) {
    let fichier = event.target.files[0];
    if (!fichier) return;

    let lecteur = new FileReader();
    
    // Ce code s'exécute quand le fichier a fini d'être lu
    lecteur.onload = function(e) {
        let contenu = e.target.result;
        
        // On découpe le fichier ligne par ligne
        let lignes = contenu.split('\n');
        let nouvelleBase = [];
        let idCompteur = 1;

        // On commence à la ligne 1 (i = 1) pour sauter les en-têtes du tableau
        for (let i = 1; i < lignes.length; i++) {
            let ligne = lignes[i].trim();
            if (ligne) {
                // Les tableurs français exportent souvent avec des points-virgules
                let colonnes = ligne.split(';'); 
                
                // Si la ligne contient bien au moins 3 infos (Nom, Prénom, Classe)
                if (colonnes.length >= 3) {
                    nouvelleBase.push({
                        id: idCompteur++,
                        nom: colonnes[0].trim(),
                        prenom: colonnes[1].trim(),
                        classe: colonnes[2].trim(),
                        aMange: false,
                        service: null,
                        heurePointage: null,
                        heureSortie: null
                    });
                }
            }
        }

        // Si on a réussi à extraire des enfants, on remplace l'ancienne base
        if (nouvelleBase.length > 0) {
            baseEnfants = nouvelleBase;
            sauvegarderDonnees();
            rafraichirAffichage();
            // On remet le champ de fichier à zéro
            document.getElementById("fichier-csv").value = "";
            alert("✅ Importation réussie ! " + nouvelleBase.length + " enfants ont été chargés pour aujourd'hui.");
        } else {
            alert("❌ Erreur : Le fichier semble vide ou n'est pas au bon format.");
        }
    };
    
    // On lance la lecture du fichier
    lecteur.readAsText(fichier, 'UTF-8');
}