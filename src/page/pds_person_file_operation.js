import $ from 'jquery';
import React, { Component } from 'react';
import Header from '../common/header';
import Footer from '../common/footer';
import * as common from '../common/common';
import * as constants from '../common/constants';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import ModalWindow from '../common/modalwindow';

//レコードID
var glv_pdl_id = null;
//編集フラグ
var glv_pdl_editor_flg = false;
//初期化の数値
var glv_pdl_initdata = {};
export default class PersonFileOperation extends Component {

    state = {
        permission: null,
        backflg: true,
        show: false,
        btn_name: '',
        btn_color: 'success',
        modal_title: 'メッセージ',
        message: '',
        btn_count: 2,
        cancel_callback: null,
        confirm_callback: () => { },
        parameter: null,
        initdata: {

        },
        history: this.props.history
    };

    async componentDidMount() {
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
        //データ元権限を持てるユーザー場合、この画面に遷移できない、トップ画面に戻る
        if(this.state.permission === constants.OWNER_PERMISSION){
            this.props.history.push(constants.TOP_PATH);
            return;
        }
        //レコードID
        try{
            glv_pdl_id = this.props.location.state.id;
        }catch(e){
            glv_pdl_id = null;
        }
        //編集フラグ
        try{
            glv_pdl_editor_flg = this.props.location.state.editor;
        }catch(e){
            glv_pdl_editor_flg = false;
        }

        let state;
        if(glv_pdl_editor_flg){
            state = Object.assign({}, this.props.history.location.state,
                                            { referrer: constants.DATA_LIST_PATH });
        }else{
            state = Object.assign({}, this.props.history.location.state,
                                            { referrer: constants.TOP_PATH });
        }
        this.props.history.push({ state: state });

        if (!glv_pdl_id) {//レコードIDがない場合
            this.props.history.push(constants.TOP_PATH);
        } else {
            let result;
            try {
                result = await common.executGraphql(queries.getPds, { id: glv_pdl_id });
            } catch (e) {
                common.log().debug(e);
                result = e;
            }

            if (result.errors && result.errors.length > 0) {//エラーの場合
                this.errorModal(result.errors.message);
            } else {
                for (let key in result.data) {
                    glv_pdl_initdata = result.data[key];
                    this.setState({
                        initdata: glv_pdl_initdata
                    });
                }
                if (glv_pdl_initdata) {
                    if (glv_pdl_editor_flg) {
                        $('[name=title]').html(constants.FILE_EDITOR_TITLE);
                    } else {
                        $('[name=title]').html(constants.FILE_ADD_TITLE);
                    }
                } else {
                    this.props.history.push(constants.TOP_PATH);
                }
            }
        }
    }

    //セッションストレージ更新
    sessionDataUpdate = (result) => {
        let datas = common.session.get(constants.SESSION_STOREGE_DATAS);
        for (let i in datas) {
            if (datas[i].id === result.id) {
                datas[i] = result;
                break;
            }
        }
        common.session.set(constants.SESSION_STOREGE_DATAS, datas);
    }

