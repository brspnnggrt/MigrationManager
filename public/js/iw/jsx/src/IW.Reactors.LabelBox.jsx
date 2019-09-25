var IW = IW || {};
IW.Reactors = IW.Reactors || {};

IW.Reactors.LabelBox = React.createClass({
  getInitialState: function() {
    return {
      destination: this.props.data.destination // seeding initial state from prop
    }
  },
  render: function() {
    return (
      <div className="labelBox">
        <p>{this.props.data.itemcount} items (including items in subsites)</p>
        <p>WebID: {this.props.data.webid}</p>
        <p>Last modified: {this.props.data.lastmodified}</p>
        <p>Source: <a target="_blank" href={this.props.data.url}>{this.props.data.url}</a></p>
        <p>Destination: <a target="_blank" href={this.state.destination}>{this.state.destination}</a></p>
      </div>
    );
  }
});