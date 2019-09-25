var IW = IW || {};
IW.Reactors = IW.Reactors || {};

IW.Reactors.LabelBox = React.createClass({
  getInitialState: function () {
    return {
      destination: this.props.data.destination // seeding initial state from prop
    };
  },
  render: function () {
    return React.createElement(
      "div",
      { className: "labelBox" },
      React.createElement(
        "p",
        null,
        this.props.data.itemcount,
        " items (including items in subsites)"
      ),
      React.createElement(
        "p",
        null,
        "WebID: ",
        this.props.data.webid
      ),
      React.createElement(
        "p",
        null,
        "Last modified: ",
        this.props.data.lastmodified
      ),
      React.createElement(
        "p",
        null,
        "Source: ",
        React.createElement(
          "a",
          { target: "_blank", href: this.props.data.url },
          this.props.data.url
        )
      ),
      React.createElement(
        "p",
        null,
        "Destination: ",
        React.createElement(
          "a",
          { target: "_blank", href: this.state.destination },
          this.state.destination
        )
      )
    );
  }
});