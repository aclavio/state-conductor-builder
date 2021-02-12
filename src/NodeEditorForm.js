import React from 'react';

class NodeEditorForm extends React.Component {
  constructor(props) {
    super(props);
    console.log('in NodeEditorForm constructor');
    this.state = {
      nodeName: props.nodeName,
      nodeComment: props.nodeComment,
      nodeType: props.nodeType,
      nodeNext: props.nodeNext,
      nodeResource: props.nodeResource,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('in handleSubmit', this.state);
    if (typeof this.props.onSubmit === 'function') {
      this.props.onSubmit(Object.assign({}, this.state));
    }
  }

  handleInputChange(name, e) {
    const target = e.target;
    const { value } = target;
    this.setState({
      [name]: value,
    });
  }

  render() {
    const { className, stateNames = [] } = this.props;
    const types = ['Task', 'Choice', 'Wait', 'Succeed', 'Fail'];
    const bools = ['true', 'false'];

    const filteredStateNames = stateNames.filter((name) => {
      return name !== 'START';
    });
    filteredStateNames.unshift('');

    return (
      <form className={className} onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="nodeName">Name</label>
          <input
            type="text"
            placeholder="name"
            value={this.state.nodeName}
            onChange={(e) => this.handleInputChange('nodeName', e)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="nodeComment">Comment</label>
          <textarea
            placeholder="comment"
            value={this.state.nodeComment}
            onChange={(e) => this.handleInputChange('nodeComment', e)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="nodeType">State Type</label>
          <select
            value={this.state.nodeType}
            onChange={(e) => this.handleInputChange('nodeType', e)}
            className="form-control"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {this.state.nodeType === 'Task' && (
          <div className="card form-group">
            <div className="card-body">
              <h6 className="card-title">Task Properties</h6>
              <div className="form-group">
                <label htmlFor="nodeResource">Resource</label>
                <input
                  type="text"
                  placeholder="resource"
                  value={this.state.nodeResource}
                  onChange={(e) => this.handleInputChange('nodeResource', e)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="nodeEnd">End</label>
                <select className="form-control">
                  {bools.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="nodeNext">Next</label>
                <select
                  value={this.state.nodeNext}
                  onChange={(e) => this.handleInputChange('nodeNext', e)}
                  className="form-control"
                >
                  {filteredStateNames.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        <input type="submit" value="Save" className="btn btn-primary" />
      </form>
    );
  }
}

export default NodeEditorForm;
