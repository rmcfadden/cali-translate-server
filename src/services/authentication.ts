import { Credential } from '../models/credential';  
import { ApiKeyRepository } from '../repositories/apiKeyRepository';

const authenticate = async (credential: Credential) : Promise<number | undefined> => {
  // Only api-key supported for now.  TODOL add bearer token support
  if (credential.type === 'api-key') {
    const [name, secret] = Buffer.from(credential.token, 'base64').toString('utf-8').split(':');
    const apiKey = await ApiKeyRepository.findByName(name);
    return (apiKey?.is_enabled || undefined) && (apiKey?.secret === secret || undefined) && apiKey?.user_id;
  }
  return undefined;
}

export default { authenticate };