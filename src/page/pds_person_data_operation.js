import $ from 'jquery';
import React, { Component } from 'react';
import Header from '../common/header';
import Footer from '../common/footer';
import * as common from '../common/common';
import * as queries from '../graphql/queries';
import * as constants from '../common/constants';
import * as mutations from '../graphql/mutations';
import ModalWindow from '../common/modalwindow';
import DatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ja from 'date-fns/locale/ja';

// レコードID
var glv_pdl_id = null;
//初期化データ
var glv_pdl_initdata = {};

export default class PersonDataOperation extends Component {

    state = {
        permission: null,
        backflg: true,
        base_date: null,
        delete_show: true,
        show: false,
        btn_name: '',
        btn_color: 'success',
        modal_title: 'メッセージ',
        message: '',
        btn_count: 2,
        cancel_callback: null,
        confirm_callback: () => { },
        parameter: null,
        button_name: '',
        history: this.props.history
    };

    constructor(props) {
        super(props);
        //日付入力ボックス言語設定
        registerLocale('ja', ja);
        setDefaultLocale('ja');
    }

    async componentDidMount() {
        //ユーザー情報取得
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
        try {
            glv_pdl_id = this.props.location.state.id;
        } catch (e) {
            glv_pdl_id = null;
        }
        if (!glv_pdl_id) {//新規の場合
            $('[name="title"]').html(constants.DATA_ADD_TITLE);
            this.setState({ button_name: constants.BUTTON_NAME_DATA_ADD, delete_show: false });
        } else {
            let result;
            try {
                result = await common.executGraphql(queries.getPds, { id: glv_pdl_id });
            } catch (e) {
                common.log().error(e);
                result = e;
            }

            if (result.errors && result.errors.length > 0) {
                this.errorModal(result.errors.message);
            } else {
                for (let key in result.data) {
                    glv_pdl_initdata = result.data[key];
                }
                if (glv_pdl_initdata) {//データ編集の場合
                    $('[name="title"]').html(constants.DATA_EDITOR_TITLE);
                    if(this.state.permission === constants.ADMIN_PERMISSION)
                        $('#healthcare_id').val(glv_pdl_initdata.healthcare_id);
                    $('#data_owner').val(glv_pdl_initdata.data_owner);
                    $('#data_type').val(glv_pdl_initdata.data_type);
                    $('#data_summary').val(glv_pdl_initdata.data_summary);
                    if(glv_pdl_initdata.base_date)
                        this.setState({ base_date: new Date(common.numdateToStrdate(glv_pdl_initdata.base_date)) });
                    this.setState({ button_name: constants.BUTTON_NAME_DATA_UPDATE, delete_show: true });
                } else {//データ存在しない場合
                    $('[name="title"]').html(constants.DATA_ADD_TITLE);
                    this.setState({ button_name: constants.BUTTON_NAME_DATA_ADD, delete_show: false });
                    this.errorModal(constants.NO_DATA);
                }

            }
        }
        //基準日のチェックメッセージ
        $('#base_date').parent().append('<div class="invalid-feedback"></div>');
    }

