import React, { Component } from 'react'

export default class Footer extends Component {

    render() {
        return (
            <div className='container'>
                <div className='row mt-2'>
                    <div className='col-12 text-right bg-light text_menu_style'>
                        <span className='text-muted'>&copy; 2022 </span>
                        <span className='text-muted'>XXXX Solutions Corporation</span>
                    </div>
                </div>
            </div>
        );
    }
}