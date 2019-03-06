$(document).ready(function() {
    var informationInital = SelectRows();

    console.log(informationInital);

    //Modification du Prix Total lorsqu'on 
    $('input').keyup(function() {
        var element = $(this).closest('tr');
        var prix = Number(element.find('#prix').attr('value'));
        var quantite = Number(element.find('input').val());
        var total = prix * quantite;
        $(element.find('.totalArticlePrix')).text(total.toFixed(2));

        total = 0;

        $(".fournisseurArticle").each((i, elem) => {
            var fa = $(elem);
            var t = fa.find(".totalArticlePrix").text();
            total += Number(t);
        });
        
        $("#prixTotal").text(total.toFixed(2));
    });

    $('#btnCommander').on('click', function() {
        var Commande = SelectRows();

        if(ValiderCommande(Commande)) {
            var articles = [];
            for (i = 0; i < Commande.length; i++) {
                console.log(Commande[i].quantite);

                if(Commande[i].quantite !== 0) {
                    articles.push( {
                        id: Commande[i].id,
                        quantite: Commande[i].quantite
                    })
                }
            }

            if(articles.length !== 0) { 
                $.post(`/api/fournisseur/${$('#fournisseur').attr('id_fournisseur')}/commande`, {articles}, function(){
                    loadPanel('/fournisseurs/liste', {
                        animate: false,
                        force: true,
                        addToHistory: false
                    });
                    bootstrap_alert.success('La commande a été envoyée!');
                })
            } else {
                bootstrap_alert.danger('Votre commande est vide, veuillez y ajouter des articles!')
            }
        } else {
            bootstrap_alert.danger('Informations invalides!');
        }
    })

    $('#btnRetourFournisseur').on('click', function() {
        loadPanel('/fournisseurs/liste');
    })

    function SelectRows() {
        var rows = [];
        $.each($('table#fournisseurArticle > tbody tr'), (i, row) => {
            rows.push({
                id: Number($(row).attr('id')),
                nom: $(row).find('#nom').text(),
                prix: Number($(row).find('#prix').attr('value')),
                quantite: Number($(row).find('input').val())
            })
        })
        return rows;
    }

    function ValiderCommande(tableauCommande) {
        var informationsValide = true;

        for (i = 0; i < tableauCommande.length && informationsValide == true; i++) {
            if (tableauCommande[i].quantite < 0 && Number.isInteger(tableauCommande[i].quantite)) {
                informationsValide = false;
            }
        }
        return informationsValide;
    }
});