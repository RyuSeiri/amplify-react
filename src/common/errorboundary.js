import React, { Component } from 'react';
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        //エラー情報を出力する
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // エラー発生するUI
            return (<React.Fragment>
                <div className='container'><h2 >予期せぬエラーが発生しました。</h2></div>
            </React.Fragment>);
        }

        return this.props.children;
    }
}