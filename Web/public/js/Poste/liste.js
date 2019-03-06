$(document).ready(function() {

    $("#postes .posteContainer").each((i, p) => {
        var poste = $(p);

        setTimeout(function() {
            poste.removeClass('hidden');
        }, 150 * i);
    });

    var validator = $("#formActionPoste").validate({

        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            nom: {
                required: true,
                maxlength: 45
            }
        },
        messages: {
            nom: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }

    });

    function GetPoste() {
        return new Promise(function (resolve, reject) {
            var selected = $($(".poste.selected")[0]);
            if (!selected) return reject(`Erreur lors de l'obtention du poste sélectionné`);
            var id = Number(selected.attr('posteid'));
            if (!id) return reject(`Impossible d'obtenir l'id du poste sélectionné`);
            $.get(`/api/poste/${id}`, function (poste) {
                resolve(poste);
            }).fail(function (err) {
                if (err.responseJSON)
                    reject(err.responseJSON.message);
                else
                    reject(err.message);
            });
        });
    }

    async function BindActions() {
        try {
            var poste = await GetPoste();
            $("#actions").removeClass('hidden');
            $("#edit, #delete").unbind();

            $("#edit").click(function () {
                var modal = $("#modalAction");

                modal.find('.modal-title').html(`Modifier ${poste.nom}`);
                modal.find("#name").val(poste.nom)

                modal.find('#btnActionPoste').html('Modifier');
                modal.find('#btnActionPoste').unbind();
                modal.find('#btnActionPoste').click(function () {
                    if (!$("#formActionPoste").valid()) return;
                    var p = objectifyForm($("#formActionPoste").serializeArray());
                    $.ajax({
                        url: `/api/poste/${poste.id}`,
                        method: 'PATCH',
                        data: p,
                        success: function (res) {
                            var selected = $('.poste.selected');
                            selected.find('.card-title').html(res.nom);
                            modal.modal('hide');
                            $(".modal-backdrop").remove();
                            bootstrap_alert.success(`${poste.nom} a été modifié`);
                        },
                        error: function (err) {
                            bootstrap_alert.danger(err.responseJSON.message);
                        }
                    });
                });

                modal.modal({
                    keyboard: true
                });
            });

            $("#delete").click(function () {
                var modal = $("#modalSupprimer");

                modal.find('.modal-title').html(`Supprimer ${poste.nom}`);
                modal.find('.modal-body').html(`Êtes-vous sûr de vouloir supprimer <b>${poste.nom}</b>? Cette action est irreversible.`);

                modal.find("#btnDeletePoste").unbind();
                modal.find("#btnDeletePoste").click(function () {
                    $.ajax({
                        url: `/api/poste/${poste.id}`,
                        method: 'DELETE',
                        success: function () {
                            var selected = $('.poste.selected').parent();
                            modal.modal('hide');
                            $(".modal-backdrop").remove();
                            selected.addClass('deleted');
                            setTimeout(function () {
                                selected.remove();
                            }, 1000);
                            $("#actions").addClass('hidden');
                            bootstrap_alert.success(`${poste.nom} a été supprimé`);
                        },
                        error: function (err) {
                            bootstrap_alert.danger(err.responseJSON.message);
                        }
                    });
                });

                modal.modal({
                    keyboard: true
                });
            });
        } catch (err) {
            bootstrap_alert.danger(err);
        }
    }

    $('#ajouterPoste').click(function () {
        var modal = $("#modalAction");

        modal.find("form")[0].reset();
        modal.find('.modal-title').html('Ajouter un poste');
        modal.find("#btnActionPoste").html('Ajouter');
        modal.find("#btnActionPoste").unbind();
        modal.find("#btnActionPoste").click(function () {
            if (!$("#formActionPoste").valid()) return;
            var p = objectifyForm($("#formActionPoste").serializeArray());
            $.ajax({
                url: `/api/poste`,
                method: 'POST',
                data: p,
                success: function (res) {
                    var cardClasses = 'selected border-primary shadow-lg';
                    var headerClasses = 'progress-bar progress-bar-striped progress-bar progress-bar-animated';
                    var selected = $('.poste.selected');
                    selected.find('.card-header').removeClass(headerClasses);
                    selected.removeClass(cardClasses);

                    var cardHtml = `
                    <div class="col-3 posteContainer new">
                        <div class="card mb-3 mt-3 poste" posteid="${res.id}">
                            <h4 class="card-title card-header text-white text-center">${res.nom}</h4>
                                <div class="card-body">
                                    <h6 class="text-secondary">Nombre d'employés</h6>
                                    <p class="nbEmployes">0</p>
                                </div>
                        </div>
                    </div>
                    `;
                    var card = $(cardHtml).appendTo("#postes").find('.poste');
                    card.addClass(cardClasses);
                    card.find('.card-header').addClass(headerClasses);
                    BindActions();

                    modal.modal('hide');
                    $(".modal-backdrop").remove();
                    bootstrap_alert.success(`${res.nom} a été ajouté`);
                },
                error: function (err) {
                    bootstrap_alert.danger(err.responseJSON.message);
                }
            });

        });

        modal.find("#btnCancel").click(function() {
            $("#formActionPoste").validate().resetForm();
        })

        modal.modal({
            keyboard: true
        });
    });

    $("#listeResto").click(function() {
        window.location.replace("/restaurant/liste");
    });

    $('body').on('click', '.poste', async function () {
        var card = $(this);
        var cardClasses = 'selected border-primary shadow-lg';
        var headerClasses = 'progress-bar progress-bar-striped progress-bar progress-bar-animated';

        if (card.hasClass(cardClasses)) {
            card.removeClass(cardClasses);
            card.find('.card-header').removeClass(headerClasses);
            $("#actions").addClass('hidden');
            return;
        }

        var selected = $('.poste.selected');
        selected.find('.card-header').removeClass(headerClasses);
        selected.removeClass(cardClasses);

        card.addClass(cardClasses);
        card.find('.card-header').addClass(headerClasses);

        BindActions();
    });
});