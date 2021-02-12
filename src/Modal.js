import React from 'react';
import $ from 'jquery';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.modal = React.createRef();

    this.onClickOk = this.onClickOk.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
  }

  componentDidMount() {
    $(this.modal.current).modal('show');
  }

  onClickOk() {
    $(this.modal.current).modal('hide');
    if (typeof this.props.onClickOk === 'function') {
      this.props.onClickOk();
    }
  }

  onClickClose() {
    $(this.modal.current).modal('hide');
    if (typeof this.props.onClickClose === 'function') {
      this.props.onClickClose();
    }
  }

  render() {
    const {
      title = 'untitled',
      closeButtonLabel = 'Cancel',
      okButtonLabel = 'Ok',
      okButtonStyle = 'btn-primary',
      closeButtonStyle = 'btn-secondary',
    } = this.props;
    return (
      <div
        className="modal fade"
        id="staticBackdrop"
        data-backdrop="static"
        data-keyboard="false"
        tabIndex="-1"
        aria-labelledby="modalLabel"
        aria-hidden="true"
        ref={this.modal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalLabel">
                {title}
              </h5>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={this.onClickClose}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">{this.props.children}</div>
            <div className="modal-footer">
              <button
                type="button"
                className={'btn ' + closeButtonStyle}
                onClick={this.onClickClose}
              >
                {closeButtonLabel}
              </button>
              <button
                type="button"
                className={'btn ' + okButtonStyle}
                onClick={this.onClickOk}
              >
                {okButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