    // データ更新または登録
    saveData = async () => {
        let result;
        let checkng_flg = false;//チェックNGフラグtrue：NG、false:OK
        let datachang_flg = false;//何も変更しないフラグ
        let healthcare_id, data_owner, data_type, data_summary, base_date, base_date_val;
        let kennsin_data;
        //データ編集の場合
        if (Object.keys(glv_pdl_initdata).length && glv_pdl_id) {
            for (let key in glv_pdl_initdata) {
                switch (key) {
                    case 'healthcare_id':
                        if(this.state.permission === constants.ADMIN_PERMISSION){
                            healthcare_id = $('#' + key); 
                            if (glv_pdl_initdata[key] !== healthcare_id.val())
                                datachang_flg = true;
                            if (!healthcare_id.val()) {
                                healthcare_id.next().html(constants.HEALTHCARE_ID + constants.INPUT_NULL_ERROR);
                                healthcare_id.addClass('is-invalid');
                                checkng_flg = true;
                            }else if(!common.inputCheck(healthcare_id.val())){
                                healthcare_id.next().html(constants.HEALTHCARE_ID + constants.DATA_INPUT_ERROR4);
                                healthcare_id.addClass('is-invalid');
                                checkng_flg = true;
                            }else {
                                healthcare_id.removeClass('is-invalid');
                                healthcare_id.next().html('');
                            }
                            kennsin_data = { healthcare_id: healthcare_id.val() };
                        }else if(!this.state.permission){
                            kennsin_data = { healthcare_id: common.getUser() };
                        }
                        break;
                    case 'data_owner':
                        data_owner = $('#' + key);
                        if (glv_pdl_initdata[key] !== data_owner.val())
                            datachang_flg = true;
                        if (!data_owner.val()) {
                            data_owner.next().html(constants.DATA_OWNER + constants.INPUT_NULL_ERROR);
                            data_owner.addClass('is-invalid');
                            checkng_flg = true;
                        } else {
                            data_owner.removeClass('is-invalid');
                            data_owner.next().html('');
                        }
                        break;
                    case 'data_type':
                        data_type = $('#' + key);
                        if (glv_pdl_initdata[key] !== data_type.val())
                            datachang_flg = true;
                        if (!data_type.val()) {
                            data_type.next().html(constants.DATA_TYPE + constants.INPUT_NULL_ERROR);
                            data_type.addClass('is-invalid');
                            checkng_flg = true;
                        } else {
                            data_type.removeClass('is-invalid');
                            data_type.next().html('');
                        }
                        break;
                    case 'data_summary':
                        data_summary = $('#' + key);
                        if (glv_pdl_initdata[key] !== data_summary.val())
                            datachang_flg = true;
                        if (!data_summary.val()) {
                            data_summary.next().html(constants.DATA_SUMMARY + constants.INPUT_NULL_ERROR);
                            data_summary.addClass('is-invalid');
                            checkng_flg = true;
                        } else {
                            data_summary.removeClass('is-invalid');
                            data_summary.next().html('');
                        }
                        break;
                    case 'base_date':
                        base_date = $('#' + key);
                        if (this.state.base_date)
                            base_date_val = common.formatDate(this.state.base_date, 'yyyy-MM-dd');
                        if (glv_pdl_initdata[key] !== common.dateToStr(base_date_val))
                            datachang_flg = true;
                        if (!base_date_val) {
                            base_date.next().html(constants.BASE_DATE + constants.INPUT_NULL_ERROR);
                            base_date.addClass('is-invalid');
                            checkng_flg = true;
                        } else if (!common.dateFormatCheck(base_date_val)) {
                            base_date.next().html(constants.BASE_DATE + constants.DATA_INPUT_ERROR3);
                            base_date.addClass('is-invalid');
                            checkng_flg = true;
                        } else {
                            base_date.removeClass('is-invalid');
                            base_date.next().html('');
                        }
                        break;
                    default:
                        break;
                }
            }

            //データ変わらない時またはチェックNGの時何もしない
            if (!datachang_flg){
                this.errorModal(constants.DATA_NO_CHANGE);
                return;
            }else if(checkng_flg){
                this.setModalShow(false);
                return;
            }
            kennsin_data.id = glv_pdl_id;
            kennsin_data.data_type_detail = data_type.val()
                + '_' + common.dateToStr(base_date.val())
                + '_' + data_owner.val();
            kennsin_data.data_type = data_type.val();
            kennsin_data.data_owner = data_owner.val();
            kennsin_data.data_summary = data_summary.val();
            kennsin_data.base_date = common.dateToStr(base_date.val());

            try {
                result = await common.executGraphql(mutations.updatePds, {
                    input: kennsin_data
                });
            } catch (e) {
                common.log().error(e);
                result = e;
            }

            if (result.errors && result.errors.length > 0) {
                this.errorModal(constants.UPDATA_DATA_FAIL_MSG);
            } else {
                glv_pdl_initdata = result.data.updatePDS;
                this.sessionDataUpdate(result.data.updatePDS);
                this.successModal(constants.UPDATA_DATA_SUCCES_MSG, null, () => {
                    this.props.history.push({ pathname: constants.DATA_LIST_PATH, 
                                                state: { referrer: constants.DATA_OPERATION_PATH } });
                });
            }
        } else {//新規登録の場合
            if(this.state.permission === constants.ADMIN_PERMISSION){
                healthcare_id = $('#healthcare_id'); 
                if (!healthcare_id.val()) {
                    healthcare_id.next().html(constants.HEALTHCARE_ID + constants.INPUT_NULL_ERROR);
                    healthcare_id.addClass('is-invalid');
                    checkng_flg = true;
                }else if(!common.inputCheck(healthcare_id.val())){
                    healthcare_id.next().html(constants.HEALTHCARE_ID + constants.DATA_INPUT_ERROR4);
                    healthcare_id.addClass('is-invalid');
                    checkng_flg = true;
                } else {
                    healthcare_id.removeClass('is-invalid');
                    healthcare_id.next().html('');
                }
                    kennsin_data = { healthcare_id: healthcare_id.val() };
                }else if(!this.state.permission){
                    kennsin_data = { healthcare_id: common.getUser() };
                }
            data_owner = $('#data_owner');
            if (!data_owner.val()) {
                data_owner.next().html(constants.DATA_OWNER + constants.INPUT_NULL_ERROR);
                data_owner.addClass('is-invalid');
                checkng_flg = true;
            } else {
                data_owner.removeClass('is-invalid');
                data_owner.next().html('');
            }

            data_type = $('#data_type');
            if (!data_type.val()) {
                data_type.next().html(constants.DATA_TYPE + constants.INPUT_NULL_ERROR);
                data_type.addClass('is-invalid');
                checkng_flg = true;
            } else {
                data_type.removeClass('is-invalid');
                data_type.next().html('');
            }
            data_summary = $('#data_summary');
            if (!data_summary.val()) {
                data_summary.next().html(constants.DATA_SUMMARY + constants.INPUT_NULL_ERROR);
                data_summary.addClass('is-invalid');
                checkng_flg = true;
            } else {
                data_summary.removeClass('is-invalid');
                data_summary.next().html('');
            }
            base_date = $('#base_date');
            if (this.state.base_date)
                base_date_val = common.formatDate(this.state.base_date, 'yyyy-MM-dd');
            if (!base_date_val) {
                base_date.next().html(constants.BASE_DATE + constants.INPUT_NULL_ERROR);
                base_date.addClass('is-invalid');
                checkng_flg = true;
            } else if (!common.dateFormatCheck(base_date_val)) {
                base_date.next().html(constants.BASE_DATE + constants.DATA_INPUT_ERROR3);
                base_date.addClass('is-invalid');
                checkng_flg = true;
            } else {
                base_date.removeClass('is-invalid');
                base_date.next().html('');
            }
            if (checkng_flg) {//データ変わらない時またはチェックNGの時何もしない
                this.setModalShow(false);
                return;
            }
            kennsin_data.data_type_detail = data_type.val()
                + '_' + common.dateToStr(base_date_val)
                + '_' + data_owner.val();
            kennsin_data.data_type = data_type.val();
            kennsin_data.data_owner = data_owner.val();
            kennsin_data.data_summary = data_summary.val();
            kennsin_data.base_date = common.dateToStr(base_date_val);
            kennsin_data.detail_datas = [];

            try {
                result = await common.executGraphql(mutations.createPds, { input: kennsin_data });
            } catch (e) {
                common.log().error(e);
                result = e;
            }
            if (result.errors && result.errors.length > 0) {
                this.errorModal(constants.ADD_DATA_FAIL_MSG);
            } else {
                this.successModal(constants.ADD_DATA_SUCCESS_MSG, () => {
                    this.props.history.push(constants.TOP_PATH);
                },
                    () => {
                        this.props.history.push({
                            pathname: constants.FILE_OPERATION_PATH,
                            state: { id: result.data.createPDS.id, referrer: constants.TOP_PATH }
                        });
                    });
            }
        }
    };

