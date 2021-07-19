/* tslint:disable */
/* eslint-disable */
/**
 * 
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface SessionBacktestResponse
 */
export interface SessionBacktestResponse {
    /**
     * 
     * @type {string}
     * @memberof SessionBacktestResponse
     */
    context: string;
    /**
     * 
     * @type {boolean}
     * @memberof SessionBacktestResponse
     */
    queued: boolean;
}

export function SessionBacktestResponseFromJSON(json: any): SessionBacktestResponse {
    return SessionBacktestResponseFromJSONTyped(json, false);
}

export function SessionBacktestResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): SessionBacktestResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'context': json['context'],
        'queued': json['queued'],
    };
}

export function SessionBacktestResponseToJSON(value?: SessionBacktestResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'context': value.context,
        'queued': value.queued,
    };
}


