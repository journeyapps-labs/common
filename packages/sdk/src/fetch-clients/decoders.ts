import * as micro_errors from '@journeyapps-labs/micro-errors';
import * as defs from '../definitions';
import * as codecs from './codecs';
import * as errors from './errors';

const getResponseCodec = (content_type: string, configured_codecs?: defs.Codecs) => {
  // extract the first part of Content-Type - i.e "[application/json]; charset-utf8"
  const normalized_content_type = content_type.replace(/(?!<.*);.*/, '');
  return configured_codecs?.[normalized_content_type] || codecs.DEFAULT_CODECS[normalized_content_type];
};

export const decodeResponse = async (
  response: defs.TResponse,
  meta: defs.RequestMetadata,
  configured_codecs?: defs.Codecs
) => {
  const content_type = response.headers.get(defs.Header.ContentType) || defs.ContentType.JSON;

  const codec = getResponseCodec(content_type, configured_codecs);
  if (!codec) {
    const raw = await response.text();
    throw new errors.UnparsableServiceResponse(`${meta.method} ${meta.url}`, response.status, raw);
  }

  return codec.decode(await response.arrayBuffer());
};

export const decodeServiceResponse = async (
  response: defs.TResponse,
  meta: defs.RequestMetadata,
  configured_codecs?: defs.Codecs
) => {
  const { data, error } = await decodeResponse(response, meta, configured_codecs);

  if (data) {
    return data;
  }

  if (error) {
    throw new micro_errors.JourneyError(error);
  }

  /**
   * Not a JSON response, meaning it's not a standard response or error produced by journey-micro.
   * This typically means something like a 404 or a 503 (gateway error).
   * The body is usually meaningless in these cases.
   * 3xx responses are also unexpected here.
   */
  if (response.status >= 300) {
    throw new errors.UnparsableServiceResponse(`${meta.method} ${meta.url}`, response.status);
  }

  return null;
};