    //データ削除
    deleteData = async () => {
        let files = glv_pdl_initdata.detail_datas;
        let data_delete_result, error;
        try {
            //データ削除
            data_delete_result = await common.executGraphql(mutations.deletePds, {
                input: { id: glv_pdl_id }
            });
            for (let i = 0; i < files.length; i++) {
                try {//データ削除の場合
                    //s3のファイルを削除する
                    common.fileDelete(files[i].url);
                } catch (e) {
                    common.log().error(e);
                    error = e;
                    //削除したのデータを登録
                    data_delete_result = data_delete_result.data.deleteData;
                    data_delete_result.detail_datas = [];
                    for (let j = i; j < files.length; j++) {
                        data_delete_result.detail_datas.push(files[j]);
                    }
                    data_delete_result = await common.executGraphql(mutations.createPds, 
                                                                { input: data_delete_result });
                }
            }
        } catch (e) {
            common.log().error(e);
            error = e;
            this.errorModal(constants.DELETE_DATA_FAIL_MSG);
        }

        if (error && error['errors'] && error.errors.length > 0) {
            this.errorModal(constants.DELETE_DATA_FAIL_MSG);
        } else {
            this.sessionDataDelete();
            this.successModal(constants.DELETE_DATA_SUCCESS_MSG, () => {
                this.props.history.push({
                    pathname: constants.DATA_LIST_PATH,
                    state: { referrer: constants.DATA_OPERATION_PATH }
                });
            }, () => {
                this.props.history.push({
                    pathname: constants.DATA_LIST_PATH,
                    state: { referrer: constants.DATA_OPERATION_PATH }
                });
            });
        }
    };

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

