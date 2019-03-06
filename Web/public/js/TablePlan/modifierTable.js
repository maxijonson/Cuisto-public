$(document).ready(function() {

    /* Ajouter une Table */
    $('#btnAjouterTable').on('click', function() {
        ChangerDialogTable('Ajouter','Ajouter une Table');
        $("#tableModal").modal('show');
    })

    /* Modifier une Table */
    $('#btnModifierTable').on('click', function() {
        ChangerDialogTable('Modifier','Modifier une Table');
        $('#tableModal').modal('show');
    })
    
    /* Submit du formTable */
    $('#formTable').submit(function (e) {
        e.preventDefault();
        if ($(this).valid()) {
            var table = {
                maxPlace: $('#placeModal').val(),
                Salle_id: Number($('#salleCourante').attr('salleid')),
                nom: $('#nomModal').val()
            }
            if ($('#confirmer').attr('value') === "Ajouter") {
                $.post(`/api/salle/${table.Salle_id}/table`, table, function () {
                        loadPanel(`/plantable/${table.Salle_id}/tables`, {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop('#tableModal');
                        bootstrap_alert.success("La table a été ajoutée!")
                }).fail(function (err) {
                    console.log(err);
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                });
            }
            else if ($('#confirmer').attr('value') === 'Modifier') {
                var selected = getSelected();
                $.ajax(`/api/table/${selected.attr('id')}`, {
                    method: 'PATCH',
                    data: table,
                    success: function () {
                            loadPanel(`/plantable/${table.Salle_id}/tables`, {
                                animate: false,
                                force: true,
                                addToHistory: false
                            });
                            HideBackdrop('#tableModal');
                            bootstrap_alert.success("La table a été modifiée!")
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

    /* Validation du form */
    $('#formTable').validate({
        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules : {
            nom: {
                required: true,
                maxlength: 45
            },
            maxPlace: {
                required: true,
                number: true,
                min: 0,
                max: 50,
            }
        },
        messages: {
            nom: {
                required: "*Champ requis*",
                maxlength: "*La longeur maximale est de 45 caractères !*",
            },
            maxPlace: {
                required: "*Champ requis*",
                number: "*Veuillez enter un nombre valide !*",
                min: "*Le nombre de place ne peut etre inférieur à 0 !*",
                max: "*Le nombre de place ne peut etre supérieur à 40 !*",
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    })
    
    /* Supression d'une table */
    $('#btnDeleteTable').on('click', function() {
        $("#modalConfirmer").modal('show');
    })

    /* Confirmer la suppression */
    $('#confirmerDelete').on("click", function () {
        var selected = getSelected();
        if (selected) {
            $.ajax({
                url: `/api/table/${selected.attr('id')}`,
                type: 'DELETE',
                success: function (result) {
                        loadPanel(`/plantable/${$('#salleCourante').attr('salleid')}/tables`, {
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

    /* Effacement du form lorsqu'on fait Annuler */
    $('#retour').on('click', function () {
        $("#formTable").validate().resetForm();
    })

    $("#btnRetourSalle").on("click", function() {
        loadPanel('/plantable/liste');
    });

    function ChangerDialogTable(valeurBouton, valeurTitre) {
        $('#confirmer').text(valeurBouton);
        $('#confirmer').val(valeurBouton);
        $('#titreDialog').text(valeurTitre);

        if (valeurBouton === 'Ajouter') {
            $('#formTable')[0].reset();
        }
        else if (valeurBouton === 'Modifier') {
            var selected = getSelected();
            var Table = {
                id: selected.attr('id'),
                nom: selected.find('#name').text(),
                maxPlace: selected.find('#maxPlace').attr('value')
            }


            // Afficher les valeurs de la table selectionner dans le form
            $('#nomModal').val(Table.nom);
            $('#placeModal').val(Number(Table.maxPlace));
        }
    }

});