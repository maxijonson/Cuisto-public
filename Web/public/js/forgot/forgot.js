$(document).ready(function () {
    $("#formNewPassword").validate({

        onkeyup: false,
        onclick: false,
        onfocusout: false,

        rules: {
            password: {
                required: true,
                minlength: 5
            },
            confirm: {
                required: true,
                minlength: 5,
                equalTo: "#password"
            }
        },
        messages: {
            password: {
                required: "*Champ Requis*",
                minlength: "*Veuillez entrer au moins 5 caractères!*"
            },
            confirm: {
                required: "*Champ Requis*",
                minlength: "*Veuillez entrer au moins 5 caractères!*",
                equalTo: "*Les deux mots de passe sont différents!*"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }

    });

    $("#formNewPassword").submit(function(e) {
        e.preventDefault();
        console.log('submited');
        if(!$(this).valid()) return;
        var token = getUrlParameter('token');
        if(!token) return bootstrap_alert.danger(`Impossible d'obtenir votre jeton d'authentification. Essayez de recharger la page.`);
        var data = {
            password: $("#password").val(),
            token
        };
        
        $.post('/api/passwordReset', data, function(res) {
            bootstrap_alert.success('Changement effectué avec succès! Redirection vers la page de connexion sous peu...');
            setTimeout(function() {
                window.location.href = "/login";
            }, 4000);
            $("#formNewPassword").unbind();
            $("#formNewPassword").submit(function(e) {e.preventDefault()});
        }).fail(function(err) {
            bootstrap_alert.danger(err.responseJSON.message);
        })
    });

});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};