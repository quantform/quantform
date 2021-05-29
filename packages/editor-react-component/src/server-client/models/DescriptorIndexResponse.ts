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
 * @interface DescriptorIndexResponse
 */
export interface DescriptorIndexResponse {
    /**
     * 
     * @type {Array<any>}
     * @memberof DescriptorIndexResponse
     */
    descriptors: Array<any>;
}

export function DescriptorIndexResponseFromJSON(json: any): DescriptorIndexResponse {
    return DescriptorIndexResponseFromJSONTyped(json, false);
}

export function DescriptorIndexResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): DescriptorIndexResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'descriptors': json['descriptors'],
    };
}

export function DescriptorIndexResponseToJSON(value?: DescriptorIndexResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'descriptors': value.descriptors,
    };
}


