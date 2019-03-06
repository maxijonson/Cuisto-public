$(document).ready(function () {

    $("#restaurants .restoContainer").each((i, r) => {
        var restaurant = $(r);

        setTimeout(function() {
            restaurant.removeClass('hidden');
        }, 150 * i);
    });

    $("#telephone").inputmask("(999) 999-9999");

    $("#codepostal").inputmask({ "mask": "A9A 9A9" });

    jQuery.validator.addMethod("maskTelephoneComplet", function (value, element) {
        return ($("#telephone").inputmask("isComplete"));
    }, "Veuillez remplir le champ au complet !");

    jQuery.validator.addMethod("maskCodepostalComplet", function (value, element) {
        return ($("#codepostal").inputmask("isComplete"));
    }, "Veuillez remplir le champ au complet !");

    var validator = $("#formActionRestaurant").validate({

        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            nom: {
                required: true,
                maxlength: 45
            },
            telephone: {
                required: true,
                maskTelephoneComplet: true
            },
            ville: {
                required: true,
                maxlength: 45
            },
            codepostal: {
                required: true,
                maskCodepostalComplet: true
            },
            adresse: {
                required: true,
                maxlength: 255
            },
            courriel: {
                required: true,
                maxlength: 128,
                email: true
            }
        },
        messages: {
            nom: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
            telephone: {
                required: "Veuillez remplir le champ !",
                maskPhoneComplet: "Veuillez remplir le champ au complet !"
            },
            ville: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
            codepostal: {
                required: "Veuillez remplir le champ !",
                maskCodepostalComplet: "Veuillez remplir le champ au complet !"
            },
            adresse: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 255 caractères !"
            },
            courriel: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !",
                email: "Veuillez entrer un courriel valide !"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }

    });

    function GetRestaurant() {
        return new Promise(function (resolve, reject) {
            var selected = $($(".restaurant.selected")[0]);
            if (!selected) return reject(`Erreur lors de l'obtention du restaurant sélectionné`);
            var id = Number(selected.attr('restaurantid'));
            if (!id) return reject(`Impossible d'obtenir l'id du restaurant sélectionné`);
            $.get(`/api/restaurant/${id}`, function (restaurant) {
                resolve(restaurant);
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
            var restaurant = await GetRestaurant();
            $("#actions").removeClass('hidden');
            $("#manage, #edit, #delete").unbind();

            $("#manage").click(function () {
                window.location.href = `/restaurant/${restaurant.id}`;
            });

            $("#edit").click(function () {
                var modal = $("#modalAction");

                modal.find('.modal-title').html(`Modifier ${restaurant.nom}`);
                modal.find("#name").val(restaurant.nom)
                modal.find("#telephone").val(restaurant.telephone);
                modal.find("#ville").val(restaurant.ville);
                modal.find("#codepostal").val(restaurant.codepostal);
                modal.find("#adresse").val(restaurant.adresse);
                modal.find("#courriel").val(restaurant.courriel);

                modal.find('#btnActionRestaurant').html('Modifier');
                modal.find('#btnActionRestaurant').unbind();
                modal.find('#btnActionRestaurant').click(function () {
                    if (!$("#formActionRestaurant").valid()) return;
                    var resto = objectifyForm($("#formActionRestaurant").serializeArray());
                    $.ajax({
                        url: `/api/restaurant/${restaurant.id}`,
                        method: 'PATCH',
                        data: resto,
                        success: function (res) {
                            var selected = $('.restaurant.selected');
                            selected.find('.card-title').html(res.nom);
                            selected.find('.address').html(`${res.adresse}, ${res.ville}, ${res.codepostal}`);
                            selected.find('.phone').html(res.telephone);
                            selected.find('.email').html(res.courriel);
                            modal.modal('hide');
                            $(".modal-backdrop").remove();
                            bootstrap_alert.success(`${restaurant.nom} a été modifié`);
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

                modal.find('.modal-title').html(`Supprimer ${restaurant.nom}`);
                modal.find('.modal-body').html(`Êtes-vous certain de vouloir supprimer <b>${restaurant.nom}</b>? Cette action est irréversible.`);

                modal.find("#btnDeleteRestaurant").unbind();
                modal.find("#btnDeleteRestaurant").click(function () {
                    $.ajax({
                        url: `/api/restaurant/${restaurant.id}`,
                        method: 'DELETE',
                        success: function () {
                            var selected = $('.restaurant.selected').parent();
                            modal.modal('hide');
                            $(".modal-backdrop").remove();
                            selected.addClass('deleted');
                            setTimeout(function () {
                                selected.remove();
                            }, 1000);
                            $("#actions").addClass('hidden');
                            bootstrap_alert.success(`${restaurant.nom} a été supprimé`);
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

    $('#ajouterResto').click(function () {
        var modal = $("#modalAction");

        modal.find("form")[0].reset();
        modal.find('.modal-title').html('Ajouter un restaurant');
        modal.find("#btnActionRestaurant").html('Ajouter');
        modal.find("#btnActionRestaurant").unbind();
        modal.find("#btnActionRestaurant").click(function () {
            if (!$("#formActionRestaurant").valid()) return;
            var resto = objectifyForm($("#formActionRestaurant").serializeArray());
            $.ajax({
                url: `/api/restaurant`,
                method: 'POST',
                data: resto,
                success: function (res) {
                    var cardClasses = 'selected border-primary shadow-lg';
                    var headerClasses = 'progress-bar progress-bar-striped progress-bar progress-bar-animated';
                    var selected = $('.restaurant.selected');
                    selected.find('.card-header').removeClass(headerClasses);
                    selected.removeClass(cardClasses);

                    var cardHtml = `
                    <div class="col-4 restoContainer new">
                        <div class="card mb-3 mt-3 restaurant" restaurantid="${res.id}">
                            <h4 class="card-title card-header text-white text-center">${res.nom}</h4>
                                <div class="card-body">
                                    <h6 class="text-secondary">Adresse</h6>
                                    <p class="address">${res.adresse}, ${res.ville}, ${res.codepostal}</p>
                                    <h6 class="text-secondary">Téléphone</h6>
                                    <p class="phone">${res.telephone}</p>
                                    <h6 class="text-secondary">Courriel</h6>
                                    <p class="email">${res.courriel}</p>
                                </div>
                        </div>
                    </div>
                    `;
                    var card = $(cardHtml).appendTo("#restaurants").find('.restaurant');
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
            $("#formActionRestaurant").validate().resetForm();
        })

        modal.modal({
            keyboard: true
        });
    });

    $('#listePostes').click(function () {
        window.location.replace('/poste/liste');
    });

    $('body').on('click', '.restaurant', async function () {
        var card = $(this);
        var cardClasses = 'selected border-primary shadow-lg';
        var headerClasses = 'progress-bar progress-bar-striped progress-bar progress-bar-animated';

        if (card.hasClass(cardClasses)) {
            card.removeClass(cardClasses);
            card.find('.card-header').removeClass(headerClasses);
            $("#actions").addClass('hidden');
            return;
        }

        var selected = $('.restaurant.selected');
        selected.find('.card-header').removeClass(headerClasses);
        selected.removeClass(cardClasses);

        card.addClass(cardClasses);
        card.find('.card-header').addClass(headerClasses);

        BindActions();
    });
})