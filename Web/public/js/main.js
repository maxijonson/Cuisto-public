$(document).ready(function () {
    // ALERT UTIL
    bootstrap_alert = function () { }
    bootstrap_alert.danger = function (message) {
        var placeholder = $('#alert_placeholder');
        var alert = $('<div id="bootstrapAlert" class="alert alert-danger"><span>' + message + '</span></div>');
        placeholder
            .html(alert);
    }
    bootstrap_alert.success = function (message) {
        $('#alert_placeholder').html('<div id="bootstrapAlert" class="alert alert-success"><span>' + message + '</span></div>')
    }
    bootstrap_alert.warn = function (message) {
        $('#alert_placeholder').html('<div id="bootstrapAlert" class="alert alert-warning"><span>' + message + '</span></div>')
    }
});

function objectifyForm(formArray) {

    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  function HideBackdrop(nomModal) {
    $(nomModal).modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
}