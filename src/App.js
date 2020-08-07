import React from 'react';
import CytoscapeGraph from './CytoscapeGraph';
import NodeEditorForm from './NodeEditorForm';
import PaletteItem from './PaletteItem';
import './stylesheets/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('in App constructor');
    this.cyRef = null;
    this.cmbLayout = React.createRef();
    this.state = {
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
  }

  addNodeClick(e) {
    const cy = this.cyRef;
    cy.add({
      group: 'nodes',
      data: {
        id: new Date().getTime(),
        name: 'new',
        comment: '',
        type: 'Task',
        resource: '',
      },
      classes: ['Task'],
    });
    cy.fit();
  }

  removeNodeClick(e) {
    if (this.state.selectedNode.ref) {
      this.state.selectedNode.ref.remove();
      this.onUnselectNodes();
      this.cyRef.fit();
    }
  }

  onPrintClick(e) {
    const cy = this.cyRef;
    cy.nodes().forEach((elem) => {
      console.log('element:', elem.data('name'), 'pos:', elem.position());
    });
  }

  parseFlowFile(input) {
    let nodes = [];
    let edges = [];
    let catches = [];
    let drawing = Object.assign({}, input.mlDomain.drawing);
    nodes.push({
      data: {
        id: 'START',
        name: 'START',
      },
      position: { x: 10, y: 10 },
      locked: true,
    });
    edges.push({
      data: {
        id: `START-${input.StartAt}`,
        source: 'START',
        target: input.StartAt,
      },
    });
    if (input.States) {
      let stateNames = Object.keys(input.States);
      stateNames.forEach((stateName) => {
        let state = input.States[stateName];
        nodes.push({
          data: {
            id: stateName,
            name: stateName,
            comment: state.Comment,
            type: state.Type,
          },
          position: drawing[stateName] || { x: 20, y: 20 },
          classes: [state.Type],
        });

        if (state.Catch) {
          state.Catch.forEach((catche) => {
            catches.push({
              data: {
                id: `${stateName}-${catche.Next}`,
                source: stateName,
                target: catche.Next,
              },
              classes: ['error'],
            });
          });
        }

        if ('Task' === state.Type) {
          if (!state.End) {
            edges.push({
              data: {
                id: `${stateName}-${state.Next}`,
                source: stateName,
                target: state.Next,
              },
            });
          }
        } else if ('Choice' === state.Type) {
          if (state.Default) {
            edges.push({
              data: {
                id: `${stateName}-${state.Default}`,
                source: stateName,
                target: state.Default,
              },
            });
          }
          state.Choices.forEach((choice) => {
            edges.push({
              data: {
                id: `${stateName}-${choice.Next}`,
                source: stateName,
                target: choice.Next,
              },
            });
          });
        } else if ('Wait' === state.Type) {
          edges.push({
            data: {
              id: `${stateName}-${state.Next}`,
              source: stateName,
              target: state.Next,
            },
          });
        }
      });
    }
    return {
      nodes,
      edges,
      catches,
    };
  }

  loadFlowClick() {
    const resp = prompt('flow file content:');
    if (resp) {
      const cy = this.cyRef;
      const flowFile = JSON.parse(resp);
      const elements = this.parseFlowFile(flowFile);
      cy.nodes().remove();
      cy.add(elements.nodes);
      cy.add(elements.catches);
      cy.add(elements.edges);
      this.runLayoutClick();
    }
  }

  runLayoutClick() {
    const cy = this.cyRef;
    const layout = this.cmbLayout.current.value;
    cy.layout({ name: layout }).run();
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

  render() {
    const hasSelection = !!this.state.selectedNode.ref;
    return (
      <div className="App">
        <header className="App-header container-fluid">
          <h1>State Conductor Builder</h1>
        </header>
        <section className="Graph-Holder">
          <nav className="Graph-Controls container-fluid">
            <div className="btn-toolbar">
              <div className="btn-group btn-group-sm mr-2">
                <PaletteItem type="Task" />
                <PaletteItem type="Choice" />
                <PaletteItem type="Wait" />
                <PaletteItem type="Succeed" />
                <PaletteItem type="Fail" />
              </div>
            </div>
            <div className="btn-toolbar">
              <div className="btn-group btn-group-sm mr-2">
                <button
                  id="btnAddNode"
                  onClick={(e) => this.addNodeClick(e)}
                  className="btn btn-outline-secondary"
                >
                  New Node
                </button>
                <button
                  id="btnRemoveNode"
                  onClick={(e) => this.removeNodeClick(e)}
                  className="btn btn-outline-secondary"
                >
                  Remove
                </button>
                <button
                  id="btnPrint"
                  onClick={(e) => this.onPrintClick(e)}
                  className="btn btn-outline-secondary"
                >
                  Print
                </button>
              </div>
              <div className="input-group input-group-sm mr-2">
                <select
                  id="cmbLayout"
                  ref={this.cmbLayout}
                  className="form-control"
                >
                  <option value="grid">Grid</option>
                  <option value="breadthfirst">Breadth-First</option>
                  <option value="preset">Preset</option>
                  <option value="circle">Circle</option>
                  <option value="concentric">Concentric</option>
                  <option value="cose">Cose</option>
                </select>
                <div className="input-group-append">
                  <button
                    id="btnRunLayout"
                    onClick={(e) => this.runLayoutClick(e)}
                    className="btn btn-outline-secondary"
                  >
                    Run
                  </button>
                </div>
              </div>
              <div className="btn-group btn-group-sm mr-2">
                <button
                  onClick={(e) => this.onAlignHorizatonal(e)}
                  className="btn btn-outline-secondary"
                >
                  Align Horizontal
                </button>
                <button
                  onClick={(e) => this.onAlignVertical(e)}
                  className="btn btn-outline-secondary"
                >
                  Align Vertical
                </button>
              </div>
              <div className="btn-group btn-group-sm mr-2">
                <button
                  onClick={(e) => this.loadFlowClick(e)}
                  className="btn btn-outline-secondary"
                >
                  Load Flow
                </button>
              </div>
            </div>
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
