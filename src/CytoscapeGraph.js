import React from 'react';
import Cytoscape from 'cytoscape';
import './stylesheets/CytoscapeGraph.css';

class CytoscapeGraph extends React.Component {
  constructor(props) {
    super(props);
    console.log('in CytoscapeGraph constructor');
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const cy = (this._cy = new Cytoscape({
      container: this.containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#eee',
            'border-color': '#666',
            'border-width': '1px',
            width: '45',
            height: '45',
            shape: 'rectangle',
            label: 'data(name)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 5,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
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
          selector: '.Task',
          style: {
            shape: 'round-rectangle',
          },
        },
        {
          selector: '.Choice',
          style: {
            shape: 'diamond',
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
          },
        },
        {
          selector: '.Fail',
          style: {
            shape: 'round-triangle',
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#f00',
            'border-width': '2px',
          },
        },
      ],
      layout: {
        name: 'grid',
        rows: 2,
      },
      zoom: 1,
      minZoom: 0.5,
      maxZoom: 50,
    }));

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
