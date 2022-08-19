import config from "../aws-exports";

//ユーザ情報
export const clientId = config.aws_user_pools_web_client_id;
export const identityPoolId = config.aws_cognito_identity_pool_id;
export const EXPIRED_URL = config.aws_cloud_logic_custom[0].endpoint;
export const API_KEY = 'Js3qraTy0P6wvXjX1MzTN1P9WzNdhGAc1UrFBQBT';
export const AUTH_LEVEL = 'private';

//path
export const FILES_PATH = '/files';
export const DEFAULT_PATH = '/';
export const TOP_PATH = '/pds_index';
export const DATA_LIST_PATH = '/pds_person_list';
export const DATA_DETAIL_PATH = '/pds_person_detail';
export const DATA_OPERATION_PATH = '/pds_person_data_operation';
export const FILE_OPERATION_PATH = '/pds_person_file_operation';
export const NOT_FOUND_PATH = '/404';

//permisson
export const OWNER_PERMISSION = 'owner';
export const ADMIN_PERMISSION = 'admin';

//ラベル
export const LABEL_USER = '様';
export const LABEL_CLOSE = '閉じる';
export const TOP_TITLE = 'トップ';
export const LABEL_MENU = 'メニュー';
export const DATA_DETAIL_TILE = '預託データ詳細';
export const DATA_EDITOR_TITLE = 'データ編集';
export const ESCROW_DATA_TITLE = '預託データ';
export const DATA_ADD_TITLE = 'データ登録';
export const FILE_ADD_TITLE = 'ファイル登録';
export const FILE_EDITOR_TITLE = 'ファイル編集';
export const ACCOUNT_ADD_TITLE = 'アカウントの新規登録';
export const NOT_FOUND_TITLE = '404';
export const UPDATA_DATE = '更新日';
export const BASE_DATE = '基準日';
export const HEALTHCARE_ID = 'ヘルスケアID';
export const DATA_OWNER = '提供元';
export const DATA_TYPE = 'データ種別';
export const DATA_SUMMARY = 'データ概要';
export const CONFIRM_BUTTON = '確定';
export const BUTTON_NAME_DATA_UPDATE = "更新";
export const BUTTON_NAME_DATA_ADD = '登録';
export const DELETE_CONFIRM_BUTTON = '削除する';
export const UPDATA_CONFIRM_BUTTON = '更新する';
export const ADD_CONFIRM_BUTTON = '登録する';
export const LOGOUT_CONFIRM_BUTTON = 'ログアウトする';

//セッションストレージキー
export const SESSION_STOREGE_DATAS = 'datas';
export const SESSION_STOREGE_OBJ = 'obj';
export const SESSION_STOREGE_NEXT_TOKEN = 'next_token';
export const SESSION_STOREGE_BASE_DATE_FROM = 'base_date_from';
export const SESSION_STOREGE_BASE_DATE_TO = 'base_date_to';
export const SESSION_STOREGE_UPDATE_DATE_FROM = 'update_date_from';
export const SESSION_STOREGE_UPDATE_DATE_TO = 'update_date_to';
export const SESSION_STOREGE_SEAR_CONDITION = 'sear_condition';
export const SESSION_STOREGE_EXPANDED_LIST = 'expanded_list';
export const SESSION_STOREGE_CASH_LIST_DATAS = 'cash_list_datas';
export const SESSION_STOREGE_CURSOR = 'cursor';
export const SESSION_STOREGE_SCROLL_TOP = 'scroll_top';
export const SESSION_STOREGE_NO_MORE_DATA = 'no_more_data';
export const SEESION_STOREGE_SCROLL_FLG = 'scroll_flg';
export const SESSION_STOREGE_CONDITION_FLG = 'condition_flg';

