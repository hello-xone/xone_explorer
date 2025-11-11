import { parse, print } from 'graphql';
import React from 'react';

import config from 'configs/app';
import buildUrl from 'lib/api/buildUrl';

interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<GraphQLError>;
}

interface UseEasGraphQLOptions {
  query: string;
  variables?: Record<string, unknown>;
  enabled?: boolean;
  onCompleted?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseEasGraphQLResult<T = unknown> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export default function useEasGraphQL<T = unknown>({
  query,
  variables,
  enabled = true,
  onCompleted,
  onError,
}: UseEasGraphQLOptions): UseEasGraphQLResult<T> {
  const [ data, setData ] = React.useState<T | null>(null);
  const [ error, setError ] = React.useState<Error | null>(null);
  const [ loading, setLoading ] = React.useState<boolean>(false);

  // 使用 ref 存储回调函数，避免依赖变化
  const onCompletedRef = React.useRef(onCompleted);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onCompletedRef.current = onCompleted;
    onErrorRef.current = onError;
  });

  // 使用 graphql 库解析并格式化查询
  const parsedQuery = React.useMemo(() => {
    try {
      const documentNode = parse(query);
      return print(documentNode);
    } catch(err) {
      return query;
    }
  }, [ query ]);

  // 使用 JSON.stringify 来稳定 variables 的引用
  const variablesString = React.useMemo(() => {
    return variables ? JSON.stringify(variables) : '';
  }, [ variables ]);

  const fetchData = React.useCallback(async() => {
    if (!config.apis.eas?.endpoint) {
      const err = new Error('EAS API endpoint not configured');
      setError(err);
      onErrorRef.current?.(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const graphqlUrl = buildUrl('eas:graphql');

      const parsedVariables = variablesString ? JSON.parse(variablesString) : undefined;

      const requestBody = {
        query: parsedQuery,
        // @ts-ignore
        ...(parsedVariables && { variables: parsedVariables }),
      };

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${ response.status }: ${ errorText }`);
      }

      const result = await response.json() as GraphQLResponse<T>;

      if (result.errors && result.errors.length > 0) {
        const graphqlError = result.errors[0];

        const errorMessage = [
          graphqlError.message,
          graphqlError.locations && `at line ${ graphqlError.locations[0].line }:${ graphqlError.locations[0].column }`,
          graphqlError.path && `in path: ${ graphqlError.path.join('.') }`,
        ].filter(Boolean).join(' ');

        throw new Error(errorMessage);
      }

      if (result.data) {
        setData(result.data);
        onCompletedRef.current?.(result.data);
      } else {
        setData(null);
      }
    } catch(err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onErrorRef.current?.(error);
    } finally {
      setLoading(false);
    }
  }, [ parsedQuery, variablesString ]);

  React.useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [ enabled, fetchData ]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
}
