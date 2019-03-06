$(document).ready(function() {
    $('#rechercheCommande').change(async function() {
        var value = this.value;
        await LancerRecherche(value);
        $('#btnVisionnerCommande').attr('disabled',true);
    })

    $('#btnVisionnerCommande').on('click', function() {
        var selected = getSelected();
        loadPanel(`/commandeFournisseur/${selected.attr('id')}`);
    })

    $('#btnRetourCommandes').on('click', function() {
        loadPanel('/commandeFournisseur/liste');
    })

    $('#btnRetourFournisseur').on('click', function() {
        loadPanel('/fournisseurs/liste');
    })

    $('.article').each(function() {
        var prix = Number($(this).find('#prix').attr('value'));
        var quantite = Number($(this).find('#quantite').attr('value'));
        var total = prix * quantite;
        $(this).find('#totalArticle').text(total.toFixed(2) + '$');
    }) 

    function LancerRecherche(value) {
        return new Promise((resolve, reject) => {
            $('tbody > tr > td').remove();
            $('tbody > tr').remove();
    
            if(value < 0) {
                $.get(`/api/commandeFournisseur/liste`, function(data){
                    var commandes = data.commandes;
                    AfficherInformations(commandes);
                    resolve();
                }).fail(function(err) {
                    reject(err);
                })
            } else {
                $.get(`/api/commandeFournisseur/liste?Fournisseur_id=${value}`, function(data){
                    var commandes = data.commandes;
                    AfficherInformations(commandes);
                    resolve(); 
                }).fail(function(err) {
                    reject(err);
                })
            }
        });
    }

    function AfficherInformations(commandes) {
        for(var i = 0; i < commandes.length; i++) {
            $('tbody').append(`
                <tr id="${commandes[i].id}" class="selectable">
                    <td id="nom">${commandes[i].Fournisseur.nom}</td>
                    <td id="date">${commandes[i].date}</td>
                    <td id="coutTotal">${commandes[i].total}</td>
                </tr>
            `);
        }
    }
});