    //データ登録・更新ポップアップ
    fileChangeModal = async (event) => {
        //戻る時キャンセル
        let file = event.target.files[0];
        //選択ファイルをクリア
        event.target.value = '';
        let file_name;
        try {
            file_name = file.name;
        } catch (e) {
            common.log().error(e);
            this.errorModal(constants.RETRY_MSG);
            return;
        }
        if(!file_name){
            this.errorModal(constants.NO_FILE_NAME_MSG);
            return;
        }else{
            let index = file_name.lastIndexOf('.');
            let data_name = file_name.substring(0, index);
            if(!data_name){
                this.errorModal(constants.NO_FILE_NAME_MSG);
                return;
            }
        }
        let path = glv_pdl_id + '/' + file_name;
        let full_path = constants.AUTH_LEVEL + '/'
            + common.getIdentityProviders()
            + '/' + path;
        let list = await common.fileList(path);

        let exist_flg = false;//ファイル存在フラグ
        this.setState({
            message: constants.FILE_ADD_MSG,
            btn_name: constants.ADD_CONFIRM_BUTTON
        });

        for (let key in list) {
            if (list[key].key === path) {//ファイル存在チェック
                exist_flg = true;
                this.setState({
                    message: constants.FILE_UPDATE_MSG,
                    btn_name: constants.UPDATA_CONFIRM_BUTTON
                });
                break;
            }
        }
        let tmp = glv_pdl_initdata;
        delete tmp['updatedAt'];//更新日付を削除
        this.setState({
            btn_count: 2,
            btn_color: 'success',
            parameter: [tmp.id, file],
            confirm_callback: async (parameter) => {//データ登録または更新処理
                //ファイルの拡張子を取得する
                let index = file_name.lastIndexOf('.');
                let data_name = file_name.substring(0, index);
                let data_type = file_name.substring(index + 1);
                if (!exist_flg) {//ファイル存在する場合DynamoDB側詳細データを更新しない
                    if(Array.isArray(tmp.detail_datas))
                        tmp.detail_datas.push({
                            data_name: data_name,
                            data_type: data_type,
                            url: full_path
                        });
                    else
                       tmp.detail_datas = [{
                            data_name: data_name,
                            data_type: data_type,
                            url: full_path
                        }];
                }
                let result;
                try {
                    result = await common.executGraphql(mutations.updatePds, {
                        input: tmp
                    });
                    try {
                        await common.fileUploadByFile(parameter[0], parameter[1]);
                        this.setState({ initdata: tmp });
                    } catch (e) {
                        common.log().error(e);
                        tmp.detail_datas.splice(tmp.detail_datas.length - 1, 1);
                        await common.executGraphql(mutations.updatePds, {
                            input: tmp
                        });
                        result = e;
                    }
                } catch (e) {
                    common.log().error(e);
                    tmp.detail_datas.splice(tmp.detail_datas.length - 1, 1);
                    result = e;
                }
                if (result && result['errors'] && result.errors.length > 0) {
                    if (exist_flg) {//ファイル存在する場合
                        this.errorModal(constants.FILE_UPDATE_FAIL_MSG);
                    } else {//ファイル存在しない場合
                        this.errorModal(constants.FILE_ADD_FAIL_MSG);
                    }
                } else {
                    if (glv_pdl_editor_flg) {//編集の場合
                        this.sessionDataUpdate(result.data.updatePDS);//セッションストレージに保存する。
                        if (exist_flg) {//ファイル存在の場合
                            this.successModal(constants.FILE_UPDATE_SUCCESS_MSG, () => {
                                this.props.history.push({ pathname: constants.DATA_LIST_PATH,
                                    state: { referrer: constants.FILE_OPERATION_PATH } });
                            });
                        } else {//ファイルは存在しない場合
                            this.successModal(constants.FILE_ADD_SUCCESS_MSG, () => {
                                //window.history.back(-1);
                                this.props.history.push({ pathname: constants.DATA_LIST_PATH,
                                    state: { referrer: constants.FILE_OPERATION_PATH } });
                            });
                        }
                    } else {//新規登録の場合
                        this.successModal(constants.FILE_ADD_SUCCESS_MSG, () => {
                            this.props.history.push(constants.TOP_PATH);
                        });
                    }
                }
            }
        });
        this.setModalShow(true);
    }

    //ファイル削除Modal
    fileDeleteModal = async (event, val) => {
        let tmp = glv_pdl_initdata;
        delete tmp['updatedAt'];//更新日付を削除
        this.setState({
            btn_count: 2,
            btn_color: 'danger',
            message: constants.FILE_DELETE_MSG,
            btn_name: constants.DELETE_CONFIRM_BUTTON,
            parameter: val,
            confirm_callback: async (val) => {
                for (let i = 0; i < tmp.detail_datas.length; i++) {
                    if (tmp.detail_datas[i].data_name === val.data_name &&
                        tmp.detail_datas[i].data_type === val.data_type &&
                        tmp.detail_datas[i].url === val.url) {
                        tmp.detail_datas.splice(i, 1);
                    }
                }
                let result;
                try {
                    result = await common.executGraphql(mutations.updatePds, {
                        input: tmp
                    });

                    try {
                        await common.fileDelete(val.url);
                        this.setState({ initdata: tmp });
                    } catch (e) {
                        common.log().error(e);
                        tmp.detail_datas.push({
                            data_name: val.data_name,
                            data_type: val.data_type,
                            url: val.url
                        });
                        result = await common.executGraphql(mutations.updatePds, {
                            input: tmp
                        });
                        result = e;
                    }
                } catch (e) {
                    common.log().error(e);
                    result = e;
                }
                if (result && result['errors'] && result.errors.length > 0) {
                    this.errorModal(constants.FILE_DELETE_FAIL_MSG);
                } else {
                    if (glv_pdl_editor_flg) {//編集の場合
                        this.sessionDataUpdate(result.data.updatePDS);//セッションストレージに保存する。
                        this.successModal(constants.FILE_DELETE_SUCCESS_MSG, () => {
                            this.props.history.push({ pathname: constants.DATA_LIST_PATH,
                                state: { referrer: constants.FILE_OPERATION_PATH } });
                        });
                    } else {//新規登録の場合
                        this.successModal(constants.FILE_DELETE_SUCCESS_MSG, () => {
                            this.setModalShow(false);
                        });
                    }
                }
            }

        });
        this.setModalShow(true);
    }

