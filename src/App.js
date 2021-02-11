import React from 'react';
import CytoscapeGraph from './CytoscapeGraph';
import NodeEditorForm from './NodeEditorForm';
import GraphControls from './GraphControls';
import StateMachineList from './StateMachineList';
import util from './lib/utilities';
import StateMachineDefinition from './StateMachineDefinition';
import './stylesheets/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('in App constructor');
    this.cyRef = null;
    this.cmbLayout = React.createRef();
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

    this.onSubmitNodeEditor = this.onSubmitNodeEditor.bind(this);
    this.onClickLoadMachine = this.onClickLoadMachine.bind(this);
    this.onLinkNodes = this.onLinkNodes.bind(this);
  }

  newNodeClick(type) {
    const cy = this.cyRef;
    const extent = cy.extent();
    let now = new Date();
    let node = {
      group: 'nodes',
      data: {
        id: now.getTime(),
        name: `New ${type}`,
        comment: '',
        type: type,
      },
      position: {
        x: extent.x1 + extent.w / 2,
        y: extent.y1 + extent.h / 2,
      },
      classes: [type],
    };
    cy.add(node);
  }

  removeNodeClick() {
    if (this.state.selectedNode.ref) {
      this.state.selectedNode.ref.remove();
      this.onUnselectNodes();
      this.cyRef.fit();
    }
  }

  onPrintClick() {
    const cy = this.cyRef;
    cy.nodes().forEach((elem) => {
      console.log('element:', elem.data('name'), 'pos:', elem.position());
    });
  }

  loadFlowClick() {
    const resp = prompt('flow file content:');
    if (resp) {
      const cy = this.cyRef;
      const flowFile = JSON.parse(resp);
      const elements = util.parseFlowFile(flowFile);
      const def = new StateMachineDefinition('test', flowFile);
      console.log(def.stateNames());
      console.log(def.toJson());
      cy.nodes().remove();
      //cy.add(elements.nodes);
      cy.add(def.getNodes());
      cy.add(def.getEdges());
      //cy.add(elements.catches);
      //cy.add(elements.edges);
      this.runLayoutPreset();
      this.setState({
        machine: def,
      });
    }
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

  onClickLoadMachine(machine) {
    const cy = this.cyRef;
    const elements = util.parseFlowFile(machine);
    const def = new StateMachineDefinition('test', machine);
    cy.nodes().remove();
    cy.add(def.getNodes());
    cy.add(def.getEdges());
    //cy.add(elements.nodes);
    //cy.add(elements.catches);
    //cy.add(elements.edges);
    this.runLayoutPreset();
    this.setState({
      machine: def,
    });
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
              onAlignHorizatonal={() => this.onAlignHorizatonal()}
              onAlignVertical={() => this.onAlignVertical()}
              loadFlowClick={() => this.loadFlowClick()}
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
              onSelectNodes={(nodes) => this.onSelectNodes(nodes)}
              onUnselectNodes={() => this.onUnselectNodes()}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => {
                e.preventDefault();
                //console.log(e.clientX, e.clientY);
              }}
              onDrop={(e) => this.onDropPaletteItem(e)}
              onLinkNodes={this.onLinkNodes}
            ></CytoscapeGraph>
            {hasSelection && (
              <aside className="Graph-Aside container-fluid">
                <NodeEditorForm
                  key={this.state.selectedNode.id}
                  nodeName={this.state.selectedNode.name}
                  nodeComment={this.state.selectedNode.comment}
                  nodeType={this.state.selectedNode.type}
                  onSubmit={this.onSubmitNodeEditor}
                />
              </aside>
            )}
          </div>
        </section>
        <footer className="App-footer container-fluid">footer content</footer>
      </div>
    );
  }
}

export default App;
