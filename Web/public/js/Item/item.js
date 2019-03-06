$(document).ready(function () {
    $('#menusModal').select2({
        placeholder: 'Choisissez...',
    });

    ChargerOptions();

    $('#btnRechercherMenu').on('click', function(){
        lancerRecherche();
        $('#btnModifierItem, #btnSupprimerItem').attr('disabled', true);
    })

    $('#rechercheMenu').keypress(function(event){
        if(event.which === 13)
        {
            lancerRecherche();
        }
    })



    /* Ouverture du dialog d'Ajout de l'item*/
    $('#btnAjouterItem').on('click', function () {
        // A determiner
        ChangerDialogMenu('Ajouter', 'Ajouter un item');
        $('#itemModal').modal('show');
    });

    /* Ouverture du dialog de modification de l'item */
    $('#btnModifierItem').on('click', function () {
        var selected = getSelected();
        if (selected) {
            ChangerDialogMenu('Modifier', 'Modifier un item');
            $('#itemModal').modal('show');
        }
    });

    /* Ouverture du dialog de confirmation de suppression*/
    $('#btnSupprimerItem').on('click', function () {
        $('#modalConfirmer').modal('show');
    });

    /* Confirmation de la suppression */
    $('#confirmerDelete').on('click', function () {
        var selected = getSelected();
        if (selected) {
            $.ajax({
                url: `/api/item/${selected.attr('id')}`,
                type: 'DELETE',
                success: function (result) {
                        loadPanel('/item/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop();
                        bootstrap_alert.success("L'item a été supprimée!");
                },
                error: function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                }
            });
        }
    })

    /* Effacement du contenu du dialog en cas de retour */
    $('#btnRetour').on('click', function () {
        $('#formItem').validate().resetForm();
    });

    /* Validation du form */
    $('#formItem').validate({

        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            nom: {
                required: true,
                maxlength: 45,
            },
            prix: {
                required: true,
                number: true,
                range: [0, 999.99],
            },
            description: {
                maxlength: 128,
            },
            type: {
                required: true,
                maxlength: 45,
            }
        },
        messages: {
            nom: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères !*",
            },
            prix: {
                required: "*Champ Requis*",
                number: "Le champ doit etre un nombre",
                range: "*Le prix maximal est de 999.99$ !*",
            },
            description: {
                maxlength: "*La longueur maximale est de 128 caractères !*",
            },
            type: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères !*",
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    });

    /* Submit du form de Creation/Modification item */
    $('#formItem').submit(function (event) {
        var selected = getSelected();
        if ($(this).valid()) {
            var item = {
                nom: $('#nomModal').val(),
                prix: $('#prixModal').val(),
                description: $('#descriptionModal').val(),
                typeItem: $('#typeModal').val(),
            }
            if ($('#confirmer').attr('value') === "Ajouter") {
                $.post("/api/item", item, function () {
                        loadPanel('/item/liste', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        HideBackdrop('#itemModal');
                        bootstrap_alert.success("L'item a été ajouté!");
                });
            }
            else if ($('#confirmer').attr('value') === "Modifier") {
                $.ajax(`/api/item/${selected.attr('id')}`, {
                    method: 'PATCH',
                    data: item,
                    success: function () {
                            loadPanel('/item/liste', {
                                animate: false,
                                force: true,
                                addToHistory: false
                            });
                            HideBackdrop('#itemModal');
                            bootstrap_alert.success("L'item a été modifié!");
                    }
                });
            }

        }
        event.preventDefault();
    })

    // Fonctions pour la Page
    function ChangerDialogMenu(valeurBouton, valeurTitre) {
        var selected = getSelected();
        $('#confirmer').text(valeurBouton);
        $('#confirmer').val(valeurBouton);
        $('#titreDialog').text(valeurTitre);

        if (valeurBouton === 'Ajouter') {
            $('#formItem')[0].reset();
        }
        else if (valeurBouton === 'Modifier') {

            $.get(`/api/item/${selected.attr('id')}`, function (data) {
                var Item = data;

                $('#nomModal').val(Item.nom);
                $('#prixModal').val(Item.prix);
                $('#descriptionModal').val(Item.description);
                $('#typeModal').val(Item.typeItem);



            });
        }
    };

    function ChargerOptions() {
        $.get(`/api/menu/liste`, function (data) {
            var menus = data.menus;

            for (i = 0; i < menus.length; i++) {
                var dataOptions = {
                    id: Number(menus[i].id),
                    text: menus[i].nom
                }
                var newOption = new Option(dataOptions.text, dataOptions.id, false, false);
                $('#menusModal').append(newOption).trigger('change');
            }
        })
    }

    function lancerRecherche() {
        $.get(`/api/item/liste?q=${$('#rechercheMenu').val()}`, function(data) {
            var items = data.items;
            
            $('tbody > tr > td').remove();
            $('tbody > tr').remove();

            for(i = 0; i < items.length;i++)
            {
                $('tbody').append(`
                    <tr id="${items[i].id}" class="selectable">
                        <td>${items[i].nom}</td>
                        <td>${items[i].prix}</td>
                        <td>${items[i].typeItem}</td>
                        <td>${items[i].description}</td>
                    </tr>
                `)
            }
        })
    }
})