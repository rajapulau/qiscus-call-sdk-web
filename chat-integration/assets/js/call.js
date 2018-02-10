$(function() {
  $('.call-button').on('click', function() {
    var targetEmail = $(this).parent().data('user-email');
    var targetName = $(this).parent().data('user-name');
    var targetRoom = 0;
    var targetAvatar = $(this).prev().prev().attr('src');
    var roomId = 'CallID_' + Date.now().toString();
    var data = {
      system_event_type: 'custom',
      room_id: targetRoom,
      subject_email: targetEmail,
      message: QiscusSDK.core.userData.username + ' call ' + targetName,
      payload: {
        type: 'call',
        call_event: 'incoming',
        call_room_id: roomId,
        call_is_video: true,
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
    $.post('/call', data, function(data) {
      console.log(data);
    });
    sessionStorage.USER = QiscusSDK.core.userData.email;
    sessionStorage.ROOM = roomId;
    var win = window.open('http://localhost:9000/room', '_blank');
    if (win) {
      win.focus();
    } else {
      alert('Please allow popups.');
    }
  });
});
