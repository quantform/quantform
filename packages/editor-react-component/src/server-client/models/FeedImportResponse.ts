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
 * @interface FeedImportResponse
 */
export interface FeedImportResponse {
    /**
     * 
     * @type {boolean}
     * @memberof FeedImportResponse
     */
    queued: boolean;
    /**
     * 
     * @type {string}
     * @memberof FeedImportResponse
     */
    context: string;
}

export function FeedImportResponseFromJSON(json: any): FeedImportResponse {
    return FeedImportResponseFromJSONTyped(json, false);
}

export function FeedImportResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): FeedImportResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'queued': json['queued'],
        'context': json['context'],
    };
}

export function FeedImportResponseToJSON(value?: FeedImportResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'queued': value.queued,
        'context': value.context,
    };
}