    //詳細データ見る
    filePreview = (e, val) => {
        let file_name = val.data_name;
        let file_type = val.data_type;
        let file_detail = {};
        file_detail[file_type] = [{
            'data_name': file_name,
            'data_type': file_type,
            'url': val.url
        }];
        common.session.set(constants.SESSION_STOREGE_OBJ, file_detail);
        let state = Object.assign({}, this.props.history.location.state,
                                { file_type: file_type, referrer: constants.FILE_OPERATION_PATH });
        this.props.history.push({ pathname: constants.DATA_DETAIL_PATH, state: state });
    }

    //成功のポップアップ
    successModal = (message, callback) => {
        this.setState({
            btn_count: 2,
            btn_color: 'success',
            message: message,
            btn_name: constants.CONFIRM_BUTTON,
            confirm_callback: () => {
                callback();
            }
        });
        this.setModalShow(true);
    }

    //エラーポップアップ
    errorModal = (message) => {
        this.setState({
            btn_count: 1,
            message: message
        });
        this.setModalShow(true);
    }

    //ポップアップ表示または隠す
    setModalShow = (flg) => {
        this.setState({
            show: flg
        });
    }

    render() {
        let {detail_datas} = this.state.initdata;
        return (
            <React.Fragment>
                <Header {...this.state} parent={this}/>
                <div className='container mt-5' id='id_content_container'>
                    {/* データ検索 */}
                    <div className='row m-auto col-12'>
                        {/* 属性 */}
                        <div className='mt-2 mx-md-auto col-md-11 form-group' id='atribute'>
                            <div className='form-control-plaintext'>
                                <div className='bg-info col-md-11 form-control m-auto text-light'>ファイル情報</div>
                                <div className='form-group row col-md-11'> </div>
                                <div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                    <div className={'col-md-12 row m-auto ' + (detail_datas && detail_datas.length > 0 ? '' : 'd-none')}>
                                        <div className='col-md-3'>
                                            <label className='col-form-label'>既存ファイル</label>
                                        </div>
                                        {/* 既存ファイル */}
                                        <div className='border col-md-8 m-auto' id='exist_file_container'>
                                            {
                                                detail_datas && detail_datas.map((val, index) => {
                                                    return (<div key={index} className='col-md-12' >
                                                        <div className='col-md-12' style={{ 'display': 'flex', 'justifyContent': 'start', 'alignItems': 'center' }}>
                                                            <span className='badge badge-pill badge-success center' style={{ 'width': '3.3em' }}>{val.data_type.toLowerCase()}</span>
                                                            &nbsp;
                                                            <div className='wrap'>{val.data_name}</div>
                                                        </div>
                                                        <div className='col-md-12 center'>
                                                            <div className='btn btn-info btn-sm col-md-3' style={{ 'cursor': 'pointer' }}
                                                                onClick={(e) => this.filePreview(e, val)}>
                                                                <i className='fas fa-eye'></i> プレビュー
                                                            </div>
                                                            &nbsp;
                                                            <div className='btn btn-danger btn-sm col-md-3' style={{ 'cursor': 'pointer' }}
                                                                onClick={(e) => this.fileDeleteModal(e, val)}>
                                                                <i className='fas fa-trash-alt'></i> 削除
                                                            </div>
                                                        </div>
                                                        <div className='form-group row col-md-11'> </div>
                                                    </div>);
                                                })
                                            }
                                        </div>
                                        <div className='form-group row col-md-11'> </div>
                                    </div>

                                    {/* ファイル選択ボックス */}
                                    <div className='col-md-11 row m-auto'>
                                        <label className='m-auto'>
                                            <div className='btn btn-primary m-auto'>
                                                <i id='button_icon' className='fas fa-file prevent-even'></i> ファイル追加
                                                    <input type='file' accept='*' onChange={(e) => this.fileChangeModal(e)}
                                                    style={{ 'display': 'none' }} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ポップアップ */}
                <ModalWindow {...this.state} parent={this} />
                <Footer />
            </React.Fragment>
        );
    }
}
