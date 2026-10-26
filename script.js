/* ===== Bouton de motivation ===== */

// On récupère le bouton et le paragraphe du message.
const bouton = document.getElementById("bouton-bienvenue");
const message = document.getElementById("message-bienvenue");

// On vérifie que ces éléments existent sur la page.
if (bouton !== null && message !== null) {

    // Cette fonction s'exécute au clic sur le bouton.
    bouton.addEventListener("click", function () {
        message.textContent = "Un petit pas à la fois ! Tu peux le faire !";
    });
}



/* ===== Formulaire et sauvegarde des devoirs ===== */

// On récupère le formulaire et les éléments de la liste.
const formulaire = document.getElementById("formulaire-devoir");
const liste = document.getElementById("liste-devoirs");
const messageListe = document.getElementById("message-liste");
const messageConfirmation = document.getElementById(
    "message-confirmation"
);

// Cette clé permet d'identifier nos devoirs dans le navigateur.
const CLE_DEVOIRS = "studyhub_devoirs";

// On vérifie que nous sommes sur la page des devoirs.
if (formulaire && liste && messageListe && messageConfirmation) {

    // On récupère les devoirs déjà enregistrés.
    let devoirs = [];

    try {
        const donnees = localStorage.getItem(CLE_DEVOIRS);

        if (donnees !== null) {
            const resultat = JSON.parse(donnees);
			//JSON.parse() : reconstruit la liste lorsqu'on revient sur la page.

            // On vérifie que les données récupérées sont une liste.
            if (Array.isArray(resultat)) {
                devoirs = resultat.filter(function (devoir) {
                    return devoir
                        && typeof devoir.id === "string"
                        && typeof devoir.titre === "string"
                        && typeof devoir.matiere === "string"
                        && typeof devoir.date === "string"
                        && typeof devoir.termine === "boolean";
                });
            }
        }
    } catch (erreur) {
        messageConfirmation.textContent =
            "Impossible de lire les devoirs enregistrés.";
    }

    // Cette fonction affiche tous les devoirs à l'écran.
    function afficherDevoirs() {

        // On vide la liste avant de la reconstruire.
        liste.replaceChildren();

        // On affiche un message si la liste est vide.
        messageListe.textContent = devoirs.length === 0
            ? "Aucun devoir pour le moment."
            : devoirs.length + " devoir(s) enregistré(s).";

        // On crée un élément HTML pour chaque devoir.
        devoirs.forEach(function (devoir) {

            const element = document.createElement("li");

            // La case permet de marquer un devoir comme terminé.
            const caseTermine = document.createElement("input");
            caseTermine.type = "checkbox";
            caseTermine.checked = devoir.termine;
            caseTermine.setAttribute(
                "aria-label",
                "Marquer " + devoir.titre + " comme terminé"
            );

            // Le texte présente le titre, la matière et la date.
            const texte = document.createElement("span");
            texte.textContent =
                " " + devoir.titre
                + " — " + devoir.matiere
                + " — Pour le " + devoir.date;

            if (devoir.termine) {
                texte.style.textDecoration = "line-through";
            }

            // Quand la case change, on sauvegarde le nouvel état.
            caseTermine.addEventListener("change", function () {
                devoir.termine = caseTermine.checked;

                if (sauvegarderDevoirs()) {
                    afficherDevoirs();
                    messageConfirmation.textContent =
                        "État du devoir enregistré.";
                }
            });

            // Bouton pour supprimer un devoir.
            const boutonSupprimer = document.createElement("button");
            boutonSupprimer.type = "button";
            boutonSupprimer.textContent = "Supprimer";

            boutonSupprimer.addEventListener("click", function () {
                const anciensDevoirs = devoirs;

                devoirs = devoirs.filter(function (elementDevoir) {
                    return elementDevoir.id !== devoir.id;
                });

                if (sauvegarderDevoirs()) {
                    afficherDevoirs();
                    messageConfirmation.textContent =
                        "Devoir supprimé.";
                } else {
                    devoirs = anciensDevoirs;
                }
            });

            // On assemble les éléments du devoir.
            element.appendChild(caseTermine);
            element.appendChild(texte);
            element.appendChild(boutonSupprimer);

            liste.appendChild(element);
        });
    }

    // Cette fonction enregistre la liste dans le navigateur.
    function sauvegarderDevoirs() {
        try {
            localStorage.setItem(
                CLE_DEVOIRS,
                JSON.stringify(devoirs)
            );
	//localStorage : "conserve" les devoirs dans le navigateur.
	//JSON.stringify() : transforme la liste en texte pour la sauvegarder
            return true;

        } catch (erreur) {
            messageConfirmation.textContent =
                "La sauvegarde a échoué. Vérifie l'espace disponible "
                + "ou les paramètres du navigateur.";

            return false;
        }
    }

    // Quand on envoie le formulaire, on ajoute un devoir.
    formulaire.addEventListener("submit", function (event) {

        // Empêche la page de se recharger automatiquement.
        event.preventDefault();

        // On récupère les valeurs saisies.
        const titre = document.getElementById("titre").value.trim();
        const matiere = document.getElementById("matiere").value;
        const date = document.getElementById("date-limite").value;

        // On vérifie que les champs ne sont pas vides.
        if (titre === "" || matiere === "" || date === "") {
            messageConfirmation.textContent =
                "Remplis tous les champs avant d'ajouter le devoir.";
            return;
        }

        // On crée un nouvel objet qui représente le devoir.
        const nouveauDevoir = {
            id: Date.now().toString()
                + "-" + Math.random().toString(36).slice(2),
            titre: titre,
            matiere: matiere,
            date: date,
            termine: false
        };

        // On ajoute le devoir à la liste.
        devoirs.push(nouveauDevoir);

        // On sauvegarde avant de confirmer l'ajout.
        if (sauvegarderDevoirs()) {
            afficherDevoirs();
            formulaire.reset();

            messageConfirmation.textContent =
                "Devoir ajouté et enregistré !";
        } else {
            // Si la sauvegarde échoue, on retire le devoir ajouté.
            devoirs.pop();
        }
    });

    // On affiche les devoirs sauvegardés à l'ouverture de la page.
    afficherDevoirs();
}

