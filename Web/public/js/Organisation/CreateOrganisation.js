$(document).ready(function () {
    $("#formSignup").validate({
    
        onkeyup: false,
        onclick: false,
        onfocusout: false,
    
        rules: {
            nom: {
                required: true,
                maxlength: 45
            },
            username:{
                required: true,
                maxlength: 45
            },
            courriel:{
                required: true,
                maxlength: 45,
                email: true
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
        messages:{
            nom: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
            username:{
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
            courriel:{
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !",
                email: "Veuillez entrer un courriel valide !"
            },
            password: {
                required: "Veuillez remplir le champ !",
                minlength: "Veuillez entrer au moins 5 caractères !"
            },
            password_confirm: {
                required: "Veuillez remplir le champ !",
                minlength: "Veuillez entrer au moins 5 caractères !",
                equalTo: "Les deux mots de passe sont différents !"
            }
        }
    });

    $("#formSignup").submit(function(e) {
        e.preventDefault();
        if($(this).valid()) {
            var data = objectifyForm($(this).serializeArray());
            $.post('/signup', data, function () {
                window.location.href = "/panel";
            }).fail(function (err) {
                bootstrap_alert.danger(err.responseJSON.message);
            });
        }
    });
})