    //セッションストレージから既存データ削除
    sessionDataDelete = () => {
        let datas = common.session.get(constants.SESSION_STOREGE_DATAS);
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].id === glv_pdl_id) {
                datas.splice(i, 1);
                break;
            }
        }
        common.session.set(constants.SESSION_STOREGE_DATAS, datas);
    }

    //成功のポップアップ
    successModal = (message, cancel_callback, confirm_callback) => {
        this.setState({
            btn_count: 2,
            btn_color: 'success',
            message: message,
            btn_name: constants.CONFIRM_BUTTON,
            confirm_callback: () => {
                confirm_callback();
            }
        });
        if (cancel_callback) {
            this.setState({
                cancel_callback: () => {
                    cancel_callback();
                }
            });
        }
        this.setModalShow(true);
    }
    //エラーポップアップ
    errorModal = (message) => {
        this.setState({
            btn_count: 1,
            cancel_callback: null,
            confirm_callback: () => { },
            message: message
        });
        this.setModalShow(true);
    }
    //データ登録・更新ポップアップ
    dataAddOrUpdateModal = () => {
        this.setState({
            btn_count: 2,
            btn_color: 'success',
            cancel_callback: null,
            confirm_callback: () => {
                this.saveData();
            }
        });

        if (glv_pdl_initdata && glv_pdl_id) {
            this.setState({
                message: constants.DATA_UPDATE_MSG,
                btn_name: constants.UPDATA_CONFIRM_BUTTON
            });
        } else {
            this.setState({
                message: constants.DATA_ADD_MSG,
                btn_name: constants.ADD_CONFIRM_BUTTON
            });
        }
        this.setModalShow(true);
    }
    //データ削除ポップアップ
    dataDeleteModal = () => {
        this.setState({
            btn_count: 2,
            btn_color: 'danger',
            message: constants.DATA_DELETE_MSG,
            btn_name: constants.DELETE_CONFIRM_BUTTON,
            cancel_callback: null,
            confirm_callback: () => {
                this.deleteData();
            }
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
        return (
            <React.Fragment>
                <Header {...this.state } parent={this} />
                <div className='container mt-5' id='id_content_container'>
                    {/*データ検索 */}
                    <div className='row m-auto col-12'>
                        {/* 属性 */}
                        <div className='mt-2 mx-md-auto col-md-11 form-group m-auto' id='atribute'>
                            <div className='form-control-plaintext'>
                                <div className='bg-info col-md-11 form-control m-auto text-light'>データ情報</div>
                                <div className='form-group row col-md-11'> </div>
                                 {
                                    //管理者権限のみ表示する
                                    this.state.permission === constants.ADMIN_PERMISSION &&
                                    (<div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                        <div className='col-md-3'>
                                            <label className='col-form-label'>ヘルスケアID</label>
                                        </div>
                                        <div className='input-group col-md-8'>
                                            <input className='form-control' id='healthcare_id' type='text' />
                                            <div className='invalid-feedback'></div>
                                        </div>
                                    </div>)
                                 }
                                <div className='form-group row col-md-11'> </div>
                                {/*提供元*/}
                                <div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                    <div className='col-md-3'>
                                        <label className='col-form-label'>提供元</label>
                                    </div>
                                    <div className='input-group col-md-8'>
                                        <input className='form-control' id='data_owner' type='text' />
                                        <div className='invalid-feedback'></div>
                                    </div>
                                </div>
                                <div className='form-group row col-md-11'> </div>
                                {/*データ種別*/}
                                <div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                    <div className='col-md-3'>
                                        <label className='col-form-label'>データ種別</label>
                                    </div>
                                    <div className='input-group col-md-8'>
                                        <input className='form-control' id='data_type' type='text' />
                                        <div className='invalid-feedback'></div>
                                    </div>
                                </div>
                                <div className='form-group row col-md-11'> </div>
                                {/*データ概要*/}
                                <div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                    <div className='col-md-3'>
                                        <label className='col-form-label'>データ概要</label>
                                    </div>
                                    <div className='input-group col-md-8'>
                                        <input className='form-control' id='data_summary' type='text' />
                                        <div className='invalid-feedback'></div>
                                    </div>
                                </div>
                                <div className='form-group row col-md-11'> </div>
                                {/*基準日*/}
                                <div className='form-group row col-md-11 m-0 p-0 mt-1 m-auto'>
                                    <div className='col-md-3'>
                                        <label className='col-form-label'>基準日</label>
                                    </div>
                                    <div className='input-group col-md-8'>
                                        <DatePicker id='base_date' className='form-control' todayButton='今日'
                                            dateFormat='yyyy-MM-dd' autoComplete='off' showMonthDropdown showYearDropdown
                                            selected={this.state.base_date} onChange={(date) => { this.setState({ base_date: date }) }} />
                                    </div>
                                </div>
                                <div className='form-group row col-md-11'> </div>
                            </div>
                            <div className='m-auto col-md-11 row m-auto'>
                                <div className='col-md-3'> </div>
                                <button id='delelte_data' type='button' onClick={() => this.dataDeleteModal()}
                                    className={'btn btn-danger m-auto col-md-2 ' + (this.state.delete_show ? 'show' : 'd-none')} >
                                    <i className='fas fa-trash-alt prevent-event'></i>
                                    &nbsp;
                                    <label className='m-auto'>データ削除</label>
                                </button>
                                <button id='operation_button' type='button' className='btn btn-success m-auto col-md-2'
                                    onClick={() => this.dataAddOrUpdateModal()}>
                                    <i id='button_icon' className='fas fa-save prevent-event'></i>
                                    &nbsp;
                                    <label className='m-auto'>{this.state.button_name}</label>
                                </button>
                                <div className='col-md-3'> </div>
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