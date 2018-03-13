/* global QiscusSDK, $, _ */
$(function () {
  var appSidebar = $('.app-sidebar__lists');
  var $createGroupSidebar = $('.app-sidebar.create-group');
  var $mainSidebar = $('.app-sidebar.main');
  var $createGroupNameSidebar = $('.app-sidebar.create-group-name');
  var $contactListSidebar = $('.app-sidebar.contact-list');
  var $chatStrangerSidebar = $('.app-sidebar.chat-stranger');

  var isLoggedIn = window.sessionStorage.getItem('sdk-sample-app---is-loggedin');
  var userData = null;
  if (!isLoggedIn || Boolean(isLoggedIn) !== true) {
    window.location.href = './login';
  } else {
    userData = window.sessionStorage.getItem('sdk-sample-app---user-data');
    userData = JSON.parse(userData);
  }
  attachClickListenerOnConversation();
  loadContactList();
  // let's setup options for our widget
  QiscusSDK.core.init({
    AppId: window.SDK_APP_ID,
    mode: 'wide',
    options: {
      // When we're success login into qiscus SDK we'll have a 1-on-1 chat to guest2@qiscus.com
      // You can change this to any user you have on your AppId, e.g: contact@your_company.com, etc
      loginSuccessCallback: function () {
        // QiscusSDK.core.UI.chatTarget('guest2@qiscus.com')
        // load Room List
        loadRoomList();

        // Join Qiscus AOV Room
        // QiscusSDK.core.getOrCreateRoomByUniqueId('Qiscus AOV');

        // Display UI in sidebar
        renderSidebarHeader();
      },
      newMessagesCallback: function (messages) {
        var message = messages.slice(0, 1).pop()
        loadRoomList();
        patchUnreadMessages(messages);
        if (message.type === 'system_event') {
          handleSystemMessage(message);
        }
      },
      groupRoomCreatedCallback: function (data) {
        // Success creating group,
        // Reload room list
        loadRoomList();
        // Clear all selected target,
        $createGroupSidebar.find('.selected-participant-list').empty();
        $createGroupSidebar.find('.contact-item').removeClass('selected');
        // Hide all creating group sidebar,
        $createGroupSidebar.addClass('hidden');
        $createGroupNameSidebar.addClass('hidden');
        // Unhide main sidebar
        $mainSidebar.removeClass('hidden');
        // Open group room
        QiscusSDK.core.UI.chatGroup(data.id);
        // Hide empty state for the main view
        $('#empty-chat-wrapper').addClass('hidden');
      },
      chatRoomCreatedCallback: function (data) {
        console.log('chat.room.created', data)
        // check if room already exists on sidebar
        var roomId = data.room.id;
        var isExists = $('#room-' + roomId).length > 0;
        if (!isExists) {
          var room = createRoomDOM(data.room);
          appSidebar.find('ul').prepend(room);
        }
        $chatStrangerSidebar.addClass('hidden');
        $chatStrangerSidebar.find('input[type="text"]').val('');
        $('#empty-chat-wrapper').addClass('hidden');
      }
    }
  });
  // login to qiscus
  QiscusSDK.core.setUser(userData.userId, userData.secret, userData.username);
  // render the widget
  QiscusSDK.render();

  var oldEmail = null
  function patchCallButton () {
    if (!QiscusSDK.core.selected) return
    const target = QiscusSDK.core.selected.participants
      .find(it => it.email !== QiscusSDK.core.email)
    if (oldEmail !== target.email) { oldEmail = target.email }
    else return
    $('.call-button--chat')
      .parent()
      .attr('data-user-email', target.email)
      .attr('data-user-name', target.username)
  }

  function clearUnreadMessages (roomId) {
    var $targetRoomDOM = $('li#room-' + roomId + '');
    $targetRoomDOM.attr('data-sdk-unread-count', '0');
    $targetRoomDOM.find('.unread-count')
      .text('0')
    $targetRoomDOM.find('.unread-count')
      .addClass('hidden');
  }
  function patchUnreadMessages (messages) {
    var unreadMessages = messages.filter(function (message) {
      return message.email !== QiscusSDK.core.email;
    });
    unreadMessages.forEach(function (message) {
      var roomId = message.room_id;
      var $targetRoomDOM = $('li#room-' + roomId + '');
      var lastMessageId = $targetRoomDOM.attr('data-sdk-last-message-id') || 0;
      var lastUnreadCount = $targetRoomDOM.attr('data-sdk-unread-count') || 0;
      if (lastMessageId < message.id) {
        $targetRoomDOM
          .attr('data-sdk-last-message-id', message.id)
          .find('.last-message')
          .text(message.message);
      }
      $targetRoomDOM.attr('data-sdk-unread-count');
    });
    $('.room-item')
      .filter(function () {
        var unreadCount = $(this).attr('data-sdk-unread-count');
        return Number(unreadCount) > 0;
      })
      .toArray()
      .forEach(function (item) {
        var $this = $(item);
        var unreadCount = $this.attr('data-sdk-unread-count');
        // patch unread badge
        unreadCount = unreadCount > 9 ? '9+' : unreadCount;
        $this.find('.unread')
          .removeClass('hidden')
          .text(unreadCount);
      });
  }

  function loadRoomList() {
    QiscusSDK.core.loadRoomList()
        .then(function (rooms) {
          var lists = rooms.map(function (room) {
            return createRoomDOM(room);
          });
          appSidebar.find('ul').empty().append(lists);
          toggleConversationActiveClass();
        })
  }

  function renderSidebarHeader() {
    $('.app-sidebar__header img').attr('src', QiscusSDK.core.userData.avatar_url);
    $('.app-sidebar__myinfo div').html(QiscusSDK.core.userData.username);
    $('.app-sidebar__myinfo span').html('Online');
  }

  function attachClickListenerOnConversation() {
    window.setInterval(() => {
      patchCallButton();
    }, 100)
    $('.app-sidebar__lists').on('click', 'li', function () {
      var $this = $(this);
      $('.app-sidebar__lists li').removeClass('active');
      $this.addClass('active');
      toggleConversationActiveClass();
      // if($this.data('room-type') == 'single'){
      //   QiscusSDK.core.UI.chatTarget($this.data('room-name'));
      // } else {
      //   QiscusSDK.core.UI.chatGroup($this.data('id'));
      // }
      QiscusSDK.core.UI.chatGroup($this.data('id'));
      $('#empty-chat-wrapper').addClass('hidden');
      var roomId = $this.attr('data-id');
      clearUnreadMessages(roomId);
    })
  }

  function toggleConversationActiveClass() {
    if (!QiscusSDK.core.selected) return;
    appSidebar.find('li').removeClass('active');
    appSidebar.find('li#room-' + QiscusSDK.core.selected.id).addClass('active');
  }

  function createRoomDOM(room) {
    var avatar = document.createElement('img');
    avatar.classList.add('room-avatar');
    avatar.setAttribute('src', room.avatar);
    avatar.setAttribute('width', '48');
    avatar.setAttribute('height', '48');
    var li = document.createElement('li');
    li.setAttribute('data-id', room.id);
    li.setAttribute('id', 'room-' + room.id);
    li.setAttribute('data-room-name', room.name);
    li.setAttribute('data-room-type', room.room_type);
    li.setAttribute('data-sdk-last-message-id', '-1');
    li.setAttribute('data-sdk-unread-count', '0');
    li.classList.add('room-item');
    var detail = document.createElement('div');
    var name = document.createElement('strong');
    name.innerText = room.name;
    var lastComment = document.createElement('span');
    lastComment.classList.add('last-comment');
    lastComment.innerText = room.last_comment_message;
    detail.appendChild(name);
    detail.appendChild(lastComment);
    var unreadCount = document.createElement('span');
    unreadCount.classList.add('unread-count');
    unreadCount.innerText = room.count_notif;
    if (room.count_notif <= 0) {
      unreadCount.classList.add('hidden');
    }
    li.appendChild(avatar);
    li.appendChild(detail);
    li.appendChild(unreadCount);

    // li.addEventListener('click', () => patchCallButton())
    return li;
  }

  var $contactList = $('ul.contact-list');
  $('input#search-contact')
      .on('keyup', _.debounce(function () {
        var value = this.value;
        $contactList.find('li')
            .toArray()
            .map(function (item) {
              if ($(item).hasClass('hidden')) {
                $(item).removeClass('hidden');
              }
              return item;
            })
            .filter(function (item) {
              var contactName = $(item).attr('data-user-name');
              return contactName.toLowerCase().indexOf(value) < 0;
            })
            .forEach(function (item) {
              $(item).addClass('hidden');
            });
      }, 100));

  $('#input-search-room')
      .on('focus', function () {
        $('.app-sidebar__search__icon').addClass('focus');
      })
      .on('blur', function () {
        $('.app-sidebar__search__icon').removeClass('focus');
      })
      .on('keyup', _.debounce(function () {
        var value = this.value;
        appSidebar.find('li')
            .toArray()
            .map(function (item) {
              if ($(item).hasClass('hidden')) {
                $(item).removeClass('hidden');
              }
              return item;
            })
            .filter(function (item) {
              var roomName = $(item).attr('data-room-name');
              return roomName.toLowerCase().indexOf(value) < 0;
            })
            .forEach(function (item) {
              $(item).addClass('hidden');
            })
      }, 100));

  $('#chat-with-stranger-btn').on('click', function (event) {
    event.preventDefault();
    $chatStrangerSidebar.removeClass('hidden');
  });
  $chatStrangerSidebar.on('click', '.navigation-btn', function (event) {
    event.preventDefault();
    $chatStrangerSidebar.addClass('hidden');
    $chatStrangerSidebar.find('input').val('');
  });
  $chatStrangerSidebar
      .find('form')
      .on('submit', function (event) {
        event.preventDefault();
        var target = event.target['uniqueId'].value;
        QiscusSDK.core.UI.chatTarget(target);
        return false;
      });
  $chatStrangerSidebar.on('keydown', 'input', function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      var value = event.target.value;
      QiscusSDK.core.UI.chatTarget(value);
    }
  });

  var $showContactListBtn = $('#show-contact-list');
  $showContactListBtn.on('click', function (event) {
    event.preventDefault();
    $contactListSidebar.removeClass('hidden');
    return false;
  });
  $contactListSidebar
      .find('#hide-contact-list-btn')
      .on('click', function (event) {
        event.preventDefault();
        $contactListSidebar.addClass('hidden');
        return false;
      });

  var $menuBtn = $('#menu-btn');
  var $popOver = $('.popover-menu');
  $popOver.on('click', 'a', function () {
    $popOver.addClass('hidden');
  });
  $menuBtn.on('click', function (event) {;
    event.preventDefault();
    $popOver.toggleClass('hidden');
    return false;
  });

  var $logoutBtn = $('#logout-btn');
  $logoutBtn.on('click', function (event) {
    event.preventDefault();
    window.sessionStorage.clear();
    window.location.reload();
    return false;
  });

  $contactListSidebar.on('click', '.contact-item', function (event) {
    var target = $(this).data('user-email');
    QiscusSDK.core.UI.chatTarget(target);
    $('#empty-chat-wrapper').addClass('hidden');
  });

  // Load contact
  function loadContactList () {
    var users = [
      {
        "avatar_url": "https://d1edrlpyc25xu0.cloudfront.net/kiwari-prod/image/upload/75r6s_jOHa/1507541871-avatar-mine.png",
        "created_at": "2018-02-06T09:10:52.708099Z",
        "email": "user2_sample_call@example.com",
        "id": 759430,
        "name": "User 2 Sample Call",
        "updated_at": "2018-02-06T09:10:52.708099Z",
        "username": "User 2 Sample Call"
      },
      {
        "avatar_url": "https://d1edrlpyc25xu0.cloudfront.net/kiwari-prod/image/upload/75r6s_jOHa/1507541871-avatar-mine.png",
        "created_at": "2018-02-06T09:10:35.872875Z",
        "email": "user1_sample_call@example.com",
        "id": 759427,
        "name": "User 1 Sample Call",
        "updated_at": "2018-02-06T09:10:35.872875Z",
        "username": "User 1 Sample Call"
      }
    ];
    var contactDOM = users.map(createContactDOM);
    $('ul.contact-list').empty().append(contactDOM);
  }

  function createContactDOM(contactData) {
    var container = document.createElement('li');
    var avatar = document.createElement('img');
    var detailContainer = document.createElement('div');
    var name = document.createElement('span');
    var onlineStatus = document.createElement('span');

    container.classList.add('contact-item');
    container.setAttribute('data-room-id', contactData.id);
    container.setAttribute('data-user-email', contactData.email);
    container.setAttribute('data-user-name', contactData.name);
    container.setAttribute('data-user-username', contactData.username);

    detailContainer.classList.add('contact-item-detail');
    avatar.setAttribute('src', contactData.avatar_url);
    name.classList.add('name');
    name.innerText = contactData.name;
    onlineStatus.classList.add('online-status');
    onlineStatus.innerText = 'online';
    detailContainer.appendChild(name);
    detailContainer.appendChild(onlineStatus);

    var callButton = document.createElement('i');
    callButton.classList.add('call-button');
    callButton.classList.add('fa');
    callButton.classList.add('fa-video-camera');
    callButton.innerText = '';

    container.appendChild(avatar);
    container.appendChild(detailContainer);
    container.appendChild(callButton);

    return container;
  }

  function createSelectedDataDOM (userData) {
    var $li = $(document.createElement('li'));
    var $removeButton = $(document.createElement('button'));
    var $removeButtonIcon = $(document.createElement('img'));
    var $avatar = $(document.createElement('img'));

    $li.addClass('selected-participant-item');
    $removeButton.addClass('remove-participant-button');
    $removeButtonIcon.addClass('remove-participant');
    $avatar.addClass('participant-avatar');

    $li.attr('data-user-email', userData.email);
    $li.attr('data-user-id', userData.id);
    $li.attr('data-user-name', userData.name);
    $removeButtonIcon.attr('src', '/assets/img/icon-remove-participant.svg');
    $avatar.attr('src', userData.avatar);

    $removeButton.append($removeButtonIcon);
    $li.append($removeButton);
    $li.append($avatar);
    return $li;
  }
  var $selectedParticipantList = $('.create-group .selected-participant-list');
  var $createGroupContactList = $('.create-group .contact-list');
  $createGroupContactList.on('click', '.contact-item', function (event) {
    var $this = $(this);
    $this.toggleClass('selected');
    var userId = $this.data('room-id');
    if ($this.hasClass('selected')) {
      var userData = {
        id: userId,
        name: $this.data('user-name'),
        email: $this.data('user-email'),
        avatar: $this.find('img').attr('src')
      };
      var $selectedUserDOM = createSelectedDataDOM(userData);
      $selectedParticipantList.append($selectedUserDOM);
    } else {
      // Remove from selected participant list
      $selectedParticipantList.find('li[data-user-id=' + userId + ']')
          .remove();
    }
    calculateSelectedParticipantChange();
    return false
  });
  $('#create-group-search-contact-input')
      .on('keyup', _.debounce(function () {
        var value = $(this).val();
        $createGroupContactList
            .find('li.contact-item')
            .toArray()
            .map(function (item) {
              if ($(item).hasClass('hidden')) $(item).removeClass('hidden');
              return item;
            })
            .filter(function (item) {
              var userName = $(item).attr('data-user-name');
              return userName.toLowerCase().indexOf(value) < 0;
            })
            .forEach(function (item) {
              $(item).addClass('hidden');
            })
      }, 100));
  var $createGroupNextBtn = $createGroupSidebar.find('.next-button');
  function calculateSelectedParticipantChange () {
    var hasChild = $selectedParticipantList.children().length > 0;
    if (hasChild) {
      $selectedParticipantList.parent().removeClass('hidden');
      $createGroupNextBtn.removeClass('hidden');
    } else {
      $selectedParticipantList.parent().addClass('hidden');
      $createGroupNextBtn.addClass('hidden');
    }
  }
  $createGroupNextBtn.on('click', function () {
    $createGroupNameSidebar.removeClass('hidden');
    $createGroupSidebar.addClass('hidden');
    return false;
  });
  $selectedParticipantList.on('click', '.remove-participant-button', function () {
    var $parent = $(this).parent();
    var userId = $parent.data('user-id');
    var $selectedItem = $createGroupSidebar.find('li.contact-item[data-room-id=' + userId + ']');
    $selectedItem.removeClass('selected');
    $parent.remove();
    calculateSelectedParticipantChange();
    return false;
  });
  var $groupNameInput = $createGroupNameSidebar.find('input.group-name-input');
  var $groupNameNextBtn = $createGroupNameSidebar.find('button.next-button');
  $groupNameInput.on('keyup', _.debounce(function (event) {
    var $this = $(this);
    var value = $this.val();
    if (value.length >= 5) {
      $groupNameNextBtn.removeClass('hidden');
    } else {
      $groupNameNextBtn.addClass('hidden');
    }
  }, 100));
  $groupNameNextBtn.on('click', function (event) {
    console.group('create group');
    var participants = $createGroupContactList.find('li.contact-item.selected')
        .toArray()
        .map(function (item) { return $(item).attr('data-user-email'); });
    var groupName = $groupNameInput.val();
    console.log('with name:', groupName);
    console.log('with participants:', participants);
    console.groupEnd();
    QiscusSDK.core.createGroupRoom(groupName, participants);
    return false;
  });
  var $createGroupBtn = $('#create-group-btn');
  $createGroupBtn.on('click', function () {
    $popOver.addClass('hidden');
    $createGroupSidebar.removeClass('hidden');
    $mainSidebar.addClass('hidden');
    return false;
  });
  $createGroupNameSidebar.find('.navigation-btn')
      .on('click', function () {
        $createGroupNameSidebar.addClass('hidden');
        $createGroupSidebar.removeClass('hidden');
        return false;
      });
  $createGroupSidebar.find('.navigation-btn')
      .on('click', function () {
        $createGroupSidebar.addClass('hidden');
        $mainSidebar.removeClass('hidden');
        return false;
      });

  function handleSystemMessage (message) {
    var isCall = message.payload.type === 'custom'
      && message.payload.payload.type === 'call'
    if (isCall) {
      handleCallSystemMessage(message)
    }
  }
  function handleCallSystemMessage (message) {
    var payload = message.payload.payload
    var isSelf = payload.call_caller.username === QiscusSDK.core.email
    if (isSelf) return
    $('#caller-avatar').attr('src', payload.call_caller.avatar);
    $('#caller-name').text(payload.call_caller.name);
    sessionStorage.USER = QiscusSDK.core.email;
    sessionStorage.ROOM = payload.call_room_id;
    sessionStorage.INITIATOR = false;
    sessionStorage.AUTOACCEPT = true;
    $('.modal-confirmation-container')
      .attr('data-caller-email', payload.call_caller.username)
      .attr('data-caller-name', payload.call_caller.name)
      .attr('data-callee-email', payload.call_callee.username)
      .attr('data-callee-name', payload.call_callee.name)
      .removeClass('hidden')
    showNotification(payload)
  }
  function showNotification (payload) {
    // Pass if notification are not granted
    if (Notification.permission === 'denied') return
    // Try to request for notification when not requested yet
    if (Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    // Only send notification when window are not focused
    if (document.hidden) {
      var notification = new Notification('You got a call from ' + payload.call_caller.name)
      notification.onclick = function () {
        window.focus()
      }
    }
  }
  $('.modal-confirmation-shadow-div').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
  })
  $('.modal-confirmation').on('click', '.-accept', function (event) {
    event.preventDefault()
    event.stopPropagation()
    $(this).parent().parent().parent().addClass('hidden')
    var win = window.open('./room', '_blank')
    if (win) {
      win.focus()
    } else {
      alert('Please allow popups.')
    }
  })
  $('.modal-confirmation').on('click', '.-decline', function (event) {
    event.preventDefault()
    event.stopPropagation()
    $(this).parent().parent().parent().addClass('hidden')
  })

});
