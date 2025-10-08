export type PaginationParams = {
  cursor?: string;
  limit?: number;
};

export type PaginationResponse = {
  total: number;
  count: number;
  more: boolean;
  cursor?: string;
};

export const paginate = <I extends PaginationParams, O extends PaginationResponse>(
  endpoint: (params: I) => Promise<O>
) => {
  return async function* (params: I) {
    let more = true;
    let cursor = params.cursor;
    while (more) {
      const res = await endpoint({
        ...params,
        cursor: cursor,
        limit: params.limit || 50
      });

      yield res;
      more = res.more;
      cursor = res.cursor;
    }
  };
};

export const createPaginatedEndpoint = <I extends PaginationParams, O extends PaginationResponse>(
  endpoint: (params: I) => Promise<O>
) => {
  return Object.assign(endpoint, {
    paginate: paginate(endpoint)
  });
};
