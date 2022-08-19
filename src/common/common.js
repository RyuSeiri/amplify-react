import $ from 'jquery';
import { Auth, Storage, API, Logger } from 'aws-amplify';
import FILE from './constants';
import * as constants from './constants';

/*
 * 半角チェック(半角スペース含まない)
 * True:半角、False:全角
 */
export const inputCheck = (val) => {
    if (val.match(/^[\x20-\x7e]+$/)) {
        if(!val.match(/\s+/))
            return true;
        else
            return false;
    }
    return false;
};

/*
 * 日付チェック
 * 日付の場合：Ture
 * 日付ではない場合：False
 */
export const dateFormatCheck = (data) => {
    let reg = /^(\d{4})-(\d{2})-(\d{2})$/;
    if ((data && !reg.test(data)) || parseInt(RegExp.$2) > 12 || parseInt(RegExp.$3) > 31) {
        return false;
    }
    return true;
};

/*
 * 日付比較
 * 開始日<=終了日場合：Ture
 * 開始日>終了日場合：False
 */
export const dateCompareCheck = (beginDate, endDate) => {
    let d1 = new Date(beginDate.replace(/-/g, '/'));
    let d2 = new Date(endDate.replace(/-/g, '/'));
    if (beginDate !== '' && endDate !== '' && d1 > d2) {
        return false;
    }
    return true;
};

//URLの引数取得
export const getUrlParame = (name) => {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    let r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]); return null;
};


/*
 * 日付からStringに変換
 * 例：2019-12-05 17:16:12⇒20191205171612
 */
export const dateToStr = (date) => {
    if (date)
        return date.replace(/(\b[-]|\b:|\s|[.])/g, '');
    else
        return '';
};

/*
 * Stringから日付に変換
 * 例：20100124⇒2010-01-24
 * @numdate {String} データ
 */
export const numdateToStrdate = (numdate) => {
    let strdate = '';
    if (numdate) {
        let data_length = numdate.length;
        if (data_length === 8) {
            strdate = numdate.substr(0, 4) + '-' + numdate.substr(4, 2) + '-' + numdate.substr(6, 2);
        } else if (data_length === 14) {
            strdate = numdate.substr(0, 4) + '-' + numdate.substr(4, 2) + '-' + numdate.substr(6, 2) +
                ' ' + numdate.substr(8, 2) + ':' + numdate.substr(10, 2) + ':' + numdate.substr(12, 2);
        } else if (17 <= data_length && data_length <= 20) {
            strdate = numdate.substr(0, 4) + '-' + numdate.substr(4, 2) + '-' + numdate.substr(6, 2) +
                ' ' + numdate.substr(8, 2) + ':' + numdate.substr(10, 2) + ':' + numdate.substr(12, 2) +
                '.' + numdate.substr(14, data_length - 14);
        }
    }
    return strdate;
};

/*
 * 時間変換
 * 例：2020-01-15T08:38:58.207Z⇒22020-1-15 17:38:58
 */
export const ios8601DateToStrDate = (str) => {
    let d = new Date(str);
    return formatDate(d);
};

/*
 * 時間変換
 * 例：2020-1-15 17:38:58⇒2020-01-15T08:38:58.207Z
 */
export const strDateToIosO8601Date = (str) => {
    let d = new Date(str);
    return d.toISOString();
};

//時間フォーマット
export const formatDate = (date, fmt) => {
    if (typeof date === 'string') {
        return date;
    }
    if (!fmt) fmt = 'yyyy-MM-dd hh:mm:ss';
    if (!date || date === null) return null;
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
    return fmt;
};

//サインインアウト
export const signOut = () => {
    Auth.signOut() //Auth.signOut({ global: true })
        .then(data => log().info(data))
        .catch(err => log().debug(err));
    $(window.location).attr('href', '/');
};

//ユーザー情報取得
export const getUserGroups = async() =>{
    let current_User = await Auth.currentAuthenticatedUser();
    //ユーザーグループを取得する
    return current_User.signInUserSession.accessToken.payload['cognito:groups'];
};

//ファイルアップロード
export const fileUploadByEvent = (e) => {
    let file = e.target.files[0];
    let file_name = file.name;
    let content_type = getContentType(file_name);
    try {
        return Storage.put(file_name, file, {
            level: constants.AUTH_LEVEL,
            contentType: content_type
        });
    } catch (e) {
        throw e;
    }
};

//ファイルアップロード
export const fileUploadByFile = (path, file) => {
    let file_name = file.name;
    let content_type = getContentType(file_name);
    try {
        return Storage.put(path + '/' + file_name, file, {
            progressCallback(progress) {
                console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            },
            level: constants.AUTH_LEVEL,
            contentType: content_type
        });
    } catch (e) {
        throw e;
    }
};


//IdentityIdを取得
export const getIdentityProviders = () => {
    return local.get('aws.cognito.identity-id.' + constants.identityPoolId);
};
//ユーザー名取得
export const getUser = () => {
    return local.get('CognitoIdentityServiceProvider.'
        + constants.clientId + '.LastAuthUser');
};

//アクセストークンを取得
export const getAccessToken = () => {
    return local.get('CognitoIdentityServiceProvider.'
        + constants.clientId + '.' + getUser() + '.accessToken');
};


//権限付きURL取得
export const getExpiredUrl = (url) => {
    let result;
    $.ajax({
        type: 'POST',
        url: constants.EXPIRED_URL + constants.FILES_PATH,
        async: false,
        dataType: 'json',
        headers: {
            'x-api-key': constants.API_KEY,
            'Authorization': getAccessToken()
        },
        data: JSON.stringify({
            'action': 'get',
            'key-name': url
        })
    })
        .done(function (data) {
            result = data.url;
        })
        .fail(function (data) {
            log().error(data);
            result = data;
        });
    return result;
};