/* ===== Calendrier StudyHub ===== */

// On récupère les éléments propres à la page calendrier.
const calendrierGrille = document.getElementById("calendrier");
const calendrierTitre = document.getElementById("titre-mois");
const calendrierPrecedent = document.getElementById("mois-precedent");
const calendrierSuivant = document.getElementById("mois-suivant");
const calendrierTitreJour = document.getElementById("titre-jour");
const calendrierListeJour = document.getElementById("devoirs-du-jour");
const calendrierMessageJour = document.getElementById("message-jour");

// Ce code ne fonctionne que sur la page calendrier.
if (
    calendrierGrille &&
    calendrierTitre &&
    calendrierPrecedent &&
    calendrierSuivant &&
    calendrierTitreJour &&
    calendrierListeJour &&
    calendrierMessageJour
) {
    const cleCalendrier = "studyhub_devoirs";

    // On part du mois actuel.
    const maintenantCalendrier = new Date();

    let anneeCalendrier = maintenantCalendrier.getFullYear();
    let moisCalendrier = maintenantCalendrier.getMonth();

    // Le jour sélectionné est aujourd'hui au départ.
    let jourSelectionne = formaterDate(
        maintenantCalendrier.getFullYear(),
        maintenantCalendrier.getMonth() + 1,
        maintenantCalendrier.getDate()
    );

    // Convertit une date en texte AAAA-MM-JJ.
    function formaterDate(annee, mois, jour) {
        return annee + "-"
            + String(mois).padStart(2, "0") + "-"
            + String(jour).padStart(2, "0");
    }

    // Récupère les devoirs sauvegardés par la page Mes devoirs.
    function lireDevoirsCalendrier() {
        try {
            const texteSauvegarde =
                localStorage.getItem(cleCalendrier);

            if (texteSauvegarde === null) {
                return [];
            }

            const resultat = JSON.parse(texteSauvegarde);

            if (!Array.isArray(resultat)) {
                return [];
            }

            // On conserve uniquement les devoirs avec des données valides.
            return resultat.filter(function (devoir) {
                if (
                    !devoir ||
                    typeof devoir.titre !== "string" ||
                    typeof devoir.matiere !== "string" ||
                    typeof devoir.date !== "string" ||
                    typeof devoir.termine !== "boolean"
                ) {
                    return false;
                }

                // Vérifie que la date existe réellement.
                const morceaux = devoir.date.split("-");

                if (
                    morceaux.length !== 3 ||
                    !morceaux.every(function (morceau) {
                        return /^\d+$/.test(morceau);
                    })
                ) {
                    return false;
                }

                const annee = Number(morceaux[0]);
                const mois = Number(morceaux[1]);
                const jour = Number(morceaux[2]);

                const dateVerifiee = new Date(annee, mois - 1, jour);

                return dateVerifiee.getFullYear() === annee
                    && dateVerifiee.getMonth() === mois - 1
                    && dateVerifiee.getDate() === jour;
            });

        } catch (erreur) {
            calendrierMessageJour.textContent =
                "Impossible de lire les devoirs enregistrés.";

            return [];
        }
    }

    // Affiche les détails d'une date sélectionnée.
    function afficherDetailsJour(dateTexte) {
        jourSelectionne = dateTexte;

        const morceaux = dateTexte.split("-");
        const date = new Date(
            Number(morceaux[0]),
            Number(morceaux[1]) - 1,
            Number(morceaux[2])
        );

        calendrierTitreJour.textContent = date.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

        calendrierListeJour.replaceChildren();

        const devoirsDuJour = lireDevoirsCalendrier().filter(
            function (devoir) {
                return devoir.date === dateTexte;
            }
        );

        if (devoirsDuJour.length === 0) {
            calendrierMessageJour.textContent =
                "Aucun devoir enregistré pour cette date.";
            return;
        }

        calendrierMessageJour.textContent =
            devoirsDuJour.length + " devoir(s) pour cette date.";

        devoirsDuJour.forEach(function (devoir) {
            const element = document.createElement("li");

            element.textContent =
                devoir.titre + " — " + devoir.matiere
                + (devoir.termine ? " — Terminé" : " — À faire");

            calendrierListeJour.appendChild(element);
        });
    }

    // Construit les cases du mois affiché.
    function afficherCalendrier() {
        calendrierGrille.replaceChildren();

        const nomMois = new Date(
            anneeCalendrier,
            moisCalendrier,
            1
        ).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric"
        });

        calendrierTitre.textContent =
            nomMois.charAt(0).toUpperCase() + nomMois.slice(1);

        const nomsJours = [
            "Lun.", "Mar.", "Mer.", "Jeu.",
            "Ven.", "Sam.", "Dim."
        ];

        // On ajoute les noms des jours de la semaine.
        nomsJours.forEach(function (nom) {
            const entete = document.createElement("div");
            entete.className = "nom-jour";
            entete.textContent = nom;
            calendrierGrille.appendChild(entete);
        });

        const premierJour = new Date(
            anneeCalendrier,
            moisCalendrier,
            1
        );

        const nombreJours = new Date(
            anneeCalendrier,
            moisCalendrier + 1,
            0
        ).getDate();

        // En JavaScript, dimanche vaut 0. Ici, la semaine commence lundi.
        const decalage = (premierJour.getDay() + 6) % 7;

        // Les cases vides avant le premier jour du mois.
        for (let i = 0; i < decalage; i++) {
            const vide = document.createElement("div");
            vide.className = "case-jour jour-vide";
            vide.setAttribute("aria-hidden", "true");
            calendrierGrille.appendChild(vide);
        }

        const devoirs = lireDevoirsCalendrier();

        // On crée une case pour chaque jour du mois.
        for (let jour = 1; jour <= nombreJours; jour++) {
            const dateTexte = formaterDate(
                anneeCalendrier,
                moisCalendrier + 1,
                jour
            );

            const caseJour = document.createElement("button");
            caseJour.type = "button";
            caseJour.className = "case-jour";
            caseJour.setAttribute(
                "aria-label",
                "Afficher les devoirs du " + jour
                    + " " + nomMois
            );

            if (
                jour === maintenantCalendrier.getDate() &&
                moisCalendrier === maintenantCalendrier.getMonth() &&
                anneeCalendrier === maintenantCalendrier.getFullYear()
            ) {
                caseJour.classList.add("aujourdhui");
            }

            if (dateTexte === jourSelectionne) {
                caseJour.classList.add("selectionne");
                caseJour.setAttribute("aria-pressed", "true");
            } else {
                caseJour.setAttribute("aria-pressed", "false");
            }

            const numero = document.createElement("span");
            numero.className = "numero-jour";
            numero.textContent = jour;
            caseJour.appendChild(numero);

            // On recherche les devoirs dont la date correspond à ce jour.
            const devoirsDuJour = devoirs.filter(function (devoir) {
                return devoir.date === dateTexte;
            });

            // On montre les deux premiers devoirs dans la case.
            devoirsDuJour.slice(0, 2).forEach(function (devoir) {
                const etiquette = document.createElement("span");

                etiquette.className = devoir.termine
                    ? "mini-devoir termine"
                    : "mini-devoir a-faire";

                etiquette.textContent = devoir.titre;
                caseJour.appendChild(etiquette);
            });

            // Si d'autres devoirs existent, on indique leur nombre.
            if (devoirsDuJour.length > 2) {
                const supplement = document.createElement("span");
                supplement.className = "plus-devoirs";
                supplement.textContent =
                    "+" + (devoirsDuJour.length - 2) + " autre(s)";
                caseJour.appendChild(supplement);
            }

            // Un clic affiche la liste complète du jour.
            caseJour.addEventListener("click", function () {
                afficherDetailsJour(dateTexte);
                afficherCalendrier();
            });

            calendrierGrille.appendChild(caseJour);
        }
    }

    // Bouton pour afficher le mois précédent.
    calendrierPrecedent.addEventListener("click", function () {
        moisCalendrier--;

        if (moisCalendrier < 0) {
            moisCalendrier = 11;
            anneeCalendrier--;
        }

        afficherCalendrier();
    });

    // Bouton pour afficher le mois suivant.
    calendrierSuivant.addEventListener("click", function () {
        moisCalendrier++;

        if (moisCalendrier > 11) {
            moisCalendrier = 0;
            anneeCalendrier++;
        }

        afficherCalendrier();
    });

    // Au chargement, on affiche le mois actuel et ses devoirs.
    afficherCalendrier();
    afficherDetailsJour(jourSelectionne);
}


