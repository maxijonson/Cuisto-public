$(document).ready(function () {
    var informationInitial = SelectRows();

    
    function SelectRows() {
        var rows = [];
        $.each($('table#inventaire > tbody tr'), (i, row) => {
            rows.push({
                id: Number($(row).attr('id')),
                quantite: Number($(row).find('input').val())
            });
        });
        return rows;
    }

    $("#BtnAccepter").click(function () {
        var nouvelleInformation = SelectRows();

        // Validation des informations (aucun nombre negatif)
        if(ValiderInformation(nouvelleInformation)) {
            var articles = [];
            for(i = 0; i < nouvelleInformation.length; i++) {
                if(nouvelleInformation[i].quantite != informationInitial[i].quantite) {
                    articles.push(nouvelleInformation[i]);
                }
            }
            if(articles.length == 0) return bootstrap_alert.warn(`L'inventaire n'a pas changé`);
            $.ajax({
                url: `/api/article/inventaire`,
                type: 'PATCH',
                data: {articles},
                success: function () {
                        loadPanel('/inventaire/modifyInventaire', {
                            animate: false,
                            force: true,
                            addToHistory: false
                        });
                        bootstrap_alert.success("L'inventaire d'article a été modifiée")
                },
                error: function (err) {
                    if (err.responseJSON.message)
                        bootstrap_alert.danger(err.responseJSON.message);
                }
            })

        } else {
            bootstrap_alert.danger('Informations invalides pour la modification!');
        }
    })

    //A definir
    function ValiderInformation(tableauArticle) {
        var informationsValide = true;

        for (i = 0; i < tableauArticle.length && informationsValide == true; i++) {
            if (tableauArticle[i].quantite < 0) {
                informationsValide = false;
            }
        }
        return informationsValide;
    }
})
