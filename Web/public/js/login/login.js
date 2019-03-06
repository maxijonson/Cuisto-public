$(document).ready(function() {
   $("#formForgot").submit(function(e) {
       e.preventDefault();
       $("#modalForgot").modal('hide');
       bootstrap_alert.success("Si l'identifiant existe, un courriel sera envoyé pour débuter la procédure");
       $.post('/api/forgot', {username: $("#usernameForgot").val()})
        .fail(err => {
            console.log(err);
        });
   });

   $("#formLogin").submit(function(e) {
       e.preventDefault();
       var data = objectifyForm($(this).serializeArray());
       $.post('/login', data, function() {
            window.location.href = "/panel";
       }).fail(function(err) {
            bootstrap_alert.danger(err.responseJSON.message);
       });
   });
});