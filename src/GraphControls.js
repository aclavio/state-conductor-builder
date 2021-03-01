import React from 'react';

class GraphControls extends React.Component {
  render() {
    const {
      className,
      onViewFit,
      newNodeClick,
      removeNodeClick,
      onPrintClick,
      runLayoutPreset,
      runLayoutGrid,
      runLayoutBreadthFirst,
      runLayoutCircle,
      runLayoutConcentric,
      runLayoutCose,
      onAlignHorizatonal,
      onAlignVertical,
      loadFlowClick,
      downloadClick,
    } = this.props;
    return (
      <div className={['btn-toolbar', className].join(' ')}>
        <div className="btn-group btn-group-sm mr-2">
          <div className="btn-group btn-group-sm dropdown">
            <button
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              File
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" type="button">
                New
              </button>
              <button className="dropdown-item" type="button">
                Load
              </button>
              <button className="dropdown-item" type="button">
                Save
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={downloadClick}
              >
                Download
              </button>
            </div>
          </div>
        </div>
        <div className="btn-group btn-group-sm mr-2">
          <div className="btn-group btn-group-sm dropdown">
            <button
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              New Node
            </button>
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                type="button"
                onClick={() => newNodeClick('Task')}
              >
                Task
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => newNodeClick('Choice')}
              >
                Choice
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => newNodeClick('Wait')}
              >
                Wait
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => newNodeClick('Succeed')}
              >
                Succeed
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => newNodeClick('Fail')}
              >
                Fail
              </button>
            </div>
          </div>
          <button
            id="btnRemoveNode"
            onClick={removeNodeClick}
            className="btn btn-outline-secondary"
          >
            Remove
          </button>
          <button
            id="btnPrint"
            onClick={onPrintClick}
            className="btn btn-outline-secondary"
          >
            Print
          </button>
        </div>
        <div className="btn-group btn-group-sm mr-2">
          <div className="btn-group btn-group-sm dropdown">
            <button
              id="btnLayout"
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Layout
            </button>
            <div className="dropdown-menu" aria-labelledby="btnLayout">
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutPreset}
              >
                Preset
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutGrid}
              >
                Grid
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutBreadthFirst}
              >
                Breadth-First
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutCircle}
              >
                Circle
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutConcentric}
              >
                Concentric
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={runLayoutCose}
              >
                Cose
              </button>
            </div>
          </div>
        </div>
        <div className="btn-group btn-group-sm mr-2">
          <button
            onClick={onAlignHorizatonal}
            className="btn btn-outline-secondary"
          >
            Align Horizontal
          </button>
          <button
            onClick={onAlignVertical}
            className="btn btn-outline-secondary"
          >
            Align Vertical
          </button>
        </div>
        <div className="btn-group btn-group-sm mr-2">
          <button onClick={loadFlowClick} className="btn btn-outline-secondary">
            Load Flow
          </button>
        </div>
        <div className="btn-group btn-group-sm mr-2">
          <button onClick={onViewFit} className="btn btn-outline-secondary">
            View Fit
          </button>
        </div>
      </div>
    );
  }
}

export default GraphControls;
