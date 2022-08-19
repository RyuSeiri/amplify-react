import $ from 'jquery';
import React, { Component } from 'react';
import Header from '../common/header';
import Footer from '../common/footer';
import FILE from '../common/constants';
import * as constants from '../common/constants';
import * as common from '../common/common';
import Encoding from 'encoding-japanese';
//ページ
var glv_pdl_file_number = 0;
//詳細データ情報
var glv_pdl_arr_url = [];
//ファイルタイプ
var glv_pdl_file_type;
export default class PseronDetail extends Component {

    state = {
        backflg: true,
        file_name: '',
        file_type: '',
        disabled: true,
        history: this.props.history
    }

    componentDidMount() {
        //タイトル設定
        $('[name="title"]').html(constants.DATA_DETAIL_TILE);
        //ファイルタイプ取得
        try {
            glv_pdl_file_type = this.props.location.state.file_type;
        } catch (e) {
            glv_pdl_file_type = null;
        }
        //ファイルタイプはNULLの場合トップ画面に遷移
        if (!glv_pdl_file_type) {
            this.props.history.push(constants.TOP_PATH);
            return;
        }
        this.setState({
            file_type: glv_pdl_file_type.toLowerCase()
        });
        //セッションストレージから詳細データを取得する
        glv_pdl_arr_url = common.session.get(constants.SESSION_STOREGE_OBJ);
        // 初期表示
        if (glv_pdl_arr_url[glv_pdl_file_type].length > 1)
            $('#page_next').closest('li').removeClass('disabled');
        // ファイル表示
        this.pageShow(this.getUrl(glv_pdl_file_number, glv_pdl_file_type)[0]);
    }


