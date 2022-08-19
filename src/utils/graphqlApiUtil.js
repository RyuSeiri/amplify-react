import Amplify, { API } from 'aws-amplify';
import config from "./aws-exports";

Amplify.configure(config);

/**
 * GraphQL実行
 * @param {string} query 作成、更新、削除、検索のGraphQL
 * @param {object} input 項目(設定無し可)
 * @returns 結果
 */
export async function graphql(query, input = null) {
    try {
        if (!!input)
            return await API.graphql({ query, variables: { input } });
        else
            return await API.graphql({ query });
    } catch (err) {
        console.error('error:', err);
    }

}