//ファイル削除
export const fileDelete = (url) => {
    $.ajax({
        type: 'POST',
        url: constants.EXPIRED_URL + constants.FILES_PATH,
        async: false,
        dataType: 'json',
        headers: {
            'x-api-key': constants.API_KEY,
            'Authorization': getAccessToken()
        },
        data: JSON.stringify({
            'action': 'delete',
            'key-name': url
        })
    })
        .done(function (data) {
            $.ajax({
                type: 'DELETE',
                url: data.url,
                async: false,
            }).done(function (result) {
                //何もしない
            }).fail(function (data) {
                log().error(data);
            });
        })
        .fail(function (data) {
            log().error(data);
        });
};

//ファイル存在チェック
export const fileList = (file_name) => {
    try {
        return Storage.list(file_name, {
            level: constants.AUTH_LEVEL
        });
    } catch (e) {
        throw e;
    }
};

//ContentTypeを取得
const getContentType = (file_name) => {
    let content_type;
    let index = file_name.lastIndexOf('.');
    let file_type = file_name.substring(index + 1).toLowerCase();
    switch (file_type) {
        case FILE.FILE_TYPE_PNG:
            content_type = FILE.CONTENT_TYPE_PNG;
            break;
        case FILE.FILE_TYPE_GIF:
            content_type = FILE.CONTENT_TYPE_GIF;
            break;
        case FILE.FILE_TYPE_BMP:
            content_type = FILE.CONTENT_TYPE_BMP;
            break;
        case FILE.FILE_TYPE_JPG:
        case FILE.FILE_TYPE_JPEG:
            content_type = FILE.CONTENT_TYPE_JPEG;
            break;
        case FILE.FILE_TYPE_JSON:
            content_type = FILE.CONTENT_TYPE_JSON;
            break;
        case FILE.FILE_TYPE_PDF:
            content_type = FILE.CONTENT_TYPE_PDF;
            break;
        case FILE.FILE_TYPE_XML:
            content_type = FILE.CONTENT_TYPE_XML;
            break;
        case FILE.FILE_TYPE_EXE:
            content_type = FILE.CONTENT_TYPE_EXE;
            break;
        case FILE.FILE_TYPE_CSV:
            content_type = FILE.CONTENT_TYPE_CSV;
            break;
        case FILE.FILE_TYPE_TXT:
            content_type = FILE.CONTENT_TYPE_TXT;
            break;
        case FILE.FILE_TYPE_HTML:
            content_type = FILE.CONTENT_TYPE_HTML;
            break;
        default:
            content_type = FILE.CONTENT_TYPE_DEFAULT;
            break;
    }
    return content_type;
};


//graphql実行
export const executGraphql = (graphql, condition_dict) => {
    if (condition_dict && Object.keys(condition_dict).length)
        return API.graphql({ query: graphql, variables: condition_dict });
    else
        return API.graphql({ query: graphql });
};


//セッションストレージ
export const session = {
    //設定
    set(key, value, expires) {
        // 有効時間はミリ秒
        let params = { key, value, expires };
        if (expires) {
            // 有効時間を追加
            const data = Object.assign(params, { startTime: new Date().getTime() });
            sessionStorage.setItem(key, JSON.stringify(data));
        } else {
            if (Object.prototype.toString.call(value) === '[object Object]') {
                value = JSON.stringify(value);
            }
            if (Object.prototype.toString.call(value) === '[object Array]') {
                value = JSON.stringify(value);
            }
            sessionStorage.setItem(key, value);
        }
    },
    //取得
    get(key) {
        let item = sessionStorage.getItem(key);
        try {
            item = JSON.parse(item);
        } catch (e) {
        }
        // 有効期間チェック
        if (item && item.startTime) {
            let date = new Date().getTime();
            // 失効
            if (date - item.startTime > item.expires) {
                sessionStorage.removeItem(key);
                return false;
            } else {
                return item.value;
            }
        } else {
            return item;
        }
    },
    // 削除
    remove(key) {
        sessionStorage.removeItem(key);
    },
    // クリア
    clear() {
        sessionStorage.clear();
    }
};


//ローカルストレージ
export const local = {
    //設定
    set(key, value, expires) {
        // 有効時間はミリ秒
        let params = { key, value, expires };
        if (expires) {
            // 有効時間を追加
            const data = Object.assign(params, { startTime: new Date().getTime() });
            window.localStorage.setItem(key, JSON.stringify(data));
        } else {
            if (Object.prototype.toString.call(value) === '[object Object]') {
                value = JSON.stringify(value);
            }
            if (Object.prototype.toString.call(value) === '[object Array]') {
                value = JSON.stringify(value);
            }
            window.localStorage.setItem(key, value);
        }
    },
    //取得
    get(key) {
        let item = window.localStorage.getItem(key);
        try {
            item = JSON.parse(item);
        } catch (e) {
        }
        // 有効期間チェック
        if (item && item.startTime) {
            let date = new Date().getTime();
            // 失効
            if (date - item.startTime > item.expires) {
                window.localStorage.removeItem(key);
                return false;
            } else {
                return item.value;
            }
        } else {
            return item;
        }
    },
    // 削除
    remove(key) {
        window.localStorage.removeItem(key);
    },
    // クリア
    clear() {
        window.localStorage.clear();
    }
};

/*
 *log().info('info bar');
 *log().debug('debug bar');
 *log().warn('warn bar');
 *log().error('error bar');
 */
export const log = (logger_lever) => {
    if (!logger_lever)
        logger_lever = 'INFO';
    return new Logger('output:', logger_lever);
};
