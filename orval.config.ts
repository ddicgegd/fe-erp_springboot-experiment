import { defineConfig } from 'orval';

export default defineConfig({
    erpApi: {
        input: {
            target: './api-docs.json',
        },
        output: {
            target: './src/api/generated',
            client: 'react-query',
            mode: 'tags-split',
            override: {
                mutator: {
                    path: './src/api/axios-instance.ts',
                    name: 'customInstance',
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                },
            },
        },
    },
});
