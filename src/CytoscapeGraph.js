import React from 'react';
import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import './stylesheets/CytoscapeGraph.css';

class CytoscapeGraph extends React.Component {
  constructor(props) {
    super(props);
    console.log('in CytoscapeGraph constructor');
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    Cytoscape.use(edgehandles);
    const cy = (this._cy = new Cytoscape({
      container: this.containerRef.current,
      elements: [],
      style: [
        {
          //selector: 'node',
          selector: '[name]',
          style: {
            'background-color': '#fff',
            'border-color': '#555',
            'border-width': '1px',
            'text-valign': 'center',
            width: 'label',
            height: 'label',
            padding: '15px',
            shape: 'rectangle',
            label: 'data(name)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 5,
            'line-color': '#bbb',
            'target-arrow-color': '#bbb',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            //'curve-style': 'taxi',
          },
        },
        {
          selector: 'edge.error',
          style: {
            'line-color': '#fcc',
            'target-arrow-color': '#fcc',
          },
        },
        {
          selector: '.Start',
          style: {
            shape: 'rectangle',
            'background-color': '#88aadd',
          },
        },
        {
          selector: '.Task',
          style: {
            shape: 'round-rectangle',
          },
        },
        {
          selector: '.Task[?end]',
          style: {
            'background-color': '#88cc88',
          },
        },
        {
          selector: '.Choice',
          style: {
            shape: 'cut-rectangle',
          },
        },
        {
          selector: '.Wait',
          style: {
            shape: 'octagon',
          },
        },
        {
          selector: '.Succeed',
          style: {
            shape: 'ellipse',
            'background-color': '#88cc88',
          },
        },
        {
          selector: '.Fail',
          style: {
            //shape: 'round-triangle',
            shape: 'hexagon',
            'background-color': '#dd8888',
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#f00',
            'border-width': '2px',
          },
        },
        /* edgehandle extenstion styles */
        {
          selector: '.eh-handle',
          style: {
            'background-color': 'red',
            width: 12,
            height: 12,
            shape: 'ellipse',
            'overlay-opacity': 0,
            'border-width': 12, // makes the handle easier to hit
            'border-opacity': 0,
          },
        },
        {
          selector: '.eh-hover',
          style: {
            'background-color': 'red',
          },
        },
        {
          selector: '.eh-source',
          style: {
            'border-width': 2,
            'border-color': 'red',
          },
        },
        {
          selector: '.eh-target',
          style: {
            'border-width': 2,
            'border-color': 'red',
          },
        },
        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'source-arrow-color': 'red',
          },
        },
        {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            opacity: 0,
          },
        },
      ],
      layout: {
        //name: 'grid',
        //rows: 2,
        name: 'preset',
      },
      zoom: 1,
      minZoom: 0.5,
      maxZoom: 10,
    }));

    cy.edgehandles({
      snap: true,
      handleNodes: '[type="Task"],[type="Wait"],[type="Choice"],[type="Start"]',
      handlePosition: function (node) {
        return 'middle bottom';
      },
      complete: (sourceNode, targetNode) => {
        console.log('new edge:', sourceNode, targetNode);
        if (typeof this.props.onLinkNodes === 'function') {
          this.props.onLinkNodes(sourceNode, targetNode);
        }
      },
      edgeType: (sourceNode, targetNode) => {
        // disallow linking to the 'start' node
        return targetNode.data('name') === 'START' ? null : 'flat';
      },
    });

    if (typeof this.props.cy === 'function') {
      this.props.cy(cy);
    }

    cy.on('select', 'node', (evt) => {
      if (!evt.target.locked()) {
        if (typeof this.props.onSelectNodes === 'function') {
          this.props.onSelectNodes(evt.target);
        }
      }
    });

    cy.on('unselect', 'node', (evt) => {
      if (typeof this.props.onUnselectNodes === 'function') {
        this.props.onUnselectNodes();
      }
    });

    cy.on('position', '[name]', (evt) => {
      if (typeof this.props.onPositionChange === 'function') {
        this.props.onPositionChange(evt.target);
      }
    });

    cy.ready((evt) => {
      if (typeof this.props.onReady === 'function') {
        this.props.onReady();
      }
    });
  }

  componentWillUnmount() {
    this._cy.destroy();
  }

  render() {
    const {
      id,
      className,
      style,
      onDragEnter,
      onDragOver,
      onDrop,
    } = this.props;
    return React.createElement('div', {
      id,
      className,
      style,
      ref: this.containerRef,
      onDragOver,
      onDragEnter,
      onDrop,
    });
  }
}

export default CytoscapeGraph;
