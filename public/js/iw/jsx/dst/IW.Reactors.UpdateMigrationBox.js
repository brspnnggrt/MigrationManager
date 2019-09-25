var IW = IW || {};
IW.Reactors = IW.Reactors || {};

IW.Reactors.UpdateMigrationBox = React.createClass({
  getInitialState: function () {
    return {
      web: this.props.data // seeding initial state from props
    };
  },
  handleStatusChange: function (status) {
    var web = this.state.web;
    web.status = status;
    this.setState({
      web: web
    });
  },
  handleDestinationChange: function (e) {
    this.labelBox.setState({
      destination: e.currentTarget.value
    });
    var web = this.state.web;
    web.destination = e.currentTarget.value;
    this.setState({
      web: web
    });
  },
  handleSiteOwnersChange: function (e) {
    var web = this.state.web;
    web.siteOwners = e.currentTarget.value;
    this.setState({
      web: web
    });
  },
  handleReadOnlyChange: function (e) {
    var web = this.state.web;
    web.readOnly = e.currentTarget.checked;
    this.setState({
      web: web
    });
  },
  handleCommentSubmit: function (comments) {
    var web = this.state.web;
    web.comments = comments;
    this.setState({
      web: web
    });
  },
  handleSave: function () {
    $.ajax({
      url: '/update',
      data: {
        updateMigrationTitle: $("#migrationSelect option:selected").text(),
        updateMigrationJSON: JSON.stringify(this.state.web)
      },
      type: 'post',
      success: function (data) {
        dialog.dialog('close');
      }
    });
  },
  render: function () {
    return React.createElement(
      'div',
      { className: 'flex-container' },
      React.createElement(
        'div',
        { className: 'flex-item' },
        React.createElement(IW.Reactors.CommentBox, { data: this.state.web.comments, onCommentSubmit: this.handleCommentSubmit })
      ),
      React.createElement(
        'div',
        { className: 'flex-item' },
        React.createElement(IW.Reactors.LabelBox, { data: this.props.data, ref: ref => this.labelBox = ref }),
        React.createElement(
          'p',
          null,
          'Status'
        ),
        React.createElement(
          IW.Reactors.SelectBox,
          { label: 'Status', onChange: this.handleStatusChange, value: this.state.web.status },
          React.createElement(
            'option',
            { key: 'Planned', value: 'Planned' },
            'Planned'
          ),
          React.createElement(
            'option',
            { key: 'In Progress', value: 'In Progress' },
            'In Progress'
          ),
          React.createElement(
            'option',
            { key: 'Migrated', value: 'Migrated' },
            'Migrated'
          ),
          React.createElement(
            'option',
            { key: 'Canceled', value: 'Canceled' },
            'Canceled'
          )
        ),
        React.createElement(
          'p',
          null,
          'Site owners'
        ),
        React.createElement('input', { type: 'text', name: 'siteOwners', onChange: this.handleSiteOwnersChange, className: 'input', value: this.state.web.siteOwners }),
        React.createElement(
          'p',
          null,
          'Destination URL'
        ),
        React.createElement('input', { type: 'text', name: 'destination', onChange: this.handleDestinationChange, className: 'input', value: this.state.web.destination }),
        React.createElement(
          'div',
          { id: 'updateMigration-setReadOnly' },
          React.createElement(
            'p',
            null,
            'Source set to \'Read Only\''
          ),
          React.createElement('input', { type: 'checkbox', name: 'readOnly', onChange: this.handleReadOnlyChange, className: 'input', checked: this.state.web.readOnly })
        ),
        React.createElement(
          'button',
          { onClick: this.handleSave, className: 'button' },
          'Save'
        )
      )
    );
  }
});