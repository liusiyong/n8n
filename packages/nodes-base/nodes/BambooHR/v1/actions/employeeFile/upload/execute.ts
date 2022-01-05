import {
	BINARY_ENCODING,
	IExecuteFunctions,
} from 'n8n-core';

import {
	IBinaryData,
	IBinaryKeyData,
	IDataObject, NodeOperationError,
} from 'n8n-workflow';

import {
	apiRequest,
} from '../../../transport';

export async function upload(this: IExecuteFunctions, index: number) {
	let body: IDataObject = {};
	const requestMethod = 'POST';

	const items = this.getInputData();

	const category = this.getNodeParameter('categoryId', index) as string;
	const share = this.getNodeParameter('share', index) as boolean;
	share ? body.share = 'yes' : body.share = 'no';

	if (items[index].binary === undefined) {
		throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
	}

	const propertyNameUpload = this.getNodeParameter('binaryPropertyName', index) as string;

	if (items[index]!.binary![propertyNameUpload] === undefined) {
		throw new NodeOperationError(this.getNode(), `No binary data property "${propertyNameUpload}" does not exists on item!`);
	}

	const item = items[index].binary as IBinaryKeyData;

	const binaryData = item[propertyNameUpload] as IBinaryData;

	const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(index, propertyNameUpload);

	const id: string = this.getNodeParameter('id', index) as string;

	body = {
		json: false,
		formData: {
			file: {
				value: binaryDataBuffer,
				options: {
					filename: binaryData.fileName,
					contentType: binaryData.mimeType,
				},
			},
			fileName: binaryData.fileName,
			share: share.toString(),
			category,
		},
	};

	//endpoint
	const endpoint = `employees/${id}/files`;
	const { headers } = await apiRequest.call(this, requestMethod, endpoint, {}, {}, body);
	return this.helpers.returnJsonArray({ fileId: headers.location.split('/').pop(), employeeId: id });
}