// メッセージ
export const LODING = '読み込み中です。少々お待ちください...';
export const NO_MORE_DATA = '最後まで検索しました。';
export const NO_DATA = '該当するレコードが見つかりません';
export const INPUT_NULL_ERROR = 'を入力してください。';
export const DATA_INPUT_ERROR1 = '開始日はyyyy-MM-ddの形で入力ください。';
export const DATA_INPUT_ERROR2 = '終了日はyyyy-MM-ddの形で入力ください。';
export const DATA_INPUT_ERROR3 = 'はyyyy-MM-ddの形で入力ください。';
export const DATA_INPUT_ERROR4 = 'は半角英数字記号を入力してください。';
export const DATA_INVERTED_ERROR1 = '終了日には';
export const DATA_INVERTED_ERROR2 = '開始日以降の日付を指定してください。';
export const DOWNLOAD_ERROR = 'ブラウザはダウンロードをサポートしていません。';
export const DATA_ADD_MSG = 'データを登録してもよろしいでしょうか？';
export const DATA_UPDATE_MSG = 'データを更新してもよろしいでしょうか？';
export const DATA_DELETE_MSG = 'データを削除してもよろしいでしょうか？';
export const ADD_DATA_SUCCESS_MSG = 'データ登録に成功しました。';
export const ADD_DATA_FAIL_MSG = 'データ登録に失敗しました。';
export const UPDATA_DATA_SUCCES_MSG = 'データ更新に成功しました。';
export const UPDATA_DATA_FAIL_MSG = 'データ更新に失敗しました。';
export const DELETE_DATA_SUCCESS_MSG = 'データ削除に成功しました。';
export const DELETE_DATA_FAIL_MSG = 'データ削除に失敗しました。';
export const FILE_ADD_MSG = 'ファイルを登録してもよろしいでしょうか？';
export const FILE_UPDATE_MSG = 'ファイルを上書してもよろしいでしょうか？';
export const FILE_DELETE_MSG = 'ファイルを削除してもよろしいでしょうか？';
export const FILE_UPDATE_SUCCESS_MSG = 'ファイル更新に成功しました。';
export const FILE_UPDATE_FAIL_MSG = 'ファイル更新に失敗しました。';
export const FILE_ADD_SUCCESS_MSG = 'ファイル登録に成功しました。';
export const FILE_ADD_FAIL_MSG = 'ファイル登録に失敗しました。';
export const FILE_DELETE_SUCCESS_MSG = 'ファイル削除に成功しました。';
export const FILE_DELETE_FAIL_MSG = 'ファイル削除に失敗しました。';
export const LOGOUT_MSG = 'ログアウトしてもよろしいでしょうか？';
export const RETRY_MSG = 'もう一度お試しください。';
export const NO_FILE_NAME_MSG = '有効なファイル名ではありません。';
export const FILE_NOT_EXIST_MSG = 'ファイルが見つかりませんでした。';
export const DATA_NO_CHANGE = 'データは何も変わりません。';
export const ERROR_HAPPEND = '予期せぬエラーが発生しました。';
export const CANT_SEARCH_DATA = 'このユーザーにはデータ検索ができない。';


const FILE = {
    //ファイルのContent-Type
    'CONTENT_TYPE_PDF': 'application/pdf',
    'CONTENT_TYPE_XML': 'application/xml',
    'CONTENT_TYPE_EXE': 'application/octet-stream',
    'CONTENT_TYPE_JPEG': 'image/jpeg',
    'CONTENT_TYPE_PNG': 'image/png',
    'CONTENT_TYPE_GIF': 'image/gif',
    'CONTENT_TYPE_BMP': 'image/bmp',
    'CONTENT_TYPE_JSON': 'application/json',
    'CONTENT_TYPE_CSV': 'text/csv',
    'CONTENT_TYPE_TXT': 'text/plain',
    'CONTENT_TYPE_HTML': 'text/html',
    'CONTENT_TYPE_DEFAULT': '*',

    //ファイルタイプ
    'FILE_TYPE_PDF': 'pdf',
    'FILE_TYPE_XML': 'xml',
    'FILE_TYPE_EXE': 'exe',
    'FILE_TYPE_JPG': 'jpg',
    'FILE_TYPE_JPEG': 'jpeg',
    'FILE_TYPE_GIF': 'gif',
    'FILE_TYPE_PNG': 'png',
    'FILE_TYPE_BMP': 'bmp',
    'FILE_TYPE_JSON': 'json',
    'FILE_TYPE_CSV': 'csv',
    'FILE_TYPE_TXT': 'txt',
    'FILE_TYPE_HTML': 'html'
};

export default FILE;
