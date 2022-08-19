import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { LABEL_CLOSE } from '../common/constants';


export default class ModalWindow extends Component {

    static propTypes = {
        show: PropTypes.bool.isRequired
    }
    handleClose = () => {
        this.props.parent.setModalShow(false);
    };
    handleShow = () => {
        this.props.parent.setModalShow(true);
    };

    render() {
        return (<React.Fragment>
            <Modal show={this.props.show} onHide={this.props.cancel_callback ? this.props.cancel_callback : this.handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.modal_title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.message}</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={this.props.cancel_callback ? this.props.cancel_callback : this.handleClose}>
                        {LABEL_CLOSE}
                    </Button>
                    {
                        this.props.btn_count > 1 &&
                            (<Button variant={this.props.btn_color}
                                onClick={() => this.props.confirm_callback(this.props.parameter ? this.props.parameter : null)}>
                                {this.props.btn_name}
                            </Button>)
                    }
                </Modal.Footer>
            </Modal>
        </React.Fragment>);
    }
}