/* ===== Minuteur avec sessions automatiques ===== */

// On récupère les éléments de la page.
const concentrationMinuteur = document.getElementById("minuteur");
const concentrationEtat = document.getElementById("etat-minuteur");
const concentrationProgression =
    document.getElementById("progression-sessions");

const concentrationModeTravail = document.getElementById("mode-travail");
const concentrationModePause = document.getElementById("mode-pause");

const concentrationBoutonDemarrer =
    document.getElementById("demarrer-minuteur");
const concentrationBoutonPause =
    document.getElementById("pause-minuteur");
const concentrationBoutonReset =
    document.getElementById("reinitialiser-minuteur");

const concentrationFormulaire =
    document.getElementById("formulaire-durees");
const concentrationInputTravail =
    document.getElementById("duree-travail");
const concentrationInputPause =
    document.getElementById("duree-pause");
const concentrationInputSessions =
    document.getElementById("nombre-sessions");
const concentrationMessage =
    document.getElementById("message-durees");

// Ce code ne fonctionne que si les éléments nécessaires existent.
if (
    concentrationMinuteur &&
    concentrationEtat &&
    concentrationProgression &&
    concentrationModeTravail &&
    concentrationModePause &&
    concentrationBoutonDemarrer &&
    concentrationBoutonPause &&
    concentrationBoutonReset &&
    concentrationFormulaire &&
    concentrationInputTravail &&
    concentrationInputPause &&
    concentrationInputSessions &&
    concentrationMessage
) {
    // Les durées sont stockées en secondes.
    let concentrationTravailSecondes = 25 * 60;
    let concentrationPauseSecondes = 5 * 60;

    // Paramètres du programme de concentration.
    let concentrationNombreSessions = 4;
    let concentrationSessionsTerminees = 0;
    let concentrationSessionActuelle = 1;

    let concentrationMode = "travail";
    let concentrationTempsRestant = concentrationTravailSecondes;

    let concentrationEnCours = false;
    let concentrationIntervalle = null;
    let concentrationFinPrevue = 0;
    let concentrationPlanTermine = false;
	
    /* ===== Sons de notification ===== */

    // Produit un bip discret grâce au navigateur.
    function concentrationJouerNotification() {
        try {
            // On crée le système audio du navigateur.
            const AudioContexte =
                window.AudioContext || window.webkitAudioContext;

            // Si le navigateur ne prend pas en charge cette fonction,
            // on arrête simplement sans bloquer le minuteur.
            if (!AudioContexte) {
                return;
            }

            const audio = new AudioContexte();

            // Le son est produit par un oscillateur.
            const oscillateur = audio.createOscillator();

            // Ce composant contrôle le volume.
            const volume = audio.createGain();

            // Son doux, plutôt aigu.
            oscillateur.type = "sine";
            oscillateur.frequency.setValueAtTime(
                660,
                audio.currentTime
            );

            // Volume faible pour une notification discrète.
            volume.gain.setValueAtTime(0.0001, audio.currentTime);
            volume.gain.exponentialRampToValueAtTime(
                1.00,
                audio.currentTime + 0.03
            );
            volume.gain.exponentialRampToValueAtTime(
                0.0001,
                audio.currentTime + 0.55
            );

            // On relie les composants pour produire le son.
            oscillateur.connect(volume);
            volume.connect(audio.destination);

            // Le bip dure un quart de seconde.
            oscillateur.start(audio.currentTime);
            oscillateur.stop(audio.currentTime + 0.26);

            // On libère les ressources audio après utilisation.
            oscillateur.addEventListener("ended", function () {
                audio.close();
            });

        } catch (erreur) {
            // Une erreur audio ne doit pas arrêter le minuteur.
            console.warn("La notification sonore est indisponible.");
        }
    }


    // Convertit les secondes en minutes et secondes.
    function concentrationFormaterTemps(secondes) {
        const minutes = Math.floor(secondes / 60);
        const resteSecondes = secondes % 60;

        return String(minutes).padStart(2, "0")
            + ":" + String(resteSecondes).padStart(2, "0");
    }

    // Retourne la durée du mode actuel.
    function concentrationDureeMode() {
        return concentrationMode === "travail"
            ? concentrationTravailSecondes
            : concentrationPauseSecondes;
    }

    // Actualise l'affichage et les boutons.
    function concentrationActualiserAffichage() {
        concentrationMinuteur.textContent =
            concentrationFormaterTemps(concentrationTempsRestant);

        concentrationProgression.textContent =
            concentrationPlanTermine
                ? "Programme terminé : "
                    + concentrationSessionsTerminees
                    + " session(s) sur "
                    + concentrationNombreSessions
                : "Session " + concentrationSessionActuelle
                    + " sur " + concentrationNombreSessions;

        concentrationModeTravail.classList.toggle(
            "mode-actif",
            concentrationMode === "travail"
        );

        concentrationModePause.classList.toggle(
            "mode-actif",
            concentrationMode === "pause"
        );

        concentrationModeTravail.setAttribute(
            "aria-pressed",
            String(concentrationMode === "travail")
        );

        concentrationModePause.setAttribute(
            "aria-pressed",
            String(concentrationMode === "pause")
        );

        concentrationBoutonDemarrer.textContent =
            concentrationEnCours ? "En cours..." : "Démarrer";

        concentrationBoutonDemarrer.disabled = concentrationEnCours;
        concentrationBoutonPause.disabled = !concentrationEnCours;
    }

    // Arrête l'intervalle qui actualise le compte à rebours.
    function concentrationArreterIntervalle() {
        if (concentrationIntervalle !== null) {
            clearInterval(concentrationIntervalle);
            concentrationIntervalle = null;
        }
    }

    // Réinitialise le programme complet.
    function concentrationReinitialiserProgramme() {
        concentrationArreterIntervalle();

        concentrationEnCours = false;
        concentrationPlanTermine = false;
        concentrationSessionsTerminees = 0;
        concentrationSessionActuelle = 1;
        concentrationMode = "travail";
        concentrationTempsRestant = concentrationTravailSecondes;

        concentrationEtat.textContent =
            "Programme réinitialisé. Prêt à te concentrer ?";

        concentrationActualiserAffichage();
    }

    // Permet de choisir manuellement le travail ou la pause.
    function concentrationChoisirMode(mode) {
        concentrationArreterIntervalle();

        concentrationEnCours = false;
        concentrationPlanTermine = false;
        concentrationSessionsTerminees = 0;
        concentrationSessionActuelle = 1;
        concentrationMode = mode;
        concentrationTempsRestant = concentrationDureeMode();

        concentrationEtat.textContent = mode === "travail"
            ? "Mode travail sélectionné."
            : "Mode pause sélectionné.";

        concentrationActualiserAffichage();
    }

    // Termine le programme lorsque toutes les sessions sont faites.
    function concentrationTerminerProgramme() {
        concentrationArreterIntervalle();

        concentrationEnCours = false;
        concentrationPlanTermine = true;
        concentrationTempsRestant = 0;

        concentrationEtat.textContent =
            "🎉 Bravo ! Tu as terminé toutes tes sessions de travail !";

        concentrationActualiserAffichage();
    }

    // Passe automatiquement à la prochaine période.
    function concentrationPasserPeriodeSuivante() {
		 // Signale la fin du travail ou de la pause.
        concentrationJouerNotification();
        
		concentrationArreterIntervalle();
        concentrationEnCours = false;
        concentrationTempsRestant = 0;

        if (concentrationMode === "travail") {
            // Une session de travail vient de se terminer.
            concentrationSessionsTerminees++;

            // Si c'était la dernière session, on s'arrête.
            if (
                concentrationSessionsTerminees >=
                concentrationNombreSessions
            ) {
                concentrationTerminerProgramme();
                return;
            }

            // Sinon, on lance automatiquement la pause.
            concentrationMode = "pause";
            concentrationTempsRestant = concentrationPauseSecondes;

            concentrationEtat.textContent =
                "Session terminée ! La pause commence automatiquement.";
        } else {
            // La pause est terminée : on reprend le travail.
            concentrationSessionActuelle =
                concentrationSessionsTerminees + 1;

            concentrationMode = "travail";
            concentrationTempsRestant = concentrationTravailSecondes;

            concentrationEtat.textContent =
                "Pause terminée ! La session suivante commence.";
        }

        concentrationActualiserAffichage();

        // Le compte à rebours de la période suivante démarre.
        concentrationDemarrer();
    }

    // Actualise le temps à partir de l'heure réelle.
    function concentrationActualiserTemps() {
        const millisecondesRestantes =
            concentrationFinPrevue - Date.now();

        concentrationTempsRestant = Math.max(
            0,
            Math.ceil(millisecondesRestantes / 1000)
        );

        concentrationActualiserAffichage();

        if (concentrationTempsRestant <= 0) {
            concentrationPasserPeriodeSuivante();
        }
    }

    // Démarre le minuteur ou reprend une période en pause.
    function concentrationDemarrer() {
        if (concentrationEnCours) {
            return;
        }

        // Après un programme terminé, un nouveau clic recommence.
        if (concentrationPlanTermine) {
            concentrationSessionsTerminees = 0;
            concentrationSessionActuelle = 1;
            concentrationPlanTermine = false;
            concentrationMode = "travail";
            concentrationTempsRestant = concentrationTravailSecondes;
        }

        if (concentrationTempsRestant <= 0) {
            concentrationTempsRestant = concentrationDureeMode();
        }

        concentrationEnCours = true;

        concentrationEtat.textContent =
            concentrationMode === "travail"
                ? "Concentration en cours..."
                : "Pause en cours...";

        concentrationFinPrevue =
            Date.now() + concentrationTempsRestant * 1000;

        concentrationArreterIntervalle();
        concentrationActualiserAffichage();

        concentrationIntervalle = setInterval(
            concentrationActualiserTemps,
            250
        );
    }

    // Met en pause sans perdre le temps restant.
    function concentrationMettreEnPause() {
        if (!concentrationEnCours) {
            return;
        }

        const modeAvant = concentrationMode;

        concentrationActualiserTemps();

        // Si une période vient de se terminer, on ne bloque
        // pas le minuteur qui vient de démarrer automatiquement.
        if (
            !concentrationEnCours ||
            concentrationMode !== modeAvant
        ) {
            return;
        }

        concentrationArreterIntervalle();
        concentrationEnCours = false;

        concentrationEtat.textContent = "Minuteur en pause.";

        concentrationActualiserAffichage();
    }

    // Les boutons de contrôle.
    concentrationBoutonDemarrer.addEventListener(
        "click",
        concentrationDemarrer
    );

    concentrationBoutonPause.addEventListener(
        "click",
        concentrationMettreEnPause
    );

    concentrationBoutonReset.addEventListener(
        "click",
        concentrationReinitialiserProgramme
    );

    concentrationModeTravail.addEventListener("click", function () {
        concentrationChoisirMode("travail");
    });

    concentrationModePause.addEventListener("click", function () {
        concentrationChoisirMode("pause");
    });

    // Applique les durées et le nombre de sessions choisis.
    concentrationFormulaire.addEventListener("submit", function (event) {
        event.preventDefault();

        const minutesTravail = Number(
            concentrationInputTravail.value
        );

        const minutesPause = Number(
            concentrationInputPause.value
        );

        const nombreSessions = Number(
            concentrationInputSessions.value
        );

        // Vérification des valeurs saisies.
        if (
            !Number.isInteger(minutesTravail) ||
            minutesTravail < 1 ||
            minutesTravail > 180
        ) {
            concentrationMessage.textContent =
                "Le travail doit durer entre 1 et 180 minutes.";
            return;
        }

        if (
            !Number.isInteger(minutesPause) ||
            minutesPause < 1 ||
            minutesPause > 60
        ) {
            concentrationMessage.textContent =
                "La pause doit durer entre 1 et 60 minutes.";
            return;
        }

        if (
            !Number.isInteger(nombreSessions) ||
            nombreSessions < 1 ||
            nombreSessions > 20
        ) {
            concentrationMessage.textContent =
                "Choisis entre 1 et 20 sessions de travail.";
            return;
        }

        // On enregistre les nouveaux paramètres.
        concentrationTravailSecondes = minutesTravail * 60;
        concentrationPauseSecondes = minutesPause * 60;
        concentrationNombreSessions = nombreSessions;

        // On repart de zéro avec les nouveaux réglages.
        concentrationArreterIntervalle();
        concentrationEnCours = false;
        concentrationPlanTermine = false;
        concentrationSessionsTerminees = 0;
        concentrationSessionActuelle = 1;
        concentrationMode = "travail";
        concentrationTempsRestant = concentrationTravailSecondes;

        concentrationMessage.textContent =
            "Réglages appliqués : "
            + nombreSessions + " session(s), "
            + minutesTravail + " min de travail et "
            + minutesPause + " min de pause.";

        concentrationEtat.textContent =
            "Tout est prêt ! Tu peux démarrer ton programme.";

        concentrationActualiserAffichage();
    });

    // Affichage initial.
    concentrationInputSessions.value = "4";
    concentrationActualiserAffichage();
}