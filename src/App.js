import React from 'react';
import CytoscapeGraph from './CytoscapeGraph';
import NodeEditorForm from './NodeEditorForm';
import './stylesheets/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('in App constructor');
    this.cyRef = null;
    this.cmbLayout = React.createRef();
    this.txtFlowFile = React.createRef();
    this.state = {
      selectedNode: {
        ref: null,
        id: null,
        name: '',
        comment: '',
        type: 'Task',
      },
    };
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

        if (state.Catch) {
          state.Catch.forEach((catches) => {
            edges.push({
              data: {
                id: `${stateName}-${catches.Next}`,
                source: stateName,
                target: catches.Next,
              },
              classes: ['error'],
            });
          });
        }
      });
    }
    return {
      nodes,
      edges,
    };
  }

  loadFlowClick(e) {
    e.preventDefault();
    const cy = this.cyRef;
    const txtFlowFile = this.txtFlowFile.current;
    let flowFile = JSON.parse(txtFlowFile.value);
    const elements = this.parseFlowFile(flowFile);
    cy.nodes().remove();
    cy.add(elements.nodes);
    cy.add(elements.edges);
    cy.fit();
  }

  runLayoutClick(e) {
    const cy = this.cyRef;
    const layout = this.cmbLayout.current.value;
    cy.layout({ name: layout }).run();
    cy.fit();
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

  onDragPaletteItem(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
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
      },
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      classes: [type],
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header container-fluid">
          <h1>State Conductor Builder</h1>
        </header>
        <section className="Graph-Holder">
          <nav className="Graph-Controls container-fluid">
            <div className="StatePalette">
              <label
                id="paletteTask"
                data-type="Task"
                className="paletteItem"
                draggable="true"
                onDragStart={(e) => this.onDragPaletteItem(e)}
              >
                <svg>
                  <rect
                    x="6"
                    y="6"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    stroke="green"
                    strokeWidth="1"
                    fill="yellow"
                  />
                </svg>
              </label>
              <label
                id="paletteChoice"
                data-type="Choice"
                className="paletteItem"
                draggable="true"
                onDragStart={(e) => this.onDragPaletteItem(e)}
              >
                <svg>
                  <rect
                    x="0"
                    y="0"
                    width="16"
                    height="16"
                    stroke="green"
                    strokeWidth="1"
                    fill="yellow"
                    transform="translate(16, 6) rotate(45)"
                  />
                </svg>
              </label>
              <label
                id="paletteWait"
                data-type="Wait"
                className="paletteItem"
                draggable="true"
                onDragStart={(e) => this.onDragPaletteItem(e)}
              >
                <svg>
                  <polygon
                    points="25,2.5 50,2.5 62.5,15 62.5,40 50,52.5 25,52.5 12.5,40 12.5,15"
                    stroke="green"
                    strokeWidth="2"
                    fill="yellow"
                    transform="translate(0, 5) scale(0.4)"
                  />
                </svg>
              </label>
              <label
                id="paletteSucceed"
                data-type="Succeed"
                className="paletteItem"
                draggable="true"
                onDragStart={(e) => this.onDragPaletteItem(e)}
              >
                <svg>
                  <circle
                    cx="16"
                    cy="16"
                    r="10"
                    stroke="green"
                    strokeWidth="1"
                    fill="yellow"
                  />
                </svg>
              </label>
              <label
                id="paletteFail"
                data-type="Fail"
                className="paletteItem"
                draggable="true"
                onDragStart={(e) => this.onDragPaletteItem(e)}
              >
                <svg>
                  <polygon
                    x="5"
                    y="5"
                    points="15,5 5,25 25,25 15,5"
                    stroke="green"
                    strokeWidth="1"
                    fill="yellow"
                  />
                </svg>
              </label>
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
            <aside className="Graph-Aside container-fluid">
              <NodeEditorForm
                //key={this.state.selectedNode.id}
                node={this.state.selectedNode}
              />
              <form>
                <div>
                  <textarea
                    id="txtInput"
                    placeholder="Flow"
                    ref={this.txtFlowFile}
                  ></textarea>
                  <button id="btnLoad" onClick={(e) => this.loadFlowClick(e)}>
                    Load
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </section>
        <footer className="App-footer container-fluid">footer content</footer>
      </div>
    );
  }
}

export default App;
