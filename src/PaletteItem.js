import React from 'react';
import './stylesheets/PaletteItem.css';

class PaletteItem extends React.Component {
  constructor(props) {
    super(props);
    this.onDragPaletteItem = this.onDragPaletteItem.bind(this);
  }

  onDragPaletteItem(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
  }

  render() {
    let className = `palette${this.props.type}`;
    return (
      <button
        data-type={this.props.type}
        className={`paletteItem btn btn-outline-secondary ${className}`}
        draggable="true"
        onDragStart={this.onDragPaletteItem}
        title={this.props.type}
      />
    );
  }
}

export default PaletteItem;
