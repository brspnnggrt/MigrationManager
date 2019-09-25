var IW = IW || {};
IW.Reactors = IW.Reactors || {};

IW.Reactors.SelectBox = React.createClass({displayName: 'exports',
  getInitialState: function () {
    return {
      id: 'react-select-box-' + (++IW.Reactors.SelectBox.idInc),
      open: false,
      focusedIndex: -1,
      pendingValue: []
    }
  },

  getDefaultProps: function () {
    return {
      closeText: 'Close',
      clearText: 'Remove selection'
    }
  },

  changeOnClose: function () {
    return this.isMultiple() && String(this.props.changeOnClose) === 'true'
  },

  updatePendingValue: function (value, cb) {
    if (this.changeOnClose()) {
      this.setState({pendingValue: value}, cb)
      return true
    }
    return false
  },

  componentWillMount: function () {
    this.updatePendingValue(this.props.value)
  },

  componentWillReceiveProps: function (next) {
    this.updatePendingValue(next.value)
  },

  clickingOption: false,

  blurTimeout: null,

  handleFocus: function () {
    clearTimeout(this.blurTimeout)
  },

  handleBlur: function () {
    clearTimeout(this.blurTimeout)
    this.blurTimeout = setTimeout(this.handleClose, 0)
  },

  handleMouseDown: function() {
    this.clickingOption = true
  },

  handleChange: function (val, cb) {
    return function (event) {
      this.clickingOption = false
      IW.Reactors.SelectBox.interceptEvent(event)
      if (this.isMultiple()) {
        var selected = []
        if (val != null) {
          selected = this.value().slice(0)
          var index = selected.indexOf(val)
          if (index !== -1) {
            selected.splice(index, 1)
          } else {
            selected.push(val)
          }
        }
        this.updatePendingValue(selected, cb) || this.props.onChange(selected)
      } else {
        this.updatePendingValue(val, cb) || this.props.onChange(val)
        this.handleClose()
        this.refs.button.focus()
      }
    }.bind(this)
  },

  handleNativeChange: function (event) {
    var val = event.target.value
    if (this.isMultiple()) {
      var children = [].slice.call(event.target.childNodes, 0)
      val = children.reduce(function (memo, child) {
        if (child.selected) {
          memo.push(child.value)
        }
        return memo
      }, [])
    }
    this.props.onChange(val)
  },

  handleClear: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    this.handleChange(null, function () {
      // only called when change="true"
      this.props.onChange(this.state.pendingValue)
    })(event)
  },

  toggleOpenClose: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    this.setState({open: !this.state.open});
    if(this.state.open) {
      return this.setState({open: false})
    }

    this.handleOpen()
  },

  handleOpen: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    this.setState({open: true}, function () {
      this.refs.menu.focus()
    })
  },

  handleClose: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    if(!this.clickingOption) {
      this.setState({open: false, focusedIndex: -1})
    }
    if (this.changeOnClose()) {
      this.props.onChange(this.state.pendingValue)
    }
  },


  moveFocus: function (move) {
    var len = React.Children.count(this.props.children)
    var idx = (this.state.focusedIndex + move + len) % len
    this.setState({focusedIndex: idx})
  },

  handleKeyDown: function (event) {
    if (IW.Reactors.SelectBox.keyHandlers[event.which]) {
      this[IW.Reactors.SelectBox.keyHandlers[event.which]](event)
    }
  },

  handleUpKey: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    this.moveFocus(-1)
  },

  handleDownKey: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    if (!this.state.open) {
      this.handleOpen(event)
    }
    this.moveFocus(1)
  },

  handleSpaceKey: function (event) {
    IW.Reactors.SelectBox.interceptEvent(event)
    if (!this.state.open) {
      this.handleOpen(event)
    } else if (this.state.focusedIndex !== -1) {
      this.handleEnterKey()
    }
  },

  handleEnterKey: function (event) {
    if (this.state.focusedIndex !== -1) {
      this.handleChange(this.options()[this.state.focusedIndex].value)(event)
    }
  },

  handleEscKey: function (event) {
    if (this.state.open) {
      this.handleClose(event)
    } else {
      this.handleClear(event)
    }
  },

  label: function () {
    var selected = this.options()
      .filter(function (option) {
        return this.isSelected(option.value)
      }.bind(this))
      .map(function (option) {
        return option.label
      })
    return selected.length > 0 ? selected.join(', ') : this.props.label
  },

  isMultiple: function () {
    return String(this.props.multiple) === 'true'
  },

  options: function () {
    var options = []
    React.Children.forEach(this.props.children, function (option) {
      options.push({
        value: option.props.value,
        label: option.props.children
      })
    })
    return options
  },

  value: function () {
    var value = this.changeOnClose() ?
      this.state.pendingValue :
      this.props.value

    if (!this.isMultiple() || Array.isArray(value)) {
      return value
    } if (value != null) {
      return [value]
    }
    return []
  },

  hasValue: function () {
    if (this.isMultiple()) {
      return this.value().length > 0
    }
    return this.value() != null
  },

  isSelected: function (value) {
    if (this.isMultiple()) {
      return this.value().indexOf(value) !== -1
    }
    return this.value() === value
  },

  render: function () {
    var className = 'react-select-box-container'
    if (this.props.className) {
      className += ' ' + this.props.className
    }
    if (this.isMultiple()) {
      className += ' react-select-box-multi'
    }
    if (!this.hasValue()) {
      className += ' react-select-box-empty'
    }
    return (
      IW.Reactors.SelectBox.div(
        {
          onKeyDown: this.handleKeyDown,
          className: className
        },
        IW.Reactors.SelectBox.button(
          {
            id: this.state.id,
            ref: 'button',
            className: 'react-select-box',
            onClick: this.toggleOpenClose,
            onBlur: this.handleBlur,
            tabIndex: '0',
            'aria-hidden': true
          },
          IW.Reactors.SelectBox.div({className: 'react-select-box-label'}, this.label())
        ),
        this.renderOptionMenu(),
        this.renderClearButton(),
        this.renderNativeSelect()
      )
    )
  },

  renderNativeSelect: function () {
    var id = this.state.id + '-native-select'
    var multiple = this.isMultiple()
    var empty = multiple ? null : IW.Reactors.SelectBox.option({key: '', value: ''}, 'No Selection')
    var options = [empty].concat(this.props.children)
    return IW.Reactors.SelectBox.div(
      {className: 'react-select-box-native'},
      IW.Reactors.SelectBox.label({htmlFor: id}, this.props.label),
      IW.Reactors.SelectBox.select({
        id: id,
        multiple: multiple,
        onKeyDown: function (e) { e.stopPropagation() },
        value: this.props.value || (multiple ? [] : ''),
        onChange: this.handleNativeChange
      }, options)
    )

  },

  renderOptionMenu: function () {
    var className = 'react-select-box-options'
    if (!this.state.open) {
      className += ' react-select-box-hidden'
    }
    /*
    var active = null
    if (this.state.focusedIndex !== -1) {
      active = this.state.id + '-' + this.state.focusedIndex
    }
    */
    return IW.Reactors.SelectBox.div(
      {
        className: className,
        onBlur: this.handleBlur,
        onFocus: this.handleFocus,
        'aria-hidden': true,
        ref: 'menu',
        tabIndex: 0
      },
      IW.Reactors.SelectBox.div(
        {
          className: 'react-select-box-off-screen'
        },
        this.options().map(this.renderOption)
      ),
      this.renderCloseButton()
    )
  },

  renderOption: function (option, i) {
    var className = 'react-select-box-option'
    if (i === this.state.focusedIndex) {
      className += ' react-select-box-option-focused'
    }
    if (this.isSelected(option.value)) {
      className += ' react-select-box-option-selected'
    }
    return IW.Reactors.SelectBox.a(
      {
        id: this.state.id + '-' + i,
        href: '#',
        onClick: this.handleChange(option.value),
        onMouseDown: this.handleMouseDown,
        className: className,
        tabIndex: -1,
        key: option.value,
        onBlur: this.handleBlur,
        onFocus: this.handleFocus
      },
      option.label
    )
  },

  renderClearButton: function () {
    if (this.hasValue()) {
      return IW.Reactors.SelectBox.button({
        'aria-label': this.props.clearText,
        className: 'react-select-box-clear',
        onClick: this.handleClear
      })
    }
  },

  renderCloseButton: function () {
    if (this.isMultiple() && this.props.closeText) {
      return IW.Reactors.SelectBox.button(
        {
          onClick: this.handleClose,
          className: 'react-select-box-close',
          onBlur: this.handleBlur,
          onFocus: this.handleFocus
        },
        this.props.closeText
      )
    }
  }
})

IW.Reactors.SelectBox.div = React.createElement.bind(null, 'div')
IW.Reactors.SelectBox.button = React.createElement.bind(null, 'button')
IW.Reactors.SelectBox.a = React.createElement.bind(null, 'a')
IW.Reactors.SelectBox.select = React.createElement.bind(null, 'select')
IW.Reactors.SelectBox.option = React.createElement.bind(null ,'option')
IW.Reactors.SelectBox.label = React.createElement.bind(null, 'label')

IW.Reactors.SelectBox.idInc = 0

IW.Reactors.SelectBox.keyHandlers = {
  38: 'handleUpKey',
  40: 'handleDownKey',
  32: 'handleSpaceKey',
  13: 'handleEnterKey',
  27: 'handleEscKey',
  74: 'handleDownKey',
  75: 'handleUpKey'
}

IW.Reactors.SelectBox.interceptEvent = function(event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

