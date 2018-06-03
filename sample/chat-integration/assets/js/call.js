$(function() {
  function handleCall (targetEmail, targetName, targetAvatar) {
    // var targetEmail = $(this).parent().data('user-email');
    // var targetName = $(this).parent().data('user-name');
    // var targetAvatar = $(this).prev().prev().attr('src');
    var targetRoom = 0;
    var roomId = 'CallID_' + Date.now().toString();
    var data = {
      system_event_type: 'custom',
      room_id: targetRoom,
      subject_email: targetEmail,
      message: QiscusSDK.core.userData.username + ' call ' + targetName,
      payload: {
        type: 'webview_call',
        call_event: 'incoming',
        call_url: 'https://rtc.qiscus.com/demos/simple/init.html#' + roomId,
        call_caller: {
          username: QiscusSDK.core.userData.email,
          name: QiscusSDK.core.userData.username,
          avatar: QiscusSDK.core.userData.avatar_url
        },
        call_callee: {
          username: targetEmail,
          name: targetName,
          avatar: targetAvatar
        }
      }
    };
    $.post('./init_call', data, function(data) {
      console.log(data);
    });
    sessionStorage.USER = QiscusSDK.core.userData.email;
    sessionStorage.ROOM = roomId;
    sessionStorage.INITIATOR = true;
    sessionStorage.AUTOACCEPT = false;
    var win = window.open('./call', '_blank');
    if (win) {
      win.focus();
    } else {
      alert('Please allow popups.');
    }
  }
  $('.call-button--chat').on('click', function () {
    var el = document.querySelector('.sdk-wrapper')
    var email = el.dataset.userEmail
    var name = el.dataset.userName
    handleCall(email, name, undefined)
  });
  $('.call-button').on('click', function () {
    var targetEmail = $(this).parent().data('user-email');
    var targetName = $(this).parent().data('user-name');
    var targetAvatar = $(this).prev().prev().attr('src');
    handleCall(targetEmail, targetName, targetAvatar)
  });
  $('.conf-button--chat').on('click', function (e) {
    e.preventDefault();
    var uniqueId = new Date().getTime();
    var payload = {
      text: 'Hi, I invited you join a conference call.',
      buttons: [{
        label: 'Join conference',
        type: 'link',
        payload: {
          url: 'https://rtc.qiscus.com/demos/multiparty/init.html#' + uniqueId
        }
      }]
    };
    var stringifiedPayload = JSON.stringify(payload);
    console.log(QiscusSDK.core.selected)
    QiscusSDK.core.sendComment(
      QiscusSDK.core.selected.id,
      'Hi, I invited you join a conference call.',
      uniqueId,
      'buttons',
      stringifiedPayload
    );
  });
});
