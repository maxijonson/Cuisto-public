var animationDone = true;
var panelHistory = [];
var historyIndex = -1;

function loadPanel(url, {
    animate = true,
    showError = true,
    force = false,
    duration = 500,
    timer = 200,
    addToHistory = true,
    name = null
} = {}) {
    if (!animationDone && !force)
        return;
    else
        return new Promise((resolve, reject) => {
            $.get(url, function (data) {
                if (panelHistory.length != 0)
                    if (url == panelHistory[historyIndex].url && !force) return resolve();

                if (addToHistory) {
                    if (historyIndex != -1)
                        panelHistory = panelHistory.slice(0, historyIndex + 1);

                    if(!name) {
                        name = $($.parseHTML(data)).filter('title').text();
                    }
                    historyIndex = panelHistory.push({
                        url,
                        options: {
                            animate,
                            showError,
                            force,
                            duration,
                            timer,
                            addToHistory: false,
                            name
                        }
                    }) - 1;
                }

                updateHistoryActions();
                animationDone = false;
                var current = $("#panel > #current");
                var n = $("#panel > #new");
                if (!animate || !$("#animation-switch").is(":checked")) {
                    $("#panel > #new").html(data);
                    animationDone = true;
                    return resolve();
                }

                current.html(n.html());
                n.empty();
                n.html(data);
                n.css({
                    top: -n.height(),
                    opacity: 0
                });
                current.addClass('out');
                n.animate({
                    top: '0',
                    opacity: 1
                }, {
                        duration: duration
                    })
                setTimeout(function () {
                    current.empty().removeClass('out');
                    setTimeout(function () {
                        animationDone = true;
                    }, timer);
                    resolve();
                }, duration);
            }).fail(err => {
                var error;
                if (err.responseJSON) {
                    if (err.responseJSON.message)
                        error = err.responseJSON.message;
                }
                else
                    error = 'Une erreur est survenue lors du chargement du menu';
                if (showError)
                    bootstrap_alert.danger(error);
                reject(error);
            });
        })
}

function updateHistoryActions() {
    $(`.historyAction[cuisto-history="prev"]`).attr("cuisto-disabled", `${historyIndex <= 0}`);
    $(`.historyAction[cuisto-history="frwd"]`).attr("cuisto-disabled", `${historyIndex >= panelHistory.length - 1}`);
}

function select(jQueryElem, callback) {
    if (jQueryElem.hasClass('selected'))
        jQueryElem.removeClass('selected');
    else {
        $('.selected').removeClass('selected');
        jQueryElem.addClass('selected');
    }
    if(callback)
        callback();
}

function getSelected() {
    var selected = $("body").find(".selected")[0];
    return selected ? $(selected) : null;
}

$(document).ready(function () {
    updateHistoryActions();
    var interval = 25;
    $("#sidebar li").each((i, m) => {
        var menu = $(m);
        setTimeout(function () {
            menu.removeClass('hidden');
        }, interval * i);
    });

    setTimeout(function () {
        $("#panelDefault").removeClass('hidden');
    }, interval * 2 * ($("#sidebar li").length + 1))

    $(".historyAction").click(function () {
        var panel;
        if ($(this).attr("cuisto-disabled") == "true") return;
        switch ($(this).attr("cuisto-history")) {
            case "prev":
                panel = panelHistory[--historyIndex];
                panel.options.force = true;
                loadPanel(panel.url, panel.options);
                break;

            case "frwd":
                panel = panelHistory[++historyIndex];
                panel.options.force = true;
                loadPanel(panel.url, panel.options);
                break;

            default:
                break;
        }
        updateHistoryActions();
    });

    $("body").on("click", ".selectable", function() {
        select($(this));
        $(".selectAction").attr("disabled", getSelected() == null);
    });

    $('.historyAction[cuisto-history="prev"]').hover(function () {
        if ($(this).attr("cuisto-disabled") == "false") {
            $("#historyName").html(historyIndex <= 0 ? "" : panelHistory[historyIndex - 1].options.name || "Précédent");
            $("#historyName").removeClass("hidden");
        }
        else
            $("#historyName").addClass("hidden");
    }, function () {
        $("#historyName").addClass("hidden");
    });

    $('.historyAction[cuisto-history="prev"]').click(function () {
        if ($(this).attr("cuisto-disabled") == "false")
            $("#historyName").html(historyIndex <= 0 ? "" : panelHistory[historyIndex - 1].options.name || "Précédent");
        if (historyIndex <= 0)
            $("#historyName").addClass("hidden");
    });

    $('.historyAction[cuisto-history="frwd"]').hover(function () {
        if ($(this).attr("cuisto-disabled") == "false") {
            $("#historyName").html(historyIndex >= panelHistory.length - 1 ? "" : panelHistory[historyIndex + 1].options.name || "Suivant");
            $("#historyName").removeClass("hidden");
        }
        else
            $("#historyName").addClass("hidden");
    }, function () {
        $("#historyName").addClass("hidden");
    });

    $('.historyAction[cuisto-history="frwd"]').click(function () {
        if ($(this).attr("cuisto-disabled") == "false")
            $("#historyName").html(historyIndex >= panelHistory.length - 1 ? "" : panelHistory[historyIndex + 1].options.name || "Suivant");
        if (historyIndex >= panelHistory.length - 1)
            $("#historyName").addClass("hidden");
    });

    // Liste Employés
    $("a#Employe_Employes_Menu").on("click", function () {
        loadPanel('/employes/liste');
    });

    // Liste Fournisseurs
    $("a#Fournisseur_Liste_Menu").on("click", function () {
        loadPanel('/fournisseurs/liste');
    });

    $('a#Commande_Liste_Menu').on('click', function () {
        loadPanel('/commandeFournisseur/liste');
    })

    // Liste Inventaire
    $("a#Inventaire_Liste_Menu").on("click", function () {
        loadPanel('/inventaire/liste');
    });

    //Create Article (Inventaire)
    function LoadCreateArticle() {
        loadPanel("/inventaire/create");
    }

    $("a#Inventaire_Create_Menu").on("click", function () {
        LoadCreateArticle();
    });

    //Modifier Inventaire au Complet
    $("a#Inventaire_ModifierTout_Menu").on("click", function () {
        loadPanel('/inventaire/modifyInventaire');
    })

    //Liste des Salles
    $("a#Salle_Liste_Menu").on("click", function () {
        loadPanel('/plantable/liste');
    })

    $("a#Menu_Liste_Menu").on("click", function () {
        loadPanel('/menu/liste');
    })

    $('a#Item_Liste_Menu').on('click', function () {
        loadPanel('/item/liste');
    })
});