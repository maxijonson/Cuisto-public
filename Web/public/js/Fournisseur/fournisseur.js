$(document).ready(function () {
    /* Barre de Recherche */
    $('#btnRechercherFournisseur').on('click', function () {
       LancerRecherche();
    })

    $('#rechercheFournisseur').keypress(function(event){
        if(event.which === 13) {
            LancerRecherche();
        }
    })

    /* Afficher le dialog d'ajout du fournisseur */
    $('#btnAjouterFournisseur').on('click', function () {
        ChangerDialogFournisseur('Ajouter', 'Ajouter un Fournisseur');
        $("#fournisseurModal").modal("show");
    });

    //Visionner la liste des articles pour ce fournisseurs
    $('#btnVisionnerListeArticle').on('click', function () {
        var selected = getSelected();
        loadPanel(`/fournisseurs/${selected.attr('id')}`);
    });

    $('#btnPlacerCommande').on('click', function() {
        var selected = getSelected();
        loadPanel(`/fournisseurs/commander/${selected.attr('id')}`);
    })

    /* Afficher le dialog de modification du fournisseur*/
    $("#btnModifierFournisseur").on("click", function () {
        var selected = getSelected();
        if (selected)
            ChangerDialogFournisseur('Modifier', 'Modifier un Fournisseur');
        $("#fournisseurModal").modal("show");
    });

    /* Affiche le dialog de confirmation pour la suppression*/
    $("#btnDeleteFournisseur").click(function () {
        $('#modalConfirmer').modal('show');
    });

    /* Suppression du fournisseur avec la confirmation */
    $('#confirmerDelete').on('click', function () {
        var selected = getSelected();
        if (selected) {
            $.ajax({
                url: `/api/fournisseur/${selected.attr('id')}`,
                type: 'DELETE',
                success: function (result) {
                        loadPanel('/fournisseurs/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop();
                        bootstrap_alert.success("Le fournisseur a été supprimée!");
                },
                error: function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                }
            });
        }
    })

    /*Validations Creation/Modification Fournisseur*/
    $("#telephoneModal").inputmask("(999) 999-9999");

    jQuery.validator.addMethod("maskPhoneComplet", function (value, element) {
        return ($("#telephoneModal").inputmask("isComplete"));
    }, "*Veuillez remplir le champ au complet!*");

    $("#formcree").validate({
        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            nom: {
                required: true,
                maxlength: 80
            },
            adresse: {
                required: true,
                maxlength: 60
            },
            telephone: {
                required: true,
                maskPhoneComplet: true
            },
            personneRessource: {
                required: true,
                maxlength: 45
            },
            courriel: {
                required: true,
                maxlength: 128,
                email: true
            }
        },
        messages: {
            nom: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 80 caractères!*"
            },
            adresse: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 60 caractères!*"
            },
            telephone: {
                required: "*Champ Requis*",
                maskPhoneComplet: "*Veuillez remplir le champ au complet!*"
            },
            personneRessource: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères!*"
            },
            courriel: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 128 caractères!*",
                email: "*Veuillez entrer un courriel valide!*"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
            console.log("bbb");
        }
    })

    /* Submit du form pour Ajout/Modifier un fournisseur */
    $("#formcree").submit(function (event) {
        if ($(this).valid()) {
            var fournisseur = {
                nom: $("#nomModal").val(),
                adresse: $("#adresseModal").val(),
                telephone: $("#telephoneModal").val(),
                personneRessource: $("#personneRessourceModal").val(),
                courriel: $("#courrielModal").val()
            }

            if ($("#confirmer").attr('value') === "Ajouter") {
                $.post("/api/fournisseur", fournisseur, function () {
                        loadPanel('/fournisseurs/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop('fournisseurModal');
                        bootstrap_alert.success('Le fournisseur a été ajouté!')
                }).fail(function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                });
            }
            else if ($("#confirmer").attr('value') === "Modifier") {
                var selected = getSelected();
                $.ajax(`/api/fournisseur/${selected.attr('id')}`, {
                    method: 'PATCH',
                    data: fournisseur,
                    success: function () {
                            loadPanel('/fournisseurs/liste', {
                                animate: false,
                                force: true,
                                addToHistory: false
                            });
                            HideBackdrop('fournisseurModal');
                            bootstrap_alert.success('Le fournisseur a été modifié!')
                    },
                    error: function (err) {
                        if (err.responseJSON.message)
                            bootstrap_alert.danger(err.responseJSON.message);
                    }
                });
            }
            event.preventDefault();
        }
    });

    /* Fonction qui modifie le dialog en fonction d'un ajout ou une modification */
    function ChangerDialogFournisseur(valeurBouton, valeurTitre) {
        $('#confirmer').text(valeurBouton);
        $('#confirmer').val(valeurBouton);
        $('#titreDialog').text(valeurTitre);

        if (valeurBouton === 'Ajouter') {
            $('#formcree')[0].reset();
        }
        else if (valeurBouton === 'Modifier') {
            var selected = getSelected();
            var Fournisseur = {
                id: selected.attr('id'),
                nom: selected.find('#nom').text(),
                adresse: selected.find('#adresse').text(),
                telephone: selected.find('#telephone').text(),
                personneRessource: selected.find('#personneRessource').text(),
                courriel: selected.find('#courriel').text()
            }

            $('#nomModal').val(Fournisseur.nom);
            $('#adresseModal').val(Fournisseur.adresse);
            $('#telephoneModal').val(Fournisseur.telephone);
            $('#personneRessourceModal').val(Fournisseur.personneRessource);
            $('#courrielModal').val(Fournisseur.courriel);
        }
    }

    function LancerRecherche() {
        $.get(`/api/fournisseur/liste?nom=${$('#rechercheFournisseur').val()}`, function (data) {
            $('tbody > tr > td').remove();
            $('tbody > tr').remove();

            var fournisseurs = data.fournisseurs;

            for (i = 0; i < fournisseurs.length; i++) {
                $('tbody').append(`
                <tr id="${fournisseurs[i].id}" class="selectable">
                    <td id="nom">${fournisseurs[i].nom}</td>
                    <td id="adresse">${fournisseurs[i].adresse}</td>
                    <td id="telephone">${fournisseurs[i].telephone}</td>
                    <td id="personneRessource">${fournisseurs[i].personneRessource}</td>
                    <td id="courriel">${fournisseurs[i].courriel}</td>
                </tr>
                `);
            }
            $('#btnVisionnerListeArticle, #btnModifierFournisseur, #btnPlacerCommande, #btnDeleteFournisseur').attr('disabled', true);
        })
    }

    /* Bouton de retour */
    $("#BtnRetour").click(function () {
        loadPanel('/fournisseurs/liste');
    });
});