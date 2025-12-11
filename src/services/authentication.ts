import { Credential } from '../models/credential';  
import { ApiKeyRepository } from '../repositories/apiKeyRepository';
import { AuthenticationResponse } from '../models/authentication-response';

async function authenticate(credential: Credential): Promise<AuthenticationResponse | undefined> {
  if (credential.type === 'api-key') {
    const [name, secret] = Buffer.from(credential.token, 'base64').toString('utf-8').split(':');
    const apiKey = await ApiKeyRepository.findByName(name);

    return apiKey?.is_enabled && apiKey?.secret === secret
      ? { user_id: apiKey.user_id, api_key_id: apiKey.id } as AuthenticationResponse  
      : undefined;
  }
  return undefined;
}

export default { authenticate };