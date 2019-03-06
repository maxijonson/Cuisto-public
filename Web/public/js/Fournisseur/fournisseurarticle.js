$(document).ready(function () {
    var informationInitial = SelectRows();

    $('#btnAjouterArticle').on('click', function () {
        $('#articleModal').modal('show');
    });

    /* Modification du prix des articles */
    $('#btnModifierListe').on('click', function () {
        var nouvelleInformation = SelectRows();
        var articles = [];
        for (i = 0; i < nouvelleInformation.length; i++) {
            if (nouvelleInformation[i].prix != informationInitial[i].prix) {
                articles.push({
                    Article_id: Number(nouvelleInformation[i].id),
                    Fournisseur_id: Number($('#fournisseur').attr('id_fournisseur')),
                    prix: Number(nouvelleInformation[i].prix)
                })
            }
        }

        if(articles.length == 0)
            return bootstrap_alert.warn("Aucun prix n'a été modifié");

        // Envoi de la requete Ajax avec les articles qui ont ete modifier
        $.ajax({
            url: `/api/article/fournisseurs`,
            type: 'PATCH',
            data: { articles },
            success: function () {
                loadPanel(`/fournisseurs/${$('#fournisseur').attr('id_fournisseur')}`, {
                    animate: false,
                    force: true,
                    addToHistory: false
                });
                bootstrap_alert.success("La liste d'article a été modifiée")
            },
            error: function (err) {
                if (err.responseJSON.message)
                    bootstrap_alert.danger(err.responseJSON.message);
            }
        })
    });

    $('#btnRetourFournisseur').on('click', function () {
        loadPanel('/fournisseurs/liste');
    })

    //Permet l'ajout un article a ce fournisseur a partir de cette page
    $('#formArticle').submit(function (event) {
        if ($(this).valid()) {
            var article = {
                nom: $('#nomModal').val(),
                quantite: $('#quantiteModal').val(),
                unite: $('#uniteModal').val(),
                typeArticle: $('#typeModal').val(),
                Fournisseurs: [{
                    Fournisseur_id: $('#fournisseur').attr('id_fournisseur'),
                    prix: $('#prix').val()
                }]
            }

            $.post(`/api/article`, article, async function () {
                loadPanel(`/fournisseurs/${$('#fournisseur').attr('id_fournisseur')}`, {
                    animate: false,
                    force: true,
                    addToHistory: false
                });
                HideBackdrop('#articleModal');
                bootstrap_alert.success("L'Article a été ajouté!");
            })
        }
        event.preventDefault();
    })

    function SelectRows() {
        var rows = [];
        $.each($('table#fournisseurArticle > tbody tr'), (i, row) => {
            rows.push({
                id: Number($(row).attr('id')),
                prix: Number($(row).find('input').val())
            })
        })
        return rows;
    }
});