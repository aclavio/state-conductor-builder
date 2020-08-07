import React from 'react';

class NodeEditorForm extends React.Component {
  constructor(props) {
    super(props);
    console.log('in NodeEditorForm constructor');
    const node = props.node;
    this.state = {
      nodeName: node.name || '',
      nodeComment: node.comment || '',
      nodeType: node.type || 'Task',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    const target = e.target;
    const { name, value } = target;
    this.setState({
      [name]: value,
    });
  }

  static getDerivedStateFromProps(props, state) {
    const node = props.node;
    return {
      nodeName: node.name || '',
      nodeComment: node.comment || '',
      nodeType: node.type || 'Task',
    };
  }

  render() {
    const { id, onSubmit } = this.props;
    const types = ['Task', 'Choice', 'Wait', 'Succeed', 'Fail'];

    return (
      <form id={id} onSubmit={(e) => onSubmit(e)} className="nodeEditorForm">
        <div className="form-group">
          <label htmlFor="nodeName">Name</label>
          <input
            name="nodeName"
            type="text"
            placeholder="name"
            value={this.state.nodeName}
            onChange={this.handleInputChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="nodeComment">Comment</label>
          <input
            name="nodeComment"
            type="text"
            placeholder="description"
            value={this.state.nodeComment}
            onChange={this.handleInputChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="nodeType">State Type</label>
          <select
            name="nodeType"
            value={this.state.nodeType}
            onChange={this.handleInputChange}
            className="form-control"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary">Save</button>
      </form>
    );
  }
}

export default NodeEditorForm;