    //詳細データ表示
    pageShow = async (file_url) => {
        let tmp = file_url.split('/');
        let file_name = tmp[tmp.length - 1];

        let index = file_name.lastIndexOf('.');
        let data_name = file_name.substring(0, index);
        this.setState({
            file_name: data_name
        });
        let url = await common.getExpiredUrl(file_url);//期限付きURLを取得する
        let iframe = $('#file_container')[0];
        $('#download').attr('disabled', 'disabled');
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url, true);//ファイル内容を取得し、ファイルタイプによって、内容を表示する
        // レスポンスタイプ：blob
        xmlhttp.responseType = 'blob';
        $('#load').show();
        xmlhttp.onload = function () {
            if (this.status === 200) {//成功の場合
                $('#download').removeClass('disabled');
                $('#download').removeAttr('disabled');
                $('#load').hide();
                let blob = this.response; // 例：Blob {size: 82124, type: "application/pdf"}
                let reader = new FileReader();
                switch (glv_pdl_file_type) {
                    case FILE.FILE_TYPE_XML:
                    case FILE.FILE_TYPE_CSV:
                    case FILE.FILE_TYPE_HTML:
                    case FILE.FILE_TYPE_TXT:
                    case FILE.FILE_TYPE_JSON:
                        reader.onload = function (e) {
                            try {
                                // 文字コード判定、encodeにUTF8 or SJISが格納
                                let codes = new Uint8Array(reader.result);
                                let encode = Encoding.detect(codes);
                                // バイナリデータをUTF-8、String型の文字列に変換
                                let convertData = Encoding.convert(codes, {
                                    to: 'unicode',
                                    from: encode,
                                    type: 'string',
                                });
                                iframe.src = window.URL.createObjectURL(new window.Blob([convertData],
                                                                            { type: FILE.CONTENT_TYPE_TXT }));
                            } catch (e) {
                                common.log().error(e);
                            }
                        };
                        reader.readAsArrayBuffer(blob);
                        break;
                    default:
                        iframe.src = window.URL.createObjectURL(blob);
                        break;
                }
            } else {//失敗の場合
                $('#download').addClass('disabled');
                $('#download').attr('disabled', 'disabled');
                $('#load').hide();
                let not_exist_blob = new window.Blob([constants.FILE_NOT_EXIST_MSG], { type: FILE.CONTENT_TYPE_HTML });
                iframe.src = window.URL.createObjectURL(not_exist_blob);
                return;
            }
        };
        xmlhttp.send();
    }

    //ファイルダウンロード
    download = (e) => {
        e.preventDefault();
        if ('download' in document.createElement('a')) {
            // ファイルダウンロード
            let download_link = document.createElement('a');
            download_link.download = this.state.file_name + '.' + this.state.file_type;
            download_link.style.display = 'none';
            // blobパス取得
            download_link.href = document.getElementById('file_container').src;
            // クリックし、ダウンロードする
            document.body.appendChild(download_link);
            download_link.click();
            // 削除
            document.body.removeChild(download_link);
        } else {
            alert(constants.DOWNLOAD_ERROR);
        }
    }

    //ページナンバーとファイルタイプにより、ファイル情報をsessionStorageから取得する。
    getUrl = (page_num, file_type) => {
        let file_url = glv_pdl_arr_url[file_type][page_num].url;
        let file_name = glv_pdl_arr_url[file_type][page_num].data_name;
        let length = glv_pdl_arr_url[file_type].length;
        return [file_url, file_name, length];
    }

    //前へ
    pagePrev = (e) => {
        let page_number = parseInt($('#page').html(), 10) - 1;
        $('#page').html(page_number);
        if (page_number === 1) {
            $('#page_prev').parent().addClass('disabled');
        } else {
            $('#page_prev').parent().removeClass('disabled');
        }
        $('#page_next').parent().removeClass('disabled');
        glv_pdl_file_number = page_number - 1;
        let file_info = this.getUrl(glv_pdl_file_number, glv_pdl_file_type);
        this.pageShow(file_info[0]);
    }

    //次へ
    nextPage = (e) => {
        let page_number = parseInt($('#page').html(), 10) + 1;
        $('#page').html(page_number);
        glv_pdl_file_number = page_number - 1;
        let file_info = this.getUrl(glv_pdl_file_number, glv_pdl_file_type);
        $('#page_prev').parent().removeClass('disabled');
        if (page_number < file_info[2]) {
            $('#page_next').parent().removeClass('disabled');
        } else {
            $('#page_next').parent().addClass('disabled');
        }
        this.pageShow(file_info[0]);
        $('[name=file_name]').html(file_info[1]);
    }

    render() {
        return (
            <React.Fragment>
                <Header {...this.state} parent={this} />
                <div className='container' id='id_content_container'>
                    <div className='input-group-append row col-md-12 breadcrumb'>
                        <b className='wrap'>{this.state.file_name}</b>
                        <span className='badge badge-pill badge-success ml-2'>{this.state.file_type}</span>
                    </div>
                    <div className='form-group file-parent-container col-md-12' id='pdfRightlist'>
                        <div id='load' className='justify-content-center align-content-center breadcrumb file-container text-dark'
                            style={{ 'backgroundColor': 'transparent', 'position': 'absolute', 'width': '100%', 'opacity': '1', 'zIndex': '4', 'display': 'none' }}>
                            <span className="spinner-border spinner-border-sm"></span>
                            ロード中...
                        </div>
                        <iframe id='file_container' title='title' frameBorder='0'
                            className='breadcrumb file-container col-md-12'>
                        </iframe>
                    </div>
                    <div className='input-group-append justify-content-center'>
                        <ul className='pagination'>
                            <li className='page-item disabled'>
                                <div className='page-link' style={{ 'cursor': 'pointer' }}
                                    onClick={this.pagePrev} id='page_prev'>前へ</div>
                            </li>
                            <li className='page-item active page-link' id='page'>1</li>
                            <li className='page-item disabled'>
                                <div className='page-link' style={{ 'cursor': 'pointer' }}
                                    onClick={this.nextPage} id='page_next'>次へ</div>
                            </li>
                        </ul>
                    </div>
                    <div className='d-flex justify-content-center'>
                        <button id='download' onClick={(e) => this.download(e)} style={{ 'cursor': 'pointer' }}
                            className='btn btn-primary btn-block disabled download-button'>
                            <i className='fas fa-download mr-1 prevent-event'></i>ダウンロード
                        </button>
                    </div>
                </div>
                <Footer />
            </React.Fragment>
        );
    }
}
