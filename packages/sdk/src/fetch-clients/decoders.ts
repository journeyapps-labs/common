import * as micro_errors from '@journeyapps-labs/micro-errors';
import * as defs from '../definitions';
import * as errors from './errors';
import * as codecs from './codecs';

export const decodeResponse: defs.ResponseDecoder = async (response, meta) => {
  const content_type = response.headers.get(defs.Header.ContentType) || defs.ContentType.JSON;

  // extract the first part of Content-Type - i.e "[application/json]; charset-utf8"
  const codec = codecs.DEFAULT_CODECS[content_type.replace(/(?!<.*);.*/, '')];
  if (!codec) {
    const raw = await response.text();
    throw new errors.UnparsableServiceResponse(`${meta.method} ${meta.url}`, response.status, raw);
  }

  return codec.decode(await response.arrayBuffer());
};

export const decodeServiceResponse: defs.ResponseDecoder = async (response, meta) => {
  const { data, error } = await decodeResponse(response, meta);

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
