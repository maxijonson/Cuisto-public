$(document).ready(function () {

    $("#telephone").inputmask("(999) 999-9999");

    $("#codepostal").inputmask({ "mask": "A9A 9A9" });

    jQuery.validator.addMethod("maskTelephoneComplet", function (value, element) {
        return ($("#telephone").inputmask("isComplete"));
    }, "Veuillez remplir le champ au complet !");

    jQuery.validator.addMethod("maskCodepostalComplet", function (value, element) {
        return ($("#codepostal").inputmask("isComplete"));
    }, "Veuillez remplir le champ au complet !");

    $("#formCreerEmp").validate({
    
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
                maskPhoneComplet: true
            },
            ville:{
                required: true,
                maxlength:45
            },
            codepostal: {
                required: true,
                maskCodepostalComplet: true
            },
            adresse:{
                required: true,
                maxlength: 255
            },
            courriel:{
                required: true,
                maxlength: 128,
                email: true
            }
        },
        messages:{
            nom: {
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
             telephone: {
                required: "Veuillez remplir le champ !",
                maskPhoneComplet: "Veuillez remplir le champ au complet !"
            },
            ville:{
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !"
            },
            codepostal: {
                required: "Veuillez remplir le champ !",
                maskCodepostalComplet: "Veuillez remplir le champ au complet !"
            },
            adresse:{
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 255 caractères !"
            },
            courriel:{
                required: "Veuillez remplir le champ !",
                maxlength: "La longueur maximale est de 45 caractères !",
                email: "Veuillez entrer un courriel valide !"
            }
        },
        errorPlacement: function(error, element){
                error.appendTo(element.prev().prev());
                console.log("bbb");
        }
    
    });
})




