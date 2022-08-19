import $ from 'jquery';
import React, { Component } from 'react';
import Header from '../common/header';
import Footer from '../common/footer';
import * as constants from '../common/constants';
import * as common from '../common/common';
import * as queries from '../graphql/queries';
import BootstrapTable from 'react-bootstrap-table-next';
import DatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ja from 'date-fns/locale/ja';

//·スクロールフラグ
var glv_pdl_scroll_flg = false;
//検索条件
var glv_pdl_sear_condition = {};
//エラー情報
var glv_pdl_error = {};
//クエリ検索したデータ
var glv_pdl_list_datas = [];
//カーソル
var glv_pdl_cursor;
//リミット
const LIMIT = 100;
//ソート順
const SORT_ASC = 'ASC';
//遷移元
const REFERRER = [constants.DATA_OPERATION_PATH,
constants.FILE_OPERATION_PATH,
constants.DATA_DETAIL_PATH];


export default class PersonList extends Component {

    state = {
        permission: null,
        backflg: true,
        no_data_msg: null,
        loading: false,
        no_more_data: false,
        arrow_show: false,
        condition_flg: false,
        next_token: null,
        data_list: [],
        expanded: [],
        base_date_from: null,
        base_date_to: null,
        update_date_from: null,
        update_date_to: null,
        history: this.props.history
    };

    constructor(props) {
        super(props);
        //日付入力ボックス言語設定
        registerLocale('ja', ja);
        setDefaultLocale('ja');
    }

