$(document).ready(function () {
    var nomSalleSelectionner = "";
    
    /* Fonctionnement d'Ajout d'une Salle */
    $("#btnAjouterSalle").on("click", function () {
        ChangerDialog('Ajouter', 'Ajouter une Salle');
        $("#salleModal").modal("show");
    })

    /* Submit du form*/
    $("#AjouterSalle").submit(function (e) {
        var selected = getSelected();
        if ($(this).valid()) {
            var salle = {
                nom: $('#nom').val(),
            }
            if ($('#confirmer').attr('value') === "Ajouter") {
                $.post("/api/salle", salle, function () {
                        loadPanel('/plantable/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop();
                }).fail(function (err) {
                    console.log(err);
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                });
            }
            else if ($('#confirmer').attr('value') === 'Modifier') {
                $.ajax('/api/salle/' + selected.attr('id'), {
                    method: 'PATCH',
                    data: salle,
                    success: function () {
                        loadPanel('/plantable/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                            HideBackdrop();
                    },
                    error: function (err) {
                        if (err.responseJSON.message)
                            bootstrap_alert.danger(err.responseJSON.message);
                    }
                });
            }
        }
        e.preventDefault();
    })

    $('#AjouterSalle').validate({
        onkeyup: false,
        onclick: false,
        onfocusout:false,

        rules: {
            nom: {
                required: true,
                maxlength: 15,
            },
        },
        messages: {
            nom: {
                required: "*Champ Requis*",
                maxlength: "*La longeur maximale est de 15 caractères !*",
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    }) 

    /* Effacement du form lorsqu'on fait Annuler */
    $('#annulerFormSalle').on('click', function() {
        $('#AjouterSalle').validate().resetForm();
    })

    /* Supression d'une Configuration de Salle */
    $("#btnDeleteSalle").on("click", function () {
        $("#modalConfirmer").modal('show');
    })

    /* Confirmer la suppression */
    $('#confirmerDelete').on("click", function () {
        var selected = getSelected();

        if (selected) {
            $.ajax({
                url: `/api/salle/${selected.attr('id')}`,
                type: 'DELETE',
                success: function (result) {
                    loadPanel('/plantable/liste', {
                        animate: false,
                        force: true,
                        addToHistory: false
                    });
                        HideBackdrop();
                },
                error: function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                }
            });
        }
    })

    /* Modification d'une salle */
    $("#btnModifierSalle").on("click", function () {
        nomSalleSelectionner = $('.selected #name').text();
        ChangerDialog('Modifier', 'Modifier une Salle');
        $("#salleModal").modal("show");
    })

    /* Afficher toutes les tables pour une salle*/
    $('#btnVisionnerSalle').on('click', function () {
        var selected = getSelected();
        loadPanel("/plantable/" + selected.attr('id') + "/tables");
    })

    /* Fonctions pour le Plan de Salle */
    function ChangerDialog(valeurBouton, valeurTitre) {
        $('#confirmer').text(valeurBouton);
        $('#confirmer').val(valeurBouton);
        $('#titreDialog').text(valeurTitre);

        if (valeurBouton === 'Ajouter') {
            $('#nom').val("");
        }
        else if (valeurBouton === 'Modifier') {
            $('#nom').val(nomSalleSelectionner);
        }
    }

    function HideBackdrop() {
        $('#salleModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }
});