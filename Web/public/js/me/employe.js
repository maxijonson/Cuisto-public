$(document).ready(function () {

    $("#telephone").inputmask("(999) 999-9999");
    jQuery.validator.addMethod("maskPhoneComplet", function (value, element) {
        return ($("#telephone").inputmask("isComplete"));
    }, "*Veuillez remplir le champ au complet!*");
    jQuery.validator.addMethod('email', function isEmail(email, e) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
      }, "Veuillez entrer un courriel valide!");
      
    $("#formEdit").validate({

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
            telephone: {
                required: true,
                maskPhoneComplet: true
            },
            courriel: {
                required: true,
                maxlength: 128,
                email: true
            },
            username: {
                required: true,
                maxlength: 45,
                minlength: 5
            },
            new_password: {
                required: false,
                minlength: 5
            },
            new_password_confirm: {
                required: false,
                equalTo: "#new_password"
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
            telephone: {
                required: "*Champ Requis*",
                maskPhoneComplet: "*Veuillez remplir le champ au complet!*"
            },
            courriel: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 128 caractères!*",
                email: "*Veuillez entrer un courriel valide!*"
            },
            username: {
                required: "*Champ Requis*",
                maxlength: "*La longueur maximale est de 45 caractères!*",
                minlength: "*La longueur minimale est de 5 caractères!*"
            },
            new_password: {
                minlength: "*La longueur minimale est de 5 caractères!*"
            },
            new_password_confirm: {
                equalTo: "*Les deux mots de passe sont différents!*"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    });

    $("#formEdit").submit(function (e) {
        e.preventDefault();
        if(!$(this).valid()) return;
        var data = objectifyForm($(this).serializeArray());
        if (!data.password)
            return bootstrap_alert.danger("Veuillez entrer le mot de passe courant du compte")

        if (data.new_password)
            if (!data.new_password_confirm)
                return bootstrap_alert.danger("Veuillez confirmer le nouveau mot de passe")
            else if (data.new_password_confirm != data.new_password)
                return bootstrap_alert.danger("Les deux nouveaux mots de passe ne sont pas pareil")
        $.ajax({
            url: '/api/employe',
            method: 'PATCH',
            data,
            success: function (res) {
                bootstrap_alert.success("Modification(s) appliquées!");
                $.get('/api/employe', function (res) {
                    $("#EmpName").html([res.prenom, res.nom].join(' ').toLowerCase()
                    .split(' ')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' '));
                });
            },
            error: function (err) {
                if (err.responseJSON.message)
                    bootstrap_alert.danger(err.responseJSON.message);
            }
        });
    });

    $("#DeleteEmp").click(function () {
        var data = objectifyForm($("#formEdit").serializeArray());
        if (!data.password)
            return bootstrap_alert.danger("Veuillez entrer le mot de passe courant du compte")

        $.ajax({
            url: '/api/employe',
            method: 'DELETE',
            data: {
                password: data.password
            },
            success: function (res) {
                window.location.href = "/login";
            },
            error: function (err) {
                if (err.responseJSON.message)
                    bootstrap_alert.danger(err.responseJSON.message);
            }
        });
    });

});