import React from 'react';
import CytoscapeGraph from './CytoscapeGraph';
import NodeEditorForm from './NodeEditorForm';
import GraphControls from './GraphControls';
import StateMachineList from './StateMachineList';
//import util from './lib/utilities';
import StateMachineDefinition from './StateMachineDefinition';
import Modal from './Modal';
//import $ from 'jquery';
import './stylesheets/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('in App constructor');
    this.cyRef = null;
    this.state = {
      machine: null,
      selectedNode: {
        ref: null,
        id: null,
        name: '',
        comment: '',
        type: 'Task',
        resource: '',
      },
    };

    this.onGraphReady = this.onGraphReady.bind(this);
    this.onSubmitNodeEditor = this.onSubmitNodeEditor.bind(this);
    this.onClickLoadMachine = this.onClickLoadMachine.bind(this);
    this.onLinkNodes = this.onLinkNodes.bind(this);
  }

  onGraphReady() {
    this.loadStateMachine('New State Machine');
  }

  onViewFit() {
    this.cyRef.fit(50);
  }

  loadStateMachine(name, machineJson) {
    // assumes it's safe to load a new machine any previous changes have been saved/discarded
    const cy = this.cyRef;
    const def = new StateMachineDefinition(name, machineJson);
    cy.nodes().remove();
    cy.add(def.getNodes());
    cy.add(def.getEdges());
    this.runLayoutPreset();
    this.setState({
      machine: def,
    });
  }

  newNodeClick(type) {
    const cy = this.cyRef;
    const machine = this.state.machine;
    const stateNames = machine.stateNames();
    const extent = cy.extent();

    let idx = 1;
    let nodeName = `New ${type} ${idx}`;
    while (stateNames.includes(nodeName)) {
      nodeName = `New ${type} ${++idx}`;
    }

    const node = machine.addState(
      nodeName,
      {
        Comment: '',
        Type: type,
      },
      {
        x: extent.x1 + extent.w / 2,
        y: extent.y1 + extent.h / 2,
      }
    );

    if (node) {
      cy.add(node).select();
    }
  }

  removeNodeClick() {
    if (this.state.selectedNode.ref) {
      const name = this.state.selectedNode.ref.data('name');
      const machine = this.state.machine;
      const cy = this.cyRef;
      machine.removeState(name);
      cy.edges().remove();
      cy.nodes().remove();
      cy.add(machine.getNodes());
      cy.add(machine.getEdges());
      this.onUnselectNodes();
      this.cyRef.fit(50);
    }
  }

  onNodPositionChange(node) {
    const machine = this.state.machine;
    console.log('node position changed:', node.data('name'), node.position());
    // machine might not be ready on initial load
    if (machine) {
      machine.setNodePosition(
        node.data('name'),
        node.position().x,
        node.position().y
      );
    }
  }

  updateNodePositions() {
    const cy = this.cyRef;
    const machine = this.state.machine;
    const drawing = cy
      .nodes()
      .filter((node) => !!node.data('name') && node.data('type') !== 'Start')
      .reduce((drawing, node) => {
        const name = node.data('name');
        drawing[name] = {
          x: node.position().x,
          y: node.position().y,
        };
        return drawing;
      }, {});

    machine.updateNodePositions(drawing);
  }

  downloadClick() {
    const machine = this.state.machine;
    this.updateNodePositions();
    const filename = `${machine.name}.asl.json`;
    const json = machine.toJson();
    console.log(json);
    // create a data link anchor element, click it, and then remove it
    var dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(json, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  onPrintClick() {
    const cy = this.cyRef;
    cy.nodes().forEach((elem) => {
      console.log('element:', elem.data('name'), 'pos:', elem.position());
    });
  }

  onLoadFlowClick() {
    const resp = prompt('flow file content:');
    if (resp) {
      const flowFile = JSON.parse(resp);
      this.loadStateMachine('New State Machine', flowFile);
    }
  }

  onSaveChangesModalOk() {
    if (typeof this.state.okAction === 'function') {
      this.state.okAction();
    }
    this.setState({
      showSaveChangesModal: false,
      okAction: null,
      cancelAction: null,
    });
  }

  onSaveChangesModalClose() {
    if (typeof this.state.cancelAction === 'function') {
      this.state.cancelAction();
    }
    this.setState({
      showSaveChangesModal: false,
      okAction: null,
      cancelAction: null,
    });
  }

  runLayoutPreset() {
    this.runLayout({ name: 'preset' });
  }

  runLayoutGrid() {
    this.runLayout({ name: 'grid' });
  }

  runLayoutBreadthFirst() {
    this.runLayout({ name: 'breadthfirst' });
  }

  runLayoutCircle() {
    this.runLayout({ name: 'circle' });
  }

  runLayoutConcentric() {
    this.runLayout({ name: 'concentric' });
  }

  runLayoutCose() {
    this.runLayout({ name: 'cose' });
  }

  runLayout(layout) {
    const cy = this.cyRef;
    cy.layout(layout).run();
    cy.fit(50);
  }

  onSelectNodes(nodes) {
    let curr = Array.isArray(nodes) ? nodes[0] : nodes;
    this.setState({
      selectedNode: {
        ref: curr,
        id: curr.data('id'),
        name: curr.data('name'),
        comment: curr.data('comment'),
        type: curr.data('type'),
      },
    });
  }

  onUnselectNodes() {
    this.setState({
      selectedNode: {
        ref: null,
        id: null,
        name: '',
        comment: '',
        type: 'Task',
        resource: '',
      },
    });
  }

  onAlignHorizatonal() {
    const cy = this.cyRef;
    const selected = cy.elements('node:selected');
    const ys = selected.map((node) => node.position().y);
    const min = Math.min(...ys);
    selected.position({
      y: min,
    });
  }

  onAlignVertical() {
    const cy = this.cyRef;
    const selected = cy.elements('node:selected');
    const xs = selected.map((node) => node.position().x);
    const min = Math.min(...xs);
    selected.position({
      x: min,
    });
  }

  onDropPaletteItem(e) {
    const cy = this.cyRef;
    let type = e.dataTransfer.getData('text/plain');
    let now = new Date();
    cy.add({
      group: 'nodes',
      data: {
        id: now.getTime(),
        name: `New ${type}`,
        comment: '',
        type: type,
      },
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      classes: [type],
    });
  }

  onSubmitNodeEditor(data) {
    console.log(data);
    if (this.state.selectedNode && this.state.selectedNode.ref) {
      const currNode = this.state.selectedNode.ref;
      currNode.data({
        id: data.nodeName,
        name: data.nodeName,
        comment: data.nodeComment,
        type: data.nodeType,
      });
      currNode.classes(data.nodeType);
      this.setState({
        selectedNode: {
          ref: currNode,
          id: currNode.data('id'),
          name: currNode.data('name'),
          comment: currNode.data('comment'),
          type: currNode.data('type'),
        },
      });
    }
  }

  onClickLoadMachine(name, machine) {
    const currMachine = this.state.machine;
    if (currMachine.isDirty()) {
      this.setState({
        showSaveChangesModal: true,
        okAction: () => {
          console.log('ok action!');
          // TODO save
          this.loadStateMachine(name, machine);
        },
        cancelAction: () => {
          // TODO discard changes
          console.log('cancel action!');
          this.loadStateMachine(name, machine);
        },
      });
    } else {
      this.loadStateMachine(name, machine);
    }
  }

  onLinkNodes(start, end) {
    const cy = this.cyRef;
    console.log('linking nodes:', start.data('name'), end.data('name'));
    const machine = this.state.machine;
    const source = machine.getStateByName(start.data('name'));
    if (source) {
      console.log('found source node:', source);
      source.setNext(end.data('name'));
      cy.edges().remove();
      cy.add(machine.getEdges());
      if (start.data('type') === 'Task') {
        start.data('end', false);
      }
    } else {
      console.warn('could not find source node', start);
    }
  }

  render() {
    const hasSelection = !!this.state.selectedNode.ref;
    return (
      <div className="App">
        <header className="App-header container-fluid">
          <h1>State Conductor Builder</h1>
          <StateMachineList handleClick={this.onClickLoadMachine} />
        </header>
        <section className="Graph-Holder">
          <nav className="Graph-Controls container-fluid">
            <GraphControls
              onViewFit={() => this.onViewFit()}
              onAlignHorizatonal={() => this.onAlignHorizatonal()}
              onAlignVertical={() => this.onAlignVertical()}
              loadFlowClick={() => this.onLoadFlowClick()}
              downloadClick={() => this.downloadClick()}
              removeNodeClick={() => this.removeNodeClick()}
              onPrintClick={() => this.onPrintClick()}
              newNodeClick={(type) => this.newNodeClick(type)}
              runLayoutBreadthFirst={() => this.runLayoutBreadthFirst()}
              runLayoutCircle={() => this.runLayoutCircle()}
              runLayoutConcentric={() => this.runLayoutConcentric()}
              runLayoutCose={() => this.runLayoutCose()}
              runLayoutGrid={() => this.runLayoutGrid()}
              runLayoutPreset={() => this.runLayoutPreset()}
            ></GraphControls>
          </nav>
          <div className="Graph-Viewport">
            <CytoscapeGraph
              id="cy"
              cy={(cy) => {
                this.cyRef = cy;
              }}
              onReady={this.onGraphReady}
              onSelectNodes={(nodes) => this.onSelectNodes(nodes)}
              onUnselectNodes={() => this.onUnselectNodes()}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => {
                e.preventDefault();
                //console.log(e.clientX, e.clientY);
              }}
              onDrop={(e) => this.onDropPaletteItem(e)}
              onLinkNodes={this.onLinkNodes}
              onPositionChange={(node) => {
                this.onNodPositionChange(node);
              }}
            ></CytoscapeGraph>
            {hasSelection && (
              <aside className="Graph-Aside container-fluid">
                <NodeEditorForm
                  key={this.state.selectedNode.id}
                  nodeName={this.state.selectedNode.name}
                  nodeComment={this.state.selectedNode.comment}
                  nodeType={this.state.selectedNode.type}
                  stateNames={this.state.machine.stateNames()}
                  onSubmit={this.onSubmitNodeEditor}
                />
              </aside>
            )}
          </div>
        </section>
        <footer className="App-footer container-fluid">footer content</footer>
        <div className="modal-root">
          {this.state.showSaveChangesModal && (
            <Modal
              title="Save Changes"
              okButtonLabel="Save"
              okButtonStyle="btn-success"
              closeButtonLabel="Discard"
              closeButtonStyle="btn-danger"
              onClickOk={() => this.onSaveChangesModalOk()}
              onClickClose={() => this.onSaveChangesModalClose()}
            >
              Save your changes to "{this.state.machine.name}" state machine?
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

export default App;
