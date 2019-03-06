$(document).ready(function () {

    $('#fournisseursModal').select2({
        placeholder: "Choisissez...",
        closeOnSelect: false,
    });

    ChangerOptions();

    $('#btnRechercherInventaire').on('click', function() {
        LancerRecherche();
        $('#btnModifierArticle, #btnDeleteArticle').attr('disabled',true);
    })

    $('#rechercheInventaire').keypress(function(event){
        if(event.which === 13) {
            LancerRecherche();
            $('#btnModifierArticle, #btnDeleteArticle').attr('disabled',true);
        }
    })

    /* Suppression d'un article */
    $("#btnDeleteArticle").click(function () {
        $('#modalConfirmer').modal('show');
    });

    /* Confirmation de la suppression */
    $('#confirmerDelete').on('click', function () {
        var selected = getSelected();
        if (selected) {
            $.ajax({
                url: `/api/article/${selected.attr('id')}`,
                type: 'DELETE',
                success: function (result) {
                        loadPanel('/inventaire/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop();
                        bootstrap_alert.success("L'article a été supprimée!");
                },
                error: function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                }
            });
        }
    })

    /* Affiche le dialog d'ajout */
    $("#btnAjouterArticle").on('click', function () {
        ChangerDialogArticle('Ajouter', 'Ajouter un Article');
        $("#articleModal").modal("show");
    })

    /* Affiche le dialog de Modification d'un article*/
    $("#btnModifierArticle").on('click', function () {
        var selected = getSelected();
        if (selected) {
            ChangerDialogArticle('Modifier', 'Modifier un Article');
            $("#articleModal").modal('show');
        }
    })

    /* Validation Form Create/Modifier */
    $("#formcree").validate({

        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            nom: {
                required: true,
                maxlength: 45
            },
            quantite: {
                required: true,
                number: true,
                min: 0,
                max: 100000,
            },
            unite: {
                required: true,
                maxlength: 45,
            },
            typeArticle: {
                required: true,
                maxlength: 45,
            }
        },
        messages: {
            nom: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères !*",
            },
            quantite: {
                required: "*Champ Requis*",
                min: "*Vous ne pouvez pas avoir une quantité inférieur à 0*",
                max: "*Vous avez mis une quantité trop élevé*",
            },
            unite: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères !*",
            },
            typeArticle: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères !*",
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    })

    /* Submit du form de creation/modification d'un article */
    $("#formcree").submit(function (event) {
        if ($(this).valid()) {
            var article = {
                nom: $("#nomModal").val(),
                quantite: $("#quantiteModal").val(),
                unite: $("#uniteModal").val(),
                typeArticle: $("#typeModal").val(),
                Fournisseurs: GetSelectedFournisseurs(),
            }
            if ($("#confirmer").attr('value') === "Ajouter") {
                $.post("/api/article", article, function () {
                        loadPanel('/inventaire/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop('#articleModal');
                        bootstrap_alert.success("L'article a été ajouté!");
                }).fail(function (err) {
                    console.log(err);
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                });
            }
            else if ($("#confirmer").attr('value') === "Modifier") {
                var selected = getSelected();
                //On supprime de la liste de tous les fournisseurs cet article
                $.ajax(`/api/article/${selected.attr('id')}/fournisseur/clear`, {
                    method: 'DELETE',
                    success: function () {
                        $.ajax(`/api/article/${selected.attr('id')}`, {
                            method: 'PATCH',
                            data: article,
                            success: function () {
                                    loadPanel('/inventaire/liste', {
                                        animate: false,
                                        force: true,
                                        addToHistory: false
                                    });
                                    HideBackdrop('#articleModal');
                                    bootstrap_alert.success("L'article a été modifié!");
                            }
                        });
                    }
                });
            }
        }
        event.preventDefault();
    });

    /* Bouton de retour a l'inventaire */
    $("#BtnRetourInventaire").click(function () {
        loadPanel('/inventaire/liste');
    });

    $('#btnRetour').on('click', function () {
        $('#formcree').validate().resetForm();
    })

    /* Fonction qui modifie le dialog en fonction d'un ajout ou une modification */
    function ChangerDialogArticle(valeurBouton, valeurTitre) {

        //On s'assure qu'il n'y aille pas d'options selectionner
        $('#fournisseursModal').val('').trigger('change');

        $('#confirmer').text(valeurBouton);
        $('#confirmer').val(valeurBouton);
        $('#titreDialog').text(valeurTitre);

        if (valeurBouton === 'Ajouter') {
            $('#formcree')[0].reset();
            //$('#fournisseursModal').attr('placeholder','Choisissez...');
        }
        else if (valeurBouton === 'Modifier') {
            var selected = getSelected();
            $.get(`/api/article/${selected.attr('id')}`, function (data) {
                var Article = data;

                //Insere les informations dans le dialog
                $('#nomModal').val(Article.nom);
                $('#quantiteModal').val(Number(Article.quantite));
                $('#uniteModal').val(Article.unite);
                $('#typeModal').val(Article.typeArticle);

                var Fournisseurs = []

                //Selectionne tous les fournisseurs dans le Select
                for (i = 0; i < Article.Fournisseurs.length; i++) {
                    Fournisseurs.push(Article.Fournisseurs[i].id);
                }

                $('#fournisseursModal').val(Fournisseurs);
                $('#fournisseursModal').trigger('change');
            })
        }
    }

    function GetSelectedFournisseurs() {
        var selected = [];

        var optionSelectionner = $('#fournisseursModal').select2('data');
        for (var i = 0; i < optionSelectionner.length; i++) {
            if (optionSelectionner[i].selected === true)
                selected.push({
                    Fournisseur_id: Number(optionSelectionner[i].id),
                    prix: 0
                });
        }
        return selected;
    }

    // Ajoute tous les fournisseurs dans le select
    function ChangerOptions() {
        $.get(`/api/fournisseur/liste`, function (data) {
            var fournisseurs = data.fournisseurs;

            for (i = 0; i < fournisseurs.length; i++) {
                var dataOption = {
                    id: Number(fournisseurs[i].id),
                    text: fournisseurs[i].nom
                }
                var newOption = new Option(dataOption.text, dataOption.id, false, false);
                $('#fournisseursModal').append(newOption).trigger('change');
            }
        })
    }

    // Fonction qui recherche 
    function LancerRecherche() {
        var recherche = $('#rechercheInventaire').val();
        $.get(`/api/article/liste?q=${recherche}`, function(data) {
            $('tbody > tr > td').remove();
            $('tbody > tr').remove();

            var inventaire = data.articles;
            
            for(i = 0; i < inventaire.length;i++) {
                $('tbody').append(`
                    <tr id="${inventaire[i].id}" class="selectable">
                        <td id="nom">${inventaire[i].nom}</td>
                        <td id="quantite"><b>${inventaire[i].quantite}</b> <i>${inventaire[i].unite}</i> </td>
                        <td id="type">${inventaire[i].typeArticle}</td>
                        <td id="fournisseurs" value="${inventaire[i].Fournisseurs.id}" hidden></td>
                    </tr>
                `);
            }
            $('#btnModifierArticle #btnDeleteArticle').attr('disabled', true); 
        })
    }
});