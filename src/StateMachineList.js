import React from 'react';

class StateMachineList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      names: [],
      machines: {},
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    fetch('/api/state-machines')
      .then((resp) => resp.json())
      .then((machines) => {
        let names = Object.keys(machines);
        this.setState({
          names: names,
          machines: machines,
        });
      });
  }

  handleClick(name) {
    if (typeof this.props.handleClick === 'function') {
      const machine = this.state.machines[name];
      this.props.handleClick(name, machine);
    }
  }

  render() {
    return (
      <ul>
        {this.state.names.map((name) => (
          <li key={name} onClick={() => this.handleClick(name)}>
            {name}
          </li>
        ))}
      </ul>
    );
  }
}

export default StateMachineList;