    async componentDidMount() {
        //タイトル設定
        $('[name="title"]').html(constants.ESCROW_DATA_TITLE);
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
        //戻る場合歴史データ表示
        try {
            if (REFERRER.indexOf(this.props.history.location.state.referrer) !== -1)
                this.showHistory();
        } catch (e) {
            //common.log().debug('遷移元がない');
        }
        this.props.history.push({ state: { referrer: constants.TOP_PATH } });
        //スクロールバーがある場合
        window.addEventListener('scroll', this.scroll);
        //スクロールバーがない場合
        window.addEventListener('mousewheel', this.mouseWheel);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scroll);
        window.removeEventListener('mousewheel', this.mouseWheel);
    }

    //スクロールイベント
    scroll = (event) => {
        event.preventDefault();
        // スクロールの高さ
        let scrollTop = (event.srcElement ? event.srcElement.documentElement.scrollTop : false) ||
            window.pageYOffset || (event.srcElement ? event.srcElement.body.scrollTop : 0);
        // ウィンドウズの高さ
        let clientHeight = (event.srcElement && event.srcElement.documentElement.clientHeight) ||
            document.body.clientHeight;
        // パージの高さ
        let scrollHeight = (event.srcElement && event.srcElement.documentElement.scrollHeight) ||
            document.body.scrollHeight;
        //ページ最低高さ
        let height = scrollHeight - scrollTop - clientHeight;

        if (scrollTop > 10)//矢印表示
            this.setState({ arrow_show: true });
        else
            this.setState({ arrow_show: false });
        //スクロールバー有無判断
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight)
            glv_pdl_scroll_flg = true;
        else
            glv_pdl_scroll_flg = false;

        if (glv_pdl_scroll_flg && glv_pdl_sear_condition && height <= 0) {
            if (!this.state.no_more_data && this.state.data_list.length > 0) {
                this.nextSearch();
            }
        }
    }

    //マウスイベント
    mouseWheel = (event) => {
        let delta = (event.wheelDelta && (event.wheelDelta > 0 ? 1 : -1)) ||
            (event.detail && (event.detail > 0 ? -1 : 1));
        //スクロールバー有無判断
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight)
            glv_pdl_scroll_flg = true;
        else
            glv_pdl_scroll_flg = false;
        if (!glv_pdl_scroll_flg && glv_pdl_sear_condition && delta < 0) {
            if (!this.state.no_more_data && this.state.data_list.length > 0) {
                this.nextSearch();
            }
        }
    }

    //歴史を取得し、画面に表示する
    showHistory = () => {

        let datas = common.session.get(constants.SESSION_STOREGE_DATAS);
        let next_token = common.session.get(constants.SESSION_STOREGE_NEXT_TOKEN);
        let sear_condition = common.session.get(constants.SESSION_STOREGE_SEAR_CONDITION);
        let expanded_list = common.session.get(constants.SESSION_STOREGE_EXPANDED_LIST);
        let cash_list_datas = common.session.get(constants.SESSION_STOREGE_CASH_LIST_DATAS);
        let cursor = common.session.get(constants.SESSION_STOREGE_CURSOR);
        let scroll_top = common.session.get(constants.SESSION_STOREGE_SCROLL_TOP);
        let no_more_data = common.session.get(constants.SESSION_STOREGE_NO_MORE_DATA);

        if (datas) this.setState({ data_list: datas });
        if (next_token) this.setState({ next_token: next_token });
        if (expanded_list) this.setState({ expanded: expanded_list });
        if (no_more_data) this.setState({ no_more_data: no_more_data });
        if (cash_list_datas) glv_pdl_list_datas = cash_list_datas;
        if (cursor) glv_pdl_cursor = cursor;
        if (sear_condition) {
            glv_pdl_sear_condition = sear_condition;
            let healthcare_id = sear_condition.healthcare_id;
            let data_owner = sear_condition.data_owner;
            let data_type = sear_condition.data_type;
            let data_summary = sear_condition.data_summary;
            let base_date_from = sear_condition.base_date_from;
            let base_date_to = sear_condition.base_date_to;
            let update_date_from = sear_condition.update_date_from;
            let update_date_to = sear_condition.update_date_to;
            if (healthcare_id) $('#healthcare_id').val(healthcare_id);
            if (data_type) $('#data_type').val(data_type);
            if (data_owner) $('#data_owner').val(data_owner);
            if (data_summary) $('#data_summary').val(data_summary);
            if (base_date_from) this.setState({ base_date_from: new Date(base_date_from) });
            if (base_date_to) this.setState({ base_date_to: new Date(base_date_to) });
            if (update_date_from) this.setState({ update_date_from: new Date(update_date_from) });
            if (update_date_to) this.setState({ update_date_to: new Date(update_date_to) });
        }
        this.setState({condition_flg: common.session.get(constants.SESSION_STOREGE_CONDITION_FLG)});
        if (scroll_top) window.scrollTo(0, scroll_top);
        glv_pdl_scroll_flg = common.session.get(constants.SEESION_STOREGE_SCROLL_FLG);
    }


    // 画面の情報を保存
    saveData = () => {
        if ($('#id_mydata_criteria_detail').is(':hidden'))
            common.session.set(constants.SESSION_STOREGE_CONDITION_FLG, false);
        else
            common.session.set(constants.SESSION_STOREGE_CONDITION_FLG, true);
        common.session.set(constants.SESSION_STOREGE_DATAS, this.state.data_list);
        common.session.set(constants.SESSION_STOREGE_CASH_LIST_DATAS, glv_pdl_list_datas);
        common.session.set(constants.SESSION_STOREGE_NEXT_TOKEN, this.state.next_token);
        common.session.set(constants.SESSION_STOREGE_SEAR_CONDITION, glv_pdl_sear_condition);
        common.session.set(constants.SESSION_STOREGE_EXPANDED_LIST, this.state.expanded);
        common.session.set(constants.SESSION_STOREGE_NO_MORE_DATA, this.state.no_more_data);
        common.session.set(constants.SESSION_STOREGE_CURSOR, glv_pdl_cursor);
        common.session.set(constants.SEESION_STOREGE_SCROLL_FLG, glv_pdl_scroll_flg);
        common.session.set(constants.SESSION_STOREGE_SCROLL_TOP, $('html,body').scrollTop());
    }

    //入力カレンダーチェック
    dateTimeCheck = (obj) => {
        let key = null,
            val = null,
            kendindate_error_flg = false,
            updatedate_error_flg = false;

        for (let i in obj) {
            val = obj[i];
            switch (i) {
                case 'base_date_from':
                    key = 'basedatefrom_error';
                    delete glv_pdl_error[key];
                    if (val && !common.dateFormatCheck(val)) {
                        glv_pdl_error[key] = '<div>' + constants.BASE_DATE + constants.DATA_INPUT_ERROR1 + '</div>';
                        kendindate_error_flg = true;
                    }
                    break;
                case 'base_date_to':
                    key = 'basedateto_error';
                    delete glv_pdl_error[key];
                    if (val && !common.dateFormatCheck(val)) {
                        glv_pdl_error[key] = '<div>' + constants.BASE_DATE + constants.DATA_INPUT_ERROR2 + '</div>';
                        kendindate_error_flg = true;
                    }
                    break;
                case 'update_date_from':
                    key = 'updatedatefrom_error';
                    delete glv_pdl_error[key];
                    if (val && !common.dateFormatCheck(val)) {
                        glv_pdl_error[key] = '<div>' + constants.UPDATA_DATE + constants.DATA_INPUT_ERROR1 + '</div>';
                        updatedate_error_flg = true;
                    }
                    break;
                case 'update_date_to':
                    key = 'updatedateto_error';
                    delete glv_pdl_error[key];
                    if (val && !common.dateFormatCheck(val)) {
                        glv_pdl_error[key] = '<div>' + constants.UPDATA_DATE + constants.DATA_INPUT_ERROR2 + '</div>';
                        updatedate_error_flg = true;
                    }
                    break;
                default:
                    break;
            }
        }
        return [kendindate_error_flg, updatedate_error_flg];
    }

    // 開始日と終了日の比較
    dateCompareCheck = (date_from, date_to, key, message) => {
        delete glv_pdl_error[key];
        if (date_from && date_to) {
            if (!common.dateCompareCheck(date_from, date_to)) {
                glv_pdl_error[key] = '<div>' + message + '</div>';
            }
        }
    }


    // 表示ファイルアイコンを取得
    buttonShow = (row) => {
        let arr_result = {};
        let icon = null;
        $.each(row.detail_datas, function (idx, obj) {
            let key = obj.data_type.toLowerCase();
            if (typeof arr_result[key] === 'undefined') {
                arr_result[key] = [];
            }
            arr_result[key].push(obj);
        });
        $.each(arr_result, function (i) {
            let type = [];
            if (type.indexOf(i) === -1) {
                type.push(i);
            }
            icon = <React.Fragment>
                {icon}<span className='badge badge-pill badge-success ml-2'>{i}</span>
            </React.Fragment>;
        });
        return icon;
    }

    // 一覧詳細表示ボタン
    detailFormatterBtn = (row) => {
        let button_type = null;
        let detail_datas = [];
        detail_datas = row.detail_datas;
        for (let i in detail_datas) {
            let data_name = detail_datas[i].data_name;
            let data_type = detail_datas[i].data_type;
            let url = detail_datas[i].url;
            let file_detail = {};
            file_detail[data_type] = [{
                'data_name': data_name,
                'data_type': data_type,
                'url': url
            }];
            button_type = <React.Fragment>{button_type}<div><b>{data_name}</b>
                <button onClick={() => this.pdsDetail(data_type, JSON.stringify(file_detail))}>
                    {data_type.toLowerCase()}
                </button></div>
            </React.Fragment>;
        }
        return button_type;
    }

    //一覧概要表示
    operateFormatter = (cell, row, row_index) => {
        return (<div className='text-muted d-flex align-items-center collapsed' style={{ 'cursor': 'pointer' }}>
            <div className={this.state.permission && this.state.permission === constants.OWNER_PERMISSION ? 'col-md-12' : 'col-md-10'}
                style={{ 'textAlign': 'left', 'paddingLeft': '0em' }}>
                <div className='wrap'> {cell} </div>
                <div style={{ 'fontSize': '0.7rem' }}>{this.buttonShow(row)}
                    {'[データ種別]'} {row.data_type} {'[ヘルスケアID]'} {row.healthcare_id}</div>
            </div>
            {
                (!this.state.permission || this.state.permission === constants.ADMIN_PERMISSION) &&
                <div className='m-auto row'>
                    <button className='btn btn-sm btn-outline-primary' onClick={(e) => this.dataEditor(e, row.id)}>
                        <i className='fas fa-edit'></i>
                    </button>
                    <div className='col-md-1'> </div>
                    <button className='btn btn-sm btn-outline-primary' onClick={(e) => this.fileEditor(e, row.id)}>
                        <i className='fas fa-file-alt'></i>
                    </button>
                </div>
            }
            <div style={{ 'textAlign': 'right' }}>
                <i className='fas fa-chevron-right ml-auto mr-2'></i>
            </div>
        </div>);
    }

    //預託データ詳細画面に遷移
    pdsDetail = (file_type, obj) => {
        common.session.set(constants.SESSION_STOREGE_OBJ, obj);
        this.saveData();
        this.props.history.push({
            pathname: constants.DATA_DETAIL_PATH,
            state: { file_type: file_type, referrer: constants.DATA_LIST_PATH }
        });
    }

    //データ登録・編集画面に遷移
    dataEditor = (e, id) => {
        e.stopPropagation();
        this.saveData();
        this.props.history.push({
            pathname: constants.DATA_OPERATION_PATH,
            state: { id: id, referrer: constants.DATA_LIST_PATH }
        });
    }

    //ファイル編登録・編集画面に遷移
    fileEditor = (e, id) => {
        e.stopPropagation();
        this.saveData();
        this.props.history.push({
            pathname: constants.FILE_OPERATION_PATH,
            state: { id: id, editor: true, referrer: constants.DATA_LIST_PATH }
        });
    }

    //検索条件取得
    condition = () => {
        let param = {};
        let healthcare_id, data_owner;
        if (this.state.permission === constants.ADMIN_PERMISSION) {//管理者権限の場合

        } else if (!this.state.permission) {//会員権限の場合
            healthcare_id = common.getUser();
        } else if (this.state.permission === constants.OWNER_PERMISSION) {//提供元の場合
            data_owner = common.getUser();
        }
        let data_type = $('#data_type').val();
        if (healthcare_id)
            param.healthcare_id = healthcare_id;
        if (data_type)
            param.data_type = data_type;
        if (data_owner)
            param.data_owner = data_owner;
        return param;
    }

    //詳細検索条件取得
    conditions = () => {
        let param = {};
        let healthcare_id, data_owner;
        let data_type = $('#data_type').val();
        let data_summary = $('#data_summary').val();
        let base_date_from = common.formatDate(this.state.base_date_from, 'yyyy-MM-dd');
        let base_date_to = common.formatDate(this.state.base_date_to, 'yyyy-MM-dd');
        let update_date_from = common.formatDate(this.state.update_date_from, 'yyyy-MM-dd');
        let update_date_to = common.formatDate(this.state.update_date_to, 'yyyy-MM-dd');
        if (this.state.permission === constants.ADMIN_PERMISSION) {//管理者権限の場合
            healthcare_id = $('#healthcare_id').val();
            data_owner = $('#data_owner').val();
        } else if (!this.state.permission) {//会員権限の場合
            healthcare_id = common.getUser();
            data_owner = $('#data_owner').val();
        } else if (this.state.permission === constants.OWNER_PERMISSION) {//提供元の場合
            healthcare_id = $('#healthcare_id').val();
            data_owner = common.getUser();
        }
        if (healthcare_id)
            param.healthcare_id = healthcare_id;
        if (data_owner)
            param.data_owner = data_owner;
        if (data_type)
            param.data_type = data_type;
        if (data_summary)
            param.data_summary = data_summary;
        if (base_date_from)
            param.base_date_from = base_date_from;
        if (base_date_to)
            param.base_date_to = base_date_to;
        if (update_date_from)
            param.update_date_from = update_date_from;
        if (update_date_to)
            param.update_date_to = update_date_to;
        return param;
    }

    //クエリ
    query = async (conditions) => {

        let next_token = conditions.next_token;
        let healthcare_id = conditions.healthcare_id;
        let data_type = conditions.data_type;
        let data_owner = conditions.data_owner;
        let base_date_from = conditions.base_date_from;
        let base_date_to = conditions.base_date_to;
        if (base_date_from)
            base_date_from = common.dateToStr(base_date_from);
        if (base_date_to)
            base_date_to = common.dateToStr(base_date_to);
        let update_date_from = conditions.update_date_from;
        let update_date_to = conditions.update_date_to;
        if (update_date_from)
            update_date_from = common.strDateToIosO8601Date(update_date_from + ' 00:00:00');
        if (update_date_to)
            update_date_to = common.strDateToIosO8601Date(update_date_to + ' 23:59:59');
        let data_summary = conditions.data_summary;
        let condition_dict = {
            limit: LIMIT,
            sortDirection: SORT_ASC
        };
        //インデックスなし
        let graphql;
        //フィルター検索条件
        let filter = {};
        //検索条件によりデータ検索を行う。

        if (healthcare_id) {
            //healthcare_id-data_type_detail-gsiインデックスを使う
            graphql = queries.memberQueryByDataTypeDetail;
            condition_dict.healthcare_id = healthcare_id;
            if (data_type) {
                condition_dict.data_type_detail = { beginsWith: data_type };
                if (data_owner)
                    filter = Object.assign({}, filter, { data_owner: { eq: data_owner } });
                if (base_date_from && base_date_to) {
                    filter = Object.assign({}, filter, { base_date: { between: [base_date_from, base_date_to] } });
                } else {
                    if (base_date_from)
                        filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                    else if (base_date_to)
                        filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                }
                if (update_date_from && update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
                } else {
                    if (update_date_from)
                        filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                    else if (update_date_to)
                        filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (data_owner) {
                //healthcare_id-data_owner-gsiインデックスを使う
                graphql = queries.memberQueryByDataOwner;
                condition_dict.data_owner = { eq: data_owner };
                if (base_date_from && base_date_to) {
                    filter = Object.assign({}, filter, { base_date: { between: [base_date_from, base_date_to] } });
                } else {
                    if (base_date_from)
                        filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                    else if (base_date_to)
                        filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                }
                if (update_date_from && update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
                } else {
                    if (update_date_from)
                        filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                    else if (update_date_to)
                        filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (base_date_from && base_date_to) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.memberQueryByBaseDate;
                condition_dict.base_date = { between: [base_date_from, base_date_to] };
                if (update_date_from && update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
                } else {
                    if (update_date_from)
                        filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                    else if (update_date_to)
                        filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });

            } else if (update_date_from && update_date_to) {
                //healthcare_id-updatedAt-gsiインデックスを使う
                graphql = queries.memberQueryByUpdatedAt;
                condition_dict.updatedAt = { between: [update_date_from, update_date_to] };
                if (base_date_from)
                    filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                else if (base_date_to)
                    filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });

            } else if (base_date_from) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.memberQueryByBaseDate;
                condition_dict.base_date = { ge: base_date_from };
                if (update_date_from)
                    filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                else if (update_date_to)
                    filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (update_date_from) {
                //healthcare_id-updatedAt-gsiインデックスを使う
                graphql = queries.memberQueryByUpdatedAt;
                condition_dict.updatedAt = { ge: update_date_from };
                if (base_date_to)
                    filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (base_date_to) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.memberQueryByBaseDate;
                condition_dict.base_date = { le: base_date_to };
                if (update_date_to)
                    filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (update_date_to) {
                //healthcare_id-updatedAt-gsiインデックスを使う
                graphql = queries.memberQueryByUpdatedAt;
                condition_dict.updatedAt = { le: update_date_to };
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (data_summary) {
                //healthcare_id-data_summary-gsiインデックスを使う
                graphql = queries.memberQueryByDataSummary;
                condition_dict.data_summary = { beginsWith: data_summary };
            }
        } else if (data_owner) {
            //data_owner-data_type_detail-gsiインデックスを使う
            graphql = queries.ownerQueryByDataTypeDetail;
            condition_dict.data_owner = data_owner;
            if (data_type) {
                condition_dict.data_type_detail = { beginsWith: data_type };
                if (base_date_from && base_date_to) {
                    filter = Object.assign({}, filter, { base_date: { between: [base_date_from, base_date_to] } });
                } else {
                    if (base_date_from)
                        filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                    else if (base_date_to)
                        filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                }
                if (update_date_from && update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
                } else {
                    if (update_date_from)
                        filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                    else if (update_date_to)
                        filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (base_date_from && base_date_to) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.ownerQueryByBaseDate;
                condition_dict.base_date = { between: [base_date_from, base_date_to] };
                if (update_date_from && update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
                } else {
                    if (update_date_from)
                        filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                    else if (update_date_to)
                        filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });

            } else if (update_date_from && update_date_to) {
                //data_owner-updatedAt-gsiインデックスを使う
                graphql = queries.ownerQueryByUpdateAt;
                condition_dict.updatedAt = { between: [update_date_from, update_date_to] };
                if (base_date_from)
                    filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                else if (base_date_to)
                    filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });

            } else if (base_date_from) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.ownerQueryByBaseDate;
                condition_dict.base_date = { ge: base_date_from };
                if (update_date_from)
                    filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                else if (update_date_to)
                    filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (update_date_from) {
                //data_owner-updatedAt-gsiインデックスを使う
                graphql = queries.ownerQueryByUpdateAt;
                condition_dict.updatedAt = { ge: update_date_from };
                if (base_date_to)
                    filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (base_date_to) {
                //data_owner-base_date-gsiインデックスを使う
                graphql = queries.ownerQueryByBaseDate;
                condition_dict.base_date = { le: base_date_to };
                if (update_date_to)
                    filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (update_date_to) {
                //data_owner-updatedAt-gsiインデックスを使う
                graphql = queries.ownerQueryByUpdateAt;
                condition_dict.updatedAt = { le: update_date_to };
                if (data_summary)
                    filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
            } else if (data_summary) {
                //data_owner-data_summary-gsiインデックスを使う
                graphql = queries.ownerQueryByDataSummary;
                condition_dict.data_summary = { beginsWith: data_summary };
            }
        } else {//管理者権限
            //インデックスなし
            graphql = queries.listPdSs;
            if (data_type)
                filter = Object.assign({}, filter, { data_type_detail: { beginsWith: data_type } });
            if (base_date_from && base_date_to) {
                filter = Object.assign({}, filter, { base_date: { between: [base_date_from, base_date_to] } });
            } else {
                if (base_date_from) {
                    filter = Object.assign({}, filter, { base_date: { ge: base_date_from } });
                } else if (base_date_to) {
                    filter = Object.assign({}, filter, { base_date: { le: base_date_to } });
                }
            }

            if (update_date_from && update_date_to) {
                filter = Object.assign({}, filter, { updatedAt: { between: [update_date_from, update_date_to] } });
            } else {
                if (update_date_from) {
                    filter = Object.assign({}, filter, { updatedAt: { ge: update_date_from } });
                } else if (update_date_to) {
                    filter = Object.assign({}, filter, { updatedAt: { le: update_date_to } });
                }
            }
            if (data_summary)
                filter = Object.assign({}, filter, { data_summary: { beginsWith: data_summary } });
        }
        if (Object.keys(filter).length)
            condition_dict.filter = filter;
        if (next_token)
            condition_dict.nextToken = next_token;
        let result = await common.executGraphql(graphql, condition_dict);
        for (let key in result.data) {
            if (result.data[key].nextToken && result.data[key].items.length === 0) {
                conditions.next_token = result.data[key].nextToken;
                result = await this.query(conditions);
            }
        }
        return result;

    }

    //データ検索
    searchBtn = async (e) => {
        e.stopPropagation();
        if (this.state.loading)
            return;
        this.setState({ loading: true });
        this.setState({ no_more_data: false });
        if (glv_pdl_sear_condition !== undefined)
            glv_pdl_sear_condition = {};
        //リセット
        this.setState({ no_data_msg: null, expanded: [], data_list: [], next_token: null });
        $('#messBox').html('');
        if (e.target.id === 'condition')
            glv_pdl_sear_condition = this.condition();
        else if (e.target.id === 'conditions')
            glv_pdl_sear_condition = this.conditions();

        let healthcare_id = glv_pdl_sear_condition.healthcare_id;
        //管理者のみ場合ヘルスケアIDのチェックがある
        if (healthcare_id && !common.inputCheck(healthcare_id)){
            if(this.state.permission)
                glv_pdl_error['healthcare_check'] = '<div>' + constants.HEALTHCARE_ID + constants.DATA_INPUT_ERROR4 + '</div>';
        } else {
            delete glv_pdl_error['healthcare_check'];
        }
        let error_flg = this.dateTimeCheck(glv_pdl_sear_condition);
        if (!error_flg[0])
            this.dateCompareCheck(glv_pdl_sear_condition.base_date_from,
                glv_pdl_sear_condition.base_date_to,
                'base_date_compare_error',
                constants.BASE_DATE
                + constants.DATA_INVERTED_ERROR1
                + constants.BASE_DATE +
                constants.DATA_INVERTED_ERROR2);
        if (!error_flg[1])
            this.dateCompareCheck(glv_pdl_sear_condition.update_date_from,
                glv_pdl_sear_condition.update_date_to,
                'update_date_compare_error',
                constants.UPDATA_DATE
                + constants.DATA_INVERTED_ERROR1
                + constants.UPDATA_DATE +
                constants.DATA_INVERTED_ERROR2);
        for (let key in glv_pdl_error)
            $('#messBox').append(glv_pdl_error[key]);
        if (Object.keys(glv_pdl_error).length) {
            this.setState({ loading: false });
            return;
        }
        glv_pdl_sear_condition.next_token = null;//リセット
        let result;
        try {
            result = await this.query(glv_pdl_sear_condition);
        } catch (e) {
            common.log().error(e);
            result = e;
        }
        this.setState({ loading: false });
        if (result.errors && result.errors.length > 0) {
            $('#messBox').html(result.errors[0].message);
        } else {
            for (let key in result.data) {
                if (key) {
                    let next_token = result.data[key].nextToken;
                    glv_pdl_cursor = null;
                    glv_pdl_list_datas = result.data[key].items;
                    if (result.data[key].items.length === 0) {
                        this.setState({
                            data_list: [],
                            next_token: null,
                            no_data_msg: <div className='text-center message'>{constants.NO_DATA}</div>
                        });
                    } else {
                        if (glv_pdl_list_datas.length > 10) {
                            for (let i = 0; i < 10; i++) {
                                this.setState({
                                    data_list: [...this.state.data_list, glv_pdl_list_datas[i]],
                                    next_token: next_token
                                });
                                if (i === 9)
                                    glv_pdl_cursor = glv_pdl_list_datas[i].id;
                            }
                        } else {
                            this.setState({
                                data_list: glv_pdl_list_datas,
                                next_token: next_token
                            });
                        }
                    }
                    glv_pdl_sear_condition.next_token = next_token;
                }
            }
        }
    }

    // 次のデータ検索
    nextSearch = async () => {
        if (this.state.loading)
            return;
        this.setState({ loading: true });
        let no_more_data = true;
        for (let i = 0; i < glv_pdl_list_datas.length; i++) {
            if (glv_pdl_cursor && glv_pdl_list_datas[i].id === glv_pdl_cursor) {
                for (let j = i + 1; j < glv_pdl_list_datas.length; j++) {
                    no_more_data = false;
                    this.setState({
                        data_list: [...this.state.data_list, glv_pdl_list_datas[j]]
                    });
                    if (j - i === 10) {
                        glv_pdl_cursor = glv_pdl_list_datas[j].id;
                        this.setState({ loading: false });
                        return;
                    } else if (j === glv_pdl_list_datas.length - 1) {
                        this.setState({ loading: false });
                        glv_pdl_cursor = null;
                        return;
                    }
                }
                break;
            }
        }
        if (!this.state.next_token) {
            this.setState({
                loading: false,
                no_more_data: true
            });
            return;
        }
        glv_pdl_list_datas = [];
        glv_pdl_sear_condition.next_token = this.state.next_token;
        let result;
        try {
            result = await this.query(glv_pdl_sear_condition);
        } catch (e) {
            common.log().error(e);
            result = e;
        }
        this.setState({ loading: false });
        if (result.errors && result.errors.length > 0) {
            this.setState({ data_list: [], next_token: null });
            $('#messBox').html(result.errors[0].message);
        } else {
            for (let key in result.data) {
                if (key) {
                    glv_pdl_cursor = null;
                    let next_token = result.data[key].nextToken;
                    glv_pdl_list_datas = result.data[key].items;
                    if (no_more_data && result.data[key].items.length === 0
                        && this.state.data_list.length > 0) {
                        this.setState({ no_more_data: true });
                    } else {
                        if (glv_pdl_list_datas.length > 10) {
                            for (let i = 0; i < 10; i++) {
                                this.setState({
                                    data_list: [...this.state.data_list, glv_pdl_list_datas[i]],
                                    next_token: next_token
                                });
                                if (i === 9) {
                                    glv_pdl_cursor = glv_pdl_list_datas[i].id;
                                }
                            }

                        } else {
                            this.setState({
                                data_list: this.state.data_list.concat(glv_pdl_list_datas),
                                next_token: next_token
                            });
                        }
                    }
                    glv_pdl_sear_condition.next_token = next_token;
                }
            }
        }
    };

    //展開処理
    handleOnExpand = (row, is_expand, row_index, e) => {
        if (is_expand) {
            this.setState({
                expanded: [...this.state.expanded, row.id]
            });
        } else {
            this.setState({
                expanded: this.state.expanded.filter(x => x !== row.id)
            });
        }
    }

    //上に戻る
    goTop = () => {
        $('html,body').animate({ scrollTop: 0 }, 400);
    }

    render() {
        //カラム定義
        const columns = [{
            dataField: 'id',
            text: 'id',
            hidden: true,
        }, {
            dataField: 'data_summary',
            text: 'data_summary',
            formatter: this.operateFormatter
        }];

        //行の展開
        const expandRow = {
            renderer: (row) => (
                (<React.Fragment>
                    <div className='row col-md-12'>
                        <div className='col-md-2'><b>データ概要</b></div>
                        <div className='col-md-10 border-bottom wrap'>{row.data_summary}</div>
                        <div className='col-md-2'><b>データ種別</b></div>
                        <div className='col-md-4 border-bottom wrap'>{row.data_type}</div>
                        <div className='col-md-2'><b>ヘルスケアID</b></div>
                        <div className='col-md-4 border-bottom wrap'>{row.healthcare_id}</div>
                        <div className='col-md-2'><b>基準日</b></div>
                        <div className='col-md-4 border-bottom wrap'>{common.numdateToStrdate(row.base_date)}</div>
                        <div className='col-md-2'><b>提供元</b></div>
                        <div className='col-md-4 border-bottom wrap'>{row.data_owner}</div>
                        <div className='col-md-2'><b>更新日時</b></div>
                        <div className='col-md-4 border-bottom wrap'>{common.ios8601DateToStrDate(row.updatedAt)}</div>
                    </div>
                    {this.detailFormatterBtn(row)}
                </React.Fragment>)
            ),
            expanded: this.state.expanded,
            onExpand: this.handleOnExpand
        };

        return (
            <React.Fragment>
                <Header {...this.state} parent={this} />
                {/* 本文 */}
                <div className='container mt-5' id='id_content_container'>
                    {/* データ検索 */}
                    <div className='row mt-2'>
                        <div className='col-12'>
                            <form className='my-0' id='search_form'>
                                {/* 検索 */}
                                <div className='form-group d-flex justify-content-center align-items-center my-0'>
                                    <div className='input-group data-type-container'>
                                        <input type='text' className='form-control' placeholder='データ種別' id='data_type' size='15' />
                                        <div className='input-group-append'>
                                            <button id='condition' type='button' className='btn btn-primary' onClick={(e) => this.searchBtn(e)}>
                                                <i className='fas fa-search prevent-event'></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className='dropdown ml-2'>
                                        <button type='button' className='btn btn-outline-primary dropdown-toggle btn-sm'
                                            data-toggle='collapse' data-target='#id_mydata_criteria_detail'
                                            aria-expanded='false' aria-controls='id_mydata_criteria_detail'
                                            id='condition_detail'>詳細検索
                                        </button>
                                    </div>
                                </div>
                                {/* 詳細検索 */}
                                <div className={'mt-2 mx-md-auto col-md-11 border rounded p-2 '+ (this.state.condition_flg?'show':'collapse')}
                                    id='id_mydata_criteria_detail'>
                                    <div className='form-control-plaintext'>
                                        {/*データ概要*/}
                                        <div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                            <div className='col-md-3'>
                                                <label className='col-form-label'>データ概要</label>
                                            </div>
                                            <div className='input-group col-md-9'>
                                                <input className='form-control' id='data_summary' type='text' />
                                            </div>
                                        </div>

                                        {
                                            //提供元権限
                                            this.state.permission === constants.OWNER_PERMISSION &&
                                            (<div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                                <div className='col-md-3'>
                                                    <label className='col-form-label'>ヘルスケアID</label>
                                                </div>
                                                <div className='input-group col-md-9'>
                                                    <input className='form-control' id='healthcare_id' type='text' />
                                                </div>
                                            </div>)
                                        }


                                        {
                                            //管理者権限
                                            this.state.permission === constants.ADMIN_PERMISSION &&
                                            (
                                                <React.Fragment>
                                                    <div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                                        <div className='col-md-3'>
                                                            <label className='col-form-label'>ヘルスケアID</label>
                                                        </div>
                                                        <div className='input-group col-md-9'>
                                                            <input className='form-control' id='healthcare_id' type='text' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                                        <div className='col-md-3'>
                                                            <label className='col-form-label'>提供元</label>
                                                        </div>
                                                        <div className='input-group col-md-9'>
                                                            <input className='form-control' id='data_owner' type='text' />
                                                        </div>
                                                    </div>
                                                </React.Fragment>)

                                        }
                                        {
                                            //会員権限
                                            !this.state.permission &&
                                            (<div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                                <div className='col-md-3'>
                                                    <label className='col-form-label'>提供元</label>
                                                </div>
                                                <div className='input-group col-md-9'>
                                                    <input className='form-control' id='data_owner' type='text' />
                                                </div>
                                            </div>)
                                        }
                                        {/*基準日*/}
                                        <div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                            <div className='col-md-3'>
                                                <label className='col-form-label'>基準日</label>
                                            </div>
                                            <div className='row col-md-9 m-0 pr-0 d-flex align-items-center'>
                                                <div className='col-5 col-md-5 m-0 p-0'>
                                                    <DatePicker id='base_date_from' className='form-control'
                                                        todayButton='今日' dateFormat='yyyy-MM-dd' autocomplete='off'
                                                        showMonthDropdown showYearDropdown
                                                        selected={this.state.base_date_from} onChange={value => {
                                                            this.setState({ base_date_from: value })
                                                        }} />
                                                </div>
                                                <div className='center'>
                                                    <label
                                                        className='col-form-label px-xl-2 pl-xl-2 pr-xl-2 pl-md-2 pr-md-2 pl-2 pr-2'>～</label>
                                                </div>
                                                <div className='col-5 col-md-5 m-0 p-0'>
                                                    <DatePicker id='base_date_to' className='form-control'
                                                        todayButton='今日' dateFormat='yyyy-MM-dd' autocomplete='off'
                                                        showMonthDropdown showYearDropdown
                                                        selected={this.state.base_date_to} onChange={value => {
                                                            this.setState({ base_date_to: value })
                                                        }} />
                                                </div>
                                            </div>
                                        </div>
                                        {/*更新日*/}
                                        <div className='form-group row col-md-10 m-0 p-0 mt-1'>
                                            <div className='col-md-3'>
                                                <label className='col-form-label'>更新日</label>
                                            </div>
                                            <div className='row col-md-9 m-0 pr-0 d-flex align-items-center'>
                                                <div className='col-5 col-md-5 m-0 p-0'>
                                                    <DatePicker id='update_date_from' className='form-control'
                                                        todayButton='今日' dateFormat='yyyy-MM-dd' autoComplete='off'
                                                        showMonthDropdown showYearDropdown
                                                        selected={this.state.update_date_from} onChange={value => {
                                                            this.setState({ update_date_from: value })
                                                        }} />
                                                </div>
                                                <div className='center'>
                                                    <label
                                                        className='col-form-label pl-xl-2 pr-xl-2 pl-md-2 pr-md-2 pl-2 pr-2'>～</label>
                                                </div>
                                                <div className='col-5 col-md-5 m-0 p-0'>
                                                    <DatePicker id='update_date_to' className='form-control'
                                                        todayButton='今日' dateFormat='yyyy-MM-dd' autocomplete='off'
                                                        showMonthDropdown showYearDropdown
                                                        selected={this.state.update_date_to} onChange={value => {
                                                            this.setState({ update_date_to: value })
                                                        }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-center'>
                                        <button id='conditions' type='button' className='btn btn-primary col-md-6' onClick={(e) => this.searchBtn(e)}>
                                            <i className='fas fa-search prevent-event'></i>検索
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <table className='message-font col-md-12' id='messBox'></table>
                    {/* データ検索一覧 */}
                    <BootstrapTable id='table' keyField='id' data={this.state.data_list}
                        bordered={false} columns={columns} expandRow={expandRow}
                        headerClasses='d-none' classes='data-list-table'
                        noDataIndication={this.state.no_data_msg} />
                    <div className={'text-center message ' + (this.state.loading ? 'show' : 'd-none')}>{constants.LODING}</div>
                    <div className={'text-center message ' + (this.state.no_more_data ? 'show' : 'd-none')}>{constants.NO_MORE_DATA}</div>
                    <div className={this.state.arrow_show ? 'show' : 'd-none'}
                        style={{ 'overflow': 'hidden', 'position': 'fixed', 'right': '16%', 'bottom': '10%', 'zIndex': '10' }}>
                        <div className='arrow-middel-container'>
                            <div className='back-to-top' style={{ 'cursor': 'pointer', 'color': '#1e90ff' }} onClick={() => this.goTop()}>
                                <i className='fas fa-arrow-up'></i>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </React.Fragment>
        );
    }
}
