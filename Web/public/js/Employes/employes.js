$(document).ready(function () {
    var initiated = false;

    $("body").on('click', '#btnRechercherEmployee', function () {
        lancerRecherche();
        $('#btnModifier, #btnVoirInfo, #btnDelete').attr('disabled',true);
    })

    $("body").on('keypress', '#rechercheEmployee', function (event) {
        if(event.which === 13) {
            lancerRecherche();
            $('#btnModifier, #btnVoirInfo, #btnDelete').attr('disabled',true);
        }
    })

    function initValidation() {
        $("#phone").inputmask("(999) 999-9999");

        $("#tauxHoraire").inputmask({ "mask": "99.99" });

        jQuery.validator.addMethod("noSpace", function (value, element) {
            return value.indexOf(" ") < 0 && value != "";
        }, "No space please and don't leave it empty");

        jQuery.validator.addMethod("maskPhoneComplet", function (value, element) {
            return ($("#phone").inputmask("isComplete"));
        }, "Veuillez remplir le champ au complet !");

        jQuery.validator.addMethod("maskHourlyRateComplet", function (value, element) {
            return ($("#tauxHoraire").inputmask("isComplete"));
        }, "Veuillez remplir le champ au complet !");

        jQuery.validator.addMethod('email', function isEmail(email, e) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        }, "Veuillez entrer un courriel valide!");

        $("#formActionEmp").validate({

            onkeyup: false,
            onclick: false,
            onfocusout: false,

            rules: {
                nom: {
                    required: true,
                    maxlength: 45
                },
                prenom: {
                    required: true,
                    maxlength: 45
                },
                courriel: {
                    required: true,
                    maxlength: 45,
                    email: true
                },
                telephone: {
                    required: true,
                    maskPhoneComplet: true
                },
                tauxHoraire: {
                    required: true,
                    maskHourlyRateComplet: true
                },
                username: {
                    required: true,
                    maxlength: 45
                },
                password: {
                    required: true,
                    minlength: 5
                },
                password_confirm: {
                    required: true,
                    minlength: 5,
                    equalTo: "#password"
                }
            },
            messages: {
                nom: {
                    required: "*Champ Requis*",
                    maxlength: "*La longueur maximale est de 45 caractères!*"
                },
                prenom: {
                    required: "*Champ Requis*",
                    maxlength: "*La longueur maximale est de 45 caractères!*"
                },
                courriel: {
                    required: "*Champ Requis*",
                    maxlength: "*La longueur maximale est de 45 caractères!*",
                    email: "*Veuillez entrer un courriel valide!*"
                },
                telephone: {
                    required: "*Champ Requis*",
                    maskPhoneComplet: "*Veuillez remplir le champ au complet!*"
                },
                tauxHoraire: {
                    required: "*Champ Requis*",
                    maskTauxHoraireComplet: "*Veuillez remplir le champ au complet!*"
                },
                username: {
                    required: "*Champ Requis*",
                    maxlength: "*La longueur maximale est de 45 caractères!*"
                },
                password: {
                    required: "*Champ Requis*",
                    minlength: "*Veuillez entrer au moins 5 caractères!*"
                },
                password_confirm: {
                    required: "*Champ Requis*",
                    minlength: "*Veuillez entrer au moins 5 caractères!*",
                    equalTo: "*Les deux mots de passe sont différents!*"
                }
            },
            errorPlacement: function (error, element) {
                error.appendTo(element.next());
            }

        });
    }

    $("body").on("click", '#btnAjouter, #btnModifier', function () {
        initValidation();
        $("#formActionEmp").unbind('submit');
        $("#formActionEmp")[0].reset();
    });

    $("body").on("click", "#btnAjouter", function () {
        $("#formActionEmp").submit(function (e) {
            if ($(this).valid()) {
                var employe = objectifyForm($(this).serializeArray());
                if (employe.Poste_id == 0) delete employe.Poste_id;

                $.post("/api/employe", employe, function () {
                    bootstrap_alert.success(`${employe.prenom} ${employe.nom} a été ajouté`);

                    $("#modalActionEmp").modal('hide');
                    $(".modal-backdrop").remove();
                    loadPanel("/employes/liste", {
                        animate: false,
                        force: true,
                        addToHistory: false
                    });
                })
                    .fail(function (err) {
                        if (err.responseJSON.message)
                            bootstrap_alert.danger(err.responseJSON.message);
                    });
            }

            e.preventDefault();
        });

        var modal = $("#modalActionEmp");
        modal.find(".modal-title").html('Ajouter un employé');
        modal.find("#btnActionEmploye").html("Ajouter");
        modal.modal();
    });

    $("body").on("click", "#btnModifier", function () {
        var e = getSelected();
        if (!e) return;
        $("#formActionEmp").submit(function (ev) {
            ev.preventDefault();
            var removedRules = false;

            if (!$("#password").val()) {
                $("#password").rules("remove", "minlength required");
                $("#password_confirm").rules("remove", "minlength required");
                removedRules = true;
            }

            if ($(this).valid()) {

                var employe = objectifyForm($(this).serializeArray());
                if (employe.Poste_id == 0) delete employe.Poste_id;
                if (!employe.password) delete employe.password;
                if (!employe.admin) employe.admin = "false";
                delete employe.password_confirm;
                $.ajax({
                    url: `/api/employe/${e.attr('employeid')}`,
                    data: employe,
                    method: 'PATCH',
                    success: function () {
                        bootstrap_alert.success(`${employe.prenom} ${employe.nom} a été modifié`);

                        $("#modalActionEmp").modal('hide');
                        $(".modal-backdrop").remove();
                        loadPanel("/employes/liste", {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                    },
                    error: function (err) {
                        if (err.responseJSON.message)
                            bootstrap_alert.danger(err.responseJSON.message);
                    }
                });

            }

            if (removedRules) {
                $("#password").rules("add", {
                    required: true,
                    minlength: 5
                });
                $("#password_confirm").rules("add", {
                    required: true,
                    minlength: 5
                });
            }
        });

        $.get(`/api/employe/${e.attr('employeid')}`, function (employe) {
            if (employe.tauxHoraire.length == 4)
                employe.tauxHoraire = "0" + employe.tauxHoraire;
            var modal = $("#modalActionEmp");

            modal.find(".modal-title").html(`Modifier ${employe.prenom} ${employe.nom}`);
            modal.find("#btnActionEmploye").html("Modifier");

            modal.find("#name").val(employe.nom);
            modal.find("#prenom").val(employe.prenom);
            modal.find("#phone").val(employe.telephone);
            modal.find("#email").val(employe.courriel);
            modal.find("#tauxHoraire").val(employe.tauxHoraire);
            modal.find("#Poste_id").val(employe.Poste ? employe.Poste.id : 0);
            modal.find("#admin").prop('checked', employe.admin);
            modal.find("#username").val(employe.username);


            modal.modal();
        }).fail(function (err) {
            if (err.responseJSON.message)
                bootstrap_alert.danger(err.responseJSON.message);
        });
    });

    $("body").on("click", "#btnVoirInfo", function () {
        var e = getSelected();
        if (!e) return;
        $.get(`/api/employe/${e.attr('employeid')}`, function (employe) {
            var modal = $("#modalVoirInfo");
            modal.find(".modal-title").html(`${employe.prenom} ${employe.nom}`);

            modal.find("#info-telephone").html(`${employe.telephone}`);
            modal.find("#info-courriel").html(`${employe.courriel}`);

            modal.find("#info-poste").html(`${employe.Poste ? employe.Poste.nom : "Non assigné"}`);
            modal.find("#info-tauxhoraire").html(`${employe.tauxHoraire}`);

            modal.find("#info-username").html(`${employe.username}`);
            modal.find("#info-admin").html(`${employe.admin ? 'Oui' : 'Non'}`);

            modal.modal();
        }).fail(function (err) {
            if (err.responseJSON.message)
                bootstrap_alert.danger(err.responseJSON.message);
        });
    });

    $("body").on("click", "#btnDelete", function () {
        var e = getSelected();
        if (!e) return;
        $.get(`/api/employe/${e.attr('employeid')}`, function (employe) {
            var modal = $("#modalSupprimerEmploye");
            modal.find("#deleteConfirmationQuestion").html(`Êtes-vous certain de vouloir supprimer ${employe.prenom} ${employe.nom}?`);

            $("#btnDelEmp").unbind('click');
            $("#btnDelEmp").click(function () {
                $.ajax({
                    url: `/api/employe/${employe.id}`,
                    method: 'DELETE',
                    success: function () {
                        bootstrap_alert.success(`${employe.prenom} ${employe.nom} a été supprimé`);
                        modal.modal('hide');
                        $(".modal-backdrop").remove();
                        loadPanel("/employes/liste", {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                    },
                    error: function (err) {
                        if (err.responseJSON.message)
                            bootstrap_alert.danger(err.responseJSON.message);
                    }
                });
            });

            modal.modal();
        }).fail(function (err) {
            if (err.responseJSON.message)
                bootstrap_alert.danger(err.responseJSON.message);
        });
    });
});

function lancerRecherche() {
    $.get(`/api/employe/liste?q=${$('#rechercheEmployee').val()}`, function (data) {
        $('#tbodyEmp > tr > td').remove();
        $('#tbodyEmp > tr').remove();

        var employes = data.employes;


        for (i = 0; i < employes.length; i++) {
            var nomPoste = employes[i].Poste ? employes[i].Poste.nom : "-";
            var admin = employes[i].admin ? "&#10003;" : "";

        //console.log(whatisthis);
            $('#tbodyEmp').append(`
                <tr employeid="${employes[i].id}" class="selectable">
                    <td class="text-center">${employes[i].nom}</td>
                    <td class="text-center">${employes[i].prenom}</td>
                    <td class="text-center">${employes[i].telephone}</td>
                    <td class="text-center">${nomPoste}</td>
                    <td class="text-center">${admin}</td>
                </tr>
            `)
        }
    })
}

function clearDiv() {

    $(".errorTxt").empty();
}

