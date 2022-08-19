import React, { Component } from 'react';
import $ from 'jquery';
import Header from '../common/header';
import Footer from '../common/footer';
import * as common from '../common/common';
import * as constants from '../common/constants';
import { Link } from 'react-router-dom';

export default class Index extends Component {
    
    state = {
        permission: null
    }
    async componentDidMount() {
        //タイトル設定
        $('[name="title"]').html(constants.TOP_TITLE);
        //ユーザーグループ取得
        let user_groups = await common.getUserGroups();
        if (user_groups) {
            let user_group = user_groups[0];
            switch (user_group) {
                case constants.OWNER_PERMISSION:
                case constants.ADMIN_PERMISSION:
                    this.setState({ permission: user_group });
                    break;
                default:
                    this.setState({ permission: null });
                    break;
            }
        } else {
            this.setState({ permission: null });
        }
    }

    render() {
        return (
            <React.Fragment>
                <Header {...this.state}/>
                <div className='container' id='id_content_container'>
                    <br />
                    {/* 主コンテンツの説明とナビゲーション*/}
                    <div className='row mt-2'>
                        <div className='col-md-3 col-xl-4'>
                            <div className='card m-1'>
                                <div className='card-body d-flex flex-column'>
                                    <p className='h5 card-title text-center'>{constants.ESCROW_DATA_TITLE}</p>
                                    <div className='text-center'>
                                        <i className='fas fa-university text-center iconstyle'></i></div>
                                    <p className='my-1 flex-fill fontsize'>本サービスに預託しているデータを管理します。</p>
                                    <Link to={{ pathname: constants.DATA_LIST_PATH, state: { referrer: constants.TOP_PATH } }}
                                        className='btn btn-primary btn-block'>
                                        <span>預託データを確認する</span>
                                        <i className='fas fa-chevron-right ml-2'></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {
                            //会員権限または管理者権限の場合表示する
                            (!this.state.permission || this.state.permission === constants.ADMIN_PERMISSION)&&
                                (<div className='col-md-3 col-xl-4'>
                                    <div className='card m-1'>
                                        <div className='card-body d-flex flex-column'>
                                            <p className='h5 card-title text-center'>{constants.DATA_ADD_TITLE}</p>
                                            <div className='text-center'>
                                                <i className='fas fa-database text-center iconstyle'></i></div>
                                            <p className='my-1 flex-fill fontsize'>本サービスにデータを登録します。</p>
                                            <Link to={{ pathname: constants.DATA_OPERATION_PATH, state: { referrer: constants.TOP_PATH } }}
                                                className='btn btn-primary btn-block'>
                                                <span>データを登録する</span>
                                                <i className='fas fa-chevron-right ml-2'></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>)
                        }
                    </div>
                    <br />
                </div>
                <Footer />
            </React.Fragment>
        );
    }
}