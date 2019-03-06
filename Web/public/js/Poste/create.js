$(document).ready(function() {
    $("#formCreerPoste").validate({
    
        onkeyup: false,
        onclick: false,
        onfocusout: false,
    
        rules: {
            nom: {
                required: true,
                maxlength: 45
            }
        },
        messages:{
            nom: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            }
        },
        errorPlacement: function(error, element){
                error.appendTo(element.prev().prev());
                console.log("bbb");
        }
    
    });

    $("#formCreerPoste").submit(function(e) {
        if($(this).valid()) {
            var poste = objectifyForm($(this).serializeArray());

            $.post("/api/poste", poste, function () {
                window.location.replace('liste');
            })
            .fail(function(err) {
                if(err.responseJSON.message)
                    bootstrap_alert.danger(err.responseJSON.message);
            });
        }

        e.preventDefault();
    });
});