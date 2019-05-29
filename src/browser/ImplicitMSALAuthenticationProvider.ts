/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */

/**
 * @module ImplicitMSALAuthenticationProvider
 */

import { AuthenticationProvider } from "../IAuthenticationProvider";
import { AuthenticationProviderOptions } from "../IAuthenticationProviderOptions";
import { MSALAuthenticationProviderOptions } from "../MSALAuthenticationProviderOptions";

/**
 * @constant
 * A declaration of a Msal library
 */
declare const Msal: any;

/**
 * @class
 * Class representing ImplicitMSALAuthenticationProvider
 * @extends AuthenticationProvider
 */
export class ImplicitMSALAuthenticationProvider implements AuthenticationProvider {
	/**
	 * @private
	 * A member holding an instance of MSALAuthenticationProviderOptions
	 */
	private options: MSALAuthenticationProviderOptions;

	/**
	 * @private
	 * A member holding an instance of MSAL
	 */
	private msalInstance: any;

	/**
	 * @public
	 * @constructor
	 * Creates an instance of ImplicitMSALAuthenticationProvider
	 * @param {any} msalInstance - An instance of MSAL UserAgentApplication
	 * @param {MSALAuthenticationProviderOptions} options - An instance of MSALAuthenticationProviderOptions
	 * @returns An instance of ImplicitMSALAuthenticationProvider
	 */
	public constructor(msalInstance: any, options: MSALAuthenticationProviderOptions) {
		this.options = options;
		this.msalInstance = msalInstance;
	}

	/**
	 * @public
	 * @async
	 * To get the access token
	 * @param {AuthenticationProviderOptions} authenticationProviderOptions - The authentication provider options object
	 * @returns The promise that resolves to an access token
	 */
	public async getAccessToken(authenticationProviderOptions?: AuthenticationProviderOptions): Promise<string> {
		const options: MSALAuthenticationProviderOptions = authenticationProviderOptions as MSALAuthenticationProviderOptions;
		let scopes: string[];
		if (typeof options !== "undefined") {
			scopes = options.scopes;
		}
		if (typeof scopes === "undefined" || scopes.length === 0) {
			scopes = this.options.scopes;
		}
		if (scopes.length === 0) {
			const error = new Error();
			error.name = "EmptyScopes";
			error.message = "Scopes cannot be empty, Please provide a scopes";
			throw error;
		}

		if (this.msalInstance.getAccount()) {
			const tokenRequest = {
				scopes,
			};
			try {
				const authResponse = await this.msalInstance.acquireTokenSilent(tokenRequest);
				return authResponse.accessToken;
			} catch (error) {
				if (error.name === "InteractionRequiredAuthError") {
					try {
						const authResponse = await this.msalInstance.acquireTokenPopup(tokenRequest);
						return authResponse.accessToken;
					} catch (error) {
						throw error;
					}
				}
			}
		} else {
			try {
				const tokenRequest = {
					scopes,
				};
				await this.msalInstance.loginPopup(tokenRequest);
				const authResponse = await this.msalInstance.acquireTokenSilent(tokenRequest);
				return authResponse.accessToken;
			} catch (error) {
				throw error;
			}
		}
	}
}