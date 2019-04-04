class JavaScriptFetchGenerator {
	static get identifier() {
		return 'com.secretspaceagency.JavaScriptFetchGenerator';
	}

	static get title() {
		return 'JavaScript (Fetch)';
	}

	static get fileExtension() {
		return 'js';
	}

	static get languageHighlighter() {
		return 'javascript';
	}

	getResponseTypeFromContentType(contentType = '') {
		if (contentType.indexOf('json') !== -1) {
			return 'json';
		}

		return 'text';
	}

	generate(context, requests) {
		if (!Array.isArray(requests)) {
			requests = [context.getCurrentRequest()];
		}

		let code = '';

		for (const request of requests) {
			const latestExchange = request.getLastExchange();
			const contentType = latestExchange ? latestExchange.getResponseHeaderByName('Content-Type') : '';
			const responseFormat = this.getResponseTypeFromContentType(contentType);

			const fetchOptions = [];

			if (request.method !== 'GET') {
				fetchOptions.push(`method: '${request.method}'`);
			}

			if (Object.keys(request.headers).length > 0) {
				const headerString = JSON.stringify(request.headers, null, '\t\t\t').replace(/}$/, '\t\t}');
				fetchOptions.push(`headers: ${headerString}`);
			}

			if (request.body) {
				if (request.method === 'GET' || request.method === 'HEAD') {
					fetchOptions.push('// fetch does not support a body with GET or HEAD requests');
				}
				else {
					fetchOptions.push(`body: \`${request.body}\``);
				}
			}

			if (!request.followRedirects) {
				fetchOptions.push(`redirect: 'error'`);
			}

			const optionsString = fetchOptions.length === 0 ? '' : `, {
		${fetchOptions.join(',\n\t\t')}
	}`;

			code += `// ${request.name}
async function makeRequest() {
	const response = await fetch('${request.url}'${optionsString});
	return response.${responseFormat}();
}`;
		}

		return code;
	}
}

registerCodeGenerator(JavaScriptFetchGenerator);
