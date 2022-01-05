import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../../../transport';

import * as moment from 'moment';

export async function create(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	let body: IDataObject = {};
	const requestMethod = 'POST';

	//meta data
	const id = this.getNodeParameter('id', index) as string;
	const tableName = this.getNodeParameter('table', index) as string;

	//endpoint
	const endpoint = `employees/${id}/tables/${tableName}`;

	//body parameters
	body = this.getNodeParameter('additionalFields', index) as IDataObject;
	body.location = this.getNodeParameter('location', index) as string;
	const date = body.date as string;
	body.date = moment(date).format('YYYY-MM-DD');

	//response
	const responseData = await apiRequest.call(this, requestMethod, endpoint, body);

	//return
	return this.helpers.returnJsonArray({ statusCode: responseData.statusCode, statusMessage: responseData.statusMessage });
}